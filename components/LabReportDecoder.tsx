'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Camera, Upload, Loader2, AlertTriangle,
    CheckCircle, XCircle, ArrowLeft, Info, X, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { LabReportResult } from '@/lib/geminiVision';

interface LabReportDecoderProps {
    language: string;
    onClose: () => void;
}

const T: Record<string, Record<string, string>> = {
    title: { en: 'Lab Report Decoder', hi: 'लैब रिपोर्ट डिकोडर' },
    subtitle: { en: 'Upload your lab report for AI analysis', hi: 'AI विश्लेषण के लिए अपनी लैब रिपोर्ट अपलोड करें' },
    upload: { en: 'Upload Lab Report', hi: 'लैब रिपोर्ट अपलोड करें' },
    takePhoto: { en: 'Take Photo', hi: 'फोटो लें' },
    chooseFile: { en: 'Choose File', hi: 'फ़ाइल चुनें' },
    analyzing: { en: 'Analyzing your report...', hi: 'आपकी रिपोर्ट का विश्लेषण हो रहा है...' },
    results: { en: 'Analysis Results', hi: 'विश्लेषण परिणाम' },
    testName: { en: 'Test', hi: 'टेस्ट' },
    value: { en: 'Value', hi: 'मान' },
    range: { en: 'Normal Range', hi: 'सामान्य सीमा' },
    status: { en: 'Status', hi: 'स्थिति' },
    explanation: { en: 'What it means', hi: 'इसका मतलब' },
    summary: { en: 'Overall Summary', hi: 'समग्र सारांश' },
    concerns: { en: 'Areas of Concern', hi: 'चिंता के क्षेत्र' },
    recommendations: { en: 'Recommendations', hi: 'सिफारिशें' },
    disclaimer: { en: '⚠️ This is an AI interpretation. Always consult your doctor for official analysis.', hi: '⚠️ यह AI व्याख्या है। आधिकारिक विश्लेषण के लिए हमेशा अपने डॉक्टर से परामर्श करें।' },
    dragDrop: { en: 'Drag & drop your report here, or', hi: 'अपनी रिपोर्ट यहां खींचें और छोड़ें, या' },
    supported: { en: 'Supports: JPG, PNG, PDF images', hi: 'समर्थित: JPG, PNG, PDF इमेज' },
    noResults: { en: 'No test results could be extracted', hi: 'कोई टेस्ट परिणाम नहीं निकला' },
    tryAgain: { en: 'Try Again', hi: 'पुनः प्रयास करें' },
    back: { en: 'Back', hi: 'वापस' },
};

function t(key: string, lang: string): string {
    return T[key]?.[lang] || T[key]?.['en'] || key;
}

