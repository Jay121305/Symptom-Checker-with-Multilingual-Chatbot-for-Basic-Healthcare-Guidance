import { NextRequest, NextResponse } from 'next/server';
import { geminiMedicalAI } from '@/lib/geminiAI';
import { groqMedicalAI } from '@/lib/groqAI';
import { medicalAI } from '@/lib/medicalAI';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, language = 'en', context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Try Gemini first, then Groq, then local fallback
    let response: string;
    try {
      response = await geminiMedicalAI.chatWithAssistant(message, language, context);
    } catch (geminiError) {
      console.log('Gemini failed, trying Groq:', geminiError);
      try {
        response = await groqMedicalAI.chatWithAssistant(message, language, context);
      } catch (groqError) {
        console.log('Groq failed, using local fallback:', groqError);
        response = await medicalAI.chatWithAssistant(message, language, context);
      }
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    geminiMedicalAI.clearHistory();
    groqMedicalAI.clearHistory();
    medicalAI.clearHistory();
    return NextResponse.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Clear history error:', error);
    return NextResponse.json(
      { error: 'Failed to clear history' },
      { status: 500 }
    );
  }
}
