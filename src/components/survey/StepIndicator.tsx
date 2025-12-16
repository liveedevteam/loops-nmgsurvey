/**
 * Step Indicator Component
 * 
 * Displays current progress through the survey steps.
 * Shows a visual progress bar and step count (e.g., "Step 2 of 5")
 */

'use client';

import { motion } from 'framer-motion';

interface StepIndicatorProps {
  /** Current step (1-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full space-y-3">
      {/* Step counter text */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground font-medium">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-teal-600 font-semibold">
          {Math.round(progress)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between px-1">
        {Array.from({ length: totalSteps }, (_, i) => (
          <motion.div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              i + 1 <= currentStep
                ? 'bg-teal-500'
                : 'bg-gray-200'
            }`}
            initial={{ scale: 0.8 }}
            animate={{ scale: i + 1 === currentStep ? 1.2 : 1 }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

export default StepIndicator;

