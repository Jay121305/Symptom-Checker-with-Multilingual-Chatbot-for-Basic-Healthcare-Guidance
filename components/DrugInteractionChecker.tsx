'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Loader2, Plus, Trash2,
    X, Shield, CheckCircle, Coffee, Clock, Pill
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { DrugInteractionResult } from '@/lib/geminiVision';

interface DrugInteractionCheckerProps {
    language: string;
    onClose: () => void;
}

const T: Record<string, Record<string, string>> = {
    title: { en: 'Drug Interaction Checker', hi: 'दवा इंटरैक्शन चेकर' },
    subtitle: { en: 'Check for interactions between your medications', hi: 'अपनी दवाओं के बीच इंटरैक्शन जाँचें' },
    addMedicine: { en: 'Add Medicine', hi: 'दवा जोड़ें' },
    placeholder: { en: 'Enter medicine name...', hi: 'दवा का नाम दर्ज करें...' },
    check: { en: 'Check Interactions', hi: 'इंटरैक्शन जाँचें' },
    checking: { en: 'Analyzing interactions...', hi: 'इंटरैक्शन का विश्लेषण...' },
    medications: { en: 'Your Medications', hi: 'आपकी दवाएं' },
    results: { en: 'Interaction Results', hi: 'इंटरैक्शन परिणाम' },
    overallSafety: { en: 'Overall Safety', hi: 'समग्र सुरक्षा' },
    interactions: { en: 'Drug Interactions', hi: 'दवा इंटरैक्शन' },
    foodInteractions: { en: 'Food Interactions', hi: 'भोजन इंटरैक्शन' },
    timingAdvice: { en: 'Timing Advice', hi: 'समय संबंधी सलाह' },
    generalAdvice: { en: 'General Advice', hi: 'सामान्य सलाह' },
    noInteractions: { en: 'No significant interactions found', hi: 'कोई महत्वपूर्ण इंटरैक्शन नहीं मिला' },
    minTwo: { en: 'Add at least 2 medicines to check interactions', hi: 'इंटरैक्शन जाँचने के लिए कम से कम 2 दवाएं जोड़ें' },
    disclaimer: { en: '⚠️ This is AI-generated guidance only. Always consult your doctor or pharmacist before changing any medication.', hi: '⚠️ यह केवल AI-जनित मार्गदर्शन है। कोई भी दवा बदलने से पहले अपने डॉक्टर या फार्मासिस्ट से सलाह लें।' },
    tryAgain: { en: 'Check Again', hi: 'फिर से जाँचें' },
};

function t(key: string, lang: string): string {
    return T[key]?.[lang] || T[key]?.['en'] || key;
}

const COMMON_MEDICINES = [
    'Paracetamol', 'Ibuprofen', 'Aspirin', 'Metformin', 'Amlodipine',
    'Omeprazole', 'Atorvastatin', 'Losartan', 'Amoxicillin', 'Cetirizine',
    'Clopidogrel', 'Metoprolol', 'Ranitidine', 'Azithromycin', 'Pantoprazole',
    'Diclofenac', 'Montelukast', 'Dolo 650', 'Crocin', 'Combiflam',
];

