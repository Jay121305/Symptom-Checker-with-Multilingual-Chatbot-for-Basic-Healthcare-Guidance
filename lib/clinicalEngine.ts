// Clinical Reasoning Engine - Bayesian Analysis with Explainability
import {
    TemporalSymptom, ClinicalCondition, ClinicalAssessment,
    FollowUpQuestion, RedFlagAlert, PatientContext
} from '@/types/clinicalTypes';
import {
    CONDITION_DATABASE, SYMPTOM_WEIGHTS, RED_FLAG_PATTERNS, FOLLOW_UP_QUESTIONS
} from './clinicalKnowledge';

export class ClinicalReasoningEngine {
    // Normalize symptom name for matching
    private normalizeSymptom(symptom: string): string {
        return symptom.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z_]/g, '');
    }

    // Calculate Bayesian probability for a condition
    private calculateConditionProbability(
        conditionId: string,
        symptoms: TemporalSymptom[]
    ): number {
        const condition = CONDITION_DATABASE[conditionId];
        if (!condition) return 0;

        const symptomNames = symptoms.map(s => this.normalizeSymptom(s.name));
        let score = condition.prevalence * 100;

        // Check required symptoms
        const requiredMatches = condition.symptoms.required.filter(
            req => symptomNames.some(s => s.includes(req) || req.includes(s))
        );
        if (requiredMatches.length > 0) {
            score += requiredMatches.length * 20;
        }

        // Check supportive symptoms
        const supportiveMatches = condition.symptoms.supportive.filter(
            sup => symptomNames.some(s => s.includes(sup) || sup.includes(s))
        );
        score += supportiveMatches.length * 10;

        // Check excludes (reduce score if present)
        const excludeMatches = condition.symptoms.excludes.filter(
            exc => symptomNames.some(s => s.includes(exc) || exc.includes(s))
        );
        score -= excludeMatches.length * 15;

        // Apply symptom weights
        for (const symptom of symptoms) {
            const normalized = this.normalizeSymptom(symptom.name);
            const weights = SYMPTOM_WEIGHTS[normalized];
            if (weights && weights[conditionId]) {
                score += weights[conditionId] * 15 * (symptom.severity / 3);
            }
        }

        // Temporal pattern matching
        const hasWorsening = symptoms.some(s => s.progression === 'worsening');
        const hasSuddenOnset = symptoms.some(s => s.onset === 'sudden');

        if (condition.temporalPattern.onset === 'sudden' && hasSuddenOnset) {
            score += 10;
        }
        if (condition.urgency === 'emergency' && hasWorsening) {
            score += 15;
        }

        return Math.min(Math.max(score, 0), 95);
    }

    // Generate reasoning for a condition
    private generateReasoning(
        conditionId: string,
        symptoms: TemporalSymptom[]
    ): string[] {
        const condition = CONDITION_DATABASE[conditionId];
        if (!condition) return [];

        const reasoning: string[] = [];
        const symptomNames = symptoms.map(s => this.normalizeSymptom(s.name));

        // Required symptom matches
        const requiredMatches = condition.symptoms.required.filter(
            req => symptomNames.some(s => s.includes(req) || req.includes(s))
        );
        if (requiredMatches.length > 0) {
            reasoning.push(`Key symptoms present: ${requiredMatches.join(', ')}`);
        }

        // Supportive matches
        const supportiveMatches = condition.symptoms.supportive.filter(
            sup => symptomNames.some(s => s.includes(sup) || sup.includes(s))
        );
        if (supportiveMatches.length > 0) {
            reasoning.push(`Supporting symptoms: ${supportiveMatches.join(', ')}`);
        }

        // Severity consideration
        const highSeverity = symptoms.filter(s => s.severity >= 4);
        if (highSeverity.length > 0) {
            reasoning.push(`High severity symptoms require attention`);
        }

        // Temporal pattern
        const worsening = symptoms.filter(s => s.progression === 'worsening');
        if (worsening.length > 0) {
            reasoning.push(`Worsening pattern suggests active process`);
        }

        return reasoning;
    }

    // Detect red flags
    detectRedFlags(symptoms: TemporalSymptom[]): RedFlagAlert[] {
        const alerts: RedFlagAlert[] = [];
        const symptomNames = symptoms.map(s => this.normalizeSymptom(s.name));

        for (const pattern of RED_FLAG_PATTERNS) {
            const matches = pattern.symptoms.filter(ps =>
                symptomNames.some(sn => sn.includes(ps) || ps.includes(sn))
            );

            if (matches.length >= Math.min(2, pattern.symptoms.length)) {
                alerts.push({
                    id: pattern.id,
                    title: `⚠️ ${pattern.condition} Warning`,
                    description: pattern.reason,
                    severity: pattern.severity,
                    triggerSymptoms: matches,
                    action: pattern.action,
                    callEmergency: pattern.callEmergency
                });
            }
        }

        // Check for high severity symptoms
        const criticalSymptoms = symptoms.filter(s => s.severity === 5);
        if (criticalSymptoms.length > 0) {
            alerts.push({
                id: 'severe_symptoms',
                title: '⚠️ Severe Symptoms Detected',
                description: `${criticalSymptoms.length} symptom(s) marked as severe`,
                severity: 'danger',
                triggerSymptoms: criticalSymptoms.map(s => s.name),
                action: 'Seek medical attention promptly',
                callEmergency: false
            });
        }

        return alerts;
    }

    // Generate follow-up questions
    generateFollowUpQuestions(symptoms: TemporalSymptom[]): FollowUpQuestion[] {
        const questions: FollowUpQuestion[] = [];
        const symptomNames = symptoms.map(s => this.normalizeSymptom(s.name));

        for (const q of FOLLOW_UP_QUESTIONS) {
            if (symptomNames.some(s => s.includes(q.trigger) || q.trigger.includes(s))) {
                questions.push({
                    id: q.id,
                    question: q.question,
                    type: q.type as 'yes_no' | 'scale' | 'select',
                    options: q.options,
                    purpose: q.purpose,
                    reducesUncertainty: q.reduces,
                    priority: q.priority
                });
            }
        }

        return questions.sort((a, b) => b.priority - a.priority).slice(0, 3);
    }

    // Main analysis function
    analyze(
        symptoms: TemporalSymptom[],
        context?: PatientContext
    ): ClinicalAssessment {
        const id = `assessment_${Date.now()}`;

        // Detect red flags first
        const redFlagAlerts = this.detectRedFlags(symptoms);

        // Calculate probabilities for all conditions
        const conditionScores: { id: string; score: number }[] = [];
        for (const conditionId of Object.keys(CONDITION_DATABASE)) {
            const score = this.calculateConditionProbability(conditionId, symptoms);
            if (score > 5) {
                conditionScores.push({ id: conditionId, score });
            }
        }

        // Sort by probability and take top 5
        conditionScores.sort((a, b) => b.score - a.score);
        const topConditions = conditionScores.slice(0, 5);

        // Build clinical conditions with reasoning
        const possibleConditions: ClinicalCondition[] = topConditions.map(cs => {
            const cond = CONDITION_DATABASE[cs.id];
            const symptomNames = symptoms.map(s => this.normalizeSymptom(s.name));

            const matchingSymptoms = [...cond.symptoms.required, ...cond.symptoms.supportive]
                .filter(s => symptomNames.some(sn => sn.includes(s) || s.includes(sn)));

            const missingSymptoms = cond.symptoms.required
                .filter(s => !symptomNames.some(sn => sn.includes(s) || s.includes(sn)));

            return {
                id: cs.id,
                name: cond.name,
                confidence: Math.round(cs.score),
                reasoning: this.generateReasoning(cs.id, symptoms),
                matchingSymptoms,
                missingSymptoms,
                differentialFactors: [
                    `Typical onset: ${cond.temporalPattern.onset}`,
                    `Duration: ${cond.temporalPattern.duration}`
                ],
                redFlags: cond.redFlags,
                urgency: cond.urgency as 'routine' | 'soon' | 'urgent' | 'emergency',
                description: cond.description
            };
        });

        // Determine overall urgency
        let overallUrgency: 'self-care' | 'schedule-visit' | 'urgent-care' | 'emergency' = 'self-care';
        let urgencyReason = 'Symptoms appear manageable at home';

        if (redFlagAlerts.some(a => a.severity === 'critical')) {
            overallUrgency = 'emergency';
            urgencyReason = 'Critical warning signs detected';
        } else if (redFlagAlerts.some(a => a.severity === 'danger')) {
            overallUrgency = 'urgent-care';
            urgencyReason = 'Urgent medical evaluation recommended';
        } else if (possibleConditions[0]) {
            const topUrgency = possibleConditions[0].urgency;
            if (topUrgency === 'emergency') {
                overallUrgency = 'emergency';
                urgencyReason = 'Top condition requires immediate attention';
            } else if (topUrgency === 'urgent') {
                overallUrgency = 'urgent-care';
                urgencyReason = 'Medical evaluation recommended today';
            } else if (topUrgency === 'soon') {
                overallUrgency = 'schedule-visit';
                urgencyReason = 'Schedule a doctor visit within a few days';
            }
        }

        // Generate follow-up questions
        const followUpQuestions = this.generateFollowUpQuestions(symptoms);

        // Build explanations
        const confidenceExplanation = possibleConditions.length > 0
            ? `Based on ${symptoms.length} symptom(s), ${possibleConditions[0].name} is the most likely (${possibleConditions[0].confidence}% confidence). ` +
            `This is a differential diagnosis - other conditions are also possible.`
            : 'Unable to determine likely conditions with the given symptoms.';

        const differentialExplanation = possibleConditions.length > 1
            ? `${possibleConditions[0].name} is distinguished from ${possibleConditions[1]?.name} by: ` +
            `typical onset pattern and symptom combination.`
            : 'More symptoms needed for differential diagnosis.';

        return {
            id,
            timestamp: new Date(),
            inputSymptoms: symptoms,
            possibleConditions,
            followUpQuestions,
            redFlagAlerts,
            overallUrgency,
            urgencyReason,
            confidenceExplanation,
            differentialExplanation,
            nextSteps: this.getNextSteps(overallUrgency),
            selfCareAdvice: this.getSelfCareAdvice(possibleConditions[0]?.id),
            whenToSeekHelp: this.getWhenToSeekHelp(overallUrgency)
        };
    }

    private getNextSteps(urgency: string): string[] {
        switch (urgency) {
            case 'emergency':
                return ['Call 108 immediately', 'Go to nearest emergency room', 'Do not drive yourself'];
            case 'urgent-care':
                return ['Visit doctor today', 'Go to urgent care clinic', 'Monitor symptoms closely'];
            case 'schedule-visit':
                return ['Schedule appointment within 2-3 days', 'Rest and stay hydrated', 'Track symptoms'];
            default:
                return ['Rest and monitor symptoms', 'Stay hydrated', 'Seek care if symptoms worsen'];
        }
    }

    private getSelfCareAdvice(conditionId?: string): string[] {
        const general = ['Rest adequately', 'Stay hydrated', 'Avoid strenuous activity'];
        if (!conditionId) return general;

        const condition = CONDITION_DATABASE[conditionId];
        if (condition?.category === 'respiratory') {
            return [...general, 'Use steam inhalation', 'Gargle with warm salt water'];
        }
        if (condition?.category === 'digestive') {
            return [...general, 'Eat light bland foods', 'Avoid spicy/oily foods'];
        }
        return general;
    }

    private getWhenToSeekHelp(urgency: string): string[] {
        return [
            'Symptoms suddenly worsen',
            'New severe symptoms appear',
            'Difficulty breathing develops',
            'Confusion or altered consciousness',
            'Symptoms persist beyond expected duration'
        ];
    }
}

export const clinicalEngine = new ClinicalReasoningEngine();
