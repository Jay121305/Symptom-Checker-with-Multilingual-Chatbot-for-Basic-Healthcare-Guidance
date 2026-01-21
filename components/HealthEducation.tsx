'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Clock,
    ChevronRight,
    Search,
    X,
    Volume2,
    VolumeX
} from 'lucide-react';
import { HEALTH_ARTICLES } from '@/lib/uspData';

interface HealthEducationProps {
    language?: string;
}

export default function HealthEducation({ language = 'en' }: HealthEducationProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState<typeof HEALTH_ARTICLES[0] | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const isHindi = language === 'hi';

    const filteredArticles = HEALTH_ARTICLES.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const speakContent = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text.replace(/[#*]/g, ''));
            utterance.lang = isHindi ? 'hi-IN' : 'en-US';
            utterance.rate = 0.9;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    const stopSpeaking = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Chronic Disease': 'bg-red-100 text-red-700',
            'Seasonal': 'bg-blue-100 text-blue-700',
            'Child Health': 'bg-green-100 text-green-700',
            'Nutrition': 'bg-orange-100 text-orange-700',
            'Mental Health': 'bg-purple-100 text-purple-700',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <BookOpen className="w-7 h-7" />
                    {isHindi ? 'स्वास्थ्य शिक्षा' : 'Health Education'}
                </h2>
                <p className="text-teal-100 mt-1">
                    {isHindi
                        ? 'स्वास्थ्य के बारे में जानकारी और टिप्स'
                        : 'Learn about health and wellness'
                    }
                </p>
            </div>

            <div className="p-6">
                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isHindi ? 'लेख खोजें...' : 'Search articles...'}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                </div>

                {/* Article List */}
                {!selectedArticle && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredArticles.map((article) => (
                            <motion.button
                                key={article.id}
                                onClick={() => setSelectedArticle(article)}
                                className="flex flex-col items-start p-4 border-2 rounded-xl text-left hover:border-teal-500 hover:shadow-md transition-all"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <span className={`px-3 py-1 rounded-full text-xs font-medium mb-3 ${getCategoryColor(article.category)}`}>
                                    {article.category}
                                </span>
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    {isHindi && article.titleHindi ? article.titleHindi : article.title}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {article.readTime} min read
                                    </span>
                                    <ChevronRight className="w-4 h-4 ml-auto text-teal-500" />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Article Detail */}
                <AnimatePresence>
                    {selectedArticle && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Back Button */}
                            <div className="flex items-center justify-between mb-4">
                                <button
                                    onClick={() => { setSelectedArticle(null); stopSpeaking(); }}
                                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                                >
                                    <X className="w-4 h-4" />
                                    {isHindi ? 'वापस जाएं' : 'Back to articles'}
                                </button>

                                {/* Text to Speech */}
                                <button
                                    onClick={() => {
                                        if (isSpeaking) {
                                            stopSpeaking();
                                        } else {
                                            const content = isHindi && selectedArticle.contentHindi
                                                ? selectedArticle.contentHindi
                                                : selectedArticle.content;
                                            speakContent(content);
                                        }
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isSpeaking
                                            ? 'bg-red-500 text-white animate-pulse'
                                            : 'bg-teal-500 text-white hover:bg-teal-600'
                                        }`}
                                >
                                    {isSpeaking ? (
                                        <>
                                            <VolumeX className="w-4 h-4" />
                                            {isHindi ? 'रोकें' : 'Stop'}
                                        </>
                                    ) : (
                                        <>
                                            <Volume2 className="w-4 h-4" />
                                            {isHindi ? 'सुनें' : 'Listen'}
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Article Content */}
                            <article className="prose prose-teal max-w-none">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${getCategoryColor(selectedArticle.category)}`}>
                                    {selectedArticle.category}
                                </span>

                                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                    {isHindi && selectedArticle.titleHindi ? selectedArticle.titleHindi : selectedArticle.title}
                                </h1>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {selectedArticle.readTime} min read
                                    </span>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-6 whitespace-pre-wrap text-gray-700 leading-relaxed">
                                    {(isHindi && selectedArticle.contentHindi
                                        ? selectedArticle.contentHindi
                                        : selectedArticle.content
                                    ).split('\n').map((paragraph, index) => {
                                        if (paragraph.startsWith('**')) {
                                            return (
                                                <h3 key={index} className="font-bold text-gray-900 mt-4 mb-2">
                                                    {paragraph.replace(/\*\*/g, '')}
                                                </h3>
                                            );
                                        }
                                        if (paragraph.startsWith('-')) {
                                            return (
                                                <li key={index} className="ml-4">
                                                    {paragraph.substring(1).trim()}
                                                </li>
                                            );
                                        }
                                        return <p key={index} className="mb-2">{paragraph}</p>;
                                    })}
                                </div>
                            </article>

                            {/* Tip */}
                            <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-700">
                                💡 {isHindi
                                    ? 'अधिक जानकारी के लिए अपने नजदीकी PHC या ASHA कार्यकर्ता से संपर्क करें।'
                                    : 'Contact your nearest PHC or ASHA worker for more information.'
                                }
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty State */}
                {filteredArticles.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>{isHindi ? 'कोई लेख नहीं मिला' : 'No articles found'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
