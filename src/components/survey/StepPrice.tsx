/**
 * Step 4: Price Range Preference
 * 
 * Single-select step for choosing willingness to pay per product.
 */

'use client';

import { motion } from 'framer-motion';
import { SelectionCard } from './SelectionCard';
import { PRICE_RANGES, PRICE_RANGE_LABELS, PriceRange } from '@/types/survey';

interface StepPriceProps {
  /** Currently selected price range */
  value: PriceRange | null;
  /** Called when selection changes */
  onChange: (value: PriceRange) => void;
}

export function StepPrice({ value, onChange }: StepPriceProps) {
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
          How much are you willing to pay per product?
        </h2>
        <p className="text-gray-500">
          Please select your preferred price range.
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {PRICE_RANGES.map((range, index) => (
          <motion.div
            key={range}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <SelectionCard
              label={PRICE_RANGE_LABELS[range]}
              selected={value === range}
              onSelect={() => onChange(range)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default StepPrice;

