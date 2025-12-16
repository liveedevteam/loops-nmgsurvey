/**
 * LIFF Provider Component
 * 
 * Handles LINE LIFF SDK initialization and provides
 * user profile data to the application via React Context.
 * 
 * Also checks friendship status to ensure user has added the OA.
 * In development mode, provides mock profile data if LIFF initialization fails,
 * but friendship checking uses real API when possible.
 */

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
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
  /** Trigger LINE login */
  login: () => void;
  /** Open the add friend URL to add the Official Account */
  addFriend: () => void;
  /** Re-check friendship status (after user adds OA) */
  recheckFriendship: () => Promise<boolean>;
  /** Skip friendship check and proceed (use with caution) */
  skipFriendshipCheck: () => void;
  /** Whether running in mock mode (profile only) */
  isMockMode: boolean;
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

  /**
   * Check if LIFF SDK is ready for API calls
   */
  const isLiffAvailable = useCallback((): boolean => {
    try {
      // Check if liff object exists and is initialized
      return typeof liff !== 'undefined' && liff.isLoggedIn();
    } catch {
      return false;
    }
  }, []);

  /**
   * Check friendship status with Official Account using real API
   */
  const checkFriendship = useCallback(async (): Promise<boolean> => {
    console.log('🔍 Starting friendship check...');
    
    // Check if LIFF is available
    if (!isLiffAvailable()) {
      console.log('⚠️ LIFF not available for friendship check');
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
      console.log('ℹ️ This error usually means:');
      console.log('   - The LIFF app is not linked to a LINE Official Account');
      console.log('   - Or the LINE Developers Console settings are incorrect');
      setIsFriend(false);
      return false;
    } finally {
      setIsCheckingFriendship(false);
    }
  }, [isLiffAvailable, isFriend]);

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
    const initLiff = async () => {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      const isDev = process.env.NODE_ENV === 'development';

      console.log('🚀 Initializing LIFF...');
      console.log('   LIFF ID:', liffId ? `${liffId.substring(0, 10)}...` : 'NOT SET');
      console.log('   Environment:', isDev ? 'development' : 'production');

      if (!liffId) {
        if (isDev) {
          // Use mock mode in development - but start with isFriend = false
          // so we can test the AddFriendPrompt flow
          console.log('🔧 LIFF mock mode: No LIFF ID configured');
          setIsMockMode(true);
          setIsInitialized(true);
          setIsLoggedIn(true);
          setIsFriend(false); // Start as not friend to test the flow
          setProfile(MOCK_PROFILE);
          setIsLoading(false);
          return;
        }
        setError('LIFF ID is not configured');
        setIsLoading(false);
        return;
      }

      try {
        // Initialize LIFF SDK
        await liff.init({ liffId });
        console.log('✅ LIFF initialized successfully');
        setIsInitialized(true);

        // Check login status
        const loggedIn = liff.isLoggedIn();
        console.log('👤 Login status:', loggedIn ? 'Logged in' : 'Not logged in');
        
        if (loggedIn) {
          setIsLoggedIn(true);

          // Fetch user profile
          try {
            const userProfile = await liff.getProfile();
            console.log('👤 Profile loaded:', userProfile.displayName);
            setProfile({
              userId: userProfile.userId,
              displayName: userProfile.displayName,
              pictureUrl: userProfile.pictureUrl,
              statusMessage: userProfile.statusMessage,
            });
          } catch (profileError) {
            console.error('Failed to get profile:', profileError);
            setError('Failed to get user profile');
          }

          // Check friendship status with OA using real API
          console.log('🔍 Checking initial friendship status...');
          try {
            const friendship = await liff.getFriendship();
            console.log('👥 Initial friendship status:', friendship.friendFlag ? 'Friend' : 'Not friend');
            setIsFriend(friendship.friendFlag);
          } catch (friendshipError) {
            console.error('Failed to check friendship:', friendshipError);
            // If friendship check fails, assume not friend
            setIsFriend(false);
          }
        } else {
          // Not logged in - redirect to LINE login
          console.log('🔐 User not logged in, checking if in LINE client...');
          if (!liff.isInClient()) {
            console.log('🔐 External browser detected, redirecting to LINE login...');
            liff.login();
          }
        }
      } catch (initError) {
        console.error('LIFF init error:', initError);
        
        // In development, fallback to mock mode for profile only
        if (isDev) {
          console.log('🔧 LIFF mock mode: Using mock data for development');
          setIsMockMode(true);
          setIsInitialized(true);
          setIsLoggedIn(true);
          setIsFriend(false); // Start as not friend to test the flow
          setProfile(MOCK_PROFILE);
          setError(null);
        } else {
          setError('Failed to initialize LINE LIFF');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initLiff();
  }, []);

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
   * Trigger LINE login
   */
  const login = useCallback(() => {
    if (isMockMode) {
      console.log('🔧 Mock mode: Already logged in');
      return;
    }
    
    if (isInitialized && !isLoggedIn) {
      liff.login();
    }
  }, [isInitialized, isLoggedIn, isMockMode]);

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
      // In mock mode without OA ID, just simulate
      if (isMockMode) {
        console.log('🔧 Mock mode: Simulating add friend (no OA ID configured)');
        setIsFriend(true);
      }
      return;
    }

    // Always try to open real add friend URL
    const addFriendUrl = `https://line.me/R/ti/p/${oaBasicId}`;
    console.log('🔗 Add friend URL:', addFriendUrl);
    
    try {
      if (liff.isInClient()) {
        // In LINE app - use LIFF openWindow
        console.log('📱 Opening in LINE client...');
        liff.openWindow({
          url: addFriendUrl,
          external: false,
        });
      } else {
        // External browser - open in new tab
        console.log('🌐 Opening in external browser...');
        window.open(addFriendUrl, '_blank');
      }
    } catch {
      // Fallback to window.open
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
    login,
    addFriend,
    recheckFriendship,
    skipFriendshipCheck,
    isMockMode,
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
