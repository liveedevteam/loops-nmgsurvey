/**
 * Survey Container Component
 * 
 * Main orchestrator component that manages the entire survey flow.
 * Handles step navigation, form state, validation, and submission.
 * 
 * Flow:
 * 1. User completes survey
 * 2. User submits → data saved to DB
 * 3. Check if user has added LINE OA
 *    - If YES → Show coupon
 *    - If NO → Show AddFriendPrompt → After adding → Show coupon
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useLiff } from '@/components/LiffProvider';
import { trpc } from '@/lib/trpc';
import {
  SurveyFormData,
  INITIAL_FORM_DATA,
  AgeRange,
  Gender,
  Channel,
  PriceRange,
} from '@/types/survey';

import { StepIndicator } from './StepIndicator';
import { NavigationButtons } from './NavigationButtons';
import { StepAge } from './StepAge';
import { StepGender } from './StepGender';
import { StepChannels } from './StepChannels';
import { StepPrice } from './StepPrice';
import { StepBrand } from './StepBrand';
import { SubmitSuccess } from './SubmitSuccess';
import { AddFriendPromptPostSubmit } from './AddFriendPromptPostSubmit';

const TOTAL_STEPS = 5;

export function SurveyContainer() {
  // LIFF context
  const {
    isLoading: liffLoading,
    error: liffError,
    profile,
    isLoggedIn,
    isFriend,
    recheckFriendship,
    isCheckingFriendship,
  } = useLiff();

  // Survey state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SurveyFormData>(INITIAL_FORM_DATA);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  // Check if user already submitted (no friendship requirement)
  const statusQuery = trpc.survey.getStatus.useQuery(
    { lineUserId: profile?.userId ?? '' },
    {
      enabled: !!profile?.userId,
      retry: false,
    }
  );

  // Submit mutation
  const submitMutation = trpc.survey.submit.useMutation({
    onSuccess: (data) => {
      setCouponCode(data.couponCode);
      setIsSubmitted(true);
      toast.success('Survey submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit survey. Please try again.');
    },
  });

  // Check for existing submission
  useEffect(() => {
    if (statusQuery.data?.alreadySubmitted && statusQuery.data?.couponCode) {
      setCouponCode(statusQuery.data.couponCode);
      setIsSubmitted(true);
    }
  }, [statusQuery.data]);

  // Form update handlers
  const updateAge = useCallback((value: AgeRange) => {
    setFormData((prev) => ({ ...prev, ageRange: value }));
  }, []);

  const updateGender = useCallback((value: Gender) => {
    setFormData((prev) => ({ ...prev, gender: value }));
  }, []);

  const updateChannels = useCallback((value: Channel[]) => {
    setFormData((prev) => ({ ...prev, channels: value }));
  }, []);

  const updateChannelOtherText = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, channelOtherText: value }));
  }, []);

  const updatePriceRange = useCallback((value: PriceRange) => {
    setFormData((prev) => ({ ...prev, priceRange: value }));
  }, []);

  const updateCurrentBrand = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, currentBrand: value }));
  }, []);

  // Validation for each step
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1:
        return formData.ageRange !== null;
      case 2:
        return formData.gender !== null;
      case 3:
        return formData.channels.length > 0;
      case 4:
        return formData.priceRange !== null;
      case 5:
        return formData.currentBrand.trim().length > 0;
      default:
        return false;
    }
  }, [currentStep, formData]);

  // Navigation handlers
  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS && canProceed()) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, canProceed]);

  const handleSubmit = useCallback(() => {
    if (!profile?.userId) {
      toast.error('Unable to identify user. Please try again.');
      return;
    }

    if (!canProceed()) {
      toast.error('Please complete all required fields.');
      return;
    }

    submitMutation.mutate({
      lineUserId: profile.userId,
      ageRange: formData.ageRange!,
      gender: formData.gender!,
      channels: formData.channels,
      channelOtherText: formData.channelOtherText || null,
      priceRange: formData.priceRange!,
      currentBrand: formData.currentBrand,
    });
  }, [profile?.userId, formData, canProceed, submitMutation]);

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepAge value={formData.ageRange} onChange={updateAge} />;
      case 2:
        return <StepGender value={formData.gender} onChange={updateGender} />;
      case 3:
        return (
          <StepChannels
            value={formData.channels}
            otherText={formData.channelOtherText}
            onChange={updateChannels}
            onOtherTextChange={updateChannelOtherText}
          />
        );
      case 4:
        return <StepPrice value={formData.priceRange} onChange={updatePriceRange} />;
      case 5:
        return <StepBrand value={formData.currentBrand} onChange={updateCurrentBrand} />;
      default:
        return null;
    }
  };

  // Loading state
  if (liffLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading survey...</p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (liffError || statusQuery.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-50 via-white to-orange-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 mb-6">
            {liffError || statusQuery.error?.message || 'Unable to load the survey. Please try again later.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // Not logged in state
  if (!isLoggedIn || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Connecting to LINE...</p>
        </motion.div>
      </div>
    );
  }

  // Status query loading state
  if (statusQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Checking your status...</p>
        </motion.div>
      </div>
    );
  }

  // Post-submission state: Survey submitted but need to check friendship
  if (isSubmitted && couponCode) {
    // If user has added OA as friend → Show coupon
    if (isFriend) {
      return <SubmitSuccess couponCode={couponCode} />;
    }
    
    // If user has NOT added OA → Show prompt to add OA first
    return (
      <AddFriendPromptPostSubmit
        couponCode={couponCode}
        onFriendshipConfirmed={() => {
          // Re-check friendship and if confirmed, the component will re-render
          recheckFriendship();
        }}
        isCheckingFriendship={isCheckingFriendship}
      />
    );
  }

  // Main survey UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 safe-area-pt">
        <div className="max-w-md mx-auto">
          <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>
      </div>

      {/* Content */}
      <main className="px-4 py-6 pb-32">
        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep}>
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Navigation */}
      <NavigationButtons
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        canProceed={canProceed()}
        isSubmitting={submitMutation.isPending}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default SurveyContainer;