export default function DrugInteractionChecker({ language, onClose }: DrugInteractionCheckerProps) {
    const [medications, setMedications] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [result, setResult] = useState<DrugInteractionResult | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const addMedicine = (name?: string) => {
        const med = (name || inputValue).trim();
        if (!med) return;
        if (medications.includes(med)) { toast.error('Already added'); return; }
        if (medications.length >= 10) { toast.error('Maximum 10 medicines'); return; }
        setMedications([...medications, med]);
        setInputValue('');
        setShowSuggestions(false);
    };

    const removeMedicine = (idx: number) => {
        setMedications(medications.filter((_, i) => i !== idx));
    };

    const checkInteractions = async () => {
        if (medications.length < 2) { toast.error(t('minTwo', language)); return; }
        setIsChecking(true);
        try {
            const response = await fetch('/api/vision-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'drug-interaction', medications, language }),
            });
            if (!response.ok) throw new Error('Failed');
            const data = await response.json();
            setResult(data);
            toast.success(language === 'hi' ? '✅ विश्लेषण पूरा' : '✅ Analysis complete');
        } catch (error) {
            console.error(error);
            toast.error(language === 'hi' ? 'विश्लेषण विफल' : 'Analysis failed');
        } finally {
            setIsChecking(false);
        }
    };

    const getSeverityColor = (s: string) => {
        switch (s) {
            case 'mild': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'severe': return 'bg-red-100 text-red-800 border-red-300';
            case 'contraindicated': return 'bg-red-200 text-red-900 border-red-500';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getSeverityIcon = (s: string) => {
        switch (s) {
            case 'mild': return '⚡';
            case 'moderate': return '⚠️';
            case 'severe': return '🔴';
            case 'contraindicated': return '🚫';
            default: return 'ℹ️';
        }
    };

    const getSafetyColor = (s: string) => {
        switch (s) {
            case 'safe': return 'bg-green-100 text-green-800 border-green-400';
            case 'caution': return 'bg-yellow-100 text-yellow-800 border-yellow-400';
            case 'warning': return 'bg-orange-100 text-orange-800 border-orange-400';
            case 'danger': return 'bg-red-100 text-red-800 border-red-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getSafetyLabel = (s: string) => {
        const labels: Record<string, Record<string, string>> = {
            'safe': { en: '✅ Safe to Take Together', hi: '✅ एक साथ लेना सुरक्षित' },
            'caution': { en: '⚡ Use with Caution', hi: '⚡ सावधानी से लें' },
            'warning': { en: '⚠️ Significant Interactions Found', hi: '⚠️ महत्वपूर्ण इंटरैक्शन मिले' },
            'danger': { en: '🚫 Dangerous Combination', hi: '🚫 खतरनाक संयोजन' },
        };
        return labels[s]?.[language] || labels[s]?.['en'] || s;
    };

    const filteredSuggestions = COMMON_MEDICINES
        .filter(m => m.toLowerCase().includes(inputValue.toLowerCase()) && !medications.includes(m))
        .slice(0, 5);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{t('title', language)}</h2>
                                <p className="text-amber-100 text-sm">{t('subtitle', language)}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {!result ? (
                        <div className="space-y-5">
                            {/* Medicine Input */}
                            <div className="relative">
                                <h3 className="font-bold text-gray-900 mb-2">{t('medications', language)}</h3>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
                                            onKeyDown={(e) => e.key === 'Enter' && addMedicine()}
                                            onFocus={() => setShowSuggestions(true)}
                                            placeholder={t('placeholder', language)}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:outline-none text-gray-900"
                                        />
                                        {/* Suggestions Dropdown */}
                                        {showSuggestions && inputValue.length > 0 && filteredSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 mt-1">
                                                {filteredSuggestions.map((s, i) => (
                                                    <button key={i} onClick={() => addMedicine(s)}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-amber-50 text-gray-700 flex items-center gap-2">
                                                        <Pill className="w-3 h-3 text-amber-500" />{s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => addMedicine()} className="px-4 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 flex items-center gap-1">
                                        <Plus className="w-5 h-5" />{t('addMedicine', language)}
                                    </button>
                                </div>
                            </div>

                            {/* Medications List */}
                            {medications.length > 0 && (
                                <div className="space-y-2">
                                    <AnimatePresence>
                                        {medications.map((med, idx) => (
                                            <motion.div
                                                key={med} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                                className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center text-sm font-bold text-amber-800">{idx + 1}</span>
                                                    <span className="font-medium text-gray-900">{med}</span>
                                                </div>
                                                <button onClick={() => removeMedicine(idx)} className="p-1 hover:bg-red-100 rounded-full text-red-400 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Check Button */}
                            <button onClick={checkInteractions} disabled={medications.length < 2 || isChecking}
                                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg disabled:opacity-50 flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all">
                                {isChecking ? <><Loader2 className="w-5 h-5 animate-spin" />{t('checking', language)}</> : <><Shield className="w-5 h-5" />{t('check', language)}</>}
                            </button>

                            {medications.length < 2 && (
                                <p className="text-sm text-gray-400 text-center">{t('minTwo', language)}</p>
                            )}

                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-700">{t('disclaimer', language)}</p>
                            </div>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                            {/* Overall Safety */}
                            <div className={`p-5 rounded-xl border-2 ${getSafetyColor(result.overallSafety)}`}>
                                <p className="text-xl font-bold">{getSafetyLabel(result.overallSafety)}</p>
                            </div>

                            {/* Interactions */}
                            {result.interactions.length > 0 ? (
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3">{t('interactions', language)}</h3>
                                    <div className="space-y-3">
                                        {result.interactions.map((inter, idx) => (
                                            <div key={idx} className={`border-2 rounded-xl p-4 ${getSeverityColor(inter.severity)}`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{getSeverityIcon(inter.severity)}</span>
                                                        <span className="font-bold">{inter.drug1} × {inter.drug2}</span>
                                                    </div>
                                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase opacity-80 border">{inter.severity}</span>
                                                </div>
                                                <p className="text-sm">{inter.effect}</p>
                                                {inter.recommendation && (
                                                    <p className="text-sm mt-2 opacity-80 flex items-start gap-1">
                                                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{inter.recommendation}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                    <p className="font-medium text-green-800">{t('noInteractions', language)}</p>
                                </div>
                            )}

                            {/* Food Interactions */}
                            {result.foodInteractions.length > 0 && (
                                <div className="bg-orange-50 rounded-xl p-4">
                                    <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2"><Coffee className="w-4 h-4" />{t('foodInteractions', language)}</h4>
                                    <ul className="space-y-1">
                                        {result.foodInteractions.map((f, i) => (
                                            <li key={i} className="text-sm text-orange-800 flex items-start gap-2"><span>🍽️</span>{f}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Timing Advice */}
                            {result.timingAdvice.length > 0 && (
                                <div className="bg-blue-50 rounded-xl p-4">
                                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Clock className="w-4 h-4" />{t('timingAdvice', language)}</h4>
                                    <ul className="space-y-1">
                                        {result.timingAdvice.map((ta, i) => (
                                            <li key={i} className="text-sm text-blue-800 flex items-start gap-2"><span>⏰</span>{ta.medication}: {ta.bestTime}{ta.withFood ? ' (with food)' : ' (empty stomach)'}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* General Advice */}
                            {result.generalAdvice.length > 0 && (
                                <div className="bg-green-50 rounded-xl p-4">
                                    <h4 className="font-bold text-green-900 mb-2">{t('generalAdvice', language)}</h4>
                                    <ul className="space-y-1">
                                        {result.generalAdvice.map((ga, i) => (
                                            <li key={i} className="text-sm text-green-800 flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{ga}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Disclaimer */}
                            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                                <p className="text-sm text-amber-800 font-medium">{t('disclaimer', language)}</p>
                            </div>

                            {/* Try Again */}
                            <button onClick={() => { setResult(null); setMedications([]); }}
                                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 flex items-center justify-center gap-2">
                                {t('tryAgain', language)}
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
