'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import ChatInterface from '@/components/ChatInterface';
import VitalsDashboard from '@/components/VitalsDashboard';
import EmergencyButton from '@/components/EmergencyButton';
import LanguageSelector from '@/components/LanguageSelector';
import FamilyProfiles from '@/components/FamilyProfiles';
import VisualSymptomInput from '@/components/VisualSymptomInput';
import FirstAidGuide from '@/components/FirstAidGuide';
import GovernmentSchemes from '@/components/GovernmentSchemes';
import CostEstimator from '@/components/CostEstimator';
import SymptomDiary from '@/components/SymptomDiary';
import NearbyHospitals from '@/components/NearbyHospitals';
import MedicationReminder from '@/components/MedicationReminder';
import HealthEducation from '@/components/HealthEducation';
import VoiceOnlyMode from '@/components/VoiceOnlyMode';
import WhatsAppBot from '@/components/WhatsAppBot';
import ABHAIntegration from '@/components/ABHAIntegration';
import DataExport from '@/components/DataExport';
import PushNotificationSettings from '@/components/PushNotificationSettings';
import ClinicalSymptomChecker from '@/components/ClinicalSymptomChecker';
import { FamilyProfile, SymptomAnalysis } from '@/types';
import {
  Activity,
  MessageCircle,
  Stethoscope,
  TrendingUp,
  Menu,
  X,
  Shield,
  MapPin,
  BookOpen,
  Pill,
  AlertTriangle,
  IndianRupee,
  Calendar,
  Users,
  ChevronDown,
  Moon,
  Sun,
  Plus,
  Search,
  Loader2,
  CheckCircle,
  Info,
  Mic,
  Smartphone,
  CreditCard,
  BarChart3,
  UserCheck,
  ExternalLink,
  Download,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import { URGENCY_COLORS, URGENCY_ICONS } from '@/lib/constants';
import Link from 'next/link';

type Tab = 'chat' | 'symptoms' | 'vitals' | 'tools';

// Theme Context
const ThemeContext = createContext<{
  darkMode: boolean;
  toggleDarkMode: () => void;
}>({ darkMode: false, toggleDarkMode: () => { } });

export const useTheme = () => useContext(ThemeContext);

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [language, setLanguage] = useState('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<FamilyProfile | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showProfileSelector, setShowProfileSelector] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const isHindi = language === 'hi';

  // Load dark mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const tabs = [
    { id: 'chat' as Tab, name: isHindi ? 'चैट' : 'Chat', icon: MessageCircle },
    { id: 'symptoms' as Tab, name: isHindi ? 'लक्षण जांच' : 'Symptom Check', icon: Stethoscope },
    { id: 'vitals' as Tab, name: isHindi ? 'वाइटल्स' : 'Vitals', icon: Activity },
    { id: 'tools' as Tab, name: isHindi ? 'टूल्स' : 'Health Tools', icon: TrendingUp },
  ];

  // State for new feature modals
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showABHA, setShowABHA] = useState(false);
  const [showDataExport, setShowDataExport] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const healthTools = [
    { id: 'voice', name: isHindi ? 'आवाज मोड' : 'Voice Mode', icon: Mic, color: 'from-violet-500 to-purple-600', badge: 'NEW' },
    { id: 'whatsapp', name: 'WhatsApp Bot', icon: Smartphone, color: 'from-green-500 to-green-600', badge: 'NEW' },
    { id: 'abha', name: isHindi ? 'ABHA लिंक' : 'ABHA Link', icon: CreditCard, color: 'from-orange-500 to-orange-600', badge: 'NEW' },
    { id: 'firstaid', name: isHindi ? 'प्राथमिक चिकित्सा' : 'First Aid', icon: AlertTriangle, color: 'from-red-500 to-orange-500' },
    { id: 'schemes', name: isHindi ? 'सरकारी योजनाएं' : 'Govt Schemes', icon: Shield, color: 'from-green-500 to-emerald-500' },
    { id: 'hospitals', name: isHindi ? 'नजदीकी अस्पताल' : 'Nearby Hospitals', icon: MapPin, color: 'from-blue-500 to-cyan-500' },
    { id: 'cost', name: isHindi ? 'खर्च अनुमान' : 'Cost Estimator', icon: IndianRupee, color: 'from-amber-500 to-orange-500' },
    { id: 'medications', name: isHindi ? 'दवा रिमाइंडर' : 'Medications', icon: Pill, color: 'from-pink-500 to-rose-500' },
    { id: 'diary', name: isHindi ? 'लक्षण डायरी' : 'Symptom Diary', icon: Calendar, color: 'from-indigo-500 to-purple-500' },
    { id: 'education', name: isHindi ? 'स्वास्थ्य शिक्षा' : 'Health Education', icon: BookOpen, color: 'from-teal-500 to-cyan-500' },
    { id: 'export', name: isHindi ? 'डेटा निर्यात' : 'Export Data', icon: Download, color: 'from-blue-600 to-indigo-600' },
    { id: 'notifications', name: isHindi ? 'सूचनाएं' : 'Notifications', icon: Bell, color: 'from-amber-500 to-red-500' },
  ];

  // Professional dashboard links
  const dashboardLinks = [
    { id: 'asha', name: isHindi ? 'ASHA डैशबोर्ड' : 'ASHA Dashboard', icon: UserCheck, href: '/asha', color: 'from-green-600 to-teal-600' },
    { id: 'outbreak', name: isHindi ? 'प्रकोप निगरानी' : 'Outbreak Surveillance', icon: BarChart3, href: '/outbreak', color: 'from-red-600 to-purple-600' },
  ];

  const handleToolClick = (toolId: string) => {
    // Handle special modal-based tools
    if (toolId === 'voice') {
      setShowVoiceMode(true);
      return;
    }
    if (toolId === 'whatsapp') {
      setShowWhatsApp(true);
      return;
    }
    if (toolId === 'abha') {
      setShowABHA(true);
      return;
    }
    if (toolId === 'export') {
      setShowDataExport(true);
      return;
    }
    if (toolId === 'notifications') {
      setShowNotifications(true);
      return;
    }
    setActiveTool(toolId);
  };

  const renderTool = () => {
    switch (activeTool) {
      case 'firstaid': return <FirstAidGuide language={language} />;
      case 'schemes': return <GovernmentSchemes language={language} />;
      case 'hospitals': return <NearbyHospitals language={language} />;
      case 'cost': return <CostEstimator language={language} />;
      case 'medications': return <MedicationReminder profileId={currentProfile?.id} language={language} />;
      case 'diary': return <SymptomDiary profileId={currentProfile?.id} language={language} />;
      case 'education': return <HealthEducation language={language} />;
      default: return null;
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-md sticky top-0 z-50`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>DeepBlue Health</h1>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{isHindi ? 'AI स्वास्थ्य सहायक' : 'AI Healthcare Assistant'}</p>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'}`}
                  title={darkMode ? 'Light Mode' : 'Dark Mode'}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Profile Selector */}
                <button
                  onClick={() => setShowProfileSelector(!showProfileSelector)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{currentProfile?.name || (isHindi ? 'प्रोफ़ाइल' : 'Profile')}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <LanguageSelector language={language} onLanguageChange={setLanguage} />
                <EmergencyButton />
              </div>

              <div className="flex items-center gap-2 md:hidden">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100'}`}
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`p-2 rounded-lg ${darkMode ? 'text-white' : ''}`}
                >
                  {menuOpen ? <X /> : <Menu />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:hidden pb-4 space-y-3"
              >
                <button
                  onClick={() => setShowProfileSelector(!showProfileSelector)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'}`}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{currentProfile?.name || (isHindi ? 'प्रोफ़ाइल चुनें' : 'Select Profile')}</span>
                </button>
                <LanguageSelector language={language} onLanguageChange={setLanguage} />
                <EmergencyButton />
              </motion.div>
            )}

            {/* Profile Selector Dropdown */}
            {showProfileSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`absolute right-4 top-16 w-80 rounded-xl shadow-2xl border z-50 p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
              >
                <FamilyProfiles
                  currentProfile={currentProfile}
                  onProfileSelect={(profile) => {
                    setCurrentProfile(profile);
                    setShowProfileSelector(false);
                  }}
                />
              </motion.div>
            )}
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-b sticky top-[73px] z-40`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setActiveTool(null); }}
                    className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 font-semibold'
                      : `border-transparent ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            key={activeTab + activeTool}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Chat Tab */}
            {activeTab === 'chat' && <ChatInterface language={language} />}

            {/* Symptoms Tab - Clinical Decision Support System */}
            {activeTab === 'symptoms' && (
              <ClinicalSymptomChecker language={language} darkMode={darkMode} />
            )}

            {/* Vitals Tab */}
            {activeTab === 'vitals' && <VitalsDashboard />}

            {/* Tools Tab */}
            {activeTab === 'tools' && (
              <>
                {!activeTool ? (
                  <div className="space-y-6">
                    {/* Professional Dashboards */}
                    <div>
                      <h3 className={`font-bold mb-3 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {isHindi ? 'प्रोफेशनल डैशबोर्ड' : 'Professional Dashboards'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {dashboardLinks.map((link) => {
                          const Icon = link.icon;
                          return (
                            <Link
                              key={link.id}
                              href={link.href}
                              className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${link.color} text-white shadow-lg hover:shadow-xl transition-all`}
                            >
                              <Icon className="w-8 h-8" />
                              <div>
                                <p className="font-bold">{link.name}</p>
                                <p className="text-sm opacity-80">
                                  {link.id === 'asha'
                                    ? (isHindi ? 'स्वास्थ्य कार्यकर्ताओं के लिए' : 'For health workers')
                                    : (isHindi ? 'रोग निगरानी प्रणाली' : 'Disease surveillance system')}
                                </p>
                              </div>
                              <ExternalLink className="w-5 h-5 ml-auto opacity-70" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* Health Tools Grid */}
                    <div>
                      <h3 className={`font-bold mb-3 text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {isHindi ? 'स्वास्थ्य उपकरण' : 'Health Tools'}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {healthTools.map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <motion.button
                              key={tool.id}
                              onClick={() => handleToolClick(tool.id)}
                              className={`relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br ${tool.color} text-white shadow-lg hover:shadow-xl transition-all`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {'badge' in tool && tool.badge && (
                                <span className="absolute top-2 right-2 px-2 py-0.5 bg-white text-xs font-bold text-purple-600 rounded-full">
                                  {tool.badge}
                                </span>
                              )}
                              <Icon className="w-10 h-10 mb-3" />
                              <span className="font-semibold text-sm text-center">{tool.name}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => setActiveTool(null)}
                      className={`flex items-center gap-2 mb-4 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      <X className="w-4 h-4" />
                      {isHindi ? 'वापस जाएं' : 'Back to Tools'}
                    </button>
                    {renderTool()}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-t mt-12`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="font-semibold mb-2">⚠️ {isHindi ? 'चिकित्सा अस्वीकरण' : 'Medical Disclaimer'}</p>
              <p>
                {isHindi
                  ? 'यह एक AI-संचालित स्वास्थ्य सहायक है जो केवल मार्गदर्शन के लिए है। चिकित्सा सलाह के लिए हमेशा योग्य स्वास्थ्य पेशेवरों से परामर्श करें। आपातकाल में तुरंत 108 डायल करें।'
                  : 'This is an AI-powered health assistant for guidance only. Always consult qualified healthcare professionals for medical advice. In emergencies, call 108 immediately.'
                }
              </p>
              <p className={`mt-4 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                © 2026 DeepBlue Health. {isHindi ? 'ग्रामीण स्वास्थ्य सेवा को बेहतर बनाने के लिए बनाया गया।' : 'Built for improving rural healthcare access.'}
              </p>
            </div>
          </div>
        </footer>

        {/* Click outside to close profile selector */}
        {showProfileSelector && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfileSelector(false)}
          />
        )}

        {/* Modal Components */}
        {showVoiceMode && (
          <VoiceOnlyMode language={language} onClose={() => setShowVoiceMode(false)} />
        )}
        {showWhatsApp && (
          <WhatsAppBot language={language} onClose={() => setShowWhatsApp(false)} />
        )}
        {showABHA && (
          <ABHAIntegration onClose={() => setShowABHA(false)} />
        )}
        {showDataExport && (
          <DataExport language={language} onClose={() => setShowDataExport(false)} />
        )}
        {showNotifications && (
          <PushNotificationSettings language={language} onClose={() => setShowNotifications(false)} />
        )}
      </div>
    </ThemeContext.Provider>
  );
}

// Enhanced Symptom Checker with Visual Input and Full Analysis
function EnhancedSymptomChecker({ language, darkMode }: { language: string; darkMode: boolean }) {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [showVisual, setShowVisual] = useState(true);
  const [symptomInput, setSymptomInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);

  const isHindi = language === 'hi';

  const commonSymptoms = [
    'Fever', 'Headache', 'Cough', 'Sore Throat', 'Body Aches',
    'Fatigue', 'Nausea', 'Dizziness', 'Chest Pain', 'Shortness of Breath',
    'Abdominal Pain', 'Diarrhea', 'Vomiting', 'Runny Nose', 'Loss of Taste',
  ];

  const addSymptom = (symptom: string) => {
    const trimmed = symptom.trim();
    if (trimmed && !symptoms.includes(trimmed)) {
      setSymptoms([...symptoms, trimmed]);
      setSymptomInput('');
      setAnalysis(null); // Clear previous analysis when symptoms change
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
    setAnalysis(null);
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      toast.error(isHindi ? 'कृपया कम से कम एक लक्षण जोड़ें' : 'Please add at least one symptom');
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
        toast.error(isHindi ? '⚠️ आपातकाल: तुरंत चिकित्सा सहायता लें!' : '⚠️ EMERGENCY: Seek immediate medical attention!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(isHindi ? 'विश्लेषण विफल। कृपया पुनः प्रयास करें।' : 'Failed to analyze symptoms. Please try again.');
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
    <div className="space-y-6">
      {/* Toggle between Visual and Text input */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowVisual(true)}
          className={`flex-1 py-3 rounded-xl font-medium transition-colors ${showVisual
            ? 'bg-blue-500 text-white'
            : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
        >
          🫵 {isHindi ? 'शरीर पर टैप करें' : 'Tap on Body'}
        </button>
        <button
          onClick={() => setShowVisual(false)}
          className={`flex-1 py-3 rounded-xl font-medium transition-colors ${!showVisual
            ? 'bg-blue-500 text-white'
            : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}
        >
          ⌨️ {isHindi ? 'टाइप करें' : 'Type Symptoms'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Section */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          {showVisual ? (
            <VisualSymptomInput
              selectedSymptoms={symptoms}
              onSymptomsSelected={setSymptoms}
            />
          ) : (
            <>
              <h2 className={`text-2xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : ''}`}>
                <Search className="w-6 h-6 mr-2 text-blue-500" />
                {isHindi ? 'लक्षण जांचकर्ता' : 'Symptom Checker'}
              </h2>

              {/* Custom Symptom Input */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {isHindi ? 'अपने लक्षण टाइप करें' : 'Type Your Symptoms'}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSymptom(symptomInput)}
                    placeholder={isHindi ? 'जैसे सिरदर्द, बुखार...' : 'e.g., Headache, Fever...'}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''
                      }`}
                  />
                  <button
                    onClick={() => addSymptom(symptomInput)}
                    disabled={!symptomInput.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Common Symptoms Quick Select */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {isHindi ? 'सामान्य लक्षण चुनें' : 'Quick Select Common Symptoms'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonSymptoms.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => addSymptom(symptom)}
                      disabled={symptoms.includes(symptom)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${symptoms.includes(symptom)
                        ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                        : darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Selected Symptoms */}
          {symptoms.length > 0 && (
            <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {isHindi ? 'चुने गए लक्षण' : 'Selected Symptoms'} ({symptoms.length})
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
            className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {isHindi ? 'विश्लेषण हो रहा है...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                {isHindi ? 'लक्षणों का विश्लेषण करें' : 'Analyze Symptoms'}
              </>
            )}
          </button>
        </div>

        {/* Right: Analysis Results */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : ''}`}>
            {isHindi ? 'विश्लेषण परिणाम' : 'Analysis Results'}
          </h2>

          {!analysis ? (
            <div className={`flex flex-col items-center justify-center h-64 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              <Info className="w-16 h-16 mb-4" />
              <p className="text-center">
                {isHindi
                  ? 'लक्षण जोड़ें और "विश्लेषण" पर क्लिक करें\nAI-संचालित स्वास्थ्य मार्गदर्शन प्राप्त करें'
                  : 'Add symptoms and click "Analyze" to get\nAI-powered health guidance'
                }
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
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : ''}`}>
                    {isHindi ? 'तीव्रता स्तर' : 'Urgency Level'}
                  </h3>
                  <span className="text-2xl">{getUrgencyIcon(analysis.urgencyLevel)}</span>
                </div>
                <p
                  className="text-xl font-bold capitalize"
                  style={{ color: getUrgencyColor(analysis.urgencyLevel) }}
                >
                  {analysis.urgencyLevel.replace('-', ' ')}
                </p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isHindi ? 'विश्वास:' : 'Confidence:'} {analysis.confidenceScore}%
                </p>
              </div>

              {/* Possible Conditions */}
              <div>
                <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : ''}`}>
                  {isHindi ? 'संभावित स्थितियां' : 'Possible Conditions'}
                </h3>
                <div className="space-y-3">
                  {analysis.possibleConditions.map((condition, index) => (
                    <div key={index} className={`border rounded-lg p-3 ${darkMode ? 'border-gray-700' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : ''}`}>{condition.name}</h4>
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {condition.probability}% {isHindi ? 'मिलान' : 'match'}
                        </span>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{condition.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className={`text-lg font-semibold mb-3 flex items-center ${darkMode ? 'text-white' : ''}`}>
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  {isHindi ? 'सिफारिशें' : 'Recommendations'}
                </h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : ''}`}>
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* When to Seek Help */}
              <div>
                <h3 className={`text-lg font-semibold mb-3 flex items-center ${darkMode ? 'text-white' : ''}`}>
                  <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                  {isHindi ? 'डॉक्टर से कब मिलें' : 'When to Seek Medical Help'}
                </h3>
                <ul className="space-y-2">
                  {analysis.whenToSeekHelp.map((help, index) => (
                    <li key={index} className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : ''}`}>
                      <span className="text-orange-500 mr-2">⚠</span>
                      <span>{help}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Self-Care Advice */}
              {analysis.selfCareAdvice.length > 0 && (
                <div>
                  <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : ''}`}>
                    {isHindi ? 'स्व-देखभाल सलाह' : 'Self-Care Advice'}
                  </h3>
                  <ul className="space-y-2">
                    {analysis.selfCareAdvice.map((advice, index) => (
                      <li key={index} className={`flex items-start text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
    </div>
  );
}
