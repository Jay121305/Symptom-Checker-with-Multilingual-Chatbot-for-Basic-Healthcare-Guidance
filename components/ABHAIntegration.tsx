'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, FileText, Shield, CheckCircle, AlertCircle, ExternalLink,
    User, Calendar, MapPin, Phone, ChevronRight, Download, Eye, X,
    BadgeCheck, Pill, Syringe, Activity
} from 'lucide-react';
import { SAMPLE_ABHA_PROFILE, SAMPLE_AYUSHMAN_ELIGIBILITY, ABHAProfile, MedicalRecord, AyushmanEligibility } from '@/lib/ashaData';
import toast from 'react-hot-toast';

interface ABHAIntegrationProps {
    onClose: () => void;
}

export default function ABHAIntegration({ onClose }: ABHAIntegrationProps) {
    const [step, setStep] = useState<'link' | 'verify' | 'profile'>('link');
    const [abhaNumber, setAbhaNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [profile, setProfile] = useState<ABHAProfile | null>(null);
    const [eligibility, setEligibility] = useState<AyushmanEligibility | null>(null);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

    const handleLinkAbha = async () => {
        if (!abhaNumber || abhaNumber.length < 14) {
            toast.error('Please enter a valid ABHA number');
            return;
        }
        setStep('verify');
        toast.success('OTP sent to registered mobile');
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            toast.error('Please enter 6-digit OTP');
            return;
        }
        setIsVerifying(true);

        // Simulate verification
        await new Promise(resolve => setTimeout(resolve, 2000));

        setProfile(SAMPLE_ABHA_PROFILE);
        setEligibility(SAMPLE_AYUSHMAN_ELIGIBILITY);
        setStep('profile');
        setIsVerifying(false);
        toast.success('ABHA linked successfully!');
    };

    const getRecordIcon = (type: string) => {
        switch (type) {
            case 'prescription': return Pill;
            case 'lab_report': return Activity;
            case 'immunization': return Syringe;
            default: return FileText;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">ABHA Integration</h1>
                                <p className="text-orange-100 text-sm">Ayushman Bharat Health Account</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Link ABHA */}
                        {step === 'link' && (
                            <motion.div
                                key="link"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <Shield className="w-10 h-10 text-orange-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Link Your ABHA</h2>
                                    <p className="text-gray-600 mt-2">
                                        Connect your Ayushman Bharat Health Account to access your health records
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ABHA Number (14 digits)
                                    </label>
                                    <input
                                        type="text"
                                        value={abhaNumber}
                                        onChange={(e) => setAbhaNumber(e.target.value.replace(/[^0-9-]/g, ''))}
                                        placeholder="XX-XXXX-XXXX-XXXX"
                                        maxLength={17}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-center text-lg tracking-wider"
                                    />
                                </div>

                                <div className="bg-blue-50 rounded-xl p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">What is ABHA?</h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Unique 14-digit health ID for every Indian citizen</li>
                                        <li>• Access all your medical records in one place</li>
                                        <li>• Check Ayushman Bharat eligibility</li>
                                        <li>• Share records securely with doctors</li>
                                    </ul>
                                </div>

                                <button
                                    onClick={handleLinkAbha}
                                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
                                >
                                    Link ABHA Account
                                </button>

                                <p className="text-center text-sm text-gray-500">
                                    Don't have ABHA? <a href="https://abha.abdm.gov.in" target="_blank" className="text-orange-600 font-medium">Create now →</a>
                                </p>
                            </motion.div>
                        )}

                        {/* Step 2: Verify OTP */}
                        {step === 'verify' && (
                            <motion.div
                                key="verify"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                        <Phone className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Verify OTP</h2>
                                    <p className="text-gray-600 mt-2">
                                        Enter the 6-digit OTP sent to your registered mobile number
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter OTP
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                        placeholder="• • • • • •"
                                        maxLength={6}
                                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none text-center text-2xl tracking-[1em]"
                                    />
                                </div>

                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={isVerifying}
                                    className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isVerifying ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify & Link'
                                    )}
                                </button>

                                <button onClick={() => setStep('link')} className="w-full py-2 text-gray-600 text-sm">
                                    ← Back to ABHA entry
                                </button>
                            </motion.div>
                        )}

                        {/* Step 3: Profile View */}
                        {step === 'profile' && profile && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                {/* Profile Card */}
                                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <BadgeCheck className="w-5 h-5" />
                                                <span className="text-sm opacity-90">Verified ABHA Profile</span>
                                            </div>
                                            <h2 className="text-2xl font-bold">{profile.name}</h2>
                                            <p className="text-orange-100">{profile.abhaAddress}</p>
                                        </div>
                                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                                            <User className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-orange-200">ABHA Number</p>
                                            <p className="font-mono font-semibold">{profile.abhaNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-orange-200">Year of Birth</p>
                                            <p className="font-semibold">{profile.yearOfBirth}</p>
                                        </div>
                                        <div>
                                            <p className="text-orange-200">Gender</p>
                                            <p className="font-semibold">{profile.gender}</p>
                                        </div>
                                        <div>
                                            <p className="text-orange-200">Location</p>
                                            <p className="font-semibold">{profile.district}, {profile.state}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Ayushman Bharat Eligibility */}
                                {eligibility && (
                                    <div className={`rounded-xl p-4 border-2 ${eligibility.eligible
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-gray-50 border-gray-200'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${eligibility.eligible ? 'bg-green-500' : 'bg-gray-400'
                                                }`}>
                                                {eligibility.eligible ? (
                                                    <CheckCircle className="w-5 h-5 text-white" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900">
                                                    {eligibility.eligible ? 'Ayushman Bharat Eligible ✓' : 'Not Eligible for Ayushman Bharat'}
                                                </h3>
                                                {eligibility.eligible && (
                                                    <p className="text-sm text-gray-600">
                                                        Card: {eligibility.cardNumber} • Coverage: ₹{(eligibility.coverageAmount / 100000).toFixed(0)} Lakh
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {eligibility.eligible && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {eligibility.coveredTreatments.slice(0, 4).map((treatment) => (
                                                    <span key={treatment} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                        {treatment}
                                                    </span>
                                                ))}
                                                <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">
                                                    +{eligibility.coveredTreatments.length - 4} more
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Health Records */}
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-orange-500" />
                                        Linked Health Records ({profile.linkedRecords.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {profile.linkedRecords.map((record) => {
                                            const Icon = getRecordIcon(record.type);
                                            return (
                                                <button
                                                    key={record.id}
                                                    onClick={() => setSelectedRecord(record)}
                                                    className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center gap-4 text-left transition-colors"
                                                >
                                                    <div className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center">
                                                        <Icon className="w-5 h-5 text-orange-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 truncate">{record.title}</p>
                                                        <p className="text-sm text-gray-500">{record.facility}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(record.date).toLocaleDateString()}
                                                        </p>
                                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Record Detail Modal */}
                <AnimatePresence>
                    {selectedRecord && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4"
                            onClick={() => setSelectedRecord(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="bg-white rounded-xl max-w-md w-full p-6"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-lg">{selectedRecord.title}</h3>
                                    <button onClick={() => setSelectedRecord(null)} className="p-1 hover:bg-gray-100 rounded">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-500">Facility:</span>
                                        <p className="font-medium">{selectedRecord.facility}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Date:</span>
                                        <p className="font-medium">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                                    </div>
                                    {selectedRecord.doctorName && (
                                        <div>
                                            <span className="text-gray-500">Doctor:</span>
                                            <p className="font-medium">{selectedRecord.doctorName}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500">Summary:</span>
                                        <p className="font-medium">{selectedRecord.summary}</p>
                                    </div>
                                </div>
                                <button className="w-full mt-6 py-2 bg-orange-500 text-white rounded-lg font-medium flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Download Record
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
