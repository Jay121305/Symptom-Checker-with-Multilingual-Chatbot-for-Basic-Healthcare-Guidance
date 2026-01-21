'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    IndianRupee,
    Building,
    Building2,
    TrendingDown,
    Pill,
    Info,
    ArrowRight,
    Check
} from 'lucide-react';
import { COST_ESTIMATES, GOVERNMENT_SCHEMES } from '@/lib/uspData';
import { MEDICAL_KNOWLEDGE_GRAPH } from '@/lib/constants';

interface CostEstimatorProps {
    language?: string;
    selectedCondition?: string;
}

export default function CostEstimator({ language = 'en', selectedCondition }: CostEstimatorProps) {
    const [condition, setCondition] = useState(selectedCondition || '');

    const conditions = Object.keys(COST_ESTIMATES).map(key => ({
        id: key,
        name: MEDICAL_KNOWLEDGE_GRAPH.conditions[key as keyof typeof MEDICAL_KNOWLEDGE_GRAPH.conditions]?.name || key,
    }));

    const isHindi = language === 'hi';
    const estimate = condition ? COST_ESTIMATES[condition as keyof typeof COST_ESTIMATES] : null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const calculateSavings = () => {
        if (!estimate) return 0;
        return estimate.privateHospital.total - estimate.governmentHospital.total;
    };

    const savingsPercentage = () => {
        if (!estimate) return 0;
        return Math.round((calculateSavings() / estimate.privateHospital.total) * 100);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <IndianRupee className="w-7 h-7" />
                    {isHindi ? 'इलाज खर्च अनुमान' : 'Treatment Cost Estimator'}
                </h2>
                <p className="text-amber-100 mt-1">
                    {isHindi
                        ? 'सरकारी और निजी अस्पताल की लागत की तुलना करें'
                        : 'Compare government vs private hospital costs'
                    }
                </p>
            </div>

            <div className="p-6">
                {/* Condition Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isHindi ? 'स्वास्थ्य स्थिति चुनें' : 'Select Health Condition'}
                    </label>
                    <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                        <option value="">{isHindi ? '-- स्थिति चुनें --' : '-- Select Condition --'}</option>
                        {conditions.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Cost Comparison */}
                {estimate && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Savings Banner */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                            <p className="text-green-600 text-sm font-medium">
                                {isHindi ? 'सरकारी अस्पताल में संभावित बचत' : 'Potential Savings at Government Hospital'}
                            </p>
                            <p className="text-3xl font-bold text-green-700 mt-1">
                                {formatCurrency(calculateSavings())}
                            </p>
                            <p className="text-sm text-green-600 mt-1">
                                ({savingsPercentage()}% {isHindi ? 'कम' : 'less'})
                            </p>
                        </div>

                        {/* Comparison Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Government Hospital */}
                            <div className="border-2 border-green-500 rounded-xl p-4 bg-green-50">
                                <div className="flex items-center gap-2 mb-4">
                                    <Building className="w-6 h-6 text-green-600" />
                                    <h3 className="font-bold text-green-700">
                                        {isHindi ? 'सरकारी अस्पताल' : 'Government Hospital'}
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(estimate.governmentHospital).filter(([key]) => key !== 'total').map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="text-gray-600 capitalize">{key}</span>
                                            <span className="font-medium">{formatCurrency(value as number)}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-3 flex justify-between font-bold text-green-700">
                                        <span>{isHindi ? 'कुल' : 'Total'}</span>
                                        <span className="text-xl">{formatCurrency(estimate.governmentHospital.total)}</span>
                                    </div>
                                </div>
                                <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-700">
                                    <Check className="w-3 h-3 inline mr-1" />
                                    {isHindi ? 'PMJAY के तहत मुफ्त हो सकता है' : 'May be FREE under PMJAY'}
                                </div>
                            </div>

                            {/* Private Hospital */}
                            <div className="border-2 border-gray-300 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Building2 className="w-6 h-6 text-gray-600" />
                                    <h3 className="font-bold text-gray-700">
                                        {isHindi ? 'निजी अस्पताल' : 'Private Hospital'}
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(estimate.privateHospital).filter(([key]) => key !== 'total').map(([key, value]) => (
                                        <div key={key} className="flex justify-between text-sm">
                                            <span className="text-gray-600 capitalize">{key}</span>
                                            <span className="font-medium">{formatCurrency(value as number)}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-3 flex justify-between font-bold text-gray-700">
                                        <span>{isHindi ? 'कुल' : 'Total'}</span>
                                        <span className="text-xl">{formatCurrency(estimate.privateHospital.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Insurance Coverage */}
                        {estimate.insuranceCoverage && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <h4 className="font-semibold text-blue-700 flex items-center gap-2 mb-2">
                                    <Info className="w-5 h-5" />
                                    {isHindi ? 'बीमा कवरेज' : 'Insurance Coverage'}
                                </h4>
                                <p className="text-sm text-blue-700">{estimate.insuranceCoverage}</p>
                            </div>
                        )}

                        {/* Generic Alternatives */}
                        {estimate.genericAlternatives && estimate.genericAlternatives.length > 0 && (
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                <h4 className="font-semibold text-purple-700 flex items-center gap-2 mb-3">
                                    <Pill className="w-5 h-5" />
                                    {isHindi ? 'सस्ती जेनेरिक दवाइयां' : 'Cheaper Generic Medicines'}
                                </h4>
                                <div className="space-y-2">
                                    {estimate.genericAlternatives.map((alt, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm bg-white p-2 rounded">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600">{alt.brand}</span>
                                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-purple-700">{alt.generic}</span>
                                            </div>
                                            <span className="text-green-600 font-semibold flex items-center gap-1">
                                                <TrendingDown className="w-4 h-4" />
                                                {formatCurrency(alt.savings)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-purple-600 mt-2">
                                    * {isHindi
                                        ? 'जन औषधि केंद्र से जेनेरिक दवाइयां खरीदें'
                                        : 'Buy generic medicines from Jan Aushadhi Kendra'
                                    }
                                </p>
                            </div>
                        )}

                        {/* Tip */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                            <strong>💡 {isHindi ? 'टिप:' : 'Tip:'}</strong>{' '}
                            {isHindi
                                ? 'PMJAY कार्ड बनवाएं - 5 लाख तक का मुफ्त इलाज। नजदीकी CSC या आयुष्मान मित्र से संपर्क करें।'
                                : 'Get PMJAY card for free treatment up to ₹5 lakhs. Contact nearest CSC or Ayushman Mitra.'
                            }
                        </div>
                    </motion.div>
                )}

                {/* Empty State */}
                {!condition && (
                    <div className="text-center py-12 text-gray-500">
                        <IndianRupee className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p>{isHindi ? 'लागत अनुमान देखने के लिए स्थिति चुनें' : 'Select a condition to see cost estimates'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
