import { NextRequest, NextResponse } from 'next/server';
import { analyzeLabReport, digitizePrescription, identifyMedicine, analyzeSkinCondition, checkDrugInteractions, analyzeSentiment } from '@/lib/geminiVision';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';
import { trackEvent } from '@/lib/analytics';
import { logError } from '@/lib/errorLogger';

export async function POST(request: NextRequest) {
    const startTime = Date.now();

    try {
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const limit = checkRateLimit(`vision:${ip}`, 20, 60000);

        if (!limit.allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait a moment.', retryAfter: limit.retryAfter },
                { status: 429, headers: getRateLimitHeaders(limit) }
            );
        }

        const body = await request.json();
        const { type, image, mimeType, language = 'en', medications, bodyLocation, message, conversationHistory } = body;

        if (!type) {
            return NextResponse.json({ error: 'Analysis type is required' }, { status: 400 });
        }

        let result;

        switch (type) {
            case 'lab-report': {
                if (!image || !mimeType) {
                    return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
                }
                result = await analyzeLabReport(image, mimeType, language);
                break;
            }
            case 'prescription': {
                if (!image || !mimeType) {
                    return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
                }
                result = await digitizePrescription(image, mimeType, language);
                break;
            }
            case 'medicine-id': {
                if (!image || !mimeType) {
                    return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
                }
                result = await identifyMedicine(image, mimeType, language);
                break;
            }
            case 'dermatology': {
                if (!image || !mimeType) {
                    return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
                }
                result = await analyzeSkinCondition(image, mimeType, bodyLocation || '', language);
                break;
            }
            case 'drug-interaction': {
                if (!medications || !Array.isArray(medications) || medications.length < 2) {
                    return NextResponse.json({ error: 'At least 2 medications are required' }, { status: 400 });
                }
                result = await checkDrugInteractions(medications, language);
                break;
            }
            case 'sentiment': {
                if (!message) {
                    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
                }
                result = await analyzeSentiment(message, conversationHistory || [], language);
                break;
            }
            default:
                return NextResponse.json({ error: `Unknown analysis type: ${type}` }, { status: 400 });
        }

        const responseTimeMs = Date.now() - startTime;

        trackEvent('clinical-analysis', {
            type,
            language,
            responseTimeMs,
        });

        return NextResponse.json(
            { ...result, type, responseTimeMs },
            { headers: getRateLimitHeaders(limit) }
        );
    } catch (error: any) {
        logError('VisionAnalysis', error.message || 'Unknown error', {
            route: '/api/vision-analyze',
            severity: 'high',
        });
        console.error('Vision analysis error:', error);
        return NextResponse.json(
            { error: 'Failed to process analysis request' },
            { status: 500 }
        );
    }
}
