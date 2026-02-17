'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Upload, Loader2, AlertTriangle, Pill,
    CheckCircle, ArrowLeft, X, Shield, Info, DollarSign, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { MedicineIdentifyResult } from '@/lib/geminiVision';

interface MedicineIdentifierProps {
    language: string;
    onClose: () => void;
}

const T: Record<string, Record<string, string>> = {
    title: { en: 'Medicine Identifier', hi: 'दवा पहचानकर्ता' },
    subtitle: { en: 'Identify any medicine from a photo', hi: 'फोटो से कोई भी दवा पहचानें' },
    uploadPhoto: { en: 'Take a clear photo of the medicine, pill, or packaging', hi: 'दवा, गोली, या पैकेजिंग की स्पष्ट फोटो लें' },
    takePhoto: { en: 'Take Photo', hi: 'फोटो लें' },
    chooseFile: { en: 'Choose File', hi: 'फ़ाइल चुनें' },
    analyzing: { en: 'Identifying medicine...', hi: 'दवा की पहचान हो रही है...' },
    identify: { en: 'Identify Medicine', hi: 'दवा पहचानें' },
    name: { en: 'Medicine Name', hi: 'दवा का नाम' },
    generic: { en: 'Generic Name', hi: 'जेनेरिक नाम' },
    category: { en: 'Category', hi: 'श्रेणी' },
    composition: { en: 'Composition', hi: 'संरचना' },
    primaryUse: { en: 'Primary Use', hi: 'मुख्य उपयोग' },
    dosage: { en: 'Dosage Information', hi: 'खुराक की जानकारी' },
    sideEffects: { en: 'Side Effects', hi: 'दुष्प्रभाव' },
    warnings: { en: 'Warnings', hi: 'चेतावनियाँ' },
    storage: { en: 'Storage', hi: 'भंडारण' },
    price: { en: 'Approx. Price', hi: 'अनुमानित मूल्य' },
    disclaimer: { en: '⚠️ AI identification may be inaccurate. Always verify with a pharmacist.', hi: '⚠️ AI पहचान गलत हो सकती है। हमेशा फार्मासिस्ट से जाँच कराएं।' },
    tryAgain: { en: 'Identify Another', hi: 'एक और पहचानें' },
    tips: { en: 'Tips: Show the pill markings clearly OR photograph the packaging label', hi: 'सुझाव: गोली के निशान दिखाएं या पैकेजिंग लेबल की फोटो लें' },
    prescription: { en: 'Prescription', hi: 'प्रिस्क्रिप्शन' },
    otc: { en: 'Over-The-Counter', hi: 'बिना प्रिस्क्रिप्शन' },
    confidence: { en: 'Confidence', hi: 'विश्वसनीयता' },
};

function t(key: string, lang: string): string {
    return T[key]?.[lang] || T[key]?.['en'] || key;
}

