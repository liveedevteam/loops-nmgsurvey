/**
 * Step 2: Gender Selection
 * 
 * Single-select step for choosing gender.
 */

'use client';

import { motion } from 'framer-motion';
import { SelectionCard } from './SelectionCard';
import { GENDERS, Gender } from '@/types/survey';

interface StepGenderProps {
  /** Currently selected gender */
  value: Gender | null;
  /** Called when selection changes */
  onChange: (value: Gender) => void;
}

/** Human-readable labels for genders */
const GENDER_LABELS: Record<typeof GENDERS[number], string> = {
  male: 'Male',
  female: 'Female',
};

export function StepGender({ value, onChange }: StepGenderProps) {
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
          What&apos;s your gender?
        </h2>
        <p className="text-gray-500">
          Please select the option that best describes you.
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {GENDERS.map((gender, index) => (
          <motion.div
            key={gender}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <SelectionCard
              label={GENDER_LABELS[gender]}
              selected={value === gender}
              onSelect={() => onChange(gender)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default StepGender;

