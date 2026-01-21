'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, Volume2, VolumeX, Loader2, Settings } from 'lucide-react';
import { ChatMessage } from '@/types';
import toast from 'react-hot-toast';
import { SUPPORTED_LANGUAGES } from '@/lib/constants';

interface ChatInterfaceProps {
  language: string;
}

// Language-specific greetings and messages
const LANGUAGE_GREETINGS: Record<string, { greeting: string; placeholder: string; listening: string }> = {
  'en': {
    greeting: "Hello! I'm your healthcare assistant. How can I help you today? You can type or use voice input.",
    placeholder: "Type your message or use voice...",
    listening: "🎤 Listening... Speak now",
  },
  'hi': {
    greeting: "नमस्ते! मैं आपका स्वास्थ्य सहायक हूं। मैं आज आपकी कैसे मदद कर सकता हूं? आप टाइप कर सकते हैं या आवाज का उपयोग कर सकते हैं।",
    placeholder: "अपना संदेश टाइप करें या आवाज का उपयोग करें...",
    listening: "🎤 सुन रहा हूं... अभी बोलें",
  },
  'bn': {
    greeting: "নমস্কার! আমি আপনার স্বাস্থ্য সহায়ক। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি? আপনি টাইপ করতে পারেন বা ভয়েস ব্যবহার করতে পারেন।",
    placeholder: "আপনার বার্তা টাইপ করুন বা ভয়েস ব্যবহার করুন...",
    listening: "🎤 শুনছি... এখন বলুন",
  },
  'te': {
    greeting: "నమస్కారం! నేను మీ ఆరోగ్య సహాయకుడిని. ఈ రోజు నేను మీకు ఎలా సహాయం చేయగలను? మీరు టైప్ చేయవచ్చు లేదా వాయిస్ ఉపయోగించవచ్చు.",
    placeholder: "మీ సందేశాన్ని టైప్ చేయండి లేదా వాయిస్ ఉపయోగించండి...",
    listening: "🎤 వింటున్నాను... ఇప్పుడు మాట్లాడండి",
  },
  'ta': {
    greeting: "வணக்கம்! நான் உங்கள் சுகாதார உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்? நீங்கள் தட்டச்சு செய்யலாம் அல்லது குரலைப் பயன்படுத்தலாம்.",
    placeholder: "உங்கள் செய்தியை தட்டச்சு செய்யுங்கள் அல்லது குரலைப் பயன்படுத்துங்கள்...",
    listening: "🎤 கேட்கிறேன்... இப்போது பேசுங்கள்",
  },
  'mr': {
    greeting: "नमस्कार! मी तुमचा आरोग्य सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो? तुम्ही टाइप करू शकता किंवा आवाज वापरू शकता.",
    placeholder: "तुमचा संदेश टाइप करा किंवा आवाज वापरा...",
    listening: "🎤 ऐकत आहे... आत्ताच बोला",
  },
  'ur': {
    greeting: "السلام علیکم! میں آپ کا صحت معاون ہوں۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟ آپ ٹائپ کر سکتے ہیں یا آواز استعمال کر سکتے ہیں۔",
    placeholder: "اپنا پیغام ٹائپ کریں یا آواز استعمال کریں...",
    listening: "🎤 سن رہا ہوں... ابھی بولیں",
  },
  'gu': {
    greeting: "નમસ્તે! હું તમારો આરોગ્ય સહાયક છું. આજે હું તમને કેવી રીતે મદદ કરી શકું? તમે ટાઇપ કરી શકો છો અથવા અવાજનો ઉપયોગ કરી શકો છો.",
    placeholder: "તમારો સંદેશ ટાઇપ કરો અથવા અવાજનો ઉપયોગ કરો...",
    listening: "🎤 સાંભળી રહ્યો છું... હવે બોલો",
  },
  'kn': {
    greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು? ನೀವು ಟೈಪ್ ಮಾಡಬಹುದು ಅಥವಾ ಧ್ವನಿಯನ್ನು ಬಳಸಬಹುದು.",
    placeholder: "ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ ಅಥವಾ ಧ್ವನಿಯನ್ನು ಬಳಸಿ...",
    listening: "🎤 ಕೇಳುತ್ತಿದ್ದೇನೆ... ಈಗ ಮಾತನಾಡಿ",
  },
  'ml': {
    greeting: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ ആരോഗ്യ സഹായിയാണ്. ഇന്ന് എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാനാകും? നിങ്ങൾക്ക് ടൈപ്പ് ചെയ്യാം അല്ലെങ്കിൽ ശബ്ദം ഉപയോഗിക്കാം.",
    placeholder: "നിങ്ങളുടെ സന്ദേശം ടൈപ്പ് ചെയ്യുക അല്ലെങ്കിൽ ശബ്ദം ഉപയോഗിക്കുക...",
    listening: "🎤 കേൾക്കുന്നു... ഇപ്പോൾ സംസാരിക്കുക",
  },
  'pa': {
    greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਸਿਹਤ ਸਹਾਇਕ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ? ਤੁਸੀਂ ਟਾਈਪ ਕਰ ਸਕਦੇ ਹੋ ਜਾਂ ਆਵਾਜ਼ ਦੀ ਵਰਤੋਂ ਕਰ ਸਕਦੇ ਹੋ।",
    placeholder: "ਆਪਣਾ ਸੁਨੇਹਾ ਟਾਈਪ ਕਰੋ ਜਾਂ ਆਵਾਜ਼ ਦੀ ਵਰਤੋਂ ਕਰੋ...",
    listening: "🎤 ਸੁਣ ਰਿਹਾ ਹਾਂ... ਹੁਣ ਬੋਲੋ",
  },
  'or': {
    greeting: "ନମସ୍କାର! ମୁଁ ତୁମର ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ। ଆଜି ମୁଁ ତୁମକୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି? ତୁମେ ଟାଇପ୍ କରିପାରିବ କିମ୍ବା ଭଏସ୍ ବ୍ୟବହାର କରିପାରିବ।",
    placeholder: "ତୁମର ବାର୍ତ୍ତା ଟାଇପ୍ କର କିମ୍ବା ଭଏସ୍ ବ୍ୟବହାର କର...",
    listening: "🎤 ଶୁଣୁଛି... ବର୍ତ୍ତମାନ କୁହ",
  },
};

