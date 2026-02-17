import { NextRequest, NextResponse } from 'next/server';
import { geminiMedicalAI } from '@/lib/geminiAI';
import { groqMedicalAI } from '@/lib/groqAI';
import { medicalAI } from '@/lib/medicalAI';
import { analyzeSentiment } from '@/lib/geminiVision';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';
import { trackEvent } from '@/lib/analytics';
import { logError } from '@/lib/errorLogger';

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
    const { message, language = 'en', context, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Run sentiment analysis on the user's message (non-blocking)
    let sentiment = null;
    try {
      sentiment = await analyzeSentiment(message, conversationHistory || [], language);
    } catch (sentimentErr) {
      console.log('Sentiment analysis skipped:', sentimentErr);
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

    // Try Gemini first, then Groq, then local fallback
    let response: string;
    let provider = 'local';
    try {
      response = await geminiMedicalAI.chatWithAssistant(message, language, enrichedContext);
      provider = 'gemini';
    } catch (geminiError) {
      console.log('Gemini failed, trying Groq:', geminiError);
      try {
        response = await groqMedicalAI.chatWithAssistant(message, language, enrichedContext);
        provider = 'groq';
      } catch (groqError) {
        console.log('Groq failed, using local fallback:', groqError);
        response = await medicalAI.chatWithAssistant(message, language, enrichedContext);
        provider = 'local';
      }
    }

    // Append mental health resources if sentiment indicates crisis/need
    if (sentiment?.mentalHealthResources) {
      const resourceText = MENTAL_HEALTH_RESOURCES[language as keyof typeof MENTAL_HEALTH_RESOURCES] || MENTAL_HEALTH_RESOURCES.en;
      response += resourceText;
    }

    const responseTimeMs = Date.now() - startTime;

    // Track analytics
    trackEvent('chat', {
      language,
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
  } catch (error: any) {
    logError('Chat', error.message || 'Unknown error', {
      route: '/api/chat',
      severity: 'medium',
    });
    trackEvent('error', { route: '/api/chat' });
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
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
  } catch (error) {
    console.error('Clear history error:', error);
    return NextResponse.json(
      { error: 'Failed to clear history' },
      { status: 500 }
    );
  }
}
