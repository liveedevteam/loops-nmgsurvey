/**
 * Add Friend Prompt (Post-Submit) Component
 * 
 * Displayed AFTER survey submission when the user hasn't added the Official Account.
 * Users must add the OA to receive their coupon via LINE message.
 * 
 * Flow:
 * 1. Survey submitted → Data saved
 * 2. If not friend → Show this prompt
 * 3. User adds OA
 * 4. User clicks "I've Added" → Check friendship
 * 5. If friend confirmed → Show coupon
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserPlus, 
  MessageCircle, 
  Gift, 
  RefreshCw, 
  Loader2, 
  CheckCircle2,
  Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiff } from '@/components/LiffProvider';
import { toast } from 'sonner';

interface AddFriendPromptPostSubmitProps {
  couponCode: string;
  onFriendshipConfirmed: () => void;
  isCheckingFriendship: boolean;
}

export function AddFriendPromptPostSubmit({
  couponCode,
  onFriendshipConfirmed,
  isCheckingFriendship,
}: AddFriendPromptPostSubmitProps) {
  const { addFriend, recheckFriendship, skipFriendshipCheck, isMockMode } = useLiff();
  const [retryCount, setRetryCount] = useState(0);

  const handleAddFriend = () => {
    addFriend();
  };

  const handleRefresh = async () => {
    const toastId = 'friendship-check';
    toast.loading('Checking if you\'ve added us...', { id: toastId });
    
    try {
      const isFriendNow = await recheckFriendship();
      
      if (isFriendNow) {
        toast.success('Great! Loading your coupon...', {
          id: toastId,
          icon: <CheckCircle2 className="w-4 h-4" />,
          duration: 2000,
        });
        onFriendshipConfirmed();
      } else {
        setRetryCount((prev) => prev + 1);
        
        if (retryCount >= 1) {
          toast.error(
            'Still not detected. You can proceed anyway, but coupon delivery might be affected.',
            {
              id: toastId,
              duration: 5000,
            }
          );
        } else {
          toast.info(
            'Not detected yet. Please make sure you\'ve added our Official Account.',
            {
              id: toastId,
              duration: 4000,
            }
          );
        }
      }
    } catch {
      setRetryCount((prev) => prev + 1);
      toast.error('Failed to check. Please try again.', {
        id: toastId,
      });
    }
  };

  const handleSkip = () => {
    toast.success('Loading your coupon...', { id: 'skip-check' });
    skipFriendshipCheck();
    onFriendshipConfirmed();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-sm w-full text-center"
      >
        {/* Success Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Survey Completed!
          </div>
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-200"
        >
          <Gift className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-3"
        >
          One Last Step!
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 mb-6"
        >
          Add our Official Account as a friend to receive your exclusive coupon via LINE message.
        </motion.p>

        {/* Coupon Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700">Your Coupon is Ready!</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="bg-white rounded-lg py-2 px-4 border border-amber-200">
            <p className="text-xs text-gray-500 mb-1">Coupon Code</p>
            <p className="font-mono font-bold text-lg text-gray-800 blur-sm select-none">
              {couponCode}
            </p>
          </div>
          <p className="text-xs text-amber-600 mt-2">Add us to reveal your coupon!</p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100"
        >
          <h3 className="font-semibold text-gray-800 mb-4 text-left">
            Why add us?
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 text-teal-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700 text-sm">Get Your Coupon</p>
                <p className="text-xs text-gray-500">
                  Receive your discount code directly in LINE chat
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-gray-700 text-sm">Exclusive Updates</p>
                <p className="text-xs text-gray-500">
                  Be the first to know about promotions
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <Button
            onClick={handleAddFriend}
            className="w-full h-14 text-base font-semibold rounded-xl bg-[#06C755] hover:bg-[#05b34d] text-white"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add Friend on LINE
          </Button>

          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isCheckingFriendship}
            className="w-full h-12 text-base rounded-xl"
          >
            {isCheckingFriendship ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                I&apos;ve Added, Show My Coupon
              </>
            )}
          </Button>

          {/* Skip option after retries */}
          {retryCount >= 2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-2"
            >
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full h-10 text-sm text-gray-500"
              >
                Show coupon anyway →
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-gray-400 mt-6"
        >
          After adding us, tap &quot;I&apos;ve Added, Show My Coupon&quot; to reveal your discount.
        </motion.p>

        {/* Debug info in dev mode */}
        {isMockMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 p-2 bg-yellow-50 rounded-lg"
          >
            <p className="text-xs text-yellow-600">
              🔧 Dev mode: Click &quot;I&apos;ve Added&quot; or skip after 2 tries
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default AddFriendPromptPostSubmit;

