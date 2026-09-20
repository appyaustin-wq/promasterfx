import { 
  db, 
  auth 
} from '../lib/firebase';
import { SyncLogger } from '../lib/syncLogger';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy, 
  limit, 
  serverTimestamp,
  runTransaction 
} from 'firebase/firestore';
import { UserProfile, MarketAsset, DemoOrder, DemoPosition, DepositRequest, DepositOption, AppNotification, WithdrawalRequest, LoanApplication, WithdrawalCode, BroadcastRecord } from '../types';

export interface AuditLogEntry {
  id: string;
  adminUserId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface PlatformSettingsData {
  maintenanceMode: boolean;
  defaultDemoBalance: number;
  platformNotice: string;
  updatedAt?: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleAdminFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMessage = error instanceof Error ? error.message : String(error);
  if (auth.currentUser) {
    const errInfo: FirestoreErrorInfo = {
      error: errMessage,
      authInfo: {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
      },
      operationType,
      path
    };
    console.error('Admin Firestore Error:', JSON.stringify(errInfo));
  }
  if (errMessage.includes('permission-denied') || errMessage.includes('Missing or insufficient permissions')) {
    throw new Error('PERMISSION_DENIED: You do not have permission to execute this administrative operation.');
  }
  throw new Error(`Firestore Operation Failed (${operationType}): ${errMessage}`);
}

// Write Immutable Audit Log Entry
export async function writeAuditLog(
  adminUserId: string,
  adminEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  details: string
): Promise<void> {
  const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const entry: AuditLogEntry = {
    id: logId,
    adminUserId,
    adminEmail,
    action,
    targetType,
    targetId,
    details,
    timestamp: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'auditLogs', logId), entry);
  } catch (err) {
    console.warn('Failed to write audit log:', err);
  }
}

const FALLBACK_USERS: UserProfile[] = [
  {
    uid: 'admin_01',
    email: 'admin@promasterfx.com',
    fullName: 'Platform Administrator',
    username: 'admin',
    preferredCurrency: 'USD ($) — US Dollar',
    role: 'admin',
    demoBalance: 500000,
    demoEquity: 500000,
    demoProfitLoss: 0,
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    uid: 'trader_demo_01',
    email: 'appyaustin@gmail.com',
    fullName: 'Demo Trader',
    username: 'demotrader',
    preferredCurrency: 'USD ($) — US Dollar',
    role: 'user',
    demoBalance: 10000,
    demoEquity: 10000,
    demoProfitLoss: 0,
    verified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Fetch All Users from Firestore
export async function fetchAllUsers(): Promise<UserProfile[]> {
  return SyncLogger.profile('Admin: Fetch All Users', async () => {
    const snap = await getDocs(collection(db, 'users'));
    const list: UserProfile[] = [];
    snap.forEach(d => {
      list.push(d.data() as UserProfile);
    });
    return list;
  }, { path: 'users', userId: auth.currentUser?.uid || 'local_session' });
}

// Admin: Update User Balance
export async function updateUserBalance(
  targetUid: string, 
  newBalance: number, 
  adminUid: string, 
  adminEmail: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', targetUid), {
      demoBalance: newBalance,
      updatedAt: new Date().toISOString()
    });
    await writeAuditLog(
      adminUid, 
      adminEmail, 
      'UPDATE_USER_BALANCE', 
      'USER', 
      targetUid, 
      `Set demo balance to $${newBalance.toLocaleString()}`
    );
  } catch (err) {
    handleAdminFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
  }
}

// Admin: Update User Access / Verification Status
export async function updateUserStatus(
  targetUid: string, 
  verified: boolean, 
  adminUid: string, 
  adminEmail: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', targetUid), {
      verified,
      updatedAt: new Date().toISOString()
    });
    await writeAuditLog(
      adminUid, 
      adminEmail, 
      'UPDATE_USER_STATUS', 
      'USER', 
      targetUid, 
      `Set demo verification status to ${verified ? 'Verified' : 'Unverified'}`
    );
  } catch (err) {
    handleAdminFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
  }
}

// Admin: Update User Role (Promote / Demote)
export async function updateUserRole(
  targetUid: string, 
  role: 'user' | 'admin', 
  adminUid: string, 
  adminEmail: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', targetUid), {
      role,
      updatedAt: new Date().toISOString()
    });
    await writeAuditLog(
      adminUid, 
      adminEmail, 
      'UPDATE_USER_ROLE', 
      'USER', 
      targetUid, 
      `Changed user role to ${role.toUpperCase()}`
    );
  } catch (err) {
    handleAdminFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
  }
}

// Admin: Fund User Account
export async function adminFundAccount(
  targetUid: string,
  amount: number,
  reason: string,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', targetUid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      throw new Error('User record not found.');
    }
    const currentBal = Number(snap.data().demoBalance || 0);
    const newBal = currentBal + amount;
    const now = new Date().toISOString();

    await updateDoc(userRef, {
      demoBalance: newBal,
      demoEquity: newBal,
      updatedAt: now
    });

    await writeAuditLog(
      adminUid,
      adminEmail,
      'FUND_ACCOUNT',
      'USER',
      targetUid,
      `Funded account with +$${amount.toLocaleString()} (Previous: $${currentBal.toLocaleString()}, New: $${newBal.toLocaleString()}). Reason: ${reason || 'N/A'}`
    );

    await sendNotification(
      targetUid,
      'Account Funded 🎉',
      `Your account balance has been credited with $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}. ${reason ? `Note: ${reason}` : ''}`,
      'deposit',
      'approved',
      amount
    );
  } catch (err) {
    handleAdminFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
  }
}

// Admin: Adjust Profit
export async function adminAdjustProfit(
  targetUid: string,
  newProfitAmount: number,
  reason: string,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', targetUid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      throw new Error('User record not found.');
    }
    const prevProfit = Number(snap.data().profit || 0);
    const now = new Date().toISOString();

    await updateDoc(userRef, {
      profit: newProfitAmount,
      demoProfitLoss: newProfitAmount,
      updatedAt: now
    });

    await writeAuditLog(
      adminUid,
      adminEmail,
      'ADJUST_PROFIT',
      'USER',
      targetUid,
      `Adjusted user profit to $${newProfitAmount.toLocaleString()} (Previous: $${prevProfit.toLocaleString()}). Reason: ${reason || 'Admin Adjustment'}`
    );
  } catch (err) {
    handleAdminFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
  }
}

