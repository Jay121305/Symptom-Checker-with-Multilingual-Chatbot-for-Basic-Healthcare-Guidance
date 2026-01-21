'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, X, Plus, Trash2, Clock, Calendar,
    CheckCircle, AlertCircle, Loader2, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PushNotificationSettingsProps {
    onClose: () => void;
    language: string;
}

interface NotificationSchedule {
    id: string;
    type: 'medication' | 'checkup' | 'water' | 'exercise' | 'custom';
    title: string;
    time: string;
    days: string[];
    enabled: boolean;
}

const notificationTypes = [
    { id: 'medication', label: 'Medication Reminder', labelHi: 'दवा याद दिलाना', icon: '💊' },
    { id: 'checkup', label: 'Health Checkup', labelHi: 'स्वास्थ्य जांच', icon: '🏥' },
    { id: 'water', label: 'Drink Water', labelHi: 'पानी पीना', icon: '💧' },
    { id: 'exercise', label: 'Exercise Reminder', labelHi: 'व्यायाम याद', icon: '🏃' },
    { id: 'custom', label: 'Custom Reminder', labelHi: 'कस्टम याद', icon: '🔔' }
];

const daysOfWeek = [
    { id: 'mon', label: 'Mon', labelHi: 'सोम' },
    { id: 'tue', label: 'Tue', labelHi: 'मंगल' },
    { id: 'wed', label: 'Wed', labelHi: 'बुध' },
    { id: 'thu', label: 'Thu', labelHi: 'गुरु' },
    { id: 'fri', label: 'Fri', labelHi: 'शुक्र' },
    { id: 'sat', label: 'Sat', labelHi: 'शनि' },
    { id: 'sun', label: 'Sun', labelHi: 'रवि' }
];

