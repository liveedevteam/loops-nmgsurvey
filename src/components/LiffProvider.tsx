/**
 * LIFF Provider Component
 * 
 * Handles LINE LIFF SDK initialization and provides
 * user profile data to the application via React Context.
 * 
 * Also checks friendship status to ensure user has added the OA.
 * In development mode, provides mock data if LIFF initialization fails.
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
  recheckFriendship: () => Promise<void>;
  /** Whether running in mock mode */
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
   * Check friendship status with Official Account
   */
  const checkFriendship = useCallback(async (): Promise<boolean> => {
    if (isMockMode) {
      console.log('🔧 Mock mode: Assuming user is friend');
      return true;
    }

    try {
      setIsCheckingFriendship(true);
      const friendship = await liff.getFriendship();
      console.log('👥 Friendship status:', friendship.friendFlag ? 'Friend' : 'Not friend');
      setIsFriend(friendship.friendFlag);
      return friendship.friendFlag;
    } catch (friendshipError) {
      console.error('Failed to check friendship:', friendshipError);
      // If we can't check, assume not friend to be safe
      setIsFriend(false);
      return false;
    } finally {
      setIsCheckingFriendship(false);
    }
  }, [isMockMode]);

  /**
   * Re-check friendship status (called after user adds OA)
   */
  const recheckFriendship = useCallback(async () => {
    await checkFriendship();
  }, [checkFriendship]);

  /**
   * Initialize LIFF SDK and fetch user profile
   */
  useEffect(() => {
    const initLiff = async () => {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
      const isDev = process.env.NODE_ENV === 'development';

      if (!liffId) {
        if (isDev) {
          // Use mock mode in development
          console.log('🔧 LIFF mock mode: No LIFF ID configured');
          setIsMockMode(true);
          setIsInitialized(true);
          setIsLoggedIn(true);
          setIsFriend(true); // Assume friend in mock mode
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
        setIsInitialized(true);

        // Check login status
        if (liff.isLoggedIn()) {
          setIsLoggedIn(true);

          // Fetch user profile
          try {
            const userProfile = await liff.getProfile();
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

          // Check friendship status with OA
          try {
            const friendship = await liff.getFriendship();
            console.log('👥 Friendship status:', friendship.friendFlag ? 'Friend' : 'Not friend');
            setIsFriend(friendship.friendFlag);
          } catch (friendshipError) {
            console.error('Failed to check friendship:', friendshipError);
            // If friendship check fails, assume not friend
            setIsFriend(false);
          }
        } else {
          // Not logged in - redirect to LINE login
          if (!liff.isInClient()) {
            // External browser - need to login
            liff.login();
          }
        }
      } catch (initError) {
        console.error('LIFF init error:', initError);
        
        // In development, fallback to mock mode
        if (isDev) {
          console.log('🔧 LIFF mock mode: Using mock data for development');
          setIsMockMode(true);
          setIsInitialized(true);
          setIsLoggedIn(true);
          setIsFriend(true); // Assume friend in mock mode
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
    
    if (liff.isInClient()) {
      liff.closeWindow();
    } else {
      // Not in LINE app, just show a message
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
    if (isMockMode) {
      console.log('🔧 Mock mode: Would open add friend page');
      setIsFriend(true); // Simulate adding friend in mock mode
      return;
    }

    // Get the OA Basic ID from environment or use a fallback
    // The add friend URL format: https://line.me/R/ti/p/@{basic_id}
    // Or using LIFF: can open the OA chat directly
    
    // If in LIFF, we can use openWindow to open the add friend page
    if (liff.isInClient()) {
      // Open the LINE OA profile page where user can add as friend
      // This requires the OA Basic ID to be configured
      const oaBasicId = process.env.NEXT_PUBLIC_LINE_OA_BASIC_ID;
      if (oaBasicId) {
        liff.openWindow({
          url: `https://line.me/R/ti/p/${oaBasicId}`,
          external: false,
        });
      } else {
        console.warn('LINE OA Basic ID not configured');
      }
    }
  }, [isMockMode]);

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
