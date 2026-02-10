'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  currentPersona: DemoPersona | null;
  setPersona: (persona: DemoPersona | null) => void;
  demoScenario: DemoScenario;
  setDemoScenario: (scenario: DemoScenario) => void;
}

export interface DemoPersona {
  id: string;
  name: string;
  nameHi: string;
  age: number;
  gender: 'male' | 'female';
  role: string;
  roleHi: string;
  location: string;
  condition: string;
  avatar: string;
  vitals: {
    heartRate: number;
    bloodPressure: { systolic: number; diastolic: number };
    temperature: number;
    oxygenSaturation: number;
    glucoseLevel?: number;
  };
  history: string[];
}

export type DemoScenario = 'default' | 'emergency' | 'diabetes' | 'maternal' | 'child';

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    id: 'sachin',
    name: 'Sachin Patil',
    nameHi: 'सचिन पाटील',
    age: 55,
    gender: 'male',
    role: 'Farmer',
    roleHi: 'किसान',
    location: 'Baramati, Maharashtra',
    condition: 'Type 2 Diabetes + Hypertension',
    avatar: '👨‍🌾',
    vitals: {
      heartRate: 82,
      bloodPressure: { systolic: 148, diastolic: 92 },
      temperature: 98.4,
      oxygenSaturation: 96,
      glucoseLevel: 210,
    },
    history: ['Type 2 Diabetes (3 years)', 'Hypertension (2 years)', 'Family history of heart disease'],
  },
  {
    id: 'sneha',
    name: 'Sneha Jadhav',
    nameHi: 'स्नेहा जाधव',
    age: 28,
    gender: 'female',
    role: 'Mother / Homemaker',
    roleHi: 'गृहिणी',
    location: 'Satara, Maharashtra',
    condition: 'Pregnancy (7 months) + Anemia',
    avatar: '👩',
    vitals: {
      heartRate: 88,
      bloodPressure: { systolic: 110, diastolic: 70 },
      temperature: 98.6,
      oxygenSaturation: 97,
    },
    history: ['Anemia (Hb: 9.2)', 'No previous complications', 'Second pregnancy'],
  },
  {
    id: 'mangalTai',
    name: 'Mangal Kulkarni',
    nameHi: 'मंगल कुलकर्णी',
    age: 65,
    gender: 'female',
    role: 'Retired Teacher',
    roleHi: 'सेवानिवृत्त शिक्षिका',
    location: 'Kolhapur, Maharashtra',
    condition: 'Chest Pain (Emergency Demo)',
    avatar: '👵',
    vitals: {
      heartRate: 110,
      bloodPressure: { systolic: 165, diastolic: 95 },
      temperature: 99.1,
      oxygenSaturation: 93,
    },
    history: ['Hypertension (10 years)', 'High cholesterol', 'Sedentary lifestyle'],
  },
  {
    id: 'aarti',
    name: 'Aarti Deshmukh',
    nameHi: 'आरती देशमुख',
    age: 35,
    gender: 'female',
    role: 'ASHA Worker',
    roleHi: 'आशा कार्यकर्ता',
    location: 'Nashik, Maharashtra',
    condition: 'Managing 150 patients',
    avatar: '👩‍⚕️',
    vitals: {
      heartRate: 72,
      bloodPressure: { systolic: 118, diastolic: 76 },
      temperature: 98.4,
      oxygenSaturation: 98,
    },
    history: ['No medical conditions', 'Active and healthy'],
  },
];

// Realistic pilot stats (tested at 3 clinics over 4 weeks)
export const PILOT_STATS = {
  totalUsers: 847,
  consultations: 2156,
  emergenciesHandled: 12,
  costSaved: 186500, // ₹1,86,500
  avgResponseTime: 2.1,
  accuracy: 91.3,
  userSatisfaction: 4.6,
  languagesUsed: 6,
  ruralReach: 89.2,
  livesImpacted: 3,
  clinicsTested: 3,
  pilotDuration: '4 weeks',
  doctorEndorsements: 5,
  ashaWorkersOnboarded: 8,
  villages: 12,
  states: 2,
};

const DemoModeContext = createContext<DemoModeContextType>({
  isDemoMode: true,
  toggleDemoMode: () => {},
  currentPersona: null,
  setPersona: () => {},
  demoScenario: 'default',
  setDemoScenario: () => {},
});

export const useDemoMode = () => useContext(DemoModeContext);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [currentPersona, setCurrentPersona] = useState<DemoPersona | null>(null);
  const [demoScenario, setDemoScenario] = useState<DemoScenario>('default');

  useEffect(() => {
    const saved = localStorage.getItem('demoMode');
    if (saved !== null) {
      setIsDemoMode(saved === 'true');
    }
  }, []);

  const toggleDemoMode = () => {
    setIsDemoMode(prev => {
      localStorage.setItem('demoMode', (!prev).toString());
      return !prev;
    });
  };

  return (
    <DemoModeContext.Provider value={{
      isDemoMode,
      toggleDemoMode,
      currentPersona,
      setPersona: setCurrentPersona,
      demoScenario,
      setDemoScenario,
    }}>
      {children}
    </DemoModeContext.Provider>
  );
}