export default function PushNotificationSettings({ onClose, language }: PushNotificationSettingsProps) {
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
    const [schedules, setSchedules] = useState<NotificationSchedule[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [newSchedule, setNewSchedule] = useState<Partial<NotificationSchedule>>({
        type: 'medication',
        title: '',
        time: '08:00',
        days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
        enabled: true
    });

    const isHindi = language === 'hi';

    useEffect(() => {
        // Check notification permission
        if (!('Notification' in window)) {
            setPermissionStatus('unsupported');
        } else {
            setPermissionStatus(Notification.permission);
        }

        // Load saved schedules
        const saved = localStorage.getItem('notification-schedules');
        if (saved) {
            setSchedules(JSON.parse(saved));
        }
    }, []);

    const requestPermission = async () => {
        if (!('Notification' in window)) {
            toast.error(isHindi ? 'यह ब्राउज़र नोटिफिकेशन सपोर्ट नहीं करता' : 'This browser does not support notifications');
            return;
        }

        setIsLoading(true);
        try {
            const permission = await Notification.requestPermission();
            setPermissionStatus(permission);

            if (permission === 'granted') {
                toast.success(isHindi ? 'नोटिफिकेशन सक्षम!' : 'Notifications enabled!');

                // Register service worker for push notifications
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.register('/sw.js');
                    console.log('Service Worker registered:', registration);
                }
            }
        } catch (error) {
            console.error('Permission error:', error);
            toast.error(isHindi ? 'अनुमति देने में त्रुटि' : 'Error requesting permission');
        }
        setIsLoading(false);
    };

    const saveSchedules = (newSchedules: NotificationSchedule[]) => {
        setSchedules(newSchedules);
        localStorage.setItem('notification-schedules', JSON.stringify(newSchedules));
    };

    const addSchedule = () => {
        if (!newSchedule.title && newSchedule.type === 'custom') {
            toast.error(isHindi ? 'कृपया शीर्षक दर्ज करें' : 'Please enter a title');
            return;
        }

        const typeLabel = notificationTypes.find(t => t.id === newSchedule.type);
        const schedule: NotificationSchedule = {
            id: Date.now().toString(),
            type: newSchedule.type as NotificationSchedule['type'],
            title: newSchedule.title || (isHindi ? typeLabel?.labelHi : typeLabel?.label) || 'Reminder',
            time: newSchedule.time || '08:00',
            days: newSchedule.days || [],
            enabled: true
        };

        saveSchedules([...schedules, schedule]);
        setShowAddForm(false);
        setNewSchedule({
            type: 'medication',
            title: '',
            time: '08:00',
            days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
            enabled: true
        });
        toast.success(isHindi ? 'रिमाइंडर जोड़ा गया' : 'Reminder added');
    };

    const toggleSchedule = (id: string) => {
        const updated = schedules.map(s =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
        );
        saveSchedules(updated);
    };

    const deleteSchedule = (id: string) => {
        saveSchedules(schedules.filter(s => s.id !== id));
        toast.success(isHindi ? 'रिमाइंडर हटाया गया' : 'Reminder removed');
    };

    const toggleDay = (day: string) => {
        setNewSchedule(prev => ({
            ...prev,
            days: prev.days?.includes(day)
                ? prev.days.filter(d => d !== day)
                : [...(prev.days || []), day]
        }));
    };

    const testNotification = () => {
        if (Notification.permission === 'granted') {
            new Notification('DeepBlue Health', {
                body: isHindi ? 'यह एक टेस्ट नोटिफिकेशन है!' : 'This is a test notification!',
                icon: '/icon-192.png',
                badge: '/badge-72.png'
            });
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Bell className="w-6 h-6" />
                                    {isHindi ? 'नोटिफिकेशन सेटिंग्स' : 'Notification Settings'}
                                </h2>
                                <p className="text-orange-100 text-sm mt-1">
                                    {isHindi ? 'स्वास्थ्य रिमाइंडर प्रबंधित करें' : 'Manage health reminders'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                        {/* Permission Status */}
                        {permissionStatus === 'unsupported' ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <p className="text-red-700 dark:text-red-300 text-sm">
                                    {isHindi ? 'यह ब्राउज़र नोटिफिकेशन सपोर्ट नहीं करता' : 'Notifications are not supported in this browser'}
                                </p>
                            </div>
                        ) : permissionStatus === 'denied' ? (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                                <div>
                                    <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                                        {isHindi ? 'नोटिफिकेशन ब्लॉक हैं' : 'Notifications are blocked'}
                                    </p>
                                    <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                                        {isHindi
                                            ? 'ब्राउज़र सेटिंग्स से अनुमति दें'
                                            : 'Enable notifications in browser settings'}
                                    </p>
                                </div>
                            </div>
                        ) : permissionStatus === 'granted' ? (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex justify-between items-center">
                                <div className="flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <div>
                                        <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                                            {isHindi ? 'नोटिफिकेशन सक्षम' : 'Notifications enabled'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={testNotification}
                                    className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700"
                                >
                                    {isHindi ? 'टेस्ट' : 'Test'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={requestPermission}
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Bell className="w-5 h-5" />
                                        {isHindi ? 'नोटिफिकेशन सक्षम करें' : 'Enable Notifications'}
                                    </>
                                )}
                            </button>
                        )}

                        {/* Scheduled Reminders */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    {isHindi ? 'शेड्यूल रिमाइंडर' : 'Scheduled Reminders'}
                                </h3>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    {isHindi ? 'जोड़ें' : 'Add'}
                                </button>
                            </div>

                            {schedules.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>{isHindi ? 'कोई रिमाइंडर नहीं' : 'No reminders set'}</p>
                                    <p className="text-xs mt-1">
                                        {isHindi ? 'स्वास्थ्य रिमाइंडर जोड़ने के लिए + दबाएं' : 'Click + to add health reminders'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {schedules.map(schedule => {
                                        const typeInfo = notificationTypes.find(t => t.id === schedule.type);
                                        return (
                                            <div
                                                key={schedule.id}
                                                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${schedule.enabled
                                                        ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                                        : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-60'
                                                    }`}
                                            >
                                                <span className="text-2xl">{typeInfo?.icon}</span>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {schedule.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        {schedule.time}
                                                        <span className="mx-1">•</span>
                                                        {schedule.days.length === 7
                                                            ? (isHindi ? 'प्रतिदिन' : 'Daily')
                                                            : schedule.days.map(d => d.charAt(0).toUpperCase()).join(', ')
                                                        }
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => toggleSchedule(schedule.id)}
                                                    className={`w-12 h-6 rounded-full relative transition-colors ${schedule.enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${schedule.enabled ? 'right-1' : 'left-1'
                                                        }`} />
                                                </button>
                                                <button
                                                    onClick={() => deleteSchedule(schedule.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Add Form */}
                        <AnimatePresence>
                            {showAddForm && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-4 bg-blue-50/50 dark:bg-blue-900/20"
                                >
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {isHindi ? 'नया रिमाइंडर जोड़ें' : 'Add New Reminder'}
                                    </h4>

                                    {/* Type Selection */}
                                    <div className="grid grid-cols-5 gap-2">
                                        {notificationTypes.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setNewSchedule(prev => ({ ...prev, type: type.id as NotificationSchedule['type'] }))}
                                                className={`p-3 rounded-lg text-center transition-all ${newSchedule.type === type.id
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <span className="text-xl block mb-1">{type.icon}</span>
                                                <span className="text-[10px]">{isHindi ? type.labelHi.split(' ')[0] : type.label.split(' ')[0]}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom Title */}
                                    {newSchedule.type === 'custom' && (
                                        <input
                                            type="text"
                                            value={newSchedule.title || ''}
                                            onChange={e => setNewSchedule(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder={isHindi ? 'रिमाइंडर शीर्षक' : 'Reminder title'}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    )}

                                    {/* Time */}
                                    <div>
                                        <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                                            {isHindi ? 'समय' : 'Time'}
                                        </label>
                                        <input
                                            type="time"
                                            value={newSchedule.time}
                                            onChange={e => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    {/* Days */}
                                    <div>
                                        <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                                            {isHindi ? 'दिन' : 'Days'}
                                        </label>
                                        <div className="flex gap-2">
                                            {daysOfWeek.map(day => (
                                                <button
                                                    key={day.id}
                                                    onClick={() => toggleDay(day.id)}
                                                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${newSchedule.days?.includes(day.id)
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                        }`}
                                                >
                                                    {isHindi ? day.labelHi : day.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowAddForm(false)}
                                            className="flex-1 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            {isHindi ? 'रद्द करें' : 'Cancel'}
                                        </button>
                                        <button
                                            onClick={addSchedule}
                                            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                                        >
                                            {isHindi ? 'जोड़ें' : 'Add'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
