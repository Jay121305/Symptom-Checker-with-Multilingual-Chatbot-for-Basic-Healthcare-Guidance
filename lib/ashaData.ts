// ASHA Worker Dashboard Types and Data

export interface AshaWorker {
    id: string;
    name: string;
    phone: string;
    village: string;
    district: string;
    state: string;
    assignedPatients: number;
    registrationDate: Date;
}

export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    phone: string;
    address: string;
    abhaId?: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    conditions: string[];
    lastVisit: Date;
    nextFollowUp?: Date;
    isPregnant?: boolean;
    pregnancyWeek?: number;
    isElderly?: boolean;
    chronicConditions?: string[];
    vaccinations?: { name: string; date: Date; nextDue?: Date }[];
    vitalsHistory?: { date: Date; bp?: string; temperature?: number; weight?: number }[];
}

export interface Referral {
    id: string;
    patientId: string;
    patientName: string;
    referredTo: 'PHC' | 'CHC' | 'District Hospital' | 'Specialist';
    reason: string;
    urgency: 'routine' | 'urgent' | 'emergency';
    symptoms: string[];
    status: 'pending' | 'completed' | 'cancelled';
    createdAt: Date;
    notes?: string;
}

export interface OutbreakAlert {
    id: string;
    symptom: string;
    location: string;
    coordinates: { lat: number; lng: number };
    casesCount: number;
    percentageIncrease: number;
    detectedAt: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    possibleCauses: string[];
}

export interface SymptomReport {
    id: string;
    symptom: string;
    location: string;
    coordinates: { lat: number; lng: number };
    reportedAt: Date;
    patientAge: number;
    patientGender: string;
}

// Sample ASHA data
export const SAMPLE_ASHA_WORKER: AshaWorker = {
    id: 'asha-001',
    name: 'Sunita Devi',
    phone: '+91 98765 43210',
    village: 'Rampur',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    assignedPatients: 847,
    registrationDate: new Date('2020-03-15'),
};

export const SAMPLE_PATIENTS: Patient[] = [
    {
        id: 'p-001',
        name: 'Kamla Devi',
        age: 28,
        gender: 'female',
        phone: '+91 87654 32100',
        address: 'House 45, Rampur Village',
        abhaId: '91-2345-6789-0123',
        riskLevel: 'high',
        riskFactors: ['Pregnancy', 'Anemia'],
        conditions: ['Pregnant - 32 weeks', 'Low hemoglobin'],
        lastVisit: new Date('2024-01-15'),
        nextFollowUp: new Date('2024-01-22'),
        isPregnant: true,
        pregnancyWeek: 32,
        vitalsHistory: [
            { date: new Date('2024-01-15'), bp: '110/70', weight: 58 },
            { date: new Date('2024-01-08'), bp: '108/68', weight: 57 },
        ],
    },
    {
        id: 'p-002',
        name: 'Ramu Prasad',
        age: 67,
        gender: 'male',
        phone: '+91 76543 21098',
        address: 'House 12, Rampur Village',
        abhaId: '91-3456-7890-1234',
        riskLevel: 'critical',
        riskFactors: ['Diabetes', 'Hypertension', 'Age > 65'],
        conditions: ['Type 2 Diabetes', 'High BP'],
        lastVisit: new Date('2024-01-10'),
        nextFollowUp: new Date('2024-01-17'),
        isElderly: true,
        chronicConditions: ['Diabetes', 'Hypertension'],
        vitalsHistory: [
            { date: new Date('2024-01-10'), bp: '150/95', temperature: 98.4 },
        ],
    },
    {
        id: 'p-003',
        name: 'Sita Ram',
        age: 45,
        gender: 'female',
        phone: '+91 65432 10987',
        address: 'House 78, Rampur Village',
        riskLevel: 'medium',
        riskFactors: ['Obesity'],
        conditions: ['Joint pain'],
        lastVisit: new Date('2024-01-05'),
    },
    {
        id: 'p-004',
        name: 'Mohan Lal',
        age: 8,
        gender: 'male',
        phone: '+91 54321 09876',
        address: 'House 23, Rampur Village',
        riskLevel: 'low',
        riskFactors: [],
        conditions: ['Healthy'],
        lastVisit: new Date('2024-01-12'),
        vaccinations: [
            { name: 'Polio', date: new Date('2023-06-15') },
            { name: 'BCG', date: new Date('2016-05-10') },
        ],
    },
    {
        id: 'p-005',
        name: 'Geeta Devi',
        age: 35,
        gender: 'female',
        phone: '+91 43210 98765',
        address: 'House 56, Rampur Village',
        riskLevel: 'high',
        riskFactors: ['Pregnancy', 'Previous complications'],
        conditions: ['Pregnant - 28 weeks', 'History of miscarriage'],
        lastVisit: new Date('2024-01-14'),
        nextFollowUp: new Date('2024-01-21'),
        isPregnant: true,
        pregnancyWeek: 28,
    },
    {
        id: 'p-006',
        name: 'Lakshmi Prasad',
        age: 72,
        gender: 'female',
        phone: '+91 32109 87654',
        address: 'House 89, Rampur Village',
        abhaId: '91-4567-8901-2345',
        riskLevel: 'high',
        riskFactors: ['Age > 65', 'Heart condition'],
        conditions: ['Angina', 'Arthritis'],
        lastVisit: new Date('2024-01-08'),
        isElderly: true,
        chronicConditions: ['Heart disease', 'Arthritis'],
    },
];

