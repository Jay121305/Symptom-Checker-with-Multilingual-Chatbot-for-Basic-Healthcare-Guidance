// Gemini Vision API - Image Analysis for DeepBlue Health
// Shared utility for Lab Reports, Prescriptions, Pills, Dermatology
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_AVAILABLE = !!GEMINI_API_KEY && GEMINI_API_KEY !== 'demo';
const genAI = GEMINI_AVAILABLE ? new GoogleGenerativeAI(GEMINI_API_KEY!) : null;

const LANGUAGE_MAP: Record<string, string> = {
    'en': 'English', 'hi': 'Hindi (हिंदी)', 'bn': 'Bengali (বাংলা)',
    'te': 'Telugu (తెలుగు)', 'ta': 'Tamil (தமிழ்)', 'mr': 'Marathi (मराठी)',
    'ur': 'Urdu (اردو)', 'gu': 'Gujarati (ગુજરાતી)', 'kn': 'Kannada (ಕನ್ನಡ)',
    'ml': 'Malayalam (മലയാളം)', 'pa': 'Punjabi (ਪੰਜਾਬੀ)', 'or': 'Odia (ଓଡ଼ିଆ)',
};

function getLanguageName(code: string): string {
    return LANGUAGE_MAP[code] || 'English';
}

// ==================== LAB REPORT DECODER ====================
export async function analyzeLabReport(
    imageBase64: string,
    mimeType: string,
    language: string = 'en'
): Promise<LabReportResult> {
    if (!GEMINI_AVAILABLE || !genAI) {
        return getLabReportFallback(language);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const targetLang = getLanguageName(language);

    const prompt = `You are an expert medical lab report analyzer for rural Indian patients. Analyze this lab report image carefully.

Extract ALL test values visible in the report and for EACH value provide:
1. Test name
2. Value found
3. Normal range
4. Status (normal / low / high / critical)
5. Simple explanation a village person can understand

Also provide:
- An overall health summary in very simple words
- Key concerns (if any values are abnormal)
- Recommendations (what the patient should do next)

CRITICAL: Respond ENTIRELY in ${targetLang}. Use simple, non-technical language.

You MUST respond in ONLY valid JSON, no markdown, no code blocks:
{
  "reportType": "Blood Test / Urine Test / etc",
  "patientInfo": "any patient info visible or null",
  "testResults": [
    {
      "testName": "name",
      "value": "value with unit",
      "normalRange": "range",
      "status": "normal | low | high | critical",
      "explanation": "simple explanation"
    }
  ],
  "overallSummary": "simple summary",
  "concerns": ["concern 1", "concern 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "urgency": "normal | needs-attention | urgent"
}`;

    try {
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBase64, mimeType } }
        ]);

        const text = result.response.text();
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                success: true,
                reportType: parsed.reportType || 'Lab Report',
                patientInfo: parsed.patientInfo || null,
                testResults: parsed.testResults || [],
                overallSummary: parsed.overallSummary || '',
                concerns: parsed.concerns || [],
                recommendations: parsed.recommendations || [],
                urgency: parsed.urgency || 'normal',
            };
        }
        return getLabReportFallback(language);
    } catch (error) {
        console.error('Lab report analysis error:', error);
        return getLabReportFallback(language);
    }
}

// ==================== PRESCRIPTION DIGITIZER ====================
export async function digitizePrescription(
    imageBase64: string,
    mimeType: string,
    language: string = 'en'
): Promise<PrescriptionResult> {
    if (!GEMINI_AVAILABLE || !genAI) {
        return getPrescriptionFallback(language);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const targetLang = getLanguageName(language);

    const prompt = `You are an expert at reading doctor prescriptions, including messy handwriting common in Indian clinics. Analyze this prescription image.

Extract:
1. Doctor details (name, clinic, if visible)
2. Patient details (if visible)
3. ALL medicines prescribed with:
   - Medicine name (correct spelling even if handwriting is hard to read)
   - Dosage (e.g., 500mg, 10ml)
   - Frequency (e.g., twice daily, before meals)
   - Duration (e.g., 5 days, 1 week)
   - Special instructions (e.g., take with food, avoid dairy)
4. Any diagnosis mentioned
5. Follow-up date if mentioned

CRITICAL: Respond ENTIRELY in ${targetLang}. Be precise about medicine names.

Respond in ONLY valid JSON:
{
  "doctorInfo": { "name": "string or null", "clinic": "string or null", "specialization": "string or null" },
  "patientInfo": { "name": "string or null", "age": "string or null" },
  "diagnosis": "string or null",
  "medications": [
    {
      "name": "medicine name",
      "dosage": "dosage",
      "frequency": "how often",
      "duration": "how long",
      "timing": "before/after meals, morning/night etc",
      "instructions": "special instructions or null"
    }
  ],
  "followUpDate": "string or null",
  "additionalNotes": "string or null",
  "confidence": 0-100
}`;

    try {
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBase64, mimeType } }
        ]);

        const text = result.response.text();
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                success: true,
                doctorInfo: parsed.doctorInfo || null,
                patientInfo: parsed.patientInfo || null,
                diagnosis: parsed.diagnosis || null,
                medications: parsed.medications || [],
                followUpDate: parsed.followUpDate || null,
                additionalNotes: parsed.additionalNotes || null,
                confidence: parsed.confidence || 70,
            };
        }
        return getPrescriptionFallback(language);
    } catch (error) {
        console.error('Prescription digitization error:', error);
        return getPrescriptionFallback(language);
    }
}

