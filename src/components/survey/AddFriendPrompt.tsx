/**
 * Add Friend Prompt Component
 * 
 * Displayed when the user hasn't added the Official Account as a friend.
 * Users must add the OA to receive the coupon via LINE message.
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, MessageCircle, Gift, RefreshCw, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLiff } from '@/components/LiffProvider';
import { toast } from 'sonner';

export function AddFriendPrompt() {
  const { addFriend, recheckFriendship, skipFriendshipCheck, isCheckingFriendship, isMockMode } = useLiff();
  const [retryCount, setRetryCount] = useState(0);
  const [showSkipOption, setShowSkipOption] = useState(false);

  const handleAddFriend = () => {
    addFriend();
  };

  const handleRefresh = async () => {
    toast.loading('Checking friendship status...', { id: 'friendship-check' });
    
    try {
      await recheckFriendship();
      
      // If still on this page after recheck, it means user is still not friend
      // This is handled by React re-render, but we can show feedback
      setRetryCount((prev) => prev + 1);
      
      // After 2 retries, show skip option
      if (retryCount >= 1) {
        setShowSkipOption(true);
        toast.error('Still not detected as friend. You can try again or proceed anyway.', {
          id: 'friendship-check',
          duration: 5000,
        });
      } else {
        toast.info('Checking again... Please make sure you\'ve added our Official Account.', {
          id: 'friendship-check',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Friendship check error:', error);
      toast.error('Failed to check friendship status. Please try again.', {
        id: 'friendship-check',
      });
    }
  };

  const handleSkip = () => {
    // Force proceed - this will skip the friendship check
    // The user claims they've added the OA, so we trust them
    toast.success('Proceeding to survey...', { id: 'skip-check' });
    skipFriendshipCheck();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-sm w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-200"
        >
          <UserPlus className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-3"
        >
          Add Us as Friend First!
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 mb-8"
        >
          Please add our Official Account as a friend to receive your exclusive discount coupon after completing the survey.
        </motion.p>

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
                  Be the first to know about promotions and new products
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Friend Button */}
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

          {/* Refresh Button */}
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
                I&apos;ve Added, Continue
              </>
            )}
          </Button>

          {/* Skip option after multiple retries */}
          {showSkipOption && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-4 border-t border-gray-100"
            >
              <div className="flex items-start gap-2 mb-3 p-3 bg-amber-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 text-left">
                  If you&apos;ve already added us but it&apos;s not being detected, 
                  you can proceed anyway. Note that you might not receive the coupon via LINE.
                </p>
              </div>
              <Button
                onClick={handleSkip}
                variant="ghost"
                className="w-full h-10 text-sm text-gray-500"
              >
                Proceed without verification →
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
          After adding us as a friend, tap &quot;I&apos;ve Added, Continue&quot; to proceed with the survey.
        </motion.p>

        {/* Mock mode indicator */}
        {isMockMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 p-2 bg-yellow-50 rounded-lg"
          >
            <p className="text-xs text-yellow-600">
              🔧 Development mode: Click &quot;Add Friend&quot; to simulate adding OA
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default AddFriendPrompt;
