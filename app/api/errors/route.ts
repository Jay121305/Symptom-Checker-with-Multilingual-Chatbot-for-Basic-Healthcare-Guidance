// Error Tracking & Logging Endpoint
// Centralized error collection for debugging and monitoring

import { NextRequest, NextResponse } from 'next/server';
import { logError, errorStore } from '@/lib/errorLogger';

// POST - Log a new error (from frontend or API routes)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, message, stack, route, severity, language } = body;

    if (!type || !message) {
      return NextResponse.json(
        { error: 'Error type and message are required' },
        { status: 400 }
      );
    }

    const errorId = logError(type, message, {
      stack,
      route,
      severity,
      language,
    });

    return NextResponse.json({
      logged: true,
      errorId,
      totalErrors: errorStore.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to log error' },
      { status: 500 }
    );
  }
}

// GET - Retrieve error summary and recent errors
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get('severity');
  const limit = parseInt(searchParams.get('limit') || '20');

  let filtered = errorStore;

  if (severity) {
    filtered = errorStore.filter((e) => e.severity === severity);
  }

  const recentErrors = filtered.slice(-limit).reverse();

  // Error summary by type
  const byType: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};
  const byRoute: Record<string, number> = {};

  for (const error of errorStore) {
    byType[error.type] = (byType[error.type] || 0) + 1;
    bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    if (error.route) {
      byRoute[error.route] = (byRoute[error.route] || 0) + 1;
    }
  }

  return NextResponse.json({
    summary: {
      total: errorStore.length,
      unresolved: errorStore.filter((e) => !e.resolved).length,
      byType,
      bySeverity,
      byRoute,
    },
    recentErrors,
  });
}

// DELETE - Clear all errors
export async function DELETE() {
  errorStore.length = 0;
  return NextResponse.json({ cleared: true });
}
