'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Heart, Thermometer, Droplet, Wind, TrendingUp, TrendingDown, Minus,
  Watch, Bluetooth, Check, X, ChevronDown, Loader2, Link, Unlink
} from 'lucide-react';
import { VitalSigns } from '@/types';
import { VITAL_RANGES } from '@/lib/constants';
import toast from 'react-hot-toast';

// Device database with brands and models
const DEVICE_DATABASE: Record<string, { name: string; icon: any; brands: Record<string, string[]> }> = {
  smartwatch: {
    name: 'Smart Watch',
    icon: Watch,
    brands: {
      'Apple': ['Apple Watch Series 9', 'Apple Watch SE', 'Apple Watch Ultra 2'],
      'Samsung': ['Galaxy Watch 6', 'Galaxy Watch 5', 'Galaxy Fit 3'],
      'Fitbit': ['Sense 2', 'Versa 4', 'Charge 6', 'Inspire 3'],
      'Amazfit': ['GTR 4', 'GTS 4', 'Bip 5', 'Band 7'],
      'Noise': ['ColorFit Pro 4', 'ColorFit Ultra 3', 'Pulse 2'],
      'boAt': ['Storm Pro', 'Wave Lite', 'Xtend Plus'],
      'Xiaomi': ['Mi Band 8', 'Smart Band 7 Pro', 'Watch S1'],
      'OnePlus': ['Watch 2', 'Nord Watch'],
    }
  },
  'bp-monitor': {
    name: 'Blood Pressure Monitor',
    icon: Activity,
    brands: {
      'Omron': ['HEM-7120', 'HEM-7140', 'HEM-7156', 'Evolv'],
      'Dr. Trust': ['Goldline', 'Smart Dual Talking'],
      'Beurer': ['BM 35', 'BM 57', 'BM 77'],
      'HealthSense': ['Heart-Mate Classic', 'Heart-Mate Digital'],
      'AccuSure': ['AS Series', 'TM Series'],
    }
  },
  thermometer: {
    name: 'Digital Thermometer',
    icon: Thermometer,
    brands: {
      'Omron': ['MC-720', 'MC-246', 'Gentle Temp'],
      'Dr. Trust': ['Forehead IR', 'Digital'],
      'Beurer': ['FT 85', 'FT 95'],
      'Braun': ['ThermoScan 7', 'No Touch + Forehead'],
      'HealthSense': ['Digital Flexible Tip'],
      'AccuSure': ['Non-Contact', 'Digital'],
    }
  },
  oximeter: {
    name: 'Pulse Oximeter',
    icon: Droplet,
    brands: {
      'Dr. Trust': ['Pulse Oximeter', 'Professional Series'],
      'Beurer': ['PO 30', 'PO 60'],
      'HealthSense': ['Accu-Sure', 'Accu-Pro'],
      'Omron': ['HPO-100', 'HPO-300'],
      'AccuSure': ['CMS 50D', 'YK-80A'],
    }
  },
  glucometer: {
    name: 'Glucometer',
    icon: Droplet,
    brands: {
      'Accu-Chek': ['Active', 'Instant', 'Guide', 'Performa'],
      'OneTouch': ['Select Plus', 'Verio Flex', 'Ultra Plus'],
      'Dr. Morepen': ['BG-03', 'Gluco One'],
      'Contour': ['Plus One', 'Next'],
      'Sugar Check': ['Advanced'],
    }
  },
};

interface DeviceConnection {
  deviceType: string;
  brand: string;
  model: string;
  connected: boolean;
  connecting: boolean;
}

