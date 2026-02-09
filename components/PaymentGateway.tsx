'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Smartphone, QrCode, CheckCircle, Shield,
  X, ArrowRight, IndianRupee, Wallet, Building2
} from 'lucide-react';

interface PaymentGatewayProps {
  language: string;
  onClose: () => void;
  amount?: number;
  description?: string;
}

type PayStep = 'method' | 'upi' | 'processing' | 'success';

export default function PaymentGateway({ language, onClose, amount = 199, description }: PaymentGatewayProps) {
  const isHindi = language === 'hi';
  const [step, setStep] = useState<PayStep>('method');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [processProgress, setProcessProgress] = useState(0);

  const paymentMethods = [
    { id: 'upi', icon: <Smartphone className="w-6 h-6" />, label: 'UPI / Google Pay', desc: isHindi ? 'GPay, PhonePe, Paytm' : 'GPay, PhonePe, Paytm', popular: true },
    { id: 'card', icon: <CreditCard className="w-6 h-6" />, label: isHindi ? 'डेबिट/क्रेडिट कार्ड' : 'Debit/Credit Card', desc: 'Visa, Mastercard, RuPay' },
    { id: 'nb', icon: <Building2 className="w-6 h-6" />, label: isHindi ? 'नेट बैंकिंग' : 'Net Banking', desc: isHindi ? 'सभी बैंक' : 'All Banks' },
    { id: 'wallet', icon: <Wallet className="w-6 h-6" />, label: isHindi ? 'वॉलेट' : 'Wallet', desc: 'Paytm, Amazon Pay' },
  ];

  const handlePay = () => {
    setStep('processing');
    let prog = 0;
    const timer = setInterval(() => {
      prog += 5;
      setProcessProgress(prog);
      if (prog >= 100) {
        clearInterval(timer);
        setTimeout(() => setStep('success'), 300);
      }
    }, 100);
  };

  const selectMethod = (method: string) => {
    setSelectedMethod(method);
    if (method === 'upi') {
      setStep('upi');
    } else {
      handlePay();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
      >
        <AnimatePresence mode="wait">
          {/* Payment Method Selection */}
          {step === 'method' && (
            <motion.div key="method" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">{isHindi ? '💳 भुगतान करें' : '💳 Make Payment'}</h2>
                    <p className="text-green-100 text-sm mt-1">{description || (isHindi ? 'डॉक्टर परामर्श शुल्क' : 'Doctor Consultation Fee')}</p>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                <div className="mt-4 bg-white/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-green-100">{isHindi ? 'कुल राशि' : 'Total Amount'}</p>
                  <p className="text-4xl font-bold mt-1">₹{amount}</p>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {isHindi ? 'भुगतान विधि चुनें' : 'Select Payment Method'}
                </p>
                {paymentMethods.map(method => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => selectMethod(method.id)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:shadow transition-all text-left"
                  >
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">{method.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{method.label}</h4>
                        {method.popular && <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">{isHindi ? 'लोकप्रिय' : 'Popular'}</span>}
                      </div>
                      <p className="text-xs text-gray-500">{method.desc}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </motion.button>
                ))}

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                  <Shield className="w-3 h-3" />
                  <span>{isHindi ? '100% सुरक्षित भुगतान - RBI अनुमोदित' : '100% Secure Payment - RBI Approved'}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* UPI ID Entry */}
          {step === 'upi' && (
            <motion.div key="upi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-6 text-white">
                <h2 className="text-xl font-bold">{isHindi ? 'UPI से भुगतान' : 'Pay via UPI'}</h2>
                <p className="text-purple-100 text-sm mt-1">₹{amount}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* QR Code Simulation */}
                <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-xl text-center">
                  <QrCode className="w-32 h-32 mx-auto text-gray-800 dark:text-gray-200" />
                  <p className="text-sm text-gray-500 mt-2">{isHindi ? 'QR कोड स्कैन करें' : 'Scan QR Code'}</p>
                </div>

                <div className="relative flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-300" />
                  <span className="text-sm text-gray-500">{isHindi ? 'या' : 'OR'}</span>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isHindi ? 'UPI ID दर्ज करें' : 'Enter UPI ID'}
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full mt-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep('method')} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold">
                    {isHindi ? 'वापस' : 'Back'}
                  </button>
                  <button onClick={handlePay} className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700">
                    {isHindi ? `₹${amount} भुगतान करें` : `Pay ₹${amount}`}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <IndianRupee className="w-16 h-16 text-green-600 mx-auto" />
              </motion.div>
              <h3 className="text-lg font-bold mt-4 text-gray-900 dark:text-white">
                {isHindi ? 'भुगतान प्रोसेस हो रहा है...' : 'Processing Payment...'}
              </h3>
              <div className="w-48 mx-auto bg-gray-200 rounded-full h-2 mt-4 overflow-hidden">
                <motion.div className="h-full bg-green-500 rounded-full" style={{ width: `${processProgress}%` }} />
              </div>
              <p className="text-sm text-gray-500 mt-4">
                {isHindi ? 'कृपया इस पेज को बंद न करें' : 'Please do not close this page'}
              </p>
            </motion.div>
          )}

          {/* Success */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
                <div className="w-24 h-24 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
              </motion.div>
              <h2 className="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
                {isHindi ? 'भुगतान सफल!' : 'Payment Successful!'}
              </h2>
              <p className="text-3xl font-bold text-green-600 mt-2">₹{amount}</p>
              <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between"><span className="text-gray-500">Transaction ID</span><span className="font-mono text-gray-900 dark:text-white">TXN{Date.now().toString().slice(-8)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{isHindi ? 'विधि' : 'Method'}</span><span className="text-gray-900 dark:text-white">{selectedMethod.toUpperCase()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">{isHindi ? 'स्थिति' : 'Status'}</span><span className="text-green-600 font-semibold">{isHindi ? 'सफल' : 'Success'}</span></div>
              </div>
              <button onClick={onClose} className="w-full mt-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">
                {isHindi ? 'बंद करें' : 'Done'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
