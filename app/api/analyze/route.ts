import { NextRequest, NextResponse } from 'next/server';
import { geminiMedicalAI } from '@/lib/geminiAI';
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

    // Try Gemini first, then Groq, then local fallback
    let analysis;
    try {
      analysis = await geminiMedicalAI.analyzeSymptoms(symptoms, vitals, medicalHistory, language);
    } catch (geminiError) {
      console.log('Gemini failed, trying Groq:', geminiError);
      try {
        analysis = await groqMedicalAI.analyzeSymptoms(symptoms, vitals, medicalHistory, language);
      } catch (groqError) {
        console.log('Groq failed, using local fallback:', groqError);
        analysis = await medicalAI.analyzeSymptoms(symptoms, vitals, medicalHistory, language);
      }
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
