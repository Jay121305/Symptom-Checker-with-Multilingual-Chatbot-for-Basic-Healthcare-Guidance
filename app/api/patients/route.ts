// Patient Profile Management API
// CRUD operations for patient records with optional MongoDB persistence

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';
import { connectDB, Patient, getConsultationHistory } from '@/lib/db';
import { logger } from '@/lib/logger';

// In-memory fallback when MongoDB is not available
const inMemoryPatients = new Map<string, any>();

// POST - Create or update a patient profile
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const limit = checkRateLimit(`patients:${ip}`, RATE_LIMITS.patients.maxRequests, RATE_LIMITS.patients.windowMs);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: limit.retryAfter },
        { status: 429, headers: getRateLimitHeaders(limit) }
      );
    }

    const body = await request.json();
    const { phoneNumber, name, age, gender, village, district, state, chronicConditions, allergies, medications } = body;

    if (!phoneNumber || !name) {
      return NextResponse.json(
        { error: 'Phone number and name are required' },
        { status: 400 }
      );
    }

    const patientData = {
      phoneNumber,
      name,
      age,
      gender,
      village,
      district,
      state,
      chronicConditions: chronicConditions || [],
      allergies: allergies || [],
      medications: medications || [],
      updatedAt: new Date(),
    };

    // Try MongoDB first
    const db = await connectDB();

    if (db) {
      const patient = await Patient.findOneAndUpdate(
        { phoneNumber },
        { $set: patientData },
        { upsert: true, new: true, lean: true }
      );

      return NextResponse.json({
        success: true,
        patient,
        storage: 'database',
      });
    }

    // Fallback to in-memory
    inMemoryPatients.set(phoneNumber, {
      ...patientData,
      _id: `mem-${phoneNumber}`,
      createdAt: inMemoryPatients.get(phoneNumber)?.createdAt || new Date(),
    });

    return NextResponse.json({
      success: true,
      patient: inMemoryPatients.get(phoneNumber),
      storage: 'in-memory',
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Patient create failed', { error: errMsg });
    return NextResponse.json(
      { error: 'Failed to save patient. Please try again.' },
      { status: 500 }
    );
  }
}

// GET - Retrieve patient profile and consultation history
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const limit = checkRateLimit(`patients:${ip}`, RATE_LIMITS.patients.maxRequests, RATE_LIMITS.patients.windowMs);

    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: limit.retryAfter },
        { status: 429, headers: getRateLimitHeaders(limit) }
      );
    }

    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number query parameter is required' },
        { status: 400 }
      );
    }

    // Try MongoDB first
    const db = await connectDB();

    if (db) {
      const patient = await Patient.findOne({ phoneNumber }).lean();

      if (!patient) {
        return NextResponse.json(
          { error: 'Patient not found' },
          { status: 404 }
        );
      }

      const history = await getConsultationHistory(phoneNumber, 10);

      return NextResponse.json({
        patient,
        consultationHistory: history,
        storage: 'database',
      });
    }

    // Fallback to in-memory
    const patient = inMemoryPatients.get(phoneNumber);

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      patient,
      consultationHistory: [],
      storage: 'in-memory',
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Patient fetch failed', { error: errMsg });
    return NextResponse.json(
      { error: 'Failed to fetch patient. Please try again.' },
      { status: 500 }
    );
  }
}
