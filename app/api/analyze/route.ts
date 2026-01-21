import { NextRequest, NextResponse } from 'next/server';
import { groqMedicalAI } from '@/lib/groqAI';
import { medicalAI } from '@/lib/medicalAI';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symptoms, vitals, medicalHistory, language = 'en' } = body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json(
        { error: 'Symptoms array is required' },
        { status: 400 }
      );
    }

    // Try Groq first, fallback to medicalAI
    let analysis;
    try {
      analysis = await groqMedicalAI.analyzeSymptoms(
        symptoms,
        vitals,
        medicalHistory,
        language
      );
    } catch (groqError) {
      console.log('Groq failed, using fallback:', groqError);
      analysis = await medicalAI.analyzeSymptoms(
        symptoms,
        vitals,
        medicalHistory,
        language
      );
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Symptom analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptoms' },
      { status: 500 }
    );
  }
}
