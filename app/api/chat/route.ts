import { NextRequest, NextResponse } from 'next/server';
import { geminiMedicalAI } from '@/lib/geminiAI';
import { groqMedicalAI } from '@/lib/groqAI';
import { medicalAI } from '@/lib/medicalAI';
import { analyzeSentiment } from '@/lib/geminiVision';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';
import { trackEvent } from '@/lib/analytics';
import { logError } from '@/lib/errorLogger';
import { logger } from '@/lib/logger';
import { validateMessage, validateLanguage } from '@/lib/sanitize';

// Mental health helpline numbers for India
const MENTAL_HEALTH_RESOURCES = {
  en: '\n\n---\n💙 **If you need someone to talk to:**\n• iCall: 1800-599-0019 (Free)\n• Vandrevala Foundation: 1860-2662-345\n• NIMHANS: 080-46110007\n• Sneha: 044-24640050',
  hi: '\n\n---\n💙 **अगर आपको किसी से बात करनी हो:**\n• iCall: 1800-599-0019 (मुफ्त)\n• वंद्रेवाला फाउंडेशन: 1860-2662-345\n• NIMHANS: 080-46110007\n• स्नेहा: 044-24640050',
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const limit = checkRateLimit(`chat:${ip}`, RATE_LIMITS.chat.maxRequests, RATE_LIMITS.chat.windowMs);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many messages. Please wait a moment.', retryAfter: limit.retryAfter },
        { status: 429, headers: getRateLimitHeaders(limit) }
      );
    }

    const body = await request.json();
    const { message, language, context, conversationHistory } = body;

    // Input validation & sanitization
    const messageCheck = validateMessage(message);
    if (!messageCheck.valid) {
      return NextResponse.json(
        { error: messageCheck.error },
        { status: 400 }
      );
    }
    const sanitizedMessage = messageCheck.sanitized;
    const safeLanguage = validateLanguage(language);

    // Run sentiment analysis on the user's message (non-blocking)
    let sentiment = null;
    try {
      sentiment = await analyzeSentiment(sanitizedMessage, conversationHistory || [], safeLanguage);
    } catch (sentimentErr) {
      logger.debug('Sentiment analysis skipped', { reason: String(sentimentErr) });
    }

    // Build enriched context with sentiment data
    const enrichedContext = { ...context };
    if (sentiment?.needsSupport) {
      enrichedContext.sentimentContext = {
        mood: sentiment.primaryEmotion,
        intensity: sentiment.anxietyLevel,
        needsSupport: true,
        instruction: 'The user appears to be in emotional distress. Respond with extra empathy, warmth, and care. Validate their feelings before giving medical advice.',
      };
    }

    // Try Gemini first, then Groq, then local fallback (3-tier cascade)
    let response: string;
    let provider = 'local';
    try {
      response = await geminiMedicalAI.chatWithAssistant(sanitizedMessage, safeLanguage, enrichedContext);
      provider = 'gemini';
    } catch (geminiError) {
      logger.warn('Gemini AI failed, falling back to Groq', { error: String(geminiError) });
      try {
        response = await groqMedicalAI.chatWithAssistant(sanitizedMessage, safeLanguage, enrichedContext);
        provider = 'groq';
      } catch (groqError) {
        logger.warn('Groq AI failed, falling back to local engine', { error: String(groqError) });
        response = await medicalAI.chatWithAssistant(sanitizedMessage, safeLanguage, enrichedContext);
        provider = 'local';
      }
    }

    // Append mental health resources if sentiment indicates crisis/need
    if (sentiment?.mentalHealthResources) {
      const resourceText = MENTAL_HEALTH_RESOURCES[safeLanguage as keyof typeof MENTAL_HEALTH_RESOURCES] || MENTAL_HEALTH_RESOURCES.en;
      response += resourceText;
      logger.info('Mental health resources appended to response', { mood: sentiment.primaryEmotion });
    }

    const responseTimeMs = Date.now() - startTime;

    // Track analytics
    trackEvent('chat', {
      language: safeLanguage,
      provider,
      responseTimeMs,
      sentimentMood: sentiment?.primaryEmotion || 'unknown',
      sentimentNeedsSupport: sentiment?.needsSupport || false,
    });

    return NextResponse.json(
      {
        response,
        provider,
        responseTimeMs,
        sentiment: sentiment ? {
          mood: sentiment.primaryEmotion,
          intensity: sentiment.anxietyLevel,
          needsSupport: sentiment.needsSupport,
        } : null,
      },
      { headers: getRateLimitHeaders(limit) }
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logError('Chat', errMsg, {
      route: '/api/chat',
      severity: 'medium',
      stack: error instanceof Error ? error.stack : undefined,
    });
    trackEvent('error', { route: '/api/chat' });
    logger.error('Chat request failed', { error: errMsg, route: '/api/chat' });
    return NextResponse.json(
      { error: 'Failed to process chat message. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    geminiMedicalAI.clearHistory();
    groqMedicalAI.clearHistory();
    medicalAI.clearHistory();
    return NextResponse.json({ message: 'Chat history cleared' });
  } catch (error: unknown) {
    logger.error('Failed to clear chat history', { error: String(error) });
    return NextResponse.json(
      { error: 'Failed to clear history' },
      { status: 500 }
    );
  }
}
