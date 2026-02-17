// Google Gemini AI Integration for DeepBlue Health
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SymptomAnalysis, VitalSigns } from '@/types';
import { MEDICAL_KNOWLEDGE_GRAPH } from './constants';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_AVAILABLE = !!GEMINI_API_KEY && GEMINI_API_KEY !== 'demo';

const genAI = GEMINI_AVAILABLE ? new GoogleGenerativeAI(GEMINI_API_KEY!) : null;

interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

// Language code to full name mapping
const LANGUAGE_MAP: Record<string, string> = {
    'en': 'English',
    'hi': 'Hindi (हिंदी)',
    'bn': 'Bengali (বাংলা)',
    'te': 'Telugu (తెలుగు)',
    'ta': 'Tamil (தமிழ்)',
    'mr': 'Marathi (मराठी)',
    'ur': 'Urdu (اردو)',
    'gu': 'Gujarati (ગુજરાતી)',
    'kn': 'Kannada (ಕನ್ನಡ)',
    'ml': 'Malayalam (മലയാളം)',
    'pa': 'Punjabi (ਪੰਜਾਬੀ)',
    'or': 'Odia (ଓଡ଼ିଆ)',
};

export class GeminiMedicalAI {
    private conversationHistory: ChatMessage[] = [];

    private getLanguageName(code: string): string {
        return LANGUAGE_MAP[code] || 'English';
    }

