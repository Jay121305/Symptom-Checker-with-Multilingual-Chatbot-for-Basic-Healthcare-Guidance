'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Phone, Send, Mic, Image, Paperclip,
    Check, CheckCheck, ArrowLeft, MoreVertical, Search,
    Camera, Smile, Volume2, PhoneCall
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read';
    isVoice?: boolean;
}

interface WhatsAppBotProps {
    language: string;
    onClose: () => void;
}

const WHATSAPP_TRANSLATIONS: Record<string, {
    title: string;
    subtitle: string;
    placeholder: string;
    greeting: string;
}> = {
    'en': {
        title: 'DeepBlue Health',
        subtitle: 'AI Health Assistant • Active now',
        placeholder: 'Type a message',
        greeting: "👋 Welcome to DeepBlue Health! I'm your AI health assistant. You can:\n\n• Describe your symptoms\n• Ask about medicines\n• Get first aid tips\n• Find nearby hospitals\n\nHow can I help you today?",
    },
    'hi': {
        title: 'डीपब्लू हेल्थ',
        subtitle: 'AI स्वास्थ्य सहायक • अभी ऑनलाइन',
        placeholder: 'संदेश लिखें',
        greeting: "👋 डीपब्लू हेल्थ में आपका स्वागत है! मैं आपका AI स्वास्थ्य सहायक हूं। आप:\n\n• अपने लक्षण बता सकते हैं\n• दवाओं के बारे में पूछ सकते हैं\n• प्राथमिक उपचार की सलाह ले सकते हैं\n• नजदीकी अस्पताल खोज सकते हैं\n\nमैं आज आपकी कैसे मदद कर सकता हूं?",
    },
    'ta': {
        title: 'டீப்ப்ளூ ஹெல்த்',
        subtitle: 'AI சுகாதார உதவியாளர் • இப்போது ஆன்லைன்',
        placeholder: 'செய்தி எழுதுங்கள்',
        greeting: "👋 டீப்ப்ளூ ஹெல்த்திற்கு வரவேற்கிறோம்! நான் உங்கள் AI சுகாதார உதவியாளர். நீங்கள்:\n\n• உங்கள் அறிகுறிகளை விவரிக்கலாம்\n• மருந்துகள் பற்றி கேட்கலாம்\n• முதலுதவி குறிப்புகள் பெறலாம்\n• அருகிலுள்ள மருத்துவமனைகளைக் கண்டறியலாம்\n\nஇன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    },
};

export default function WhatsAppBot({ language, onClose }: WhatsAppBotProps) {
    const t = WHATSAPP_TRANSLATIONS[language] || WHATSAPP_TRANSLATIONS['en'];

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: t.greeting,
            sender: 'bot',
            timestamp: new Date(),
            status: 'read',
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date(),
            status: 'sent',
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate delivery
        setTimeout(() => {
            setMessages(prev => prev.map(m =>
                m.id === userMessage.id ? { ...m, status: 'delivered' } : m
            ));
        }, 500);

        // Get AI response
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    language,
                    context: {},
                }),
            });

            const data = await response.json();

            setMessages(prev => prev.map(m =>
                m.id === userMessage.id ? { ...m, status: 'read' } : m
            ));

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response,
                sender: 'bot',
                timestamp: new Date(),
                status: 'read',
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            toast.error('Failed to get response');
        } finally {
            setIsTyping(false);
        }
    };

    const speakMessage = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'read':
                return <CheckCheck className="w-4 h-4 text-blue-400" />;
            case 'delivered':
                return <CheckCheck className="w-4 h-4 text-gray-400" />;
            default:
                return <Check className="w-4 h-4 text-gray-400" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0b141a] z-50 flex flex-col">
            {/* WhatsApp-style Header */}
            <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3">
                <button onClick={onClose} className="p-1">
                    <ArrowLeft className="w-6 h-6 text-gray-300" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h1 className="text-white font-semibold">{t.title}</h1>
                    <p className="text-xs text-green-400">{t.subtitle}</p>
                </div>
                <button className="p-2">
                    <PhoneCall className="w-5 h-5 text-gray-300" />
                </button>
                <button className="p-2">
                    <MoreVertical className="w-5 h-5 text-gray-300" />
                </button>
            </div>

            {/* Chat Area */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-2"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    backgroundColor: '#0b141a'
                }}
            >
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-lg px-3 py-2 relative ${message.sender === 'user'
                                        ? 'bg-[#005c4b] text-white'
                                        : 'bg-[#202c33] text-white'
                                    }`}
                            >
                                {/* Tail */}
                                <div
                                    className={`absolute top-0 w-3 h-3 ${message.sender === 'user'
                                            ? 'right-0 -mr-1 bg-[#005c4b]'
                                            : 'left-0 -ml-1 bg-[#202c33]'
                                        }`}
                                    style={{
                                        clipPath: message.sender === 'user'
                                            ? 'polygon(0 0, 100% 0, 0 100%)'
                                            : 'polygon(100% 0, 0 0, 100% 100%)'
                                    }}
                                />

                                <p className="text-sm whitespace-pre-wrap">{message.text}</p>

                                <div className="flex items-center justify-end gap-1 mt-1">
                                    <span className="text-[10px] text-gray-400">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {message.sender === 'user' && getStatusIcon(message.status)}
                                    {message.sender === 'bot' && (
                                        <button
                                            onClick={() => speakMessage(message.text)}
                                            className="ml-1 p-1 hover:bg-white/10 rounded"
                                        >
                                            <Volume2 className="w-3 h-3 text-gray-400" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-[#202c33] rounded-lg px-4 py-3">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-[#202c33] p-3">
                <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400">
                        <Smile className="w-6 h-6" />
                    </button>
                    <button className="p-2 text-gray-400">
                        <Paperclip className="w-6 h-6" />
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={t.placeholder}
                        className="flex-1 bg-[#2a3942] text-white px-4 py-2 rounded-full focus:outline-none placeholder-gray-500"
                    />

                    {input.trim() ? (
                        <button
                            onClick={handleSend}
                            className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center"
                        >
                            <Send className="w-5 h-5 text-white" />
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsRecording(!isRecording)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-[#00a884]'
                                }`}
                        >
                            <Mic className="w-5 h-5 text-white" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
