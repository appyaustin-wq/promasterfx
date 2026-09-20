import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User as FirebaseUser,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { SyncLogger } from '../lib/syncLogger';
import { identifySmartsuppUser } from '../services/smartsupp';
import { 
  UserProfile, 
  MarketAsset, 
  DemoOrder, 
  DemoPosition, 
  WatchlistItem, 
  ActivityLog, 
  OrderDirection, 
  OrderType,
  AssetCategory,
  AppNotification
} from '../types';
import { INITIAL_MARKETS, generatePriceFluctuation } from '../services/marketDataService';
import { processClientWithdrawalWithCode, processClientWithdrawalWithTwoCodes } from '../services/adminService';
import { 
  SIGNUP_BONUS_USD, 
  calculateSignupBonus, 
  formatCurrencyAmount 
} from '../services/currencyService';

interface AuthContextType {
  user: FirebaseUser | null;
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  markets: MarketAsset[];
  orders: DemoOrder[];
  positions: DemoPosition[];
  watchlist: string[];
  activities: ActivityLog[];
  isDemoAccount: boolean;
  authNotice: string | null;
  clearAuthNotice: () => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (
    email: string, 
    password: string, 
    fullName: string, 
    username: string,
    options?: { preferredCurrency?: string; country?: string; phoneNumber?: string; gender?: string }
  ) => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  quickGuestLogin: () => Promise<void>;
  resetDemoBalance: () => Promise<void>;
  depositDemoFunds: (amount: number, method: string) => Promise<void>;
  withdrawDemoFunds: (amount: number, method: string, withdrawalCode?: string) => Promise<void>;
  executeDemoOrder: (order: {
    symbol: string;
    assetName: string;
    category: AssetCategory;
    direction: OrderDirection;
    orderType: OrderType;
    quantity: number;
    leverage: number;
    duration?: string;
    stopLoss?: number;
    takeProfit?: number;
  }) => Promise<{ success: boolean; message: string }>;
  closeDemoPosition: (positionId: string) => Promise<{ success: boolean; message: string }>;
  toggleWatchlist: (marketId: string) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  adminUpdateMarket: (updatedMarket: MarketAsset) => Promise<void>;
  adminTopUpUser: (uid: string, amount: number) => Promise<void>;
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const DEFAULT_DEMO_BALANCE = 10.00;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [markets, setMarkets] = useState<MarketAsset[]>(INITIAL_MARKETS);
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [positions, setPositions] = useState<DemoPosition[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(['BTCUSD', 'EURUSD', 'ETHUSD', 'AAPL']);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Setup real-time listener for user's notifications when currentUser is set
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: AppNotification[] = [];
      snapshot.forEach(doc => {
        list.push(doc.data() as AppNotification);
      });
      SyncLogger.logSnapshotEvent('Notifications', list.length, currentUser.uid);
      // Sort newest first
      setNotifications(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (err) => {
      console.warn('Notifications real-time error:', err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Sync authenticated trader identity with Smartsupp Live Chat
  useEffect(() => {
    if (userProfile) {
      identifySmartsuppUser({
        uid: userProfile.uid,
        name: userProfile.fullName,
        email: userProfile.email,
        role: userProfile.role,
        demoBalance: userProfile.demoBalance
      });
    }
  }, [userProfile]);

  const markNotificationAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.warn('Error marking notification as read in Firestore:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!currentUser) return;
    const unreadNotifs = notifications.filter(n => !n.read);
    if (unreadNotifs.length === 0) return;

    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    try {
      const batch = writeBatch(db);
      for (const notif of unreadNotifs) {
        batch.update(doc(db, 'notifications', notif.id), { read: true });
      }
      await batch.commit();
    } catch (err) {
      console.warn('Error batch-marking notifications as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (err) {
      console.warn('Error deleting notification from Firestore:', err);
    }
  };

  const clearAllNotifications = async () => {
    if (!currentUser || notifications.length === 0) return;
    const toDelete = [...notifications];

    // Optimistic UI update
    setNotifications([]);

    try {
      const batch = writeBatch(db);
      for (const notif of toDelete) {
        batch.delete(doc(db, 'notifications', notif.id));
      }
      await batch.commit();
    } catch (err) {
      console.warn('Error batch-clearing all notifications:', err);
    }
  };

  const clearAuthNotice = () => setAuthNotice(null);

  // Real-time market price fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prevMarkets => 
        prevMarkets.map(m => {
          const newPrice = generatePriceFluctuation(m.price);
          const newSparkline = m.sparkline ? [...m.sparkline.slice(1), newPrice] : [newPrice];
          return {
            ...m,
            price: newPrice,
            sparkline: newSparkline
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update open position live PnL whenever market prices change
  useEffect(() => {
    if (positions.length === 0) return;

    setPositions(prevPositions => 
      prevPositions.map(pos => {
        if (pos.status !== 'open') return pos;
        const currentMarket = markets.find(m => m.symbol === pos.symbol || m.id === pos.symbol);
        const currentPrice = currentMarket ? currentMarket.price : pos.entryPrice;

        let pnl = 0;
        if (pos.direction === 'buy') {
          pnl = (currentPrice - pos.entryPrice) * pos.quantity * pos.leverage;
        } else {
          pnl = (pos.entryPrice - currentPrice) * pos.quantity * pos.leverage;
        }
        const pnlPercent = (pnl / pos.margin) * 100;

        return {
          ...pos,
          currentPrice,
          pnl: Math.round(pnl * 100) / 100,
          pnlPercent: Math.round(pnlPercent * 100) / 100
        };
      })
    );
  }, [markets]);

  // Helper to establish a local demo session if Firebase Auth Email/Password provider is disabled
  const createLocalSession = async (
    email: string, 
    fullName?: string, 
    username?: string, 
    options?: { preferredCurrency?: string; country?: string; phoneNumber?: string }
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const safeId = 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const targetCurrency = options?.preferredCurrency || 'USD ($) — US Dollar';
    const bonusInfo = calculateSignupBonus(targetCurrency);
    
    const mockUser = {
      uid: safeId,
      email: cleanEmail,
      displayName: fullName || cleanEmail.split('@')[0],
      emailVerified: true,
      isAnonymous: false,
      providerData: []
    } as unknown as FirebaseUser;

    let profile: UserProfile | null = null;
    try {
      const userRef = doc(db, 'users', safeId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        profile = snap.data() as UserProfile;
      } else {
        profile = {
          uid: safeId,
          email: cleanEmail,
          fullName: fullName || (cleanEmail.split('@')[0].toUpperCase()),
          username: username || cleanEmail.split('@')[0],
          preferredCurrency: targetCurrency,
          country: options?.country || 'United States',
          phoneNumber: options?.phoneNumber || '',
          role: cleanEmail === 'admin@promasterfx.com' ? 'admin' : 'user',
          demoBalance: bonusInfo.convertedAmount,
          demoEquity: bonusInfo.convertedAmount,
          demoProfitLoss: 0,
          signupBonusUSD: SIGNUP_BONUS_USD,
          signupBonusConverted: bonusInfo.convertedAmount,
          verified: cleanEmail === 'admin@promasterfx.com',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, profile);
      }
    } catch (err) {
      console.warn('Firestore local profile warning:', err);
      profile = {
        uid: safeId,
        email: cleanEmail,
        fullName: fullName || cleanEmail.split('@')[0],
        username: username || cleanEmail.split('@')[0],
        preferredCurrency: targetCurrency,
        country: options?.country || 'United States',
        phoneNumber: options?.phoneNumber || '',
        role: cleanEmail === 'admin@promasterfx.com' ? 'admin' : 'user',
        demoBalance: bonusInfo.convertedAmount,
        demoEquity: bonusInfo.convertedAmount,
        demoProfitLoss: 0,
        signupBonusUSD: SIGNUP_BONUS_USD,
        signupBonusConverted: bonusInfo.convertedAmount,
        verified: cleanEmail === 'admin@promasterfx.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    localStorage.setItem('promaster_local_session', JSON.stringify({
      email: cleanEmail,
      fullName: profile.fullName,
      username: profile.username
    }));

    setCurrentUser(mockUser);
    setUserProfile(profile);
    await loadUserData(safeId);
  };

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        SyncLogger.logAuthStateChange('SIGNED_IN', user.email, user.uid);
        localStorage.removeItem('promaster_local_session');
        setCurrentUser(user);
        await loadUserProfile(user);
        await loadUserData(user.uid);
        setLoading(false);
      } else {
        const savedLocal = localStorage.getItem('promaster_local_session');
        if (savedLocal) {
          try {
            const parsed = JSON.parse(savedLocal);
            SyncLogger.logAuthStateChange('LOCAL_GUEST_SESSION', parsed.email);
            await createLocalSession(parsed.email, parsed.fullName, parsed.username);
          } catch (e) {
            console.warn('Failed to parse saved session:', e);
            SyncLogger.logAuthStateChange('SIGNED_OUT');
            setCurrentUser(null);
            setUserProfile(null);
          }
        } else {
          SyncLogger.logAuthStateChange('SIGNED_OUT');
          setCurrentUser(null);
          setUserProfile(null);
          setOrders([]);
          setPositions([]);
          setActivities([]);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load or initialize user profile document in Firestore
  const loadUserProfile = async (user: FirebaseUser) => {
    return SyncLogger.profile(`Fetch User Profile`, async () => {
      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const profileData = docSnap.data() as UserProfile;
        setUserProfile(profileData);
        return profileData;
      } else {
        // Create new profile with standardized $10 USD signup bonus
        const isAdminAccount = user.email === 'admin@promasterfx.com';
        const defaultCurrency = 'USD ($) — US Dollar';
        const bonusInfo = calculateSignupBonus(defaultCurrency);
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || 'trader@promasterfx.com',
          fullName: user.displayName || (isAdminAccount ? 'Platform Administrator' : 'Demo Trader'),
          username: (user.email ? user.email.split('@')[0] : 'trader'),
          preferredCurrency: defaultCurrency,
          role: isAdminAccount ? 'admin' : 'user',
          demoBalance: bonusInfo.convertedAmount,
          demoEquity: bonusInfo.convertedAmount,
          demoProfitLoss: 0,
          signupBonusUSD: SIGNUP_BONUS_USD,
          signupBonusConverted: bonusInfo.convertedAmount,
          verified: isAdminAccount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    }, { path: `users/${user.uid}`, userId: user.uid, email: user.email || undefined });
  };

  // Load user data (orders, positions, watchlists, activities) from Firestore
  const loadUserData = async (uid: string) => {
    return SyncLogger.profile(`Fetch User Demo Data Assets`, async () => {
      // Load Orders
      const ordersRef = collection(db, 'orders');
      const qOrders = query(ordersRef, where('userId', '==', uid));
      const ordersSnap = await getDocs(qOrders);
      const userOrders: DemoOrder[] = [];
      ordersSnap.forEach(d => userOrders.push(d.data() as DemoOrder));
      setOrders(userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

      // Load Positions
      const positionsRef = collection(db, 'positions');
      const qPositions = query(positionsRef, where('userId', '==', uid));
      const positionsSnap = await getDocs(qPositions);
      const userPositions: DemoPosition[] = [];
      positionsSnap.forEach(d => userPositions.push(d.data() as DemoPosition));
      setPositions(userPositions.sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()));

      // Load Watchlists
      const watchlistRef = collection(db, 'watchlists');
      const qWatchlist = query(watchlistRef, where('userId', '==', uid));
      const watchlistSnap = await getDocs(qWatchlist);
      const userWatchlist: string[] = [];
      watchlistSnap.forEach(d => {
        const item = d.data() as WatchlistItem;
        if (item.marketId) userWatchlist.push(item.marketId);
      });
      if (userWatchlist.length > 0) setWatchlist(userWatchlist);

      // Load Activities
      const actRef = collection(db, 'activities');
      const qAct = query(actRef, where('userId', '==', uid));
      const actSnap = await getDocs(qAct);
      const userActs: ActivityLog[] = [];
      actSnap.forEach(d => userActs.push(d.data() as ActivityLog));
      setActivities(userActs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

      return {
        ordersCount: userOrders.length,
        positionsCount: userPositions.length,
        watchlistCount: userWatchlist.length,
        activitiesCount: userActs.length
      };
    }, { path: 'collections/{orders,positions,watchlists,activities}', userId: uid });
  };

  // Add activity log
  const logActivity = async (
    type: ActivityLog['type'], 
    title: string, 
    description: string, 
    amount?: number
  ) => {
    if (!currentUser) return;
    const newLog: ActivityLog = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      userId: currentUser.uid,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      amount
    };

    setActivities(prev => [newLog, ...prev]);

    try {
      await setDoc(doc(db, 'activities', newLog.id), newLog);
    } catch (err) {
      console.warn('Error saving activity:', err);
    }
  };

  // Login
  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      logActivity('login', 'User Login', 'Logged in to Promaster FX Demo Platform');
    } catch (err: any) {
      console.warn('Firebase login attempt:', err);
      if (
        err.code === 'auth/operation-not-allowed' || 
        err.message?.includes('operation-not-allowed') ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential'
      ) {
        await createLocalSession(email);
        setAuthNotice('Signed in with local demo session.');
        logActivity('login', 'Demo Login', 'Signed in with local demo session');
      } else {
        throw err;
      }
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      localStorage.removeItem('promaster_local_session');
      await loadUserProfile(cred.user);
      await loadUserData(cred.user.uid);
      logActivity('login', 'Google Login', 'Signed in with Google');
    } catch (err: any) {
      console.warn('Google Sign-In error:', err);
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        throw new Error('Google Authentication is disabled in your Firebase Console. Please enable Google provider under Authentication in Firebase Console.');
      }
      throw err;
    }
  };

  // Send Welcome Email helper (stores in Firestore 'emails' collection / inbox)
  const sendWelcomeEmail = async (email: string, fullName: string, userId: string, bonusFormatted?: string) => {
    try {
      const mailId = 'mail_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      const displayBonus = bonusFormatted || '$10.00 USD';
      const mailPayload = {
        id: mailId,
        recipientEmail: email,
        recipientName: fullName,
        userId: userId,
        subject: 'Welcome to Promaster FX — Your Trading Account is Ready!',
        body: `Dear ${fullName},\n\nWelcome to Promaster FX! Your professional trading account has been successfully created with an initial sign-up bonus of ${displayBonus} (standard $10.00 USD equivalent).\n\nYou can now trade Forex, Crypto, Stocks, and Indices with institutional market execution.\n\nBest regards,\nThe Promaster FX Team`,
        sender: 'Promaster FX Support <support@promasterfx.com>',
        timestamp: new Date().toISOString(),
        read: false
      };
      await setDoc(doc(db, 'emails', mailId), mailPayload);
    } catch (err) {
      console.warn('Failed to send welcome email:', err);
    }
  };

  // Register
  const register = async (
    email: string, 
    pass: string, 
    fullName: string, 
    username: string,
    options?: { preferredCurrency?: string; country?: string; phoneNumber?: string; gender?: string }
  ) => {
    const targetCurrency = options?.preferredCurrency || 'USD ($) — US Dollar';
    const bonusInfo = calculateSignupBonus(targetCurrency);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email,
        fullName,
        username,
        preferredCurrency: targetCurrency,
        country: options?.country || 'United States',
        phoneNumber: options?.phoneNumber || '',
        role: 'user',
        demoBalance: bonusInfo.convertedAmount,
        demoEquity: bonusInfo.convertedAmount,
        demoProfitLoss: 0,
        signupBonusUSD: SIGNUP_BONUS_USD,
        signupBonusConverted: bonusInfo.convertedAmount,
        verified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setUserProfile(newProfile);
      await sendWelcomeEmail(email, fullName, cred.user.uid, bonusInfo.formattedAmount);
      logActivity('login', 'Account Created', `Created trading account with ${bonusInfo.formattedAmount} initial sign-up bonus ($10 USD value)`);
    } catch (err: any) {
      console.warn('Firebase register error:', err);
      if (
        err.code === 'auth/operation-not-allowed' || 
        err.message?.includes('operation-not-allowed')
      ) {
        await createLocalSession(email, fullName, username, options);
        const activeUserId = 'user_' + email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
        await sendWelcomeEmail(email, fullName || 'Trader', activeUserId, bonusInfo.formattedAmount);
        setAuthNotice('Registered with active session.');
        logActivity('login', 'Account Created', `Created trading account with ${bonusInfo.formattedAmount} initial sign-up bonus ($10 USD value)`);
      } else {
        throw err;
      }
    }
  };

  // Quick Guest Demo Login (for zero-friction instant testing)
  const quickGuestLogin = async () => {
    const randomGuestId = Math.floor(1000 + Math.random() * 9000);
    const guestEmail = `demo.trader${randomGuestId}@promasterfx.com`;
    const guestPass = `PromasterFX#${randomGuestId}`;
    try {
      await register(guestEmail, guestPass, `Trader #${randomGuestId}`, `trader${randomGuestId}`);
    } catch {
      await createLocalSession(guestEmail, `Trader #${randomGuestId}`, `trader${randomGuestId}`);
    }
  };

  // Logout
  const logout = async () => {
    localStorage.removeItem('promaster_local_session');
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('SignOut error:', err);
    }
    setCurrentUser(null);
    setUserProfile(null);
    setOrders([]);
    setPositions([]);
    setActivities([]);
  };

  // Password reset
  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.message?.includes('operation-not-allowed')) {
        throw new Error('Email Password Reset is disabled in your Firebase console. (Operation not allowed)');
      }
      throw err;
    }
  };

