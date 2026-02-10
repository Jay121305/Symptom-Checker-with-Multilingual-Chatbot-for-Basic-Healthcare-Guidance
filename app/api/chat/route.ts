import { NextRequest, NextResponse } from 'next/server';
import { geminiMedicalAI } from '@/lib/geminiAI';
import { groqMedicalAI } from '@/lib/groqAI';
import { medicalAI } from '@/lib/medicalAI';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';
import { trackEvent } from '@/lib/analytics';
import { logError } from '@/lib/errorLogger';

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
    const { message, language = 'en', context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Try Gemini first, then Groq, then local fallback
    let response: string;
    let provider = 'local';
    try {
      response = await geminiMedicalAI.chatWithAssistant(message, language, context);
      provider = 'gemini';
    } catch (geminiError) {
      console.log('Gemini failed, trying Groq:', geminiError);
      try {
        response = await groqMedicalAI.chatWithAssistant(message, language, context);
        provider = 'groq';
      } catch (groqError) {
        console.log('Groq failed, using local fallback:', groqError);
        response = await medicalAI.chatWithAssistant(message, language, context);
        provider = 'local';
      }
    }

    const responseTimeMs = Date.now() - startTime;

    // Track analytics
    trackEvent('chat', {
      language,
      provider,
      responseTimeMs,
    });

    return NextResponse.json(
      { response, provider, responseTimeMs },
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
