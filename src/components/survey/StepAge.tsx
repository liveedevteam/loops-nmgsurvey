/**
 * Step 1: Age Range Selection
 * 
 * Single-select step for choosing age range.
 */

'use client';

import { motion } from 'framer-motion';
import { SelectionCard } from './SelectionCard';
import { AGE_RANGES, AgeRange } from '@/types/survey';

interface StepAgeProps {
  /** Currently selected age range */
  value: AgeRange | null;
  /** Called when selection changes */
  onChange: (value: AgeRange) => void;
}

/** Human-readable labels for age ranges */
const AGE_LABELS: Record<typeof AGE_RANGES[number], string> = {
  '18-24': '18 – 24 years',
  '25-34': '25 – 34 years',
  '35-44': '35 – 44 years',
  '45-54': '45 – 54 years',
  '55-64': '55 – 64 years',
  '65+': '65+ years',
};

export function StepAge({ value, onChange }: StepAgeProps) {
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
          What&apos;s your age range?
        </h2>
        <p className="text-gray-500">
          Please select the option that best describes you.
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {AGE_RANGES.map((age, index) => (
          <motion.div
            key={age}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <SelectionCard
              label={AGE_LABELS[age]}
              selected={value === age}
              onSelect={() => onChange(age)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default StepAge;

