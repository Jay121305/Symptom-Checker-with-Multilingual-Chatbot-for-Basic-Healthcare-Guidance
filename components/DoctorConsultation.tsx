'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff,
  MessageCircle, Monitor, Maximize2, Volume2,
  User, Clock, Star, Shield, X, CheckCircle
} from 'lucide-react';

interface DoctorConsultationProps {
  language: string;
  onClose: () => void;
}

const MOCK_DOCTORS = [
  { id: '1', name: 'Dr. Anita Sharma', nameHi: 'डॉ. अनीता शर्मा', specialty: 'General Medicine', specialtyHi: 'सामान्य चिकित्सा', experience: '15 years', rating: 4.8, reviews: 342, available: true, fee: 199, avatar: '👩‍⚕️', hospital: 'PHC Araria' },
  { id: '2', name: 'Dr. Rajesh Patel', nameHi: 'डॉ. राजेश पटेल', specialty: 'Cardiology', specialtyHi: 'हृदय रोग', experience: '20 years', rating: 4.9, reviews: 518, available: true, fee: 499, avatar: '👨‍⚕️', hospital: 'District Hospital Patna' },
  { id: '3', name: 'Dr. Meera Krishnan', nameHi: 'डॉ. मीरा कृष्णन', specialty: 'Pediatrics', specialtyHi: 'बाल रोग', experience: '12 years', rating: 4.7, reviews: 256, available: false, fee: 299, avatar: '👩‍⚕️', hospital: 'CHC Sitapur' },
  { id: '4', name: 'Dr. Arjun Singh', nameHi: 'डॉ. अर्जुन सिंह', specialty: 'Orthopedics', specialtyHi: 'हड्डी रोग', experience: '18 years', rating: 4.6, reviews: 189, available: true, fee: 399, avatar: '👨‍⚕️', hospital: 'AIIMS Patna' },
];

type ConsultStep = 'select' | 'connecting' | 'call' | 'summary';

