'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    AlertTriangle,
    Phone,
    ChevronRight,
    ChevronDown,
    Heart,
    Flame,
    Bug,
    Activity,
    HelpCircle,
    AlertCircle,
    X
} from 'lucide-react';
import { FIRST_AID_GUIDES } from '@/lib/uspData';

interface FirstAidGuideProps {
    language?: string;
}

export default function FirstAidGuide({ language = 'en' }: FirstAidGuideProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGuide, setSelectedGuide] = useState<typeof FIRST_AID_GUIDES[0] | null>(null);
    const [expandedStep, setExpandedStep] = useState<number | null>(null);

    const categoryIcons: Record<string, any> = {
        cardiac: Heart,
        choking: AlertCircle,
        burn: Flame,
        injury: Activity,
        poisoning: Bug,
        emergency: AlertTriangle,
        general: HelpCircle,
    };

    const categoryColors: Record<string, string> = {
        cardiac: 'bg-red-100 text-red-600 border-red-200',
        choking: 'bg-orange-100 text-orange-600 border-orange-200',
        burn: 'bg-yellow-100 text-yellow-600 border-yellow-200',
        injury: 'bg-blue-100 text-blue-600 border-blue-200',
        poisoning: 'bg-purple-100 text-purple-600 border-purple-200',
        emergency: 'bg-red-100 text-red-600 border-red-200',
        general: 'bg-green-100 text-green-600 border-green-200',
    };

    const filteredGuides = FIRST_AID_GUIDES.filter(guide =>
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isHindi = language === 'hi';

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <AlertTriangle className="w-7 h-7" />
                    {isHindi ? 'प्राथमिक चिकित्सा गाइड' : 'First Aid Guide'}
                </h2>
                <p className="text-red-100 mt-1">
                    {isHindi ? 'आपातकालीन स्थितियों के लिए त्वरित मार्गदर्शिका' : 'Quick reference for emergency situations'}
                </p>

                {/* Emergency Call Button */}
                <a
                    href="tel:108"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white text-red-600 rounded-full font-semibold hover:bg-red-50 transition-colors"
                >
                    <Phone className="w-5 h-5" />
                    {isHindi ? 'आपातकालीन कॉल 108' : 'Emergency Call 108'}
                </a>
            </div>

            <div className="p-6">
                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isHindi ? 'खोजें... (जैसे CPR, जलना, रक्तस्राव)' : 'Search... (e.g., CPR, burns, bleeding)'}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                </div>

                {/* Guide List */}
                {!selectedGuide && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredGuides.map((guide) => {
                            const Icon = categoryIcons[guide.category] || HelpCircle;
                            return (
                                <motion.button
                                    key={guide.id}
                                    onClick={() => setSelectedGuide(guide)}
                                    className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left hover:shadow-md transition-all ${categoryColors[guide.category]}`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="p-3 bg-white rounded-lg shadow-sm">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {isHindi && guide.titleHindi ? guide.titleHindi : guide.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${guide.severity === 'critical' ? 'bg-red-500 text-white' :
                                                guide.severity === 'high' ? 'bg-orange-500 text-white' :
                                                    guide.severity === 'medium' ? 'bg-yellow-500 text-white' :
                                                        'bg-green-500 text-white'
                                                }`}>
                                                {guide.severity.toUpperCase()}
                                            </span>
                                            {guide.callEmergency && (
                                                <span className="flex items-center gap-1 text-xs text-red-600">
                                                    <Phone className="w-3 h-3" /> Call 108
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </motion.button>
                            );
                        })}
                    </div>
                )}

                {/* Selected Guide Detail */}
                <AnimatePresence>
                    {selectedGuide && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Back Button */}
                            <button
                                onClick={() => { setSelectedGuide(null); setExpandedStep(null); }}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                            >
                                <X className="w-4 h-4" />
                                {isHindi ? 'वापस जाएं' : 'Back to list'}
                            </button>

                            {/* Title */}
                            <div className={`p-4 rounded-xl border-2 mb-6 ${categoryColors[selectedGuide.category]}`}>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {isHindi && selectedGuide.titleHindi ? selectedGuide.titleHindi : selectedGuide.title}
                                </h3>
                                {selectedGuide.callEmergency && (
                                    <div className="flex items-center gap-2 mt-2 text-red-600">
                                        <Phone className="w-5 h-5 animate-pulse" />
                                        <span className="font-semibold">
                                            {isHindi ? 'तुरंत 108 पर कॉल करें!' : 'Call 108 immediately!'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Steps */}
                            <div className="space-y-3 mb-6">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                    📋 {isHindi ? 'क्या करें:' : 'Steps to Follow:'}
                                </h4>
                                {selectedGuide.steps.map((step) => (
                                    <motion.div
                                        key={step.step}
                                        className="border rounded-lg overflow-hidden"
                                        initial={false}
                                    >
                                        <button
                                            onClick={() => setExpandedStep(expandedStep === step.step ? null : step.step)}
                                            className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50"
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                                                {step.step}
                                            </div>
                                            <span className="flex-1 font-medium">
                                                {isHindi && step.instructionHindi ? step.instructionHindi : step.instruction}
                                            </span>
                                            <ChevronDown className={`w-5 h-5 transition-transform ${expandedStep === step.step ? 'rotate-180' : ''
                                                }`} />
                                        </button>

                                        <AnimatePresence>
                                            {expandedStep === step.step && 'warning' in step && step.warning && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="px-4 pb-4"
                                                >
                                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-start gap-2">
                                                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                        <span>{step.warning as string}</span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Do NOT List */}
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <h4 className="font-semibold text-red-700 flex items-center gap-2 mb-3">
                                    ⛔ {isHindi ? 'क्या न करें:' : 'DO NOT:'}
                                </h4>
                                <ul className="space-y-2">
                                    {selectedGuide.doNot.map((item, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                                            <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Emergency Call CTA */}
                            {selectedGuide.callEmergency && (
                                <div className="mt-6">
                                    <a
                                        href="tel:108"
                                        className="flex items-center justify-center gap-3 w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-colors animate-pulse"
                                    >
                                        <Phone className="w-6 h-6" />
                                        {isHindi ? 'आपातकालीन सेवाओं को कॉल करें (108)' : 'CALL EMERGENCY SERVICES (108)'}
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
