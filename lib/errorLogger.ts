// Error Logger - Shared utility for centralized error tracking
// Separated from route handler to comply with Next.js export rules

import { logger } from '@/lib/logger';

export interface ErrorEntry {
  id: string;
  type: string;
  message: string;
  stack?: string;
  route?: string;
  timestamp: string;
  userAgent?: string;
  language?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

// In-memory error store (last 200 errors)
export const errorStore: ErrorEntry[] = [];
const MAX_ERRORS = 200;
let errorCounter = 0;

/**
 * Log an error from any API route.
 * Stores in the in-memory ring buffer and emits structured log output.
 * 
 * @param type - Error category (e.g., 'Chat', 'Emergency', 'VisionAnalysis')
 * @param message - Human-readable error description
 * @param options - Additional context: stack trace, route, severity, language
 * @returns Unique error ID for tracking/reference
 */
export function logError(
  type: string,
  message: string,
  options?: {
    stack?: string;
    route?: string;
    severity?: ErrorEntry['severity'];
    language?: string;
  }
): string {
  errorCounter++;

  const entry: ErrorEntry = {
    id: `ERR-${Date.now()}-${errorCounter}`,
    type,
    message,
    stack: options?.stack,
    route: options?.route,
    timestamp: new Date().toISOString(),
    severity: options?.severity || 'medium',
    language: options?.language,
    resolved: false,
  };

  errorStore.push(entry);

  // Keep only last MAX_ERRORS (FIFO ring buffer)
  if (errorStore.length > MAX_ERRORS) {
    errorStore.splice(0, errorStore.length - MAX_ERRORS);
  }

  // Emit structured log based on severity
  const meta = { errorId: entry.id, type, route: options?.route };
  if (entry.severity === 'critical') {
    logger.error(`CRITICAL: ${message}`, meta);
  } else if (entry.severity === 'high') {
    logger.error(message, meta);
  } else {
    logger.warn(message, meta);
  }

  return entry.id;
}
