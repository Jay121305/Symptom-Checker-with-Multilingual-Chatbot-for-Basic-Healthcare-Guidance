'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Upload, Loader2, AlertTriangle,
    CheckCircle, ArrowLeft, Info, X, Shield, Eye, Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { DermatologyResult } from '@/lib/geminiVision';

interface DermatologyTriageProps {
    language: string;
    onClose: () => void;
}

const BODY_LOCATIONS = [
    { id: 'face', en: 'Face', hi: 'चेहरा' },
    { id: 'scalp', en: 'Scalp', hi: 'खोपड़ी' },
    { id: 'neck', en: 'Neck', hi: 'गर्दन' },
    { id: 'chest', en: 'Chest', hi: 'छाती' },
    { id: 'back', en: 'Back', hi: 'पीठ' },
    { id: 'arms', en: 'Arms', hi: 'बाहें' },
    { id: 'hands', en: 'Hands', hi: 'हाथ' },
    { id: 'legs', en: 'Legs', hi: 'पैर' },
    { id: 'feet', en: 'Feet', hi: 'पंजे' },
    { id: 'groin', en: 'Groin Area', hi: 'जांघ क्षेत्र' },
    { id: 'abdomen', en: 'Abdomen', hi: 'पेट' },
    { id: 'other', en: 'Other', hi: 'अन्य' },
];

const T: Record<string, Record<string, string>> = {
    title: { en: 'Skin Condition Triage', hi: 'त्वचा स्थिति ट्राइएज' },
    subtitle: { en: 'AI-powered preliminary skin assessment', hi: 'AI-संचालित प्रारंभिक त्वचा आकलन' },
    selectLocation: { en: 'Where is the skin problem?', hi: 'त्वचा की समस्या कहाँ है?' },
    uploadPhoto: { en: 'Upload a clear photo of the affected area', hi: 'प्रभावित क्षेत्र की एक स्पष्ट फोटो अपलोड करें' },
    takePhoto: { en: 'Take Photo', hi: 'फोटो लें' },
    chooseFile: { en: 'Choose File', hi: 'फ़ाइल चुनें' },
    analyzing: { en: 'Analyzing skin condition...', hi: 'त्वचा की स्थिति का विश्लेषण...' },
    analyze: { en: 'Analyze Skin', hi: 'त्वचा विश्लेषण' },
    results: { en: 'Assessment Results', hi: 'आकलन परिणाम' },
    description: { en: 'Visual Description', hi: 'दृश्य विवरण' },
    possibleConditions: { en: 'Possible Conditions', hi: 'संभावित स्थितियाँ' },
    homeCare: { en: 'Home Care Advice', hi: 'घरेलू देखभाल सलाह' },
    warningSligns: { en: 'Warning Signs to Watch', hi: 'चेतावनी के संकेत' },
    prevention: { en: 'Prevention Tips', hi: 'रोकथाम के उपाय' },
    disclaimer: { en: '⚠️ PRELIMINARY ASSESSMENT ONLY. This is NOT a diagnosis. Please consult a dermatologist.', hi: '⚠️ केवल प्रारंभिक आकलन। यह निदान नहीं है। कृपया त्वचा विशेषज्ञ से मिलें।' },
    tryAgain: { en: 'Analyze Another', hi: 'एक और विश्लेषण करें' },
    photoTips: { en: 'Photo Tips: Use good lighting, keep camera steady, capture the entire affected area', hi: 'फोटो सुझाव: अच्छी रोशनी में, कैमरा स्थिर रखें, पूरा प्रभावित क्षेत्र कैप्चर करें' },
};

function t(key: string, lang: string): string {
    return T[key]?.[lang] || T[key]?.['en'] || key;
}

