'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pill,
    Plus,
    Clock,
    Bell,
    BellOff,
    Trash2,
    Check,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { Medication } from '@/types';
import toast from 'react-hot-toast';

interface MedicationReminderProps {
    profileId?: string;
    language?: string;
}

export default function MedicationReminder({ profileId = 'default', language = 'en' }: MedicationReminderProps) {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newMed, setNewMed] = useState<Partial<Medication>>({
        name: '',
        dosage: '',
        frequency: 'once',
        times: ['08:00'],
        reminderEnabled: true,
    });

    const isHindi = language === 'hi';

    // Load medications from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(`medications_${profileId}`);
        if (saved) {
            const parsed = JSON.parse(saved);
            setMedications(parsed.map((m: any) => ({
                ...m,
                startDate: new Date(m.startDate),
                endDate: m.endDate ? new Date(m.endDate) : undefined,
            })));
        }
    }, [profileId]);

    // Save medications
    const saveMedications = (updated: Medication[]) => {
        localStorage.setItem(`medications_${profileId}`, JSON.stringify(updated));
        setMedications(updated);
    };

    // Request notification permission
    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                toast.success(isHindi ? 'सूचना सक्षम!' : 'Notifications enabled!');
            }
        }
    };

    // Schedule notification (simplified - in production use service worker)
    const scheduleReminder = (med: Medication) => {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        // For demo, show notification after 5 seconds
        setTimeout(() => {
            new Notification(`💊 ${isHindi ? 'दवा का समय' : 'Medicine Time'}`, {
                body: `${med.name} - ${med.dosage}`,
                icon: '/pill-icon.png',
                requireInteraction: true,
            });
        }, 5000);
    };

    const addMedication = () => {
        if (!newMed.name || !newMed.dosage) {
            toast.error(isHindi ? 'नाम और खुराक भरें' : 'Please fill name and dosage');
            return;
        }

        const medication: Medication = {
            id: Date.now().toString(),
            profileId,
            name: newMed.name || '',
            dosage: newMed.dosage || '',
            frequency: newMed.frequency || 'once',
            times: newMed.times || ['08:00'],
            startDate: new Date(),
            isActive: true,
            reminderEnabled: newMed.reminderEnabled ?? true,
        };

        saveMedications([...medications, medication]);
        setIsAddingNew(false);
        setNewMed({ name: '', dosage: '', frequency: 'once', times: ['08:00'], reminderEnabled: true });
        toast.success(isHindi ? 'दवा जोड़ी गई!' : 'Medication added!');

        if (medication.reminderEnabled) {
            requestNotificationPermission();
        }
    };

    const deleteMedication = (id: string) => {
        saveMedications(medications.filter(m => m.id !== id));
        toast.success(isHindi ? 'दवा हटा दी गई' : 'Medication removed');
    };

    const toggleReminder = (id: string) => {
        saveMedications(medications.map(m =>
            m.id === id ? { ...m, reminderEnabled: !m.reminderEnabled } : m
        ));
    };

    const toggleActive = (id: string) => {
        saveMedications(medications.map(m =>
            m.id === id ? { ...m, isActive: !m.isActive } : m
        ));
    };

    const getFrequencyLabel = (freq: string) => {
        const labels: Record<string, { en: string; hi: string }> = {
            once: { en: 'Once daily', hi: 'दिन में एक बार' },
            twice: { en: 'Twice daily', hi: 'दिन में दो बार' },
            thrice: { en: 'Thrice daily', hi: 'दिन में तीन बार' },
            custom: { en: 'Custom', hi: 'कस्टम' },
        };
        return isHindi ? labels[freq]?.hi || freq : labels[freq]?.en || freq;
    };

    const getTimesForFrequency = (freq: string): string[] => {
        switch (freq) {
            case 'once': return ['08:00'];
            case 'twice': return ['08:00', '20:00'];
            case 'thrice': return ['08:00', '14:00', '20:00'];
            default: return ['08:00'];
        }
    };

    const activeMeds = medications.filter(m => m.isActive);
    const inactiveMeds = medications.filter(m => !m.isActive);

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Pill className="w-7 h-7" />
                    {isHindi ? 'दवा रिमाइंडर' : 'Medication Reminder'}
                </h2>
                <p className="text-pink-100 mt-1">
                    {isHindi
                        ? 'अपनी दवाइयां समय पर लें'
                        : 'Never miss your medications'
                    }
                </p>
            </div>

            <div className="p-6">
                {/* Quick Stats */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 bg-pink-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-pink-600">{activeMeds.length}</p>
                        <p className="text-sm text-pink-700">{isHindi ? 'सक्रिय दवाइयां' : 'Active Medications'}</p>
                    </div>
                    <div className="flex-1 bg-green-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">
                            {activeMeds.reduce((acc, m) => acc + m.times.length, 0)}
                        </p>
                        <p className="text-sm text-green-700">{isHindi ? 'आज की खुराकें' : "Today's Doses"}</p>
                    </div>
                </div>

                {/* Add New Button */}
                {!isAddingNew && (
                    <button
                        onClick={() => setIsAddingNew(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-pink-300 rounded-xl text-pink-600 hover:bg-pink-50 transition-colors mb-6"
                    >
                        <Plus className="w-5 h-5" />
                        {isHindi ? 'नई दवा जोड़ें' : 'Add New Medication'}
                    </button>
                )}

                {/* Add New Form */}
                <AnimatePresence>
                    {isAddingNew && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-2 border-pink-500 rounded-xl p-4 mb-6 bg-pink-50"
                        >
                            <h3 className="font-semibold mb-4">{isHindi ? 'नई दवा' : 'Add Medication'}</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {isHindi ? 'दवा का नाम' : 'Medicine Name'}
                                    </label>
                                    <input
                                        type="text"
                                        value={newMed.name}
                                        onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        placeholder={isHindi ? 'जैसे पैरासिटामोल' : 'e.g., Paracetamol'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {isHindi ? 'खुराक' : 'Dosage'}
                                    </label>
                                    <input
                                        type="text"
                                        value={newMed.dosage}
                                        onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                        placeholder={isHindi ? 'जैसे 1 गोली' : 'e.g., 1 tablet'}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {isHindi ? 'कितनी बार' : 'Frequency'}
                                    </label>
                                    <select
                                        value={newMed.frequency}
                                        onChange={(e) => setNewMed({
                                            ...newMed,
                                            frequency: e.target.value as any,
                                            times: getTimesForFrequency(e.target.value)
                                        })}
                                        className="w-full px-3 py-2 border rounded-lg text-sm"
                                    >
                                        <option value="once">{isHindi ? 'दिन में एक बार' : 'Once daily'}</option>
                                        <option value="twice">{isHindi ? 'दिन में दो बार' : 'Twice daily'}</option>
                                        <option value="thrice">{isHindi ? 'दिन में तीन बार' : 'Thrice daily'}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {isHindi ? 'समय' : 'Time(s)'}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {newMed.times?.map((time, index) => (
                                            <input
                                                key={index}
                                                type="time"
                                                value={time}
                                                onChange={(e) => {
                                                    const newTimes = [...(newMed.times || [])];
                                                    newTimes[index] = e.target.value;
                                                    setNewMed({ ...newMed, times: newTimes });
                                                }}
                                                className="px-3 py-2 border rounded-lg text-sm"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Reminder Toggle */}
                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    onClick={() => setNewMed({ ...newMed, reminderEnabled: !newMed.reminderEnabled })}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${newMed.reminderEnabled
                                            ? 'bg-pink-500 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    {newMed.reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                                    {isHindi ? 'रिमाइंडर' : 'Reminder'} {newMed.reminderEnabled ? 'ON' : 'OFF'}
                                </button>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={addMedication}
                                    className="flex-1 py-2 bg-pink-500 text-white rounded-lg font-medium"
                                >
                                    {isHindi ? 'जोड़ें' : 'Add Medication'}
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

                {/* Active Medications */}
                {activeMeds.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            {isHindi ? 'सक्रिय दवाइयां' : 'Active Medications'}
                        </h3>
                        <div className="space-y-3">
                            {activeMeds.map((med) => (
                                <motion.div
                                    key={med.id}
                                    layout
                                    className="border rounded-xl p-4 bg-green-50"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{med.name}</h4>
                                            <p className="text-sm text-gray-600">{med.dosage}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {getFrequencyLabel(med.frequency)}
                                                </span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500">
                                                    {med.times.join(', ')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleReminder(med.id)}
                                                className={`p-2 rounded-lg ${med.reminderEnabled ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'
                                                    }`}
                                                title={med.reminderEnabled ? 'Disable reminder' : 'Enable reminder'}
                                            >
                                                {med.reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => toggleActive(med.id)}
                                                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                                title="Mark as completed"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteMedication(med.id)}
                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed/Inactive */}
                {inactiveMeds.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-gray-500 mb-3">
                            {isHindi ? 'पूर्ण दवाइयां' : 'Completed/Inactive'}
                        </h3>
                        <div className="space-y-2">
                            {inactiveMeds.map((med) => (
                                <div key={med.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 opacity-60">
                                    <div>
                                        <p className="font-medium text-gray-600 line-through">{med.name}</p>
                                        <p className="text-sm text-gray-400">{med.dosage}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleActive(med.id)}
                                            className="text-sm text-blue-500 hover:underline"
                                        >
                                            {isHindi ? 'पुनः सक्रिय करें' : 'Reactivate'}
                                        </button>
                                        <button
                                            onClick={() => deleteMedication(med.id)}
                                            className="text-sm text-red-500 hover:underline"
                                        >
                                            {isHindi ? 'हटाएं' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {medications.length === 0 && !isAddingNew && (
                    <div className="text-center py-12 text-gray-500">
                        <Pill className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>{isHindi ? 'कोई दवा नहीं जोड़ी' : 'No medications added'}</p>
                        <p className="text-sm">{isHindi ? 'अपनी दवाइयां ट्रैक करें' : 'Start tracking your medications'}</p>
                    </div>
                )}

                {/* Tip */}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    {isHindi
                        ? 'हमेशा डॉक्टर की सलाह के अनुसार दवा लें। खुद से दवा न रोकें।'
                        : 'Always take medicines as prescribed. Never stop medication without consulting your doctor.'
                    }
                </div>
            </div>
        </div>
    );
}
