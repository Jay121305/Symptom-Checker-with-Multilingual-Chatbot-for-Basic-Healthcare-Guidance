'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, X, Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { SymptomAnalysis } from '@/types';
import { URGENCY_COLORS, URGENCY_ICONS } from '@/lib/constants';
import toast from 'react-hot-toast';

interface SymptomCheckerProps {
  language: string;
}

export default function SymptomChecker({ language }: SymptomCheckerProps) {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);

  const commonSymptoms = [
    'Fever', 'Headache', 'Cough', 'Sore Throat', 'Body Aches',
    'Fatigue', 'Nausea', 'Dizziness', 'Chest Pain', 'Shortness of Breath',
    'Abdominal Pain', 'Diarrhea', 'Vomiting', 'Runny Nose', 'Loss of Taste',
  ];

  const addSymptom = (symptom: string) => {
    if (symptom.trim() && !symptoms.includes(symptom.trim())) {
      setSymptoms([...symptoms, symptom.trim()]);
      setSymptomInput('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter((s) => s !== symptom));
    setAnalysis(null);
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      toast.error('Please add at least one symptom');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          language,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setAnalysis(data);

      if (data.urgencyLevel === 'emergency') {
        toast.error('⚠️ EMERGENCY: Seek immediate medical attention!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze symptoms. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgencyColor = (level: string) => {
    return URGENCY_COLORS[level as keyof typeof URGENCY_COLORS] || '#666';
  };

  const getUrgencyIcon = (level: string) => {
    return URGENCY_ICONS[level as keyof typeof URGENCY_ICONS] || 'ℹ️';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Symptom Input */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <Search className="w-6 h-6 mr-2 text-blue-500" />
          Symptom Checker
        </h2>

        {/* Symptom Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Your Symptoms
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSymptom(symptomInput)}
              placeholder="e.g., Headache, Fever"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => addSymptom(symptomInput)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Common Symptoms */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Select Common Symptoms
          </label>
          <div className="flex flex-wrap gap-2">
            {commonSymptoms.map((symptom) => (
              <button
                key={symptom}
                onClick={() => addSymptom(symptom)}
                disabled={symptoms.includes(symptom)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  symptoms.includes(symptom)
                    ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Symptoms */}
        {symptoms.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Symptoms ({symptoms.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((symptom) => (
                <motion.div
                  key={symptom}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded-full"
                >
                  <span className="text-sm">{symptom}</span>
                  <button
                    onClick={() => removeSymptom(symptom)}
                    className="hover:bg-blue-600 rounded-full p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={analyzeSymptoms}
          disabled={symptoms.length === 0 || isAnalyzing}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Analyze Symptoms
            </>
          )}
        </button>
      </div>

      {/* Right: Analysis Results */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>

        {!analysis ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Info className="w-16 h-16 mb-4" />
            <p className="text-center">
              Add symptoms and click "Analyze" to get<br />AI-powered health guidance
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Urgency Level */}
            <div
              className="p-4 rounded-lg border-2"
              style={{ borderColor: getUrgencyColor(analysis.urgencyLevel) }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Urgency Level</h3>
                <span className="text-2xl">{getUrgencyIcon(analysis.urgencyLevel)}</span>
              </div>
              <p
                className="text-xl font-bold capitalize"
                style={{ color: getUrgencyColor(analysis.urgencyLevel) }}
              >
                {analysis.urgencyLevel.replace('-', ' ')}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Confidence: {analysis.confidenceScore}%
              </p>
            </div>

            {/* Possible Conditions */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Possible Conditions</h3>
              <div className="space-y-3">
                {analysis.possibleConditions.map((condition, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{condition.name}</h4>
                      <span className="text-sm text-gray-600">
                        {condition.probability}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{condition.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                Recommendations
              </h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* When to Seek Help */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                When to Seek Medical Help
              </h3>
              <ul className="space-y-2">
                {analysis.whenToSeekHelp.map((help, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-orange-500 mr-2">⚠</span>
                    <span>{help}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Self-Care Advice */}
            {analysis.selfCareAdvice.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Self-Care Advice</h3>
                <ul className="space-y-2">
                  {analysis.selfCareAdvice.map((advice, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{advice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
