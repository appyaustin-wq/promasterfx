import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MarketAsset, UserProfile, DemoOrder, DemoPosition, DepositRequest, DepositOption, WithdrawalRequest, WithdrawalCode, BroadcastRecord } from '../../types';
import { UserManagementView } from '../../components/admin/UserManagementView';
import { WithdrawalCodesTab } from '../../components/admin/WithdrawalCodesTab';
import { ManualDepositTab } from '../../components/admin/ManualDepositTab';
import { BroadcastTab } from '../../components/admin/BroadcastTab';
import { 
  fetchAllUsers, 
  updateUserBalance, 
  updateUserStatus, 
  updateUserRole, 
  fetchAllOrders, 
  fetchAllPositions, 
  fetchAuditLogs, 
  saveDemoMarket, 
  deleteDemoMarket, 
  fetchPlatformSettings, 
  savePlatformSettings, 
  fetchAllDepositRequests,
  approveDepositRequest,
  rejectDepositRequest,
  fetchPaymentMethods,
  savePaymentMethod,
  deletePaymentMethod,
  fetchAllWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  fetchAllWithdrawalCodes,
  generateWithdrawalCode,
  generateBothWithdrawalCodes,
  revokeWithdrawalCode,
  assignWithdrawalCodeToUser,
  sendBroadcastNotification,
  fetchBroadcastHistory,
  AuditLogEntry, 
  PlatformSettingsData 
} from '../../services/adminService';
import { 
  Shield, 
  Users, 
  BarChart2, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Search, 
  Filter, 
  RefreshCw, 
  ListOrdered, 
  TrendingUp, 
  FileText, 
  Sliders, 
  Eye, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  UserCheck, 
  UserX, 
  Lock, 
  Unlock,
  MessageSquare,
  Send,
  MessageCircle,
  Clock,
  ArrowUpCircle,
  Key,
  Copy,
  Check,
  Megaphone
} from 'lucide-react';

type AdminTab = 'overview' | 'users' | 'broadcast' | 'deposits' | 'manual_deposit' | 'withdrawals' | 'withdrawal_codes' | 'payment_methods' | 'markets' | 'orders' | 'positions' | 'audit' | 'settings';

