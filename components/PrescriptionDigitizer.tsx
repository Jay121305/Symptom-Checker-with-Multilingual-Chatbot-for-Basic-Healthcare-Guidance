'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Camera, Upload, Loader2, Clock, Pill,
    CheckCircle, ArrowLeft, Info, X, User, Stethoscope, CalendarDays, AlertTriangle, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { PrescriptionResult } from '@/lib/geminiVision';

interface PrescriptionDigitizerProps {
    language: string;
    onClose: () => void;
}

const T: Record<string, Record<string, string>> = {
    title: { en: 'Prescription Digitizer', hi: 'प्रिस्क्रिप्शन डिजिटाइज़र' },
    subtitle: { en: 'Convert handwritten prescriptions to digital format', hi: 'हस्तलिखित प्रिस्क्रिप्शन को डिजिटल में बदलें' },
    takePhoto: { en: 'Take Photo', hi: 'फोटो लें' },
    chooseFile: { en: 'Choose File', hi: 'फ़ाइल चुनें' },
    analyzing: { en: 'Reading prescription...', hi: 'प्रिस्क्रिप्शन पढ़ रहे हैं...' },
    analyze: { en: 'Digitize Prescription', hi: 'प्रिस्क्रिप्शन डिजिटाइज़ करें' },
    doctor: { en: 'Doctor', hi: 'डॉक्टर' },
    patient: { en: 'Patient', hi: 'मरीज' },
    diagnosis: { en: 'Diagnosis', hi: 'निदान' },
    medications: { en: 'Medications', hi: 'दवाइयाँ' },
    dosage: { en: 'Dosage', hi: 'खुराक' },
    frequency: { en: 'Frequency', hi: 'कितनी बार' },
    duration: { en: 'Duration', hi: 'अवधि' },
    timing: { en: 'Timing', hi: 'समय' },
    instructions: { en: 'Instructions', hi: 'निर्देश' },
    followUp: { en: 'Follow-up Date', hi: 'फॉलो-अप तारीख' },
    confidence: { en: 'Reading Confidence', hi: 'पढ़ने का विश्वास' },
    addReminder: { en: 'Set Medication Reminders', hi: 'दवा रिमाइंडर सेट करें' },
    disclaimer: { en: '⚠️ Always verify with your pharmacist. AI may misread handwriting.', hi: '⚠️ हमेशा अपने फार्मासिस्ट से सत्यापित करें। AI हस्तलिपि गलत पढ़ सकता है।' },
    dragDrop: { en: 'Drag & drop your prescription here, or', hi: 'अपना प्रिस्क्रिप्शन यहां खींचें, या' },
    tryAgain: { en: 'Scan Another', hi: 'एक और स्कैन करें' },
    notes: { en: 'Additional Notes', hi: 'अतिरिक्त नोट्स' },
};

function t(key: string, lang: string): string {
    return T[key]?.[lang] || T[key]?.['en'] || key;
}

