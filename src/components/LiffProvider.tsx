/**
 * LIFF Provider Component
 *
 * Handles LINE LIFF SDK initialization and provides
 * user profile data to the application via React Context.
 *
 * Fixes "infinite logging / init loop" by:
 * 1) Guarding init with a ref (Next.js dev StrictMode mounts twice)
 * 2) Preventing repeated login redirects with a ref
 * 3) Adding cleanup cancellation flag to avoid setState after unmount
 * 4) Avoiding unbounded debugInfo concatenation
 */

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from 'react';
import liff from '@line/liff';

// ============================================
// Types
// ============================================

interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

interface LiffContextValue {
  /** Whether LIFF SDK has been initialized */
  isInitialized: boolean;
  /** Whether LIFF is currently loading */
  isLoading: boolean;
  /** Error message if initialization failed */
  error: string | null;
  /** User's LINE profile (available after login) */
  profile: LiffProfile | null;
  /** Whether user is logged in */
  isLoggedIn: boolean;
  /** Whether user has added the Official Account as friend */
  isFriend: boolean;
  /** Whether friendship status is being checked */
  isCheckingFriendship: boolean;
  /** Close the LIFF window */
  closeLiff: () => void;
  /** Open the add friend URL to add the Official Account */
  addFriend: () => void;
  /** Re-check friendship status (after user adds OA) */
  recheckFriendship: () => Promise<boolean>;
  /** Skip friendship check and proceed (use with caution) */
  skipFriendshipCheck: () => void;
  /** Whether running in mock mode (profile only) */
  isMockMode: boolean;
  /** Debug info for troubleshooting */
  debugInfo: string;
}

// ============================================
// Mock Data for Development
// ============================================

const MOCK_PROFILE: LiffProfile = {
  userId: 'U1234567890abcdef1234567890abcdef',
  displayName: 'Test User',
  pictureUrl: undefined,
  statusMessage: 'Testing the survey',
};

// ============================================
// Context
// ============================================

const LiffContext = createContext<LiffContextValue | null>(null);

// ============================================
// Provider Component
// ============================================

interface LiffProviderProps {
  children: ReactNode;
}

