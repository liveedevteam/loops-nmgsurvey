/**
 * Step 5: Current Brand Input
 * 
 * Text input step for entering current supplement brand.
 */

'use client';

import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';

interface StepBrandProps {
  /** Current brand value */
  value: string;
  /** Called when value changes */
  onChange: (value: string) => void;
}

export function StepBrand({ value, onChange }: StepBrandProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Question header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          What supplement brand are you currently using?
        </h2>
        <p className="text-gray-500">
          Tell us about your current supplement brand(s). If you&apos;re not using any, just type &quot;None&quot;.
        </p>
      </div>

      {/* Text input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Textarea
          placeholder="e.g., Blackmores, Centrum, Nature's Way..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px] text-base rounded-xl resize-none"
        />
        <p className="mt-2 text-sm text-gray-400">
          {value.length}/200 characters
        </p>
      </motion.div>

      {/* Encouragement message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-100"
      >
        <p className="text-teal-700 text-sm font-medium">
          🎁 You&apos;re almost done! Complete this survey to receive your exclusive discount coupon.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default StepBrand;

