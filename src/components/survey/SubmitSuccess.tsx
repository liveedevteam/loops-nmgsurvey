/**
 * Submit Success Screen
 * 
 * Displayed after successful survey submission.
 * Shows the coupon code and provides a countdown before closing LIFF.
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Gift, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiff } from '@/components/LiffProvider';

interface SubmitSuccessProps {
  /** Generated coupon code */
  couponCode: string;
}

export function SubmitSuccess({ couponCode }: SubmitSuccessProps) {
  const { closeLiff } = useLiff();
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Auto-close countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          closeLiff();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [closeLiff]);

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mb-8 shadow-lg shadow-teal-200"
      >
        <CheckCircle2 className="w-14 h-14 text-white" />
      </motion.div>

      {/* Thank you message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Thank You!
        </h1>
        <p className="text-gray-500">
          Your response has been recorded successfully.
        </p>
      </motion.div>

      {/* Coupon card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-teal-200/50">
          {/* Gift icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
          </div>

          {/* Coupon header */}
          <div className="text-center mb-6">
            <p className="text-teal-100 text-sm mb-1">Your Discount Coupon</p>
            <p className="text-2xl font-bold">
              {process.env.NEXT_PUBLIC_COUPON_DISCOUNT || '10% OFF'}
            </p>
          </div>

          {/* Coupon code box */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
            <p className="text-center text-xs text-teal-100 mb-2">COUPON CODE</p>
            <p className="text-center text-2xl font-mono font-bold tracking-wider">
              {couponCode}
            </p>
          </div>

          {/* Copy button */}
          <Button
            onClick={handleCopy}
            variant="secondary"
            className="w-full h-12 bg-white text-teal-600 hover:bg-teal-50 font-semibold rounded-xl"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 mr-2" />
                Copy Code
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* LINE notification */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-sm text-gray-500 mt-6"
      >
        📱 We&apos;ve also sent this coupon to your LINE chat!
      </motion.p>

      {/* Auto-close countdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <p className="text-gray-400 text-sm">
          This window will close in {countdown} seconds
        </p>
        <Button
          variant="ghost"
          onClick={closeLiff}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4 mr-1" />
          Close now
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default SubmitSuccess;

