'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin,
    Phone,
    Navigation,
    Building,
    Ambulance,
    Shield,
    Star,
    ExternalLink,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { SAMPLE_HOSPITALS } from '@/lib/uspData';
import { Hospital } from '@/types';

interface NearbyHospitalsProps {
    language?: string;
}

export default function NearbyHospitals({ language = 'en' }: NearbyHospitalsProps) {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');

    const isHindi = language === 'hi';

    // Get user location
    const getLocation = () => {
        setIsLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError(isHindi ? 'आपका ब्राउज़र लोकेशन सपोर्ट नहीं करता' : 'Your browser does not support location');
            setIsLoading(false);
            // Use sample data
            setHospitals(SAMPLE_HOSPITALS as Hospital[]);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });

                // Calculate distances and set hospitals
                const hospitalsWithDistance = SAMPLE_HOSPITALS.map(h => ({
                    ...h,
                    distance: calculateDistance(latitude, longitude, h.latitude, h.longitude)
                })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

                setHospitals(hospitalsWithDistance as Hospital[]);
                setIsLoading(false);
            },
            (err) => {
                console.error('Location error:', err);
                setError(isHindi ? 'लोकेशन प्राप्त करने में त्रुटि' : 'Error getting location');
                // Use sample data
                setHospitals(SAMPLE_HOSPITALS as Hospital[]);
                setIsLoading(false);
            }
        );
    };

    // Calculate distance between two points (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10) / 10; // Distance in km, rounded to 1 decimal
    };

    useEffect(() => {
        getLocation();
    }, []);

    const filteredHospitals = hospitals.filter(h => {
        if (filter === 'all') return true;
        if (filter === 'emergency') return h.emergencyAvailable;
        if (filter === 'ayushman') return h.ayushmanEmpaneled;
        return h.type === filter;
    });

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'government': return 'bg-green-100 text-green-700';
            case 'phc': return 'bg-blue-100 text-blue-700';
            case 'private': return 'bg-purple-100 text-purple-700';
            case 'clinic': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeLabel = (type: string) => {
        const labels: Record<string, { en: string; hi: string }> = {
            government: { en: 'Government', hi: 'सरकारी' },
            phc: { en: 'PHC', hi: 'प्राथमिक स्वास्थ्य केंद्र' },
            private: { en: 'Private', hi: 'निजी' },
            clinic: { en: 'Clinic', hi: 'क्लिनिक' },
        };
        return isHindi ? labels[type]?.hi || type : labels[type]?.en || type;
    };

    const openInMaps = (hospital: Hospital) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`;
        window.open(url, '_blank');
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MapPin className="w-7 h-7" />
                    {isHindi ? 'नजदीकी अस्पताल' : 'Nearby Hospitals'}
                </h2>
                <p className="text-blue-100 mt-1">
                    {isHindi
                        ? 'अपने आस-पास के स्वास्थ्य केंद्र खोजें'
                        : 'Find healthcare facilities near you'
                    }
                </p>

                {/* Emergency Button */}
                <a
                    href="tel:108"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-colors"
                >
                    <Ambulance className="w-5 h-5" />
                    {isHindi ? 'एम्बुलेंस 108' : 'Ambulance 108'}
                </a>
            </div>

            <div className="p-6">
                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                    {[
                        { id: 'all', label: isHindi ? 'सभी' : 'All' },
                        { id: 'government', label: isHindi ? 'सरकारी' : 'Government' },
                        { id: 'phc', label: 'PHC' },
                        { id: 'emergency', label: isHindi ? 'आपातकाल' : 'Emergency' },
                        { id: 'ayushman', label: 'Ayushman' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === f.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <p className="text-gray-600">{isHindi ? 'लोकेशन प्राप्त कर रहे हैं...' : 'Getting your location...'}</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <div>
                            <p className="text-yellow-800">{error}</p>
                            <p className="text-sm text-yellow-600 mt-1">
                                {isHindi ? 'नीचे नमूना डेटा दिखाया गया है' : 'Showing sample data below'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Hospital List */}
                {!isLoading && (
                    <div className="space-y-4">
                        {filteredHospitals.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p>{isHindi ? 'कोई अस्पताल नहीं मिला' : 'No hospitals found'}</p>
                            </div>
                        ) : (
                            filteredHospitals.map((hospital) => (
                                <motion.div
                                    key={hospital.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${getTypeColor(hospital.type)}`}>
                                            <Building className="w-6 h-6" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                                                {hospital.distance && (
                                                    <span className="flex-shrink-0 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                                                        {hospital.distance} km
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-sm text-gray-600 mt-1">{hospital.address}</p>

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(hospital.type)}`}>
                                                    {getTypeLabel(hospital.type)}
                                                </span>
                                                {hospital.emergencyAvailable && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium flex items-center gap-1">
                                                        <Ambulance className="w-3 h-3" />
                                                        {isHindi ? 'आपातकाल' : 'Emergency'}
                                                    </span>
                                                )}
                                                {hospital.ayushmanEmpaneled && (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1">
                                                        <Shield className="w-3 h-3" />
                                                        Ayushman
                                                    </span>
                                                )}
                                            </div>

                                            {hospital.specialties && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {isHindi ? 'विशेषज्ञता: ' : 'Specialties: '}
                                                    {hospital.specialties.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-4 pt-3 border-t">
                                        <a
                                            href={`tel:${hospital.phone}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
                                        >
                                            <Phone className="w-4 h-4" />
                                            {isHindi ? 'कॉल करें' : 'Call'}
                                        </a>
                                        <button
                                            onClick={() => openInMaps(hospital)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                                        >
                                            <Navigation className="w-4 h-4" />
                                            {isHindi ? 'रास्ता देखें' : 'Directions'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* Location Refresh */}
                {!isLoading && (
                    <button
                        onClick={getLocation}
                        className="w-full mt-6 flex items-center justify-center gap-2 py-3 border-2 border-blue-500 text-blue-500 rounded-xl font-medium hover:bg-blue-50 transition-colors"
                    >
                        <MapPin className="w-5 h-5" />
                        {isHindi ? 'लोकेशन रीफ्रेश करें' : 'Refresh Location'}
                    </button>
                )}

                {/* Helpline */}
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-800 font-medium">
                        🚨 {isHindi ? 'आपातकालीन नंबर:' : 'Emergency Numbers:'}
                    </p>
                    <div className="flex gap-4 mt-2">
                        <a href="tel:108" className="text-red-700 font-bold">108 (Ambulance)</a>
                        <a href="tel:102" className="text-red-700 font-bold">102 (Free Ambulance)</a>
                        <a href="tel:112" className="text-red-700 font-bold">112 (Police)</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