// ==================== MEDICINE / PILL IDENTIFIER ====================
export async function identifyMedicine(
    imageBase64: string,
    mimeType: string,
    language: string = 'en'
): Promise<MedicineIdentifyResult> {
    if (!GEMINI_AVAILABLE || !genAI) {
        return getMedicineIdFallback(language);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const targetLang = getLanguageName(language);

    const prompt = `You are a pharmaceutical expert specializing in Indian medicines. Identify the medicine shown in this image.

Analyze:
1. If packaging is visible: read the brand name, manufacturer, composition
2. If it's a loose pill/tablet: identify by shape, color, size, any imprint/markings
3. Provide comprehensive information about the identified medicine

CRITICAL: Respond ENTIRELY in ${targetLang}. Use simple language.

Respond in ONLY valid JSON:
{
  "identified": true/false,
  "confidence": 0-100,
  "medicineName": "brand name",
  "genericName": "generic/salt name",
  "manufacturer": "company name or null",
  "composition": "active ingredients",
  "category": "antibiotic / painkiller / antacid / etc",
  "primaryUse": "what it's used for",
  "dosageInfo": "typical dosage",
  "sideEffects": ["side effect 1", "side effect 2"],
  "warnings": ["warning 1", "warning 2"],
  "storage": "storage instructions",
  "interactions": "major drug interactions to watch for",
  "otcOrPrescription": "OTC / Prescription",
  "approximatePrice": "price range in INR if known"
}`;

    try {
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBase64, mimeType } }
        ]);

        const text = result.response.text();
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                success: true,
                identified: parsed.identified ?? false,
                confidence: parsed.confidence || 0,
                medicineName: parsed.medicineName || 'Unknown',
                genericName: parsed.genericName || null,
                manufacturer: parsed.manufacturer || null,
                composition: parsed.composition || null,
                category: parsed.category || null,
                primaryUse: parsed.primaryUse || '',
                dosageInfo: parsed.dosageInfo || '',
                sideEffects: parsed.sideEffects || [],
                warnings: parsed.warnings || [],
                storage: parsed.storage || null,
                interactions: parsed.interactions || null,
                otcOrPrescription: parsed.otcOrPrescription || null,
                approximatePrice: parsed.approximatePrice || null,
            };
        }
        return getMedicineIdFallback(language);
    } catch (error) {
        console.error('Medicine identification error:', error);
        return getMedicineIdFallback(language);
    }
}