// Admin: Add Bonus
export async function adminAddBonus(
  targetUid: string,
  bonusAmount: number,
  addBalance: boolean,
  reason: string,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', targetUid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      throw new Error('User record not found.');
    }
    const currentData = snap.data();
    const prevBonus = Number(currentData.bonus || 0);
    const newBonus = prevBonus + bonusAmount;
    const now = new Date().toISOString();

    const updates: Record<string, any> = {
      bonus: newBonus,
      updatedAt: now
    };

    if (addBalance) {
      const currentBal = Number(currentData.demoBalance || 0);
      const newBal = currentBal + bonusAmount;
      updates.demoBalance = newBal;
      updates.demoEquity = newBal;
    }

    await updateDoc(userRef, updates);

    await writeAuditLog(
      adminUid,
      adminEmail,
      'ADD_BONUS',
      'USER',
      targetUid,
      `Added bonus +$${bonusAmount.toLocaleString()} ${addBalance ? '(Credited to balance)' : '(Bonus field updated)'}. Reason: ${reason || 'N/A'}`
    );

    await sendNotification(
      targetUid,
      'Bonus Credited 🎁',
      `A bonus of $${bonusAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been applied to your account. ${reason ? `Note: ${reason}` : ''}`,
      'system',
      'info',
      bonusAmount
    );
  } catch (err) {
    handleAdminFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
  }
}

// Admin: Update User Profile Details
export async function adminUpdateUserProfileDetails(
  targetUid: string,
  details: Partial<UserProfile>,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', targetUid);
    const now = new Date().toISOString();

    await updateDoc(userRef, {
      ...details,
      updatedAt: now
    });

    await writeAuditLog(
      adminUid,
      adminEmail,
      'UPDATE_USER_DETAILS',
      'USER',
      targetUid,
      `Updated user profile details for ${targetUid}: ${Object.keys(details).join(', ')}`
    );
  } catch (err) {
    handleAdminFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
  }
}

// Fetch All Demo Orders Across Users
export async function fetchAllOrders(): Promise<DemoOrder[]> {
  return SyncLogger.profile('Admin: Fetch All Orders', async () => {
    const snap = await getDocs(collection(db, 'orders'));
    const list: DemoOrder[] = [];
    snap.forEach(d => list.push(d.data() as DemoOrder));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, { path: 'orders', userId: auth.currentUser?.uid || 'local_session' });
}

// Fetch All Demo Positions Across Users
export async function fetchAllPositions(): Promise<DemoPosition[]> {
  return SyncLogger.profile('Admin: Fetch All Positions', async () => {
    const snap = await getDocs(collection(db, 'positions'));
    const list: DemoPosition[] = [];
    snap.forEach(d => list.push(d.data() as DemoPosition));
    return list.sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
  }, { path: 'positions', userId: auth.currentUser?.uid || 'local_session' });
}

// Fetch All Audit Logs
export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  try {
    const snap = await getDocs(collection(db, 'auditLogs'));
    const list: AuditLogEntry[] = [];
    snap.forEach(d => list.push(d.data() as AuditLogEntry));
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (err) {
    // Audit logs might be empty on initial boot, return empty array if not found
    console.warn('Audit logs fetch notice:', err);
    return [];
  }
}

// Admin: Save / Create Market Asset
export async function saveDemoMarket(
  market: MarketAsset, 
  isNew: boolean, 
  adminUid: string, 
  adminEmail: string
): Promise<void> {
  try {
    await setDoc(doc(db, 'markets', market.id), market);
    await writeAuditLog(
      adminUid, 
      adminEmail, 
      isNew ? 'CREATE_MARKET' : 'UPDATE_MARKET', 
      'MARKET', 
      market.id, 
      `${isNew ? 'Created' : 'Updated'} market asset ${market.symbol} (${market.name}) at price $${market.price}`
    );
  } catch (err) {
    handleAdminFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `markets/${market.id}`);
  }
}

// Admin: Delete Market Asset
export async function deleteDemoMarket(
  marketId: string, 
  symbol: string, 
  adminUid: string, 
  adminEmail: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, 'markets', marketId));
    await writeAuditLog(
      adminUid, 
      adminEmail, 
      'DELETE_MARKET', 
      'MARKET', 
      marketId, 
      `Deleted demo market asset ${symbol}`
    );
  } catch (err) {
    handleAdminFirestoreError(err, OperationType.DELETE, `markets/${marketId}`);
  }
}

// Fetch Platform Settings
export async function fetchPlatformSettings(): Promise<PlatformSettingsData> {
  const defaultSettings: PlatformSettingsData = {
    maintenanceMode: false,
    defaultDemoBalance: 10000,
    platformNotice: 'Promaster FX Demo Trading Environment Active'
  };
  try {
    const docRef = doc(db, 'platformSettings', 'config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...defaultSettings, ...(snap.data() as PlatformSettingsData) };
    }
    return defaultSettings;
  } catch (err) {
    console.warn('Platform settings fetch fallback:', err);
    return defaultSettings;
  }
}

// Save Platform Settings
export async function savePlatformSettings(
  settings: PlatformSettingsData, 
  adminUid: string, 
  adminEmail: string
): Promise<void> {
  const data = {
    ...settings,
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'platformSettings', 'config'), data);
    await writeAuditLog(
      adminUid, 
      adminEmail, 
      'UPDATE_PLATFORM_SETTINGS', 
      'SETTINGS', 
      'config', 
      `Updated platform settings: Maintenance=${settings.maintenanceMode}, DefaultBalance=$${settings.defaultDemoBalance}`
    );
  } catch (err) {
    handleAdminFirestoreError(err, OperationType.WRITE, 'platformSettings/config');
  }
}

// User & Admin: Submit Deposit Request
export async function submitDepositRequest(
  userId: string,
  userEmail: string,
  userName: string,
  method: string,
  methodId: string,
  amount: number,
  txHashOrProof?: string
): Promise<DepositRequest> {
  const reqId = 'dep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const depositReq: DepositRequest = {
    id: reqId,
    userId,
    userEmail,
    userName,
    method,
    methodId,
    amount,
    status: 'pending',
    txHashOrProof: txHashOrProof || '',
    createdAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'depositRequests', reqId), depositReq);
  } catch (err) {
    console.warn('Saving deposit request local notice:', err);
  }
  return depositReq;
}

