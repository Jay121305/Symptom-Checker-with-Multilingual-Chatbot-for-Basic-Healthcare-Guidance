// Groq AI Integration for fast inference
import { SymptomAnalysis, VitalSigns } from '@/types';
import { MEDICAL_KNOWLEDGE_GRAPH } from './constants';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Check if Groq is available
const GROQ_AVAILABLE = !!GROQ_API_KEY && GROQ_API_KEY !== 'demo';

interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export class GroqMedicalAI {
    private conversationHistory: GroqMessage[] = [];

    // Language code to full name mapping
    private languageMap: Record<string, string> = {
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
        'as': 'Assamese (অসমীয়া)',
    };

    constructor() {
        this.conversationHistory = [];
    }

    private getLanguageName(code: string): string {
        return this.languageMap[code] || 'English';
    }

    async analyzeSymptoms(
        symptoms: string[],
        vitals?: VitalSigns,
        medicalHistory?: string[],
        language: string = 'en'
    ): Promise<SymptomAnalysis> {
        // Check for critical symptoms first
        const hasEmergency = symptoms.some(s =>
            MEDICAL_KNOWLEDGE_GRAPH.emergencyKeywords.some(keyword =>
                s.toLowerCase().includes(keyword.toLowerCase())
            )
        );

        if (hasEmergency) {
            return this.createEmergencyResponse(symptoms, vitals, language);
        }

        // If Groq not available, use local analysis
        if (!GROQ_AVAILABLE) {
            return this.localSymptomAnalysis(symptoms, vitals);
        }

        try {
            const prompt = this.buildAnalysisPrompt(symptoms, vitals, medicalHistory, language);

            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a medical assistant AI for rural healthcare in India. Analyze symptoms and provide guidance in a clear, structured format. Always recommend professional medical consultation for serious conditions. IMPORTANT: You MUST respond ENTIRELY in ${this.getLanguageName(language)} language. Do not mix languages.`
                        },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1500,
                }),
            });

            if (!response.ok) {
                throw new Error('Groq API error');
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content || '';

            return this.parseAnalysisResponse(content, symptoms);
        } catch (error) {
            console.error('Groq analysis error:', error);
            return this.localSymptomAnalysis(symptoms, vitals);
        }
    }

    async chatWithAssistant(
        message: string,
        language: string = 'en',
        context?: { symptoms?: string[]; vitals?: VitalSigns }
    ): Promise<string> {
        // If Groq not available, use local response
        if (!GROQ_AVAILABLE) {
            return this.generateLocalChatResponse(message, language, context);
        }

        try {
            const targetLanguage = this.getLanguageName(language);
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

CRITICAL INSTRUCTION: You MUST respond ENTIRELY in ${targetLanguage} language. Every word of your response must be in ${targetLanguage}. Do not use English unless the user selected English. This is very important for accessibility.`;

            this.conversationHistory.push({ role: 'user', content: message });

            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...this.conversationHistory.slice(-10), // Keep last 10 messages for context
                    ],
                    temperature: 0.7,
                    max_tokens: 800,
                }),
            });

            if (!response.ok) {
                throw new Error('Groq API error');
            }

            const data = await response.json();
            const assistantMessage = data.choices?.[0]?.message?.content || '';

            this.conversationHistory.push({ role: 'assistant', content: assistantMessage });

            return assistantMessage;
        } catch (error) {
            console.error('Groq chat error:', error);
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

        prompt += `\n\nProvide your response in this exact JSON format:
{
  "urgency": "self-care" | "doctor-visit" | "emergency",
  "confidence": 0-100,
  "conditions": [
    { "name": "condition name", "probability": 0-100, "description": "brief description" }
  ],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "whenToSeekHelp": ["warning sign 1", "warning sign 2"],
  "selfCareAdvice": ["advice 1", "advice 2"]
}`;

        return prompt;
    }

    private parseAnalysisResponse(content: string, symptoms: string[]): SymptomAnalysis {
        try {
            // Try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
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
            console.error('Parse error:', e);
        }

        // Fallback to local analysis
        return this.localSymptomAnalysis(symptoms);
    }

    private localSymptomAnalysis(symptoms: string[], vitals?: VitalSigns): SymptomAnalysis {
        // Match symptoms to conditions
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

        // Determine urgency
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
            recommendations: this.getRecommendations(urgency),
            whenToSeekHelp: this.getWhenToSeekHelp(urgency),
            selfCareAdvice: this.getSelfCareAdvice(topConditions[0]?.key),
        };
    }

    private generateLocalChatResponse(
        message: string,
        language: string,
        context?: any
    ): string {
        const lowerMessage = message.toLowerCase();

        // Multilingual responses for common queries
        const responses: Record<string, Record<string, string>> = {
            fever: {
                'en': 'For fever: 1) Take paracetamol (as advised by doctor) 2) Apply cold compress 3) Drink plenty of fluids 4) Rest well. If fever persists for more than 3 days or goes above 103°F, consult a doctor immediately.',
                'hi': 'बुखार के लिए: 1) पैरासिटामोल लें (डॉक्टर की सलाह से) 2) ठंडी पट्टी लगाएं 3) खूब पानी पिएं 4) आराम करें। अगर बुखार 3 दिन से ज्यादा रहे या 103°F से ऊपर जाए तो तुरंत डॉक्टर से मिलें।',
                'bn': 'জ্বরের জন্য: ১) প্যারাসিটামল নিন (ডাক্তারের পরামর্শ অনুযায়ী) ২) ঠান্ডা সেঁক দিন ৩) প্রচুর পানি পান করুন ৪) বিশ্রাম নিন। জ্বর ৩ দিনের বেশি থাকলে বা ১০৩°F এর উপরে গেলে অবিলম্বে ডাক্তারের সাথে পরামর্শ করুন।',
                'te': 'జ్వరం కోసం: 1) పారాసెటమల్ తీసుకోండి (డాక్టర్ సలహా మేరకు) 2) చల్లని కంప్రెస్ వేయండి 3) ఎక్కువ ద్రవాలు త్రాగండి 4) బాగా విశ్రాంతి తీసుకోండి. జ్వరం 3 రోజులకు మించి ఉంటే లేదా 103°F పైకి వెళ్ళినట్లయితే వెంటనే వైద్యుడిని సంప్రదించండి.',
                'ta': 'காய்ச்சலுக்கு: 1) பாராசிட்டமால் எடுத்துக்கொள்ளுங்கள் (மருத்துவர் ஆலோசனைப்படி) 2) குளிர் ஒத்தடம் கொடுங்கள் 3) நிறைய திரவங்கள் குடியுங்கள் 4) நன்றாக ஓய்வெடுங்கள். காய்ச்சல் 3 நாட்களுக்கு மேல் நீடித்தால் அல்லது 103°F க்கு மேல் சென்றால் உடனடியாக மருத்துவரை அணுகவும்.',
                'mr': 'तापासाठी: १) पॅरासिटामॉल घ्या (डॉक्टरांच्या सल्ल्यानुसार) २) थंड पट्टी लावा ३) भरपूर पाणी प्या ४) आराम करा. ताप ३ दिवसांपेक्षा जास्त राहिल्यास किंवा १०३°F च्या वर गेल्यास ताबडतोब डॉक्टरांना भेटा.',
                'gu': 'તાવ માટે: ૧) પેરાસિટામોલ લો (ડૉક્ટરની સલાહ મુજબ) ૨) ઠંડી પટ્ટી લગાવો ૩) પુષ્કળ પ્રવાહી પીવો ૪) સારી રીતે આરામ કરો. જો તાવ ૩ દિવસથી વધુ રહે અથવા ૧૦૩°F થી ઉપર જાય તો તરત ડૉક્ટરને મળો.',
                'kn': 'ಜ್ವರಕ್ಕೆ: ೧) ಪ್ಯಾರಾಸಿಟಮಾಲ್ ತೆಗೆದುಕೊಳ್ಳಿ (ವೈದ್ಯರ ಸಲಹೆಯಂತೆ) ೨) ತಣ್ಣೀರ ಪಟ್ಟಿ ಹಾಕಿ ೩) ಹೆಚ್ಚು ದ್ರವಗಳನ್ನು ಕುಡಿಯಿರಿ ೪) ಚೆನ್ನಾಗಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ. ಜ್ವರ ೩ ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ಇದ್ದರೆ ಅಥವಾ ೧೦೩°F ಮೇಲೆ ಹೋದರೆ ತಕ್ಷಣ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
                'ml': 'പനിക്ക്: ൧) പാരസെറ്റമോൾ കഴിക്കുക (ഡോക്ടറുടെ ഉപദേശപ്രകാരം) ൨) തണുത്ത കംപ്രസ് ഉപയോഗിക്കുക ൩) ധാരാളം ദ്രാവകങ്ങൾ കുടിക്കുക ൪) നന്നായി വിശ്രമിക്കുക. പനി ൩ ദിവസത്തിലധികം നീണ്ടാൽ അല്ലെങ്കിൽ ൧൦൩°F-ന് മുകളിൽ പോയാൽ ഉടൻ ഡോക്ടറെ കാണുക.',
                'ur': 'بخار کے لیے: ۱) پیراسیٹامول لیں (ڈاکٹر کے مشورے سے) ۲) ٹھنڈی پٹی لگائیں ۳) کافی پانی پیئیں ۴) آرام کریں۔ اگر بخار ۳ دن سے زیادہ رہے یا ۱۰۳°F سے اوپر جائے تو فوری طور پر ڈاکٹر سے ملیں۔',
            },
            emergency: {
                'en': '🚨 In emergency: Dial 108 for ambulance. Go to nearest hospital immediately.',
                'hi': '🚨 आपातकाल में: एम्बुलेंस के लिए 108 डायल करें। तुरंत नजदीकी अस्पताल जाएं।',
                'bn': '🚨 জরুরি অবস্থায়: অ্যাম্বুলেন্সের জন্য ১০৮ ডায়াল করুন। অবিলম্বে নিকটতম হাসপাতালে যান।',
                'te': '🚨 అత్యవసర పరిస్థితిలో: అంబులెన్స్ కోసం 108 కు డయల్ చేయండి. వెంటనే సమీపంలోని ఆసుపత్రికి వెళ్ళండి.',
                'ta': '🚨 அவசரநிலையில்: ஆம்புலன்ஸுக்கு 108 டயல் செய்யுங்கள். உடனடியாக அருகிலுள்ள மருத்துவமனைக்குச் செல்லுங்கள்.',
                'mr': '🚨 आणीबाणीत: रुग्णवाहिकेसाठी 108 डायल करा. ताबडतोब जवळच्या रुग्णालयात जा.',
                'gu': '🚨 ઇમરજન્સીમાં: એમ્બ્યુલન્સ માટે 108 ડાયલ કરો. તરત નજીકની હોસ્પિટલમાં જાઓ.',
                'kn': '🚨 ತುರ್ತು ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ: ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗಾಗಿ 108 ಡಯಲ್ ಮಾಡಿ. ತಕ್ಷಣ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ.',
                'ml': '🚨 അടിയന്തിര സാഹചര്യത്തിൽ: ആംബുലൻസിനായി 108 ഡയൽ ചെയ്യുക. ഉടൻ തന്നെ അടുത്തുള്ള ആശുപത്രിയിലേക്ക് പോകുക.',
                'ur': '🚨 ایمرجنسی میں: ایمبولینس کے لیے 108 ڈائل کریں۔ فوری طور پر قریبی ہسپتال جائیں۔',
            },
            default: {
                'en': "I'm here to help. Please describe your symptoms in detail. In case of emergency, call 108.",
                'hi': 'मैं आपकी मदद के लिए हूं। कृपया अपने लक्षण विस्तार से बताएं। गंभीर स्थिति में 108 पर कॉल करें।',
                'bn': 'আমি আপনাকে সাহায্য করতে এখানে আছি। অনুগ্রহ করে আপনার উপসর্গগুলি বিস্তারিত বর্ণনা করুন। জরুরি অবস্থায় ১০৮ নম্বরে কল করুন।',
                'te': 'నేను మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను. దయచేసి మీ లక్షణాలను వివరంగా వివరించండి. అత్యవసర సమయంలో 108కు కాల్ చేయండి.',
                'ta': 'நான் உங்களுக்கு உதவ இங்கே இருக்கிறேன். உங்கள் அறிகுறிகளை விரிவாக விவரிக்கவும். அவசரநிலையில் 108 என்ற எண்ணில் அழைக்கவும்.',
                'mr': 'मी तुम्हाला मदत करण्यासाठी येथे आहे. कृपया तुमची लक्षणे तपशीलवार सांगा. आणीबाणीत 108 वर कॉल करा.',
                'gu': 'હું તમને મદદ કરવા અહીં છું. કૃપા કરીને તમારા લક્ષણો વિગતવાર જણાવો. ઇમરજન્સીમાં 108 પર કૉલ કરો.',
                'kn': 'ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳನ್ನು ವಿವರವಾಗಿ ವಿವರಿಸಿ. ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ 108 ಗೆ ಕರೆ ಮಾಡಿ.',
                'ml': 'നിങ്ങളെ സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്. ദയവായി നിങ്ങളുടെ ലക്ഷണങ്ങൾ വിശദമായി വിവരിക്കുക. അടിയന്തിര സാഹചര്യത്തിൽ 108 ലേക്ക് വിളിക്കുക.',
                'ur': 'میں آپ کی مدد کے لیے یہاں ہوں۔ براہ کرم اپنی علامات تفصیل سے بیان کریں۔ ایمرجنسی میں 108 پر کال کریں۔',
            },
        };

        // Check for keywords
        if (lowerMessage.includes('fever') || lowerMessage.includes('बुखार') || lowerMessage.includes('জ্বর') || lowerMessage.includes('காய்ச்சல்')) {
            return responses.fever[language] || responses.fever['en'];
        }

        if (lowerMessage.includes('emergency') || lowerMessage.includes('आपातकाल') || lowerMessage.includes('জরুরি') || lowerMessage.includes('அவசர')) {
            return responses.emergency[language] || responses.emergency['en'];
        }

        // Default response in the selected language
        return responses.default[language] || responses.default['en'];
    }

    private createEmergencyResponse(
        symptoms: string[],
        vitals?: VitalSigns,
        language?: string
    ): SymptomAnalysis {
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
                'CALL 108 IMMEDIATELY',
                'Do not delay seeking emergency care',
                'If possible, have someone drive you to the nearest hospital',
                'Keep the patient calm and still',
            ],
            whenToSeekHelp: ['NOW - This is an emergency situation'],
            selfCareAdvice: ['Do not attempt self-treatment for these symptoms'],
        };
    }

    private getRecommendations(urgency: string): string[] {
        if (urgency === 'emergency') {
            return ['Call 108 immediately', 'Go to nearest hospital', 'Do not delay treatment'];
        }
        if (urgency === 'doctor-visit') {
            return [
                'Schedule a doctor appointment within 24-48 hours',
                'Keep track of your symptoms',
                'Avoid self-medication',
                'Stay hydrated and rest',
            ];
        }
        return [
            'Rest and monitor your symptoms',
            'Stay hydrated',
            'Take OTC medications if needed',
            'Consult doctor if symptoms persist beyond 3 days',
        ];
    }

    private getWhenToSeekHelp(urgency: string): string[] {
        if (urgency === 'emergency') {
            return ['Seek help immediately'];
        }
        return [
            'If symptoms worsen suddenly',
            'If fever goes above 103°F (39.4°C)',
            'If you have difficulty breathing',
            'If symptoms persist for more than 3 days',
        ];
    }

    private getSelfCareAdvice(conditionKey?: string): string[] {
        const generalAdvice = [
            'Get plenty of rest',
            'Stay well hydrated - drink water, ORS, or coconut water',
            'Eat light, nutritious food',
            'Avoid heavy physical activity',
        ];

        if (!conditionKey) return generalAdvice;

        const specificAdvice: Record<string, string[]> = {
            'common-cold': ['Steam inhalation helps', 'Warm fluids are soothing', 'Honey with warm water for throat'],
            'flu': ['Complete bed rest is essential', 'Isolate to prevent spread', 'Mask when near family members'],
            'gastroenteritis': ['ORS is essential', 'BRAT diet (bananas, rice, applesauce, toast)', 'Avoid dairy and spicy food'],
        };

        return specificAdvice[conditionKey] || generalAdvice;
    }
}

// Singleton instance
export const groqMedicalAI = new GroqMedicalAI();