// ==================== DERMATOLOGY PHOTO-TRIAGE ====================
export async function analyzeSkinCondition(
    imageBase64: string,
    mimeType: string,
    bodyLocation: string,
    language: string = 'en'
): Promise<DermatologyResult> {
    if (!GEMINI_AVAILABLE || !genAI) {
        return getDermatologyFallback(language);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const targetLang = getLanguageName(language);

    const prompt = `You are a dermatology triage assistant for rural Indian patients. Analyze this skin condition image.

Location on body: ${bodyLocation || 'Not specified'}

Provide a PRELIMINARY assessment (not a diagnosis). Analyze:
1. Visual characteristics (color, texture, shape, size, pattern)
2. Most likely conditions (ranked by probability)
3. Urgency of seeking medical care
4. Home care advice while waiting for a doctor
5. When to see a dermatologist immediately

Consider common Indian skin conditions: fungal infections, heat rash, eczema, contact dermatitis, psoriasis, vitiligo, scabies, ringworm, impetigo, etc.

CRITICAL: This is a PRELIMINARY TRIAGE only. Always recommend professional consultation.
Respond ENTIRELY in ${targetLang}. Use simple language.

Respond in ONLY valid JSON:
{
  "visualDescription": "what the condition looks like",
  "possibleConditions": [
    {
      "name": "condition name",
      "likelihood": "high | medium | low",
      "description": "brief description in simple terms"
    }
  ],
  "urgency": "self-care | see-doctor-soon | see-doctor-urgently | emergency",
  "homeCareAdvice": ["advice 1", "advice 2"],
  "warningSignsToWatch": ["sign 1", "sign 2"],
  "preventionTips": ["tip 1", "tip 2"],
  "shouldSeeSpecialist": true/false,
  "disclaimer": "This is a preliminary assessment..."
}`;

    try {
        const result = await model.generateContent([
            prompt,
            { inlineData: { data: imageBase64, mimeType } }
        ]);

        const text = result.response.text();
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                success: true,
                visualDescription: parsed.visualDescription || '',
                possibleConditions: parsed.possibleConditions || [],
                urgency: parsed.urgency || 'see-doctor-soon',
                homeCareAdvice: parsed.homeCareAdvice || [],
                warningSignsToWatch: parsed.warningSignsToWatch || [],
                preventionTips: parsed.preventionTips || [],
                shouldSeeSpecialist: parsed.shouldSeeSpecialist ?? true,
                disclaimer: parsed.disclaimer || 'This is a preliminary AI assessment. Please consult a dermatologist for proper diagnosis.',
            };
        }
        return getDermatologyFallback(language);
    } catch (error) {
        console.error('Dermatology analysis error:', error);
        return getDermatologyFallback(language);
    }
}

// ==================== DRUG-DRUG INTERACTION CHECKER ====================
export async function checkDrugInteractions(
    medications: string[],
    language: string = 'en'
): Promise<DrugInteractionResult> {
    if (!GEMINI_AVAILABLE || !genAI) {
        return getDrugInteractionFallback(language);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const targetLang = getLanguageName(language);

    const prompt = `You are a clinical pharmacologist expert. Analyze the following medications for potential drug-drug interactions.

Medications: ${medications.join(', ')}

For EACH pair of medications that interact, provide:
1. Which drugs interact
2. Severity (mild / moderate / severe / contraindicated)
3. Type of interaction (pharmacodynamic / pharmacokinetic)
4. What happens (the clinical effect)
5. What to do about it
6. Whether the combination is safe or should be avoided

Also provide:
- General safety tips for taking these medications together
- Foods or substances to avoid
- Best timing for each medication

CRITICAL: Respond ENTIRELY in ${targetLang}. Be thorough and accurate.

Respond in ONLY valid JSON:
{
  "medicationCount": number,
  "interactions": [
    {
      "drug1": "medicine 1",
      "drug2": "medicine 2",
      "severity": "mild | moderate | severe | contraindicated",
      "type": "pharmacodynamic | pharmacokinetic | both",
      "effect": "what happens",
      "recommendation": "what to do",
      "avoidCombination": true/false
    }
  ],
  "overallSafety": "safe | caution | warning | danger",
  "generalAdvice": ["advice 1", "advice 2"],
  "foodInteractions": ["food interaction 1", "food interaction 2"],
  "timingAdvice": [
    { "medication": "name", "bestTime": "when to take", "withFood": true/false }
  ]
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                success: true,
                medicationCount: parsed.medicationCount || medications.length,
                interactions: parsed.interactions || [],
                overallSafety: parsed.overallSafety || 'caution',
                generalAdvice: parsed.generalAdvice || [],
                foodInteractions: parsed.foodInteractions || [],
                timingAdvice: parsed.timingAdvice || [],
            };
        }
        return getDrugInteractionFallback(language);
    } catch (error) {
        console.error('Drug interaction check error:', error);
        return getDrugInteractionFallback(language);
    }
}

// ==================== SENTIMENT ANALYSIS ====================
export async function analyzeSentiment(
    message: string,
    conversationHistory: string[],
    language: string = 'en'
): Promise<SentimentResult> {
    if (!GEMINI_AVAILABLE || !genAI) {
        return getLocalSentiment(message);
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a mental health screening assistant. Analyze the emotional state from this conversation.

Recent conversation:
${conversationHistory.slice(-5).map((m, i) => `${i % 2 === 0 ? 'User' : 'Assistant'}: ${m}`).join('\n')}

Latest message from user: "${message}"

Detect:
1. Primary emotion (calm/worried/anxious/distressed/panicked/depressed/angry/hopeful)
2. Anxiety level (1-10)
3. Signs of depression (yes/no)
4. Signs of panic/crisis (yes/no)
5. Whether the user needs emotional support or mental health resources

Respond in ONLY valid JSON:
{
  "primaryEmotion": "emotion",
  "anxietyLevel": 1-10,
  "depressionIndicators": true/false,
  "panicIndicators": true/false,
  "needsSupport": true/false,
  "suggestedTone": "normal | empathetic | calming | urgent-support",
  "mentalHealthResources": true/false,
  "reason": "brief reason for assessment"
}`;

    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
        });

        const text = result.response.text();
        const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                primaryEmotion: parsed.primaryEmotion || 'calm',
                anxietyLevel: parsed.anxietyLevel || 1,
                depressionIndicators: parsed.depressionIndicators || false,
                panicIndicators: parsed.panicIndicators || false,
                needsSupport: parsed.needsSupport || false,
                suggestedTone: parsed.suggestedTone || 'normal',
                mentalHealthResources: parsed.mentalHealthResources || false,
                reason: parsed.reason || '',
            };
        }
        return getLocalSentiment(message);
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        return getLocalSentiment(message);
    }
}

