'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Plus,
    Calendar,
    Trash2,
    TrendingUp,
    TrendingDown,
    Minus,
    Smile,
    Meh,
    Frown,
    ChevronDown,
    ChevronUp,
    Activity
} from 'lucide-react';
import { SymptomDiaryEntry } from '@/types';

interface SymptomDiaryProps {
    profileId?: string;
    language?: string;
}

export default function SymptomDiary({ profileId = 'default', language = 'en' }: SymptomDiaryProps) {
    const [entries, setEntries] = useState<SymptomDiaryEntry[]>([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
    const [newEntry, setNewEntry] = useState<Partial<SymptomDiaryEntry>>({
        symptoms: [],
        severity: 3,
        mood: 'okay',
        notes: '',
        triggers: [],
    });
    const [symptomInput, setSymptomInput] = useState('');
    const [triggerInput, setTriggerInput] = useState('');

    const isHindi = language === 'hi';

    // Load entries from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(`symptomDiary_${profileId}`);
        if (saved) {
            const parsed = JSON.parse(saved);
            setEntries(parsed.map((e: any) => ({ ...e, date: new Date(e.date) })));
        }
    }, [profileId]);

    // Save entries
    const saveEntries = (updatedEntries: SymptomDiaryEntry[]) => {
        localStorage.setItem(`symptomDiary_${profileId}`, JSON.stringify(updatedEntries));
        setEntries(updatedEntries);
    };

    const addEntry = () => {
        if (!newEntry.symptoms?.length) {
            return;
        }

        const entry: SymptomDiaryEntry = {
            id: Date.now().toString(),
            profileId,
            date: new Date(),
            symptoms: newEntry.symptoms || [],
            severity: (newEntry.severity as 1 | 2 | 3 | 4 | 5) || 3,
            mood: newEntry.mood,
            notes: newEntry.notes,
            triggers: newEntry.triggers,
        };

        saveEntries([entry, ...entries]);
        setIsAddingNew(false);
        setNewEntry({ symptoms: [], severity: 3, mood: 'okay', notes: '', triggers: [] });
    };

    const deleteEntry = (id: string) => {
        saveEntries(entries.filter(e => e.id !== id));
    };

    const addSymptom = () => {
        if (symptomInput.trim() && !newEntry.symptoms?.includes(symptomInput.trim())) {
            setNewEntry({
                ...newEntry,
                symptoms: [...(newEntry.symptoms || []), symptomInput.trim()]
            });
            setSymptomInput('');
        }
    };

    const addTrigger = () => {
        if (triggerInput.trim() && !newEntry.triggers?.includes(triggerInput.trim())) {
            setNewEntry({
                ...newEntry,
                triggers: [...(newEntry.triggers || []), triggerInput.trim()]
            });
            setTriggerInput('');
        }
    };

    const getSeverityColor = (severity: number) => {
        const colors = {
            1: 'bg-green-100 text-green-700',
            2: 'bg-lime-100 text-lime-700',
            3: 'bg-yellow-100 text-yellow-700',
            4: 'bg-orange-100 text-orange-700',
            5: 'bg-red-100 text-red-700',
        };
        return colors[severity as keyof typeof colors] || colors[3];
    };

    const getMoodIcon = (mood?: string) => {
        switch (mood) {
            case 'good': return <Smile className="w-4 h-4 text-green-500" />;
            case 'bad': return <Frown className="w-4 h-4 text-red-500" />;
            default: return <Meh className="w-4 h-4 text-yellow-500" />;
        }
    };

    const getTrend = () => {
        if (entries.length < 2) return null;
        const recent = entries.slice(0, 3);
        const avgRecent = recent.reduce((a, b) => a + b.severity, 0) / recent.length;
        const older = entries.slice(3, 6);
        if (older.length === 0) return null;
        const avgOlder = older.reduce((a, b) => a + b.severity, 0) / older.length;

        if (avgRecent < avgOlder - 0.5) return 'improving';
        if (avgRecent > avgOlder + 0.5) return 'worsening';
        return 'stable';
    };

    const trend = getTrend();

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <BookOpen className="w-7 h-7" />
                    {isHindi ? 'लक्षण डायरी' : 'Symptom Diary'}
                </h2>
                <p className="text-indigo-100 mt-1">
                    {isHindi
                        ? 'अपने लक्षणों को ट्रैक करें और पैटर्न खोजें'
                        : 'Track your symptoms and discover patterns'
                    }
                </p>

                {/* Trend Indicator */}
                {trend && (
                    <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full text-sm font-medium ${trend === 'improving' ? 'bg-green-500' :
                            trend === 'worsening' ? 'bg-red-500' : 'bg-gray-500'
                        }`}>
                        {trend === 'improving' && <TrendingDown className="w-4 h-4" />}
                        {trend === 'worsening' && <TrendingUp className="w-4 h-4" />}
                        {trend === 'stable' && <Minus className="w-4 h-4" />}
                        {isHindi
                            ? (trend === 'improving' ? 'सुधार' : trend === 'worsening' ? 'बिगड़ रहा' : 'स्थिर')
                            : (trend === 'improving' ? 'Improving' : trend === 'worsening' ? 'Worsening' : 'Stable')
                        }
                    </div>
                )}
            </div>

            <div className="p-6">
                {/* Add New Button */}
                {!isAddingNew && (
                    <button
                        onClick={() => setIsAddingNew(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors mb-6"
                    >
                        <Plus className="w-5 h-5" />
                        {isHindi ? 'आज की एंट्री जोड़ें' : "Add Today's Entry"}
                    </button>
                )}

                {/* Add New Form */}
                <AnimatePresence>
                    {isAddingNew && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-2 border-indigo-500 rounded-xl p-4 mb-6 bg-indigo-50"
                        >
                            <h3 className="font-semibold mb-4">{isHindi ? 'नई एंट्री' : 'New Entry'}</h3>

                            {/* Symptoms */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {isHindi ? 'लक्षण' : 'Symptoms'}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={symptomInput}
                                        onChange={(e) => setSymptomInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                        placeholder={isHindi ? 'लक्षण टाइप करें' : 'Type symptom'}
                                    />
                                    <button onClick={addSymptom} className="px-3 py-2 bg-indigo-500 text-white rounded-lg">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {newEntry.symptoms?.map((s) => (
                                        <span key={s} className="px-2 py-1 bg-indigo-200 text-indigo-800 rounded-full text-xs">
                                            {s}
                                            <button
                                                onClick={() => setNewEntry({
                                                    ...newEntry,
                                                    symptoms: newEntry.symptoms?.filter(x => x !== s)
                                                })}
                                                className="ml-1"
                                            >×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Severity */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {isHindi ? 'तीव्रता (1-5)' : 'Severity (1-5)'}
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setNewEntry({ ...newEntry, severity: level as any })}
                                            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${newEntry.severity === level
                                                    ? getSeverityColor(level)
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>{isHindi ? 'हल्का' : 'Mild'}</span>
                                    <span>{isHindi ? 'गंभीर' : 'Severe'}</span>
                                </div>
                            </div>

                            {/* Mood */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {isHindi ? 'आज का मूड' : "Today's Mood"}
                                </label>
                                <div className="flex gap-2">
                                    {[
                                        { value: 'good', icon: Smile, label: isHindi ? 'अच्छा' : 'Good' },
                                        { value: 'okay', icon: Meh, label: isHindi ? 'ठीक' : 'Okay' },
                                        { value: 'bad', icon: Frown, label: isHindi ? 'खराब' : 'Bad' },
                                    ].map((m) => (
                                        <button
                                            key={m.value}
                                            onClick={() => setNewEntry({ ...newEntry, mood: m.value as any })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-colors ${newEntry.mood === m.value
                                                    ? 'bg-indigo-500 text-white'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            <m.icon className="w-4 h-4" />
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {isHindi ? 'नोट्स' : 'Notes'} ({isHindi ? 'वैकल्पिक' : 'optional'})
                                </label>
                                <textarea
                                    value={newEntry.notes}
                                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                    rows={2}
                                    placeholder={isHindi ? 'कोई अतिरिक्त जानकारी...' : 'Any additional details...'}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={addEntry}
                                    disabled={!newEntry.symptoms?.length}
                                    className="flex-1 py-2 bg-indigo-500 text-white rounded-lg font-medium disabled:opacity-50"
                                >
                                    {isHindi ? 'सेव करें' : 'Save Entry'}
                                </button>
                                <button
                                    onClick={() => setIsAddingNew(false)}
                                    className="px-4 py-2 border rounded-lg"
                                >
                                    {isHindi ? 'रद्द' : 'Cancel'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Entries List */}
                <div className="space-y-3">
                    {entries.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                            <p>{isHindi ? 'अभी कोई एंट्री नहीं' : 'No entries yet'}</p>
                            <p className="text-sm">{isHindi ? 'अपने लक्षणों को ट्रैक करना शुरू करें' : 'Start tracking your symptoms'}</p>
                        </div>
                    ) : (
                        entries.map((entry) => (
                            <motion.div
                                key={entry.id}
                                layout
                                className="border rounded-xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50"
                                >
                                    <div className={`px-3 py-1 rounded-lg font-bold ${getSeverityColor(entry.severity)}`}>
                                        {entry.severity}/5
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{entry.symptoms.join(', ')}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(entry.date).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short',
                                            })}
                                        </p>
                                    </div>
                                    {getMoodIcon(entry.mood)}
                                    {expandedEntry === entry.id ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {expandedEntry === entry.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t bg-gray-50 p-4"
                                        >
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {entry.symptoms.map((s) => (
                                                    <span key={s} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                            {entry.notes && (
                                                <p className="text-sm text-gray-600 mb-3">{entry.notes}</p>
                                            )}
                                            <button
                                                onClick={() => deleteEntry(entry.id)}
                                                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {isHindi ? 'हटाएं' : 'Delete'}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
