// Clinical Knowledge Base - Conditions, Symptoms, and Red Flags

export const CONDITION_DATABASE: Record<string, {
    name: string;
    category: string;
    symptoms: { required: string[]; supportive: string[]; excludes: string[] };
    temporalPattern: { onset: string; duration: string };
    prevalence: number;
    urgency: string;
    redFlags: string[];
    description: string;
}> = {
    common_cold: {
        name: 'Common Cold',
        category: 'respiratory',
        symptoms: {
            required: ['runny_nose', 'sore_throat', 'sneezing'],
            supportive: ['cough', 'mild_fever', 'fatigue', 'headache'],
            excludes: ['high_fever', 'severe_headache', 'chest_pain']
        },
        temporalPattern: { onset: 'gradual', duration: '7-10 days' },
        prevalence: 0.15,
        urgency: 'self-care',
        redFlags: [],
        description: 'Viral infection of upper respiratory tract'
    },
    influenza: {
        name: 'Influenza (Flu)',
        category: 'respiratory',
        symptoms: {
            required: ['fever', 'body_aches', 'fatigue'],
            supportive: ['cough', 'headache', 'chills', 'sore_throat'],
            excludes: ['rash']
        },
        temporalPattern: { onset: 'sudden', duration: '1-2 weeks' },
        prevalence: 0.08,
        urgency: 'schedule-visit',
        redFlags: ['difficulty_breathing', 'chest_pain', 'confusion'],
        description: 'Viral respiratory infection with systemic symptoms'
    },
    covid19: {
        name: 'COVID-19',
        category: 'respiratory',
        symptoms: {
            required: ['fever', 'cough'],
            supportive: ['fatigue', 'loss_of_taste', 'loss_of_smell', 'body_aches', 'sore_throat'],
            excludes: []
        },
        temporalPattern: { onset: 'gradual', duration: '2-6 weeks' },
        prevalence: 0.05,
        urgency: 'schedule-visit',
        redFlags: ['difficulty_breathing', 'chest_pain', 'confusion', 'bluish_lips'],
        description: 'Coronavirus respiratory infection'
    },
    gastroenteritis: {
        name: 'Gastroenteritis',
        category: 'digestive',
        symptoms: {
            required: ['nausea', 'vomiting', 'diarrhea'],
            supportive: ['abdominal_pain', 'fever', 'fatigue'],
            excludes: ['blood_in_stool']
        },
        temporalPattern: { onset: 'sudden', duration: '1-3 days' },
        prevalence: 0.10,
        urgency: 'self-care',
        redFlags: ['blood_in_stool', 'severe_dehydration', 'high_fever'],
        description: 'Stomach and intestinal inflammation'
    },
    migraine: {
        name: 'Migraine',
        category: 'neurological',
        symptoms: {
            required: ['severe_headache'],
            supportive: ['nausea', 'light_sensitivity', 'sound_sensitivity', 'vision_changes'],
            excludes: ['fever', 'stiff_neck']
        },
        temporalPattern: { onset: 'gradual', duration: '4-72 hours' },
        prevalence: 0.12,
        urgency: 'schedule-visit',
        redFlags: ['worst_headache_ever', 'stiff_neck', 'confusion', 'seizure'],
        description: 'Recurrent severe headache disorder'
    },
    dengue: {
        name: 'Dengue Fever',
        category: 'infectious',
        symptoms: {
            required: ['high_fever', 'severe_body_aches'],
            supportive: ['headache', 'rash', 'fatigue', 'nausea', 'eye_pain'],
            excludes: []
        },
        temporalPattern: { onset: 'sudden', duration: '2-7 days' },
        prevalence: 0.03,
        urgency: 'urgent-care',
        redFlags: ['bleeding', 'severe_abdominal_pain', 'persistent_vomiting'],
        description: 'Mosquito-borne viral infection'
    },
    malaria: {
        name: 'Malaria',
        category: 'infectious',
        symptoms: {
            required: ['high_fever', 'chills'],
            supportive: ['sweating', 'headache', 'fatigue', 'body_aches', 'nausea'],
            excludes: []
        },
        temporalPattern: { onset: 'sudden', duration: 'cyclical' },
        prevalence: 0.02,
        urgency: 'urgent-care',
        redFlags: ['confusion', 'seizures', 'difficulty_breathing'],
        description: 'Parasitic infection from mosquito bite'
    },
    pneumonia: {
        name: 'Pneumonia',
        category: 'respiratory',
        symptoms: {
            required: ['cough', 'fever', 'difficulty_breathing'],
            supportive: ['chest_pain', 'fatigue', 'chills', 'phlegm'],
            excludes: []
        },
        temporalPattern: { onset: 'gradual', duration: '1-3 weeks' },
        prevalence: 0.02,
        urgency: 'urgent-care',
        redFlags: ['severe_difficulty_breathing', 'bluish_lips', 'confusion'],
        description: 'Lung infection causing inflammation'
    },
    urinary_tract_infection: {
        name: 'Urinary Tract Infection',
        category: 'urological',
        symptoms: {
            required: ['painful_urination', 'frequent_urination'],
            supportive: ['lower_abdominal_pain', 'cloudy_urine', 'blood_in_urine'],
            excludes: []
        },
        temporalPattern: { onset: 'gradual', duration: '3-7 days with treatment' },
        prevalence: 0.08,
        urgency: 'schedule-visit',
        redFlags: ['high_fever', 'back_pain', 'vomiting'],
        description: 'Bacterial infection of urinary system'
    },
    appendicitis: {
        name: 'Appendicitis',
        category: 'surgical',
        symptoms: {
            required: ['abdominal_pain'],
            supportive: ['nausea', 'vomiting', 'fever', 'loss_of_appetite'],
            excludes: []
        },
        temporalPattern: { onset: 'sudden', duration: 'progressive' },
        prevalence: 0.01,
        urgency: 'emergency',
        redFlags: ['severe_abdominal_pain', 'rigid_abdomen', 'high_fever'],
        description: 'Inflammation of appendix requiring surgery'
    },
    heart_attack: {
        name: 'Heart Attack',
        category: 'cardiac',
        symptoms: {
            required: ['chest_pain'],
            supportive: ['shortness_of_breath', 'arm_pain', 'jaw_pain', 'sweating', 'nausea'],
            excludes: []
        },
        temporalPattern: { onset: 'sudden', duration: 'persistent' },
        prevalence: 0.005,
        urgency: 'emergency',
        redFlags: ['crushing_chest_pain', 'radiating_arm_pain', 'difficulty_breathing'],
        description: 'Blocked blood flow to heart - LIFE THREATENING'
    },
    stroke: {
        name: 'Stroke',
        category: 'neurological',
        symptoms: {
            required: ['sudden_weakness', 'facial_drooping'],
            supportive: ['speech_difficulty', 'confusion', 'severe_headache', 'vision_changes'],
            excludes: []
        },
        temporalPattern: { onset: 'sudden', duration: 'persistent' },
        prevalence: 0.003,
        urgency: 'emergency',
        redFlags: ['facial_drooping', 'arm_weakness', 'speech_difficulty'],
        description: 'Brain blood flow interruption - LIFE THREATENING'
    },
    meningitis: {
        name: 'Meningitis',
        category: 'neurological',
        symptoms: {
            required: ['severe_headache', 'stiff_neck', 'fever'],
            supportive: ['light_sensitivity', 'nausea', 'confusion', 'rash'],
            excludes: []
        },
        temporalPattern: { onset: 'sudden', duration: 'progressive' },
        prevalence: 0.001,
        urgency: 'emergency',
        redFlags: ['stiff_neck', 'petechial_rash', 'confusion', 'seizures'],
        description: 'Brain membrane infection - LIFE THREATENING'
    },
    food_poisoning: {
        name: 'Food Poisoning',
        category: 'digestive',
        symptoms: {
            required: ['nausea', 'vomiting'],
            supportive: ['diarrhea', 'abdominal_cramps', 'fever'],
            excludes: []
        },
        temporalPattern: { onset: 'sudden', duration: '1-2 days' },
        prevalence: 0.05,
        urgency: 'self-care',
        redFlags: ['blood_in_stool', 'severe_dehydration', 'high_fever'],
        description: 'Illness from contaminated food'
    },
    asthma_attack: {
        name: 'Asthma Attack',
        category: 'respiratory',
        symptoms: {
            required: ['wheezing', 'difficulty_breathing'],
            supportive: ['cough', 'chest_tightness', 'rapid_breathing'],
            excludes: []
        },
        temporalPattern: { onset: 'sudden', duration: 'variable' },
        prevalence: 0.08,
        urgency: 'urgent-care',
        redFlags: ['severe_difficulty_breathing', 'bluish_lips', 'cannot_speak'],
        description: 'Airway narrowing causing breathing difficulty'
    }
};