export default function ChatInterface({ language }: ChatInterfaceProps) {
  const langConfig = LANGUAGE_GREETINGS[language] || LANGUAGE_GREETINGS['en'];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: langConfig.greeting,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true); // Auto TTS toggle
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Update greeting when language changes
  useEffect(() => {
    const newLangConfig = LANGUAGE_GREETINGS[language] || LANGUAGE_GREETINGS['en'];
    setMessages([{
      id: '1',
      role: 'assistant',
      content: newLangConfig.greeting,
      timestamp: new Date(),
    }]);
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = getVoiceLanguage(language);

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error(language === 'hi' ? 'आवाज इनपुट विफल। कृपया पुनः प्रयास करें।' : 'Voice input failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  // Extended voice language mapping for all Indian languages
  const getVoiceLanguage = (lang: string): string => {
    const langMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'mr': 'mr-IN',
      'ur': 'ur-PK',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN',
      'or': 'or-IN',
      'as': 'as-IN',
      'ne': 'ne-NP',
    };
    return langMap[lang] || 'en-US';
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      language,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          language,
          context: {
            symptoms: extractSymptoms(input),
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        language,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Text-to-speech only if autoSpeak is enabled
      if ('speechSynthesis' in window && autoSpeak) {
        speakMessage(data.response);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(language === 'hi' ? 'प्रतिक्रिया प्राप्त करने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const extractSymptoms = (text: string): string[] => {
    const commonSymptoms = [
      'fever', 'headache', 'cough', 'pain', 'nausea', 'dizziness',
      'fatigue', 'weakness', 'breathing', 'chest pain',
      'बुखार', 'सिरदर्द', 'खांसी', 'दर्द', 'मतली', 'चक्कर',
    ];
    return commonSymptoms.filter(symptom =>
      text.toLowerCase().includes(symptom.toLowerCase())
    );
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getVoiceLanguage(language);
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error(language === 'hi' ? 'आपके ब्राउज़र में आवाज इनपुट समर्थित नहीं है' : 'Voice input not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.lang = getVoiceLanguage(language);
      recognitionRef.current.start();
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const toggleAutoSpeak = () => {
    setAutoSpeak(!autoSpeak);
    if (isSpeaking && autoSpeak) {
      stopSpeaking();
    }
    toast.success(
      autoSpeak
        ? (language === 'hi' ? 'ऑटो आवाज बंद' : 'Auto voice OFF')
        : (language === 'hi' ? 'ऑटो आवाज चालू' : 'Auto voice ON')
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[calc(100vh-280px)] flex flex-col">
      {/* Header with Settings */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 flex items-center justify-between">
        <h3 className="text-white font-semibold">
          {language === 'hi' ? 'AI स्वास्थ्य सहायक' : 'AI Health Assistant'}
        </h3>
        <div className="flex items-center gap-2">
          {/* Auto Speak Toggle */}
          <button
            onClick={toggleAutoSpeak}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${autoSpeak
              ? 'bg-white/20 text-white'
              : 'bg-white/10 text-white/70'
              }`}
            title={autoSpeak ? 'Voice responses ON' : 'Voice responses OFF'}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{autoSpeak ? 'Voice ON' : 'Voice OFF'}</span>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
                  }`}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center justify-between mt-2 gap-2">
                  <p className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {/* Speak this message button - available on all messages */}
                  <button
                    onClick={() => speakMessage(message.content)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${message.role === 'user'
                        ? 'bg-blue-400 hover:bg-blue-300 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    title={LANGUAGE_GREETINGS[language]?.listening || 'Listen to this message'}
                  >
                    <Volume2 className="w-3 h-3" />
                    <span className="hidden sm:inline">
                      {language === 'hi' ? 'सुनें' :
                        language === 'bn' ? 'শুনুন' :
                          language === 'ta' ? 'கேளுங்கள்' :
                            language === 'te' ? 'వినండి' :
                              language === 'mr' ? 'ऐका' :
                                language === 'gu' ? 'સાંભળો' :
                                  language === 'kn' ? 'ಕೇಳಿ' :
                                    language === 'ml' ? 'കേൾക്കുക' :
                                      'Listen'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-gray-50 p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleListening}
            disabled={isLoading}
            className={`p-3 rounded-full transition-colors ${isListening
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={langConfig.placeholder}
            disabled={isLoading || isListening}
            className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="p-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 animate-pulse"
              title="Stop speaking"
            >
              <VolumeX className="w-5 h-5" />
            </button>
          )}
        </div>

        {isListening && (
          <p className="text-sm text-red-600 mt-2 text-center animate-pulse">
            {langConfig.listening}
          </p>
        )}
      </div>
    </div>
  );
}
