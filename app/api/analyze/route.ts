import { NextRequest, NextResponse } from 'next/server';
import { geminiMedicalAI } from '@/lib/geminiAI';
import { groqMedicalAI } from '@/lib/groqAI';
import { medicalAI } from '@/lib/medicalAI';
import { symptomCache } from '@/lib/cache';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';
import { trackEvent } from '@/lib/analytics';
import { logError } from '@/lib/errorLogger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const limit = checkRateLimit(`analyze:${ip}`, RATE_LIMITS.analyze.maxRequests, RATE_LIMITS.analyze.windowMs);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.', retryAfter: limit.retryAfter },
        { status: 429, headers: getRateLimitHeaders(limit) }
      );
    }

    const body = await request.json();
    const { symptoms, vitals, medicalHistory, language = 'en' } = body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Symptoms array is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = symptomCache.constructor.prototype.constructor === undefined
      ? `${[...symptoms].sort().join('|')}_${language}`
      : (() => {
          const sorted = [...symptoms].map((s: string) => s.toLowerCase().trim()).sort().join('|');
          return `${sorted}_${language}`;
        })();

    const cached = symptomCache.get(cacheKey);
    if (cached) {
      trackEvent('symptom-analysis', {
        symptoms,
        urgency: cached.urgencyLevel,
        language,
        provider: 'cache',
        responseTimeMs: Date.now() - startTime,
      });

      return NextResponse.json({
        ...cached,
        cached: true,
        responseTimeMs: Date.now() - startTime,
      }, { headers: getRateLimitHeaders(limit) });
    }

    // Try Gemini first, then Groq, then local fallback
    let analysis;
    let provider = 'local';
    try {
      analysis = await geminiMedicalAI.analyzeSymptoms(symptoms, vitals, medicalHistory, language);
      provider = 'gemini';
    } catch (geminiError) {
      console.log('Gemini failed, trying Groq:', geminiError);
      try {
        analysis = await groqMedicalAI.analyzeSymptoms(symptoms, vitals, medicalHistory, language);
        provider = 'groq';
      } catch (groqError) {
        console.log('Groq failed, using local fallback:', groqError);
        analysis = await medicalAI.analyzeSymptoms(symptoms, vitals, medicalHistory, language);
        provider = 'local';
      }
    }

    // Cache the result (5 minutes TTL)
    symptomCache.set(cacheKey, analysis, 300);

    const responseTimeMs = Date.now() - startTime;

    // Track analytics
    trackEvent('symptom-analysis', {
      symptoms,
      urgency: analysis.urgencyLevel,
      language,
      provider,
      responseTimeMs,
    });

    return NextResponse.json(
      { ...analysis, provider, responseTimeMs, cached: false },
      { headers: getRateLimitHeaders(limit) }
    );
  } catch (error: any) {
    logError('SymptomAnalysis', error.message || 'Unknown error', {
      route: '/api/analyze',
      severity: 'high',
    });
    trackEvent('error', { route: '/api/analyze' });
    console.error('Symptom analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    );
  }
}