// Symptom to condition weights for Bayesian scoring
export const SYMPTOM_WEIGHTS: Record<string, Record<string, number>> = {
    fever: { influenza: 0.8, covid19: 0.7, dengue: 0.9, malaria: 0.9, pneumonia: 0.7, meningitis: 0.8 },
    cough: { common_cold: 0.7, influenza: 0.6, covid19: 0.8, pneumonia: 0.9, asthma_attack: 0.6 },
    headache: { migraine: 0.9, influenza: 0.5, dengue: 0.7, meningitis: 0.8 },
    chest_pain: { heart_attack: 0.9, pneumonia: 0.6, asthma_attack: 0.5 },
    difficulty_breathing: { pneumonia: 0.8, asthma_attack: 0.9, heart_attack: 0.7, covid19: 0.6 },
    nausea: { gastroenteritis: 0.8, food_poisoning: 0.9, migraine: 0.6, appendicitis: 0.5 },
    vomiting: { gastroenteritis: 0.9, food_poisoning: 0.9, appendicitis: 0.6 },
    diarrhea: { gastroenteritis: 0.9, food_poisoning: 0.8 },
    abdominal_pain: { gastroenteritis: 0.6, appendicitis: 0.9, food_poisoning: 0.5 },
    severe_headache: { migraine: 0.9, meningitis: 0.8, stroke: 0.6 },
    stiff_neck: { meningitis: 0.95 },
    body_aches: { influenza: 0.8, dengue: 0.9, malaria: 0.7 },
    sore_throat: { common_cold: 0.8, influenza: 0.5 },
    runny_nose: { common_cold: 0.9 },
    fatigue: { influenza: 0.7, covid19: 0.6, dengue: 0.6 }
};

