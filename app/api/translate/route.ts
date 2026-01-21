import { NextRequest, NextResponse } from 'next/server';

// Translation service for multilingual support
// In production, integrate with Google Translate API or similar
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLanguage, sourceLanguage = 'en' } = body;

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      );
    }

    // In development, return mock translations
    // In production, use Google Translate API or similar
    const translatedText = await translateText(text, targetLanguage, sourceLanguage);

    return NextResponse.json({
      originalText: text,
      translatedText,
      sourceLanguage,
      targetLanguage,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text' },
      { status: 500 }
    );
  }
}

async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string
): Promise<string> {
  // Mock translation for development
  // In production, use actual translation API
  
  // Common medical phrases translations
  const translations: Record<string, Record<string, string>> = {
    hi: {
      'Hello': 'नमस्ते',
      'How can I help you?': 'मैं आपकी कैसे मदद कर सकता हूं?',
      'What are your symptoms?': 'आपके लक्षण क्या हैं?',
      'Emergency': 'आपातकाल',
      'Call doctor': 'डॉक्टर को बुलाएं',
    },
    bn: {
      'Hello': 'হ্যালো',
      'How can I help you?': 'আমি কিভাবে আপনাকে সাহায্য করতে পারি?',
      'What are your symptoms?': 'আপনার লক্ষণ কি?',
    },
    te: {
      'Hello': 'హలో',
      'How can I help you?': 'నేను మీకు ఎలా సహాయం చేయగలను?',
      'What are your symptoms?': 'మీ లక్షణాలు ఏమిటి?',
    },
  };

  if (translations[targetLang] && translations[targetLang][text]) {
    return translations[targetLang][text];
  }

  // For actual implementation, use Google Translate API:
  /*
  const {Translate} = require('@google-cloud/translate').v2;
  const translate = new Translate({key: process.env.GOOGLE_TRANSLATE_API_KEY});
  
  const [translation] = await translate.translate(text, targetLang);
  return translation;
  */

  return text; // Fallback to original text
}