export function LiffProvider({ children }: LiffProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LiffProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [isCheckingFriendship, setIsCheckingFriendship] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('initializing...');

  // --- Guards to avoid infinite init / redirect loops (esp. StrictMode in dev)
  const didInitRef = useRef(false);
  const loginAttemptedRef = useRef(false);

  /**
   * Update debug info safely (overwrite instead of unbounded concatenation)
   */
  const setDebugStep = useCallback((msg: string) => {
    setDebugInfo(msg);
  }, []);

  /**
   * Check if LIFF SDK object is present (not the same as logged in)
   */
  const isLiffObjectAvailable = useCallback((): boolean => {
    try {
      return typeof liff !== 'undefined';
    } catch {
      return false;
    }
  }, []);

  /**
   * Check friendship status with Official Account using real API
   */
  const checkFriendship = useCallback(async (): Promise<boolean> => {
    console.log('🔍 Starting friendship check...');

    // Must be initialized and logged in to call getFriendship safely
    if (!isInitialized || !isLoggedIn || !isLiffObjectAvailable()) {
      console.log('⚠️ LIFF not ready for friendship check');
      return isFriend;
    }

    try {
      setIsCheckingFriendship(true);
      console.log('📡 Calling liff.getFriendship()...');

      const friendship = await liff.getFriendship();

      console.log('👥 Friendship API response:', {
        friendFlag: friendship.friendFlag,
      });

      setIsFriend(friendship.friendFlag);

      if (friendship.friendFlag) {
        console.log('✅ User IS a friend of the Official Account');
      } else {
        console.log('❌ User is NOT a friend of the Official Account');
        console.log('ℹ️ Make sure:');
        console.log('   1. The LIFF app is linked to a LINE Official Account');
        console.log('   2. The user has added THAT specific Official Account');
        console.log('   3. The Messaging API channel is properly configured');
      }

      return friendship.friendFlag;
    } catch (friendshipError) {
      console.error('❌ Failed to check friendship:', friendshipError);

      const errorMessage =
        friendshipError instanceof Error
          ? friendshipError.message
          : String(friendshipError);

      if (
        errorMessage.includes('no login bot linked') ||
        errorMessage.includes('There is no login bot')
      ) {
        console.log('⚠️ LIFF app is NOT linked to a LINE Official Account!');
        console.log(
          '📋 To fix: Go to LINE Developers Console → LIFF → Link to Official Account'
        );
        console.log('⚠️ Cannot verify friendship - allowing user to proceed');
        setIsFriend(true);
        return true;
      }

      console.log('ℹ️ This error usually means:');
      console.log('   - The LIFF app is not linked to a LINE Official Account');
      console.log('   - Or the LINE Developers Console settings are incorrect');
      setIsFriend(false);
      return false;
    } finally {
      setIsCheckingFriendship(false);
    }
  }, [isInitialized, isLoggedIn, isLiffObjectAvailable, isFriend]);

  /**
   * Re-check friendship status (called after user adds OA)
   */
  const recheckFriendship = useCallback(async (): Promise<boolean> => {
    return await checkFriendship();
  }, [checkFriendship]);

  /**
   * Initialize LIFF SDK and fetch user profile
   */
  useEffect(() => {
    // Prevent double init in Next.js dev (React StrictMode)
    if (didInitRef.current) return;
    didInitRef.current = true;

    let cancelled = false;

    const initLiff = async () => {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      const isDev = process.env.NODE_ENV === 'development';

      console.log('🚀 Initializing LIFF...');
      console.log(
        '   LIFF ID:',
        liffId ? `${liffId.substring(0, 10)}...` : 'NOT SET'
      );
      console.log('   Environment:', isDev ? 'development' : 'production');

      setDebugStep(
        `step1: liffId=${liffId ? 'set' : 'NOT_SET'}, env=${
          isDev ? 'dev' : 'prod'
        }`
      );

      if (!liffId) {
        if (isDev) {
          console.log('🔧 LIFF mock mode: No LIFF ID configured');
          if (cancelled) return;
          setIsMockMode(true);
          setIsInitialized(true);
          setIsLoggedIn(true);
          setIsFriend(false); // Start as not friend to test the flow
          setProfile(MOCK_PROFILE);
          setIsLoading(false);
          return;
        }

        if (cancelled) return;
        setError('LIFF ID is not configured');
        setIsLoading(false);
        return;
      }

      try {
        console.log('📞 Starting LIFF init...');
        setDebugStep('step2: calling liff.init()...');
        
        // Add timeout to prevent hanging (5 seconds)
        const initPromise = liff.init({ liffId });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => {
            console.error('⏱️ LIFF init timeout!');
            reject(new Error('LIFF init timeout after 5s'));
          }, 5000)
        );
        
        await Promise.race([initPromise, timeoutPromise]);
        console.log('✅ LIFF init completed successfully');

        // If unmounted during init
        if (cancelled) return;

        console.log('✅ LIFF init done (ready)');
        setDebugStep('step3: liff.init resolved');
        setIsInitialized(true);

        const loggedIn = liff.isLoggedIn();
        const inClient = liff.isInClient();
        console.log('👤 Login status:', loggedIn ? 'Logged in' : 'Not logged in');
        console.log('📱 Environment:', inClient ? 'LIFF browser' : 'External browser');
        setDebugStep(`step4: loggedIn=${loggedIn}, inClient=${inClient}`);

        if (!loggedIn) {
          // Redirect to login (external browser only) — prevent repeated redirects
          if (!inClient && !loginAttemptedRef.current) {
            loginAttemptedRef.current = true;
            console.log('🔐 User not logged in, redirecting to LINE login...');
            setDebugStep('step4-REDIRECT: redirecting to login...');
            liff.login({ redirectUri: window.location.href });
          } else {
            console.log(
              '🔐 Not logged in, but skipping redirect (inClient or already attempted)'
            );
          }

          if (cancelled) return;
          setIsLoading(false);
          return;
        }

        // Logged in
        if (cancelled) return;
        setIsLoggedIn(true);

        // Fetch profile
        try {
          setDebugStep('step5: calling getProfile()...');
          const userProfile = await liff.getProfile();
          if (cancelled) return;

          console.log('👤 Profile loaded:', userProfile.displayName);
          setDebugStep(`step6: profile OK - ${userProfile.displayName}`);
          setProfile({
            userId: userProfile.userId,
            displayName: userProfile.displayName,
            pictureUrl: userProfile.pictureUrl,
            statusMessage: userProfile.statusMessage,
          });
        } catch (profileError) {
          console.error('Failed to get profile:', profileError);
          if (cancelled) return;
          setDebugStep(`step5-ERR: profile failed - ${String(profileError)}`);
          setError('Failed to get user profile');
        }

        // Initial friendship check
        console.log('🔍 Checking initial friendship status...');
        try {
          const friendship = await liff.getFriendship();
          if (cancelled) return;

          console.log(
            '👥 Initial friendship status:',
            friendship.friendFlag ? 'Friend' : 'Not friend'
          );
          setIsFriend(friendship.friendFlag);
        } catch (friendshipError) {
          console.error('Failed to check friendship:', friendshipError);

          const errorMessage =
            friendshipError instanceof Error
              ? friendshipError.message
              : String(friendshipError);

          if (
            errorMessage.includes('no login bot linked') ||
            errorMessage.includes('There is no login bot')
          ) {
            console.log('⚠️ LIFF app is NOT linked to a LINE Official Account!');
            console.log(
              '📋 To fix: Go to LINE Developers Console → LIFF → Link to Official Account'
            );
            console.log('⚠️ Skipping friendship check - allowing user to proceed');
            if (cancelled) return;
            setIsFriend(true);
          } else {
            if (cancelled) return;
            setIsFriend(false);
          }
        }
      } catch (initError) {
        console.error('LIFF init error:', initError);

        if (cancelled) return;

        const errorMsg = String(initError);
        setDebugStep(`step2-ERR: liff.init() failed - ${errorMsg}`);

        if (errorMsg.includes('timeout')) {
          console.log('⚠️ LIFF initialization timed out.');
          console.log('📋 Check that the LIFF endpoint URL in LINE Developers Console matches your current URL.');
          setError(
            'LINE initialization timed out. Please check that the LIFF endpoint URL is correct, then reload.'
          );
        } else {
          setError(`Failed to initialize LINE: ${errorMsg}`);
        }
      } finally {
        if (cancelled) return;
        setDebugInfo((prev) => (typeof prev === 'string' ? `${prev} | DONE` : 'DONE'));
        setIsLoading(false);
      }
    };

    initLiff();

    return () => {
      cancelled = true;
    };
  }, [setDebugStep]);

  /**
   * Close LIFF window
   */
  const closeLiff = useCallback(() => {
    if (isMockMode) {
      console.log('🔧 Mock mode: Would close LIFF window');
      alert('Survey completed! In LINE, this window would close automatically.');
      return;
    }

    try {
      if (liff.isInClient()) {
        liff.closeWindow();
      } else {
        window.close();
      }
    } catch {
      window.close();
    }
  }, [isMockMode]);

  /**
   * Open the Official Account add friend page
   * Uses LINE's add friend URL scheme
   */
  const addFriend = useCallback(() => {
    const oaBasicId = process.env.NEXT_PUBLIC_LINE_OA_BASIC_ID;

    console.log('👥 Opening add friend page...');
    console.log('   OA Basic ID:', oaBasicId || 'NOT SET');

    if (!oaBasicId) {
      console.warn('⚠️ LINE OA Basic ID not configured');
      if (isMockMode) {
        console.log('🔧 Mock mode: Simulating add friend (no OA ID configured)');
        setIsFriend(true);
      }
      return;
    }

    const addFriendUrl = `https://line.me/R/ti/p/${oaBasicId}`;
    console.log('🔗 Add friend URL:', addFriendUrl);

    try {
      if (liff.isInClient()) {
        console.log('📱 Opening in LINE client...');
        liff.openWindow({
          url: addFriendUrl,
          external: false,
        });
      } else {
        console.log('🌐 Opening in external browser...');
        window.open(addFriendUrl, '_blank');
      }
    } catch {
      window.open(addFriendUrl, '_blank');
    }
  }, [isMockMode]);

  /**
   * Skip friendship check and proceed
   * Use when user has added OA but detection isn't working
   */
  const skipFriendshipCheck = useCallback(() => {
    console.log('⚠️ Skipping friendship check - user confirmed they added OA');
    setIsFriend(true);
  }, []);

  const value: LiffContextValue = {
    isInitialized,
    isLoading,
    error,
    profile,
    isLoggedIn,
    isFriend,
    isCheckingFriendship,
    closeLiff,
    addFriend,
    recheckFriendship,
    skipFriendshipCheck,
    isMockMode,
    debugInfo,
  };

  return <LiffContext.Provider value={value}>{children}</LiffContext.Provider>;
}

// ============================================
// Hook
// ============================================

/**
 * Hook to access LIFF context
 * Must be used within LiffProvider
 */
export function useLiff(): LiffContextValue {
  const context = useContext(LiffContext);

  if (!context) {
    throw new Error('useLiff must be used within a LiffProvider');
  }

  return context;
}

export default LiffProvider;