export default function DermatologyTriage({ language, onClose }: DermatologyTriageProps) {
    const [bodyLocation, setBodyLocation] = useState<string>('');
    const [image, setImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<DermatologyResult | null>(null);
    const [mimeType, setMimeType] = useState<string>('image/jpeg');
    const [step, setStep] = useState<'location' | 'upload' | 'results'>('location');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) { toast.error('Please upload an image'); return; }
        if (file.size > 10 * 1024 * 1024) { toast.error('File too large. Max 10MB.'); return; }
        setMimeType(file.type);
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setImagePreview(dataUrl);
            setImage(dataUrl.split(',')[1]);
        };
        reader.readAsDataURL(file);
    };

    const analyzeSkin = async () => {
        if (!image) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/vision-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'dermatology', image, mimeType, language, bodyLocation }),
            });
            if (!response.ok) throw new Error('Failed');
            const data = await response.json();
            setResult(data);
            setStep('results');
            toast.success(language === 'hi' ? '✅ विश्लेषण पूरा' : '✅ Analysis complete');
        } catch (error) {
            console.error(error);
            toast.error(language === 'hi' ? 'विश्लेषण विफल' : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getUrgencyColor = (u: string) => {
        switch (u) {
            case 'self-care': return 'bg-green-100 text-green-800 border-green-300';
            case 'see-doctor-soon': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'see-doctor-urgently': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'emergency': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getUrgencyLabel = (u: string) => {
        const labels: Record<string, Record<string, string>> = {
            'self-care': { en: '🏠 Self-Care', hi: '🏠 स्व-देखभाल' },
            'see-doctor-soon': { en: '🏥 See Doctor Soon', hi: '🏥 जल्द डॉक्टर से मिलें' },
            'see-doctor-urgently': { en: '⚠️ See Doctor Urgently', hi: '⚠️ तुरंत डॉक्टर से मिलें' },
            'emergency': { en: '🚨 Emergency', hi: '🚨 आपातकाल' },
        };
        return labels[u]?.[language] || labels[u]?.['en'] || u;
    };

    const getLikelihoodColor = (l: string) => {
        switch (l) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'low': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{t('title', language)}</h2>
                                <p className="text-rose-100 text-sm">{t('subtitle', language)}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Select Body Location */}
                        {step === 'location' && (
                            <motion.div key="location" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                <h3 className="font-bold text-gray-900 text-lg">{t('selectLocation', language)}</h3>
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                    {BODY_LOCATIONS.map((loc) => (
                                        <button key={loc.id} onClick={() => { setBodyLocation(loc.id); setStep('upload'); }}
                                            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all hover:border-rose-400 hover:bg-rose-50 ${bodyLocation === loc.id ? 'border-rose-500 bg-rose-50' : 'border-gray-200'}`}>
                                            {language === 'hi' ? loc.hi : loc.en}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Upload Photo */}
                        {step === 'upload' && (
                            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                <button onClick={() => setStep('location')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                                    <ArrowLeft className="w-4 h-4" />{t('tryAgain', language)}
                                </button>

                                <div className="bg-rose-50 rounded-xl p-3 text-sm text-rose-700 flex items-start gap-2">
                                    <Camera className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    {t('photoTips', language)}
                                </div>

                                <h3 className="font-bold text-gray-900">{t('uploadPhoto', language)}</h3>

                                {imagePreview ? (
                                    <div className="space-y-4">
                                        <img src={imagePreview} alt="Skin condition" className="max-h-64 mx-auto rounded-lg shadow-md" />
                                        <div className="flex gap-3 justify-center">
                                            <button onClick={() => { setImage(null); setImagePreview(null); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Change Photo</button>
                                            <button onClick={analyzeSkin} disabled={isAnalyzing} className="px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
                                                {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" />{t('analyzing', language)}</> : <><Eye className="w-4 h-4" />{t('analyze', language)}</>}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-3 justify-center">
                                        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                        <button onClick={() => cameraInputRef.current?.click()} className="px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 flex items-center gap-2">
                                            <Camera className="w-5 h-5" />{t('takePhoto', language)}
                                        </button>
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                        <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2">
                                            <Upload className="w-5 h-5" />{t('chooseFile', language)}
                                        </button>
                                    </div>
                                )}

                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mt-4">
                                    <p className="text-sm text-amber-700 flex items-start gap-2"><Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />{t('disclaimer', language)}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Results */}
                        {step === 'results' && result && (
                            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                {/* Urgency Badge */}
                                <div className={`p-4 rounded-xl border-2 ${getUrgencyColor(result.urgency)}`}>
                                    <span className="font-bold text-lg">{getUrgencyLabel(result.urgency)}</span>
                                    {result.shouldSeeSpecialist && (
                                        <p className="text-sm mt-1 opacity-80">{language === 'hi' ? 'त्वचा विशेषज्ञ से मिलने की सलाह' : 'Specialist consultation recommended'}</p>
                                    )}
                                </div>

                                {/* Visual Description */}
                                {result.visualDescription && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Eye className="w-4 h-4 text-rose-500" />{t('description', language)}</h3>
                                        <p className="text-sm text-gray-700">{result.visualDescription}</p>
                                    </div>
                                )}

                                {/* Possible Conditions */}
                                {result.possibleConditions.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3">{t('possibleConditions', language)}</h3>
                                        <div className="space-y-3">
                                            {result.possibleConditions.map((cond, idx) => (
                                                <div key={idx} className="border rounded-xl p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-gray-900">{cond.name}</span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLikelihoodColor(cond.likelihood)}`}>
                                                            {cond.likelihood.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600">{cond.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Home Care */}
                                {result.homeCareAdvice.length > 0 && (
                                    <div className="bg-green-50 rounded-xl p-4">
                                        <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2"><Heart className="w-4 h-4" />{t('homeCare', language)}</h3>
                                        <ul className="space-y-1">
                                            {result.homeCareAdvice.map((a, i) => (
                                                <li key={i} className="text-sm text-green-800 flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{a}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Warning Signs */}
                                {result.warningSignsToWatch.length > 0 && (
                                    <div className="bg-red-50 rounded-xl p-4">
                                        <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{t('warningSligns', language)}</h3>
                                        <ul className="space-y-1">
                                            {result.warningSignsToWatch.map((w, i) => (
                                                <li key={i} className="text-sm text-red-800 flex items-start gap-2"><span className="text-red-500">⚠</span>{w}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Prevention */}
                                {result.preventionTips.length > 0 && (
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <h3 className="font-bold text-blue-900 mb-2">{t('prevention', language)}</h3>
                                        <ul className="space-y-1">
                                            {result.preventionTips.map((p, i) => (
                                                <li key={i} className="text-sm text-blue-800 flex items-start gap-2"><span className="text-blue-500">💡</span>{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Disclaimer */}
                                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                                    <p className="text-sm text-amber-800 font-medium">{result.disclaimer || t('disclaimer', language)}</p>
                                </div>

                                {/* Actions */}
                                <button onClick={() => { setResult(null); setImage(null); setImagePreview(null); setStep('location'); }}
                                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 flex items-center justify-center gap-2">
                                    <ArrowLeft className="w-4 h-4" />{t('tryAgain', language)}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
