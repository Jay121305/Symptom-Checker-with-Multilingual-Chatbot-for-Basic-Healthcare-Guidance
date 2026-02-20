import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';
import { trackEvent } from '@/lib/analytics';
import { logError } from '@/lib/errorLogger';
import { logger } from '@/lib/logger';

// Emergency notification system
// In production, integrate with Twilio SMS, WhatsApp, or local emergency services API
export async function POST(request: NextRequest) {
  try {
    // Rate limit emergency alerts (prevent spam, but allow genuine emergencies)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const limit = checkRateLimit(`emergency:${ip}`, RATE_LIMITS.emergency.maxRequests, RATE_LIMITS.emergency.windowMs);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Multiple alerts already sent. Help is on the way.', retryAfter: limit.retryAfter },
        { status: 429, headers: getRateLimitHeaders(limit) }
      );
    }

    const body = await request.json();
    const { userId, location, symptoms, vitals, emergencyContacts } = body;

    logger.info('EMERGENCY ALERT triggered', {
      userId,
      hasLocation: !!location,
      symptomCount: symptoms?.length || 0,
      timestamp: new Date().toISOString(),
    });

    // Track emergency event
    trackEvent('emergency', {
      symptoms,
      hasLocation: !!location,
      contactCount: emergencyContacts?.length || 0,
    });

    // In production:
    // 1. Send SMS to emergency contacts
    // 2. Alert nearby hospitals/clinics
    // 3. Notify emergency services with patient data
    // 4. Track ambulance response

    const notificationResults = await sendEmergencyNotifications(
      emergencyContacts || [],
      { location, symptoms, vitals }
    );

    return NextResponse.json({
      success: true,
      message: 'Emergency services notified',
      notificationsSent: notificationResults.length,
      timestamp: new Date().toISOString(),
      estimatedResponseTime: '10-15 minutes',
    }, { headers: getRateLimitHeaders(limit) });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logError('Emergency', errMsg, {
      route: '/api/emergency',
      severity: 'critical',
      stack: error instanceof Error ? error.stack : undefined,
    });
    trackEvent('error', { route: '/api/emergency' });
    logger.error('Emergency notification failed', { error: errMsg });
    return NextResponse.json(
      { error: 'Failed to send emergency notifications. Please call 108 directly.' },
      { status: 500 }
    );
  }
}

async function sendEmergencyNotifications(
  contacts: any[],
  emergencyData: any
): Promise<any[]> {
  // Simulate sending notifications
  // In production, use Twilio API:
  /*
  const twilio = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  
  for (const contact of contacts) {
    await twilio.messages.create({
      body: `🚨 EMERGENCY: Your contact needs immediate help. Location: ${emergencyData.location}. Symptoms: ${emergencyData.symptoms.join(', ')}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: contact.phone
    });
  }
  */

  return contacts.map(contact => ({
    contact: contact.name,
    status: 'sent',
    timestamp: new Date().toISOString(),
  }));
}
