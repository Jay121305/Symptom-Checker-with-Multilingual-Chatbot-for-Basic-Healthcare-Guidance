import { LanguageConfig, Language } from '@/types';

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', voiceCode: 'en-US' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', voiceCode: 'hi-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', voiceCode: 'bn-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', voiceCode: 'te-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', voiceCode: 'ta-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', voiceCode: 'mr-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', voiceCode: 'ur-PK' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', voiceCode: 'gu-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', voiceCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', voiceCode: 'ml-IN' },
];

export const URGENCY_COLORS = {
  'self-care': '#52c41a',
  'doctor-visit': '#faad14',
  'emergency': '#f5222d',
};

export const URGENCY_ICONS = {
  'self-care': '🏠',
  'doctor-visit': '🏥',
  'emergency': '🚨',
};

// Medical Knowledge Graph - Disease-Symptom Relationships
export const MEDICAL_KNOWLEDGE_GRAPH = {
  conditions: {
    'common-cold': {
      name: 'Common Cold',
      symptoms: ['runny nose', 'sneezing', 'sore throat', 'cough', 'mild fever', 'fatigue'],
      severity: 'low',
      urgency: 'self-care',
    },
    'flu': {
      name: 'Influenza',
      symptoms: ['high fever', 'body aches', 'chills', 'fatigue', 'cough', 'headache'],
      severity: 'medium',
      urgency: 'doctor-visit',
    },
    'covid-19': {
      name: 'COVID-19',
      symptoms: ['fever', 'dry cough', 'fatigue', 'loss of taste', 'loss of smell', 'difficulty breathing'],
      severity: 'medium',
      urgency: 'doctor-visit',
    },
    'hypertension': {
      name: 'High Blood Pressure',
      symptoms: ['headache', 'dizziness', 'blurred vision', 'chest pain', 'shortness of breath'],
      severity: 'high',
      urgency: 'doctor-visit',
    },
    'diabetes': {
      name: 'Diabetes',
      symptoms: ['frequent urination', 'excessive thirst', 'hunger', 'fatigue', 'blurred vision', 'slow healing'],
      severity: 'high',
      urgency: 'doctor-visit',
    },
    'heart-attack': {
      name: 'Heart Attack',
      symptoms: ['severe chest pain', 'pain in arm', 'shortness of breath', 'nausea', 'cold sweat', 'lightheadedness'],
      severity: 'critical',
      urgency: 'emergency',
    },
    'stroke': {
      name: 'Stroke',
      symptoms: ['sudden numbness', 'confusion', 'trouble speaking', 'vision problems', 'dizziness', 'severe headache'],
      severity: 'critical',
      urgency: 'emergency',
    },
    'asthma': {
      name: 'Asthma Attack',
      symptoms: ['wheezing', 'shortness of breath', 'chest tightness', 'coughing', 'rapid breathing'],
      severity: 'high',
      urgency: 'doctor-visit',
    },
    'migraine': {
      name: 'Migraine',
      symptoms: ['severe headache', 'nausea', 'vomiting', 'light sensitivity', 'sound sensitivity', 'visual disturbances'],
      severity: 'medium',
      urgency: 'self-care',
    },
    'gastroenteritis': {
      name: 'Gastroenteritis',
      symptoms: ['diarrhea', 'nausea', 'vomiting', 'abdominal pain', 'fever', 'dehydration'],
      severity: 'medium',
      urgency: 'doctor-visit',
    },
  },
  
  emergencyKeywords: [
    'chest pain', 'severe pain', 'difficulty breathing', 'unconscious', 'bleeding heavily',
    'suicidal thoughts', 'seizure', 'stroke symptoms', 'heart attack', 'severe burns',
    'poisoning', 'severe allergic reaction', 'broken bone', 'severe head injury',
  ],
};

export const VITAL_RANGES = {
  heartRate: { normal: [60, 100], unit: 'bpm' },
  systolicBP: { normal: [90, 120], unit: 'mmHg' },
  diastolicBP: { normal: [60, 80], unit: 'mmHg' },
  temperature: { normal: [97, 99], unit: '°F' },
  oxygenSaturation: { normal: [95, 100], unit: '%' },
  respiratoryRate: { normal: [12, 20], unit: 'breaths/min' },
};

export const IOT_DEVICE_TYPES = [
  { type: 'smartwatch', name: 'Smart Watch', metrics: ['heartRate', 'steps', 'sleep'] },
  { type: 'bp-monitor', name: 'Blood Pressure Monitor', metrics: ['bloodPressure'] },
  { type: 'thermometer', name: 'Digital Thermometer', metrics: ['temperature'] },
  { type: 'oximeter', name: 'Pulse Oximeter', metrics: ['oxygenSaturation', 'heartRate'] },
  { type: 'glucometer', name: 'Glucometer', metrics: ['bloodSugar'] },
];