export default function LabReportDecoder({ language, onClose }: LabReportDecoderProps) {
    const [image, setImage] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<LabReportResult | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [mimeType, setMimeType] = useState<string>('image/jpeg');

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

    const analyzeReport = async () => {
        if (!image) return;
        setIsAnalyzing(true);

        try {
            const response = await fetch('/api/vision-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'lab-report',
                    image,
                    mimeType,
                    language,
                }),
            });

            if (!response.ok) throw new Error('Analysis failed');
            const data = await response.json();
            setResult(data);

            if (data.urgency === 'urgent') {
                toast.error(language === 'hi' ? '⚠️ कुछ मान चिंताजनक हैं!' : '⚠️ Some values need attention!');
            } else {
                toast.success(language === 'hi' ? '✅ विश्लेषण पूरा हुआ' : '✅ Analysis complete');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error(language === 'hi' ? 'विश्लेषण विफल रहा' : 'Analysis failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'normal': return 'text-green-600 bg-green-50';
            case 'low': return 'text-blue-600 bg-blue-50';
            case 'high': return 'text-orange-600 bg-orange-50';
            case 'critical': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'normal': return <CheckCircle className="w-4 h-4" />;
            case 'low': return <TrendingDown className="w-4 h-4" />;
            case 'high': return <TrendingUp className="w-4 h-4" />;
            case 'critical': return <XCircle className="w-4 h-4" />;
            default: return <Minus className="w-4 h-4" />;
        }
    };

    const getUrgencyStyle = (urgency: string) => {
        switch (urgency) {
            case 'urgent': return 'from-red-500 to-red-600';
            case 'needs-attention': return 'from-orange-500 to-amber-500';
            default: return 'from-green-500 to-emerald-500';
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
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">{t('title', language)}</h2>
                                <p className="text-teal-100 text-sm">{t('subtitle', language)}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <AnimatePresence mode="wait">
                        {!result ? (
                            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {/* Upload Area */}
                                <div
                                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400'}`}
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                >
                                    {imagePreview ? (
                                        <div className="space-y-4">
                                            <img src={imagePreview} alt="Lab Report" className="max-h-64 mx-auto rounded-lg shadow-md" />
                                            <div className="flex gap-3 justify-center">
                                                <button
                                                    onClick={() => { setImage(null); setImagePreview(null); }}
                                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                                >
                                                    {t('tryAgain', language)}
                                                </button>
                                                <button
                                                    onClick={analyzeReport}
                                                    disabled={isAnalyzing}
                                                    className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {isAnalyzing ? (
                                                        <><Loader2 className="w-4 h-4 animate-spin" />{t('analyzing', language)}</>
                                                    ) : (
                                                        <><FileText className="w-4 h-4" />{t('results', language)}</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto flex items-center justify-center">
                                                <Upload className="w-8 h-8 text-teal-600" />
                                            </div>
                                            <p className="text-gray-600">{t('dragDrop', language)}</p>
                                            <div className="flex gap-3 justify-center">
                                                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                                <button onClick={() => cameraInputRef.current?.click()} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2">
                                                    <Camera className="w-4 h-4" />{t('takePhoto', language)}
                                                </button>
                                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                                                    <Upload className="w-4 h-4" />{t('chooseFile', language)}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-400">{t('supported', language)}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Disclaimer */}
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-700 flex items-start gap-2">
                                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        {t('disclaimer', language)}
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                {/* Urgency Banner */}
                                <div className={`bg-gradient-to-r ${getUrgencyStyle(result.urgency)} p-4 rounded-xl text-white`}>
                                    <div className="flex items-center gap-2">
                                        {result.urgency === 'urgent' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                        <span className="font-bold">{result.reportType}</span>
                                    </div>
                                    {result.patientInfo && <p className="text-sm mt-1 opacity-90">{result.patientInfo}</p>}
                                </div>

                                {/* Test Results Table */}
                                {result.testResults.length > 0 ? (
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-teal-500" />
                                            {t('results', language)}
                                        </h3>
                                        <div className="space-y-3">
                                            {result.testResults.map((test, idx) => (
                                                <div key={idx} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-gray-900">{test.testName}</span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(test.status)}`}>
                                                            {getStatusIcon(test.status)}
                                                            {test.status.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                                        <div><span className="text-gray-500">{t('value', language)}:</span> <span className="font-medium">{test.value}</span></div>
                                                        <div><span className="text-gray-500">{t('range', language)}:</span> <span className="font-medium">{test.normalRange}</span></div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">{test.explanation}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Info className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p>{t('noResults', language)}</p>
                                    </div>
                                )}

                                {/* Summary */}
                                {result.overallSummary && (
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <h3 className="font-bold text-blue-900 mb-2">{t('summary', language)}</h3>
                                        <p className="text-blue-800 text-sm">{result.overallSummary}</p>
                                    </div>
                                )}

                                {/* Concerns */}
                                {result.concerns.length > 0 && (
                                    <div className="bg-red-50 rounded-xl p-4">
                                        <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />{t('concerns', language)}
                                        </h3>
                                        <ul className="space-y-1">
                                            {result.concerns.map((c, i) => (
                                                <li key={i} className="text-red-800 text-sm flex items-start gap-2">
                                                    <span className="text-red-500 mt-1">•</span>{c}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Recommendations */}
                                {result.recommendations.length > 0 && (
                                    <div className="bg-green-50 rounded-xl p-4">
                                        <h3 className="font-bold text-green-900 mb-2">{t('recommendations', language)}</h3>
                                        <ul className="space-y-1">
                                            {result.recommendations.map((r, i) => (
                                                <li key={i} className="text-green-800 text-sm flex items-start gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />{r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Disclaimer */}
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-700 flex items-start gap-2">
                                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        {t('disclaimer', language)}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button onClick={() => { setResult(null); setImage(null); setImagePreview(null); }} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                        <ArrowLeft className="w-4 h-4" />{t('tryAgain', language)}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
