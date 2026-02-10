// Error Logger - Shared utility for centralized error tracking
// Separated from route handler to comply with Next.js export rules

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
 * Log an error from any API route
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

  // Keep only last MAX_ERRORS
  if (errorStore.length > MAX_ERRORS) {
    errorStore.splice(0, errorStore.length - MAX_ERRORS);
  }

  // Log critical errors to console
  if (entry.severity === 'critical') {
    console.error(`🚨 CRITICAL ERROR [${entry.route}]:`, message);
  }

  return entry.id;
}
