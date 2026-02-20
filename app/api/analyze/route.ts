import { NextRequest, NextResponse } from 'next/server';
import { geminiMedicalAI } from '@/lib/geminiAI';
import { groqMedicalAI } from '@/lib/groqAI';
import { medicalAI } from '@/lib/medicalAI';
import { symptomCache } from '@/lib/cache';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';
import { trackEvent } from '@/lib/analytics';
import { logError } from '@/lib/errorLogger';
import { logger } from '@/lib/logger';
import { validateSymptoms, validateLanguage } from '@/lib/sanitize';

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
    const { symptoms, vitals, medicalHistory, language } = body;

    // Input validation & sanitization
    const symptomsCheck = validateSymptoms(symptoms);
    if (!symptomsCheck.valid) {
      return NextResponse.json(
        { error: symptomsCheck.error },
        { status: 400 }
      );
    }
    const sanitizedSymptoms = symptomsCheck.sanitized;
    const safeLanguage = validateLanguage(language);

    // Check cache first — deterministic key from sorted, normalized symptoms
    const cacheKey = (() => {
      const sorted = sanitizedSymptoms.map((s: string) => s.toLowerCase().trim()).sort().join('|');
      return `${sorted}_${safeLanguage}`;
    })();

    const cached = symptomCache.get(cacheKey);
    if (cached) {
      trackEvent('symptom-analysis', {
        symptoms: sanitizedSymptoms,
        urgency: cached.urgencyLevel,
        language: safeLanguage,
        provider: 'cache',
        responseTimeMs: Date.now() - startTime,
      });

      return NextResponse.json({
        ...cached,
        cached: true,
        responseTimeMs: Date.now() - startTime,
      }, { headers: getRateLimitHeaders(limit) });
    }

    // 3-tier AI cascade: Gemini → Groq → Local (never fails)
    let analysis;
    let provider = 'local';
    try {
      analysis = await geminiMedicalAI.analyzeSymptoms(sanitizedSymptoms, vitals, medicalHistory, safeLanguage);
      provider = 'gemini';
    } catch (geminiError) {
      logger.warn('Gemini analysis failed, falling back to Groq', { error: String(geminiError) });
      try {
        analysis = await groqMedicalAI.analyzeSymptoms(sanitizedSymptoms, vitals, medicalHistory, safeLanguage);
        provider = 'groq';
      } catch (groqError) {
        logger.warn('Groq analysis failed, falling back to local engine', { error: String(groqError) });
        analysis = await medicalAI.analyzeSymptoms(sanitizedSymptoms, vitals, medicalHistory, safeLanguage);
        provider = 'local';
      }
    }

    // Cache the result (5 minutes TTL)
    symptomCache.set(cacheKey, analysis, 300);

    const responseTimeMs = Date.now() - startTime;

    // Track analytics event
    trackEvent('symptom-analysis', {
      symptoms: sanitizedSymptoms,
      urgency: analysis.urgencyLevel,
      language: safeLanguage,
      provider,
      responseTimeMs,
    });

    return NextResponse.json(
      { ...analysis, provider, responseTimeMs, cached: false },
      { headers: getRateLimitHeaders(limit) }
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logError('SymptomAnalysis', errMsg, {
      route: '/api/analyze',
      severity: 'high',
      stack: error instanceof Error ? error.stack : undefined,
    });
    trackEvent('error', { route: '/api/analyze' });
    logger.error('Symptom analysis request failed', { error: errMsg });
    return NextResponse.json(
      { error: 'Failed to analyze symptoms. Please try again.' },
      { status: 500 }
    );
  }
}
