import React, { useState, useRef, useEffect } from 'react';
import { 
  UserProfile, 
  DepositRequest, 
  WithdrawalRequest, 
  WithdrawalCode, 
  DemoOrder, 
  DemoPosition 
} from '../../types';
import { 
  AuditLogEntry,
  adminFundAccount,
  adminAdjustProfit,
  adminAddBonus,
  adminUpdateUserProfileDetails,
  updateUserRole,
  generateWithdrawalCode,
  revokeWithdrawalCode,
  sendNotification,
  sendBroadcastNotification,
  sendDirectEmail,
  approveDepositRequest,
  rejectDepositRequest,
  approveWithdrawalRequest,
  rejectWithdrawalRequest
} from '../../services/adminService';
import { 
  Users, 
  Search, 
  ArrowLeft, 
  ChevronDown, 
  DollarSign, 
  TrendingUp, 
  Gift, 
  ShieldCheck, 
  Layers, 
  Lock, 
  ToggleLeft, 
  ToggleRight, 
  Key, 
  MessageSquare, 
  Send, 
  Megaphone, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Edit2, 
  FileText, 
  Activity, 
  Copy, 
  Check, 
  RefreshCw, 
  X, 
  Clock, 
  ArrowUpCircle, 
  UserCheck, 
  UserX, 
  Briefcase, 
  StickyNote,
  Sliders
} from 'lucide-react';

