'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Download, X, FileText, FileSpreadsheet, Shield,
    CheckCircle, Loader2, Calendar, User, Activity,
    Heart, Pill, Clock, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DataExportProps {
    onClose: () => void;
    language: string;
}

interface ExportOption {
    id: string;
    label: string;
    labelHi: string;
    description: string;
    icon: React.ReactNode;
    dataKey: string;
}

const exportOptions: ExportOption[] = [
    {
        id: 'symptoms',
        label: 'Symptom History',
        labelHi: 'लक्षण इतिहास',
        description: 'All your reported symptoms and AI analysis',
        icon: <Activity className="w-5 h-5" />,
        dataKey: 'symptom-diary'
    },
    {
        id: 'vitals',
        label: 'Vital Signs',
        labelHi: 'जीवन संकेत',
        description: 'Blood pressure, heart rate, SpO2 readings',
        icon: <Heart className="w-5 h-5" />,
        dataKey: 'vitals-history'
    },
    {
        id: 'medications',
        label: 'Medications',
        labelHi: 'दवाइयाँ',
        description: 'Medication schedules and adherence',
        icon: <Pill className="w-5 h-5" />,
        dataKey: 'medications'
    },
    {
        id: 'family',
        label: 'Family Profiles',
        labelHi: 'परिवार प्रोफाइल',
        description: 'All family member health profiles',
        icon: <User className="w-5 h-5" />,
        dataKey: 'family-profiles'
    },
    {
        id: 'chat',
        label: 'Chat History',
        labelHi: 'चैट इतिहास',
        description: 'Conversations with AI health assistant',
        icon: <FileText className="w-5 h-5" />,
        dataKey: 'chat-history'
    }
];