export default function MedicineIdentifier({ language, onClose }: MedicineIdentifierProps) {
    const [image, setImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<MedicineIdentifyResult | null>(null);
    const [mimeType, setMimeType] = useState<string>('image/jpeg');
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

    const identifyMedicine = async () => {
        if (!image) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/vision-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'medicine-id', image, mimeType, language }),
            });
            if (!response.ok) throw new Error('Failed');
            const data = await response.json();
            setResult(data);
            toast.success(language === 'hi' ? '✅ दवा पहचानी गई' : '✅ Medicine identified');
        } catch (error) {
            console.error(error);
            toast.error(language === 'hi' ? 'पहचान विफल' : 'Identification failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getConfidenceColor = (c: number) => {
        if (c >= 80) return 'text-green-600 bg-green-100';
        if (c >= 50) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Pill className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{t('title', language)}</h2>
                                <p className="text-emerald-100 text-sm">{t('subtitle', language)}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {!result ? (
                        <div className="space-y-4">
                            <div className="bg-emerald-50 rounded-xl p-3 text-sm text-emerald-700 flex items-start gap-2">
                                <Camera className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                {t('tips', language)}
                            </div>

                            <h3 className="font-bold text-gray-900">{t('uploadPhoto', language)}</h3>

                            {imagePreview ? (
                                <div className="space-y-4">
                                    <img src={imagePreview} alt="Medicine" className="max-h-64 mx-auto rounded-lg shadow-md" />
                                    <div className="flex gap-3 justify-center">
                                        <button onClick={() => { setImage(null); setImagePreview(null); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Change Photo</button>
                                        <button onClick={identifyMedicine} disabled={isAnalyzing} className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
                                            {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" />{t('analyzing', language)}</> : <><Pill className="w-4 h-4" />{t('identify', language)}</>}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3 justify-center">
                                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                    <button onClick={() => cameraInputRef.current?.click()} className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 flex items-center gap-2">
                                        <Camera className="w-5 h-5" />{t('takePhoto', language)}
                                    </button>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                    <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 flex items-center gap-2">
                                        <Upload className="w-5 h-5" />{t('chooseFile', language)}
                                    </button>
                                </div>
                            )}

                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-sm text-amber-700 flex items-start gap-2"><Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />{t('disclaimer', language)}</p>
                            </div>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                            {/* Medicine Name Card */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-2xl font-bold text-emerald-900">{result.medicineName}</h3>
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getConfidenceColor(result.confidence)}`}>
                                            {result.confidence}% {t('confidence', language)}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${result.otcOrPrescription === 'prescription' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                            {result.otcOrPrescription === 'prescription' ? t('prescription', language) : t('otc', language)}
                                        </span>
                                    </div>
                                </div>
                                {result.genericName && <p className="text-sm text-emerald-700">{t('generic', language)}: <span className="font-medium">{result.genericName}</span></p>}
                                {result.manufacturer && <p className="text-sm text-emerald-600 mt-1">Mfg: {result.manufacturer}</p>}
                            </div>

                            {/* Category & Primary Use */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.category && (
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <p className="text-xs text-blue-500 font-medium">{t('category', language)}</p>
                                        <p className="font-semibold text-blue-900">{result.category}</p>
                                    </div>
                                )}
                                {result.primaryUse && (
                                    <div className="bg-purple-50 rounded-xl p-4">
                                        <p className="text-xs text-purple-500 font-medium">{t('primaryUse', language)}</p>
                                        <p className="font-semibold text-purple-900">{result.primaryUse}</p>
                                    </div>
                                )}
                            </div>

                            {/* Composition */}
                            {result.composition && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-bold text-gray-900 mb-2">{t('composition', language)}</h4>
                                    <p className="text-sm text-gray-700">{result.composition}</p>
                                </div>
                            )}

                            {/* Dosage */}
                            {result.dosageInfo && (
                                <div className="bg-indigo-50 rounded-xl p-4">
                                    <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2"><Clock className="w-4 h-4" />{t('dosage', language)}</h4>
                                    <p className="text-sm text-indigo-800">{result.dosageInfo}</p>
                                </div>
                            )}

                            {/* Side Effects */}
                            {result.sideEffects.length > 0 && (
                                <div className="bg-orange-50 rounded-xl p-4">
                                    <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{t('sideEffects', language)}</h4>
                                    <ul className="space-y-1">
                                        {result.sideEffects.map((s, i) => (
                                            <li key={i} className="text-sm text-orange-800 flex items-start gap-2"><span>•</span>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Warnings */}
                            {result.warnings.length > 0 && (
                                <div className="bg-red-50 rounded-xl p-4">
                                    <h4 className="font-bold text-red-900 mb-2 flex items-center gap-2"><Shield className="w-4 h-4" />{t('warnings', language)}</h4>
                                    <ul className="space-y-1">
                                        {result.warnings.map((w, i) => (
                                            <li key={i} className="text-sm text-red-800 flex items-start gap-2"><span className="text-red-500">⚠</span>{w}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Storage & Price */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.storage && (
                                    <div className="bg-cyan-50 rounded-xl p-4">
                                        <p className="text-xs text-cyan-500 font-medium">{t('storage', language)}</p>
                                        <p className="text-sm font-medium text-cyan-900">{result.storage}</p>
                                    </div>
                                )}
                                {result.approximatePrice && (
                                    <div className="bg-green-50 rounded-xl p-4">
                                        <p className="text-xs text-green-500 font-medium flex items-center gap-1"><DollarSign className="w-3 h-3" />{t('price', language)}</p>
                                        <p className="text-sm font-medium text-green-900">{result.approximatePrice}</p>
                                    </div>
                                )}
                            </div>

                            {/* Disclaimer */}
                            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl">
                                <p className="text-sm text-amber-800 font-medium">{t('disclaimer', language)}</p>
                            </div>

                            {/* Actions */}
                            <button onClick={() => { setResult(null); setImage(null); setImagePreview(null); }}
                                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 flex items-center justify-center gap-2">
                                <ArrowLeft className="w-4 h-4" />{t('tryAgain', language)}
                            </button>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
