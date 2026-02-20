/**
 * Structured Logger for DeepBlue Health
 * 
 * Production-grade logging with severity levels, structured metadata,
 * and environment-aware output. Replaces raw console.log calls throughout
 * the codebase with consistent, filterable log entries.
 * 
 * @module lib/logger
 * @example
 * ```typescript
 * import { logger } from '@/lib/logger';
 * logger.info('Patient vitals received', { deviceId: 'dev-001', heartRate: 72 });
 * logger.warn('AI fallback triggered', { from: 'gemini', to: 'groq' });
 * logger.error('Database connection failed', { uri: '***', retryIn: 5000 });
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  meta?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const MIN_LEVEL: LogLevel = IS_PRODUCTION ? 'info' : 'debug';

/**
 * Format a log entry for structured output
 */
function formatEntry(entry: LogEntry): string {
  const metaStr = entry.meta ? ` ${JSON.stringify(entry.meta)}` : '';
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.service}] ${entry.message}${metaStr}`;
}

/**
 * Determine if a log level should be emitted based on the minimum level
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL];
}

/**
 * Sanitize metadata to prevent sensitive data leakage in logs.
 * Redacts common sensitive fields like API keys, tokens, passwords.
 */
function sanitizeMeta(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;

  const sensitiveKeys = /api.?key|token|secret|password|authorization|cookie/i;
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(meta)) {
    if (sensitiveKeys.test(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 500) {
      sanitized[key] = value.substring(0, 100) + '...[truncated]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function createLogEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: 'deepblue-health',
    meta: sanitizeMeta(meta),
  };
}

export const logger = {
  /**
   * Debug-level log — only emitted in development.
   * Use for verbose diagnostic information.
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    if (!shouldLog('debug')) return;
    const entry = createLogEntry('debug', message, meta);
    console.debug(formatEntry(entry));
  },

  /**
   * Info-level log — general operational messages.
   * Use for successful operations, state changes, and milestones.
   */
  info(message: string, meta?: Record<string, unknown>): void {
    if (!shouldLog('info')) return;
    const entry = createLogEntry('info', message, meta);
    console.info(formatEntry(entry));
  },

  /**
   * Warn-level log — recoverable issues or degraded operation.
   * Use for fallbacks, retries, and non-critical failures.
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    if (!shouldLog('warn')) return;
    const entry = createLogEntry('warn', message, meta);
    console.warn(formatEntry(entry));
  },

  /**
   * Error-level log — failures requiring attention.
   * Use for unrecoverable errors, exceptions, and critical failures.
   */
  error(message: string, meta?: Record<string, unknown>): void {
    if (!shouldLog('error')) return;
    const entry = createLogEntry('error', message, meta);
    console.error(formatEntry(entry));
  },
};