// ==================== LOCAL FALLBACKS ====================

function getLocalSentiment(message: string): SentimentResult {
    const lower = message.toLowerCase();
    const distressWords = ['die', 'death', 'kill', 'suicide', 'hopeless', 'helpless', 'end it', 'can\'t go on', 'no point', 'give up',
        'मरना', 'मौत', 'आत्महत्या', 'कोई उम्मीद नहीं', 'जीने का मन नहीं'];
    const anxietyWords = ['scared', 'afraid', 'terrified', 'panic', 'worried', 'anxious', 'nervous', 'stress', 'can\'t sleep', 'restless',
        'डर', 'घबराहट', 'चिंता', 'तनाव', 'नींद नहीं', 'बेचैन'];
    const sadWords = ['sad', 'depressed', 'lonely', 'alone', 'crying', 'hopeless', 'empty', 'worthless',
        'उदास', 'अकेला', 'रो रहा', 'दुखी'];

    const hasCrisis = distressWords.some(w => lower.includes(w));
    const hasAnxiety = anxietyWords.some(w => lower.includes(w));
    const hasSadness = sadWords.some(w => lower.includes(w));

    if (hasCrisis) {
        return {
            primaryEmotion: 'distressed', anxietyLevel: 9, depressionIndicators: true,
            panicIndicators: true, needsSupport: true, suggestedTone: 'urgent-support',
            mentalHealthResources: true, reason: 'Crisis indicators detected in message',
        };
    }
    if (hasAnxiety) {
        return {
            primaryEmotion: 'anxious', anxietyLevel: 7, depressionIndicators: false,
            panicIndicators: false, needsSupport: true, suggestedTone: 'calming',
            mentalHealthResources: false, reason: 'Anxiety indicators in message',
        };
    }
    if (hasSadness) {
        return {
            primaryEmotion: 'depressed', anxietyLevel: 5, depressionIndicators: true,
            panicIndicators: false, needsSupport: true, suggestedTone: 'empathetic',
            mentalHealthResources: true, reason: 'Sadness indicators in message',
        };
    }

    return {
        primaryEmotion: 'calm', anxietyLevel: 1, depressionIndicators: false,
        panicIndicators: false, needsSupport: false, suggestedTone: 'normal',
        mentalHealthResources: false, reason: 'No distress indicators',
    };
}

function getLabReportFallback(language: string): LabReportResult {
    return {
        success: false, reportType: 'Unknown', patientInfo: null, testResults: [],
        overallSummary: language === 'hi'
            ? 'AI उपलब्ध नहीं है। कृपया अपनी रिपोर्ट डॉक्टर को दिखाएं।'
            : 'AI is unavailable. Please show your report to a doctor for interpretation.',
        concerns: [], recommendations: [language === 'hi' ? 'डॉक्टर से परामर्श करें' : 'Consult a doctor'], urgency: 'normal',
    };
}

