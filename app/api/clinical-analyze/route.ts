import { NextRequest, NextResponse } from 'next/server';
import { clinicalEngine } from '@/lib/clinicalEngine';
import { TemporalSymptom, PatientContext } from '@/types/clinicalTypes';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { symptoms, patientContext, language = 'en' } = body;

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return NextResponse.json(
                { success: false, error: 'At least one symptom is required' },
                { status: 400 }
            );
        }

        // Validate temporal symptoms
        const validatedSymptoms: TemporalSymptom[] = symptoms.map((s: any, index: number) => ({
            id: s.id || `symptom_${index}`,
            name: s.name || 'Unknown',
            severity: Math.min(5, Math.max(1, s.severity || 3)) as 1 | 2 | 3 | 4 | 5,
            duration: s.duration || { value: 1, unit: 'days' },
            progression: s.progression || 'stable',
            onset: s.onset || 'gradual',
            frequency: s.frequency || 'constant',
            location: s.location
        }));

        // Validate patient context
        const context: PatientContext | undefined = patientContext ? {
            age: patientContext.age,
            gender: patientContext.gender,
            medicalHistory: patientContext.medicalHistory || [],
            medications: patientContext.medications || []
        } : undefined;

        // Run clinical analysis
        const assessment = clinicalEngine.analyze(validatedSymptoms, context);

        // Privacy: Log only anonymized summary, not raw symptoms
        logger.info('Clinical analysis completed', {
          symptomCount: symptoms.length,
          urgency: assessment.overallUrgency,
        });

        return NextResponse.json({
            success: true,
            assessment,
            disclaimer: 'This is a decision-support tool, not a diagnosis. Always consult a healthcare professional.',
            privacyNote: 'Your symptom data was processed locally and is not stored.'
        });

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Clinical analysis failed', { error: errMsg });
        return NextResponse.json(
            { success: false, error: 'Analysis failed. Please try again.' },
            { status: 500 }
        );
    }
}