export default function DataExport({ onClose, language }: DataExportProps) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');
    const [isExporting, setIsExporting] = useState(false);
    const [exportComplete, setExportComplete] = useState(false);
    const [dateRange, setDateRange] = useState({ from: '', to: '' });

    const isHindi = language === 'hi';

    const toggleOption = (id: string) => {
        setSelectedOptions(prev =>
            prev.includes(id)
                ? prev.filter(o => o !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedOptions(exportOptions.map(o => o.id));
    };

    const collectData = () => {
        const data: Record<string, unknown> = {
            exportDate: new Date().toISOString(),
            dateRange: dateRange.from && dateRange.to ? dateRange : 'All time',
            source: 'DeepBlue Health App',
            version: '1.0.0'
        };

        selectedOptions.forEach(optionId => {
            const option = exportOptions.find(o => o.id === optionId);
            if (option) {
                try {
                    const stored = localStorage.getItem(option.dataKey);
                    data[optionId] = stored ? JSON.parse(stored) : [];
                } catch {
                    data[optionId] = [];
                }
            }
        });

        return data;
    };

    const exportAsJSON = (data: Record<string, unknown>) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, 'deepblue-health-data.json');
    };

    const exportAsCSV = (data: Record<string, unknown>) => {
        let csv = 'Category,Date,Details\n';

        Object.entries(data).forEach(([category, records]) => {
            if (Array.isArray(records)) {
                records.forEach((record: Record<string, unknown>) => {
                    const date = record.date || record.timestamp || 'N/A';
                    const details = JSON.stringify(record).replace(/,/g, ';').replace(/"/g, "'");
                    csv += `${category},${date},"${details}"\n`;
                });
            }
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        downloadBlob(blob, 'deepblue-health-data.csv');
    };

    const exportAsPDF = (data: Record<string, unknown>) => {
        // Generate HTML for PDF
        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DeepBlue Health Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
          h2 { color: #3b82f6; margin-top: 30px; }
          .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
          .section { background: #f8fafc; padding: 15px; border-radius: 8px; margin: 10px 0; }
          .item { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .label { font-weight: bold; color: #1e40af; }
          .disclaimer { margin-top: 40px; padding: 15px; background: #fef3c7; border-radius: 8px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>🏥 DeepBlue Health Report</h1>
        <div class="meta">
          <p><strong>Export Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Period:</strong> ${dateRange.from && dateRange.to ? `${dateRange.from} to ${dateRange.to}` : 'All available data'}</p>
        </div>
        ${Object.entries(data).map(([category, records]) => {
            if (category === 'exportDate' || category === 'dateRange' || category === 'source' || category === 'version') return '';
            return `
            <h2>${category.charAt(0).toUpperCase() + category.slice(1)}</h2>
            <div class="section">
              ${Array.isArray(records) && records.length > 0
                    ? records.map((r: Record<string, unknown>) => `
                    <div class="item">
                      <span class="label">${r.date || r.timestamp || 'Entry'}:</span>
                      ${JSON.stringify(r).substring(0, 200)}...
                    </div>
                  `).join('')
                    : '<p>No data available</p>'
                }
            </div>
          `;
        }).join('')}
        <div class="disclaimer">
          <strong>⚠️ Disclaimer:</strong> This report is for informational purposes only and should not replace professional medical advice. 
          Always consult a qualified healthcare provider for medical decisions.
        </div>
      </body>
      </html>
    `;

        const blob = new Blob([html], { type: 'text/html' });
        downloadBlob(blob, 'deepblue-health-report.html');
        toast.success(isHindi ? 'रिपोर्ट डाउनलोड हुई। PDF में बदलने के लिए ब्राउज़र से प्रिंट करें।' : 'Report downloaded. Print from browser to save as PDF.');
    };

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExport = async () => {
        if (selectedOptions.length === 0) {
            toast.error(isHindi ? 'कृपया कम से कम एक विकल्प चुनें' : 'Please select at least one option');
            return;
        }

        setIsExporting(true);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));

        const data = collectData();

        switch (exportFormat) {
            case 'json':
                exportAsJSON(data);
                break;
            case 'csv':
                exportAsCSV(data);
                break;
            case 'pdf':
                exportAsPDF(data);
                break;
        }

        setIsExporting(false);
        setExportComplete(true);
        toast.success(isHindi ? 'डेटा सफलतापूर्वक निर्यात किया गया!' : 'Data exported successfully!');
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
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Download className="w-6 h-6" />
                                    {isHindi ? 'डेटा निर्यात करें' : 'Export Your Data'}
                                </h2>
                                <p className="text-blue-100 text-sm mt-1">
                                    {isHindi ? 'अपना स्वास्थ्य डेटा डाउनलोड करें' : 'Download your health data securely'}
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
                        {exportComplete ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {isHindi ? 'निर्यात सफल!' : 'Export Complete!'}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {isHindi ? 'आपका डेटा डाउनलोड हो गया है' : 'Your data has been downloaded'}
                                </p>
                                <button
                                    onClick={onClose}
                                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {isHindi ? 'बंद करें' : 'Close'}
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                {/* Privacy Notice */}
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex gap-3">
                                    <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                                            {isHindi ? 'आपका डेटा सुरक्षित है' : 'Your Data is Protected'}
                                        </p>
                                        <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                                            {isHindi
                                                ? 'सभी डेटा केवल आपके डिवाइस पर संग्रहीत है'
                                                : 'All data is stored locally on your device only'}
                                        </p>
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {isHindi ? 'तिथि सीमा (वैकल्पिक)' : 'Date Range (Optional)'}
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="date"
                                            value={dateRange.from}
                                            onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                        <input
                                            type="date"
                                            value={dateRange.to}
                                            onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                {/* Select Data */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {isHindi ? 'निर्यात करने के लिए डेटा चुनें' : 'Select Data to Export'}
                                        </label>
                                        <button
                                            onClick={selectAll}
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            {isHindi ? 'सभी चुनें' : 'Select All'}
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {exportOptions.map(option => (
                                            <label
                                                key={option.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedOptions.includes(option.id)
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOptions.includes(option.id)}
                                                    onChange={() => toggleOption(option.id)}
                                                    className="sr-only"
                                                />
                                                <div className={`p-2 rounded-lg ${selectedOptions.includes(option.id)
                                                        ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {option.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {isHindi ? option.labelHi : option.label}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {option.description}
                                                    </p>
                                                </div>
                                                {selectedOptions.includes(option.id) && (
                                                    <CheckCircle className="w-5 h-5 text-blue-600" />
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Export Format */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {isHindi ? 'प्रारूप चुनें' : 'Select Format'}
                                    </label>
                                    <div className="flex gap-3">
                                        {[
                                            { id: 'json', label: 'JSON', icon: <FileText className="w-4 h-4" /> },
                                            { id: 'csv', label: 'CSV', icon: <FileSpreadsheet className="w-4 h-4" /> },
                                            { id: 'pdf', label: 'PDF Report', icon: <FileText className="w-4 h-4" /> }
                                        ].map(format => (
                                            <button
                                                key={format.id}
                                                onClick={() => setExportFormat(format.id as 'json' | 'csv' | 'pdf')}
                                                className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${exportFormat === format.id
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                    }`}
                                            >
                                                {format.icon}
                                                {format.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Warning */}
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-amber-700 dark:text-amber-300 text-xs">
                                        {isHindi
                                            ? 'निर्यात किया गया डेटा संवेदनशील है। इसे सुरक्षित रखें।'
                                            : 'Exported data contains sensitive health information. Keep it secure.'}
                                    </p>
                                </div>

                                {/* Export Button */}
                                <button
                                    onClick={handleExport}
                                    disabled={isExporting || selectedOptions.length === 0}
                                    className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${isExporting || selectedOptions.length === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {isExporting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {isHindi ? 'निर्यात हो रहा है...' : 'Exporting...'}
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5" />
                                            {isHindi ? 'डेटा निर्यात करें' : 'Export Data'}
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
