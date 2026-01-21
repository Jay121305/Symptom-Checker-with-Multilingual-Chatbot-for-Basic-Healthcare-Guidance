'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Activity, Clock, TrendingUp, TrendingDown, Minus,
    Plus, X, ChevronRight, Phone, Shield, HelpCircle, CheckCircle,
    AlertCircle, Zap, ThermometerSun, Brain, Heart, Stethoscope
} from 'lucide-react';
import { TemporalSymptom, ClinicalAssessment, ClinicalCondition, RedFlagAlert } from '@/types/clinicalTypes';
import toast from 'react-hot-toast';

interface ClinicalSymptomCheckerProps {
    language: string;
    darkMode: boolean;
}

const COMMON_SYMPTOMS = [
    'Fever', 'Headache', 'Cough', 'Sore Throat', 'Body Aches', 'Fatigue',
    'Nausea', 'Vomiting', 'Diarrhea', 'Abdominal Pain', 'Chest Pain',
    'Difficulty Breathing', 'Dizziness', 'Runny Nose', 'Stiff Neck',
    'Rash', 'Joint Pain', 'Back Pain', 'Loss of Appetite', 'Chills'
];

export default function ClinicalSymptomChecker({ language, darkMode }: ClinicalSymptomCheckerProps) {
    const [symptoms, setSymptoms] = useState<TemporalSymptom[]>([]);
    const [showAddSymptom, setShowAddSymptom] = useState(false);
    const [selectedSymptom, setSelectedSymptom] = useState('');
    const [customSymptom, setCustomSymptom] = useState('');

    // Temporal inputs for new symptom
    const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(3);
    const [durationValue, setDurationValue] = useState(1);
    const [durationUnit, setDurationUnit] = useState<'hours' | 'days' | 'weeks'>('days');
    const [progression, setProgression] = useState<'improving' | 'stable' | 'worsening'>('stable');
    const [onset, setOnset] = useState<'sudden' | 'gradual'>('gradual');

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [assessment, setAssessment] = useState<ClinicalAssessment | null>(null);
    const [followUpResponses, setFollowUpResponses] = useState<Record<string, string>>({});

    const isHindi = language === 'hi';

    const addSymptom = useCallback(() => {
        const name = selectedSymptom || customSymptom.trim();
        if (!name) {
            toast.error(isHindi ? 'कृपया एक लक्षण चुनें' : 'Please select a symptom');
            return;
        }

        if (symptoms.some(s => s.name.toLowerCase() === name.toLowerCase())) {
            toast.error(isHindi ? 'यह लक्षण पहले से जोड़ा गया है' : 'This symptom is already added');
            return;
        }

        const newSymptom: TemporalSymptom = {
            id: `symptom_${Date.now()}`,
            name,
            severity,
            duration: { value: durationValue, unit: durationUnit },
            progression,
            onset,
            frequency: 'constant'
        };

        setSymptoms([...symptoms, newSymptom]);
        setShowAddSymptom(false);
        setSelectedSymptom('');
        setCustomSymptom('');
        setSeverity(3);
        setDurationValue(1);
        setDurationUnit('days');
        setProgression('stable');
        setOnset('gradual');
        setAssessment(null);

        toast.success(isHindi ? 'लक्षण जोड़ा गया' : 'Symptom added');
    }, [selectedSymptom, customSymptom, severity, durationValue, durationUnit, progression, onset, symptoms, isHindi]);

    const removeSymptom = (id: string) => {
        setSymptoms(symptoms.filter(s => s.id !== id));
        setAssessment(null);
    };

    const analyzeSymptoms = async () => {
        if (symptoms.length === 0) {
            toast.error(isHindi ? 'कृपया कम से कम एक लक्षण जोड़ें' : 'Please add at least one symptom');
            return;
        }

        setIsAnalyzing(true);
        try {
            const response = await fetch('/api/clinical-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symptoms,
                    followUpResponses,
                    language
                })
            });

            if (!response.ok) throw new Error('Analysis failed');

            const data = await response.json();
            if (data.success) {
                setAssessment(data.assessment);

                if (data.assessment.overallUrgency === 'emergency') {
                    toast.error(isHindi ? '⚠️ आपातकालीन: तुरंत चिकित्सा सहायता लें!' : '⚠️ EMERGENCY: Seek immediate medical attention!');
                }
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error(isHindi ? 'विश्लेषण विफल' : 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getSeverityLabel = (sev: number) => {
        const labels = ['', 'Mild', 'Moderate', 'Significant', 'Severe', 'Extreme'];
        return labels[sev] || 'Unknown';
    };

    const getSeverityColor = (sev: number) => {
        const colors = ['', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-red-700'];
        return colors[sev] || 'bg-gray-500';
    };

    const getProgressionIcon = (prog: string) => {
        switch (prog) {
            case 'improving': return <TrendingDown className="w-4 h-4 text-green-500" />;
            case 'worsening': return <TrendingUp className="w-4 h-4 text-red-500" />;
            default: return <Minus className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getUrgencyStyles = (urgency: string) => {
        switch (urgency) {
            case 'emergency':
                return 'bg-red-600 text-white animate-pulse';
            case 'urgent-care':
                return 'bg-orange-500 text-white';
            case 'schedule-visit':
                return 'bg-yellow-500 text-black';
            default:
                return 'bg-green-500 text-white';
        }
    };

    return (
        <div className={`rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl overflow-hidden`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Brain className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">
                        {isHindi ? 'क्लिनिकल निर्णय सहायता' : 'Clinical Decision Support'}
                    </h2>
                </div>
                <p className="text-purple-100 text-sm">
                    {isHindi
                        ? 'उन्नत तर्क के साथ लक्षण विश्लेषण - यह निदान उपकरण नहीं है'
                        : 'Advanced symptom analysis with clinical reasoning - Not a diagnostic tool'}
                </p>
            </div>

            <div className="p-6">
                {/* Privacy Notice */}
                <div className={`flex items-center gap-2 p-3 rounded-lg mb-6 ${darkMode ? 'bg-green-900/30' : 'bg-green-50'}`}>
                    <Shield className="w-5 h-5 text-green-600" />
                    <span className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                        {isHindi
                            ? '🔒 आपका डेटा संग्रहीत नहीं किया जाता - गोपनीयता-प्रथम प्रसंस्करण'
                            : '🔒 Your data is not stored - Privacy-first processing'}
                    </span>
                </div>

                {/* Symptom List */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {isHindi ? 'आपके लक्षण' : 'Your Symptoms'} ({symptoms.length})
                        </h3>
                        <button
                            onClick={() => setShowAddSymptom(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            {isHindi ? 'लक्षण जोड़ें' : 'Add Symptom'}
                        </button>
                    </div>

                    {symptoms.length === 0 ? (
                        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>{isHindi ? 'विश्लेषण के लिए लक्षण जोड़ें' : 'Add symptoms for analysis'}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {symptoms.map((symptom) => (
                                <motion.div
                                    key={symptom.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {symptom.name}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs text-white ${getSeverityColor(symptom.severity)}`}>
                                                    {getSeverityLabel(symptom.severity)}
                                                </span>
                                            </div>
                                            <div className={`flex flex-wrap gap-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {symptom.duration.value} {symptom.duration.unit}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    {getProgressionIcon(symptom.progression)}
                                                    {symptom.progression}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Zap className="w-4 h-4" />
                                                    {symptom.onset} onset
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeSymptom(symptom.id)}
                                            className="p-1 text-gray-400 hover:text-red-500"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Analyze Button */}
                {symptoms.length > 0 && !assessment && (
                    <button
                        onClick={analyzeSymptoms}
                        disabled={isAnalyzing}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {isHindi ? 'विश्लेषण हो रहा है...' : 'Analyzing...'}
                            </>
                        ) : (
                            <>
                                <Stethoscope className="w-5 h-5" />
                                {isHindi ? 'लक्षणों का विश्लेषण करें' : 'Analyze Symptoms'}
                            </>
                        )}
                    </button>
                )}

                {/* Assessment Results */}
                <AnimatePresence>
                    {assessment && (
                        <AssessmentResults
                            assessment={assessment}
                            darkMode={darkMode}
                            isHindi={isHindi}
                            onReset={() => {
                                setAssessment(null);
                                setSymptoms([]);
                            }}
                            onFollowUpAnswer={(qId, answer) => {
                                setFollowUpResponses({ ...followUpResponses, [qId]: answer });
                            }}
                            onReanalyze={analyzeSymptoms}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Add Symptom Modal */}
            <AnimatePresence>
                {showAddSymptom && (
                    <AddSymptomModal
                        darkMode={darkMode}
                        isHindi={isHindi}
                        selectedSymptom={selectedSymptom}
                        setSelectedSymptom={setSelectedSymptom}
                        customSymptom={customSymptom}
                        setCustomSymptom={setCustomSymptom}
                        severity={severity}
                        setSeverity={setSeverity}
                        durationValue={durationValue}
                        setDurationValue={setDurationValue}
                        durationUnit={durationUnit}
                        setDurationUnit={setDurationUnit}
                        progression={progression}
                        setProgression={setProgression}
                        onset={onset}
                        setOnset={setOnset}
                        onAdd={addSymptom}
                        onClose={() => setShowAddSymptom(false)}
                    />
                )}
            </AnimatePresence>

            {/* Medical Disclaimer - Always Visible */}
            <div className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <p className="font-semibold mb-1">
                            {isHindi ? 'चिकित्सा अस्वीकरण' : 'Medical Disclaimer'}
                        </p>
                        <p>
                            {isHindi
                                ? 'यह एक निर्णय-सहायता उपकरण है, निदान प्रणाली नहीं। हमेशा योग्य स्वास्थ्य पेशेवरों से परामर्श करें। आपातकाल में 108 डायल करें।'
                                : 'This is a decision-support tool, NOT a diagnostic system. Always consult qualified healthcare professionals. In emergencies, call 108.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components
function AddSymptomModal({
    darkMode, isHindi, selectedSymptom, setSelectedSymptom, customSymptom, setCustomSymptom,
    severity, setSeverity, durationValue, setDurationValue, durationUnit, setDurationUnit,
    progression, setProgression, onset, setOnset, onAdd, onClose
}: any) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {isHindi ? 'लक्षण जोड़ें' : 'Add Symptom'}
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Symptom Selection */}
                    <div className="mb-6">
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {isHindi ? 'लक्षण चुनें' : 'Select Symptom'}
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {COMMON_SYMPTOMS.slice(0, 12).map(s => (
                                <button
                                    key={s}
                                    onClick={() => { setSelectedSymptom(s); setCustomSymptom(''); }}
                                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${selectedSymptom === s
                                            ? 'bg-purple-600 text-white'
                                            : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={customSymptom}
                            onChange={e => { setCustomSymptom(e.target.value); setSelectedSymptom(''); }}
                            placeholder={isHindi ? 'या अपना लक्षण टाइप करें...' : 'Or type your symptom...'}
                            className={`w-full px-4 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                    </div>

                    {/* Severity */}
                    <div className="mb-6">
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {isHindi ? 'गंभीरता' : 'Severity'}: {['', 'Mild', 'Moderate', 'Significant', 'Severe', 'Extreme'][severity]}
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={severity}
                            onChange={e => setSeverity(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                            className="w-full accent-purple-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Mild</span>
                            <span>Extreme</span>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="mb-6">
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {isHindi ? 'अवधि' : 'Duration'}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="1"
                                max="99"
                                value={durationValue}
                                onChange={e => setDurationValue(Number(e.target.value))}
                                className={`w-20 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <select
                                value={durationUnit}
                                onChange={e => setDurationUnit(e.target.value as any)}
                                className={`flex-1 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                            >
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                                <option value="weeks">Weeks</option>
                            </select>
                        </div>
                    </div>

                    {/* Progression */}
                    <div className="mb-6">
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {isHindi ? 'प्रगति' : 'Progression'}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['improving', 'stable', 'worsening'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setProgression(p)}
                                    className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${progression === p
                                            ? p === 'improving' ? 'bg-green-500 text-white' : p === 'worsening' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                                            : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Onset */}
                    <div className="mb-6">
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {isHindi ? 'शुरुआत' : 'Onset'}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['sudden', 'gradual'] as const).map(o => (
                                <button
                                    key={o}
                                    onClick={() => setOnset(o)}
                                    className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${onset === o
                                            ? 'bg-purple-600 text-white'
                                            : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                        }`}
                                >
                                    {o}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={onAdd}
                        className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                    >
                        {isHindi ? 'लक्षण जोड़ें' : 'Add Symptom'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function AssessmentResults({ assessment, darkMode, isHindi, onReset, onFollowUpAnswer, onReanalyze }: {
    assessment: ClinicalAssessment;
    darkMode: boolean;
    isHindi: boolean;
    onReset: () => void;
    onFollowUpAnswer: (qId: string, answer: string) => void;
    onReanalyze: () => void;
}) {
    const [expandedCondition, setExpandedCondition] = useState<string | null>(
        assessment.possibleConditions[0]?.id || null
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 space-y-6"
        >
            {/* Red Flag Alerts */}
            {assessment.redFlagAlerts.length > 0 && (
                <div className="space-y-3">
                    {assessment.redFlagAlerts.map(alert => (
                        <RedFlagAlertCard key={alert.id} alert={alert} darkMode={darkMode} />
                    ))}
                </div>
            )}

            {/* Overall Urgency */}
            <div className={`p-4 rounded-xl ${assessment.overallUrgency === 'emergency' ? 'bg-red-600' :
                    assessment.overallUrgency === 'urgent-care' ? 'bg-orange-500' :
                        assessment.overallUrgency === 'schedule-visit' ? 'bg-yellow-500' : 'bg-green-500'
                } text-white`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg uppercase">{assessment.overallUrgency.replace('-', ' ')}</h3>
                        <p className="text-sm opacity-90">{assessment.urgencyReason}</p>
                    </div>
                    {assessment.overallUrgency === 'emergency' && (
                        <a href="tel:108" className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-bold">
                            <Phone className="w-5 h-5" />
                            Call 108
                        </a>
                    )}
                </div>
            </div>

            {/* Confidence Explanation */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <div className="flex items-start gap-3">
                    <HelpCircle className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5`} />
                    <div>
                        <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {isHindi ? 'विश्लेषण व्याख्या' : 'Analysis Explanation'}
                        </h4>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {assessment.confidenceExplanation}
                        </p>
                        {assessment.differentialExplanation && (
                            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {assessment.differentialExplanation}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Possible Conditions */}
            <div>
                <h3 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {isHindi ? 'संभावित स्थितियां (विभेदक निदान)' : 'Possible Conditions (Differential Diagnosis)'}
                </h3>
                <div className="space-y-3">
                    {assessment.possibleConditions.map((condition, index) => (
                        <ConditionCard
                            key={condition.id}
                            condition={condition}
                            rank={index + 1}
                            isExpanded={expandedCondition === condition.id}
                            onToggle={() => setExpandedCondition(expandedCondition === condition.id ? null : condition.id)}
                            darkMode={darkMode}
                            isHindi={isHindi}
                        />
                    ))}
                </div>
            </div>

            {/* Follow-up Questions */}
            {assessment.followUpQuestions.length > 0 && (
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                    <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {isHindi ? 'अधिक सटीकता के लिए अनुवर्ती प्रश्न' : 'Follow-up Questions for Better Accuracy'}
                    </h4>
                    <div className="space-y-4">
                        {assessment.followUpQuestions.map(q => (
                            <div key={q.id}>
                                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{q.question}</p>
                                <p className={`text-xs mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                    <span className="italic">Why: {q.purpose}</span>
                                </p>
                                {q.type === 'yes_no' ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => onFollowUpAnswer(q.id, 'yes')} className="px-4 py-1 bg-green-500 text-white rounded-lg text-sm">Yes</button>
                                        <button onClick={() => onFollowUpAnswer(q.id, 'no')} className="px-4 py-1 bg-red-500 text-white rounded-lg text-sm">No</button>
                                    </div>
                                ) : q.options && (
                                    <div className="flex flex-wrap gap-2">
                                        {q.options.map((opt: any) => (
                                            <button key={opt.value} onClick={() => onFollowUpAnswer(q.id, opt.value)} className={`px-3 py-1 rounded-lg text-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button onClick={onReanalyze} className="mt-4 w-full py-2 bg-purple-600 text-white rounded-lg font-medium">
                        {isHindi ? 'उत्तरों के साथ पुनः विश्लेषण करें' : 'Re-analyze with Answers'}
                    </button>
                </div>
            )}

            {/* Next Steps */}
            <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {isHindi ? 'अगले कदम' : 'Next Steps'}
                </h4>
                <ul className="space-y-2">
                    {assessment.nextSteps.map((step, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {step}
                        </li>
                    ))}
                </ul>
            </div>

            {/* When to Seek Help */}
            <div className={`p-4 rounded-xl border-2 ${darkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
                <h4 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                    <AlertCircle className="w-5 h-5" />
                    {isHindi ? 'तुरंत मदद लें यदि' : 'Seek Help Immediately If'}
                </h4>
                <ul className="space-y-2">
                    {assessment.whenToSeekHelp.map((item, i) => (
                        <li key={i} className={`flex items-start gap-2 text-sm ${darkMode ? 'text-red-200' : 'text-red-600'}`}>
                            <span>•</span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Start Over */}
            <button onClick={onReset} className={`w-full py-3 rounded-xl font-medium ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                {isHindi ? 'नया विश्लेषण शुरू करें' : 'Start New Analysis'}
            </button>
        </motion.div>
    );
}

function ConditionCard({ condition, rank, isExpanded, onToggle, darkMode, isHindi }: {
    condition: ClinicalCondition;
    rank: number;
    isExpanded: boolean;
    onToggle: () => void;
    darkMode: boolean;
    isHindi: boolean;
}) {
    const getConfidenceColor = (conf: number) => {
        if (conf >= 70) return 'bg-green-500';
        if (conf >= 40) return 'bg-yellow-500';
        return 'bg-gray-400';
    };

    return (
        <div className={`rounded-xl border overflow-hidden ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
            <button onClick={onToggle} className="w-full p-4 text-left">
                <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${rank === 1 ? 'bg-purple-600' : 'bg-gray-400'}`}>
                        {rank}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{condition.name}</span>
                            {condition.urgency === 'emergency' && (
                                <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">EMERGENCY</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-32">
                                <div className={`h-full ${getConfidenceColor(condition.confidence)}`} style={{ width: `${condition.confidence}%` }} />
                            </div>
                            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{condition.confidence}%</span>
                        </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''} ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className={`p-4 pt-0 space-y-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <p className="text-sm">{condition.description}</p>

                            {/* Why This Condition */}
                            <div>
                                <h5 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {isHindi ? 'यह क्यों सुझाया गया' : 'Why This Condition'}
                                </h5>
                                <ul className="space-y-1">
                                    {condition.reasoning.map((r, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Matching Symptoms */}
                            {condition.matchingSymptoms.length > 0 && (
                                <div>
                                    <h5 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {isHindi ? 'मेल खाने वाले लक्षण' : 'Matching Symptoms'}
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {condition.matchingSymptoms.map(s => (
                                            <span key={s} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Missing Symptoms */}
                            {condition.missingSymptoms.length > 0 && (
                                <div>
                                    <h5 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {isHindi ? 'अपेक्षित लेकिन अनुपस्थित' : 'Expected but Not Present'}
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {condition.missingSymptoms.map(s => (
                                            <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Differential Factors */}
                            <div>
                                <h5 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {isHindi ? 'विभेदक कारक' : 'Distinguishing Factors'}
                                </h5>
                                <ul className="space-y-1">
                                    {condition.differentialFactors.map((f, i) => (
                                        <li key={i} className="text-sm">• {f}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Red Flags for This Condition */}
                            {condition.redFlags.length > 0 && (
                                <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/30' : 'bg-red-50'}`}>
                                    <h5 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                                        {isHindi ? 'चेतावनी संकेत' : 'Warning Signs to Watch'}
                                    </h5>
                                    <ul className="space-y-1">
                                        {condition.redFlags.map((rf, i) => (
                                            <li key={i} className={`text-sm ${darkMode ? 'text-red-200' : 'text-red-600'}`}>⚠️ {rf}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function RedFlagAlertCard({ alert, darkMode }: { alert: RedFlagAlert; darkMode: boolean }) {
    return (
        <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className={`p-4 rounded-xl ${alert.severity === 'critical' ? 'bg-red-600 animate-pulse' :
                    alert.severity === 'danger' ? 'bg-orange-500' : 'bg-yellow-500'
                } text-white`}
        >
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <div className="flex-1">
                    <h4 className="font-bold">{alert.title}</h4>
                    <p className="text-sm opacity-90 mt-1">{alert.description}</p>
                    <p className="text-sm font-semibold mt-2">{alert.action}</p>
                </div>
                {alert.callEmergency && (
                    <a href="tel:108" className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-bold text-sm">
                        <Phone className="w-4 h-4" />
                        108
                    </a>
                )}
            </div>
        </motion.div>
    );
}