export const AdminDashboardPage: React.FC = () => {
  const { markets, userProfile, currentUser, adminUpdateMarket } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Sourced Data
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [ordersList, setOrdersList] = useState<DemoOrder[]>([]);
  const [positionsList, setPositionsList] = useState<DemoPosition[]>([]);
  const [depositRequestsList, setDepositRequestsList] = useState<DepositRequest[]>([]);
  const [withdrawalRequestsList, setWithdrawalRequestsList] = useState<WithdrawalRequest[]>([]);
  const [withdrawalCodesList, setWithdrawalCodesList] = useState<WithdrawalCode[]>([]);
  const [paymentMethodsList, setPaymentMethodsList] = useState<DepositOption[]>([]);
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastRecord[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<AuditLogEntry[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettingsData>({
    maintenanceMode: false,
    defaultDemoBalance: 10000,
    platformNotice: 'Promaster FX Demo Platform Active'
  });

  // Payment Methods Modal/Form State
  const [selectedMethodModal, setSelectedMethodModal] = useState<DepositOption | null>(null);
  const [isNewMethodModal, setIsNewMethodModal] = useState<boolean>(false);
  const [methodForm, setMethodForm] = useState<DepositOption>({
    id: '',
    name: '',
    symbol: '',
    subtitle: 'Upload payment proof for quick verification',
    address: '',
    iconType: 'btc',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-400/10 border-amber-400/20',
    enabled: true
  });

  // User Management State
  const [userSearch, setUserSearch] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editBalanceVal, setEditBalanceVal] = useState<string>('');
  const [depositSearch, setDepositSearch] = useState<string>('');
  const [withdrawalSearch, setWithdrawalSearch] = useState<string>('');

  // Withdrawal Codes State
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [generatingSlot, setGeneratingSlot] = useState<number | null>(null);
  const [selectedUserForCode, setSelectedUserForCode] = useState<string>('');

  // Market Management State
  const [selectedMarket, setSelectedMarket] = useState<MarketAsset | null>(null);
  const [isNewMarketModal, setIsNewMarketModal] = useState<boolean>(false);
  const [marketForm, setMarketForm] = useState<{
    id: string;
    symbol: string;
    name: string;
    category: MarketAsset['category'];
    price: string;
    change24h: string;
    high24h: string;
    low24h: string;
    active: boolean;
  }>({
    id: '',
    symbol: '',
    name: '',
    category: 'forex',
    price: '1.0000',
    change24h: '0.00',
    high24h: '1.0500',
    low24h: '0.9900',
    active: true
  });

  // Filter States for Orders & Positions
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [positionSearch, setPositionSearch] = useState<string>('');
  const [auditSearch, setAuditSearch] = useState<string>('');

  const adminUid = currentUser?.uid || 'system_admin';
  const adminEmail = currentUser?.email || 'admin@promasterfx.com';

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg('');
  };

  // Load All Admin Data
  const loadData = async () => {
    setLoading(true);
    setErrorMsg('');
    const startTime = performance.now();
    console.log('%c[Admin Data Sync] 🔄 Admin metrics retrieval initiated...', 'color: #a855f7; font-weight: bold;');
    try {
      const [u, o, p, a, s, d, m, w, wc, bc] = await Promise.all([
        fetchAllUsers().catch(err => {
          console.error('[Admin Data Sync] ❌ Failed to fetch users:', err);
          return [] as UserProfile[];
        }),
        fetchAllOrders().catch(err => {
          console.error('[Admin Data Sync] ❌ Failed to fetch orders:', err);
          return [] as DemoOrder[];
        }),
        fetchAllPositions().catch(err => {
          console.error('[Admin Data Sync] ❌ Failed to fetch positions:', err);
          return [] as DemoPosition[];
        }),
        fetchAuditLogs().catch(err => {
          console.error('[Admin Data Sync] ❌ Failed to fetch audit logs:', err);
          return [] as AuditLogEntry[];
        }),
        fetchPlatformSettings().catch(err => {
          console.error('[Admin Data Sync] ❌ Failed to fetch platform settings:', err);
          return {
            maintenanceMode: false,
            defaultDemoBalance: 10000,
            platformNotice: 'Promaster FX Demo Platform Active'
          } as PlatformSettingsData;
        }),
        fetchAllDepositRequests().catch(err => {
          console.error('[Admin Data Sync] ❌ Failed to fetch deposit requests:', err);
          return [] as DepositRequest[];
        }),
        fetchPaymentMethods().catch(err => {
          console.error('[Admin Data Sync] ❌ Failed to fetch payment methods:', err);
          return [] as DepositOption[];
        }),
        fetchAllWithdrawalRequests().catch(err => {
          console.error('[Admin Data Sync] ❌ Failed to fetch withdrawal requests:', err);
          return [] as WithdrawalRequest[];
        }),
        fetchAllWithdrawalCodes().catch(err => {
          console.error('[Admin Data Sync] ❌ Failed to fetch withdrawal codes:', err);
          return [] as WithdrawalCode[];
        }),
        fetchBroadcastHistory().catch(err => {
          console.error('[Admin Data Sync] ❌ Failed to fetch broadcast history:', err);
          return [] as BroadcastRecord[];
        })
      ]);

      const duration = (performance.now() - startTime).toFixed(1);
      console.groupCollapsed(`%c[Admin Data Sync] ✅ Load complete in ${duration}ms`, 'color: #10b981; font-weight: bold;');
      console.log(`- Users count: ${u.length}`);
      console.log(`- Orders count: ${o.length}`);
      console.log(`- Positions count: ${p.length}`);
      console.log(`- Deposit requests count: ${d.length}`);
      console.log(`- Withdrawal requests count: ${w.length}`);
      console.log(`- Withdrawal codes count: ${wc.length}`);
      console.log(`- Broadcast history count: ${bc.length}`);
      console.log(`- Payment methods count: ${m.length}`);
      console.log(`- Audit logs count: ${a.length}`);
      console.groupEnd();

      // Warning metrics if core directories/collections are empty
      if (u.length === 0) {
        console.warn('%c[Admin Data Sync] ⚠️ Warning: "users" collection is completely empty. No user accounts registered.', 'color: #f59e0b; font-weight: bold;');
      }

      setUsersList(u);
      setOrdersList(o);
      setPositionsList(p);
      setAuditLogsList(a);
      setPlatformSettings(s);
      setDepositRequestsList(d);
      setPaymentMethodsList(m);
      setWithdrawalRequestsList(w);
      setWithdrawalCodesList(wc);
      setBroadcastHistory(bc);
    } catch (err: any) {
      console.error('[Admin Data Sync] 🔥 Fatal load exception:', err);
      showError(err.message || 'Failed to load administrative records from Firestore');
    } finally {
      setLoading(false);
    }
  };

  // Payment Method Management Handlers
  const handleOpenNewMethod = () => {
    setMethodForm({
      id: 'crypto_' + Date.now().toString(36),
      name: '',
      symbol: '',
      subtitle: 'Upload payment proof for quick verification',
      address: '',
      iconType: 'btc',
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-400/10 border-amber-400/20',
      enabled: true
    });
    setIsNewMethodModal(true);
    setSelectedMethodModal(null);
  };

  const handleOpenEditMethod = (opt: DepositOption) => {
    setMethodForm({ ...opt });
    setSelectedMethodModal(opt);
    setIsNewMethodModal(false);
  };

  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!methodForm.name.trim() || !methodForm.address.trim()) {
      showError('Please enter a valid method name and payment address / details.');
      return;
    }
    try {
      await savePaymentMethod(methodForm, adminUid, adminEmail);
      showSuccess(`Payment method '${methodForm.name}' saved successfully.`);
      setIsNewMethodModal(false);
      setSelectedMethodModal(null);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to save payment method');
    }
  };

  const handleDeleteMethod = async (optionId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete payment method '${name}'?`)) return;
    try {
      await deletePaymentMethod(optionId, adminUid, adminEmail);
      showSuccess(`Deleted payment method '${name}'.`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete payment method');
    }
  };

  const handleApproveDeposit = async (req: DepositRequest) => {
    try {
      await approveDepositRequest(req.id, req.userId, req.amount, adminUid, adminEmail);
      showSuccess(`Approved deposit of $${req.amount.toLocaleString()} for ${req.userEmail}`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Error approving deposit');
    }
  };

  const handleRejectDeposit = async (req: DepositRequest) => {
    const reason = window.prompt('Reason for rejecting deposit:', 'Payment proof unverified');
    if (reason === null) return;
    try {
      await rejectDepositRequest(req.id, adminUid, adminEmail, reason);
      showSuccess(`Rejected deposit request ${req.id}`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Error rejecting deposit');
    }
  };

  const handleApproveWithdrawal = async (req: WithdrawalRequest) => {
    try {
      await approveWithdrawalRequest(req.id, req.userId, req.amount, adminUid, adminEmail);
      showSuccess(`Approved withdrawal of $${req.amount.toLocaleString()} for ${req.userEmail}`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Error approving withdrawal');
    }
  };

  const handleRejectWithdrawal = async (req: WithdrawalRequest) => {
    const reason = window.prompt('Reason for rejecting withdrawal:', 'Withdrawal criteria not met');
    if (reason === null) return;
    try {
      await rejectWithdrawalRequest(req.id, adminUid, adminEmail, reason);
      showSuccess(`Rejected withdrawal request ${req.id}`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Error rejecting withdrawal');
    }
  };

  // Handlers: Authorization Code Management
  const handleGenerateCode = async (slot: 1 | 2) => {
    setGeneratingSlot(slot);
    try {
      let targetUser = undefined;
      if (selectedUserForCode) {
        const u = usersList.find(usr => usr.uid === selectedUserForCode);
        if (u) {
          targetUser = { uid: u.uid, fullName: u.fullName, email: u.email };
        }
      }
      const newCode = await generateWithdrawalCode(slot, targetUser, adminUid, adminEmail);
      showSuccess(`Generated active 6-digit authorization code for Slot ${slot}: ${newCode.code}`);
      loadData();
    } catch (err: any) {
      showError(err.message || `Error generating code for Slot ${slot}`);
    } finally {
      setGeneratingSlot(null);
    }
  };

  const handleGenerateBothCodes = async () => {
    setGeneratingSlot(3);
    try {
      const codes = await generateBothWithdrawalCodes(adminUid, adminEmail);
      showSuccess(`Successfully generated and refreshed both authorization codes (Slot 1 & Slot 2)`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Error generating authorization codes');
    } finally {
      setGeneratingSlot(null);
    }
  };

  const handleRevokeCode = async (code: WithdrawalCode) => {
    const confirmRevoke = window.confirm(`Are you sure you want to revoke authorization code ${code.code} for Slot ${code.slotNumber}? It will immediately become invalid.`);
    if (!confirmRevoke) return;
    try {
      await revokeWithdrawalCode(code.id, adminUid, adminEmail, 'Administrative revocation from dashboard');
      showSuccess(`Revoked authorization code for Slot ${code.slotNumber}`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Error revoking authorization code');
    }
  };

  const handleAssignCode = async (codeId: string, userId: string) => {
    if (!userId) return;
    const u = usersList.find(usr => usr.uid === userId);
    if (!u) return;
    try {
      await assignWithdrawalCodeToUser(
        codeId,
        { uid: u.uid, fullName: u.fullName, email: u.email },
        adminUid,
        adminEmail
      );
      showSuccess(`Assigned authorization code to ${u.email}`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Error assigning authorization code');
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2000);
  };

  useEffect(() => {
    if (currentUser && userProfile?.role === 'admin') {
      loadData();
    } else {
      setLoading(false);
    }
  }, [currentUser, userProfile?.role, refreshKey]);

  // Handlers: User Management
  const handleUpdateBalance = async (uid: string) => {
    const amt = parseFloat(editBalanceVal);
    if (isNaN(amt) || amt < 0) {
      showError('Please enter a valid non-negative demo balance amount');
      return;
    }
    try {
      await updateUserBalance(uid, amt, adminUid, adminEmail);
      showSuccess(`Updated demo balance to $${amt.toLocaleString()} for user`);
      setSelectedUser(null);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      showError(err.message || 'Error updating user demo balance');
    }
  };

  const handleToggleUserStatus = async (user: UserProfile) => {
    try {
      await updateUserStatus(user.uid, !user.verified, adminUid, adminEmail);
      showSuccess(`User status updated to ${!user.verified ? 'Verified' : 'Unverified'}`);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      showError(err.message || 'Error updating user status');
    }
  };

  const handleToggleUserRole = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRole(user.uid, newRole, adminUid, adminEmail);
      showSuccess(`User role updated to ${newRole.toUpperCase()}`);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      showError(err.message || 'Error updating user role');
    }
  };

  // Handlers: Market Management
  const handleOpenMarketModal = (m?: MarketAsset) => {
    if (m) {
      setSelectedMarket(m);
      setIsNewMarketModal(false);
      setMarketForm({
        id: m.id,
        symbol: m.symbol,
        name: m.name,
        category: m.category,
        price: m.price.toString(),
        change24h: m.change24h.toString(),
        high24h: m.high24h.toString(),
        low24h: m.low24h.toString(),
        active: m.active
      });
    } else {
      setSelectedMarket(null);
      setIsNewMarketModal(true);
      setMarketForm({
        id: 'mkt_' + Date.now(),
        symbol: 'NEW/USD',
        name: 'New Asset',
        category: 'forex',
        price: '1.0000',
        change24h: '0.00',
        high24h: '1.0500',
        low24h: '0.9500',
        active: true
      });
    }
  };

  const handleSaveMarket = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(marketForm.price);
    const c = parseFloat(marketForm.change24h);
    const h = parseFloat(marketForm.high24h);
    const l = parseFloat(marketForm.low24h);

    if (isNaN(p) || p <= 0) {
      showError('Please enter a valid market price');
      return;
    }

    const updatedMarket: MarketAsset = {
      id: marketForm.id || marketForm.symbol.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      symbol: marketForm.symbol.toUpperCase(),
      name: marketForm.name,
      category: marketForm.category,
      price: p,
      change24h: isNaN(c) ? 0 : c,
      high24h: isNaN(h) ? p * 1.05 : h,
      low24h: isNaN(l) ? p * 0.95 : l,
      active: marketForm.active,
      assetClass: marketForm.category
    };

    try {
      await saveDemoMarket(updatedMarket, isNewMarketModal, adminUid, adminEmail);
      await adminUpdateMarket(updatedMarket);
      showSuccess(`Market asset ${updatedMarket.symbol} saved successfully`);
      setSelectedMarket(null);
      setIsNewMarketModal(false);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      showError(err.message || 'Error saving market asset');
    }
  };

  const handleDeleteMarket = async (marketId: string, symbol: string) => {
    if (!window.confirm(`Are you sure you want to delete demo market ${symbol}?`)) return;
    try {
      await deleteDemoMarket(marketId, symbol, adminUid, adminEmail);
      showSuccess(`Deleted market asset ${symbol}`);
      setRefreshKey(k => k + 1);
    } catch (err: any) {
      showError(err.message || 'Error deleting market asset');
    }
  };

  // Handlers: Platform Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePlatformSettings(platformSettings, adminUid, adminEmail);
      showSuccess('Platform configuration saved to Firestore');
    } catch (err: any) {
      showError(err.message || 'Error saving platform settings');
    }
  };

  // Filtered Lists
  const filteredUsers = usersList.filter(u => 
    u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.uid?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredOrders = ordersList.filter(o => 
    o.symbol?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.userId?.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.id?.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredPositions = positionsList.filter(p => 
    p.symbol?.toLowerCase().includes(positionSearch.toLowerCase()) ||
    p.userId?.toLowerCase().includes(positionSearch.toLowerCase()) ||
    p.id?.toLowerCase().includes(positionSearch.toLowerCase())
  );

  const filteredAuditLogs = auditLogsList.filter(a => 
    a.action?.toLowerCase().includes(auditSearch.toLowerCase()) ||
    a.adminEmail?.toLowerCase().includes(auditSearch.toLowerCase()) ||
    a.details?.toLowerCase().includes(auditSearch.toLowerCase()) ||
    a.targetId?.toLowerCase().includes(auditSearch.toLowerCase())
  );

  const renderSkeleton = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-pulse">
            {/* Pulsing Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#111622] border border-[#1e2638] p-5 rounded-2xl shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-slate-800 rounded-full" />
                    <div className="w-4 h-4 bg-slate-800 rounded-full" />
                  </div>
                  <div className="h-7 w-12 bg-slate-800 rounded-lg" />
                  <div className="h-3 w-32 bg-slate-800/60 rounded-full" />
                </div>
              ))}
            </div>
            {/* Pulsing Quick Actions */}
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="h-4 w-48 bg-slate-800 rounded-full" />
              <div className="flex flex-wrap gap-3">
                <div className="h-8 w-36 bg-slate-800 rounded-xl" />
                <div className="h-8 w-40 bg-slate-800 rounded-xl" />
                <div className="h-8 w-32 bg-slate-800 rounded-xl" />
              </div>
            </div>
            {/* Pulsing Table Log Preview */}
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 w-40 bg-slate-800 rounded-full" />
                <div className="h-4 w-20 bg-slate-800 rounded-full" />
              </div>
              <div className="space-y-2.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-[#1e2638]">
                    <div className="space-y-1.5 w-1/3">
                      <div className="h-3 w-full bg-slate-800 rounded-full" />
                      <div className="h-2 w-1/2 bg-slate-800/60 rounded-full" />
                    </div>
                    <div className="h-3 w-16 bg-slate-800 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6 animate-pulse">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="h-10 w-full sm:max-w-xs bg-slate-800 rounded-xl" />
              <div className="h-10 w-24 bg-slate-800 rounded-xl" />
            </div>
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl overflow-hidden shadow-xl">
              <div className="bg-[#182030] p-4 h-11" />
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3 w-1/3">
                      <div className="w-10 h-10 bg-slate-800 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 w-full bg-slate-800 rounded-full" />
                        <div className="h-2 w-1/2 bg-slate-800/60 rounded-full" />
                      </div>
                    </div>
                    <div className="h-3 w-20 bg-slate-800 rounded-full" />
                    <div className="h-3 w-24 bg-slate-800 rounded-full" />
                    <div className="h-6 w-16 bg-slate-800 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        // Generic List Skeleton
        return (
          <div className="space-y-4 animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 w-32 bg-slate-800 rounded-full" />
              <div className="h-4 w-24 bg-slate-800 rounded-full" />
            </div>
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-3.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#1e2638] last:border-0">
                  <div className="space-y-1.5 w-1/4">
                    <div className="h-3 w-full bg-slate-800 rounded-full" />
                    <div className="h-2 w-2/3 bg-slate-800/60 rounded-full" />
                  </div>
                  <div className="h-3 w-20 bg-slate-800 rounded-full" />
                  <div className="h-3 w-16 bg-slate-800 rounded-full" />
                  <div className="h-6 w-20 bg-slate-800 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 box-border overflow-x-hidden">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-rose-950/40 via-[#111622] to-[#0a0d14] border border-rose-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full max-w-full min-w-0 box-border">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 shadow-inner flex-shrink-0 shrink-0">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight break-words min-w-0">Admin Control Center</h1>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 font-extrabold px-2.5 py-0.5 rounded-full border border-rose-500/30 flex-shrink-0 shrink-0 whitespace-nowrap">
                VERIFIED ADMIN
              </span>
            </div>
            <p className="text-xs text-rose-300/80 mt-0.5 break-words min-w-0">
              Role-based platform parameters, user accounts, trade orders, and immutable audit logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            disabled={loading}
            className="px-3 py-2 bg-[#182030] hover:bg-[#202b40] text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-[#2e3b54] flex items-center gap-1.5 transition-all shadow flex-shrink-0 shrink-0 whitespace-nowrap"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs flex items-center justify-between shadow-lg w-full max-w-full min-w-0 box-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 flex-shrink-0" />
            <span className="font-semibold break-words min-w-0">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-slate-400 hover:text-white shrink-0 ml-2">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs flex items-center justify-between shadow-lg w-full max-w-full min-w-0 box-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 flex-shrink-0" />
            <span className="font-semibold break-words min-w-0">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-slate-400 hover:text-white shrink-0 ml-2">✕</button>
        </div>
      )}

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 bg-[#111622] border border-[#1e2638] p-1.5 rounded-2xl overflow-x-auto text-xs font-bold scrollbar-none w-full max-w-full min-w-0 box-border">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 shrink-0 ${
            activeTab === 'overview' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
          }`}
        >
          <BarChart2 className="w-4 h-4" /> Dashboard Overview
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 shrink-0 ${
            activeTab === 'users' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
          }`}
        >
          <Users className="w-4 h-4" /> Users ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 shrink-0 ${
            activeTab === 'broadcast' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
          }`}
        >
          <Megaphone className="w-4 h-4 text-amber-400" /> Broadcast
        </button>

        <button
          onClick={() => setActiveTab('deposits')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 shrink-0 ${
            activeTab === 'deposits' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
          }`}
        >
          <DollarSign className="w-4 h-4 text-amber-400" /> Deposit Approvals ({depositRequestsList.length})
          {depositRequestsList.filter(d => d.status === 'pending').length > 0 && (
            <span className="bg-amber-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 shrink-0">
              {depositRequestsList.filter(d => d.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('manual_deposit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 shrink-0 ${
            activeTab === 'manual_deposit' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
          }`}
        >
          <Plus className="w-4 h-4 text-emerald-400" /> Fund User / Manual Deposit
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 shrink-0 ${
            activeTab === 'withdrawals' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
          }`}
        >
          <ArrowUpCircle className="w-4 h-4 text-emerald-400" /> Withdrawal Approvals ({withdrawalRequestsList.length})
          {withdrawalRequestsList.filter(d => d.status === 'pending').length > 0 && (
            <span className="bg-amber-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full flex-shrink-0 shrink-0">
              {withdrawalRequestsList.filter(d => d.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('withdrawal_codes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 shrink-0 ${
            activeTab === 'withdrawal_codes' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
          }`}
        >
          <Key className="w-4 h-4 text-amber-400" /> Authorization Codes ({withdrawalCodesList.filter(c => c.status === 'active').length}/2 active)
        </button>

        <button
          onClick={() => setActiveTab('payment_methods')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 shrink-0 ${
            activeTab === 'payment_methods' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-400" /> Payment Addresses ({paymentMethodsList.length})
        </button>

        <button
          onClick={() => setActiveTab('markets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 shrink-0 ${
            activeTab === 'markets' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Markets ({markets.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 shrink-0 ${
            activeTab === 'orders' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
          }`}
        >
          <ListOrdered className="w-4 h-4" /> Trade Orders ({ordersList.length})
        </button>

        <button
          onClick={() => setActiveTab('positions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 shrink-0 ${
            activeTab === 'positions' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Open Positions ({positionsList.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 shrink-0 ${
            activeTab === 'audit' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
          }`}
        >
          <FileText className="w-4 h-4" /> Audit Logs ({auditLogsList.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 shrink-0 ${
            activeTab === 'settings' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
          }`}
        >
          <Sliders className="w-4 h-4" /> Settings
        </button>
      </div>

      {loading ? (
        renderSkeleton()
      ) : (
        <>
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111622] border border-[#1e2638] p-5 rounded-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Users</span>
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{usersList.length}</p>
              <p className="text-[11px] text-slate-400">Registered in Firestore</p>
            </div>

            <div className="bg-[#111622] border border-[#1e2638] p-5 rounded-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Active Markets</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{markets.filter(m => m.active !== false).length}</p>
              <p className="text-[11px] text-slate-400">Total Catalog Assets: {markets.length}</p>
            </div>

            <div className="bg-[#111622] border border-[#1e2638] p-5 rounded-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Trade Orders</span>
                <ListOrdered className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{ordersList.length}</p>
              <p className="text-[11px] text-slate-400">Executed across accounts</p>
            </div>

            <div className="bg-[#111622] border border-[#1e2638] p-5 rounded-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Open Positions</span>
                <DollarSign className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{positionsList.filter(p => p.status === 'open').length}</p>
              <p className="text-[11px] text-slate-400">Total Positions: {positionsList.length}</p>
            </div>
          </div>

          {/* Quick Admin Actions Box */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-[#1e2638] pb-3">
              <Shield className="w-4 h-4 text-rose-400" /> Administrative Quick Operations
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('markets')}
                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black font-extrabold text-xs rounded-xl border border-amber-500/30 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add / Override Market Asset
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className="px-4 py-2 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-black font-extrabold text-xs rounded-xl border border-sky-500/30 transition-all flex items-center gap-2"
              >
                <Users className="w-4 h-4" /> Manage User Balances
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white font-extrabold text-xs rounded-xl border border-rose-500/30 transition-all flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" /> Configure Platform Maintenance
              </button>
            </div>
          </div>

          {/* Recent Audit Log Preview */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-rose-400 shrink-0 flex-shrink-0" /> 
                <span className="break-words min-w-0">Recent Security & Audit Logs</span>
              </h3>
              <button 
                onClick={() => setActiveTab('audit')} 
                className="text-xs text-rose-400 hover:text-rose-300 font-bold shrink-0 flex-shrink-0 whitespace-nowrap"
              >
                View All ({auditLogsList.length}) →
              </button>
            </div>

            {auditLogsList.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">No security audit logs recorded yet.</p>
            ) : (
              <div className="divide-y divide-[#1e2638] w-full max-w-full min-w-0">
                {auditLogsList.slice(0, 5).map(log => (
                  <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 sm:gap-4 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                      <span className="font-mono font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 shrink-0 flex-shrink-0 whitespace-nowrap">
                        {log.action}
                      </span>
                      <span className="text-slate-300 break-words break-all min-w-0">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 flex-shrink-0 self-start sm:self-auto whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT (RESTRUCTURED USER-CENTRIC WORKFLOW) */}
      {activeTab === 'users' && (
        <UserManagementView
          usersList={usersList}
          depositRequestsList={depositRequestsList}
          withdrawalRequestsList={withdrawalRequestsList}
          withdrawalCodesList={withdrawalCodesList}
          auditLogsList={auditLogsList}
          ordersList={ordersList}
          positionsList={positionsList}
          adminUid={currentUser?.uid || userProfile?.uid || ''}
          adminEmail={currentUser?.email || userProfile?.email || ''}
          onRefresh={() => setRefreshKey(prev => prev + 1)}
          showSuccess={(msg) => {
            setSuccessMsg(msg);
            setTimeout(() => setSuccessMsg(''), 5000);
          }}
          showError={(msg) => {
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(''), 5000);
          }}
        />
      )}

      {/* TAB: BROADCAST NOTIFICATIONS */}
      {activeTab === 'broadcast' && (
        <BroadcastTab
          usersList={usersList}
          broadcastHistory={broadcastHistory}
          onRefresh={loadData}
          adminUid={adminUid}
          adminEmail={adminEmail}
          showSuccess={(msg) => {
            setSuccessMsg(msg);
            setTimeout(() => setSuccessMsg(''), 5000);
          }}
          showError={(msg) => {
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(''), 5000);
          }}
        />
      )}

      {/* TAB: DEPOSIT APPROVALS */}
      {activeTab === 'deposits' && (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2638] pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" /> Pending & Historical Deposit Approvals ({depositRequestsList.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Review user deposit requests, verify proof, and approve balance top-ups</p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user email, method, ID..."
                value={depositSearch}
                onChange={e => setDepositSearch(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-400 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[10px] font-bold uppercase text-slate-400">
                  <th className="p-3">Date</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Proof / TxHash</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]">
                {depositRequestsList.filter(d => 
                  d.userEmail?.toLowerCase().includes(depositSearch.toLowerCase()) ||
                  d.method?.toLowerCase().includes(depositSearch.toLowerCase()) ||
                  d.id?.toLowerCase().includes(depositSearch.toLowerCase()) ||
                  d.userName?.toLowerCase().includes(depositSearch.toLowerCase())
                ).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-slate-500 italic">No deposit requests submitted yet.</td>
                  </tr>
                ) : (
                  depositRequestsList
                    .filter(d => 
                      d.userEmail?.toLowerCase().includes(depositSearch.toLowerCase()) ||
                      d.method?.toLowerCase().includes(depositSearch.toLowerCase()) ||
                      d.id?.toLowerCase().includes(depositSearch.toLowerCase()) ||
                      d.userName?.toLowerCase().includes(depositSearch.toLowerCase())
                    )
                    .map(req => (
                      <tr key={req.id} className="hover:bg-[#182030]/50">
                        <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white">{req.userName || req.userEmail}</div>
                          <div className="text-[10px] font-mono text-slate-400">{req.userEmail}</div>
                        </td>
                        <td className="p-3 font-bold text-amber-400">{req.method}</td>
                        <td className="p-3 font-mono font-black text-emerald-400">
                          ${req.amount.toLocaleString()}
                        </td>
                        <td className="p-3 max-w-xs">
                          <div className="text-slate-300 font-mono text-[11px] truncate" title={req.txHashOrProof}>
                            {req.txHashOrProof || 'No proof supplied'}
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                            req.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : req.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse'
                          }`}>
                            {req.status === 'pending' ? 'Pending Approval' : req.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {req.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApproveDeposit(req)}
                                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs shadow transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectDeposit(req)}
                                className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold rounded-lg border border-rose-500/30 text-xs transition-all"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">
                              Processed by {req.processedBy || 'Admin'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: MANUAL DEPOSIT / FUND USER */}
      {activeTab === 'manual_deposit' && (
        <ManualDepositTab
          usersList={usersList}
          depositRequestsList={depositRequestsList}
          onRefresh={loadData}
          adminUid={adminUid}
          adminEmail={adminEmail}
          showSuccess={showSuccess}
          showError={showError}
        />
      )}
      {activeTab === 'withdrawals' && (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2638] pb-3">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 text-emerald-400" /> Pending & Historical Withdrawal Approvals ({withdrawalRequestsList.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Review user withdrawal requests, confirm balance deduction, and approve transfers</p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user email, method, ID..."
                value={withdrawalSearch}
                onChange={e => setWithdrawalSearch(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-400 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[10px] font-bold uppercase text-slate-400">
                  <th className="p-3">Date</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]">
                {withdrawalRequestsList.filter(d => 
                  d.userEmail?.toLowerCase().includes(withdrawalSearch.toLowerCase()) ||
                  d.method?.toLowerCase().includes(withdrawalSearch.toLowerCase()) ||
                  d.id?.toLowerCase().includes(withdrawalSearch.toLowerCase()) ||
                  d.userName?.toLowerCase().includes(withdrawalSearch.toLowerCase())
                ).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 italic">No withdrawal requests submitted yet.</td>
                  </tr>
                ) : (
                  withdrawalRequestsList
                    .filter(d => 
                      d.userEmail?.toLowerCase().includes(withdrawalSearch.toLowerCase()) ||
                      d.method?.toLowerCase().includes(withdrawalSearch.toLowerCase()) ||
                      d.id?.toLowerCase().includes(withdrawalSearch.toLowerCase()) ||
                      d.userName?.toLowerCase().includes(withdrawalSearch.toLowerCase())
                    )
                    .map(req => (
                      <tr key={req.id} className="hover:bg-[#182030]/50">
                        <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white">{req.userName || req.userEmail}</div>
                          <div className="text-[10px] font-mono text-slate-400">{req.userEmail}</div>
                          {req.accountHolderName && (
                            <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                              Holder: {req.accountHolderName}
                            </div>
                          )}
                          {req.financialInstitution && (
                            <div className="text-[10px] text-slate-300 font-semibold">
                              Bank: {req.financialInstitution}
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-bold text-amber-400">{req.method}</td>
                        <td className="p-3 font-mono font-black text-rose-400">
                          ${req.amount.toLocaleString()}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                              req.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : req.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse'
                            }`}>
                              {req.status === 'pending' ? 'Pending Approval' : req.status}
                            </span>
                            {req.withdrawalCodeVerified && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/10 border border-amber-500/20 text-amber-300 flex items-center gap-1">
                                <Key className="w-2.5 h-2.5" /> Code Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {req.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApproveWithdrawal(req)}
                                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-xs shadow transition-all"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(req)}
                                className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold rounded-lg border border-rose-500/30 text-xs transition-all"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic">
                              Processed by {req.processedBy || 'Admin'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: WITHDRAWAL AUTHORIZATION CODES */}
      {activeTab === 'withdrawal_codes' && (
        <WithdrawalCodesTab
          withdrawalCodesList={withdrawalCodesList}
          usersList={usersList}
          generatingSlot={generatingSlot}
          selectedUserForCode={selectedUserForCode}
          setSelectedUserForCode={setSelectedUserForCode}
          onGenerateCode={handleGenerateCode}
          onGenerateBothCodes={handleGenerateBothCodes}
          onRevokeCode={handleRevokeCode}
          onAssignCode={handleAssignCode}
          onRefresh={loadData}
        />
      )}

      {/* TAB: ADMIN BROADCAST MESSAGE CENTER */}
      {activeTab === 'broadcast' && (
        <BroadcastTab
          usersList={usersList}
          broadcastHistory={broadcastHistory}
          onRefresh={loadData}
          adminUid={adminUid}
          adminEmail={adminEmail}
          showSuccess={showSuccess}
          showError={showError}
        />
      )}

      {/* TAB: PAYMENT METHODS & ADDRESSES */}
      {activeTab === 'payment_methods' && (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2638] pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Payment Methods & Wallet Addresses ({paymentMethodsList.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add, modify, or delete deposit addresses and bank details shown to trading client users
              </p>
            </div>

            <button
              onClick={handleOpenNewMethod}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add Payment Method
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethodsList.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500 italic bg-[#0d111a] border border-[#1e2638] rounded-xl">
                No payment methods configured yet. Click "Add Payment Method" above to create one.
              </div>
            ) : (
              paymentMethodsList.map((method) => (
                <div 
                  key={method.id} 
                  className={`bg-[#0d111a] border ${method.enabled !== false ? 'border-[#1e2638] hover:border-amber-400/40' : 'border-rose-900/30 opacity-60'} p-4 rounded-xl flex flex-col justify-between gap-4 transition-all shadow-md`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{method.name}</span>
                        <span className="bg-amber-400/10 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded border border-amber-400/20">
                          {method.symbol}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        method.enabled !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {method.enabled !== false ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1">{method.subtitle}</p>

                    <div className="bg-[#06080d] border border-[#1e2638] p-2.5 rounded-lg space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Wallet / Address / IBAN</div>
                      <div className="text-xs font-mono text-emerald-400 break-all select-all">{method.address || 'No address set'}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#182030]">
                    <button
                      onClick={() => handleOpenEditMethod(method)}
                      className="px-3 py-1.5 bg-[#182030] hover:bg-[#222c42] text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-400" /> Modify Details
                    </button>
                    <button
                      onClick={() => handleDeleteMethod(method.id, method.name)}
                      className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-all border border-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MARKET MANAGEMENT */}
      {activeTab === 'markets' && (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" /> Catalog Market Override ({markets.length})
            </h3>

            <button
              onClick={() => handleOpenMarketModal()}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Asset
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[10px] font-bold uppercase text-slate-400">
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Current Price</th>
                  <th className="p-3">24h Change</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]">
                {markets.map(m => (
                  <tr key={m.id} className="hover:bg-[#182030]/50">
                    <td className="p-3 font-bold text-white">{m.symbol}</td>
                    <td className="p-3 text-slate-300">{m.name}</td>
                    <td className="p-3 font-mono font-bold text-white">${m.price.toFixed(m.price < 10 ? 4 : 2)}</td>
                    <td className={`p-3 font-mono font-bold ${m.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {m.change24h >= 0 ? '+' : ''}{m.change24h}%
                    </td>
                    <td className="p-3 text-slate-300 uppercase text-[10px]">{m.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.active !== false ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {m.active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenMarketModal(m)}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black font-bold rounded-lg border border-amber-500/20 text-[11px]"
                      >
                        <Edit2 className="w-3 h-3 inline mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMarket(m.id, m.symbol)}
                        className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white font-bold rounded-lg border border-rose-500/20 text-[11px]"
                      >
                        <Trash2 className="w-3 h-3 inline mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: GLOBAL TRADE ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2638] pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-emerald-400" /> Global Trade Orders ({filteredOrders.length})
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter symbol, User ID, Order ID..."
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-emerald-500 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[10px] font-bold uppercase text-slate-400">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Asset</th>
                  <th className="p-3">Direction</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500 italic">No trade orders recorded.</td>
                  </tr>
                ) : (
                  filteredOrders.map(o => (
                    <tr key={o.id} className="hover:bg-[#182030]/50">
                      <td className="p-3 font-mono font-bold text-slate-300">{o.id}</td>
                      <td className="p-3 font-mono text-slate-400">{o.userId}</td>
                      <td className="p-3 font-bold text-white">{o.symbol}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          o.direction === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {o.direction}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{o.quantity}</td>
                      <td className="p-3 font-mono text-white">${o.price?.toFixed(2)}</td>
                      <td className="p-3 font-mono text-white">${o.totalAmount?.toFixed(2)}</td>
                      <td className="p-3 uppercase text-[10px] text-slate-400 font-bold">{o.status}</td>
                      <td className="p-3 text-[10px] text-slate-500 font-mono">
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: GLOBAL POSITIONS */}
      {activeTab === 'positions' && (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2638] pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-rose-400" /> Global Open Positions ({filteredPositions.length})
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter symbol, User ID..."
                value={positionSearch}
                onChange={e => setPositionSearch(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-rose-500 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[10px] font-bold uppercase text-slate-400">
                  <th className="p-3">User ID</th>
                  <th className="p-3">Asset</th>
                  <th className="p-3">Direction</th>
                  <th className="p-3">Quantity</th>
                  <th className="p-3">Entry Price</th>
                  <th className="p-3">Current Price</th>
                  <th className="p-3">Position P/L</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Opened</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]">
                {filteredPositions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500 italic">No open positions recorded.</td>
                  </tr>
                ) : (
                  filteredPositions.map(p => (
                    <tr key={p.id} className="hover:bg-[#182030]/50">
                      <td className="p-3 font-mono text-slate-400">{p.userId}</td>
                      <td className="p-3 font-bold text-white">{p.symbol}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          p.direction === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {p.direction}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{p.quantity}</td>
                      <td className="p-3 font-mono text-white">${p.entryPrice?.toFixed(2)}</td>
                      <td className="p-3 font-mono text-white">${p.currentPrice?.toFixed(2)}</td>
                      <td className={`p-3 font-mono font-bold ${p.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${p.pnl >= 0 ? '+' : ''}{p.pnl?.toFixed(2)} ({p.pnlPercent?.toFixed(2)}%)
                      </td>
                      <td className="p-3 uppercase text-[10px] text-slate-400 font-bold">{p.status}</td>
                      <td className="p-3 text-[10px] text-slate-500 font-mono">
                        {new Date(p.openedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2638] pb-3">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-rose-400" /> Immutable Security Audit Logs ({filteredAuditLogs.length})
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search action, details, admin..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-rose-500 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full max-w-full min-w-0 scrollbar-none">
            <table className="w-full min-w-[700px] sm:min-w-[800px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[10px] font-bold uppercase text-slate-400">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Admin Email</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500 italic">No audit log records match filter.</td>
                  </tr>
                ) : (
                  filteredAuditLogs.map(a => (
                    <tr key={a.id} className="hover:bg-[#182030]/50 font-mono text-[11px]">
                      <td className="p-3 text-slate-500 shrink-0 whitespace-nowrap">{new Date(a.timestamp).toLocaleString()}</td>
                      <td className="p-3 shrink-0">
                        <span className="bg-rose-500/10 text-rose-300 font-bold px-2 py-0.5 rounded border border-rose-500/20 whitespace-nowrap inline-block">
                          {a.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-mono break-all min-w-0">{a.adminEmail}</td>
                      <td className="p-3 text-slate-400 font-mono break-all min-w-0">{a.targetType}:{a.targetId}</td>
                      <td className="p-3 text-slate-200 font-sans break-words break-all min-w-0">{a.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: PLATFORM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-xl space-y-6 max-w-2xl mx-auto">
          <div className="border-b border-[#1e2638] pb-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" /> Platform Maintenance & Global Configuration
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Global parameters persisted in Firestore <code className="text-rose-300 font-mono">platformSettings/config</code>
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div className="p-4 bg-[#0a0d14] border border-[#1e2638] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Platform Maintenance Mode</span>
                <span className="text-[11px] text-slate-400">Toggle maintenance state banner across all connected clients</span>
              </div>
              <button
                type="button"
                onClick={() => setPlatformSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
                className={`p-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
                  platformSettings.maintenanceMode 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                }`}
              >
                {platformSettings.maintenanceMode ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                {platformSettings.maintenanceMode ? 'ENABLED (LOCKED)' : 'DISABLED (OPEN)'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Default Balance for New Signups ($)
              </label>
              <input
                type="number"
                value={platformSettings.defaultDemoBalance}
                onChange={e => setPlatformSettings(s => ({ ...s, defaultDemoBalance: parseFloat(e.target.value) || 10000 }))}
                className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Global Platform Announcement / Notice
              </label>
              <textarea
                value={platformSettings.platformNotice}
                onChange={e => setPlatformSettings(s => ({ ...s, platformNotice: e.target.value }))}
                rows={3}
                className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-xs text-white outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all"
            >
              Save Global Platform Settings
            </button>
          </form>
        </div>
      )}

        </>
      )}

      {/* TOP-UP USER MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-bold text-white">Top-Up User Funds</h3>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="text-xs text-slate-300 space-y-1 bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638]">
              <div><strong className="text-white">User:</strong> {selectedUser.fullName || selectedUser.username}</div>
              <div><strong className="text-white">Email:</strong> {selectedUser.email}</div>
              <div><strong className="text-white">Current Balance:</strong> ${selectedUser.demoBalance?.toLocaleString()}</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">New Balance ($)</label>
              <input
                type="number"
                value={editBalanceVal}
                onChange={e => setEditBalanceVal(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-sm text-white font-mono outline-none"
              />
            </div>

            <button
              onClick={() => handleUpdateBalance(selectedUser.uid)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow transition-all"
            >
              Confirm Balance Update
            </button>
          </div>
        </div>
      )}

      {/* MARKET EDIT / ADD MODAL */}
      {(selectedMarket || isNewMarketModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-bold text-white">
                {isNewMarketModal ? 'Add New Market Asset' : `Edit Market: ${selectedMarket?.symbol}`}
              </h3>
              <button 
                onClick={() => { setSelectedMarket(null); setIsNewMarketModal(false); }} 
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMarket} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Symbol (e.g. EUR/USD, AAPL)</label>
                <input
                  type="text"
                  value={marketForm.symbol}
                  onChange={e => setMarketForm({ ...marketForm, symbol: e.target.value })}
                  disabled={!isNewMarketModal}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-white font-mono outline-none disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Asset Full Name</label>
                <input
                  type="text"
                  value={marketForm.name}
                  onChange={e => setMarketForm({ ...marketForm, name: e.target.value })}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Market Price ($)</label>
                  <input
                    type="number"
                    step="any"
                    value={marketForm.price}
                    onChange={e => setMarketForm({ ...marketForm, price: e.target.value })}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-white font-mono outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">24H Change (%)</label>
                  <input
                    type="number"
                    step="any"
                    value={marketForm.change24h}
                    onChange={e => setMarketForm({ ...marketForm, change24h: e.target.value })}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-white font-mono outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={marketForm.category}
                    onChange={e => setMarketForm({ ...marketForm, category: e.target.value as any })}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-white outline-none"
                  >
                    <option value="forex">Forex</option>
                    <option value="crypto">Crypto</option>
                    <option value="stocks">Stocks</option>
                    <option value="indices">Indices</option>
                    <option value="commodities">Commodities</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Trading Status</label>
                  <select
                    value={marketForm.active ? 'true' : 'false'}
                    onChange={e => setMarketForm({ ...marketForm, active: e.target.value === 'true' })}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-white outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow transition-all mt-2"
              >
                Save Market Override
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PAYMENT METHOD */}
      {(isNewMethodModal || selectedMethodModal) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#111622] border border-[#1e2638] w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => { setIsNewMethodModal(false); setSelectedMethodModal(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              ✕
            </button>

            <h3 className="text-base font-extrabold text-white flex items-center gap-2 border-b border-[#1e2638] pb-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              {isNewMethodModal ? 'Add New Deposit Method' : `Modify Method: ${methodForm.name}`}
            </h3>

            <form onSubmit={handleSaveMethod} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Method Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Bitcoin, USDT TRC20, Bank Wire"
                    value={methodForm.name}
                    onChange={e => setMethodForm({ ...methodForm, name: e.target.value })}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-white outline-none focus:border-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    placeholder="e.g. BTC, USDT, WIRE, SOL"
                    value={methodForm.symbol}
                    onChange={e => setMethodForm({ ...methodForm, symbol: e.target.value.toUpperCase() })}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-white outline-none focus:border-emerald-400 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Payment Subtitle / Instruction</label>
                <input
                  type="text"
                  placeholder="e.g. Upload payment proof for quick verification"
                  value={methodForm.subtitle}
                  onChange={e => setMethodForm({ ...methodForm, subtitle: e.target.value })}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Wallet Address / Bank Wire IBAN & SWIFT
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter crypto wallet deposit address or bank account wiring details..."
                  value={methodForm.address}
                  onChange={e => setMethodForm({ ...methodForm, address: e.target.value })}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-emerald-400 font-mono text-xs outline-none focus:border-emerald-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Icon Category</label>
                  <select
                    value={methodForm.iconType}
                    onChange={e => setMethodForm({ ...methodForm, iconType: e.target.value })}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-white outline-none focus:border-emerald-400"
                  >
                    <option value="btc">Bitcoin (BTC)</option>
                    <option value="eth">Ethereum (ETH)</option>
                    <option value="ltc">Litecoin (LTC)</option>
                    <option value="usdt">Tether (USDT)</option>
                    <option value="sol">Solana (SOL)</option>
                    <option value="xrp">Ripple (XRP)</option>
                    <option value="hype">Hype (HYPE)</option>
                    <option value="link">Chainlink (LINK)</option>
                    <option value="xlm">Stellar (XLM)</option>
                    <option value="avax">Avalanche (AVAX)</option>
                    <option value="ada">Cardano (ADA)</option>
                    <option value="bank">Bank Wire Transfer</option>
                    <option value="custom">Custom Crypto</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Availability Status</label>
                  <select
                    value={methodForm.enabled !== false ? 'true' : 'false'}
                    onChange={e => setMethodForm({ ...methodForm, enabled: e.target.value === 'true' })}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 px-3 text-white outline-none focus:border-emerald-400"
                  >
                    <option value="true">Active (Visible to Users)</option>
                    <option value="false">Disabled (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1e2638]">
                <button
                  type="button"
                  onClick={() => { setIsNewMethodModal(false); setSelectedMethodModal(null); }}
                  className="px-4 py-2 bg-[#182030] hover:bg-[#222c42] text-slate-300 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl shadow-lg transition-all"
                >
                  Save Payment Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