function getPrescriptionFallback(language: string): PrescriptionResult {
    return {
        success: false, doctorInfo: null, patientInfo: null, diagnosis: null,
        medications: [], followUpDate: null,
        additionalNotes: language === 'hi'
            ? 'AI उपलब्ध नहीं है। कृपया फार्मासिस्ट से पूछें।'
            : 'AI is unavailable. Please ask your pharmacist to read the prescription.',
        confidence: 0,
    };
}

function getMedicineIdFallback(language: string): MedicineIdentifyResult {
    return {
        success: false, identified: false, confidence: 0, medicineName: 'Unknown',
        genericName: null, manufacturer: null, composition: null, category: null,
        primaryUse: language === 'hi' ? 'पहचान नहीं हो सकी' : 'Could not identify',
        dosageInfo: '', sideEffects: [], warnings: [], storage: null, interactions: null,
        otcOrPrescription: null, approximatePrice: null,
    };
}

function getDermatologyFallback(language: string): DermatologyResult {
    return {
        success: false, visualDescription: '', possibleConditions: [],
        urgency: 'see-doctor-soon', homeCareAdvice: [],
        warningSignsToWatch: [], preventionTips: [], shouldSeeSpecialist: true,
        disclaimer: language === 'hi'
            ? 'AI उपलब्ध नहीं है। कृपया त्वचा विशेषज्ञ से मिलें।'
            : 'AI is unavailable. Please see a dermatologist for evaluation.',
    };
}

function getDrugInteractionFallback(language: string): DrugInteractionResult {
    return {
        success: false, medicationCount: 0, interactions: [], overallSafety: 'caution',
        generalAdvice: [language === 'hi' ? 'फार्मासिस्ट से परामर्श करें' : 'Consult a pharmacist about your medications'],
        foodInteractions: [], timingAdvice: [],
    };
}

// ==================== TYPE DEFINITIONS ====================

export interface LabReportResult {
    success: boolean;
    reportType: string;
    patientInfo: string | null;
    testResults: {
        testName: string;
        value: string;
        normalRange: string;
        status: 'normal' | 'low' | 'high' | 'critical';
        explanation: string;
    }[];
    overallSummary: string;
    concerns: string[];
    recommendations: string[];
    urgency: 'normal' | 'needs-attention' | 'urgent';
}

export interface PrescriptionResult {
    success: boolean;
    doctorInfo: { name: string | null; clinic: string | null; specialization: string | null } | null;
    patientInfo: { name: string | null; age: string | null } | null;
    diagnosis: string | null;
    medications: {
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        timing: string;
        instructions: string | null;
    }[];
    followUpDate: string | null;
    additionalNotes: string | null;
    confidence: number;
}

export interface MedicineIdentifyResult {
    success: boolean;
    identified: boolean;
    confidence: number;
    medicineName: string;
    genericName: string | null;
    manufacturer: string | null;
    composition: string | null;
    category: string | null;
    primaryUse: string;
    dosageInfo: string;
    sideEffects: string[];
    warnings: string[];
    storage: string | null;
    interactions: string | null;
    otcOrPrescription: string | null;
    approximatePrice: string | null;
}

export interface DermatologyResult {
    success: boolean;
    visualDescription: string;
    possibleConditions: {
        name: string;
        likelihood: 'high' | 'medium' | 'low';
        description: string;
    }[];
    urgency: 'self-care' | 'see-doctor-soon' | 'see-doctor-urgently' | 'emergency';
    homeCareAdvice: string[];
    warningSignsToWatch: string[];
    preventionTips: string[];
    shouldSeeSpecialist: boolean;
    disclaimer: string;
}

export interface DrugInteractionResult {
    success: boolean;
    medicationCount: number;
    interactions: {
        drug1: string;
        drug2: string;
        severity: 'mild' | 'moderate' | 'severe' | 'contraindicated';
        type: string;
        effect: string;
        recommendation: string;
        avoidCombination: boolean;
    }[];
    overallSafety: 'safe' | 'caution' | 'warning' | 'danger';
    generalAdvice: string[];
    foodInteractions: string[];
    timingAdvice: { medication: string; bestTime: string; withFood: boolean }[];
}

export interface SentimentResult {
    primaryEmotion: string;
    anxietyLevel: number;
    depressionIndicators: boolean;
    panicIndicators: boolean;
    needsSupport: boolean;
    suggestedTone: 'normal' | 'empathetic' | 'calming' | 'urgent-support';
    mentalHealthResources: boolean;
    reason: string;
}
