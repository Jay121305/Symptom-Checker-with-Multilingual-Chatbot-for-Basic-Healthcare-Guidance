'use client';

import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function EmergencyButton() {
  const [isEmergency, setIsEmergency] = useState(false);

  const handleEmergency = async () => {
    if (!confirm('Are you experiencing a medical emergency? This will alert emergency services and your contacts.')) {
      return;
    }

    setIsEmergency(true);

    try {
      // Get user location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            // Send emergency alert
            const response = await fetch('/api/emergency', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: 'user-001', // In production, get from auth
                location,
                symptoms: ['Emergency situation'],
                vitals: {},
                emergencyContacts: [
                  { name: 'Emergency Contact 1', phone: '+911234567890' },
                ],
              }),
            });

            if (response.ok) {
              toast.success('🚨 Emergency services have been notified!');
              
              // Call emergency number
              if (confirm('Call 108 (Emergency Services) now?')) {
                window.location.href = 'tel:108';
              }
            } else {
              throw new Error('Failed to send alert');
            }
          },
          (error) => {
            console.error('Location error:', error);
            toast.error('Could not get your location. Please call 108 directly.');
          }
        );
      } else {
        toast.error('Location services not available. Please call 108 directly.');
      }
    } catch (error) {
      console.error('Emergency alert error:', error);
      toast.error('Failed to send alert. Please call 108 immediately!');
    } finally {
      setTimeout(() => setIsEmergency(false), 3000);
    }
  };

  return (
    <button
      onClick={handleEmergency}
      disabled={isEmergency}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all ${
        isEmergency
          ? 'bg-red-600 text-white animate-pulse-glow cursor-not-allowed'
          : 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg'
      }`}
    >
      <AlertCircle className="w-5 h-5" />
      <span>{isEmergency ? 'ALERTING...' : 'SOS EMERGENCY'}</span>
    </button>
  );
}
