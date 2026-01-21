'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Phone, ArrowLeft, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoiceOnlyModeProps {
    language: string;
    onClose: () => void;
}

// Translations for voice mode
const VOICE_TRANSLATIONS: Record<string, {
    title: string;
    listening: string;
    speaking: string;
    tapToSpeak: string;
    processing: string;
    emergency: string;
}> = {
    'en': {
        title: 'Voice Health Assistant',
        listening: 'Listening...',
        speaking: 'Speaking...',
        tapToSpeak: 'Tap the circle and speak',
        processing: 'Processing...',
        emergency: 'Emergency - Call 108',
    },
    'hi': {
        title: 'आवाज स्वास्थ्य सहायक',
        listening: 'सुन रहा हूं...',
        speaking: 'बोल रहा हूं...',
        tapToSpeak: 'गोले पर टैप करें और बोलें',
        processing: 'प्रोसेसिंग...',
        emergency: 'आपातकाल - 108 पर कॉल करें',
    },
    'bn': {
        title: 'ভয়েস স্বাস্থ্য সহায়ক',
        listening: 'শুনছি...',
        speaking: 'বলছি...',
        tapToSpeak: 'বৃত্তে ট্যাপ করুন এবং বলুন',
        processing: 'প্রক্রিয়াকরণ...',
        emergency: 'জরুরি - 108 কল করুন',
    },
    'ta': {
        title: 'குரல் சுகாதார உதவியாளர்',
        listening: 'கேட்கிறேன்...',
        speaking: 'பேசுகிறேன்...',
        tapToSpeak: 'வட்டத்தைத் தட்டி பேசுங்கள்',
        processing: 'செயலாக்குகிறது...',
        emergency: 'அவசரநிலை - 108 அழைக்கவும்',
    },
    'te': {
        title: 'వాయిస్ హెల్త్ అసిస్టెంట్',
        listening: 'వింటున్నాను...',
        speaking: 'మాట్లాడుతున్నాను...',
        tapToSpeak: 'సర్కిల్ ను ట్యాప్ చేసి మాట్లాడండి',
        processing: 'ప్రాసెసింగ్...',
        emergency: 'అత్యవసరం - 108 కు కాల్ చేయండి',
    },
    'mr': {
        title: 'व्हॉइस हेल्थ असिस्टंट',
        listening: 'ऐकत आहे...',
        speaking: 'बोलत आहे...',
        tapToSpeak: 'वर्तुळावर टॅप करा आणि बोला',
        processing: 'प्रक्रिया...',
        emergency: 'आणीबाणी - 108 वर कॉल करा',
    },
};

export default function VoiceOnlyMode({ language, onClose }: VoiceOnlyModeProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    const t = VOICE_TRANSLATIONS[language] || VOICE_TRANSLATIONS['en'];

    const getVoiceLanguage = (lang: string): string => {
        const langMap: Record<string, string> = {
            'en': 'en-US', 'hi': 'hi-IN', 'bn': 'bn-IN', 'te': 'te-IN',
            'ta': 'ta-IN', 'mr': 'mr-IN', 'gu': 'gu-IN', 'kn': 'kn-IN',
            'ml': 'ml-IN', 'ur': 'ur-PK',
        };
        return langMap[lang] || 'en-US';
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            synthRef.current = window.speechSynthesis;

            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = getVoiceLanguage(language);

                recognitionRef.current.onresult = (event: any) => {
                    const current = event.resultIndex;
                    const result = event.results[current];
                    setTranscript(result[0].transcript);

                    if (result.isFinal) {
                        handleUserInput(result[0].transcript);
                    }
                };

                recognitionRef.current.onerror = () => {
                    setIsListening(false);
                    toast.error('Voice input failed');
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            }
        }

        // Initial greeting
        setTimeout(() => {
            speakMessage(t.tapToSpeak);
        }, 500);

        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, [language]);

    const startListening = () => {
        if (!recognitionRef.current) {
            toast.error('Voice not supported');
            return;
        }
        setIsListening(true);
        setTranscript('');
        recognitionRef.current.lang = getVoiceLanguage(language);
        recognitionRef.current.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    const speakMessage = (text: string) => {
        if (synthRef.current) {
            synthRef.current.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = getVoiceLanguage(language);
            utterance.rate = 0.9;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            synthRef.current.speak(utterance);
        }
    };

    const handleUserInput = async (input: string) => {
        setIsProcessing(true);
        setIsListening(false);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    language,
                    context: {},
                }),
            });

            const data = await res.json();
            setResponse(data.response);
            speakMessage(data.response);
        } catch (error) {
            console.error('Error:', error);
            speakMessage(language === 'hi' ? 'कृपया पुनः प्रयास करें' : 'Please try again');
        } finally {
            setIsProcessing(false);
        }
    };

    const callEmergency = () => {
        window.location.href = 'tel:108';
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 z-50 flex flex-col">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-white font-bold">{t.title}</h1>
                <div className="w-10" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                {/* Status Text */}
                <motion.p
                    key={isListening ? 'listening' : isSpeaking ? 'speaking' : isProcessing ? 'processing' : 'idle'}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white/80 text-lg mb-8 text-center"
                >
                    {isListening ? t.listening :
                        isSpeaking ? t.speaking :
                            isProcessing ? t.processing :
                                t.tapToSpeak}
                </motion.p>

                {/* Main Voice Button */}
                <motion.button
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing || isSpeaking}
                    className="relative w-48 h-48 rounded-full focus:outline-none disabled:opacity-50"
                    whileTap={{ scale: 0.95 }}
                >
                    {/* Outer rings */}
                    <div className={`absolute inset-0 rounded-full ${isListening ? 'bg-red-500/20 animate-ping' :
                            isSpeaking ? 'bg-green-500/20 animate-pulse' :
                                'bg-indigo-500/20'
                        }`} />
                    <div className={`absolute inset-4 rounded-full ${isListening ? 'bg-red-500/30' :
                            isSpeaking ? 'bg-green-500/30' :
                                'bg-indigo-500/30'
                        }`} />
                    <div className={`absolute inset-8 rounded-full ${isListening ? 'bg-red-500/40' :
                            isSpeaking ? 'bg-green-500/40' :
                                'bg-indigo-500/40'
                        }`} />

                    {/* Center button */}
                    <div className={`absolute inset-12 rounded-full flex items-center justify-center ${isListening ? 'bg-red-500' :
                            isSpeaking ? 'bg-green-500' :
                                'bg-gradient-to-br from-indigo-500 to-purple-600'
                        }`}>
                        {isListening ? (
                            <MicOff className="w-12 h-12 text-white" />
                        ) : isSpeaking ? (
                            <Volume2 className="w-12 h-12 text-white animate-pulse" />
                        ) : (
                            <Mic className="w-12 h-12 text-white" />
                        )}
                    </div>
                </motion.button>

                {/* Transcript Display */}
                <AnimatePresence>
                    {transcript && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-8 px-6 py-4 bg-white/10 rounded-2xl max-w-md text-center"
                        >
                            <p className="text-white text-lg">"{transcript}"</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Response Display */}
                <AnimatePresence>
                    {response && !isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 px-6 py-4 bg-green-500/20 rounded-2xl max-w-md text-center max-h-40 overflow-y-auto"
                        >
                            <p className="text-green-100 text-sm">{response}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Emergency Button */}
            <div className="p-6">
                <button
                    onClick={callEmergency}
                    className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3"
                >
                    <Phone className="w-6 h-6" />
                    {t.emergency}
                </button>
            </div>
        </div>
    );
}
