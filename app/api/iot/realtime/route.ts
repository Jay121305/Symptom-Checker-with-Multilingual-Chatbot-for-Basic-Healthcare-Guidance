// Real-time IoT Vitals Streaming via Server-Sent Events (SSE)
// Works with Next.js App Router (no custom WebSocket server needed)
// Simulates live medical device data for hackathon demo

import { NextRequest } from 'next/server';
import { trackEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

// SSE endpoint - streams real-time vitals data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceType = searchParams.get('type') || 'all';
  const interval = parseInt(searchParams.get('interval') || '2000'); // ms between updates

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let counter = 0;
      let isClosed = false;

      const sendVitals = () => {
        if (isClosed) return;

        counter++;
        const vitals = generateRealisticVitals(deviceType, counter);

        // Check for alerts
        const alerts = checkVitalAlerts(vitals);

        const data = {
          id: counter,
          timestamp: new Date().toISOString(),
          deviceType,
          vitals,
          alerts,
          status: 'streaming',
        };

        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
          trackEvent('iot-reading', { deviceType });
        } catch {
          isClosed = true;
          clearInterval(timer);
        }
      };

      // Send initial connection event
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            id: 0,
            type: 'connected',
            message: 'IoT stream connected',
            deviceType,
            interval,
          })}\n\n`
        )
      );

      // Stream vitals at specified interval
      const timer = setInterval(sendVitals, Math.max(interval, 1000));

      // Cleanup on abort
      request.signal.addEventListener('abort', () => {
        isClosed = true;
        clearInterval(timer);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  });
}

/**
 * Generate realistic vital signs with natural variation
 * Simulates real medical device readings (not pure random)
 */
function generateRealisticVitals(deviceType: string, tick: number) {
  // Use sine waves for natural-looking variation
  const timeOffset = tick * 0.1;

  const vitals: Record<string, any> = {};

  if (deviceType === 'all' || deviceType === 'smartwatch') {
    // Heart rate: baseline 72 ± 8 bpm with natural variation
    vitals.heartRate = Math.round(72 + 8 * Math.sin(timeOffset) + (Math.random() * 4 - 2));
    vitals.steps = Math.floor(3000 + tick * 12 + Math.random() * 50);
    vitals.caloriesBurned = Math.floor(vitals.steps * 0.04);
  }

  if (deviceType === 'all' || deviceType === 'bp-monitor') {
    // Blood pressure: slight variation around 124/78
    vitals.bloodPressure = {
      systolic: Math.round(124 + 6 * Math.sin(timeOffset * 0.5) + (Math.random() * 4 - 2)),
      diastolic: Math.round(78 + 4 * Math.sin(timeOffset * 0.3) + (Math.random() * 3 - 1.5)),
    };
  }

  if (deviceType === 'all' || deviceType === 'oximeter') {
    // SpO2: stable around 97%
    vitals.oxygenSaturation = Math.min(100, Math.round(97 + Math.sin(timeOffset * 0.2) + Math.random()));
    if (!vitals.heartRate) {
      vitals.heartRate = Math.round(72 + 8 * Math.sin(timeOffset) + (Math.random() * 4 - 2));
    }
  }

  if (deviceType === 'all' || deviceType === 'thermometer') {
    // Temperature: stable around 98.4°F
    vitals.temperature = parseFloat((98.4 + 0.3 * Math.sin(timeOffset * 0.1) + (Math.random() * 0.2 - 0.1)).toFixed(1));
  }

  if (deviceType === 'all' || deviceType === 'glucometer') {
    // Blood sugar: gradual changes
    vitals.bloodSugar = Math.round(115 + 20 * Math.sin(timeOffset * 0.05) + (Math.random() * 5 - 2.5));
  }

  return vitals;
}

/**
 * Check vitals for alert conditions
 */
function checkVitalAlerts(vitals: Record<string, any>) {
  const alerts: Array<{ type: string; message: string; severity: string }> = [];

  if (vitals.heartRate) {
    if (vitals.heartRate > 100) {
      alerts.push({ type: 'tachycardia', message: 'Heart rate elevated (>100 bpm)', severity: 'medium' });
    }
    if (vitals.heartRate < 55) {
      alerts.push({ type: 'bradycardia', message: 'Heart rate low (<55 bpm)', severity: 'medium' });
    }
  }

  if (vitals.oxygenSaturation && vitals.oxygenSaturation < 94) {
    alerts.push({ type: 'hypoxia', message: `SpO2 low (${vitals.oxygenSaturation}%)`, severity: 'high' });
  }

  if (vitals.bloodPressure) {
    if (vitals.bloodPressure.systolic > 140) {
      alerts.push({ type: 'hypertension', message: 'Blood pressure high', severity: 'medium' });
    }
    if (vitals.bloodPressure.systolic > 180) {
      alerts.push({ type: 'hypertensive-crisis', message: 'Blood pressure critically high!', severity: 'critical' });
    }
  }

  if (vitals.temperature) {
    if (vitals.temperature > 100.4) {
      alerts.push({ type: 'fever', message: `Temperature elevated (${vitals.temperature}°F)`, severity: 'medium' });
    }
    if (vitals.temperature > 103) {
      alerts.push({ type: 'high-fever', message: `High fever (${vitals.temperature}°F) - seek help`, severity: 'high' });
    }
  }

  if (vitals.bloodSugar) {
    if (vitals.bloodSugar > 180) {
      alerts.push({ type: 'hyperglycemia', message: 'Blood sugar high (>180 mg/dL)', severity: 'medium' });
    }
    if (vitals.bloodSugar < 70) {
      alerts.push({ type: 'hypoglycemia', message: 'Blood sugar low (<70 mg/dL) - eat something', severity: 'high' });
    }
  }

  return alerts;
}
