/**
 * Navigation Buttons Component
 * 
 * Fixed bottom navigation bar with Back, Next, and Submit buttons.
 * Handles step navigation and form submission.
 */

'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavigationButtonsProps {
  /** Current step (1-indexed) */
  currentStep: number;
  /** Total number of steps */
  totalSteps: number;
  /** Whether the Next/Submit button should be disabled */
  canProceed: boolean;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Called when Back button is clicked */
  onBack: () => void;
  /** Called when Next button is clicked */
  onNext: () => void;
  /** Called when Submit button is clicked (last step) */
  onSubmit: () => void;
}

export function NavigationButtons({
  currentStep,
  totalSteps,
  canProceed,
  isSubmitting = false,
  onBack,
  onNext,
  onSubmit,
}: NavigationButtonsProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 p-4 safe-area-pb"
    >
      <div className="max-w-md mx-auto flex gap-3">
        {/* Back Button */}
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep || isSubmitting}
          className={cn(
            'flex-1 h-14 text-base font-medium rounded-xl transition-all duration-200',
            isFirstStep ? 'opacity-0 pointer-events-none' : 'opacity-100'
          )}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </Button>

        {/* Next / Submit Button */}
        {isLastStep ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
            className={cn(
              'flex-[2] h-14 text-base font-semibold rounded-xl',
              'bg-gradient-to-r from-teal-500 to-emerald-500',
              'hover:from-teal-600 hover:to-emerald-600',
              'disabled:from-gray-300 disabled:to-gray-300',
              'transition-all duration-200'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit & Get Coupon
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className={cn(
              'flex-[2] h-14 text-base font-semibold rounded-xl',
              'bg-gradient-to-r from-teal-500 to-emerald-500',
              'hover:from-teal-600 hover:to-emerald-600',
              'disabled:from-gray-300 disabled:to-gray-300',
              'transition-all duration-200'
            )}
          >
            Next
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default NavigationButtons;