    async analyzeSymptoms(
        symptoms: string[],
        vitals?: VitalSigns,
        medicalHistory?: string[],
        language: string = 'en'
    ): Promise<SymptomAnalysis> {
        // Check for emergency symptoms first
        const hasEmergency = symptoms.some(s =>
            MEDICAL_KNOWLEDGE_GRAPH.emergencyKeywords.some(keyword =>
                s.toLowerCase().includes(keyword.toLowerCase())
            )
        );

        if (hasEmergency) {
            return this.createEmergencyResponse(symptoms, vitals);
        }

        // Check critical vitals
        if (vitals && this.checkCriticalVitals(vitals)) {
            return this.createEmergencyResponse(symptoms, vitals);
        }

        // If Gemini not available, use local analysis
        if (!GEMINI_AVAILABLE || !genAI) {
            return this.localSymptomAnalysis(symptoms, vitals);
        }

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const targetLang = this.getLanguageName(language);

            const prompt = this.buildAnalysisPrompt(symptoms, vitals, medicalHistory, language);

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1500,
                },
                systemInstruction: {
                    role: 'user',
                    parts: [{
                        text: `You are a medical assistant AI for rural healthcare in India developed by team DeepBlue. Analyze symptoms and provide guidance in a clear, structured format. Always recommend professional medical consultation for serious conditions. IMPORTANT: You MUST respond ENTIRELY in ${targetLang} language. Do not mix languages.

You must respond in VALID JSON only. No markdown, no code blocks, just pure JSON.
Format:
{
  "urgency": "self-care" | "doctor-visit" | "emergency",
  "confidence": 0-100,
  "conditions": [
    { "name": "condition name", "probability": 0-100, "description": "brief description" }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "whenToSeekHelp": ["warning sign 1", "warning sign 2"],
  "selfCareAdvice": ["advice 1", "advice 2"]
}`
                    }]
                }
            });

            const content = result.response.text();
            return this.parseAnalysisResponse(content, symptoms);
        } catch (error) {
            console.error('Gemini analysis error:', error);
            return this.localSymptomAnalysis(symptoms, vitals);
        }
    }

    async chatWithAssistant(
        message: string,
        language: string = 'en',
        context?: { symptoms?: string[]; vitals?: VitalSigns; sentimentContext?: { mood: string; intensity: number; needsSupport: boolean; instruction: string } }
    ): Promise<string> {
        if (!GEMINI_AVAILABLE || !genAI) {
            return this.generateLocalChatResponse(message, language, context);
        }

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const targetLang = this.getLanguageName(language);

            const systemPrompt = `You are DeepBlue Health, an AI healthcare assistant for rural India.
Your role is to:
1. Help users understand their symptoms
2. Provide basic health guidance
3. Recommend when to seek medical attention
4. Support multiple Indian languages
5. Be empathetic and culturally sensitive

Important rules:
- Never diagnose diseases definitively
- Always recommend professional consultation for serious symptoms
- Provide first aid guidance when appropriate
- Be clear and simple in explanations
- Keep responses concise (under 200 words)

CODE-SWITCHING & DIALECT SUPPORT:
- If the user writes in Hinglish (mixed Hindi/English like "mujhe bahut headache ho raha hai"), respond naturally in the SAME mixed style
- If the user writes in any mixed-language format (Tanglish, Benglish, etc.), mirror their language style
- Understand colloquial medical terms across Indian languages:
  * "gas" / "गैस" = often means chest discomfort or bloating, NOT flatulence
  * "body heat" / "शरीर में गर्मी" = general feeling of heat, assess for fever
  * "sugar" / "शुगर" = diabetes
  * "BP" / "बीपी" = blood pressure or hypertension
  * "cold" / "ठंड लगना" = could mean common cold OR chills from fever
  * "weakness" / "kamzori" = fatigue, could indicate anemia or nutritional deficiency
  * "pet dard" / "पेट दर्द" = stomach pain (distinguish gastric, abdominal, menstrual)
  * "chakkar aana" / "चक्कर आना" = dizziness
  * "neend nahi aati" / "नींद नहीं आती" = insomnia, assess for anxiety/depression
- When user uses culturally specific terms, interpret them in the medical context appropriate to Indian healthcare

${context?.symptoms ? `Current symptoms: ${context.symptoms.join(', ')}` : ''}
${context?.vitals ? `Current vitals: HR:${context.vitals.heartRate} BP:${context.vitals.bloodPressure?.systolic}/${context.vitals.bloodPressure?.diastolic}` : ''}
${context?.sentimentContext ? `\nEMOTIONAL STATE: The user appears ${context.sentimentContext.mood} (intensity: ${context.sentimentContext.intensity}/10). ${context.sentimentContext.instruction}` : ''}

CRITICAL: Respond ENTIRELY in ${targetLang}. Every word must be in ${targetLang}. Exception: if the user is code-switching (mixing languages), you may mirror their mixed-language style.`;

            this.conversationHistory.push({
                role: 'user',
                parts: [{ text: message }]
            });

            // Build chat with history
            const chat = model.startChat({
                history: this.conversationHistory.slice(0, -1).map(msg => ({
                    role: msg.role,
                    parts: msg.parts
                })),
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                },
                systemInstruction: {
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                }
            });

            const result = await chat.sendMessage(message);
            const assistantMessage = result.response.text();

            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: assistantMessage }]
            });

            // Keep history manageable
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            return assistantMessage;
        } catch (error) {
            console.error('Gemini chat error:', error);
            return this.generateLocalChatResponse(message, language, context);
        }
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    private buildAnalysisPrompt(
        symptoms: string[],
        vitals?: VitalSigns,
        medicalHistory?: string[],
        language?: string
    ): string {
        let prompt = `Analyze the following symptoms and provide a structured health assessment:

Symptoms: ${symptoms.join(', ')}`;

        if (vitals) {
            prompt += `\n\nVital Signs:`;
            if (vitals.heartRate) prompt += `\n- Heart Rate: ${vitals.heartRate} bpm`;
            if (vitals.bloodPressure) prompt += `\n- Blood Pressure: ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg`;
            if (vitals.temperature) prompt += `\n- Temperature: ${vitals.temperature}°F`;
            if (vitals.oxygenSaturation) prompt += `\n- Oxygen Saturation: ${vitals.oxygenSaturation}%`;
        }

        if (medicalHistory?.length) {
            prompt += `\n\nMedical History: ${medicalHistory.join(', ')}`;
        }

        prompt += `\n\nRespond with ONLY valid JSON, no extra text.`;
        return prompt;
    }

    private parseAnalysisResponse(content: string, symptoms: string[]): SymptomAnalysis {
        try {
            // Clean up the response - remove markdown code blocks if present
            let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    symptoms,
                    urgencyLevel: parsed.urgency || 'doctor-visit',
                    confidenceScore: parsed.confidence || 70,
                    possibleConditions: (parsed.conditions || []).map((c: any) => ({
                        name: c.name,
                        probability: c.probability,
                        description: c.description,
                        commonSymptoms: symptoms,
                        riskFactors: [],
                    })),
                    recommendations: parsed.recommendations || ['Consult a healthcare professional'],
                    whenToSeekHelp: parsed.whenToSeekHelp || ['If symptoms worsen'],
                    selfCareAdvice: parsed.selfCareAdvice || ['Rest and stay hydrated'],
                };
            }
        } catch (e) {
            console.error('Gemini parse error:', e);
        }
        return this.localSymptomAnalysis(symptoms);
    }

    private checkCriticalVitals(vitals: VitalSigns): boolean {
        if (vitals.heartRate && (vitals.heartRate < 40 || vitals.heartRate > 140)) return true;
        if (vitals.bloodPressure) {
            if (vitals.bloodPressure.systolic > 180 || vitals.bloodPressure.systolic < 90) return true;
            if (vitals.bloodPressure.diastolic > 120 || vitals.bloodPressure.diastolic < 60) return true;
        }
        if (vitals.temperature && (vitals.temperature > 103 || vitals.temperature < 95)) return true;
        if (vitals.oxygenSaturation && vitals.oxygenSaturation < 90) return true;
        return false;
    }

    private createEmergencyResponse(symptoms: string[], vitals?: VitalSigns): SymptomAnalysis {
        return {
            symptoms,
            urgencyLevel: 'emergency',
            confidenceScore: 95,
            possibleConditions: [{
                name: 'Emergency Condition',
                probability: 95,
                description: 'Critical symptoms detected requiring immediate medical attention',
                commonSymptoms: symptoms,
                riskFactors: ['Time-sensitive condition'],
            }],
            recommendations: [
                '🚨 CALL 108 IMMEDIATELY',
                'Do not delay seeking emergency care',
                'If possible, have someone drive you to the nearest hospital',
                'Keep the patient calm and still',
            ],
            whenToSeekHelp: ['NOW - This is an emergency situation'],
            selfCareAdvice: ['Do not attempt self-treatment for these symptoms'],
        };
    }

    private localSymptomAnalysis(symptoms: string[], vitals?: VitalSigns): SymptomAnalysis {
        const conditionMatches: { key: string; condition: any; score: number }[] = [];

        for (const [key, condition] of Object.entries(MEDICAL_KNOWLEDGE_GRAPH.conditions)) {
            const matchingSymptoms = condition.symptoms.filter((cs: string) =>
                symptoms.some(s => s.toLowerCase().includes(cs.toLowerCase()) ||
                    cs.toLowerCase().includes(s.toLowerCase()))
            );

            if (matchingSymptoms.length > 0) {
                const score = (matchingSymptoms.length / condition.symptoms.length) * 100;
                conditionMatches.push({ key, condition, score });
            }
        }

        conditionMatches.sort((a, b) => b.score - a.score);
        const topConditions = conditionMatches.slice(0, 3);

        let urgency: 'self-care' | 'doctor-visit' | 'emergency' = 'self-care';
        if (topConditions.length > 0) {
            const topCondition = topConditions[0].condition;
            if (topCondition.severity === 'critical') urgency = 'emergency';
            else if (topCondition.severity === 'high' || topCondition.severity === 'medium') urgency = 'doctor-visit';
        }

        return {
            symptoms,
            urgencyLevel: urgency,
            confidenceScore: topConditions.length > 0 ? Math.round(topConditions[0].score) : 50,
            possibleConditions: topConditions.map(({ condition, score }) => ({
                name: condition.name,
                probability: Math.round(score),
                description: `Based on matching symptoms`,
                commonSymptoms: condition.symptoms,
                riskFactors: [],
            })),
            recommendations: urgency === 'emergency'
                ? ['Call 108 immediately', 'Go to nearest hospital']
                : urgency === 'doctor-visit'
                    ? ['Schedule a doctor appointment within 24-48 hours', 'Keep track of your symptoms', 'Stay hydrated and rest']
                    : ['Rest and monitor symptoms', 'Stay hydrated', 'Take OTC medications if needed'],
            whenToSeekHelp: ['If symptoms worsen', 'If fever goes above 103°F', 'If symptoms persist for more than 3 days'],
            selfCareAdvice: ['Get plenty of rest', 'Stay well hydrated', 'Eat light, nutritious food', 'Avoid heavy physical activity'],
        };
    }

    private generateLocalChatResponse(message: string, language: string, context?: any): string {
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.match(/hello|hi|hey|namaste|नमस्ते/)) {
            const greetings: Record<string, string> = {
                'en': "Hello! I'm DeepBlue Health, your AI healthcare assistant. I can help you understand your symptoms and provide guidance. How are you feeling today?",
                'hi': "नमस्ते! मैं डीपब्लू हेल्थ हूं, आपका AI स्वास्थ्य सहायक। मैं आपके लक्षणों को समझने और मार्गदर्शन प्रदान करने में मदद कर सकता हूं। आज आप कैसा महसूस कर रहे हैं?",
            };
            return greetings[language] || greetings['en'];
        }

        if (lowerMessage.match(/emergency|urgent|severe pain|can't breathe|chest pain|आपातकाल/)) {
            return "🚨 This sounds like it could be an emergency!\n\n1. Call emergency services (108) immediately\n2. Do not drive yourself - get help\n3. If you have someone with you, inform them\n4. Stay calm and wait for professional help\n\nYour safety is the top priority!";
        }

        if (lowerMessage.match(/fever|temperature|बुखार|तापमान/)) {
            return "For fever management:\n\n✓ Rest and stay hydrated\n✓ Take paracetamol if needed\n✓ Use cool compresses\n✓ Monitor temperature regularly\n\n⚠️ See a doctor if:\n- Fever above 103°F (39.4°C)\n- Fever lasting more than 3 days\n- Accompanied by severe symptoms";
        }

        if (lowerMessage.match(/headache|head pain|सिरदर्द/)) {
            return "For headache relief:\n\n✓ Rest in a quiet, dark room\n✓ Stay hydrated\n✓ Apply cold or warm compress\n✓ Consider OTC pain relief\n\n⚠️ Seek immediate help if:\n- Sudden, severe headache\n- Accompanied by confusion or vision changes\n- After head injury";
        }

        if (lowerMessage.match(/cough|cold|flu|खांसी|सर्दी/)) {
            return "For cold/cough:\n\n✓ Get plenty of rest\n✓ Drink warm fluids (tea, soup)\n✓ Use honey for cough relief\n✓ Steam inhalation\n\n⚠️ See a doctor if:\n- Symptoms worsen after a week\n- High fever (above 101°F)\n- Difficulty breathing";
        }

        if (lowerMessage.match(/diabetes|sugar|शुगर|मधुमेह/)) {
            return "For diabetes management:\n\n✓ Monitor blood sugar regularly\n✓ Follow prescribed diet plan\n✓ Exercise 30 minutes daily\n✓ Take medications on time\n\n⚠️ See a doctor if:\n- Blood sugar > 300 mg/dL\n- Frequent urination at night\n- Blurred vision or dizziness";
        }

        if (lowerMessage.match(/blood pressure|bp|रक्तचाप|ब्लड प्रेशर/)) {
            return "For blood pressure management:\n\n✓ Reduce salt intake\n✓ Exercise regularly\n✓ Manage stress\n✓ Take medications on time\n\n⚠️ See a doctor if:\n- BP above 180/120\n- Severe headache with BP\n- Chest pain or vision problems";
        }

        return "I understand your concern. Could you please tell me:\n\n1. What specific symptoms are you experiencing?\n2. How long have you had them?\n3. How severe are they (mild, moderate, severe)?\n\nThis will help me provide the most relevant guidance. Remember, I'm here to guide you, but always consult a doctor for proper diagnosis.";
    }
}

// Singleton instance
export const geminiMedicalAI = new GeminiMedicalAI();