// Red flag patterns
export const RED_FLAG_PATTERNS = [
    {
        id: 'cardiac',
        symptoms: ['chest_pain', 'shortness_of_breath'],
        severity: 'critical' as const,
        condition: 'Heart Attack',
        reason: 'Possible cardiac event',
        action: 'Call 108 immediately',
        callEmergency: true
    },
    {
        id: 'meningitis',
        symptoms: ['severe_headache', 'stiff_neck', 'fever'],
        severity: 'critical' as const,
        condition: 'Meningitis',
        reason: 'Classic meningitis triad',
        action: 'Emergency care immediately',
        callEmergency: true
    },
    {
        id: 'stroke',
        symptoms: ['sudden_weakness', 'speech_difficulty'],
        severity: 'critical' as const,
        condition: 'Stroke',
        reason: 'FAST symptoms',
        action: 'Call 108 immediately',
        callEmergency: true
    },
    {
        id: 'respiratory',
        symptoms: ['severe_difficulty_breathing', 'bluish_lips'],
        severity: 'critical' as const,
        condition: 'Respiratory Failure',
        reason: 'Inadequate oxygen',
        action: 'Call 108 immediately',
        callEmergency: true
    }
];

// Follow-up questions
export const FOLLOW_UP_QUESTIONS = [
    {
        id: 'fever_duration',
        trigger: 'fever',
        question: 'How long have you had fever?',
        type: 'select' as const,
        options: [
            { value: 'less_1_day', label: 'Less than 1 day' },
            { value: '1_3_days', label: '1-3 days' },
            { value: '4_7_days', label: '4-7 days' },
            { value: 'more_7_days', label: 'More than 7 days' }
        ],
        purpose: 'Duration helps distinguish viral from bacterial',
        reduces: ['dengue', 'malaria', 'typhoid'],
        priority: 9
    },
    {
        id: 'chest_exertion',
        trigger: 'chest_pain',
        question: 'Does chest pain worsen with activity?',
        type: 'yes_no' as const,
        purpose: 'Exertional pain may indicate cardiac origin',
        reduces: ['heart_attack', 'muscle_strain'],
        priority: 10
    },
    {
        id: 'headache_type',
        trigger: 'headache',
        question: 'What type of headache?',
        type: 'select' as const,
        options: [
            { value: 'throbbing', label: 'Throbbing/pulsating' },
            { value: 'pressure', label: 'Pressure/squeezing' },
            { value: 'sharp', label: 'Sharp/stabbing' }
        ],
        purpose: 'Headache character helps identify cause',
        reduces: ['migraine', 'tension_headache'],
        priority: 7
    },
    {
        id: 'abd_location',
        trigger: 'abdominal_pain',
        question: 'Where is the pain located?',
        type: 'select' as const,
        options: [
            { value: 'upper_center', label: 'Upper center' },
            { value: 'lower_right', label: 'Lower right' },
            { value: 'lower_left', label: 'Lower left' },
            { value: 'all_over', label: 'All over' }
        ],
        purpose: 'Location indicates affected organ',
        reduces: ['appendicitis', 'gastritis'],
        priority: 9
    }
];