  // Reset Demo Balance
  const resetDemoBalance = async () => {
    if (!currentUser || !userProfile) return;
    const bonusInfo = calculateSignupBonus(userProfile.preferredCurrency);
    const updatedProfile = {
      ...userProfile,
      demoBalance: bonusInfo.convertedAmount,
      demoEquity: bonusInfo.convertedAmount,
      demoProfitLoss: 0,
      updatedAt: new Date().toISOString()
    };
    setUserProfile(updatedProfile);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        demoBalance: bonusInfo.convertedAmount,
        demoEquity: bonusInfo.convertedAmount,
        demoProfitLoss: 0,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Error resetting demo balance:', err);
    }
    logActivity('deposit', 'Balance Reset', `Reset account balance to ${bonusInfo.formattedAmount} ($10.00 USD equivalent)`);
  };

  // Deposit Funds
  const depositDemoFunds = async (amount: number, method: string) => {
    if (!currentUser || !userProfile) return;
    const newBalance = userProfile.demoBalance + amount;
    const updatedProfile = {
      ...userProfile,
      demoBalance: newBalance,
      demoEquity: newBalance,
      updatedAt: new Date().toISOString()
    };
    setUserProfile(updatedProfile);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        demoBalance: newBalance,
        demoEquity: newBalance,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Deposit update doc error:', err);
    }
    logActivity('deposit', 'Deposit', `Added $${amount.toLocaleString()} funds via ${method}`, amount);
  };

  // Withdraw Funds with Two-Step Withdrawal Code Verification
  const withdrawDemoFunds = async (
    amount: number, 
    method: string, 
    withdrawalCode?: string,
    code1Id?: string,
    code2Id?: string,
    accountHolderName?: string,
    financialInstitution?: string
  ) => {
    if (!currentUser || !userProfile) return;

    if (code1Id && code2Id && accountHolderName && financialInstitution) {
      const result = await processClientWithdrawalWithTwoCodes({
        userId: currentUser.uid,
        userEmail: currentUser.email || userProfile.email,
        userName: userProfile.fullName || 'Trader',
        amount,
        method,
        accountHolderName,
        financialInstitution,
        code1Id,
        code2Id
      });

      const currentProfit = userProfile.profit ?? userProfile.demoProfitLoss ?? 0;
      const newProfit = Math.max(0, currentProfit - amount);
      setUserProfile({
        ...userProfile,
        profit: newProfit,
        demoProfitLoss: newProfit,
        updatedAt: new Date().toISOString()
      });

      logActivity('withdrawal', 'Withdrawal Request', `Requested $${amount.toLocaleString()} withdrawal to ${method} (Two-step verified: ${result.withdrawalId})`, amount);
      return;
    }

    if (withdrawalCode && withdrawalCode.trim()) {
      // Legacy single-code atomic withdrawal transaction
      const result = await processClientWithdrawalWithCode({
        userId: currentUser.uid,
        userEmail: currentUser.email || userProfile.email,
        userName: userProfile.fullName || 'Trader',
        amount,
        method,
        enteredCode: withdrawalCode.trim()
      });

      const currentProfit = userProfile.profit ?? userProfile.demoProfitLoss ?? 0;
      const newProfit = Math.max(0, currentProfit - amount);
      setUserProfile({
        ...userProfile,
        profit: newProfit,
        demoProfitLoss: newProfit,
        updatedAt: new Date().toISOString()
      });

      logActivity('withdrawal', 'Withdrawal Request', `Requested $${amount.toLocaleString()} withdrawal to ${method} (Code verified: ${result.codeId})`, amount);
      return;
    }

    // Fallback: If no code provided (legacy or unconstrained), perform standard flow
    const currentProfit = userProfile.profit ?? userProfile.demoProfitLoss ?? 0;
    if (amount > currentProfit) {
      throw new Error(`Insufficient profit balance ($${currentProfit.toFixed(2)}) for requested withdrawal of $${amount.toFixed(2)}.`);
    }
    const newProfit = currentProfit - amount;
    const updatedProfile = {
      ...userProfile,
      profit: newProfit,
      demoProfitLoss: newProfit,
      updatedAt: new Date().toISOString()
    };
    setUserProfile(updatedProfile);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        profit: newProfit,
        demoProfitLoss: newProfit,
        updatedAt: new Date().toISOString()
      });

      // Create a pending Withdrawal Request document in Firestore
      const reqId = 'with_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      const withdrawalReq = {
        id: reqId,
        userId: currentUser.uid,
        userEmail: currentUser.email || userProfile.email,
        userName: userProfile.fullName || 'Trader',
        method,
        amount,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'withdrawalRequests', reqId), withdrawalReq);
    } catch (err) {
      console.warn('Withdraw update doc error:', err);
    }
    logActivity('withdrawal', 'Withdrawal Request', `Requested $${amount.toLocaleString()} withdrawal to ${method}`, amount);
  };

  // Execute Demo Order
  const executeDemoOrder = async (orderData: {
    symbol: string;
    assetName: string;
    category: AssetCategory;
    direction: OrderDirection;
    orderType: OrderType;
    quantity: number;
    leverage: number;
    duration?: string;
    stopLoss?: number;
    takeProfit?: number;
  }) => {
    if (!currentUser || !userProfile) {
      return { success: false, message: 'Must be logged in to execute demo orders.' };
    }

    const currentMarket = markets.find(m => m.symbol === orderData.symbol || m.id === orderData.symbol);
    const executionPrice = currentMarket ? currentMarket.price : 100;
    const totalAmount = orderData.quantity * executionPrice;
    const marginRequired = totalAmount / orderData.leverage;

    if (marginRequired > userProfile.demoBalance) {
      return { 
        success: false, 
        message: `Insufficient demo balance. Required margin $${marginRequired.toFixed(2)}, Available: $${userProfile.demoBalance.toFixed(2)}` 
      };
    }

    // Deduct margin from demo balance
    const updatedBalance = userProfile.demoBalance - marginRequired;
    setUserProfile(prev => prev ? { ...prev, demoBalance: updatedBalance } : null);

    const orderId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newOrder: DemoOrder = {
      id: orderId,
      userId: currentUser.uid,
      symbol: orderData.symbol,
      assetName: orderData.assetName,
      category: orderData.category,
      direction: orderData.direction,
      orderType: orderData.orderType,
      quantity: orderData.quantity,
      leverage: orderData.leverage,
      duration: orderData.duration || '1m',
      price: executionPrice,
      totalAmount,
      marginRequired,
      status: 'completed',
      stopLoss: orderData.stopLoss,
      takeProfit: orderData.takeProfit,
      createdAt: new Date().toISOString()
    };

    const positionId = 'pos_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newPosition: DemoPosition = {
      id: positionId,
      userId: currentUser.uid,
      symbol: orderData.symbol,
      assetName: orderData.assetName,
      category: orderData.category,
      direction: orderData.direction,
      quantity: orderData.quantity,
      leverage: orderData.leverage,
      entryPrice: executionPrice,
      currentPrice: executionPrice,
      pnl: 0,
      pnlPercent: 0,
      margin: marginRequired,
      status: 'open',
      openedAt: new Date().toISOString(),
      stopLoss: orderData.stopLoss,
      takeProfit: orderData.takeProfit
    };

    setOrders(prev => [newOrder, ...prev]);
    setPositions(prev => [newPosition, ...prev]);

    // Persist to Firestore
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { demoBalance: updatedBalance });
      await setDoc(doc(db, 'orders', orderId), newOrder);
      await setDoc(doc(db, 'positions', positionId), newPosition);
    } catch (err) {
      console.warn('Order firestore persist warning:', err);
    }

    logActivity(
      'order_created', 
      `Demo Order Executed (${orderData.direction.toUpperCase()})`, 
      `${orderData.direction.toUpperCase()} ${orderData.quantity} ${orderData.symbol} @ $${executionPrice.toFixed(2)} (${orderData.leverage}x Leverage)`
    );

    return { 
      success: true, 
      message: `Demo ${orderData.direction.toUpperCase()} order for ${orderData.symbol} executed successfully!` 
    };
  };

  // Close Demo Position
  const closeDemoPosition = async (positionId: string) => {
    if (!currentUser || !userProfile) {
      return { success: false, message: 'User not logged in' };
    }

    const pos = positions.find(p => p.id === positionId && p.status === 'open');
    if (!pos) {
      return { success: false, message: 'Position not found or already closed' };
    }

    // Return margin + PnL back to demo balance
    const returnedAmount = pos.margin + pos.pnl;
    const newDemoBalance = Math.max(0, userProfile.demoBalance + returnedAmount);

    const updatedPosition: DemoPosition = {
      ...pos,
      status: 'closed',
      closedAt: new Date().toISOString()
    };

    setPositions(prev => prev.map(p => p.id === positionId ? updatedPosition : p));
    setUserProfile(prev => prev ? { ...prev, demoBalance: newDemoBalance } : null);

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { demoBalance: newDemoBalance });
      await setDoc(doc(db, 'positions', positionId), updatedPosition);
    } catch (err) {
      console.warn('Close position firestore warning:', err);
    }

    logActivity(
      'position_closed', 
      `Closed Position: ${pos.symbol}`, 
      `Closed ${pos.direction.toUpperCase()} ${pos.symbol} position. P/L: $${pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)} (${pos.pnlPercent.toFixed(2)}%)`,
      pos.pnl
    );

    return { 
      success: true, 
      message: `Position closed! P/L: $${pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)} added to demo balance.` 
    };
  };

  // Toggle Watchlist
  const toggleWatchlist = async (marketId: string) => {
    const exists = watchlist.includes(marketId);
    let updated: string[] = [];
    if (exists) {
      updated = watchlist.filter(id => id !== marketId);
    } else {
      updated = [...watchlist, marketId];
    }
    setWatchlist(updated);

    if (currentUser) {
      try {
        const watchDocId = `${currentUser.uid}_${marketId}`;
        const watchRef = doc(db, 'watchlists', watchDocId);
        if (exists) {
          await deleteDoc(watchRef);
        } else {
          await setDoc(watchRef, {
            id: watchDocId,
            userId: currentUser.uid,
            marketId,
            addedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('Watchlist firestore update error:', err);
      }
    }
  };

  // Update User Profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;
    const updated = { ...userProfile, ...data, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), data);
    } catch (err) {
      console.warn('Update profile firestore error:', err);
    }
    logActivity('profile_update', 'Profile Updated', 'Account settings updated');
  };

  // Admin: Update Market Asset
  const adminUpdateMarket = async (updatedMarket: MarketAsset) => {
    setMarkets(prev => {
      const idx = prev.findIndex(m => m.id === updatedMarket.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedMarket;
        return copy;
      }
      return [...prev, updatedMarket];
    });

    try {
      await setDoc(doc(db, 'markets', updatedMarket.id), updatedMarket);
    } catch (err) {
      console.warn('Admin market update firestore error:', err);
    }
  };

  // Admin: Top Up User Demo Balance
  const adminTopUpUser = async (uid: string, amount: number) => {
    if (currentUser?.uid === uid && userProfile) {
      const newBal = userProfile.demoBalance + amount;
      setUserProfile({ ...userProfile, demoBalance: newBal });
    }
    try {
      const uRef = doc(db, 'users', uid);
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) {
        const currentBal = uSnap.data().demoBalance || 0;
        await updateDoc(uRef, { demoBalance: currentBal + amount });
      }
    } catch (err) {
      console.warn('Admin top up firestore error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      currentUser,
      userProfile,
      loading,
      markets,
      orders,
      positions,
      watchlist,
      activities,
      isDemoAccount: true, // Always true for Promaster FX Demo Platform
      authNotice,
      clearAuthNotice,
      login,
      loginWithGoogle,
      register,
      logout,
      signOut: logout,
      sendPasswordReset,
      quickGuestLogin,
      resetDemoBalance,
      depositDemoFunds,
      withdrawDemoFunds,
      executeDemoOrder,
      closeDemoPosition,
      toggleWatchlist,
      updateUserProfile,
      adminUpdateMarket,
      adminTopUpUser,
      notifications,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      clearAllNotifications
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
