'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, AlertTriangle, Baby, Heart, Activity, Calendar, Phone,
    FileText, TrendingUp, Search, Filter, Plus, ChevronRight,
    MapPin, Clock, CheckCircle, XCircle, User, Stethoscope
} from 'lucide-react';
import {
    SAMPLE_ASHA_WORKER, SAMPLE_PATIENTS, SAMPLE_REFERRALS,
    Patient, Referral, AshaWorker
} from '@/lib/ashaData';
import toast from 'react-hot-toast';

export default function ASHADashboard() {
    const [ashaWorker] = useState<AshaWorker>(SAMPLE_ASHA_WORKER);
    const [patients, setPatients] = useState<Patient[]>(SAMPLE_PATIENTS);
    const [referrals, setReferrals] = useState<Referral[]>(SAMPLE_REFERRALS);
    const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'referrals' | 'register'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRisk, setFilterRisk] = useState<string>('all');
    const [showReferralModal, setShowReferralModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // Stats
    const stats = {
        totalPatients: patients.length,
        highRisk: patients.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
        pregnantWomen: patients.filter(p => p.isPregnant).length,
        elderly: patients.filter(p => p.isElderly).length,
        pendingFollowUps: patients.filter(p => p.nextFollowUp && new Date(p.nextFollowUp) <= new Date()).length,
        pendingReferrals: referrals.filter(r => r.status === 'pending').length,
    };

    const filteredPatients = patients.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.phone.includes(searchQuery);
        const matchesRisk = filterRisk === 'all' || p.riskLevel === filterRisk;
        return matchesSearch && matchesRisk;
    });

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getRiskBadgeColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const createReferral = (patient: Patient, referTo: string, reason: string, urgency: string) => {
        const newReferral: Referral = {
            id: `ref-${Date.now()}`,
            patientId: patient.id,
            patientName: patient.name,
            referredTo: referTo as any,
            reason,
            urgency: urgency as any,
            symptoms: patient.conditions,
            status: 'pending',
            createdAt: new Date(),
        };
        setReferrals([...referrals, newReferral]);
        toast.success(`Referral created for ${patient.name}`);
        setShowReferralModal(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">ASHA Worker Dashboard</h1>
                            <p className="text-green-100 text-sm">{ashaWorker.name} • {ashaWorker.village}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-green-100">Assigned Patients</p>
                        <p className="text-2xl font-bold">{ashaWorker.assignedPatients}</p>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex">
                    {[
                        { id: 'overview', label: 'Overview', icon: Activity },
                        { id: 'patients', label: 'Patients', icon: Users },
                        { id: 'referrals', label: 'Referrals', icon: FileText },
                        { id: 'register', label: 'Register New', icon: Plus },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-4 px-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === tab.id
                                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                                    : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-4">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} color="blue" />
                            <StatCard icon={AlertTriangle} label="High Risk" value={stats.highRisk} color="red" />
                            <StatCard icon={Baby} label="Pregnant Women" value={stats.pregnantWomen} color="pink" />
                            <StatCard icon={Heart} label="Elderly (65+)" value={stats.elderly} color="purple" />
                            <StatCard icon={Calendar} label="Follow-ups Due" value={stats.pendingFollowUps} color="orange" />
                            <StatCard icon={FileText} label="Pending Referrals" value={stats.pendingReferrals} color="yellow" />
                        </div>

                        {/* Priority Patients */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Priority Patients (Require Attention)
                            </h2>
                            <div className="space-y-3">
                                {patients
                                    .filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high')
                                    .slice(0, 5)
                                    .map((patient) => (
                                        <div
                                            key={patient.id}
                                            className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${getRiskColor(patient.riskLevel)} animate-pulse`} />
                                                <div>
                                                    <p className="font-semibold">{patient.name}</p>
                                                    <p className="text-sm text-gray-600">{patient.riskFactors.join(', ')}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskBadgeColor(patient.riskLevel)}`}>
                                                    {patient.riskLevel.toUpperCase()}
                                                </span>
                                                <button
                                                    onClick={() => { setSelectedPatient(patient); setShowReferralModal(true); }}
                                                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                                                >
                                                    Refer
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Today's Follow-ups */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                Today's Follow-ups
                            </h2>
                            <div className="space-y-3">
                                {patients
                                    .filter(p => p.nextFollowUp)
                                    .slice(0, 5)
                                    .map((patient) => (
                                        <div
                                            key={patient.id}
                                            className="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
                                        >
                                            <div>
                                                <p className="font-semibold">{patient.name}</p>
                                                <p className="text-sm text-gray-600">{patient.conditions.join(', ')}</p>
                                            </div>
                                            <a
                                                href={`tel:${patient.phone}`}
                                                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                            >
                                                <Phone className="w-4 h-4" />
                                                Call
                                            </a>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Patients Tab */}
                {activeTab === 'patients' && (
                    <div className="space-y-4">
                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search patients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                                />
                            </div>
                            <select
                                value={filterRisk}
                                onChange={(e) => setFilterRisk(e.target.value)}
                                className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none"
                            >
                                <option value="all">All Risk Levels</option>
                                <option value="critical">Critical</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        {/* Patient List */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {filteredPatients.map((patient, index) => (
                                <motion.div
                                    key={patient.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 border-b last:border-b-0 hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${patient.gender === 'female' ? 'bg-pink-100' : 'bg-blue-100'}`}>
                                                <User className={`w-6 h-6 ${patient.gender === 'female' ? 'text-pink-600' : 'text-blue-600'}`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold">{patient.name}</p>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRiskBadgeColor(patient.riskLevel)}`}>
                                                        {patient.riskLevel}
                                                    </span>
                                                    {patient.isPregnant && <Baby className="w-4 h-4 text-pink-500" />}
                                                    {patient.isElderly && <Heart className="w-4 h-4 text-purple-500" />}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {patient.age} yrs • {patient.gender} • {patient.conditions.slice(0, 2).join(', ')}
                                                </p>
                                                {patient.abhaId && (
                                                    <p className="text-xs text-green-600">ABHA: {patient.abhaId}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`tel:${patient.phone}`}
                                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                            >
                                                <Phone className="w-5 h-5" />
                                            </a>
                                            <button
                                                onClick={() => { setSelectedPatient(patient); setShowReferralModal(true); }}
                                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                            >
                                                <FileText className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Referrals Tab */}
                {activeTab === 'referrals' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-4 bg-gray-50 border-b">
                                <h2 className="font-bold">Referral History</h2>
                            </div>
                            {referrals.map((referral) => (
                                <div key={referral.id} className="p-4 border-b last:border-b-0">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">{referral.patientName}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${referral.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                                                    referral.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {referral.urgency}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600">To: {referral.referredTo}</p>
                                            <p className="text-sm text-gray-500">{referral.reason}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${referral.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {referral.status === 'completed' ? <CheckCircle className="w-3 h-3" /> :
                                                    referral.status === 'pending' ? <Clock className="w-3 h-3" /> :
                                                        <XCircle className="w-3 h-3" />}
                                                {referral.status}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(referral.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Register New Patient Tab */}
                {activeTab === 'register' && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-lg font-bold mb-6">Register New Patient</h2>
                        <form className="space-y-4" onSubmit={(e) => {
                            e.preventDefault();
                            toast.success('Patient registered successfully!');
                            setActiveTab('patients');
                        }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                    <input type="text" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                                    <input type="tel" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                                    <input type="number" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                                    <select required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none">
                                        <option value="">Select</option>
                                        <option value="female">Female</option>
                                        <option value="male">Male</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ABHA ID (if available)</label>
                                    <input type="text" placeholder="91-XXXX-XXXX-XXXX" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Risk Factors</label>
                                    <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none">
                                        <option value="none">None</option>
                                        <option value="pregnant">Pregnant</option>
                                        <option value="elderly">Elderly (65+)</option>
                                        <option value="chronic">Chronic Disease</option>
                                        <option value="disability">Disability</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-600"
                            >
                                Register Patient
                            </button>
                        </form>
                    </div>
                )}
            </main>

            {/* Referral Modal */}
            <AnimatePresence>
                {showReferralModal && selectedPatient && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowReferralModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-white rounded-xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold mb-4">Create Referral</h3>
                            <p className="text-gray-600 mb-4">Patient: <strong>{selectedPatient.name}</strong></p>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                createReferral(
                                    selectedPatient,
                                    form.referTo.value,
                                    form.reason.value,
                                    form.urgency.value
                                );
                            }}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Refer To *</label>
                                        <select name="referTo" required className="w-full px-4 py-2 border rounded-lg">
                                            <option value="PHC">Primary Health Center (PHC)</option>
                                            <option value="CHC">Community Health Center (CHC)</option>
                                            <option value="District Hospital">District Hospital</option>
                                            <option value="Specialist">Specialist</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Urgency *</label>
                                        <select name="urgency" required className="w-full px-4 py-2 border rounded-lg">
                                            <option value="routine">Routine</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="emergency">Emergency</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Reason *</label>
                                        <textarea name="reason" required rows={3} className="w-full px-4 py-2 border rounded-lg" placeholder="Describe the reason for referral..." />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button type="button" onClick={() => setShowReferralModal(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                        Create Referral
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-600',
        red: 'bg-red-100 text-red-600',
        pink: 'bg-pink-100 text-pink-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        green: 'bg-green-100 text-green-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-600">{label}</p>
        </div>
    );
}