export default function VitalsDashboard() {
  const [vitals, setVitals] = useState<VitalSigns | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceType, setDeviceType] = useState('smartwatch');
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [connectedDevices, setConnectedDevices] = useState<DeviceConnection[]>([]);
  const [isPairing, setIsPairing] = useState(false);

  // Load connected devices from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('connectedDevices');
    if (saved) {
      setConnectedDevices(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Simulate IoT device connection
    fetchVitals();
    const interval = setInterval(fetchVitals, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [deviceType]);

  const fetchVitals = async () => {
    try {
      const response = await fetch(`/api/iot/vitals?type=${deviceType}`);
      const data = await response.json();

      setVitals({
        heartRate: data.data.heartRate,
        bloodPressure: data.data.bloodPressure,
        temperature: parseFloat(data.data.temperature),
        oxygenSaturation: data.data.oxygenSaturation,
        respiratoryRate: data.data.respiratoryRate || 16,
        timestamp: new Date(data.timestamp),
      });
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to fetch vitals:', error);
      setIsConnected(false);
    }
  };

  const getVitalStatus = (value: number, range: number[]): 'normal' | 'warning' | 'critical' => {
    if (value < range[0] * 0.8 || value > range[1] * 1.2) return 'critical';
    if (value < range[0] || value > range[1]) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <TrendingUp className="w-5 h-5" />;
      case 'warning': return <Minus className="w-5 h-5" />;
      case 'critical': return <TrendingDown className="w-5 h-5" />;
      default: return null;
    }
  };

  const openPairingModal = (type: string) => {
    setDeviceType(type);
    setSelectedBrand('');
    setSelectedModel('');
    setShowPairingModal(true);
  };

  const pairDevice = async () => {
    if (!selectedBrand || !selectedModel) {
      toast.error('Please select both brand and model');
      return;
    }

    setIsPairing(true);

    // Simulate pairing process
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newDevice: DeviceConnection = {
      deviceType,
      brand: selectedBrand,
      model: selectedModel,
      connected: true,
      connecting: false,
    };

    const updatedDevices = [...connectedDevices.filter(d => d.deviceType !== deviceType), newDevice];
    setConnectedDevices(updatedDevices);
    localStorage.setItem('connectedDevices', JSON.stringify(updatedDevices));

    setIsPairing(false);
    setShowPairingModal(false);
    toast.success(`${selectedBrand} ${selectedModel} connected successfully!`);
  };

  const disconnectDevice = (type: string) => {
    const updatedDevices = connectedDevices.filter(d => d.deviceType !== type);
    setConnectedDevices(updatedDevices);
    localStorage.setItem('connectedDevices', JSON.stringify(updatedDevices));
    toast.success('Device disconnected');
  };

  const isDeviceConnected = (type: string) => {
    return connectedDevices.some(d => d.deviceType === type && d.connected);
  };

  const getConnectedDevice = (type: string) => {
    return connectedDevices.find(d => d.deviceType === type);
  };

  const vitalCards = [
    {
      title: 'Heart Rate',
      value: vitals?.heartRate,
      unit: 'bpm',
      icon: Heart,
      range: VITAL_RANGES.heartRate.normal,
      color: 'from-red-400 to-pink-500',
    },
    {
      title: 'Blood Pressure',
      value: vitals?.bloodPressure ? `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}` : null,
      unit: 'mmHg',
      icon: Activity,
      range: VITAL_RANGES.systolicBP.normal,
      color: 'from-blue-400 to-cyan-500',
    },
    {
      title: 'Temperature',
      value: vitals?.temperature,
      unit: '°F',
      icon: Thermometer,
      range: VITAL_RANGES.temperature.normal,
      color: 'from-orange-400 to-red-500',
    },
    {
      title: 'Oxygen Saturation',
      value: vitals?.oxygenSaturation,
      unit: '%',
      icon: Droplet,
      range: VITAL_RANGES.oxygenSaturation.normal,
      color: 'from-cyan-400 to-blue-500',
    },
    {
      title: 'Respiratory Rate',
      value: vitals?.respiratoryRate,
      unit: 'br/min',
      icon: Wind,
      range: VITAL_RANGES.respiratoryRate.normal,
      color: 'from-green-400 to-teal-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Live Vitals Monitoring</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Device Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(DEVICE_DATABASE).map(([type, device]) => {
            const Icon = device.icon;
            const connected = isDeviceConnected(type);
            const connectedDevice = getConnectedDevice(type);

            return (
              <div
                key={type}
                className={`relative border-2 rounded-xl p-4 transition-all ${connected
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-blue-500'
                  }`}
              >
                <div className="flex flex-col items-center">
                  <div className={`p-3 rounded-full mb-2 ${connected ? 'bg-green-500' : 'bg-gray-100'}`}>
                    <Icon className={`w-6 h-6 ${connected ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-center">{device.name}</h3>

                  {connected && connectedDevice && (
                    <div className="text-xs text-green-600 text-center mt-1">
                      <p className="font-medium">{connectedDevice.brand}</p>
                      <p className="text-gray-500 truncate max-w-full">{connectedDevice.model}</p>
                    </div>
                  )}

                  <div className="flex gap-1 mt-3">
                    {connected ? (
                      <>
                        <button
                          onClick={() => disconnectDevice(type)}
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        >
                          <Unlink className="w-3 h-3" />
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => openPairingModal(type)}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        <Link className="w-3 h-3" />
                        Connect
                      </button>
                    )}
                  </div>
                </div>

                {connected && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {vitals && (
          <p className="text-xs text-gray-500 mt-4">
            Last updated: {vitals.timestamp.toLocaleString()}
          </p>
        )}
      </div>

      {/* Vitals Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vitalCards.map((card, index) => {
          const Icon = card.icon;
          const value = typeof card.value === 'number' ? card.value : card.value;
          const numericValue = typeof card.value === 'number' ? card.value :
            (vitals?.bloodPressure ? vitals.bloodPressure.systolic : 0);
          const status = typeof card.value === 'number' ?
            getVitalStatus(card.value, card.range) : 'normal';

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="vitals-card bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
                  <div className="flex items-baseline mt-2">
                    {value !== null && value !== undefined ? (
                      <>
                        <span className="text-3xl font-bold">{value}</span>
                        <span className="text-sm text-gray-500 ml-2">{card.unit}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Normal: {card.range[0]}-{card.range[1]} {card.unit}
                </div>
                <div className={`flex items-center space-x-1 ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                  <span className="text-xs font-semibold capitalize">{status}</span>
                </div>
              </div>

              {/* Mini chart visualization */}
              <div className="mt-4 h-12 bg-gray-50 rounded-lg flex items-end space-x-1 px-2 py-2">
                {Array.from({ length: 20 }).map((_, i) => {
                  const height = Math.random() * 80 + 20;
                  return (
                    <div
                      key={i}
                      className={`flex-1 bg-gradient-to-t ${card.color} rounded-sm opacity-70`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Alerts */}
      {vitals && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Health Alerts</h3>
          {(() => {
            const alerts = [];

            if (vitals.heartRate && (vitals.heartRate < 50 || vitals.heartRate > 110)) {
              alerts.push({
                type: vitals.heartRate < 50 || vitals.heartRate > 130 ? 'critical' : 'warning',
                message: `Heart rate is ${vitals.heartRate < 50 ? 'below' : 'above'} normal range`,
              });
            }

            if (vitals.bloodPressure) {
              if (vitals.bloodPressure.systolic > 140 || vitals.bloodPressure.diastolic > 90) {
                alerts.push({
                  type: vitals.bloodPressure.systolic > 160 ? 'critical' : 'warning',
                  message: 'Blood pressure is elevated',
                });
              }
            }

            if (vitals.oxygenSaturation && vitals.oxygenSaturation < 95) {
              alerts.push({
                type: vitals.oxygenSaturation < 90 ? 'critical' : 'warning',
                message: 'Oxygen saturation is low',
              });
            }

            if (alerts.length === 0) {
              return (
                <p className="text-green-600 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  All vitals are within normal range
                </p>
              );
            }

            return (
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg flex items-center ${alert.type === 'critical'
                        ? 'bg-red-50 text-red-800'
                        : 'bg-yellow-50 text-yellow-800'
                      }`}
                  >
                    <TrendingDown className="w-5 h-5 mr-2" />
                    <span>{alert.message}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Pairing Modal */}
      <AnimatePresence>
        {showPairingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !isPairing && setShowPairingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Bluetooth className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Connect Device</h3>
                    <p className="text-sm text-gray-500">{DEVICE_DATABASE[deviceType]?.name}</p>
                  </div>
                </div>
                {!isPairing && (
                  <button
                    onClick={() => setShowPairingModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {isPairing ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">Searching for device...</h4>
                  <p className="text-sm text-gray-500">
                    Make sure your {selectedBrand} {selectedModel} is nearby and in pairing mode
                  </p>
                </div>
              ) : (
                <>
                  {/* Brand Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Brand
                    </label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => {
                        setSelectedBrand(e.target.value);
                        setSelectedModel('');
                      }}
                      className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">-- Select Brand --</option>
                      {Object.keys(DEVICE_DATABASE[deviceType]?.brands || {}).map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  {/* Model Selection */}
                  {selectedBrand && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-6"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Model
                      </label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">-- Select Model --</option>
                        {DEVICE_DATABASE[deviceType]?.brands[selectedBrand]?.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  {/* Pair Button */}
                  <button
                    onClick={pairDevice}
                    disabled={!selectedBrand || !selectedModel}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Bluetooth className="w-5 h-5" />
                    Connect Device
                  </button>

                  {/* Instructions */}
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                    <p className="font-semibold mb-2">📋 How to connect:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Turn on Bluetooth on your phone</li>
                      <li>Enable pairing mode on your device</li>
                      <li>Select brand and model above</li>
                      <li>Click "Connect Device"</li>
                    </ol>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
