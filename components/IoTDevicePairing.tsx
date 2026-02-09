'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bluetooth, Wifi, Watch, Heart, Activity, Thermometer,
  Smartphone, RefreshCw, CheckCircle, X, Signal, Battery,
  Zap, ArrowRight, Loader2
} from 'lucide-react';

interface IoTDevicePairingProps {
  language: string;
  onClose: () => void;
}

type PairStep = 'scan' | 'found' | 'pairing' | 'paired' | 'monitoring';

interface MockDevice {
  id: string;
  name: string;
  nameHi: string;
  type: 'watch' | 'bp' | 'glucometer' | 'thermometer' | 'oximeter';
  icon: string;
  signal: number;
  battery: number;
}

const MOCK_DEVICES: MockDevice[] = [
  { id: 'dev-1', name: 'SmartBand Pro', nameHi: 'स्मार्टबैंड प्रो', type: 'watch', icon: '⌚', signal: 85, battery: 72 },
  { id: 'dev-2', name: 'BP Monitor X1', nameHi: 'बीपी मॉनिटर X1', type: 'bp', icon: '🩺', signal: 92, battery: 88 },
  { id: 'dev-3', name: 'GlucoSense Mini', nameHi: 'ग्लूकोसेंस मिनी', type: 'glucometer', icon: '🩸', signal: 78, battery: 65 },
  { id: 'dev-4', name: 'ThermoScan BLE', nameHi: 'थर्मोस्कैन BLE', type: 'thermometer', icon: '🌡️', signal: 95, battery: 91 },
  { id: 'dev-5', name: 'PulseOx Ring', nameHi: 'पल्सऑक्स रिंग', type: 'oximeter', icon: '💍', signal: 88, battery: 45 },
];

const MOCK_VITALS = {
  heartRate: 78,
  spo2: 97,
  bp: '128/82',
  glucose: 142,
  temperature: 98.4,
  steps: 3247,
};

