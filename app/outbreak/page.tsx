'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, MapPin, TrendingUp, Activity, Bell, Filter,
    ChevronDown, RefreshCw, ThermometerSun, Droplets, Wind, Bug,
    BarChart3, Map, List, Clock, AlertCircle, CheckCircle
} from 'lucide-react';
import { SAMPLE_OUTBREAK_ALERTS, SAMPLE_SYMPTOM_REPORTS, OutbreakAlert, SymptomReport } from '@/lib/ashaData';
import toast from 'react-hot-toast';

export default function OutbreakDashboard() {
    const [alerts, setAlerts] = useState<OutbreakAlert[]>(SAMPLE_OUTBREAK_ALERTS);
    const [reports, setReports] = useState<SymptomReport[]>(SAMPLE_SYMPTOM_REPORTS);
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [selectedSymptom, setSelectedSymptom] = useState<string>('all');
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Aggregate symptom data
    const symptomStats = reports.reduce((acc, report) => {
        acc[report.symptom] = (acc[report.symptom] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const symptoms = Object.entries(symptomStats)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

    // Location aggregation for heatmap
    const locationStats = reports.reduce((acc, report) => {
        const key = report.location;
        if (!acc[key]) {
            acc[key] = { location: key, count: 0, symptoms: {}, coordinates: report.coordinates };
        }
        acc[key].count++;
        acc[key].symptoms[report.symptom] = (acc[key].symptoms[report.symptom] || 0) + 1;
        return acc;
    }, {} as Record<string, { location: string; count: number; symptoms: Record<string, number>; coordinates: { lat: number; lng: number } }>);

    const locations = Object.values(locationStats).sort((a, b) => b.count - a.count);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsRefreshing(false);
        toast.success('Data refreshed');
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getSymptomIcon = (symptom: string) => {
        switch (symptom.toLowerCase()) {
            case 'fever': return ThermometerSun;
            case 'diarrhea': return Droplets;
            case 'cough': return Wind;
            default: return Bug;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            {/* Header */}
            <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Disease Outbreak Detection</h1>
                            <p className="text-gray-400 text-sm">Real-time surveillance system</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as any)}
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 space-y-6">
                {/* Active Alerts Banner */}
                {alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-red-600/80 to-orange-600/80 backdrop-blur-lg rounded-xl p-4 border border-red-400/30"
                    >
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-yellow-200 animate-pulse" />
                            <div className="flex-1">
                                <p className="font-bold">⚠️ Active Outbreak Alert</p>
                                <p className="text-sm text-red-100">
                                    {alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length} high-severity clusters detected. Immediate attention required.
                                </p>
                            </div>
                            <button className="px-4 py-2 bg-white text-red-600 rounded-lg font-semibold hover:bg-red-50">
                                View Details
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={Activity}
                        label="Total Reports"
                        value={reports.length}
                        change="+12%"
                        positive={false}
                    />
                    <StatCard
                        icon={MapPin}
                        label="Affected Areas"
                        value={locations.length}
                        change="+2"
                        positive={false}
                    />
                    <StatCard
                        icon={AlertTriangle}
                        label="Active Alerts"
                        value={alerts.length}
                        change="+1"
                        positive={false}
                    />
                    <StatCard
                        icon={Bell}
                        label="Notifications Sent"
                        value={15}
                        change="Today"
                        positive={true}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Heatmap / Map View */}
                    <div className="lg:col-span-2 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h2 className="font-bold flex items-center gap-2">
                                <Map className="w-5 h-5" />
                                Symptom Heatmap
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`px-3 py-1 rounded-lg text-sm ${viewMode === 'map' ? 'bg-purple-500' : 'bg-white/10'}`}
                                >
                                    Map
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1 rounded-lg text-sm ${viewMode === 'list' ? 'bg-purple-500' : 'bg-white/10'}`}
                                >
                                    List
                                </button>
                            </div>
                        </div>

                        {viewMode === 'map' ? (
                            <div className="p-4">
                                {/* Simulated Heatmap */}
                                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl h-[400px] overflow-hidden">
                                    {/* Grid overlay */}
                                    <div className="absolute inset-0 opacity-20">
                                        <div className="grid grid-cols-8 grid-rows-6 h-full">
                                            {Array.from({ length: 48 }).map((_, i) => (
                                                <div key={i} className="border border-white/20" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cluster markers */}
                                    {locations.map((loc, index) => {
                                        const size = Math.min(loc.count * 20, 120);
                                        const x = 20 + (index * 25) % 60;
                                        const y = 20 + Math.floor(index / 3) * 30;
                                        const severity = loc.count >= 5 ? 'critical' : loc.count >= 3 ? 'high' : 'medium';

                                        return (
                                            <motion.div
                                                key={loc.location}
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className="absolute cursor-pointer group"
                                                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                                            >
                                                {/* Pulsing circle */}
                                                <div
                                                    className={`rounded-full animate-ping absolute ${getSeverityColor(severity)} opacity-75`}
                                                    style={{ width: size, height: size }}
                                                />
                                                {/* Solid circle */}
                                                <div
                                                    className={`rounded-full ${getSeverityColor(severity)} opacity-90 relative flex items-center justify-center`}
                                                    style={{ width: size * 0.7, height: size * 0.7 }}
                                                >
                                                    <span className="text-white font-bold text-xs">{loc.count}</span>
                                                </div>

                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                                    <div className="bg-black/90 rounded-lg p-3 text-sm whitespace-nowrap">
                                                        <p className="font-bold">{loc.location}</p>
                                                        <p className="text-gray-300">{loc.count} cases reported</p>
                                                        <div className="flex gap-2 mt-1">
                                                            {Object.entries(loc.symptoms).map(([s, c]) => (
                                                                <span key={s} className="text-xs bg-white/20 px-2 py-0.5 rounded">
                                                                    {s}: {c}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                    {/* Legend */}
                                    <div className="absolute bottom-4 left-4 bg-black/60 rounded-lg p-3 space-y-2">
                                        <p className="text-xs font-bold text-gray-300">Severity</p>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <span>Critical (5+ cases)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                                            <span>High (3-4 cases)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                            <span>Medium (1-2 cases)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
                                {locations.map((loc, index) => (
                                    <motion.div
                                        key={loc.location}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-purple-400" />
                                            <div>
                                                <p className="font-semibold">{loc.location}</p>
                                                <p className="text-sm text-gray-400">
                                                    {Object.entries(loc.symptoms).map(([s, c]) => `${s} (${c})`).join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold">{loc.count}</p>
                                            <p className="text-xs text-gray-400">cases</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Alerts & Trends */}
                    <div className="space-y-6">
                        {/* Active Alerts */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
                            <div className="p-4 border-b border-white/10">
                                <h2 className="font-bold flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    Active Alerts ({alerts.length})
                                </h2>
                            </div>
                            <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                                {alerts.map((alert) => {
                                    const Icon = getSymptomIcon(alert.symptom);
                                    return (
                                        <div
                                            key={alert.id}
                                            className={`p-3 rounded-lg border ${alert.severity === 'critical' ? 'bg-red-500/20 border-red-500/30' :
                                                    alert.severity === 'high' ? 'bg-orange-500/20 border-orange-500/30' :
                                                        'bg-yellow-500/20 border-yellow-500/30'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <Icon className="w-5 h-5" />
                                                <span className="font-bold">{alert.symptom}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${alert.severity === 'critical' ? 'bg-red-500' :
                                                        alert.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                                                    } text-white`}>
                                                    {alert.severity}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-300">{alert.location}</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {alert.casesCount} cases • +{alert.percentageIncrease}% increase
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Symptom Trends */}
                        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
                            <div className="p-4 border-b border-white/10">
                                <h2 className="font-bold flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-purple-400" />
                                    Symptom Trends
                                </h2>
                            </div>
                            <div className="p-4 space-y-3">
                                {symptoms.map((symptom, index) => {
                                    const percentage = (symptom.count / reports.length) * 100;
                                    const Icon = getSymptomIcon(symptom.name);
                                    return (
                                        <div key={symptom.name}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm">{symptom.name}</span>
                                                </div>
                                                <span className="text-sm font-bold">{symptom.count}</span>
                                            </div>
                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Possible Causes Panel */}
                <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                    <h2 className="font-bold mb-4 flex items-center gap-2">
                        <Bug className="w-5 h-5 text-green-400" />
                        Possible Causes & Recommendations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alerts.map((alert) => (
                            <div key={alert.id} className="bg-white/5 rounded-lg p-4">
                                <h3 className="font-semibold text-lg mb-2">{alert.symptom} Cluster - {alert.location}</h3>
                                <p className="text-sm text-gray-400 mb-3">Possible causes:</p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    {alert.possibleCauses.map((cause) => (
                                        <li key={cause} className="text-gray-300">{cause}</li>
                                    ))}
                                </ul>
                                <button className="mt-4 w-full py-2 bg-purple-500/50 hover:bg-purple-500/70 rounded-lg text-sm font-medium transition-colors">
                                    Notify Health Officer
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, change, positive }: {
    icon: any;
    label: string;
    value: number;
    change: string;
    positive: boolean;
}) {
    return (
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-purple-400" />
                <span className={`text-xs px-2 py-0.5 rounded ${positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {change}
                </span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-400">{label}</p>
        </div>
    );
}
