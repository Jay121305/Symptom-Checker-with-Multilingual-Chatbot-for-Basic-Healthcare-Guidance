// Clinical Decision Support System Types

export interface TemporalSymptom {
    id: string;
    name: string;
    severity: 1 | 2 | 3 | 4 | 5;
    duration: { value: number; unit: 'hours' | 'days' | 'weeks' | 'months' };
    progression: 'improving' | 'stable' | 'worsening';
    onset: 'sudden' | 'gradual';
    frequency: 'constant' | 'intermittent' | 'occasional';
    location?: string;
}

export interface ClinicalCondition {
    id: string;
    name: string;
    confidence: number;
    reasoning: string[];
    matchingSymptoms: string[];
    missingSymptoms: string[];
    differentialFactors: string[];
    redFlags: string[];
    urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
    description: string;
}

export interface FollowUpQuestion {
    id: string;
    question: string;
    type: 'yes_no' | 'scale' | 'select';
    options?: { value: string; label: string }[];
    purpose: string;
    reducesUncertainty: string[];
    priority: number;
}

export interface RedFlagAlert {
    id: string;
    title: string;
    description: string;
    severity: 'warning' | 'danger' | 'critical';
    triggerSymptoms: string[];
    action: string;
    callEmergency: boolean;
}

export interface PatientContext {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    medicalHistory?: string[];
    medications?: string[];
}

export interface ClinicalAssessment {
    id: string;
    timestamp: Date;
    inputSymptoms: TemporalSymptom[];
    possibleConditions: ClinicalCondition[];
    followUpQuestions: FollowUpQuestion[];
    redFlagAlerts: RedFlagAlert[];
    overallUrgency: 'self-care' | 'schedule-visit' | 'urgent-care' | 'emergency';
    urgencyReason: string;
    confidenceExplanation: string;
    differentialExplanation: string;
    nextSteps: string[];
    selfCareAdvice: string[];
    whenToSeekHelp: string[];
}