export default function PrescriptionDigitizer({ language, onClose }: PrescriptionDigitizerProps) {
    const [image, setImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<PrescriptionResult | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [mimeType, setMimeType] = useState<string>('image/jpeg');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File too large. Max 10MB.');
            return;
        }
        setMimeType(file.type);
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setImagePreview(dataUrl);
            setImage(dataUrl.split(',')[1]);
            setResult(null);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const analyzePrescription = async () => {
        if (!image) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/vision-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'prescription', image, mimeType, language }),
            });
            if (!response.ok) throw new Error('Failed');
            const data = await response.json();
            setResult(data);
            toast.success(language === 'hi' ? '✅ प्रिस्क्रिप्शन डिजिटाइज़ हो गया' : '✅ Prescription digitized');
        } catch (error) {
            console.error(error);
            toast.error(language === 'hi' ? 'विश्लेषण विफल' : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSetReminders = () => {
        if (!result?.medications?.length) return;
        // Save medications to localStorage for the medication reminder
        const existing = JSON.parse(localStorage.getItem('prescriptionMeds') || '[]');
        const newMeds = result.medications.map((med, idx) => ({
            id: `rx_${Date.now()}_${idx}`,
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            duration: med.duration,
            timing: med.timing,
            instructions: med.instructions,
            addedAt: new Date().toISOString(),
        }));
        localStorage.setItem('prescriptionMeds', JSON.stringify([...existing, ...newMeds]));
        toast.success(language === 'hi' ? '✅ रिमाइंडर सेट हो गए' : '✅ Reminders set for all medications');
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{t('title', language)}</h2>
                                <p className="text-violet-100 text-sm">{t('subtitle', language)}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <AnimatePresence mode="wait">
                        {!result ? (
                            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div
                                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${isDragging ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-violet-400'}`}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                >
                                    {imagePreview ? (
                                        <div className="space-y-4">
                                            <img src={imagePreview} alt="Prescription" className="max-h-64 mx-auto rounded-lg shadow-md" />
                                            <div className="flex gap-3 justify-center">
                                                <button onClick={() => { setImage(null); setImagePreview(null); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                                    {t('tryAgain', language)}
                                                </button>
                                                <button onClick={analyzePrescription} disabled={isAnalyzing} className="px-6 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 flex items-center gap-2">
                                                    {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" />{t('analyzing', language)}</> : <><FileText className="w-4 h-4" />{t('analyze', language)}</>}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-violet-100 rounded-full mx-auto flex items-center justify-center">
                                                <Upload className="w-8 h-8 text-violet-600" />
                                            </div>
                                            <p className="text-gray-600">{t('dragDrop', language)}</p>
                                            <div className="flex gap-3 justify-center">
                                                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                                <button onClick={() => cameraInputRef.current?.click()} className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors flex items-center gap-2">
                                                    <Camera className="w-4 h-4" />{t('takePhoto', language)}
                                                </button>
                                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                                                    <Upload className="w-4 h-4" />{t('chooseFile', language)}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-700 flex items-start gap-2"><Info className="w-4 h-4 mt-0.5 flex-shrink-0" />{t('disclaimer', language)}</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                                {/* Confidence */}
                                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                                    <span className="text-sm text-gray-600">{t('confidence', language)}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${result.confidence >= 80 ? 'bg-green-500' : result.confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${result.confidence}%` }} />
                                        </div>
                                        <span className="text-sm font-bold">{result.confidence}%</span>
                                    </div>
                                </div>

                                {/* Doctor & Patient Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {result.doctorInfo && (result.doctorInfo.name || result.doctorInfo.clinic) && (
                                        <div className="bg-blue-50 rounded-xl p-4">
                                            <h4 className="font-semibold text-blue-900 flex items-center gap-2 mb-2"><Stethoscope className="w-4 h-4" />{t('doctor', language)}</h4>
                                            {result.doctorInfo.name && <p className="text-sm text-blue-800">{result.doctorInfo.name}</p>}
                                            {result.doctorInfo.clinic && <p className="text-xs text-blue-600">{result.doctorInfo.clinic}</p>}
                                            {result.doctorInfo.specialization && <p className="text-xs text-blue-600">{result.doctorInfo.specialization}</p>}
                                        </div>
                                    )}
                                    {result.patientInfo && (result.patientInfo.name || result.patientInfo.age) && (
                                        <div className="bg-purple-50 rounded-xl p-4">
                                            <h4 className="font-semibold text-purple-900 flex items-center gap-2 mb-2"><User className="w-4 h-4" />{t('patient', language)}</h4>
                                            {result.patientInfo.name && <p className="text-sm text-purple-800">{result.patientInfo.name}</p>}
                                            {result.patientInfo.age && <p className="text-xs text-purple-600">Age: {result.patientInfo.age}</p>}
                                        </div>
                                    )}
                                </div>

                                {/* Diagnosis */}
                                {result.diagnosis && (
                                    <div className="bg-orange-50 rounded-xl p-4">
                                        <h4 className="font-semibold text-orange-900 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{t('diagnosis', language)}</h4>
                                        <p className="text-sm text-orange-800 mt-1">{result.diagnosis}</p>
                                    </div>
                                )}

                                {/* Medications */}
                                {result.medications.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Pill className="w-5 h-5 text-violet-500" />{t('medications', language)} ({result.medications.length})</h3>
                                        <div className="space-y-3">
                                            {result.medications.map((med, idx) => (
                                                <div key={idx} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="font-bold text-gray-900 text-lg">{med.name}</h4>
                                                        <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium">{med.dosage}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div className="flex items-center gap-2 text-gray-600"><Clock className="w-3 h-3 text-blue-500" /><span className="font-medium">{t('frequency', language)}:</span> {med.frequency}</div>
                                                        <div className="flex items-center gap-2 text-gray-600"><CalendarDays className="w-3 h-3 text-green-500" /><span className="font-medium">{t('duration', language)}:</span> {med.duration}</div>
                                                        {med.timing && <div className="flex items-center gap-2 text-gray-600"><Clock className="w-3 h-3 text-orange-500" /><span className="font-medium">{t('timing', language)}:</span> {med.timing}</div>}
                                                        {med.instructions && <div className="col-span-2 text-gray-600 bg-gray-50 p-2 rounded-lg text-xs"><span className="font-medium">{t('instructions', language)}:</span> {med.instructions}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Follow-up */}
                                {result.followUpDate && (
                                    <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
                                        <CalendarDays className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="font-semibold text-green-900">{t('followUp', language)}</p>
                                            <p className="text-sm text-green-700">{result.followUpDate}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Additional Notes */}
                                {result.additionalNotes && (
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h4 className="font-semibold text-gray-700 mb-1">{t('notes', language)}</h4>
                                        <p className="text-sm text-gray-600">{result.additionalNotes}</p>
                                    </div>
                                )}

                                {/* Set Reminders Button */}
                                {result.medications.length > 0 && (
                                    <button onClick={handleSetReminders} className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2">
                                        <Bell className="w-5 h-5" />{t('addReminder', language)}
                                    </button>
                                )}

                                {/* Disclaimer */}
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-700 flex items-start gap-2"><Info className="w-4 h-4 mt-0.5 flex-shrink-0" />{t('disclaimer', language)}</p>
                                </div>

                                {/* Try Again */}
                                <button onClick={() => { setResult(null); setImage(null); setImagePreview(null); }} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
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
