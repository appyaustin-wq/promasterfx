export type AssetCategory = 'Forex' | 'Crypto' | 'Commodities' | 'Indices' | 'Stocks' | 'ETFs';

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change24h: number; // percentage, e.g. +2.5 or -1.2
  high24h: number;
  low24h: number;
  volume24h?: string;
  active: boolean;
  status?: string;
  sparkline?: number[];
  assetClass?: string;
}

export type OrderDirection = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop';
export type OrderStatus = 'open' | 'completed' | 'cancelled';

export interface DemoOrder {
  id: string;
  userId: string;
  symbol: string;
  assetName: string;
  category: AssetCategory;
  direction: OrderDirection;
  orderType: OrderType;
  quantity: number; // units or amount
  leverage: number; // e.g. 1, 2, 5, 10, 25, 50, 100
  duration?: string; // 1m, 5m, 15m, 1h, etc.
  price: number;
  totalAmount: number; // USD position value
  marginRequired: number;
  status: OrderStatus;
  stopLoss?: number;
  takeProfit?: number;
  createdAt: string;
}

export type PositionStatus = 'open' | 'closed';

export interface DemoPosition {
  id: string;
  userId: string;
  symbol: string;
  assetName: string;
  category: AssetCategory;
  direction: OrderDirection;
  quantity: number;
  leverage: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  margin: number;
  status: PositionStatus;
  openedAt: string;
  closedAt?: string;
  stopLoss?: number;
  takeProfit?: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  fullLegalName?: string;
  financialInstitution?: string;
  username: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
  preferredCurrency: string;
  role: 'user' | 'admin';
  demoBalance: number;
  demoEquity: number;
  demoProfitLoss: number;
  verified: boolean;
  kycSubmitted?: boolean;
  createdAt: string;
  updatedAt: string;
  profit?: number;
  referralBonus?: number;
  bonus?: number;
  signupBonusUSD?: number;
  signupBonusConverted?: number;
  accountStatus?: 'Active' | 'Suspended' | 'Restricted' | 'Pending';
  investmentPlan?: string;
  tradeMode?: 'ON' | 'OFF' | boolean;
  kycStatus?: 'Verified' | 'Pending' | 'Unverified' | 'Rejected';
  adminNotes?: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  marketId: string;
  symbol: string;
  addedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: 'order_created' | 'position_closed' | 'login' | 'deposit' | 'withdrawal' | 'profile_update' | 'admin_action';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
}

export interface PreIPOShare {
  id: string;
  name: string;
  symbol: string;
  sharePrice: number;
  priceChange: number;
  availableShares: number;
  totalShares: number;
  featured: boolean;
  status: 'Open' | 'Upcoming' | 'Closed';
}

export interface StockShare {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: string;
}

export type DepositStatus = 'pending' | 'approved' | 'rejected';

export interface DepositOption {
  id: string;
  name: string;
  symbol: string;
  subtitle: string;
  address: string;
  iconType: string;
  iconColor?: string;
  iconBg?: string;
  enabled?: boolean;
}

export interface DepositRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  method: string;
  methodId: string;
  amount: number;
  status: DepositStatus;
  txHashOrProof?: string;
  proofUrl?: string;
  notes?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'deposit' | 'withdrawal' | 'loan' | 'system' | 'announcement';
  status: 'approved' | 'rejected' | 'info';
  amount?: number;
  read: boolean;
  createdAt: string;
  senderAdminId?: string;
  broadcastId?: string;
}

export interface BroadcastRecord {
  id: string;
  title: string;
  message: string;
  recipientType: 'all' | 'specific';
  targetUserId?: string;
  targetUserEmail?: string;
  targetUserName?: string;
  recipientCount: number;
  sentAt: string;
  sentByAdminId: string;
  sentByAdminEmail: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  method: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  withdrawalCodeId?: string;
  withdrawalCode1Id?: string;
  withdrawalCode2Id?: string;
  withdrawalCodeVerified?: boolean;
  codeVerifiedAt?: string;
  accountHolderName?: string;
  financialInstitution?: string;
}

export type WithdrawalCodeStatus = 'active' | 'used' | 'revoked' | 'expired';

export interface WithdrawalCode {
  id: string; // Document ID (e.g. code_...)
  code: string; // Displayed to admin in admin dashboard
  codeHash: string; // SHA-256 hash for secure matching
  status: WithdrawalCodeStatus;
  assignedUserId?: string; // Optional assignment to a specific user
  assignedUserName?: string;
  assignedUserEmail?: string;
  slotNumber: 1 | 2; // Fixed slots: Slot 1 or Slot 2
  createdAt: string;
  createdBy: string;
  usedAt?: string;
  usedBy?: string; // userId who consumed the code
  usedByEmail?: string;
  withdrawalRequestId?: string;
  revokedAt?: string;
  revokedBy?: string;
}

export interface LoanApplication {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planName: string;
  amount: number;
  durationMonths: number;
  monthlyPayment: number;
  totalRepayment: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedAt: string;
  notes?: string;
  processedAt?: string;
  processedBy?: string;
}