interface UserManagementViewProps {
  usersList: UserProfile[];
  depositRequestsList: DepositRequest[];
  withdrawalRequestsList: WithdrawalRequest[];
  withdrawalCodesList: WithdrawalCode[];
  auditLogsList: AuditLogEntry[];
  ordersList: DemoOrder[];
  positionsList: DemoPosition[];
  adminUid: string;
  adminEmail: string;
  onRefresh: () => void;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  usersList,
  depositRequestsList,
  withdrawalRequestsList,
  withdrawalCodesList,
  auditLogsList,
  ordersList,
  positionsList,
  adminUid,
  adminEmail,
  onRefresh,
  showSuccess,
  showError
}) => {
  // State
  const [userSearch, setUserSearch] = useState<string>('');
  const [userSortOrder, setUserSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedUserUids, setSelectedUserUids] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'overview' | 'financials' | 'transactions' | 'codes' | 'activity'>('overview');
  const [isActionsOpen, setIsActionsOpen] = useState<boolean>(false);
  const actionsDropdownRef = useRef<HTMLDivElement>(null);

  // Active Modals State
  const [activeModal, setActiveModal] = useState<
    | null
    | 'fund_account'
    | 'adjust_balance'
    | 'adjust_profit'
    | 'add_bonus'
    | 'withdrawal_codes'
    | 'manage_kyc'
    | 'change_status'
    | 'toggle_trade'
    | 'notify_dashboard'
    | 'send_email'
    | 'edit_profile'
    | 'investment_plan'
    | 'admin_note'
  >(null);

  // Modal Form Inputs
  const [fundAmount, setFundAmount] = useState<string>('1000');
  const [fundReason, setFundReason] = useState<string>('Account funding top-up');

  const [adjustBalanceVal, setAdjustBalanceVal] = useState<string>('10000');
  const [adjustBalanceReason, setAdjustBalanceReason] = useState<string>('Administrative balance adjustment');

  const [adjustProfitVal, setAdjustProfitVal] = useState<string>('0');
  const [adjustProfitReason, setAdjustProfitReason] = useState<string>('Trading profit adjustment');

  const [bonusAmount, setBonusAmount] = useState<string>('500');
  const [bonusCreditBalance, setBonusCreditBalance] = useState<boolean>(true);
  const [bonusReason, setBonusReason] = useState<string>('Promotional bonus reward');

  const [kycStatusVal, setKycStatusVal] = useState<'Verified' | 'Pending' | 'Unverified' | 'Rejected'>('Verified');
  const [statusVal, setStatusVal] = useState<'Active' | 'Suspended' | 'Restricted' | 'Pending'>('Active');
  const [tradeModeVal, setTradeModeVal] = useState<'ON' | 'OFF'>('ON');

  const [notifyTitle, setNotifyTitle] = useState<string>('Account Update Notice');
  const [notifyMessage, setNotifyMessage] = useState<string>('An administrative action has been applied to your account.');
  const [notifyType, setNotifyType] = useState<'system' | 'deposit' | 'withdrawal' | 'loan'>('system');

  const [emailSubject, setEmailSubject] = useState<string>('Important Notification regarding your Promaster FX Account');
  const [emailBody, setEmailBody] = useState<string>('Dear Trader,\n\nWe would like to inform you about recent updates to your account status...\n\nBest regards,\nPromaster FX Administration');

  const [editFullName, setEditFullName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPhoneNumber, setEditPhoneNumber] = useState<string>('');
  const [editCountry, setEditCountry] = useState<string>('');
  const [editState, setEditState] = useState<string>('');
  const [editCurrency, setEditCurrency] = useState<string>('USD ($) — US Dollar');
  const [editInstitution, setEditInstitution] = useState<string>('');

  const [investmentPlanVal, setInvestmentPlanVal] = useState<string>('Starter Plan');
  const [adminNoteText, setAdminNoteText] = useState<string>('');

  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [submittingModal, setSubmittingModal] = useState<boolean>(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsDropdownRef.current && !actionsDropdownRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selectedUser if list refreshes
  useEffect(() => {
    if (selectedUser) {
      const updated = usersList.find(u => u.uid === selectedUser.uid);
      if (updated) {
        setSelectedUser(updated);
      }
    }
  }, [usersList]);

  // Open modal handlers with pre-filled inputs
  const handleOpenModal = (modalName: typeof activeModal) => {
    setIsActionsOpen(false);
    if (!selectedUser) return;

    if (modalName === 'fund_account') {
      setFundAmount('1000');
      setFundReason('Administrative balance top-up');
    } else if (modalName === 'adjust_balance') {
      setAdjustBalanceVal((selectedUser.demoBalance || 0).toString());
      setAdjustBalanceReason('Balance manual override');
    } else if (modalName === 'adjust_profit') {
      setAdjustProfitVal((selectedUser.profit || selectedUser.demoProfitLoss || 0).toString());
      setAdjustProfitReason('Profit adjustment');
    } else if (modalName === 'add_bonus') {
      setBonusAmount('500');
      setBonusCreditBalance(true);
      setBonusReason('Welcome bonus credit');
    } else if (modalName === 'manage_kyc') {
      setKycStatusVal(selectedUser.kycStatus || (selectedUser.verified ? 'Verified' : 'Unverified'));
    } else if (modalName === 'change_status') {
      setStatusVal(selectedUser.accountStatus || 'Active');
    } else if (modalName === 'toggle_trade') {
      setTradeModeVal(selectedUser.tradeMode === 'OFF' || selectedUser.tradeMode === false ? 'OFF' : 'ON');
    } else if (modalName === 'edit_profile') {
      setEditFullName(selectedUser.fullName || '');
      setEditEmail(selectedUser.email || '');
      setEditPhoneNumber(selectedUser.phoneNumber || '');
      setEditCountry(selectedUser.country || '');
      setEditState(selectedUser.state || '');
      setEditCurrency(selectedUser.preferredCurrency || 'USD ($) — US Dollar');
      setEditInstitution(selectedUser.financialInstitution || '');
    } else if (modalName === 'investment_plan') {
      setInvestmentPlanVal(selectedUser.investmentPlan || 'Starter Plan');
    } else if (modalName === 'admin_note') {
      setAdminNoteText(selectedUser.adminNotes || '');
    } else if (modalName === 'notify_dashboard') {
      setNotifyTitle('Account Update Notice');
      setNotifyMessage('An administrative action has been applied to your account.');
      setNotifyType('system');
    }

    setActiveModal(modalName);
  };

  // Sort user accounts: Newest First or Oldest First based on userSortOrder
  const sortedUsers = [...usersList].sort((a, b) => {
    let timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    let timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    
    if (isNaN(timeA)) timeA = 0;
    if (isNaN(timeB)) timeB = 0;

    if (userSortOrder === 'newest') {
      return timeB - timeA;
    } else {
      if (timeA === 0 && timeB !== 0) return 1;
      if (timeB === 0 && timeA !== 0) return -1;
      return timeA - timeB;
    }
  });

  // Filtered Users List
  const filteredUsers = sortedUsers.filter(u => 
    (u.fullName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.phoneNumber || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.uid || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  // Toggle Selection Helpers
  const isAllSelected = filteredUsers.length > 0 && filteredUsers.every(u => selectedUserUids.includes(u.uid));
  
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const shownUids = filteredUsers.map(u => u.uid);
      setSelectedUserUids(prev => prev.filter(uid => !shownUids.includes(uid)));
    } else {
      const shownUids = filteredUsers.map(u => u.uid);
      setSelectedUserUids(prev => {
        const union = new Set([...prev, ...shownUids]);
        return Array.from(union);
      });
    }
  };

  const handleToggleUserSelect = (uid: string) => {
    setSelectedUserUids(prev => 
      prev.includes(uid) 
        ? prev.filter(id => id !== uid) 
        : [...prev, uid]
    );
  };

  // User-specific datasets
  const userDeposits = selectedUser ? depositRequestsList.filter(d => d.userId === selectedUser.uid) : [];
  const userWithdrawals = selectedUser ? withdrawalRequestsList.filter(w => w.userId === selectedUser.uid) : [];
  const userCodes = selectedUser ? withdrawalCodesList.filter(c => c.assignedUserId === selectedUser.uid) : [];
  const userAuditLogs = selectedUser ? auditLogsList.filter(a => a.targetId === selectedUser.uid || a.details.includes(selectedUser.uid)) : [];

  // Modal Submit Action Handlers
  const handleFundAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      showError('Please enter a valid funding amount greater than $0');
      return;
    }
    setSubmittingModal(true);
    try {
      await adminFundAccount(selectedUser.uid, amount, fundReason, adminUid, adminEmail);
      showSuccess(`Successfully funded $${amount.toLocaleString()} to ${selectedUser.fullName || selectedUser.email}`);
      setActiveModal(null);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to fund account');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleAdjustBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const newBal = parseFloat(adjustBalanceVal);
    if (isNaN(newBal) || newBal < 0) {
      showError('Please enter a valid non-negative balance value');
      return;
    }
    setSubmittingModal(true);
    try {
      await adminUpdateUserProfileDetails(selectedUser.uid, {
        demoBalance: newBal,
        demoEquity: newBal
      }, adminUid, adminEmail);
      showSuccess(`Set account balance to $${newBal.toLocaleString()} for ${selectedUser.fullName || selectedUser.email}`);
      setActiveModal(null);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to adjust balance');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleAdjustProfitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const profitVal = parseFloat(adjustProfitVal);
    if (isNaN(profitVal)) {
      showError('Please enter a valid profit amount');
      return;
    }
    setSubmittingModal(true);
    try {
      await adminAdjustProfit(selectedUser.uid, profitVal, adjustProfitReason, adminUid, adminEmail);
      showSuccess(`Profit set to $${profitVal.toLocaleString()} for ${selectedUser.fullName || selectedUser.email}`);
      setActiveModal(null);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to adjust profit');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleAddBonusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const bonusVal = parseFloat(bonusAmount);
    if (isNaN(bonusVal) || bonusVal <= 0) {
      showError('Please enter a valid bonus amount greater than $0');
      return;
    }
    setSubmittingModal(true);
    try {
      await adminAddBonus(selectedUser.uid, bonusVal, bonusCreditBalance, bonusReason, adminUid, adminEmail);
      showSuccess(`Applied bonus of $${bonusVal.toLocaleString()} to ${selectedUser.fullName || selectedUser.email}`);
      setActiveModal(null);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to add bonus');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleGenerateCodeForUser = async (slotNumber: 1 | 2) => {
    if (!selectedUser) return;
    setSubmittingModal(true);
    try {
      await generateWithdrawalCode(
        slotNumber,
        { uid: selectedUser.uid, fullName: selectedUser.fullName || selectedUser.username, email: selectedUser.email },
        adminUid,
        adminEmail
      );
      showSuccess(`Generated Code Slot ${slotNumber} for ${selectedUser.email}`);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to generate code');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleRevokeCodeForUser = async (code: WithdrawalCode) => {
    if (!selectedUser) return;
    if (!window.confirm(`Revoke authorization code for Slot ${code.slotNumber}?`)) return;
    setSubmittingModal(true);
    try {
      await revokeWithdrawalCode(code.id, adminUid, adminEmail, 'Revoked from user profile');
      showSuccess(`Revoked authorization code Slot ${code.slotNumber}`);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to revoke code');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleManageKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmittingModal(true);
    try {
      const isVerified = kycStatusVal === 'Verified';
      await adminUpdateUserProfileDetails(selectedUser.uid, {
        kycStatus: kycStatusVal,
        verified: isVerified
      }, adminUid, adminEmail);
      showSuccess(`Updated KYC status to ${kycStatusVal} for ${selectedUser.email}`);
      setActiveModal(null);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to update KYC status');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleChangeStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmittingModal(true);
    try {
      await adminUpdateUserProfileDetails(selectedUser.uid, {
        accountStatus: statusVal
      }, adminUid, adminEmail);
      showSuccess(`Updated account status to ${statusVal} for ${selectedUser.email}`);
      setActiveModal(null);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to change account status');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleToggleTradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmittingModal(true);
    try {
      await adminUpdateUserProfileDetails(selectedUser.uid, {
        tradeMode: tradeModeVal
      }, adminUid, adminEmail);
      showSuccess(`Trade mode set to ${tradeModeVal} for ${selectedUser.email}`);
      setActiveModal(null);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to update trade mode');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleNotifyDashboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!notifyTitle.trim() || !notifyMessage.trim()) {
      showError('Please fill in both title and message for notification');
      return;
    }
    setSubmittingModal(true);
    try {
      await sendBroadcastNotification({
        title: notifyTitle,
        message: notifyMessage,
        recipientType: 'specific',
        targetUserId: selectedUser.uid,
        adminUid,
        adminEmail,
        type: notifyType
      });
      showSuccess(`Notification dispatched to dashboard of ${selectedUser.email}`);
      setActiveModal(null);
      onRefresh();
    } catch (err: any) {
      console.error('[Admin Notify] Individual delivery failure:', err);
      showError(err.message || 'Failed to send notification');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleNotifyMultipleUsersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserUids.length === 0) {
      showError('No users selected for notification');
      return;
    }
    if (!notifyTitle.trim() || !notifyMessage.trim()) {
      showError('Please fill in both title and message for notification');
      return;
    }
    setSubmittingModal(true);
    let successCount = 0;
    let failCount = 0;
    
    console.log(`[Admin Bulk Notify] Starting dispatch to ${selectedUserUids.length} users...`);
    try {
      for (const uid of selectedUserUids) {
        try {
          await sendBroadcastNotification({
            title: notifyTitle,
            message: notifyMessage,
            recipientType: 'specific',
            targetUserId: uid,
            adminUid,
            adminEmail,
            type: notifyType
          });
          successCount++;
        } catch (err) {
          console.error(`[Admin Bulk Notify] Failed for user ${uid}:`, err);
          failCount++;
        }
      }
      
      if (failCount === 0) {
        showSuccess(`Bulk notifications successfully dispatched to all ${successCount} user(s).`);
      } else {
        showSuccess(`Bulk notifications dispatched: ${successCount} succeeded, ${failCount} failed.`);
      }
      setSelectedUserUids([]); // Clear list of checked users
      setActiveModal(null);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'An error occurred while dispatching bulk notifications');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!emailSubject.trim() || !emailBody.trim()) {
      showError('Please fill in both subject and email body');
      return;
    }
    setSubmittingModal(true);
    try {
      await sendDirectEmail(
        selectedUser.email,
        selectedUser.fullName || selectedUser.username,
        selectedUser.uid,
        emailSubject,
        emailBody,
        adminUid,
        adminEmail
      );
      showSuccess(`Direct message recorded & sent to ${selectedUser.email}`);
      setActiveModal(null);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to send message');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmittingModal(true);
    try {
      await adminUpdateUserProfileDetails(selectedUser.uid, {
        fullName: editFullName,
        email: editEmail,
        phoneNumber: editPhoneNumber,
        country: editCountry,
        state: editState,
        preferredCurrency: editCurrency,
        financialInstitution: editInstitution
      }, adminUid, adminEmail);
      showSuccess(`Updated profile information for ${selectedUser.email}`);
      setActiveModal(null);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to edit user profile');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleInvestmentPlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmittingModal(true);
    try {
      await adminUpdateUserProfileDetails(selectedUser.uid, {
        investmentPlan: investmentPlanVal
      }, adminUid, adminEmail);
      showSuccess(`Assigned investment plan "${investmentPlanVal}" to ${selectedUser.email}`);
      setActiveModal(null);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to update investment plan');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleAdminNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmittingModal(true);
    try {
      await adminUpdateUserProfileDetails(selectedUser.uid, {
        adminNotes: adminNoteText
      }, adminUid, adminEmail);
      showSuccess(`Saved internal admin notes for ${selectedUser.email}`);
      setActiveModal(null);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to save admin note');
    } finally {
      setSubmittingModal(false);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Deposit/Withdrawal Approval inline handlers
  const handleApproveDep = async (req: DepositRequest) => {
    try {
      await approveDepositRequest(req.id, req.userId, req.amount, adminUid, adminEmail);
      showSuccess(`Approved deposit of $${req.amount.toLocaleString()} for ${req.userName}`);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to approve deposit');
    }
  };

  const handleRejectDep = async (req: DepositRequest) => {
    const reason = window.prompt('Reason for rejecting deposit request:', 'Payment proof unverified');
    if (reason === null) return;
    try {
      await rejectDepositRequest(req.id, adminUid, adminEmail, reason);
      showSuccess(`Rejected deposit request ${req.id}`);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to reject deposit');
    }
  };

  const handleApproveWith = async (req: WithdrawalRequest) => {
    try {
      await approveWithdrawalRequest(req.id, req.userId, req.amount, adminUid, adminEmail);
      showSuccess(`Approved withdrawal of $${req.amount.toLocaleString()} for ${req.userName}`);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to approve withdrawal');
    }
  };

  const handleRejectWith = async (req: WithdrawalRequest) => {
    const reason = window.prompt('Reason for rejecting withdrawal request:', 'Account verification required');
    if (reason === null) return;
    try {
      await rejectWithdrawalRequest(req.id, adminUid, adminEmail, reason);
      showSuccess(`Rejected withdrawal request ${req.id}`);
      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to reject withdrawal');
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 box-border overflow-x-hidden">
      {/* ---------------------------------------------------------------- */}
      {/* LIST VIEW: WHEN NO USER IS SELECTED                              */}
      {/* ---------------------------------------------------------------- */}
      {!selectedUser ? (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 w-full max-w-full min-w-0 box-border">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-[#1e2638] pb-3 w-full max-w-full min-w-0">
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2 min-w-0 break-words">
                <Users className="w-4 h-4 text-sky-400 shrink-0 flex-shrink-0" /> 
                <span className="break-words min-w-0">User Accounts Directory ({filteredUsers.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 break-words min-w-0">Select a user account to open their complete profile, stats, and centralized Actions menu</p>
            </div>

            {/* Controls panel */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto min-w-0">
              {/* Notify Selected button */}
              {selectedUserUids.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setNotifyTitle('Account Update Notice');
                    setNotifyMessage('An administrative action has been applied to your account.');
                    setNotifyType('system');
                    setActiveModal('notify_multiple_users');
                  }}
                  className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 shrink-0 flex-shrink-0 whitespace-nowrap"
                >
                  <MessageSquare className="w-4 h-4" />
                  Notify Selected ({selectedUserUids.length})
                </button>
              )}

              {/* Search input */}
              <div className="relative flex-1 sm:w-64 min-w-0">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user, email, phone, UID..."
                  value={userSearch}
                  onChange={e => {
                    setUserSearch(e.target.value);
                    setSelectedUserUids([]); // Clear select-all when searching to avoid hidden checkbox confusion
                  }}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-sky-500 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white outline-none min-w-0"
                />
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-1.5 shrink-0 flex-shrink-0">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Sort:</span>
                <select
                  value={userSortOrder}
                  onChange={e => setUserSortOrder(e.target.value as 'newest' | 'oldest')}
                  className="bg-[#0a0d14] border border-[#1e2638] focus:border-sky-500 text-xs text-slate-300 rounded-xl py-1.5 px-3 outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto w-full max-w-full min-w-0 scrollbar-none">
            <table className="w-full min-w-[950px] text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[10px] font-bold uppercase text-slate-400">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      className="rounded border-[#1e2638] bg-[#0a0d14] text-sky-500 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">User Profile</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Phone Number</th>
                  <th className="p-3">Account Balance</th>
                  <th className="p-3">Profit</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">KYC</th>
                  <th className="p-3">Trade Mode</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-6 text-center text-slate-500 italic">No matching user accounts found.</td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const status = u.accountStatus || 'Active';
                    const kyc = u.kycStatus || (u.verified ? 'Verified' : 'Unverified');
                    const trade = u.tradeMode === 'OFF' || u.tradeMode === false ? 'OFF' : 'ON';
                    const isSelected = selectedUserUids.includes(u.uid);

                    return (
                      <tr key={u.uid} className={`hover:bg-[#182030]/50 transition-colors ${isSelected ? 'bg-sky-500/5' : ''}`}>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleUserSelect(u.uid)}
                            className="rounded border-[#1e2638] bg-[#0a0d14] text-sky-500 focus:ring-sky-500 w-3.5 h-3.5 cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {u.fullName || u.username}
                            {u.role === 'admin' && (
                              <span className="text-[9px] bg-rose-500/20 text-rose-300 font-extrabold px-1.5 py-0.2 rounded border border-rose-500/30">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{u.preferredCurrency || 'USD'}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-slate-300 font-mono text-[11px]">{u.email}</div>
                          <div className="text-[10px] font-mono text-slate-500 truncate max-w-[120px]">UID: {u.uid}</div>
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          {u.phoneNumber ? (
                            <span className="text-emerald-400 font-bold">{u.phoneNumber}</span>
                          ) : (
                            <span className="text-slate-500 italic">Not provided</span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-400">
                          ${(u.demoBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-400">
                          ${(u.profit || u.demoProfitLoss || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            status === 'Suspended' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            kyc === 'Verified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            kyc === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {kyc}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            trade === 'ON' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {trade}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-medium whitespace-nowrap">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Legacy'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 ml-auto"
                          >
                            Manage Profile ➔
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ---------------------------------------------------------------- */
        /* PROFILE VIEW: CENTRIC AROUND SELECTED USER                      */
        /* ---------------------------------------------------------------- */
        <div className="space-y-6 w-full max-w-full min-w-0 box-border">
          {/* Top Header Bar with Back Button and Actions Dropdown */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 w-full max-w-full min-w-0 box-border">
            <div className="flex flex-wrap items-center gap-3 min-w-0 flex-1">
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 bg-[#182030] hover:bg-[#202b40] text-slate-300 hover:text-white rounded-xl border border-[#2e3b54] transition-all flex items-center gap-1 text-xs font-bold shrink-0 flex-shrink-0 whitespace-nowrap"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Users
              </button>

              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-black text-white flex flex-wrap items-center gap-2 min-w-0">
                  <span className="break-words min-w-0">{selectedUser.fullName || selectedUser.username}</span>
                  <span className="text-xs text-slate-400 font-mono font-normal break-all min-w-0">({selectedUser.email})</span>
                </h2>
                <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                  <span className="whitespace-nowrap">Phone: <strong className="text-emerald-400 font-mono">{selectedUser.phoneNumber || 'Not provided'}</strong></span>
                  <span>•</span>
                  <span className="whitespace-nowrap">Joined: {new Date(selectedUser.createdAt || Date.now()).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="whitespace-nowrap">Currency: <strong className="text-amber-400">{selectedUser.preferredCurrency || 'USD ($)'}</strong></span>
                </div>
              </div>
            </div>

            {/* CENTRAL ACTIONS DROPDOWN MENU */}
            <div className="relative shrink-0 flex-shrink-0" ref={actionsDropdownRef}>
              <button
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all border border-rose-500/40 shrink-0 flex-shrink-0 whitespace-nowrap"
              >
                <span>[ Actions ▾ ]</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isActionsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isActionsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0e131f] border border-[#2a364f] rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-[#1e2638] text-xs max-h-[80vh] overflow-y-auto">
                  {/* Section 1: Account & Financials */}
                  <div className="p-2 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-rose-400">
                      ACCOUNT & FINANCIALS
                    </div>
                    <button
                      onClick={() => handleOpenModal('fund_account')}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#1a2336] flex items-center gap-2 font-semibold"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Fund Account
                    </button>
                    <button
                      onClick={() => handleOpenModal('adjust_balance')}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#1a2336] flex items-center gap-2 font-semibold"
                    >
                      <Sliders className="w-3.5 h-3.5 text-sky-400" /> Adjust Balance
                    </button>
                    <button
                      onClick={() => handleOpenModal('adjust_profit')}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#1a2336] flex items-center gap-2 font-semibold"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Add / Adjust Profit
                    </button>
                    <button
                      onClick={() => handleOpenModal('add_bonus')}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#1a2336] flex items-center gap-2 font-semibold"
                    >
                      <Gift className="w-3.5 h-3.5 text-purple-400" /> Add Bonus
                    </button>
                  </div>

                    {/* Section 2: Security & Authorization */}
                    <div className="p-2 space-y-1">
                      <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-rose-400">
                        SECURITY & AUTHORIZATION
                      </div>
                      <button
                        onClick={() => {
                          setIsActionsOpen(false);
                          setActiveProfileTab('codes');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#1a2336] flex items-center gap-2 font-semibold"
                      >
                        <Key className="w-3.5 h-3.5 text-amber-400" /> Generate Authorization Codes
                      </button>
                    <button
                      onClick={() => handleOpenModal('manage_kyc')}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#1a2336] flex items-center gap-2 font-semibold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Manage KYC Status
                    </button>
                    <button
                      onClick={() => handleOpenModal('change_status')}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#1a2336] flex items-center gap-2 font-semibold"
                    >
                      <Lock className="w-3.5 h-3.5 text-rose-400" /> Change Account Status
                    </button>
                    <button
                      onClick={() => handleOpenModal('toggle_trade')}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#1a2336] flex items-center gap-2 font-semibold"
                    >
                      <ToggleRight className="w-3.5 h-3.5 text-indigo-400" /> Change Trade Mode
                    </button>
                  </div>

                  {/* Section 3: Communication */}
                  <div className="p-2 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-rose-400">
                      COMMUNICATION
                    </div>
                    <button
                      onClick={() => handleOpenModal('notify_dashboard')}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#1a2336] flex items-center gap-2 font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-sky-400" /> Notify Dashboard
                    </button>
                    <button
                      onClick={() => handleOpenModal('send_email')}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#1a2336] flex items-center gap-2 font-semibold"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" /> Send Direct Message
                    </button>
                  </div>

                  {/* Section 4: User Profile Management */}
                  <div className="p-2 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-rose-400">
                      USER MANAGEMENT
                    </div>
                    <button
                      onClick={() => handleOpenModal('edit_profile')}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#1a2336] flex items-center gap-2 font-semibold"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-400" /> Edit User Profile
                    </button>
                    <button
                      onClick={() => handleOpenModal('investment_plan')}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#1a2336] flex items-center gap-2 font-semibold"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Manage Investment Plan
                    </button>
                    <button
                      onClick={() => handleOpenModal('admin_note')}
                      className="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-[#1a2336] flex items-center gap-2 font-semibold"
                    >
                      <StickyNote className="w-3.5 h-3.5 text-amber-300" /> Add Admin Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* USER PROFILE OVERVIEW CARD (Key Stats Grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* 1. Account Balance */}
            <div className="bg-[#111622] border border-[#1e2638] p-3.5 rounded-2xl shadow-xl flex flex-col justify-between space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Account Balance</span>
              <p className="text-base font-black text-emerald-400 font-mono">
                ${(selectedUser.demoBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[9px] text-slate-500">Available Capital</span>
            </div>

            {/* 2. Profit */}
            <div className="bg-[#111622] border border-[#1e2638] p-3.5 rounded-2xl shadow-xl flex flex-col justify-between space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Profit</span>
              <p className="text-base font-black text-amber-400 font-mono">
                ${(selectedUser.profit || selectedUser.demoProfitLoss || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[9px] text-slate-500">Earned Profit</span>
            </div>

            {/* 3. Referral Bonus */}
            <div className="bg-[#111622] border border-[#1e2638] p-3.5 rounded-2xl shadow-xl flex flex-col justify-between space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Referral Bonus</span>
              <p className="text-base font-black text-sky-400 font-mono">
                ${(selectedUser.referralBonus || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[9px] text-slate-500">Referral Credit</span>
            </div>

            {/* 4. Bonus */}
            <div className="bg-[#111622] border border-[#1e2638] p-3.5 rounded-2xl shadow-xl flex flex-col justify-between space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Bonus</span>
              <p className="text-base font-black text-purple-400 font-mono">
                ${(selectedUser.bonus || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <span className="text-[9px] text-slate-500">Promo Bonus</span>
            </div>

            {/* 5. User Status */}
            <div className="bg-[#111622] border border-[#1e2638] p-3.5 rounded-2xl shadow-xl flex flex-col justify-between space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">User Status</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-center ${
                (selectedUser.accountStatus || 'Active') === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                (selectedUser.accountStatus) === 'Suspended' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {selectedUser.accountStatus || 'Active'}
              </span>
              <span className="text-[9px] text-slate-500 text-center">Account Access</span>
            </div>

            {/* 6. Investment Plan */}
            <div className="bg-[#111622] border border-[#1e2638] p-3.5 rounded-2xl shadow-xl flex flex-col justify-between space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Investment Plan</span>
              <p className="text-xs font-bold text-amber-300 truncate">
                {selectedUser.investmentPlan || 'No Active Plan'}
              </p>
              <span className="text-[9px] text-slate-500">Tier Tier</span>
            </div>

            {/* 7. KYC */}
            <div className="bg-[#111622] border border-[#1e2638] p-3.5 rounded-2xl shadow-xl flex flex-col justify-between space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">KYC</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-center ${
                (selectedUser.kycStatus || (selectedUser.verified ? 'Verified' : 'Unverified')) === 'Verified' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {selectedUser.kycStatus || (selectedUser.verified ? 'Verified' : 'Unverified')}
              </span>
              <span className="text-[9px] text-slate-500 text-center">Identity Check</span>
            </div>

            {/* 8. Trade Mode */}
            <div className="bg-[#111622] border border-[#1e2638] p-3.5 rounded-2xl shadow-xl flex flex-col justify-between space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Trade Mode</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black text-center ${
                selectedUser.tradeMode === 'OFF' || selectedUser.tradeMode === false ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {selectedUser.tradeMode === 'OFF' || selectedUser.tradeMode === false ? 'OFF' : 'ON'}
              </span>
              <span className="text-[9px] text-slate-500 text-center">Trading Access</span>
            </div>
          </div>

          {/* PROFILE SUB-NAVIGATION TABS */}
          <div className="flex items-center gap-1.5 bg-[#111622] border border-[#1e2638] p-1.5 rounded-2xl overflow-x-auto text-xs font-bold scrollbar-none w-full max-w-full min-w-0 box-border">
            <button
              onClick={() => setActiveProfileTab('overview')}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 flex-shrink-0 ${
                activeProfileTab === 'overview' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
              }`}
            >
              General Information
            </button>
            <button
              onClick={() => setActiveProfileTab('financials')}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 flex-shrink-0 ${
                activeProfileTab === 'financials' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
              }`}
            >
              Financial Breakdown
            </button>
            <button
              onClick={() => setActiveProfileTab('transactions')}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 flex-shrink-0 ${
                activeProfileTab === 'transactions' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
              }`}
            >
              Deposits & Withdrawals ({userDeposits.length + userWithdrawals.length})
            </button>
            <button
              onClick={() => setActiveProfileTab('codes')}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 flex-shrink-0 ${
                activeProfileTab === 'codes' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
              }`}
            >
              <Key className="w-3.5 h-3.5 text-amber-400" /> Authorization Codes ({userCodes.length})
            </button>
            <button
              onClick={() => setActiveProfileTab('activity')}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 flex-shrink-0 ${
                activeProfileTab === 'activity' ? 'bg-rose-500 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-[#182030]'
              }`}
            >
              Audit Logs ({userAuditLogs.length})
            </button>
          </div>

          {/* SUB-TAB 1: GENERAL INFORMATION */}
          {activeProfileTab === 'overview' && (
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 w-full max-w-full min-w-0 box-border">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-[#1e2638] pb-3 min-w-0">
                <Users className="w-4 h-4 text-sky-400 shrink-0 flex-shrink-0" /> 
                <span className="break-words min-w-0">Complete Account Profile Information</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs w-full max-w-full min-w-0">
                <div className="bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638] space-y-1 min-w-0">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Full Name</span>
                  <div className="text-white font-bold break-words min-w-0">{selectedUser.fullName || 'Not specified'}</div>
                </div>

                <div className="bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638] space-y-1 min-w-0">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Username</span>
                  <div className="text-white font-mono font-bold break-words min-w-0">{selectedUser.username || 'N/A'}</div>
                </div>

                <div className="bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638] space-y-1 min-w-0">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Email Address</span>
                  <div className="text-sky-400 font-mono font-bold break-all min-w-0">{selectedUser.email}</div>
                </div>

                <div className="bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638] space-y-1 min-w-0">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Phone Number</span>
                  <div className="text-white font-mono break-all min-w-0">{selectedUser.phoneNumber || 'Not provided'}</div>
                </div>

                <div className="bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638] space-y-1 min-w-0">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Country / Region</span>
                  <div className="text-white font-bold break-words min-w-0">{selectedUser.country || 'Global'}</div>
                </div>

                <div className="bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638] space-y-1 min-w-0">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">State / Province</span>
                  <div className="text-white font-bold break-words min-w-0">{selectedUser.state || 'N/A'}</div>
                </div>

                <div className="bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638] space-y-1 min-w-0">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Financial Institution</span>
                  <div className="text-amber-300 font-bold break-words min-w-0">{selectedUser.financialInstitution || 'Standard Bank'}</div>
                </div>

                <div className="bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638] space-y-1 min-w-0">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">User Role</span>
                  <div className="text-rose-300 font-extrabold uppercase break-words min-w-0">{selectedUser.role || 'user'}</div>
                </div>

                <div className="bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638] space-y-1 min-w-0">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Account UID</span>
                  <div className="text-slate-400 font-mono text-[10px] break-all min-w-0 select-all">{selectedUser.uid}</div>
                </div>
              </div>

              {/* Internal Admin Notes Card */}
              <div className="bg-[#0a0d14] p-4 rounded-xl border border-amber-500/20 space-y-2 w-full max-w-full min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                    <StickyNote className="w-4 h-4" /> Internal Administrative Notes
                  </span>
                  <button
                    onClick={() => handleOpenModal('admin_note')}
                    className="text-[11px] text-amber-300 hover:underline font-bold"
                  >
                    Edit Note
                  </button>
                </div>
                <p className="text-xs text-slate-300 italic break-words min-w-0">
                  {selectedUser.adminNotes || 'No administrative notes logged for this user.'}
                </p>
              </div>
            </div>
          )}

          {/* SUB-TAB 2: FINANCIAL BREAKDOWN */}
          {activeProfileTab === 'financials' && (
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-[#1e2638] pb-3">
                <DollarSign className="w-4 h-4 text-emerald-400" /> Account Capital & Financial Totals
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0a0d14] p-4 rounded-xl border border-emerald-500/20 space-y-2">
                  <span className="text-xs font-extrabold text-emerald-400">Trading Balance</span>
                  <p className="text-xl font-black font-mono text-white">
                    ${(selectedUser.demoBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <button
                    onClick={() => handleOpenModal('fund_account')}
                    className="w-full py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black font-extrabold text-xs rounded-lg transition-all"
                  >
                    Fund +
                  </button>
                </div>

                <div className="bg-[#0a0d14] p-4 rounded-xl border border-amber-500/20 space-y-2">
                  <span className="text-xs font-extrabold text-amber-400">Total Profit / Loss</span>
                  <p className="text-xl font-black font-mono text-white">
                    ${(selectedUser.profit || selectedUser.demoProfitLoss || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <button
                    onClick={() => handleOpenModal('adjust_profit')}
                    className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-extrabold text-xs rounded-lg transition-all"
                  >
                    Adjust Profit
                  </button>
                </div>

                <div className="bg-[#0a0d14] p-4 rounded-xl border border-purple-500/20 space-y-2">
                  <span className="text-xs font-extrabold text-purple-400">Promotional Bonus</span>
                  <p className="text-xl font-black font-mono text-white">
                    ${(selectedUser.bonus || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <button
                    onClick={() => handleOpenModal('add_bonus')}
                    className="w-full py-1.5 bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white font-extrabold text-xs rounded-lg transition-all"
                  >
                    Add Bonus
                  </button>
                </div>

                <div className="bg-[#0a0d14] p-4 rounded-xl border border-sky-500/20 space-y-2">
                  <span className="text-xs font-extrabold text-sky-400">Referral Earnings</span>
                  <p className="text-xl font-black font-mono text-white">
                    ${(selectedUser.referralBonus || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <div className="text-[10px] text-slate-500 italic py-1">Commission balance</div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: DEPOSITS & WITHDRAWALS */}
          {activeProfileTab === 'transactions' && (
            <div className="space-y-6">
              {/* Deposits Section */}
              <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-[#1e2638] pb-2">
                  <DollarSign className="w-4 h-4 text-amber-400" /> User Deposit Requests ({userDeposits.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[10px] font-bold uppercase text-slate-400">
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Method</th>
                        <th className="p-2.5">Amount</th>
                        <th className="p-2.5">Proof / TxHash</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2638]">
                      {userDeposits.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-500 italic">No deposit requests recorded.</td>
                        </tr>
                      ) : (
                        userDeposits.map(d => (
                          <tr key={d.id} className="hover:bg-[#182030]/50">
                            <td className="p-2.5 text-slate-400 font-mono text-[11px]">{new Date(d.createdAt).toLocaleString()}</td>
                            <td className="p-2.5 font-bold text-amber-400">{d.method}</td>
                            <td className="p-2.5 font-mono font-bold text-emerald-400">${d.amount.toLocaleString()}</td>
                            <td className="p-2.5 font-mono text-[11px] text-slate-300 max-w-xs truncate">{d.txHashOrProof || 'N/A'}</td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                d.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                d.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' :
                                'bg-amber-400/20 text-amber-300'
                              }`}>
                                {d.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-right space-x-1">
                              {d.status === 'pending' && (
                                <>
                                  <button onClick={() => handleApproveDep(d)} className="px-2 py-1 bg-emerald-500 text-black font-extrabold rounded text-[10px]">Approve</button>
                                  <button onClick={() => handleRejectDep(d)} className="px-2 py-1 bg-rose-500/20 text-rose-300 rounded text-[10px]">Reject</button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Withdrawals Section */}
              <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-[#1e2638] pb-2">
                  <ArrowUpCircle className="w-4 h-4 text-emerald-400" /> User Withdrawal Requests ({userWithdrawals.length})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[10px] font-bold uppercase text-slate-400">
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Method</th>
                        <th className="p-2.5">Amount</th>
                        <th className="p-2.5">Bank / Holder</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2638]">
                      {userWithdrawals.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-500 italic">No withdrawal requests recorded.</td>
                        </tr>
                      ) : (
                        userWithdrawals.map(w => (
                          <tr key={w.id} className="hover:bg-[#182030]/50">
                            <td className="p-2.5 text-slate-400 font-mono text-[11px]">{new Date(w.createdAt).toLocaleString()}</td>
                            <td className="p-2.5 font-bold text-amber-400">{w.method}</td>
                            <td className="p-2.5 font-mono font-bold text-rose-400">${w.amount.toLocaleString()}</td>
                            <td className="p-2.5 text-slate-300 text-[11px]">
                              {w.accountHolderName ? `${w.accountHolderName} (${w.financialInstitution || 'Bank'})` : 'N/A'}
                            </td>
                            <td className="p-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                w.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                                w.status === 'rejected' ? 'bg-rose-500/20 text-rose-300' :
                                'bg-amber-400/20 text-amber-300'
                              }`}>
                                {w.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-right space-x-1">
                              {w.status === 'pending' && (
                                <>
                                  <button onClick={() => handleApproveWith(w)} className="px-2 py-1 bg-emerald-500 text-black font-extrabold rounded text-[10px]">Approve</button>
                                  <button onClick={() => handleRejectWith(w)} className="px-2 py-1 bg-rose-500/20 text-rose-300 rounded text-[10px]">Reject</button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-TAB 4: AUTHORIZATION CODES */}
          {activeProfileTab === 'codes' && (
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2638] pb-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" /> Administrative Authorization Codes for {selectedUser.fullName || selectedUser.email}
                </h3>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerateCodeForUser(1)}
                    disabled={submittingModal}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-bold text-xs rounded-xl border border-amber-500/30 transition-all"
                  >
                    Generate Slot 1
                  </button>
                  <button
                    onClick={() => handleGenerateCodeForUser(2)}
                    disabled={submittingModal}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-bold text-xs rounded-xl border border-amber-500/30 transition-all"
                  >
                    Generate Slot 2
                  </button>
                </div>
              </div>

              {userCodes.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 text-center">No authorization codes assigned specifically to this user.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userCodes.map(code => (
                    <div key={code.id} className="bg-[#0a0d14] border border-[#1e2638] rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 uppercase">Slot {code.slotNumber} Code</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          code.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                          code.status === 'used' ? 'bg-sky-500/20 text-sky-300' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {code.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-[#111622] p-2.5 rounded-lg border border-[#1e2638]">
                        <span className="text-base font-mono font-black text-amber-300 tracking-wider">
                          {code.code || '******'}
                        </span>
                        {code.code && (
                          <button
                            onClick={() => handleCopyCode(code.code!, code.id)}
                            className="p-1.5 bg-[#182030] hover:bg-[#222c42] text-slate-300 rounded text-xs flex items-center gap-1"
                          >
                            {copiedCodeId === code.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>Created: {new Date(code.createdAt).toLocaleString()}</span>
                        {code.status === 'active' && (
                          <button onClick={() => handleRevokeCodeForUser(code)} className="text-rose-400 hover:underline">Revoke Code</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SUB-TAB 5: AUDIT LOGS */}
          {activeProfileTab === 'activity' && (
            <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 w-full max-w-full min-w-0 box-border">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-[#1e2638] pb-2 min-w-0">
                <FileText className="w-4 h-4 text-rose-400 shrink-0 flex-shrink-0" /> 
                <span className="break-words min-w-0">Audit Trail Log History ({userAuditLogs.length})</span>
              </h3>

              {userAuditLogs.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 text-center">No security audit records logged for this user profile yet.</p>
              ) : (
                <div className="divide-y divide-[#1e2638] w-full max-w-full min-w-0">
                  {userAuditLogs.map(log => (
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
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* ACTION MODALS                                                    */}
      {/* ================================================================ */}

      {/* 1. FUND ACCOUNT MODAL */}
      {activeModal === 'fund_account' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" /> Fund User Account
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleFundAccountSubmit} className="space-y-4 text-xs">
              <div className="bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638] space-y-1">
                <div className="text-slate-400">Target User: <strong className="text-white">{selectedUser.fullName || selectedUser.email}</strong></div>
                <div className="text-slate-400">Current Balance: <strong className="text-emerald-400">${(selectedUser.demoBalance || 0).toLocaleString()}</strong></div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Deposit Amount ($ USD)</label>
                <input
                  type="number"
                  step="any"
                  value={fundAmount}
                  onChange={e => setFundAmount(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-emerald-500 rounded-xl p-2.5 text-white font-mono outline-none"
                  placeholder="Enter amount e.g. 5000"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Audit Reason / Note</label>
                <input
                  type="text"
                  value={fundReason}
                  onChange={e => setFundReason(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-emerald-500 rounded-xl p-2.5 text-white outline-none"
                  placeholder="e.g. Approved wire deposit credit"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-[11px]">
                This action will instantly credit <strong>${parseFloat(fundAmount || '0').toLocaleString()}</strong> to the user's trading balance, dispatch a dashboard notification, and record an immutable audit log.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2638]">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#182030] text-slate-300 hover:text-white rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submittingModal} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl shadow">Confirm & Fund</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADJUST BALANCE MODAL */}
      {activeModal === 'adjust_balance' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-sky-400" /> Direct Balance Adjustment
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAdjustBalanceSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">New Balance Value ($ USD)</label>
                <input
                  type="number"
                  step="any"
                  value={adjustBalanceVal}
                  onChange={e => setAdjustBalanceVal(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-sky-500 rounded-xl p-2.5 text-white font-mono outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Audit Reason</label>
                <input
                  type="text"
                  value={adjustBalanceReason}
                  onChange={e => setAdjustBalanceReason(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-sky-500 rounded-xl p-2.5 text-white outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2638]">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#182030] text-slate-300 hover:text-white rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submittingModal} className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-black font-extrabold rounded-xl shadow">Save Balance</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADJUST PROFIT MODAL */}
      {activeModal === 'adjust_profit' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" /> Adjust Profit
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAdjustProfitSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Target Profit Amount ($ USD)</label>
                <input
                  type="number"
                  step="any"
                  value={adjustProfitVal}
                  onChange={e => setAdjustProfitVal(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl p-2.5 text-white font-mono outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Adjustment Reason</label>
                <input
                  type="text"
                  value={adjustProfitReason}
                  onChange={e => setAdjustProfitReason(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl p-2.5 text-white outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2638]">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#182030] text-slate-300 hover:text-white rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submittingModal} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl shadow">Save Profit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. ADD BONUS MODAL */}
      {activeModal === 'add_bonus' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-400" /> Apply Bonus Credit
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddBonusSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Bonus Amount ($ USD)</label>
                <input
                  type="number"
                  step="any"
                  value={bonusAmount}
                  onChange={e => setBonusAmount(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-purple-500 rounded-xl p-2.5 text-white font-mono outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bonusCreditBal"
                  checked={bonusCreditBalance}
                  onChange={e => setBonusCreditBalance(e.target.checked)}
                  className="rounded border-[#1e2638] bg-[#0a0d14] text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="bonusCreditBal" className="text-slate-300 font-semibold cursor-pointer">
                  Also credit bonus amount directly to account trading balance
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Bonus Reason</label>
                <input
                  type="text"
                  value={bonusReason}
                  onChange={e => setBonusReason(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-purple-500 rounded-xl p-2.5 text-white outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2638]">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#182030] text-slate-300 hover:text-white rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submittingModal} className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-white font-extrabold rounded-xl shadow">Apply Bonus</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MANAGE KYC MODAL */}
      {activeModal === 'manage_kyc' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Manage KYC Identity Status
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleManageKycSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Select KYC Verification Status</label>
                <select
                  value={kycStatusVal}
                  onChange={e => setKycStatusVal(e.target.value as any)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-emerald-500 rounded-xl p-2.5 text-white outline-none"
                >
                  <option value="Verified">Verified (Full Authorization)</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Unverified">Unverified</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2638]">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#182030] text-slate-300 hover:text-white rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submittingModal} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl shadow">Save KYC Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. CHANGE STATUS MODAL */}
      {activeModal === 'change_status' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-400" /> Change Account Access Status
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleChangeStatusSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Select Account Status</label>
                <select
                  value={statusVal}
                  onChange={e => setStatusVal(e.target.value as any)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-rose-500 rounded-xl p-2.5 text-white outline-none"
                >
                  <option value="Active">Active (Unrestricted)</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Restricted">Restricted</option>
                  <option value="Pending">Pending Approval</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2638]">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#182030] text-slate-300 hover:text-white rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submittingModal} className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-white font-extrabold rounded-xl shadow">Update Status</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. TOGGLE TRADE MODE MODAL */}
      {activeModal === 'toggle_trade' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ToggleRight className="w-5 h-5 text-indigo-400" /> Change Trade Mode
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleToggleTradeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Trade Mode Setting</label>
                <select
                  value={tradeModeVal}
                  onChange={e => setTradeModeVal(e.target.value as any)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-indigo-500 rounded-xl p-2.5 text-white outline-none"
                >
                  <option value="ON">ON (Active Trading Authorized)</option>
                  <option value="OFF">OFF (Trading Disabled)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2638]">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#182030] text-slate-300 hover:text-white rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submittingModal} className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold rounded-xl shadow">Save Trade Mode</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. NOTIFY DASHBOARD MODAL */}
      {activeModal === 'notify_dashboard' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-400" /> Notify User Dashboard
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleNotifyDashboardSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Notification Title</label>
                  <input
                    type="text"
                    value={notifyTitle}
                    onChange={e => setNotifyTitle(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-sky-500 rounded-xl p-2.5 text-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Notification Category</label>
                  <select
                    value={notifyType}
                    onChange={e => setNotifyType(e.target.value as any)}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-sky-500 rounded-xl p-2.5 text-white outline-none cursor-pointer"
                  >
                    <option value="system">🛡️ Administrative / System</option>
                    <option value="deposit">📥 Deposit Notice</option>
                    <option value="withdrawal">📤 Withdrawal Notice</option>
                    <option value="loan">💼 Loan Update</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Notification Message</label>
                <textarea
                  rows={3}
                  value={notifyMessage}
                  onChange={e => setNotifyMessage(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-sky-500 rounded-xl p-2.5 text-white outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2638]">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#182030] text-slate-300 hover:text-white rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submittingModal} className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-black font-extrabold rounded-xl shadow">Send Notification</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8.1 NOTIFY MULTIPLE USERS MODAL */}
      {activeModal === 'notify_multiple_users' && selectedUserUids.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-400" /> Notify Selected Dashboards
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="bg-[#0a0d14] border border-[#1e2638] rounded-xl p-3 text-xs space-y-1">
              <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">Recipients Count:</span>
              <div className="text-sky-400 font-extrabold text-sm">{selectedUserUids.length} users selected</div>
              <p className="text-[10px] text-slate-500">Each selected user will receive a separate targeted notification on their dashboard.</p>
            </div>

             <form onSubmit={handleNotifyMultipleUsersSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Notification Title</label>
                  <input
                    type="text"
                    value={notifyTitle}
                    onChange={e => setNotifyTitle(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-sky-500 rounded-xl p-2.5 text-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Notification Category</label>
                  <select
                    value={notifyType}
                    onChange={e => setNotifyType(e.target.value as any)}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-sky-500 rounded-xl p-2.5 text-white outline-none cursor-pointer"
                  >
                    <option value="system">🛡️ Administrative / System</option>
                    <option value="deposit">📥 Deposit Notice</option>
                    <option value="withdrawal">📤 Withdrawal Notice</option>
                    <option value="loan">💼 Loan Update</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Notification Message</label>
                <textarea
                  rows={4}
                  value={notifyMessage}
                  onChange={e => setNotifyMessage(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-sky-500 rounded-xl p-2.5 text-white outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2638]">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#182030] text-slate-300 hover:text-white rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submittingModal} className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-black font-extrabold rounded-xl shadow">Dispatch to {selectedUserUids.length} Users</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. SEND EMAIL / DIRECT MESSAGE MODAL */}
      {activeModal === 'send_email' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" /> Direct Message to {selectedUser.email}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSendEmailSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-emerald-500 rounded-xl p-2.5 text-white outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Message Body</label>
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-emerald-500 rounded-xl p-2.5 text-white outline-none font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2638]">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#182030] text-slate-300 hover:text-white rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submittingModal} className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl shadow">Send Direct Message</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. EDIT PROFILE MODAL */}
      {activeModal === 'edit_profile' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" /> Edit User Profile Information
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEditProfileSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Full Name</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={e => setEditFullName(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl p-2.5 text-white outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Phone Number</label>
                  <input
                    type="text"
                    value={editPhoneNumber}
                    onChange={e => setEditPhoneNumber(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl p-2.5 text-white outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Country</label>
                  <input
                    type="text"
                    value={editCountry}
                    onChange={e => setEditCountry(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">State / Region</label>
                  <input
                    type="text"
                    value={editState}
                    onChange={e => setEditState(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">Financial Institution</label>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={e => setEditInstitution(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2638]">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#182030] text-slate-300 hover:text-white rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submittingModal} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl shadow">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. INVESTMENT PLAN MODAL */}
      {activeModal === 'investment_plan' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" /> Manage Investment Plan
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleInvestmentPlanSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Select Active Plan</label>
                <select
                  value={investmentPlanVal}
                  onChange={e => setInvestmentPlanVal(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-purple-500 rounded-xl p-2.5 text-white outline-none"
                >
                  <option value="No Investment Plan">No Active Plan</option>
                  <option value="Starter Plan ($50 - $500)">Starter Plan ($50 - $500)</option>
                  <option value="Basic Plan ($500 - $2,000)">Basic Plan ($500 - $2,000)</option>
                  <option value="Premium Plan ($5,000 - $10,000)">Premium Plan ($5,000 - $10,000)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2638]">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#182030] text-slate-300 hover:text-white rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submittingModal} className="px-5 py-2 bg-purple-500 hover:bg-purple-400 text-white font-extrabold rounded-xl shadow">Update Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12. ADMIN NOTE MODAL */}
      {activeModal === 'admin_note' && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1e2638] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-300" /> Internal Administrative Note
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAdminNoteSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold block">Internal Notes (Admin Only)</label>
                <textarea
                  rows={4}
                  value={adminNoteText}
                  onChange={e => setAdminNoteText(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-400 rounded-xl p-2.5 text-white outline-none"
                  placeholder="Record administrative observations, risk notes, or communication tracking..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2638]">
                <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2 bg-[#182030] text-slate-300 hover:text-white rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={submittingModal} className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black font-extrabold rounded-xl shadow">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
