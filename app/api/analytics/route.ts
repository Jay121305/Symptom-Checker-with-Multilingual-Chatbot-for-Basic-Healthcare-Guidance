// Real-time Analytics Engine
// Tracks usage patterns, AI performance, and population health insights

import { NextRequest, NextResponse } from 'next/server';
import { analytics, trackEvent } from '@/lib/analytics';
import { symptomCache } from '@/lib/cache';
import { getRateLimitStats } from '@/lib/rateLimit';

// POST - Record an analytics event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    if (!event) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    trackEvent(event, data);

    return NextResponse.json({ success: true, totalRequests: analytics.totalRequests });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record event' },
      { status: 500 }
    );
  }
}

// GET - Retrieve analytics dashboard data
export async function GET() {
  const uptimeSeconds = (Date.now() - analytics.startTime) / 1000;

  // Calculate average response time
  const avgResponseTime =
    analytics.responseTimesMs.length > 0
      ? analytics.responseTimesMs.reduce((a, b) => a + b, 0) / analytics.responseTimesMs.length
      : 0;

  // Get top symptoms
  const topSymptoms = Object.entries(analytics.symptomFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([symptom, count]) => ({ symptom, count }));

  // Get top languages
  const topLanguages = Object.entries(analytics.languages)
    .sort(([, a], [, b]) => b - a)
    .map(([language, count]) => ({ language, count }));

  // Calculate requests per minute
  const requestsPerMinute = uptimeSeconds > 0
    ? ((analytics.totalRequests / uptimeSeconds) * 60).toFixed(2)
    : '0';

  const dashboard = {
    summary: {
      totalRequests: analytics.totalRequests,
      uptimeHours: (uptimeSeconds / 3600).toFixed(1),
      requestsPerMinute,
      errorRate: analytics.totalRequests > 0
        ? `${((analytics.errors / analytics.totalRequests) * 100).toFixed(2)}%`
        : '0%',
      avgResponseTimeMs: Math.round(avgResponseTime),
    },

    breakdown: {
      symptomAnalyses: analytics.symptomAnalyses,
      chatMessages: analytics.chatMessages,
      emergencyAlerts: analytics.emergencyAlerts,
      clinicalAnalyses: analytics.clinicalAnalyses,
      iotReadings: analytics.iotReadings,
      errors: analytics.errors,
    },

    urgencyDistribution: analytics.urgencyBreakdown,
    aiProviderUsage: analytics.aiProviderUsage,
    topSymptoms,
    topLanguages,
    hourlyTraffic: analytics.hourlyTraffic,

    // Include cache and rate limit stats
    cache: symptomCache.getStats(),
    rateLimiting: getRateLimitStats(),
  };

  return NextResponse.json(dashboard);
}
