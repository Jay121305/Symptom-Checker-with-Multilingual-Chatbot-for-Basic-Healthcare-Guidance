/**
 * Environment Variable Validation for DeepBlue Health
 * 
 * Validates required and optional environment variables at startup,
 * providing clear error messages for misconfiguration. Prevents the
 * application from running with invalid configuration.
 * 
 * @module lib/env
 */

interface EnvVar {
  key: string;
  required: boolean;
  description: string;
  validator?: (value: string) => boolean;
  sensitive?: boolean;
}

const ENV_SCHEMA: EnvVar[] = [
  // Required for AI functionality
  {
    key: 'GEMINI_API_KEY',
    required: false,
    description: 'Google Gemini API key for primary AI (app works without it via local fallback)',
    validator: (v) => v.length > 10 && v !== 'demo',
    sensitive: true,
  },
  // Authentication
  {
    key: 'JWT_SECRET',
    required: false,
    description: 'Secret key for JWT token signing',
    validator: (v) => v.length >= 16,
    sensitive: true,
  },
  // Optional AI fallbacks
  {
    key: 'GROQ_API_KEY',
    required: false,
    description: 'Groq API key for LLaMA fallback AI',
    sensitive: true,
  },
  {
    key: 'ANTHROPIC_API_KEY',
    required: false,
    description: 'Anthropic API key for Claude fallback',
    sensitive: true,
  },
  // Optional database
  {
    key: 'MONGODB_URI',
    required: false,
    description: 'MongoDB connection URI (app works without it via in-memory store)',
    validator: (v) => v.startsWith('mongodb'),
  },
  // App configuration
  {
    key: 'NEXT_PUBLIC_API_URL',
    required: false,
    description: 'Base URL for API calls',
    validator: (v) => v.startsWith('http'),
  },
  {
    key: 'NEXT_PUBLIC_DEMO_MODE',
    required: false,
    description: 'Enable demo mode for presentations (true/false)',
    validator: (v) => v === 'true' || v === 'false',
  },
];

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  availableServices: {
    geminiAI: boolean;
    groqAI: boolean;
    anthropicAI: boolean;
    mongodb: boolean;
    demoMode: boolean;
  };
}

/**
 * Validate all environment variables against the schema.
 * Returns a detailed report of missing, invalid, or available services.
 * 
 * @returns {EnvValidationResult} Validation results with service availability
 * 
 * @example
 * ```typescript
 * const result = validateEnv();
 * if (!result.valid) {
 *   result.errors.forEach(e => console.error(e));
 *   process.exit(1);
 * }
 * ```
 */
export function validateEnv(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const envVar of ENV_SCHEMA) {
    const value = process.env[envVar.key];

    if (!value || value.trim() === '') {
      if (envVar.required) {
        errors.push(`❌ Missing required env var: ${envVar.key} — ${envVar.description}`);
      } else {
        warnings.push(`⚠️  Optional env var not set: ${envVar.key} — ${envVar.description}`);
      }
      continue;
    }

    if (envVar.validator && !envVar.validator(value)) {
      const msg = `Invalid value for ${envVar.key} — ${envVar.description}`;
      if (envVar.required) {
        errors.push(`❌ ${msg}`);
      } else {
        warnings.push(`⚠️  ${msg}`);
      }
    }
  }

  const availableServices = {
    geminiAI: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'demo'),
    groqAI: !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'demo'),
    anthropicAI: !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'demo'),
    mongodb: !!(process.env.MONGODB_URI && process.env.MONGODB_URI.length > 10),
    demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    availableServices,
  };
}

/**
 * Get a typed, validated environment variable with a fallback.
 * Throws if the variable is required but missing.
 * 
 * @param key - Environment variable key
 * @param fallback - Default value if not set
 * @returns The environment variable value or fallback
 */
export function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value !== undefined && value !== '') return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Missing required environment variable: ${key}`);
}

/**
 * Check if a specific service is configured and available.
 */
export function isServiceAvailable(service: 'gemini' | 'groq' | 'anthropic' | 'mongodb'): boolean {
  switch (service) {
    case 'gemini':
      return !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'demo');
    case 'groq':
      return !!(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'demo');
    case 'anthropic':
      return !!(process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'demo');
    case 'mongodb':
      return !!(process.env.MONGODB_URI && process.env.MONGODB_URI.length > 10);
    default:
      return false;
  }
}