export const SAMPLE_REFERRALS: Referral[] = [
    {
        id: 'ref-001',
        patientId: 'p-001',
        patientName: 'Kamla Devi',
        referredTo: 'PHC',
        reason: 'Routine pregnancy checkup - 32 weeks',
        urgency: 'routine',
        symptoms: ['Mild swelling in feet'],
        status: 'pending',
        createdAt: new Date('2024-01-15'),
        notes: 'Blood pressure normal, needs routine ultrasound',
    },
    {
        id: 'ref-002',
        patientId: 'p-002',
        patientName: 'Ramu Prasad',
        referredTo: 'District Hospital',
        reason: 'Uncontrolled blood pressure',
        urgency: 'urgent',
        symptoms: ['Headache', 'Dizziness', 'High BP reading'],
        status: 'pending',
        createdAt: new Date('2024-01-16'),
        notes: 'BP consistently above 150/95 for past week',
    },
];

// Outbreak detection sample data
export const SAMPLE_SYMPTOM_REPORTS: SymptomReport[] = [
    // Fever cluster in Rampur
    { id: 'sr-001', symptom: 'Fever', location: 'Rampur', coordinates: { lat: 25.2677, lng: 82.9913 }, reportedAt: new Date('2024-01-15'), patientAge: 25, patientGender: 'male' },
    { id: 'sr-002', symptom: 'Fever', location: 'Rampur', coordinates: { lat: 25.2680, lng: 82.9920 }, reportedAt: new Date('2024-01-15'), patientAge: 32, patientGender: 'female' },
    { id: 'sr-003', symptom: 'Fever', location: 'Rampur', coordinates: { lat: 25.2675, lng: 82.9905 }, reportedAt: new Date('2024-01-16'), patientAge: 8, patientGender: 'male' },
    { id: 'sr-004', symptom: 'Fever', location: 'Rampur', coordinates: { lat: 25.2682, lng: 82.9918 }, reportedAt: new Date('2024-01-16'), patientAge: 45, patientGender: 'female' },
    { id: 'sr-005', symptom: 'Fever', location: 'Rampur', coordinates: { lat: 25.2678, lng: 82.9910 }, reportedAt: new Date('2024-01-17'), patientAge: 60, patientGender: 'male' },
    // Diarrhea in nearby village
    { id: 'sr-006', symptom: 'Diarrhea', location: 'Sultanpur', coordinates: { lat: 25.2800, lng: 83.0100 }, reportedAt: new Date('2024-01-14'), patientAge: 5, patientGender: 'male' },
    { id: 'sr-007', symptom: 'Diarrhea', location: 'Sultanpur', coordinates: { lat: 25.2810, lng: 83.0110 }, reportedAt: new Date('2024-01-15'), patientAge: 3, patientGender: 'female' },
    { id: 'sr-008', symptom: 'Diarrhea', location: 'Sultanpur', coordinates: { lat: 25.2805, lng: 83.0105 }, reportedAt: new Date('2024-01-16'), patientAge: 7, patientGender: 'male' },
    // Cough cases spread
    { id: 'sr-009', symptom: 'Cough', location: 'Rampur', coordinates: { lat: 25.2670, lng: 82.9900 }, reportedAt: new Date('2024-01-10'), patientAge: 40, patientGender: 'male' },
    { id: 'sr-010', symptom: 'Cough', location: 'Mirzapur', coordinates: { lat: 25.1500, lng: 82.5700 }, reportedAt: new Date('2024-01-12'), patientAge: 55, patientGender: 'female' },
    // Normal spread cases
    { id: 'sr-011', symptom: 'Headache', location: 'Rampur', coordinates: { lat: 25.2685, lng: 82.9925 }, reportedAt: new Date('2024-01-13'), patientAge: 28, patientGender: 'female' },
    { id: 'sr-012', symptom: 'Body Pain', location: 'Varanasi', coordinates: { lat: 25.3176, lng: 83.0100 }, reportedAt: new Date('2024-01-14'), patientAge: 35, patientGender: 'male' },
];

