'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield,
    Search,
    ExternalLink,
    Check,
    FileText,
    Users,
    Baby,
    Heart,
    ChevronDown,
    ChevronUp,
    Info
} from 'lucide-react';
import { GOVERNMENT_SCHEMES } from '@/lib/uspData';

interface GovernmentSchemesProps {
    language?: string;
}

export default function GovernmentSchemes({ language = 'en' }: GovernmentSchemesProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedScheme, setExpandedScheme] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = [
        { id: 'all', label: 'All', labelHi: 'सभी', icon: Shield },
        { id: 'insurance', label: 'Insurance', labelHi: 'बीमा', icon: Shield },
        { id: 'maternity', label: 'Maternity', labelHi: 'मातृत्व', icon: Baby },
        { id: 'treatment', label: 'Treatment', labelHi: 'इलाज', icon: Heart },
    ];

    const isHindi = language === 'hi';

    const filteredSchemes = GOVERNMENT_SCHEMES.filter(scheme => {
        const matchesSearch = scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            scheme.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            scheme.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || scheme.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Shield className="w-7 h-7" />
                    {isHindi ? 'सरकारी स्वास्थ्य योजनाएं' : 'Government Health Schemes'}
                </h2>
                <p className="text-green-100 mt-1">
                    {isHindi
                        ? 'मुफ्त और रियायती स्वास्थ्य सेवाओं के लिए पात्रता जांचें'
                        : 'Check eligibility for free & subsidized healthcare services'
                    }
                </p>
            </div>

            <div className="p-6">
                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isHindi ? 'योजना खोजें...' : 'Search schemes...'}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {isHindi ? cat.labelHi : cat.label}
                            </button>
                        );
                    })}
                </div>

                {/* Schemes List */}
                <div className="space-y-4">
                    {filteredSchemes.map((scheme) => (
                        <motion.div
                            key={scheme.id}
                            layout
                            className="border rounded-xl overflow-hidden"
                        >
                            {/* Scheme Header */}
                            <button
                                onClick={() => setExpandedScheme(expandedScheme === scheme.id ? null : scheme.id)}
                                className="w-full flex items-start gap-4 p-4 text-left hover:bg-gray-50"
                            >
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lg font-bold text-green-600">{scheme.shortName.slice(0, 2)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 pr-6">
                                        {isHindi && scheme.nameHindi ? scheme.nameHindi : scheme.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{scheme.description}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                            {scheme.shortName}
                                        </span>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium capitalize">
                                            {scheme.category}
                                        </span>
                                    </div>
                                </div>
                                {expandedScheme === scheme.id ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                            </button>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {expandedScheme === scheme.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t bg-gray-50"
                                    >
                                        <div className="p-4 space-y-4">
                                            {/* Benefits */}
                                            <div>
                                                <h4 className="font-semibold text-green-700 flex items-center gap-2 mb-2">
                                                    <Check className="w-4 h-4" />
                                                    {isHindi ? 'लाभ' : 'Benefits'}
                                                </h4>
                                                <ul className="space-y-1">
                                                    {scheme.benefits.map((benefit, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                            {benefit}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Eligibility */}
                                            <div>
                                                <h4 className="font-semibold text-blue-700 flex items-center gap-2 mb-2">
                                                    <Users className="w-4 h-4" />
                                                    {isHindi ? 'पात्रता' : 'Eligibility'}
                                                </h4>
                                                <ul className="space-y-1">
                                                    {scheme.eligibility.map((item, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Required Documents */}
                                            <div>
                                                <h4 className="font-semibold text-orange-700 flex items-center gap-2 mb-2">
                                                    <FileText className="w-4 h-4" />
                                                    {isHindi ? 'आवश्यक दस्तावेज' : 'Required Documents'}
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {scheme.documents.map((doc, i) => (
                                                        <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                                                            {doc}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Apply Button */}
                                            <a
                                                href={scheme.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                                {isHindi ? 'आधिकारिक वेबसाइट पर जाएं' : 'Visit Official Website'}
                                            </a>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Helpline */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                        <strong>{isHindi ? 'सहायता हेल्पलाइन:' : 'Helpline:'}</strong>{' '}
                        <a href="tel:14555" className="font-mono font-bold">14555</a> (Ayushman Bharat) |{' '}
                        <a href="tel:1800-180-1104" className="font-mono font-bold">1800-180-1104</a> (Health Ministry)
                    </p>
                </div>
            </div>
        </div>
    );
}
