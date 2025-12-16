/**
 * Selection Card Component
 * 
 * Reusable card component for single and multi-select options.
 * Features large touch targets and visual selection states.
 */

'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectionCardProps {
  /** Display label for the option */
  label: string;
  /** Whether this option is currently selected */
  selected: boolean;
  /** Called when the card is clicked */
  onSelect: () => void;
  /** Whether this is a multi-select card (checkbox style) or single-select (radio style) */
  multiSelect?: boolean;
  /** Optional description text below the label */
  description?: string;
  /** Whether the card is disabled */
  disabled?: boolean;
}

export function SelectionCard({
  label,
  selected,
  onSelect,
  multiSelect = false,
  description,
  disabled = false,
}: SelectionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'w-full min-h-[56px] px-4 py-3 rounded-xl border-2 transition-all duration-200',
        'flex items-center gap-3 text-left',
        'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
        selected
          ? 'border-teal-500 bg-teal-50/50'
          : 'border-gray-200 bg-white hover:border-gray-300',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200',
          multiSelect ? 'rounded-md' : 'rounded-full',
          selected
            ? 'bg-teal-500 border-teal-500'
            : 'border-gray-300 bg-white'
        )}
      >
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </motion.div>
        )}
      </div>

      {/* Label and description */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'block font-medium text-base',
            selected ? 'text-teal-700' : 'text-gray-700'
          )}
        >
          {label}
        </span>
        {description && (
          <span className="block text-sm text-gray-500 mt-0.5">
            {description}
          </span>
        )}
      </div>
    </motion.button>
  );
}

export default SelectionCard;

