export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  preferredLanguage: string;
  medicalHistory: MedicalRecord[];
  emergencyContacts: EmergencyContact[];
  createdAt: Date;
}

export interface MedicalRecord {
  _id: string;
  date: Date;
  symptoms: string[];
  diagnosis: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  vitals?: VitalSigns;
  recommendations: string[];
  doctorNotes?: string;
}

export interface VitalSigns {
  heartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  timestamp: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  language?: string;
  audioUrl?: string;
}

export interface SymptomAnalysis {
  symptoms: string[];
  possibleConditions: Condition[];
  urgencyLevel: 'self-care' | 'doctor-visit' | 'emergency';
  recommendations: string[];
  whenToSeekHelp: string[];
  selfCareAdvice: string[];
  confidenceScore: number;
}

export interface Condition {
  name: string;
  probability: number;
  description: string;
  commonSymptoms: string[];
  riskFactors: string[];
}

export interface IoTDevice {
  id: string;
  name: string;
  type: 'smartwatch' | 'bp-monitor' | 'thermometer' | 'oximeter' | 'glucometer';
  status: 'connected' | 'disconnected';
  lastSync: Date;
  batteryLevel?: number;
}

export interface HealthTrend {
  metric: string;
  data: {
    date: Date;
    value: number;
  }[];
  trend: 'improving' | 'stable' | 'declining';
  analysis: string;
}

export type Language = 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'mr' | 'ur' | 'gu' | 'kn' | 'ml';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  voiceCode: string;
}

// Family Health Profiles
export interface FamilyProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  relationship: string;
  bloodGroup?: string;
  allergies?: string[];
  chronicConditions?: string[];
  medications?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Symptom Diary Entry
export interface SymptomDiaryEntry {
  id: string;
  profileId: string;
  date: Date;
  symptoms: string[];
  severity: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  mood?: 'good' | 'okay' | 'bad';
  vitals?: Partial<VitalSigns>;
  triggers?: string[];
}

// Government Health Schemes
export interface GovernmentScheme {
  id: string;
  name: string;
  nameHindi?: string;
  shortName: string;
  description: string;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  link: string;
  category: 'insurance' | 'treatment' | 'medicine' | 'maternity' | 'elderly' | 'disability';
}

// First Aid Guide
export interface FirstAidGuide {
  id: string;
  title: string;
  titleHindi?: string;
  category: 'injury' | 'emergency' | 'burn' | 'poisoning' | 'cardiac' | 'choking' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  steps: {
    step: number;
    instruction: string;
    instructionHindi?: string;
    warning?: string;
  }[];
  doNot: string[];
  callEmergency: boolean;
  videoUrl?: string;
}

// Medication Reminder
export interface Medication {
  id: string;
  profileId: string;
  name: string;
  dosage: string;
  frequency: 'once' | 'twice' | 'thrice' | 'custom';
  times: string[];
  startDate: Date;
  endDate?: Date;
  instructions?: string;
  isActive: boolean;
  reminderEnabled: boolean;
}

// Cost Estimation
export interface CostEstimate {
  condition: string;
  governmentHospital: {
    consultation: number;
    tests: number;
    treatment: number;
    medicines: number;
    total: number;
  };
  privateHospital: {
    consultation: number;
    tests: number;
    treatment: number;
    medicines: number;
    total: number;
  };
  insuranceCoverage?: string;
  genericAlternatives?: { brand: string; generic: string; savings: number }[];
}

// Body Part for Visual Symptom Input
export interface BodyPart {
  id: string;
  name: string;
  nameHindi: string;
  symptoms: string[];
  path: string; // SVG path
}

// Hospital/Clinic for Nearby Finder
export interface Hospital {
  id: string;
  name: string;
  type: 'government' | 'private' | 'clinic' | 'phc';
  address: string;
  phone: string;
  distance?: number;
  latitude: number;
  longitude: number;
  specialties?: string[];
  emergencyAvailable: boolean;
  ayushmanEmpaneled: boolean;
}

// Health Education Content
export interface HealthArticle {
  id: string;
  title: string;
  titleHindi?: string;
  category: string;
  content: string;
  contentHindi?: string;
  readTime: number;
  imageUrl?: string;
}

// Predictive Alert
export interface HealthAlert {
  id: string;
  type: 'trend' | 'seasonal' | 'reminder' | 'warning';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  date: Date;
  isRead: boolean;
}
