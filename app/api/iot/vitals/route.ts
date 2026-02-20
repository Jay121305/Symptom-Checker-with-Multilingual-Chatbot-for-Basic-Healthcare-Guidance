import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Simulated IoT device data generation
// In production, this would connect to real IoT devices via MQTT/WebSocket
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const deviceType = searchParams.get('type');

    // Simulate real-time vitals data
    const vitalsData = generateVitalsData(deviceType || 'smartwatch');

    return NextResponse.json({
      deviceId: deviceId || 'device-001',
      timestamp: new Date().toISOString(),
      data: vitalsData,
      status: 'connected',
    });
  } catch (error: unknown) {
    logger.error('IoT data fetch failed', { error: String(error) });
    return NextResponse.json(
      { error: 'Failed to fetch device data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, vitals } = body;

    // In production, store this data in a time-series database
    logger.debug('Storing vitals data', { deviceId, vitalKeys: vitals ? Object.keys(vitals) : [] });

    return NextResponse.json({
      success: true,
      message: 'Vitals data stored successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    logger.error('Store vitals failed', { error: String(error) });
    return NextResponse.json(
      { error: 'Failed to store vitals data' },
      { status: 500 }
    );
  }
}

function generateVitalsData(deviceType: string) {
  const baseData: any = {
    timestamp: new Date().toISOString(),
  };

  switch (deviceType) {
    case 'smartwatch':
      baseData.heartRate = Math.floor(Math.random() * 40) + 60; // 60-100
      baseData.steps = Math.floor(Math.random() * 10000);
      baseData.calories = Math.floor(Math.random() * 2000);
      break;
    case 'bp-monitor':
      baseData.bloodPressure = {
        systolic: Math.floor(Math.random() * 30) + 110, // 110-140
        diastolic: Math.floor(Math.random() * 20) + 70, // 70-90
      };
      break;
    case 'thermometer':
      baseData.temperature = (Math.random() * 2 + 97).toFixed(1); // 97-99°F
      break;
    case 'oximeter':
      baseData.oxygenSaturation = Math.floor(Math.random() * 5) + 95; // 95-100%
      baseData.heartRate = Math.floor(Math.random() * 40) + 60;
      break;
    case 'glucometer':
      baseData.bloodSugar = Math.floor(Math.random() * 50) + 80; // 80-130 mg/dL
      break;
    default:
      baseData.heartRate = Math.floor(Math.random() * 40) + 60;
  }

  return baseData;
}