// Fetch Deposit Requests for a specific User
export async function fetchUserDepositRequests(userId: string): Promise<DepositRequest[]> {
  try {
    const snap = await getDocs(collection(db, 'depositRequests'));
    const list: DepositRequest[] = [];
    snap.forEach((d) => {
      const data = d.data() as DepositRequest;
      if (data.userId === userId) {
        list.push(data);
      }
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Fetch user deposit requests notice:', err);
    return [];
  }
}

// Fetch All Deposit Requests (Admin)
export async function fetchAllDepositRequests(): Promise<DepositRequest[]> {
  return SyncLogger.profile('Admin: Fetch All Deposit Requests', async () => {
    const snap = await getDocs(collection(db, 'depositRequests'));
    const list: DepositRequest[] = [];
    snap.forEach((d) => {
      list.push(d.data() as DepositRequest);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, { path: 'depositRequests', userId: auth.currentUser?.uid || 'local_session' });
}

// Admin: Approve Deposit Request
export async function approveDepositRequest(
  requestId: string,
  userId: string,
  amount: number,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const reqRef = doc(db, 'depositRequests', requestId);
  const now = new Date().toISOString();

  // Update Deposit Request status to approved
  try {
    await updateDoc(reqRef, {
      status: 'approved',
      processedAt: now,
      processedBy: adminEmail
    });
  } catch (err) {
    console.warn('Update deposit request status notice:', err);
  }

  // Update User balance
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentBal = (userSnap.data().demoBalance || 0);
      const newBal = currentBal + amount;
      await updateDoc(userRef, {
        demoBalance: newBal,
        demoEquity: newBal,
        updatedAt: now
      });
    }
  } catch (err) {
    console.warn('Update user balance on deposit approval notice:', err);
  }

  // Send Notification
  await sendNotification(
    userId,
    'Deposit Approved',
    `Your deposit of $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been approved and credited to your balance.`,
    'deposit',
    'approved',
    amount
  );

  // Audit Log
  await writeAuditLog(
    adminUid,
    adminEmail,
    'APPROVE_DEPOSIT',
    'DEPOSIT_REQUEST',
    requestId,
    `Approved deposit of $${amount.toLocaleString()} for user ${userId}`
  );
}

// Admin: Reject Deposit Request
export async function rejectDepositRequest(
  requestId: string,
  adminUid: string,
  adminEmail: string,
  reason?: string
): Promise<void> {
  const reqRef = doc(db, 'depositRequests', requestId);
  const now = new Date().toISOString();

  try {
    await updateDoc(reqRef, {
      status: 'rejected',
      notes: reason || 'Deposit request rejected by administration.',
      processedAt: now,
      processedBy: adminEmail
    });

    // Fetch details to send notification
    const snap = await getDoc(reqRef);
    if (snap.exists()) {
      const data = snap.data() as DepositRequest;
      await sendNotification(
        data.userId,
        'Deposit Rejected',
        `Your deposit request of $${data.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} was rejected. Reason: ${reason || 'Deposit request rejected by administration.'}`,
        'deposit',
        'rejected',
        data.amount
      );
    }
  } catch (err) {
    console.warn('Update deposit request reject status notice:', err);
  }

  await writeAuditLog(
    adminUid,
    adminEmail,
    'REJECT_DEPOSIT',
    'DEPOSIT_REQUEST',
    requestId,
    `Rejected deposit request ${requestId}. Reason: ${reason || 'N/A'}`
  );
}

// Default Initial Payment Methods
export const DEFAULT_DEPOSIT_OPTIONS: DepositOption[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', subtitle: 'Upload payment proof for quick verification', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', iconType: 'btc', iconColor: 'text-[#f7931a]', iconBg: 'bg-[#f7931a]/10 border-[#f7931a]/20', enabled: true },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', subtitle: 'Upload payment proof for quick verification', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', iconType: 'eth', iconColor: 'text-[#627eea]', iconBg: 'bg-[#627eea]/10 border-[#627eea]/20', enabled: true },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', subtitle: 'Upload payment proof for quick verification', address: 'LTC1q8x3p4e5g6h7j8k9m0n1p2q3r4s5t6u7v8w9x0y', iconType: 'ltc', iconColor: 'text-[#345d9d]', iconBg: 'bg-[#345d9d]/10 border-[#345d9d]/20', enabled: true },
  { id: 'usdt', name: 'USDT', symbol: 'USDT (TRC20)', subtitle: 'Upload payment proof for quick verification', address: 'T9xP82mK4L1vQ3zW5yR7tE9uI1oP3aS5dF7gH', iconType: 'usdt', iconColor: 'text-[#26a17b]', iconBg: 'bg-[#26a17b]/10 border-[#26a17b]/20', enabled: true },
  { id: 'solana', name: 'Solana', symbol: 'SOL', subtitle: 'Upload payment proof for quick verification', address: 'So11111111111111111111111111111111111111112', iconType: 'sol', iconColor: 'text-[#14f195]', iconBg: 'bg-[#14f195]/10 border-[#14f195]/20', enabled: true },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', subtitle: 'Upload payment proof for quick verification', address: 'rEb8TK3gG22auAzB22632555523425235', iconType: 'xrp', iconColor: 'text-[#23292f]', iconBg: 'bg-[#23292f]/30 border-slate-700', enabled: true },
  { id: 'hype', name: 'Hype', symbol: 'HYPE', subtitle: 'Upload payment proof for quick verification', address: 'hype1q9283746152435465768798098', iconType: 'hype', iconColor: 'text-emerald-400', iconBg: 'bg-emerald-400/10 border-emerald-400/20', enabled: true },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', subtitle: 'Upload payment proof for quick verification', address: '0x514910771AF9Ca656af840dff83E8264EcF986CA', iconType: 'link', iconColor: 'text-[#375bd2]', iconBg: 'bg-[#375bd2]/10 border-[#375bd2]/20', enabled: true },
  { id: 'xlm', name: 'XLM', symbol: 'XLM', subtitle: 'Upload payment proof for quick verification', address: 'G1234567890QWERTYUIOPASDFGHJKLZXCVBNM', iconType: 'xlm', iconColor: 'text-sky-400', iconBg: 'bg-sky-400/10 border-sky-400/20', enabled: true },
  { id: 'avalanche', name: 'Avalanche', symbol: 'AVAX', subtitle: 'Upload payment proof for quick verification', address: '0x1e234567890abcdef1234567890abcdef123456', iconType: 'avax', iconColor: 'text-rose-500', iconBg: 'bg-rose-500/10 border-rose-500/20', enabled: true },
  { id: 'ada', name: 'ADA', symbol: 'ADA', subtitle: 'Upload payment proof for quick verification', address: 'addr1q9x3p4e5g6h7j8k9m0n1p2q3r4s5t6u7v8w9x0y', iconType: 'ada', iconColor: 'text-indigo-400', iconBg: 'bg-indigo-400/10 border-indigo-400/20', enabled: true },
  { id: 'bank-transfer', name: 'Bank Transfer', symbol: 'WIRE', subtitle: 'Upload payment proof for quick verification', address: 'IBAN: GB82 WEST 1234 5678 9012 34 (SWIFT: WESTGB2L)', iconType: 'bank', iconColor: 'text-amber-400', iconBg: 'bg-amber-400/10 border-amber-400/20', enabled: true },
];

// Fetch Payment Methods (or fallback/seed)
export async function fetchPaymentMethods(): Promise<DepositOption[]> {
  try {
    const snap = await getDocs(collection(db, 'paymentMethods'));
    if (snap.empty) {
      // Seed default methods to Firestore
      for (const opt of DEFAULT_DEPOSIT_OPTIONS) {
        await setDoc(doc(db, 'paymentMethods', opt.id), opt);
      }
      return DEFAULT_DEPOSIT_OPTIONS;
    }
    const list: DepositOption[] = [];
    snap.forEach((d) => {
      list.push(d.data() as DepositOption);
    });
    return list;
  } catch (err) {
    console.warn('Fetch payment methods notice, using defaults:', err);
    return DEFAULT_DEPOSIT_OPTIONS;
  }
}

// Admin: Save or Update Payment Method
export async function savePaymentMethod(
  option: DepositOption,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const methodRef = doc(db, 'paymentMethods', option.id);
  try {
    await setDoc(methodRef, option, { merge: true });
    await writeAuditLog(
      adminUid,
      adminEmail,
      'SAVE_PAYMENT_METHOD',
      'PAYMENT_METHOD',
      option.id,
      `Saved payment method ${option.name} (${option.symbol}) address: ${option.address}`
    );
  } catch (err) {
    handleAdminFirestoreError(err, OperationType.WRITE, `paymentMethods/${option.id}`);
  }
}

// Admin: Delete Payment Method
export async function deletePaymentMethod(
  optionId: string,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const methodRef = doc(db, 'paymentMethods', optionId);
  try {
    await deleteDoc(methodRef);
    await writeAuditLog(
      adminUid,
      adminEmail,
      'DELETE_PAYMENT_METHOD',
      'PAYMENT_METHOD',
      optionId,
      `Deleted payment method ${optionId}`
    );
  } catch (err) {
    handleAdminFirestoreError(err, OperationType.DELETE, `paymentMethods/${optionId}`);
  }
}

// -------------------------------------------------------------
// NOTIFICATION & TRANSACTION MANAGEMENT FUNCTIONS
// -------------------------------------------------------------

// Send Notification to User
export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: 'deposit' | 'withdrawal' | 'loan' | 'system' | 'announcement',
  status: 'approved' | 'rejected' | 'info',
  amount?: number
): Promise<void> {
  const id = 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const notification: AppNotification = {
    id,
    userId,
    title,
    message,
    type,
    status,
    amount,
    read: false,
    createdAt: new Date().toISOString()
  };
  
  console.log(`[Admin Notification Service] Initiating Firestore write:`, {
    authenticatedAdminId: auth.currentUser?.uid || 'unknown_admin',
    targetUserId: userId,
    notificationCollectionPath: `notifications/${id}`,
    notificationData: notification,
    userDashboardQueryPath: `notifications (filtered by userId == ${userId})`
  });

  // Allow the write error to bubble up so that the admin panel can catch it and display a real error status
  await setDoc(doc(db, 'notifications', id), notification);
  
  console.log(`[Admin Notification Service] Firestore write succeeded for: notifications/${id}`);
}

// Fetch All Withdrawal Requests (Admin)
export async function fetchAllWithdrawalRequests(): Promise<WithdrawalRequest[]> {
  return SyncLogger.profile('Admin: Fetch All Withdrawal Requests', async () => {
    const snap = await getDocs(collection(db, 'withdrawalRequests'));
    const list: WithdrawalRequest[] = [];
    snap.forEach((d) => {
      list.push(d.data() as WithdrawalRequest);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, { path: 'withdrawalRequests', userId: auth.currentUser?.uid || 'local_session' });
}

// Fetch Withdrawal Requests for a specific User
export async function fetchUserWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]> {
  try {
    const snap = await getDocs(collection(db, 'withdrawalRequests'));
    const list: WithdrawalRequest[] = [];
    snap.forEach((d) => {
      const data = d.data() as WithdrawalRequest;
      if (data.userId === userId) {
        list.push(data);
      }
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Fetch user withdrawal requests notice:', err);
    return [];
  }
}

// Admin: Approve Withdrawal Request
export async function approveWithdrawalRequest(
  requestId: string,
  userId: string,
  amount: number,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const reqRef = doc(db, 'withdrawalRequests', requestId);
  const now = new Date().toISOString();

  try {
    await updateDoc(reqRef, {
      status: 'approved',
      processedAt: now,
      processedBy: adminEmail
    });
  } catch (err) {
    console.warn('Update withdrawal request status notice:', err);
  }

  // Send Notification
  await sendNotification(
    userId,
    'Withdrawal Approved',
    `Your withdrawal of $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been approved and processed successfully.`,
    'withdrawal',
    'approved',
    amount
  );

  // Audit Log
  await writeAuditLog(
    adminUid,
    adminEmail,
    'APPROVE_WITHDRAWAL',
    'WITHDRAWAL_REQUEST',
    requestId,
    `Approved withdrawal of $${amount.toLocaleString()} for user ${userId}`
  );
}

// Admin: Reject Withdrawal Request
export async function rejectWithdrawalRequest(
  requestId: string,
  adminUid: string,
  adminEmail: string,
  reason?: string
): Promise<void> {
  const reqRef = doc(db, 'withdrawalRequests', requestId);
  const now = new Date().toISOString();

  let targetUserId = '';
  let refundAmount = 0;

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(reqRef);
    if (!snap.exists()) {
      throw new Error('Withdrawal request not found.');
    }

    const data = snap.data() as WithdrawalRequest;
    if (data.status !== 'pending') {
      throw new Error(`Withdrawal request cannot be rejected because it is already ${data.status}.`);
    }

    targetUserId = data.userId;
    refundAmount = Number(data.amount || 0);

    // 1. Update Withdrawal Request status to rejected
    transaction.update(reqRef, {
      status: 'rejected',
      notes: reason || 'Withdrawal request rejected by administration.',
      processedAt: now,
      processedBy: adminEmail
    });

    // 2. Refund User profit balance atomically
    if (targetUserId) {
      const userRef = doc(db, 'users', targetUserId);
      const userSnap = await transaction.get(userRef);
      if (userSnap.exists()) {
        const currentProfit = Number(userSnap.data().profit ?? userSnap.data().demoProfitLoss ?? 0);
        const newProfit = currentProfit + refundAmount;
        transaction.update(userRef, {
          profit: newProfit,
          demoProfitLoss: newProfit,
          updatedAt: now
        });
      }
    }
  });

  if (targetUserId && refundAmount) {
    // Send Notification
    await sendNotification(
      targetUserId,
      'Withdrawal Rejected',
      `Your withdrawal request of $${refundAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} was rejected and the funds have been refunded to your account. Reason: ${reason || 'Rejected by administration.'}`,
      'withdrawal',
      'rejected',
      refundAmount
    );

    // Audit Log
    await writeAuditLog(
      adminUid,
      adminEmail,
      'REJECT_WITHDRAWAL',
      'WITHDRAWAL_REQUEST',
      requestId,
      `Rejected withdrawal of $${refundAmount.toLocaleString()} for user ${targetUserId}. Reason: ${reason || 'N/A'}`
    );
  }
}

// Fetch All Loan Requests (Admin)
export async function fetchAllLoanRequests(): Promise<LoanApplication[]> {
  try {
    const snap = await getDocs(collection(db, 'loanRequests'));
    const list: LoanApplication[] = [];
    snap.forEach((d) => {
      list.push(d.data() as LoanApplication);
    });
    return list.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  } catch (err) {
    console.warn('Fetch all loan requests notice:', err);
    return [];
  }
}

// Admin: Approve Loan Request
export async function approveLoanRequest(
  requestId: string,
  userId: string,
  amount: number,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const reqRef = doc(db, 'loanRequests', requestId);
  const now = new Date().toISOString();

  // Update Loan Request status to approved
  try {
    await updateDoc(reqRef, {
      status: 'Approved',
      processedAt: now,
      processedBy: adminEmail
    });
  } catch (err) {
    console.warn('Update loan request status notice:', err);
  }

  // Update User balance (Credit the loan!)
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentBal = (userSnap.data().demoBalance || 0);
      const newBal = currentBal + amount;
      await updateDoc(userRef, {
        demoBalance: newBal,
        demoEquity: newBal,
        updatedAt: now
      });
    }
  } catch (err) {
    console.warn('Update user balance on loan approval notice:', err);
  }

  // Send Notification
  await sendNotification(
    userId,
    'Loan Approved 🎉',
    `Congratulations! Your loan application for $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been approved. The funds have been credited to your balance.`,
    'loan',
    'approved',
    amount
  );

  // Audit Log
  await writeAuditLog(
    adminUid,
    adminEmail,
    'APPROVE_LOAN',
    'LOAN_REQUEST',
    requestId,
    `Approved loan application of $${amount.toLocaleString()} for user ${userId}`
  );
}

// Admin: Send direct email to user
export async function sendDirectEmail(
  recipientEmail: string,
  recipientName: string,
  userId: string,
  subject: string,
  body: string,
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const mailId = 'mail_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const mailPayload = {
    id: mailId,
    recipientEmail,
    recipientName,
    userId,
    subject,
    body,
    sender: `Promaster FX Administration <${adminEmail}>`,
    timestamp: new Date().toISOString(),
    read: false
  };

  try {
    await setDoc(doc(db, 'emails', mailId), mailPayload);
    await writeAuditLog(
      adminUid,
      adminEmail,
      'SEND_DIRECT_EMAIL',
      'USER_EMAIL',
      userId,
      `Sent direct email to ${recipientEmail} with subject: "${subject}"`
    );
  } catch (err) {
    handleAdminFirestoreError(err, OperationType.CREATE, `emails/${mailId}`);
  }
}

// -------------------------------------------------------------
// WITHDRAWAL CODES SYSTEM (Max 2 Active Codes)
// -------------------------------------------------------------

/**
 * Generates a SHA-256 hash of a string using Web Crypto API.
 */
export async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a cryptographically secure random 6-digit numeric string.
 */
export function generateSecure6DigitCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Ensure exactly 6 digits between 100000 and 999999
  const num = 100000 + (array[0] % 900000);
  return num.toString();
}

/**
 * Fetch all withdrawal codes from Firestore.
 */
export async function fetchAllWithdrawalCodes(): Promise<WithdrawalCode[]> {
  try {
    const snap = await getDocs(collection(db, 'withdrawalCodes'));
    const list: WithdrawalCode[] = [];
    snap.forEach((d) => {
      list.push(d.data() as WithdrawalCode);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Fetch withdrawal codes notice:', err);
    return [];
  }
}

/**
 * Generate and activate a withdrawal code for Slot 1 or Slot 2.
 * Enforces maximum of 2 active codes in the system.
 */
export async function generateWithdrawalCode(
  slotNumber: 1 | 2,
  assignedUser?: { uid: string; fullName: string; email: string },
  adminUid: string = 'admin_system',
  adminEmail: string = 'admin@promasterfx.com'
): Promise<WithdrawalCode> {
  // Check existing active codes
  const allCodes = await fetchAllWithdrawalCodes();
  const activeCodes = allCodes.filter(c => c.status === 'active');
  const activeOtherSlot = activeCodes.find(c => c.slotNumber !== slotNumber);

  // If there are already 2 active codes, prevent generation unless replacing this slot
  if (activeCodes.length >= 2 && !activeCodes.some(c => c.slotNumber === slotNumber)) {
    throw new Error('2 of 2 withdrawal codes are currently active. Please revoke an existing code first.');
  }

  // If this slot currently has an active code, revoke it first
  const currentSlotActive = activeCodes.find(c => c.slotNumber === slotNumber);
  if (currentSlotActive) {
    await revokeWithdrawalCode(currentSlotActive.id, adminUid, adminEmail, 'Superseded by new generated code');
  }

  const rawCode = generateSecure6DigitCode();
  const codeHash = await hashCode(rawCode);
  const codeId = `code_slot${slotNumber}_${Date.now()}`;
  const now = new Date().toISOString();

  const newCodeDoc: WithdrawalCode = {
    id: codeId,
    code: rawCode,
    codeHash,
    status: 'active',
    slotNumber,
    createdAt: now,
    createdBy: adminEmail,
    ...(assignedUser ? {
      assignedUserId: assignedUser.uid,
      assignedUserName: assignedUser.fullName,
      assignedUserEmail: assignedUser.email
    } : {})
  };

  await setDoc(doc(db, 'withdrawalCodes', codeId), newCodeDoc);

  // Audit Log
  await writeAuditLog(
    adminUid,
    adminEmail,
    'GENERATE_WITHDRAWAL_CODE',
    'WITHDRAWAL_CODE',
    codeId,
    `Generated active authorization code for Slot ${slotNumber}${assignedUser ? ` assigned to ${assignedUser.email}` : ' (unassigned)'}`
  );

  // If assigned to user, send notification
  if (assignedUser) {
    await sendNotification(
      assignedUser.uid,
      'Authorization Code Generated',
      `An administrative authorization code has been generated for your account. Please check with support or your admin.`,
      'system',
      'info'
    );
  }

  return newCodeDoc;
}

/**
 * Generate both Slot 1 and Slot 2 withdrawal codes at once.
 */
export async function generateBothWithdrawalCodes(
  adminUid: string = 'admin_system',
  adminEmail: string = 'admin@promasterfx.com'
): Promise<WithdrawalCode[]> {
  const code1 = await generateWithdrawalCode(1, undefined, adminUid, adminEmail);
  const code2 = await generateWithdrawalCode(2, undefined, adminUid, adminEmail);
  return [code1, code2];
}

/**
 * Revoke an active withdrawal code.
 */
export async function revokeWithdrawalCode(
  codeId: string,
  adminUid: string,
  adminEmail: string,
  reason: string = 'Revoked by administrator'
): Promise<void> {
  const codeRef = doc(db, 'withdrawalCodes', codeId);
  const now = new Date().toISOString();

  await updateDoc(codeRef, {
    status: 'revoked',
    revokedAt: now,
    revokedBy: adminEmail
  });

  await writeAuditLog(
    adminUid,
    adminEmail,
    'REVOKE_WITHDRAWAL_CODE',
    'WITHDRAWAL_CODE',
    codeId,
    `Revoked authorization code ${codeId}. Reason: ${reason}`
  );
}

/**
 * Assign an existing active withdrawal code to a specific user.
 */
export async function assignWithdrawalCodeToUser(
  codeId: string,
  user: { uid: string; fullName: string; email: string },
  adminUid: string,
  adminEmail: string
): Promise<void> {
  const codeRef = doc(db, 'withdrawalCodes', codeId);

  await updateDoc(codeRef, {
    assignedUserId: user.uid,
    assignedUserName: user.fullName,
    assignedUserEmail: user.email
  });

  await writeAuditLog(
    adminUid,
    adminEmail,
    'ASSIGN_WITHDRAWAL_CODE',
    'WITHDRAWAL_CODE',
    codeId,
    `Assigned authorization code ${codeId} to user ${user.email} (${user.uid})`
  );

  await sendNotification(
    user.uid,
    'Authorization Code Assigned',
    `An authorization code has been assigned to your account.`,
    'system',
    'info'
  );
}

/**
 * Validates a withdrawal code and creates a withdrawal request atomically.
 * Ensures:
 * 1. Code exists
 * 2. Code is active
 * 3. Code has not already been used
 * 4. Code has not been revoked
 * 5. If code is assigned to a specific user, it matches the authenticated user
 * 6. User has sufficient balance
 * 7. Atomically deducts user balance, marks code as used, and creates withdrawal request
 * 8. Protects against race conditions / simultaneous reuse.
 */
export async function processClientWithdrawalWithCode(params: {
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  method: string;
  enteredCode: string;
}): Promise<{ withdrawalId: string; codeId: string }> {
  const { userId, userEmail, userName, amount, method, enteredCode } = params;

  // Clean code input
  const cleanCode = enteredCode.trim();
  if (!cleanCode || !/^\d{6}$/.test(cleanCode)) {
    throw new Error('Invalid authorization code. Please enter a valid 6-digit numeric code.');
  }

  const enteredHash = await hashCode(cleanCode);

  // Find candidate active code matching this hash
  // Using query to locate document by codeHash
  const codesQuery = query(
    collection(db, 'withdrawalCodes'),
    where('codeHash', '==', enteredHash)
  );
  const snap = await getDocs(codesQuery);

  if (snap.empty) {
    // Log invalid attempt
    await writeAuditLog(
      userId,
      userEmail,
      'FAILED_WITHDRAWAL_ATTEMPT',
      'WITHDRAWAL_CODE',
      'UNKNOWN',
      `User ${userEmail} attempted withdrawal with an invalid or non-existent code.`
    );
    throw new Error('Invalid authorization code. Please check the code and try again.');
  }

  // Get the matching code document
  const codeDocSnap = snap.docs[0];
  const codeData = codeDocSnap.data() as WithdrawalCode;
  const targetCodeRef = doc(db, 'withdrawalCodes', codeDocSnap.id);
  const userRef = doc(db, 'users', userId);
  const reqId = 'with_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const withdrawalReqRef = doc(db, 'withdrawalRequests', reqId);
  const now = new Date().toISOString();

  // Pre-validate non-transient conditions to give accurate error messages
  if (codeData.status === 'used') {
    throw new Error('This authorization code has already been used.');
  }
  if (codeData.status === 'revoked') {
    throw new Error('This authorization code is no longer valid.');
  }
  if (codeData.status !== 'active') {
    throw new Error('Withdrawal authorization is currently unavailable. Please contact support.');
  }
  if (codeData.assignedUserId && codeData.assignedUserId !== userId) {
    throw new Error('This authorization code is not assigned to your account.');
  }

  // ATOMIC TRANSACTION:
  // Re-reads code and user inside transaction to prevent race condition
  await runTransaction(db, async (transaction) => {
    const freshCodeSnap = await transaction.get(targetCodeRef);
    if (!freshCodeSnap.exists()) {
      throw new Error('Authorization code not found in database.');
    }
    const freshCode = freshCodeSnap.data() as WithdrawalCode;
    if (freshCode.status === 'used') {
      throw new Error('This authorization code has already been used.');
    }
    if (freshCode.status === 'revoked') {
      throw new Error('This authorization code is no longer valid.');
    }
    if (freshCode.status !== 'active') {
      throw new Error('Withdrawal authorization is currently unavailable. Please contact support.');
    }
    if (freshCode.assignedUserId && freshCode.assignedUserId !== userId) {
      throw new Error('This authorization code is not assigned to your account.');
    }

    // Check user profit balance
    const freshUserSnap = await transaction.get(userRef);
    if (!freshUserSnap.exists()) {
      throw new Error('User profile record not found.');
    }
    const userData = freshUserSnap.data();
    const currentProfit = Number(userData.profit ?? userData.demoProfitLoss ?? 0);

    if (amount > currentProfit) {
      throw new Error(`Insufficient profit balance ($${currentProfit.toFixed(2)}) for requested withdrawal of $${amount.toFixed(2)}.`);
    }

    const newProfit = currentProfit - amount;

    // 1. Deduct profit balance from user
    transaction.update(userRef, {
      profit: newProfit,
      demoProfitLoss: newProfit,
      updatedAt: now
    });

    // 2. Mark code as used
    transaction.update(targetCodeRef, {
      status: 'used',
      usedAt: now,
      usedBy: userId,
      usedByEmail: userEmail,
      withdrawalRequestId: reqId
    });

    // 3. Create the withdrawal request document with code verification references
    const withdrawalDocPayload: WithdrawalRequest = {
      id: reqId,
      userId,
      userEmail,
      userName: userName || 'Demo Trader',
      method,
      amount,
      status: 'pending',
      createdAt: now,
      withdrawalCodeId: codeDocSnap.id,
      withdrawalCodeVerified: true,
      codeVerifiedAt: now
    };
    transaction.set(withdrawalReqRef, withdrawalDocPayload);
  });

  // Post-transaction operations: Audit log & User/Admin notifications
  await writeAuditLog(
    userId,
    userEmail,
    'CONSUME_WITHDRAWAL_CODE',
    'WITHDRAWAL_CODE',
    codeDocSnap.id,
    `Code slot ${codeData.slotNumber} consumed for withdrawal request ${reqId} ($${amount.toLocaleString()})`
  );

  await sendNotification(
    userId,
    'Withdrawal Request Submitted',
    `Your withdrawal request for $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been submitted successfully with code authorization.`,
    'withdrawal',
    'info',
    amount
  );

  return { withdrawalId: reqId, codeId: codeDocSnap.id };
}

/**
 * Verify an entered withdrawal code for a specific slot (1 or 2).
 * Does not consume the code; returns code doc ID if valid.
 */
export async function verifyWithdrawalCodeSlot(params: {
  userId: string;
  userEmail: string;
  enteredCode: string;
  slotNumber: 1 | 2;
}): Promise<{ valid: boolean; codeDocId: string }> {
  const { userId, userEmail, enteredCode, slotNumber } = params;
  const cleanCode = enteredCode.trim();
  if (!cleanCode || !/^\d{6}$/.test(cleanCode)) {
    throw new Error(`Invalid Authorization Code ${slotNumber}. Please enter a valid 6-digit numeric code.`);
  }

  const enteredHash = await hashCode(cleanCode);

  const codesQuery = query(
    collection(db, 'withdrawalCodes'),
    where('codeHash', '==', enteredHash),
    where('slotNumber', '==', slotNumber)
  );
  const snap = await getDocs(codesQuery);

  if (snap.empty) {
    await writeAuditLog(
      userId,
      userEmail,
      'FAILED_WITHDRAWAL_ATTEMPT',
      'WITHDRAWAL_CODE',
      'UNKNOWN',
      `User ${userEmail} entered invalid code for Slot ${slotNumber}.`
    );
    throw new Error(`Incorrect Authorization Code ${slotNumber}. Please verify the code and try again.`);
  }

  const codeDocSnap = snap.docs[0];
  const codeData = codeDocSnap.data() as WithdrawalCode;

  if (codeData.status === 'used') {
    throw new Error(`Authorization Code ${slotNumber} has already been used.`);
  }
  if (codeData.status === 'revoked') {
    throw new Error(`Authorization Code ${slotNumber} is no longer valid.`);
  }
  if (codeData.status !== 'active') {
    throw new Error(`Authorization code for Slot ${slotNumber} is currently unavailable.`);
  }
  if (codeData.assignedUserId && codeData.assignedUserId !== userId) {
    throw new Error(`Authorization Code ${slotNumber} is not assigned to your account.`);
  }

  return { valid: true, codeDocId: codeDocSnap.id };
}

/**
 * Validates both withdrawal codes and creates a withdrawal request atomically.
 * Deducts balance, marks both codes as used, and creates withdrawal request with destination details.
 */
export async function processClientWithdrawalWithTwoCodes(params: {
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  method: string;
  accountHolderName: string;
  financialInstitution: string;
  code1Id: string;
  code2Id: string;
}): Promise<{ withdrawalId: string }> {
  const { userId, userEmail, userName, amount, method, accountHolderName, financialInstitution, code1Id, code2Id } = params;

  const code1Ref = doc(db, 'withdrawalCodes', code1Id);
  const code2Ref = doc(db, 'withdrawalCodes', code2Id);
  const userRef = doc(db, 'users', userId);
  const reqId = 'with_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const withdrawalReqRef = doc(db, 'withdrawalRequests', reqId);
  const now = new Date().toISOString();

  await runTransaction(db, async (transaction) => {
    // 1. Verify Code 1
    const freshCode1Snap = await transaction.get(code1Ref);
    if (!freshCode1Snap.exists()) throw new Error('Authorization Code 1 record not found.');
    const freshCode1 = freshCode1Snap.data() as WithdrawalCode;
    if (freshCode1.status !== 'active') throw new Error('Authorization Code 1 is no longer active.');
    if (freshCode1.assignedUserId && freshCode1.assignedUserId !== userId) throw new Error('Authorization Code 1 not assigned to user.');

    // 2. Verify Code 2
    const freshCode2Snap = await transaction.get(code2Ref);
    if (!freshCode2Snap.exists()) throw new Error('Authorization Code 2 record not found.');
    const freshCode2 = freshCode2Snap.data() as WithdrawalCode;
    if (freshCode2.status !== 'active') throw new Error('Authorization Code 2 is no longer active.');
    if (freshCode2.assignedUserId && freshCode2.assignedUserId !== userId) throw new Error('Authorization Code 2 not assigned to user.');

    // 3. Verify User profit balance
    const freshUserSnap = await transaction.get(userRef);
    if (!freshUserSnap.exists()) throw new Error('User profile record not found.');
    const userData = freshUserSnap.data();
    const currentProfit = Number(userData.profit ?? userData.demoProfitLoss ?? 0);

    if (amount > currentProfit) {
      throw new Error(`Insufficient profit balance ($${currentProfit.toFixed(2)}) for requested withdrawal of $${amount.toFixed(2)}.`);
    }

    const newProfit = currentProfit - amount;

    // Execute atomic updates
    transaction.update(userRef, {
      profit: newProfit,
      demoProfitLoss: newProfit,
      updatedAt: now
    });

    transaction.update(code1Ref, {
      status: 'used',
      usedAt: now,
      usedBy: userId,
      usedByEmail: userEmail,
      withdrawalRequestId: reqId
    });

    transaction.update(code2Ref, {
      status: 'used',
      usedAt: now,
      usedBy: userId,
      usedByEmail: userEmail,
      withdrawalRequestId: reqId
    });

    const withdrawalDocPayload: WithdrawalRequest = {
      id: reqId,
      userId,
      userEmail,
      userName: userName || 'Demo Trader',
      method,
      amount,
      status: 'pending',
      createdAt: now,
      withdrawalCodeId: code1Id,
      withdrawalCode1Id: code1Id,
      withdrawalCode2Id: code2Id,
      withdrawalCodeVerified: true,
      codeVerifiedAt: now,
      accountHolderName,
      financialInstitution
    };

    transaction.set(withdrawalReqRef, withdrawalDocPayload);
  });

  // Audit Log & Notification
  await writeAuditLog(
    userId,
    userEmail,
    'CONSUME_TWO_WITHDRAWAL_CODES',
    'WITHDRAWAL_CODE',
    reqId,
    `Codes ${code1Id} and ${code2Id} consumed for withdrawal request ${reqId} ($${amount.toLocaleString()})`
  );

  await sendNotification(
    userId,
    'Withdrawal Request Submitted',
    `Your withdrawal request for $${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been submitted successfully with dual code verification.`,
    'withdrawal',
    'info',
    amount
  );

  return { withdrawalId: reqId };
}

// -------------------------------------------------------------
// BROADCAST MANAGEMENT SERVICES
// -------------------------------------------------------------

export async function sendBroadcastNotification(params: {
  title: string;
  message: string;
  recipientType: 'all' | 'specific';
  targetUserId?: string;
  adminUid: string;
  adminEmail: string;
  type?: 'deposit' | 'withdrawal' | 'loan' | 'system' | 'announcement';
}): Promise<{ broadcastId: string; recipientCount: number }> {
  const { title, message, recipientType, targetUserId, adminUid, adminEmail, type } = params;

  // Trim title & message
  const cleanTitle = title.trim();
  const cleanMessage = message.trim();

  if (!cleanTitle) {
    throw new Error('Broadcast title is required.');
  }
  if (!cleanMessage) {
    throw new Error('Broadcast message content is required.');
  }

  // Generate Broadcast Record ID
  const broadcastId = 'bc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
  const sentAt = new Date().toISOString();

  let targetUsers: UserProfile[] = [];
  if (recipientType === 'specific') {
    if (!targetUserId) {
      throw new Error('Specific user ID must be provided.');
    }
    const userDocRef = doc(db, 'users', targetUserId);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      throw new Error(`Target user with ID ${targetUserId} was not found.`);
    }
    targetUsers = [userSnap.data() as UserProfile];
  } else {
    // Fetch all registered users
    const snap = await getDocs(collection(db, 'users'));
    snap.forEach((d) => {
      targetUsers.push(d.data() as UserProfile);
    });
  }

  if (targetUsers.length === 0) {
    throw new Error('No eligible user recipients found for broadcast.');
  }

  // Create notifications in batch/sequential writes
  let deliveredCount = 0;
  for (const recipient of targetUsers) {
    const notifId = 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const notification: AppNotification = {
      id: notifId,
      userId: recipient.uid,
      title: cleanTitle,
      message: cleanMessage,
      type: type || 'announcement',
      status: 'info',
      read: false,
      createdAt: sentAt,
      senderAdminId: adminUid,
      broadcastId: broadcastId
    };
    try {
      await setDoc(doc(db, 'notifications', notifId), notification);
      deliveredCount++;
    } catch (err) {
      console.warn(`Failed to deliver broadcast to user ${recipient.uid}:`, err);
    }
  }

  const targetUser = recipientType === 'specific' ? targetUsers[0] : undefined;

  // Create Broadcast History Record
  const broadcastRecord: BroadcastRecord = {
    id: broadcastId,
    title: cleanTitle,
    message: cleanMessage,
    recipientType,
    targetUserId: targetUser?.uid,
    targetUserEmail: targetUser?.email,
    targetUserName: targetUser?.fullName,
    recipientCount: deliveredCount,
    sentAt,
    sentByAdminId: adminUid,
    sentByAdminEmail: adminEmail
  };

  try {
    await setDoc(doc(db, 'broadcasts', broadcastId), broadcastRecord);
  } catch (err) {
    console.warn('Failed to record broadcast history log:', err);
  }

  // Record Audit Log
  await writeAuditLog(
    adminUid,
    adminEmail,
    'SEND_ADMIN_BROADCAST',
    'BROADCAST',
    broadcastId,
    `Sent broadcast "${cleanTitle}" to ${recipientType === 'all' ? 'All Users' : targetUser?.email} (${deliveredCount} delivered)`
  );

  return { broadcastId, recipientCount: deliveredCount };
}

// Fetch Broadcast History
export async function fetchBroadcastHistory(): Promise<BroadcastRecord[]> {
  return SyncLogger.profile('Admin: Fetch Broadcast History', async () => {
    const snap = await getDocs(collection(db, 'broadcasts'));
    const list: BroadcastRecord[] = [];
    snap.forEach((d) => {
      list.push(d.data() as BroadcastRecord);
    });
    return list.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, { path: 'broadcasts', userId: auth.currentUser?.uid || 'local_session' });
}

