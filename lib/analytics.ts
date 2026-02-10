// Analytics Tracker - Shared utility for tracking events across API routes
// Separated from route handler to comply with Next.js export rules

interface AnalyticsData {
  totalRequests: number;
  symptomAnalyses: number;
  chatMessages: number;
  emergencyAlerts: number;
  clinicalAnalyses: number;
  iotReadings: number;
  languages: Record<string, number>;
  urgencyBreakdown: Record<string, number>;
  aiProviderUsage: Record<string, number>;
  symptomFrequency: Record<string, number>;
  hourlyTraffic: number[];
  responseTimesMs: number[];
  errors: number;
  startTime: number;
}

// Singleton analytics store
export const analytics: AnalyticsData = {
  totalRequests: 0,
  symptomAnalyses: 0,
  chatMessages: 0,
  emergencyAlerts: 0,
  clinicalAnalyses: 0,
  iotReadings: 0,
  languages: {},
  urgencyBreakdown: { 'self-care': 0, 'doctor-visit': 0, 'emergency': 0 },
  aiProviderUsage: { gemini: 0, groq: 0, local: 0 },
  symptomFrequency: {},
  hourlyTraffic: new Array(24).fill(0),
  responseTimesMs: [],
  errors: 0,
  startTime: Date.now(),
};

/**
 * Track an analytics event (called from API routes)
 */
export function trackEvent(event: string, data?: any) {
  analytics.totalRequests++;
  analytics.hourlyTraffic[new Date().getHours()]++;

  switch (event) {
    case 'symptom-analysis':
      analytics.symptomAnalyses++;
      if (data?.urgency) {
        analytics.urgencyBreakdown[data.urgency] =
          (analytics.urgencyBreakdown[data.urgency] || 0) + 1;
      }
      if (data?.symptoms) {
        for (const symptom of data.symptoms) {
          const normalized = symptom.toLowerCase().trim();
          analytics.symptomFrequency[normalized] =
            (analytics.symptomFrequency[normalized] || 0) + 1;
        }
      }
      if (data?.provider) {
        analytics.aiProviderUsage[data.provider] =
          (analytics.aiProviderUsage[data.provider] || 0) + 1;
      }
      break;

    case 'chat':
      analytics.chatMessages++;
      break;

    case 'emergency':
      analytics.emergencyAlerts++;
      break;

    case 'clinical-analysis':
      analytics.clinicalAnalyses++;
      break;

    case 'iot-reading':
      analytics.iotReadings++;
      break;

    case 'error':
      analytics.errors++;
      break;
  }

  if (data?.language) {
    analytics.languages[data.language] =
      (analytics.languages[data.language] || 0) + 1;
  }

  if (data?.responseTimeMs) {
    analytics.responseTimesMs.push(data.responseTimeMs);
    // Keep only last 1000 response times
    if (analytics.responseTimesMs.length > 1000) {
      analytics.responseTimesMs = analytics.responseTimesMs.slice(-500);
    }
  }
}
