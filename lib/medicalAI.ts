import Anthropic from '@anthropic-ai/sdk';
import { SymptomAnalysis, VitalSigns } from '@/types';
import { MEDICAL_KNOWLEDGE_GRAPH } from './constants';

// Check if demo mode is enabled (no API key required)
const DEMO_MODE = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'demo';

const anthropic = DEMO_MODE ? null : new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export class MedicalAIEngine {
  private conversationHistory: Array<{ role: string; content: string }> = [];

  async analyzeSymptoms(
    symptoms: string[],
    vitals?: VitalSigns,
    medicalHistory?: string[],
    language: string = 'en'
  ): Promise<SymptomAnalysis> {
    try {
      // Check for emergency keywords first
      const hasEmergencySymptoms = symptoms.some(symptom =>
        MEDICAL_KNOWLEDGE_GRAPH.emergencyKeywords.some(keyword =>
          symptom.toLowerCase().includes(keyword.toLowerCase())
        )
      );

      // Check vital signs for critical values
      const hasCriticalVitals = vitals ? this.checkCriticalVitals(vitals) : false;

      if (hasEmergencySymptoms || hasCriticalVitals) {
        return this.createEmergencyResponse(symptoms, vitals, language);
      }

      // Use demo mode if no API key
      if (DEMO_MODE) {
        return this.analyzeSymptomsDemo(symptoms, vitals, medicalHistory);
      }

      // Build comprehensive prompt for Claude
      const prompt = this.buildAnalysisPrompt(symptoms, vitals, medicalHistory, language);

      const response = await anthropic!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.3,
        system: `You are a medical AI assistant helping users in rural areas with limited healthcare access. 
        Provide accurate, helpful medical guidance while being culturally sensitive and clear. 
        Always emphasize when professional medical care is needed. 
        Respond in ${language} language if requested.
        Format your response as JSON with the following structure:
        {
          "possibleConditions": [{"name": "", "probability": 0-100, "description": "", "commonSymptoms": [], "riskFactors": []}],
          "urgencyLevel": "self-care|doctor-visit|emergency",
          "recommendations": [],
          "whenToSeekHelp": [],
          "selfCareAdvice": [],
          "confidenceScore": 0-100
        }`,
        messages: [{ role: 'user', content: prompt }],
      });

      const content = response.content[0];
      const analysisText = content.type === 'text' ? content.text : '';
      
      // Parse AI response
      const analysis = this.parseAIResponse(analysisText, symptoms);
      
      return analysis;
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return this.createFallbackResponse(symptoms);
    }
  }

  async chatWithAssistant(
    message: string,
    language: string = 'en',
    context?: { symptoms?: string[]; vitals?: VitalSigns }
  ): Promise<string> {
    try {
      // Add user message to history
      this.conversationHistory.push({ role: 'user', content: message });

      // Use demo mode if no API key
      if (DEMO_MODE) {
        const demoResponse = this.generateDemoResponse(message, context);
        this.conversationHistory.push({ role: 'assistant', content: demoResponse });
        return demoResponse;
      }

      const systemPrompt = `You are a compassionate healthcare assistant for rural populations. 
      Provide clear, actionable health guidance in ${language} language.
      Be culturally sensitive, use simple language, and always prioritize safety.
      ${context?.symptoms ? `Current symptoms: ${context.symptoms.join(', ')}` : ''}
      ${context?.vitals ? `Current vitals: ${JSON.stringify(context.vitals)}` : ''}`;

      const response = await anthropic!.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        temperature: 0.7,
        system: systemPrompt,
        messages: this.conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      });

      const content = response.content[0];
      const assistantMessage = content.type === 'text' ? content.text : '';

      // Add assistant response to history
      this.conversationHistory.push({ role: 'assistant', content: assistantMessage });

      // Keep conversation history manageable (last 20 messages)
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return assistantMessage;
    } catch (error) {
      console.error('Chat Error:', error);
      return 'I apologize, but I am having trouble connecting right now. Please try again in a moment, or seek immediate medical attention if this is urgent.';
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
    let prompt = `Please analyze the following medical case:\n\n`;
    prompt += `Symptoms: ${symptoms.join(', ')}\n\n`;
    
    if (vitals) {
      prompt += `Vital Signs:\n`;
      if (vitals.heartRate) prompt += `- Heart Rate: ${vitals.heartRate} bpm\n`;
      if (vitals.bloodPressure) prompt += `- Blood Pressure: ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg\n`;
      if (vitals.temperature) prompt += `- Temperature: ${vitals.temperature}°F\n`;
      if (vitals.oxygenSaturation) prompt += `- Oxygen Saturation: ${vitals.oxygenSaturation}%\n`;
      if (vitals.respiratoryRate) prompt += `- Respiratory Rate: ${vitals.respiratoryRate} breaths/min\n`;
      prompt += `\n`;
    }
    
    if (medicalHistory && medicalHistory.length > 0) {
      prompt += `Medical History: ${medicalHistory.join(', ')}\n\n`;
    }
    
    prompt += `Please provide a comprehensive analysis including possible conditions, urgency level, recommendations, and self-care advice.`;
    
    return prompt;
  }

  private parseAIResponse(text: string, symptoms: string[]): SymptomAnalysis {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          symptoms,
          possibleConditions: parsed.possibleConditions || [],
          urgencyLevel: parsed.urgencyLevel || 'doctor-visit',
          recommendations: parsed.recommendations || [],
          whenToSeekHelp: parsed.whenToSeekHelp || [],
          selfCareAdvice: parsed.selfCareAdvice || [],
          confidenceScore: parsed.confidenceScore || 70,
        };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }
    
    return this.createFallbackResponse(symptoms);
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

  private createEmergencyResponse(
    symptoms: string[],
    vitals?: VitalSigns,
    language?: string
  ): SymptomAnalysis {
    return {
      symptoms,
      possibleConditions: [
        {
          name: 'Medical Emergency',
          probability: 95,
          description: 'Your symptoms or vital signs indicate a potential medical emergency.',
          commonSymptoms: symptoms,
          riskFactors: ['Requires immediate medical attention'],
        },
      ],
      urgencyLevel: 'emergency',
      recommendations: [
        '🚨 CALL EMERGENCY SERVICES IMMEDIATELY (108/102)',
        'Do not attempt to drive yourself to the hospital',
        'If you have emergency medication prescribed, take it now',
        'Have someone stay with you until help arrives',
        'Prepare to provide your location and medical history to responders',
      ],
      whenToSeekHelp: ['IMMEDIATELY - This is a medical emergency'],
      selfCareAdvice: [
        'Stay calm and try to relax',
        'Sit or lie down in a comfortable position',
        'Do not eat or drink anything unless instructed',
        'Keep your phone nearby',
      ],
      confidenceScore: 95,
    };
  }

  private createFallbackResponse(symptoms: string[]): SymptomAnalysis {
    return {
      symptoms,
      possibleConditions: [
        {
          name: 'General Medical Consultation Needed',
          probability: 70,
          description: 'Your symptoms require professional medical evaluation.',
          commonSymptoms: symptoms,
          riskFactors: [],
        },
      ],
      urgencyLevel: 'doctor-visit',
      recommendations: [
        'Schedule an appointment with a healthcare provider',
        'Monitor your symptoms closely',
        'Keep track of any changes in your condition',
        'Stay hydrated and get adequate rest',
      ],
      whenToSeekHelp: [
        'If symptoms worsen or persist for more than 2-3 days',
        'If you develop new symptoms',
        'If you experience severe pain or discomfort',
      ],
      selfCareAdvice: [
        'Get plenty of rest',
        'Stay hydrated',
        'Take over-the-counter pain relief if needed',
        'Follow up with your doctor as recommended',
      ],
      confidenceScore: 70,
    };
  }

  // Demo mode: Intelligent symptom matching using knowledge graph
  private analyzeSymptomsDemo(
    symptoms: string[],
    vitals?: VitalSigns,
    medicalHistory?: string[]
  ): SymptomAnalysis {
    const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());
    const matches: Array<{ condition: any; score: number; key: string }> = [];

    // Match symptoms against knowledge graph
    Object.entries(MEDICAL_KNOWLEDGE_GRAPH.conditions).forEach(([key, condition]) => {
      let score = 0;
      normalizedSymptoms.forEach(symptom => {
        condition.symptoms.forEach(knownSymptom => {
          if (symptom.includes(knownSymptom) || knownSymptom.includes(symptom)) {
            score += 1;
          }
        });
      });

      if (score > 0) {
        matches.push({ condition, score, key });
      }
    });

    // Sort by match score
    matches.sort((a, b) => b.score - a.score);

    if (matches.length === 0) {
      return this.createFallbackResponse(symptoms);
    }

    // Build analysis from best matches
    const topMatch = matches[0];
    const possibleConditions = matches.slice(0, 3).map((match, index) => ({
      name: match.condition.name,
      probability: Math.max(90 - index * 15, 50),
      description: this.getConditionDescription(match.key),
      commonSymptoms: match.condition.symptoms.slice(0, 4),
      riskFactors: this.getRiskFactors(match.key),
    }));

    const urgencyLevel = topMatch.condition.urgency as 'self-care' | 'doctor-visit' | 'emergency';

    return {
      symptoms,
      possibleConditions,
      urgencyLevel,
      recommendations: this.getRecommendations(urgencyLevel, topMatch.key),
      whenToSeekHelp: this.getWhenToSeekHelp(urgencyLevel),
      selfCareAdvice: this.getSelfCareAdvice(topMatch.key),
      confidenceScore: matches[0].score >= 2 ? 85 : 70,
    };
  }

  private generateDemoResponse(message: string, context?: any): string {
    const lowerMessage = message.toLowerCase();

    // Greeting responses
    if (lowerMessage.match(/hello|hi|hey|namaste/)) {
      return "Hello! I'm your healthcare assistant. I can help you understand your symptoms and provide guidance. How are you feeling today?";
    }

    // Emergency keywords
    if (lowerMessage.match(/emergency|urgent|severe pain|can't breathe|chest pain/)) {
      return "🚨 This sounds like it could be an emergency! Please:\n\n1. Call emergency services (108) immediately\n2. Do not drive yourself - get help\n3. If you have someone with you, inform them\n4. Stay calm and wait for professional help\n\nYour safety is the top priority!";
    }

    // Common symptoms
    if (lowerMessage.match(/fever|temperature|hot/)) {
      return "For fever management:\n\n✓ Rest and stay hydrated\n✓ Take fever-reducing medication if needed (paracetamol)\n✓ Use cool compresses\n✓ Monitor your temperature regularly\n\n⚠️ Seek medical attention if:\n- Fever above 103°F (39.4°C)\n- Fever lasting more than 3 days\n- Accompanied by severe symptoms";
    }

    if (lowerMessage.match(/headache|head pain|migraine/)) {
      return "For headache relief:\n\n✓ Rest in a quiet, dark room\n✓ Stay hydrated\n✓ Apply cold or warm compress\n✓ Consider over-the-counter pain relief\n✓ Avoid bright lights and loud sounds\n\n⚠️ Seek immediate help if:\n- Sudden, severe headache\n- Accompanied by confusion or vision changes\n- After head injury";
    }

    if (lowerMessage.match(/cough|cold|flu/)) {
      return "For cold/cough symptoms:\n\n✓ Get plenty of rest\n✓ Drink warm fluids (tea, soup)\n✓ Use honey for cough relief\n✓ Stay hydrated\n✓ Use steam inhalation\n\n⚠️ See a doctor if:\n- Symptoms worsen after a week\n- High fever (above 101°F)\n- Difficulty breathing\n- Chest pain";
    }

    // General health advice
    if (lowerMessage.match(/advice|help|what should/)) {
      return "I can help you with:\n\n• Symptom analysis and guidance\n• Understanding when to see a doctor\n• Self-care recommendations\n• Emergency situation identification\n\nPlease describe your symptoms in detail, and I'll provide personalized guidance. Remember, I'm here to guide you, but always consult a healthcare professional for proper diagnosis.";
    }

    // Default response
    return "I understand you're concerned about your health. Could you please tell me:\n\n1. What specific symptoms are you experiencing?\n2. How long have you had these symptoms?\n3. How severe are they (mild, moderate, severe)?\n\nThis will help me provide you with the most relevant guidance.";
  }

  private getConditionDescription(conditionKey: string): string {
    const descriptions: Record<string, string> = {
      'common-cold': 'A viral infection of the upper respiratory tract causing nasal congestion and mild discomfort.',
      'flu': 'Influenza is a viral infection that attacks the respiratory system, causing more severe symptoms than a cold.',
      'covid-19': 'A contagious disease caused by the SARS-CoV-2 virus, affecting the respiratory system.',
      'hypertension': 'High blood pressure that can lead to serious health complications if untreated.',
      'diabetes': 'A chronic condition affecting how your body processes blood sugar.',
      'heart-attack': 'A medical emergency where blood flow to the heart is blocked.',
      'stroke': 'A medical emergency where blood supply to part of the brain is interrupted.',
      'asthma': 'A condition causing airways to narrow and swell, making breathing difficult.',
      'migraine': 'A type of headache causing severe throbbing pain, often on one side.',
      'gastroenteritis': 'Inflammation of the digestive tract causing diarrhea and vomiting.',
    };
    return descriptions[conditionKey] || 'A medical condition requiring evaluation.';
  }

  private getRiskFactors(conditionKey: string): string[] {
    const riskFactors: Record<string, string[]> = {
      'common-cold': ['Weak immune system', 'Close contact with infected people', 'Seasonal changes'],
      'flu': ['Weak immune system', 'Age (young children and elderly)', 'Chronic conditions'],
      'hypertension': ['Age', 'Family history', 'Obesity', 'High salt intake', 'Lack of exercise'],
      'diabetes': ['Family history', 'Obesity', 'Sedentary lifestyle', 'Age over 45'],
      'heart-attack': ['High blood pressure', 'High cholesterol', 'Smoking', 'Diabetes', 'Family history'],
      'stroke': ['High blood pressure', 'Smoking', 'Diabetes', 'High cholesterol', 'Age'],
      'asthma': ['Family history', 'Allergies', 'Smoking exposure', 'Air pollution'],
    };
    return riskFactors[conditionKey] || ['Varies by individual'];
  }

  private getRecommendations(urgency: string, conditionKey: string): string[] {
    if (urgency === 'emergency') {
      return [
        '🚨 CALL EMERGENCY SERVICES (108) IMMEDIATELY',
        'Do not drive yourself to the hospital',
        'Inform someone nearby about your condition',
        'Stay calm and follow emergency operator instructions',
      ];
    }

    const recommendations: Record<string, string[]> = {
      'common-cold': [
        'Rest at home for 2-3 days',
        'Drink plenty of fluids',
        'Use over-the-counter cold medications',
        'Isolate to prevent spreading',
      ],
      'flu': [
        'Visit a doctor for proper diagnosis',
        'Rest and stay hydrated',
        'Take prescribed antiviral medications if recommended',
        'Monitor symptoms closely',
      ],
      'hypertension': [
        'Schedule a doctor appointment for blood pressure monitoring',
        'Reduce salt intake',
        'Exercise regularly',
        'Monitor blood pressure at home',
      ],
    };

    return recommendations[conditionKey] || [
      'Consult with a healthcare provider',
      'Monitor your symptoms',
      'Keep a symptom diary',
      'Follow medical advice carefully',
    ];
  }

  private getWhenToSeekHelp(urgency: string): string[] {
    if (urgency === 'emergency') {
      return ['SEEK HELP IMMEDIATELY - This is a medical emergency'];
    }

    if (urgency === 'doctor-visit') {
      return [
        'If symptoms worsen or don\'t improve within 48-72 hours',
        'If you develop a high fever (above 102°F/39°C)',
        'If you experience severe pain',
        'If symptoms interfere with daily activities',
      ];
    }

    return [
      'If symptoms persist for more than a week',
      'If you develop new concerning symptoms',
      'If over-the-counter treatments don\'t help',
      'If you have underlying health conditions',
    ];
  }

  private getSelfCareAdvice(conditionKey: string): string[] {
    const advice: Record<string, string[]> = {
      'common-cold': [
        'Get 7-9 hours of sleep',
        'Drink warm fluids like tea or soup',
        'Use a humidifier to ease congestion',
        'Gargle with salt water for sore throat',
      ],
      'flu': [
        'Complete bed rest',
        'Stay hydrated with water and electrolytes',
        'Eat nutritious, easy-to-digest foods',
        'Take fever-reducing medication as needed',
      ],
      'headache': [
        'Rest in a quiet, dark room',
        'Apply cold or hot compress',
        'Practice relaxation techniques',
        'Stay hydrated',
      ],
    };

    return advice[conditionKey] || [
      'Get adequate rest',
      'Maintain a healthy diet',
      'Stay hydrated',
      'Avoid stress when possible',
    ];
  }
}

// Singleton instance
export const medicalAI = new MedicalAIEngine();