export default function IoTDevicePairing({ language, onClose }: IoTDevicePairingProps) {
  const isHindi = language === 'hi';
  const [step, setStep] = useState<PairStep>('scan');
  const [scanProgress, setScanProgress] = useState(0);
  const [foundDevices, setFoundDevices] = useState<MockDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<MockDevice | null>(null);
  const [pairProgress, setPairProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const startScan = useCallback(() => {
    setIsScanning(true);
    setScanProgress(0);
    setFoundDevices([]);
    
    const timer = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsScanning(false);
          setStep('found');
          return 100;
        }
        // Add devices progressively
        if (prev === 20) setFoundDevices(d => [...d, MOCK_DEVICES[0]]);
        if (prev === 40) setFoundDevices(d => [...d, MOCK_DEVICES[1]]);
        if (prev === 55) setFoundDevices(d => [...d, MOCK_DEVICES[2]]);
        if (prev === 70) setFoundDevices(d => [...d, MOCK_DEVICES[3]]);
        if (prev === 85) setFoundDevices(d => [...d, MOCK_DEVICES[4]]);
        return prev + 2;
      });
    }, 80);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    startScan();
  }, [startScan]);

  const pairDevice = (device: MockDevice) => {
    setSelectedDevice(device);
    setStep('pairing');
    setPairProgress(0);
    const timer = setInterval(() => {
      setPairProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setStep('paired');
          return 100;
        }
        return prev + 3;
      });
    }, 80);
  };

  const showMonitoring = () => setStep('monitoring');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bluetooth className="w-6 h-6" />
                {isHindi ? 'डिवाइस कनेक्ट करें' : 'Connect Device'}
              </h2>
              <p className="text-cyan-100 text-sm mt-1">
                {isHindi ? 'IoT स्वास्थ्य उपकरण' : 'IoT Health Devices'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[65vh]">
          <AnimatePresence mode="wait">
            {/* Scanning */}
            {(step === 'scan' || (step === 'found' && foundDevices.length === 0)) && (
              <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                  <Bluetooth className="w-16 h-16 text-blue-500 mx-auto" />
                </motion.div>
                <h3 className="text-lg font-semibold mt-4 text-gray-900 dark:text-white">
                  {isHindi ? 'स्कैन हो रहा है...' : 'Scanning for devices...'}
                </h3>
                <div className="w-48 mx-auto bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                  <motion.div className="h-full bg-blue-600 rounded-full" style={{ width: `${scanProgress}%` }} />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {foundDevices.length} {isHindi ? 'उपकरण मिले' : 'devices found'}
                </p>
              </motion.div>
            )}

            {/* Found Devices */}
            {step === 'found' && foundDevices.length > 0 && (
              <motion.div key="found" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {isHindi ? `${foundDevices.length} उपकरण मिले` : `${foundDevices.length} Devices Found`}
                  </h3>
                  <button onClick={startScan} className="text-sm text-blue-600 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> {isHindi ? 'पुनः स्कैन' : 'Rescan'}
                  </button>
                </div>
                <div className="space-y-2">
                  {foundDevices.map((device, idx) => (
                    <motion.button
                      key={device.id}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => pairDevice(device)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border-2 border-gray-200 hover:border-cyan-400 hover:shadow-md transition-all text-left"
                    >
                      <span className="text-3xl">{device.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white">{isHindi ? device.nameHi : device.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Signal className="w-3 h-3" /> {device.signal}%</span>
                          <span className="flex items-center gap-1"><Battery className="w-3 h-3" /> {device.battery}%</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Pairing */}
            {step === 'pairing' && selectedDevice && (
              <motion.div key="pairing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                  <span className="text-6xl">{selectedDevice.icon}</span>
                </motion.div>
                <h3 className="text-lg font-semibold mt-4 text-gray-900 dark:text-white">
                  {isHindi ? `${selectedDevice.nameHi} जोड़ रहे हैं...` : `Pairing ${selectedDevice.name}...`}
                </h3>
                <div className="w-48 mx-auto bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                  <motion.div className="h-full bg-cyan-500 rounded-full" style={{ width: `${pairProgress}%` }} />
                </div>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  {pairProgress > 20 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ {isHindi ? 'ब्लूटूथ कनेक्ट' : 'Bluetooth connected'}</motion.p>}
                  {pairProgress > 50 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ {isHindi ? 'प्रमाणीकरण सफल' : 'Authentication successful'}</motion.p>}
                  {pairProgress > 80 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>✓ {isHindi ? 'डेटा सिंक हो रहा है' : 'Syncing data...'}</motion.p>}
                </div>
              </motion.div>
            )}

            {/* Paired Success */}
            {step === 'paired' && selectedDevice && (
              <motion.div key="paired" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
                </motion.div>
                <h3 className="text-xl font-bold mt-4 text-gray-900 dark:text-white">
                  {isHindi ? 'सफलतापूर्वक जुड़ गया!' : 'Successfully Paired!'}
                </h3>
                <p className="text-gray-500 mt-1">{isHindi ? selectedDevice.nameHi : selectedDevice.name}</p>
                <button onClick={showMonitoring}
                  className="mt-6 px-8 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-700 transition-all flex items-center gap-2 mx-auto">
                  <Activity className="w-5 h-5" />
                  {isHindi ? 'लाइव मॉनिटरिंग देखें' : 'View Live Monitoring'}
                </button>
              </motion.div>
            )}

            {/* Live Monitoring */}
            {step === 'monitoring' && (
              <motion.div key="monitoring" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {isHindi ? 'लाइव मॉनिटरिंग' : 'Live Monitoring'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <VitalCard icon={<Heart className="w-5 h-5" />} label={isHindi ? 'हृदय गति' : 'Heart Rate'} value={`${MOCK_VITALS.heartRate}`} unit="bpm" color="red" pulse />
                  <VitalCard icon={<Activity className="w-5 h-5" />} label={isHindi ? 'SpO2' : 'SpO2'} value={`${MOCK_VITALS.spo2}`} unit="%" color="blue" />
                  <VitalCard icon={<Zap className="w-5 h-5" />} label={isHindi ? 'रक्तचाप' : 'Blood Pressure'} value={MOCK_VITALS.bp} unit="mmHg" color="purple" />
                  <VitalCard icon={<Thermometer className="w-5 h-5" />} label={isHindi ? 'तापमान' : 'Temperature'} value={`${MOCK_VITALS.temperature}`} unit="°F" color="orange" />
                </div>
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                    ✅ {isHindi ? 'सभी संकेत सामान्य सीमा में। अगला अपडेट 30 सेकंड में।' : 'All vitals within normal range. Next update in 30 seconds.'}
                  </p>
                </div>
                <button onClick={onClose} className="w-full mt-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300">
                  {isHindi ? 'बंद करें' : 'Close'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function VitalCard({ icon, label, value, unit, color, pulse }: {
  icon: React.ReactNode; label: string; value: string; unit: string; color: string; pulse?: boolean;
}) {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
  };
  return (
    <motion.div className={`${colorMap[color]} p-3 rounded-xl`} whileHover={{ scale: 1.02 }}>
      <div className="flex items-center gap-2 mb-1">{icon} <span className="text-xs font-medium">{label}</span></div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${pulse ? 'animate-pulse' : ''}`}>{value}</span>
        <span className="text-xs opacity-70">{unit}</span>
      </div>
    </motion.div>
  );
}