export default function DoctorConsultation({ language, onClose }: DoctorConsultationProps) {
  const isHindi = language === 'hi';
  const [step, setStep] = useState<ConsultStep>('select');
  const [selectedDoctor, setSelectedDoctor] = useState<typeof MOCK_DOCTORS[0] | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connectProgress, setConnectProgress] = useState(0);

  // Simulate connecting
  useEffect(() => {
    if (step === 'connecting') {
      const timer = setInterval(() => {
        setConnectProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setStep('call');
            return 100;
          }
          return prev + 4;
        });
      }, 100);
      return () => clearInterval(timer);
    }
  }, [step]);

  // Call timer
  useEffect(() => {
    if (step === 'call') {
      const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const endCall = () => {
    setStep('summary');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {/* Doctor Selection */}
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">{isHindi ? '👨‍⚕️ डॉक्टर से परामर्श' : '👨‍⚕️ Consult a Doctor'}</h2>
                    <p className="text-blue-100 text-sm mt-1">{isHindi ? 'ऑनलाइन वीडियो कॉल' : 'Online Video Consultation'}</p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
                {MOCK_DOCTORS.map(doc => (
                  <motion.button
                    key={doc.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { setSelectedDoctor(doc); if (doc.available) setStep('connecting'); }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      doc.available ? 'border-gray-200 hover:border-blue-400 hover:shadow-md' : 'border-gray-100 opacity-60'
                    }`}
                  >
                    <div className="text-4xl">{doc.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">{isHindi ? doc.nameHi : doc.name}</h3>
                        <Shield className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-sm text-gray-600">{isHindi ? doc.specialtyHi : doc.specialty} • {doc.experience}</p>
                      <p className="text-xs text-gray-500">{doc.hospital}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-sm"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {doc.rating}</span>
                        <span className="text-xs text-gray-500">({doc.reviews} reviews)</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${doc.available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {doc.available ? (isHindi ? 'उपलब्ध' : 'Available Now') : (isHindi ? 'व्यस्त' : 'Busy')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">₹{doc.fee}</p>
                      <p className="text-xs text-gray-500">{isHindi ? 'प्रति सत्र' : 'per session'}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Connecting */}
          {step === 'connecting' && selectedDoctor && (
            <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="p-8 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-6xl mb-6"
              >
                {selectedDoctor.avatar}
              </motion.div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isHindi ? `${selectedDoctor.nameHi} से जुड़ रहे हैं...` : `Connecting to ${selectedDoctor.name}...`}
              </h2>
              <p className="text-gray-500 mb-6">{isHindi ? 'कृपया प्रतीक्षा करें' : 'Please wait'}</p>
              <div className="w-64 mx-auto bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div className="h-full bg-blue-600 rounded-full" style={{ width: `${connectProgress}%` }} />
              </div>
              <p className="text-sm text-gray-400 mt-4">{isHindi ? 'एन्क्रिप्टेड कनेक्शन' : 'Encrypted Connection'} 🔒</p>
            </motion.div>
          )}

          {/* Video Call */}
          {step === 'call' && selectedDoctor && (
            <motion.div key="call" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Video Area */}
              <div className="relative bg-gray-900 aspect-video">
                {/* Doctor feed (simulated) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">{selectedDoctor.avatar}</div>
                    <p className="text-white text-lg font-semibold">{isHindi ? selectedDoctor.nameHi : selectedDoctor.name}</p>
                    <p className="text-gray-400 text-sm">{isHindi ? selectedDoctor.specialtyHi : selectedDoctor.specialty}</p>
                  </div>
                </div>

                {/* Self view */}
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border-2 border-white/30 flex items-center justify-center">
                  {isVideoOff ? <VideoOff className="w-8 h-8 text-gray-500" /> : <User className="w-8 h-8 text-gray-400" />}
                </div>

                {/* Duration */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-mono">{formatTime(callDuration)}</span>
                </div>

                {/* Encrypted badge */}
                <div className="absolute top-4 right-4 bg-green-600/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <Shield className="w-3 h-3 text-white" />
                  <span className="text-white text-xs">{isHindi ? 'एन्क्रिप्टेड' : 'Encrypted'}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-gray-900 p-6">
                <div className="flex justify-center gap-6">
                  <button onClick={() => setIsMuted(!isMuted)}
                    className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </button>
                  <button onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                    {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                  </button>
                  <button onClick={endCall}
                    className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all">
                    <PhoneOff className="w-6 h-6" />
                  </button>
                  <button className="p-4 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-all">
                    <MessageCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Call Summary */}
          {step === 'summary' && selectedDoctor && (
            <motion.div key="summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-3" />
                <h2 className="text-2xl font-bold">{isHindi ? 'परामर्श पूर्ण!' : 'Consultation Complete!'}</h2>
                <p className="text-green-100 mt-1">{isHindi ? `अवधि: ${formatTime(callDuration)}` : `Duration: ${formatTime(callDuration)}`}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{isHindi ? '👨‍⚕️ डॉक्टर का नोट' : '👨‍⚕️ Doctor\'s Notes'}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {isHindi
                      ? 'रोगी ने सामान्य लक्षणों की शिकायत की। नियमित जांच और दवाई की सलाह दी गई। 2 सप्ताह बाद फॉलो-अप।'
                      : 'Patient presented with common symptoms. Regular monitoring and medication advised. Follow-up in 2 weeks.'}
                  </p>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{isHindi ? '💊 प्रिस्क्रिप्शन' : '💊 Prescription'}</h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• Paracetamol 500mg - 1 tablet twice daily (5 days)</li>
                    <li>• Cetirizine 10mg - 1 tablet at night (3 days)</li>
                    <li>• ORS packets - As needed</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{isHindi ? '📋 अगले कदम' : '📋 Next Steps'}</h3>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>✓ {isHindi ? 'दवाई समय पर लें' : 'Take medicines on time'}</li>
                    <li>✓ {isHindi ? '2 सप्ताह बाद फॉलो-अप' : 'Follow-up after 2 weeks'}</li>
                    <li>✓ {isHindi ? 'बुखार बढ़ने पर तुरंत संपर्क करें' : 'Contact immediately if fever increases'}</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                    {isHindi ? '📥 प्रिस्क्रिप्शन डाउनलोड' : '📥 Download Prescription'}
                  </button>
                  <button onClick={onClose} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300">
                    {isHindi ? 'बंद करें' : 'Close'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