export const SAMPLE_OUTBREAK_ALERTS: OutbreakAlert[] = [
    {
        id: 'alert-001',
        symptom: 'Fever',
        location: 'Rampur Village',
        coordinates: { lat: 25.2677, lng: 82.9913 },
        casesCount: 5,
        percentageIncrease: 150,
        detectedAt: new Date('2024-01-17'),
        severity: 'high',
        possibleCauses: ['Dengue', 'Viral fever', 'Malaria'],
    },
    {
        id: 'alert-002',
        symptom: 'Diarrhea',
        location: 'Sultanpur Village',
        coordinates: { lat: 25.2800, lng: 83.0100 },
        casesCount: 3,
        percentageIncrease: 200,
        detectedAt: new Date('2024-01-16'),
        severity: 'medium',
        possibleCauses: ['Contaminated water', 'Food poisoning'],
    },
];

// ABHA related data
export interface ABHAProfile {
    abhaNumber: string;
    abhaAddress: string;
    name: string;
    gender: string;
    yearOfBirth: number;
    mobile: string;
    state: string;
    district: string;
    verified: boolean;
    linkedRecords: MedicalRecord[];
}

export interface MedicalRecord {
    id: string;
    type: 'prescription' | 'lab_report' | 'discharge_summary' | 'immunization';
    title: string;
    facility: string;
    date: Date;
    doctorName?: string;
    summary: string;
}

export const SAMPLE_ABHA_PROFILE: ABHAProfile = {
    abhaNumber: '91-2345-6789-0123',
    abhaAddress: 'kamladevi@abdm',
    name: 'Kamla Devi',
    gender: 'Female',
    yearOfBirth: 1996,
    mobile: '+91 87654 32100',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    verified: true,
    linkedRecords: [
        {
            id: 'rec-001',
            type: 'prescription',
            title: 'OPD Prescription - PHC Rampur',
            facility: 'Primary Health Center, Rampur',
            date: new Date('2024-01-10'),
            doctorName: 'Dr. Sharma',
            summary: 'Iron supplements prescribed for mild anemia. Follow-up in 2 weeks.',
        },
        {
            id: 'rec-002',
            type: 'lab_report',
            title: 'Blood Test Report',
            facility: 'District Hospital, Varanasi',
            date: new Date('2024-01-05'),
            summary: 'Hemoglobin: 10.2 g/dL (Low), Blood Sugar: Normal, All other parameters normal.',
        },
        {
            id: 'rec-003',
            type: 'immunization',
            title: 'Tetanus Toxoid (TT) Vaccination',
            facility: 'PHC Rampur',
            date: new Date('2023-12-15'),
            summary: 'TT-1 administered. Next dose due in 4 weeks.',
        },
    ],
};

// Ayushman Bharat eligibility
export interface AyushmanEligibility {
    eligible: boolean;
    cardNumber?: string;
    coverageAmount: number;
    familyMembers: number;
    expiryDate?: Date;
    coveredTreatments: string[];
}

export const SAMPLE_AYUSHMAN_ELIGIBILITY: AyushmanEligibility = {
    eligible: true,
    cardNumber: 'UP/VNS/2023/123456',
    coverageAmount: 500000,
    familyMembers: 5,
    expiryDate: new Date('2025-03-31'),
    coveredTreatments: [
        'Normal Delivery',
        'C-Section',
        'Dialysis',
        'Cancer Treatment',
        'Heart Surgery',
        'Knee Replacement',
        'COVID-19 Treatment',
    ],
};
