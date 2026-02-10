// Authentication - Phone Number + OTP Login (Mock for Hackathon)
// Supports: patient, asha, doctor roles

import { NextRequest, NextResponse } from 'next/server';
import { generateToken, DEMO_USERS } from '@/lib/auth';
import { checkRateLimit, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rateLimit';

// POST - Login (Demo mode: accepts any phone, Production: OTP verification)
export async function POST(request: NextRequest) {
  try {
    // Rate limit login attempts (5 per 5 minutes)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const limit = checkRateLimit(`auth:${ip}`, RATE_LIMITS.auth.maxRequests, RATE_LIMITS.auth.windowMs);

    if (!limit.allowed) {
      return NextResponse.json(
        {
          error: 'Too many login attempts. Please try again later.',
          retryAfter: limit.retryAfter,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(limit),
        }
      );
    }

    const body = await request.json();
    const { phoneNumber, role = 'patient', name } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Demo mode - instant login
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      // Check if this matches a demo persona
      const demoUser = Object.values(DEMO_USERS).find(
        (u) => u.phoneNumber === phoneNumber || u.role === role
      );

      const userId = demoUser?.userId || `user-${phoneNumber.replace(/\D/g, '')}`;
      const userName = demoUser?.name || name || 'Demo User';
      const userRole = demoUser?.role || role;

      const token = generateToken(userId, userRole, userName);

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: userId,
          name: userName,
          phoneNumber,
          role: userRole,
          demoMode: true,
        },
        message: `Welcome, ${userName}! (Demo Mode)`,
      });
    }

    // Production mode - would integrate with OTP service
    // 1. Send OTP via Twilio/MSG91
    // 2. Verify OTP in a separate endpoint
    // 3. Generate token on success

    const token = generateToken(
      `user-${phoneNumber.replace(/\D/g, '')}`,
      role as any,
      name
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: `user-${phoneNumber.replace(/\D/g, '')}`,
        name: name || 'User',
        phoneNumber,
        role,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
