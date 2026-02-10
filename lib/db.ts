// MongoDB Database Connection with Mongoose
// Optional - gracefully handles missing MongoDB connection

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_AVAILABLE = !!MONGODB_URI && MONGODB_URI.length > 10;

// Global type for caching the connection
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

/**
 * Connect to MongoDB (with connection caching for serverless)
 * Returns null if MongoDB URI is not configured (graceful fallback)
 */
export async function connectDB(): Promise<typeof mongoose | null> {
  if (!DB_AVAILABLE) {
    console.log('MongoDB not configured - running in stateless mode');
    return null;
  }

  if (cached!.conn) {
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached!.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log('✅ MongoDB connected successfully');
        return m;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection failed:', err.message);
        cached!.promise = null;
        throw err;
      });
  }

  try {
    cached!.conn = await cached!.promise;
    return cached!.conn;
  } catch {
    return null;
  }
}

/**
 * Check if database is available
 */
export function isDBAvailable(): boolean {
  return DB_AVAILABLE && cached?.conn !== null;
}

// ============================================
// SCHEMAS
// ============================================

// Patient Profile Schema
const patientSchema = new mongoose.Schema({
  phoneNumber: { type: String, unique: true, required: true, index: true },
  name: { type: String, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  village: { type: String },
  district: { type: String },
  state: { type: String },
  chronicConditions: [{ type: String }],
  allergies: [{ type: String }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
  }],
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String,
  }],
  abhaId: { type: String },
  role: { type: String, enum: ['patient', 'asha', 'doctor'], default: 'patient' },
  lastVisit: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Consultation Log Schema
const consultationSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', index: true },
  patientPhone: { type: String, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  symptoms: [{ type: String }],
  vitals: {
    heartRate: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    temperature: Number,
    oxygenSaturation: Number,
    bloodSugar: Number,
  },
  aiDiagnosis: {
    conditions: [{
      name: String,
      probability: Number,
    }],
    urgency: { type: String, enum: ['self-care', 'doctor-visit', 'emergency'] },
    confidence: Number,
  },
  recommendations: [{ type: String }],
  language: { type: String, default: 'en' },
  aiProvider: { type: String, enum: ['gemini', 'groq', 'local'] },
  responseTimeMs: { type: Number },
  outcome: {
    followedAdvice: Boolean,
    recoveryDays: Number,
    hospitalVisit: Boolean,
    notes: String,
  },
});

// IoT Vitals Time-Series Schema
const vitalsReadingSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  deviceId: { type: String, required: true },
  deviceType: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
  readings: {
    heartRate: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    temperature: Number,
    oxygenSaturation: Number,
    bloodSugar: Number,
    steps: Number,
  },
  alerts: [{
    type: { type: String },
    message: String,
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  }],
});

// Add indexes for efficient queries
consultationSchema.index({ timestamp: -1 });
consultationSchema.index({ 'aiDiagnosis.urgency': 1, timestamp: -1 });
vitalsReadingSchema.index({ deviceId: 1, timestamp: -1 });

// ============================================
// MODELS (with safe initialization for Next.js HMR)
// ============================================

export const Patient =
  mongoose.models.Patient || mongoose.model('Patient', patientSchema);

export const Consultation =
  mongoose.models.Consultation || mongoose.model('Consultation', consultationSchema);

export const VitalsReading =
  mongoose.models.VitalsReading || mongoose.model('VitalsReading', vitalsReadingSchema);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get or create a patient by phone number
 */
export async function getOrCreatePatient(phoneNumber: string, data?: any) {
  const db = await connectDB();
  if (!db) return null;

  let patient = await Patient.findOne({ phoneNumber });

  if (!patient && data) {
    patient = await Patient.create({ phoneNumber, ...data });
  }

  return patient;
}

/**
 * Log a consultation (for analytics and patient history)
 */
export async function logConsultation(consultationData: any) {
  const db = await connectDB();
  if (!db) return null;

  return await Consultation.create(consultationData);
}

/**
 * Get consultation history for a patient
 */
export async function getConsultationHistory(phoneNumber: string, limit: number = 10) {
  const db = await connectDB();
  if (!db) return [];

  return await Consultation.find({ patientPhone: phoneNumber })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
}

/**
 * Get population health stats for a region
 */
export async function getHealthStats(district?: string, days: number = 7) {
  const db = await connectDB();
  if (!db) return null;

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const stats = await Consultation.aggregate([
    { $match: { timestamp: { $gte: since } } },
    {
      $group: {
        _id: null,
        totalConsultations: { $sum: 1 },
        emergencies: {
          $sum: { $cond: [{ $eq: ['$aiDiagnosis.urgency', 'emergency'] }, 1, 0] },
        },
        avgConfidence: { $avg: '$aiDiagnosis.confidence' },
        avgResponseTime: { $avg: '$responseTimeMs' },
        languages: { $addToSet: '$language' },
      },
    },
  ]);

  const topSymptoms = await Consultation.aggregate([
    { $match: { timestamp: { $gte: since } } },
    { $unwind: '$symptoms' },
    { $group: { _id: '$symptoms', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  return {
    ...stats[0],
    topSymptoms,
    period: `${days} days`,
  };
}
