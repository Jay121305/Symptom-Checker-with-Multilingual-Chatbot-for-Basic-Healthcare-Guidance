'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { BODY_PARTS } from '@/lib/uspData';

interface VisualSymptomInputProps {
    onSymptomsSelected: (symptoms: string[]) => void;
    selectedSymptoms: string[];
}

export default function VisualSymptomInput({ onSymptomsSelected, selectedSymptoms }: VisualSymptomInputProps) {
    const [selectedPart, setSelectedPart] = useState<string | null>(null);
    const [hoveredPart, setHoveredPart] = useState<string | null>(null);

    const bodyPartPositions: Record<string, { x: number; y: number; width: number; height: number }> = {
        head: { x: 140, y: 20, width: 70, height: 70 },
        eyes: { x: 155, y: 35, width: 40, height: 20 },
        throat: { x: 155, y: 100, width: 40, height: 30 },
        chest: { x: 130, y: 130, width: 90, height: 80 },
        stomach: { x: 140, y: 210, width: 70, height: 70 },
        back: { x: 130, y: 130, width: 90, height: 150 },
        arms: { x: 70, y: 130, width: 50, height: 120 },
        legs: { x: 130, y: 300, width: 90, height: 150 },
        skin: { x: 0, y: 0, width: 350, height: 500 },
        general: { x: 0, y: 0, width: 350, height: 500 },
    };

    const handlePartClick = (partId: string) => {
        setSelectedPart(partId);
    };

    const handleSymptomToggle = (symptom: string) => {
        if (selectedSymptoms.includes(symptom)) {
            onSymptomsSelected(selectedSymptoms.filter(s => s !== symptom));
        } else {
            onSymptomsSelected([...selectedSymptoms, symptom]);
        }
    };

    const getPartColor = (partId: string) => {
        const part = BODY_PARTS.find(p => p.id === partId);
        if (!part) return '#E5E7EB';
        const hasSelectedSymptom = part.symptoms.some(s => selectedSymptoms.includes(s));
        if (hasSelectedSymptom) return '#3B82F6';
        if (hoveredPart === partId || selectedPart === partId) return '#93C5FD';
        return '#E5E7EB';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 text-center">🫵 Tap Where It Hurts</h3>
            <p className="text-sm text-gray-600 text-center mb-4">
                Click on the body part to select symptoms
            </p>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Body Diagram */}
                <div className="flex-1 flex justify-center">
                    <svg viewBox="0 0 350 500" className="w-full max-w-[280px] h-auto">
                        {/* Body outline */}
                        <g className="body-outline">
                            {/* Head */}
                            <ellipse
                                cx="175"
                                cy="50"
                                rx="35"
                                ry="40"
                                fill={getPartColor('head')}
                                stroke="#9CA3AF"
                                strokeWidth="2"
                                className="cursor-pointer transition-colors"
                                onClick={() => handlePartClick('head')}
                                onMouseEnter={() => setHoveredPart('head')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />

                            {/* Neck */}
                            <rect
                                x="165"
                                y="85"
                                width="20"
                                height="25"
                                fill={getPartColor('throat')}
                                stroke="#9CA3AF"
                                strokeWidth="2"
                                className="cursor-pointer transition-colors"
                                onClick={() => handlePartClick('throat')}
                                onMouseEnter={() => setHoveredPart('throat')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />

                            {/* Torso/Chest */}
                            <path
                                d="M 120 110 
                   L 120 200 
                   Q 120 220 140 230 
                   L 175 240 
                   L 210 230 
                   Q 230 220 230 200 
                   L 230 110 
                   Q 230 100 220 100 
                   L 130 100 
                   Q 120 100 120 110"
                                fill={getPartColor('chest')}
                                stroke="#9CA3AF"
                                strokeWidth="2"
                                className="cursor-pointer transition-colors"
                                onClick={() => handlePartClick('chest')}
                                onMouseEnter={() => setHoveredPart('chest')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />

                            {/* Stomach */}
                            <ellipse
                                cx="175"
                                cy="270"
                                rx="40"
                                ry="35"
                                fill={getPartColor('stomach')}
                                stroke="#9CA3AF"
                                strokeWidth="2"
                                className="cursor-pointer transition-colors"
                                onClick={() => handlePartClick('stomach')}
                                onMouseEnter={() => setHoveredPart('stomach')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />

                            {/* Left Arm */}
                            <path
                                d="M 120 115 
                   L 80 140 
                   L 60 200 
                   L 50 260 
                   L 65 265 
                   L 80 210 
                   L 100 150 
                   L 120 135"
                                fill={getPartColor('arms')}
                                stroke="#9CA3AF"
                                strokeWidth="2"
                                className="cursor-pointer transition-colors"
                                onClick={() => handlePartClick('arms')}
                                onMouseEnter={() => setHoveredPart('arms')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />

                            {/* Right Arm */}
                            <path
                                d="M 230 115 
                   L 270 140 
                   L 290 200 
                   L 300 260 
                   L 285 265 
                   L 270 210 
                   L 250 150 
                   L 230 135"
                                fill={getPartColor('arms')}
                                stroke="#9CA3AF"
                                strokeWidth="2"
                                className="cursor-pointer transition-colors"
                                onClick={() => handlePartClick('arms')}
                                onMouseEnter={() => setHoveredPart('arms')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />

                            {/* Left Leg */}
                            <path
                                d="M 140 300 
                   L 130 380 
                   L 125 450 
                   L 145 455 
                   L 155 390 
                   L 165 310"
                                fill={getPartColor('legs')}
                                stroke="#9CA3AF"
                                strokeWidth="2"
                                className="cursor-pointer transition-colors"
                                onClick={() => handlePartClick('legs')}
                                onMouseEnter={() => setHoveredPart('legs')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />

                            {/* Right Leg */}
                            <path
                                d="M 210 300 
                   L 220 380 
                   L 225 450 
                   L 205 455 
                   L 195 390 
                   L 185 310"
                                fill={getPartColor('legs')}
                                stroke="#9CA3AF"
                                strokeWidth="2"
                                className="cursor-pointer transition-colors"
                                onClick={() => handlePartClick('legs')}
                                onMouseEnter={() => setHoveredPart('legs')}
                                onMouseLeave={() => setHoveredPart(null)}
                            />
                        </g>

                        {/* Labels */}
                        <text x="175" y="55" textAnchor="middle" className="text-xs fill-gray-600 pointer-events-none">Head</text>
                        <text x="175" y="170" textAnchor="middle" className="text-xs fill-gray-600 pointer-events-none">Chest</text>
                        <text x="175" y="275" textAnchor="middle" className="text-xs fill-gray-600 pointer-events-none">Stomach</text>
                    </svg>
                </div>

                {/* Symptom Selection Panel */}
                <div className="flex-1">
                    {/* Quick Select Buttons */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {BODY_PARTS.slice(0, -1).map((part) => (
                            <button
                                key={part.id}
                                onClick={() => handlePartClick(part.id)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedPart === part.id
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {part.name}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePartClick('general')}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${selectedPart === 'general'
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                }`}
                        >
                            🌡️ General/Whole Body
                        </button>
                    </div>

                    {/* Selected Part Symptoms */}
                    <AnimatePresence mode="wait">
                        {selectedPart && (
                            <motion.div
                                key={selectedPart}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="border rounded-lg p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold">
                                        {BODY_PARTS.find(p => p.id === selectedPart)?.name} Symptoms
                                    </h4>
                                    <button onClick={() => setSelectedPart(null)} className="text-gray-400 hover:text-gray-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {BODY_PARTS.find(p => p.id === selectedPart)?.symptoms.map((symptom) => (
                                        <button
                                            key={symptom}
                                            onClick={() => handleSymptomToggle(symptom)}
                                            className={`flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${selectedSymptoms.includes(symptom)
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <span>{symptom}</span>
                                            {selectedSymptoms.includes(symptom) && <Check className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Instructions when no part selected */}
                    {!selectedPart && (
                        <div className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg">
                            <p>👆 Click on a body part or button above</p>
                            <p className="text-sm mt-2">to select symptoms for that area</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Symptoms Summary */}
            {selectedSymptoms.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-blue-700">Selected ({selectedSymptoms.length}):</span>
                        {selectedSymptoms.map((symptom) => (
                            <span
                                key={symptom}
                                className="inline-flex items-center px-2 py-1 bg-blue-500 text-white text-xs rounded-full"
                            >
                                {symptom}
                                <button onClick={() => handleSymptomToggle(symptom)} className="ml-1">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
