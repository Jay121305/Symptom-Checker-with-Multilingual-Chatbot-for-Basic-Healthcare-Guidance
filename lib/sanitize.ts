/**
 * Input Sanitization & Validation for DeepBlue Health
 * 
 * Protects API routes from injection attacks, oversized payloads,
 * and malformed input. All user-facing inputs should pass through
 * these validators before processing.
 * 
 * @module lib/sanitize
 */

/** Maximum allowed length for chat messages */
const MAX_MESSAGE_LENGTH = 5000;

/** Maximum allowed length for symptom strings */
const MAX_SYMPTOM_LENGTH = 200;

/** Maximum number of symptoms per request */
const MAX_SYMPTOMS_COUNT = 20;

/** Maximum allowed base64 image size (5MB) */
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

/** Allowed MIME types for image uploads */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/** Allowed analysis types for vision endpoint */
const ALLOWED_VISION_TYPES = ['lab-report', 'prescription', 'medicine-id', 'dermatology', 'drug-interaction', 'sentiment'];

/**
 * Strip HTML/script tags and dangerous characters from user input.
 * Prevents XSS attacks while preserving multilingual characters (Hindi, Bengali, etc.).
 * 
 * @param input - Raw user input string
 * @returns Sanitized string safe for processing
 * 
 * @example
 * ```typescript
 * sanitizeString('<script>alert("xss")</script>Hello')
 * // Returns: 'Hello'
 * sanitizeString('मुझे सिरदर्द है')
 * // Returns: 'मुझे सिरदर्द है' (preserved)
 * ```
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script-related content
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Trim excessive whitespace (but keep single spaces)
    .replace(/\s{3,}/g, '  ')
    .trim();
}

/**
 * Validate and sanitize a chat message.
 * 
 * @param message - Raw chat message from user
 * @returns Sanitized message or null if invalid
 */
export function validateMessage(message: unknown): { valid: boolean; sanitized: string; error?: string } {
  if (!message || typeof message !== 'string') {
    return { valid: false, sanitized: '', error: 'Message is required and must be a string' };
  }

  const sanitized = sanitizeString(message);

  if (sanitized.length === 0) {
    return { valid: false, sanitized: '', error: 'Message cannot be empty' };
  }

  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    return { valid: false, sanitized: '', error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters` };
  }

  return { valid: true, sanitized };
}

/**
 * Validate and sanitize an array of symptom strings.
 * 
 * @param symptoms - Raw symptoms array from user
 * @returns Validated result with sanitized symptoms
 */
export function validateSymptoms(symptoms: unknown): { valid: boolean; sanitized: string[]; error?: string } {
  if (!symptoms || !Array.isArray(symptoms)) {
    return { valid: false, sanitized: [], error: 'Symptoms must be a non-empty array' };
  }

  if (symptoms.length === 0) {
    return { valid: false, sanitized: [], error: 'At least one symptom is required' };
  }

  if (symptoms.length > MAX_SYMPTOMS_COUNT) {
    return { valid: false, sanitized: [], error: `Maximum ${MAX_SYMPTOMS_COUNT} symptoms allowed per request` };
  }

  const sanitized = symptoms
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .map((s) => sanitizeString(s).substring(0, MAX_SYMPTOM_LENGTH));

  if (sanitized.length === 0) {
    return { valid: false, sanitized: [], error: 'No valid symptoms provided' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate image upload data (base64 + MIME type).
 * Checks size limits and allowed file types.
 * 
 * @param image - Base64-encoded image data
 * @param mimeType - MIME type of the image
 * @returns Validation result
 */
export function validateImageUpload(image: unknown, mimeType: unknown): { valid: boolean; error?: string } {
  if (!image || typeof image !== 'string') {
    return { valid: false, error: 'Image data is required' };
  }

  if (!mimeType || typeof mimeType !== 'string') {
    return { valid: false, error: 'Image MIME type is required' };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return { valid: false, error: `Unsupported image type: ${mimeType}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}` };
  }

  // Estimate base64 size (base64 is ~4/3 of original)
  const estimatedBytes = (image.length * 3) / 4;
  if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: `Image too large. Maximum size: ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB` };
  }

  return { valid: true };
}

/**
 * Validate the vision analysis type parameter.
 * 
 * @param type - Analysis type string
 * @returns Whether the type is valid
 */
export function validateVisionType(type: unknown): { valid: boolean; error?: string } {
  if (!type || typeof type !== 'string') {
    return { valid: false, error: 'Analysis type is required' };
  }

  if (!ALLOWED_VISION_TYPES.includes(type)) {
    return { valid: false, error: `Unknown analysis type: ${type}. Allowed: ${ALLOWED_VISION_TYPES.join(', ')}` };
  }

  return { valid: true };
}

/**
 * Validate a phone number format (Indian mobile numbers).
 * 
 * @param phone - Phone number string
 * @returns Whether the phone number is valid
 */
export function validatePhoneNumber(phone: unknown): { valid: boolean; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  // Allow Indian mobile number formats: +91XXXXXXXXXX, 91XXXXXXXXXX, XXXXXXXXXX
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const indianMobileRegex = /^(\+?91)?[6-9]\d{9}$/;

  if (!indianMobileRegex.test(cleaned)) {
    return { valid: false, error: 'Invalid Indian mobile number format' };
  }

  return { valid: true };
}

/**
 * Validate language code against supported languages.
 */
export function validateLanguage(lang: unknown): string {
  const SUPPORTED_LANGUAGES = ['en', 'hi', 'bn', 'te', 'ta', 'mr', 'ur', 'gu', 'kn', 'ml', 'pa', 'or'];
  if (typeof lang === 'string' && SUPPORTED_LANGUAGES.includes(lang)) {
    return lang;
  }
  return 'en'; // Default to English
}
