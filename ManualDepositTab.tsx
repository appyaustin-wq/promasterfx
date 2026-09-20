import React, { useState } from 'react';
import { UserProfile, DepositRequest } from '../../types';
import { DollarSign, Search, Shield, CheckCircle2, AlertCircle, FileText, User } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, updateDoc, setDoc, runTransaction } from 'firebase/firestore';
import { writeAuditLog, sendNotification } from '../../services/adminService';

interface ManualDepositTabProps {
  usersList: UserProfile[];
  depositRequestsList: DepositRequest[];
  onRefresh: () => void;
  adminUid: string;
  adminEmail: string;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export const ManualDepositTab: React.FC<ManualDepositTabProps> = ({
  usersList,
  depositRequestsList,
  onRefresh,
  adminUid,
  adminEmail,
  showSuccess,
  showError
}) => {
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [amountStr, setAmountStr] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // Filter users by search
  const filteredUsers = usersList.filter(u =>
    u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phoneNumber?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.uid?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filter manual deposits from deposit requests
  const manualDepositRecords = depositRequestsList.filter(d => d.methodId === 'admin_manual_deposit');

  const filteredManualRecords = manualDepositRecords.filter(r =>
    r.userName?.toLowerCase().includes(historySearch.toLowerCase()) ||
    r.userEmail?.toLowerCase().includes(historySearch.toLowerCase()) ||
    r.id?.toLowerCase().includes(historySearch.toLowerCase()) ||
    r.notes?.toLowerCase().includes(historySearch.toLowerCase())
  );

  const handleInitiateFunding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      showError('Please select a user to fund.');
      return;
    }
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) {
      showError('Please enter a valid deposit amount greater than zero.');
      return;
    }
    if (amt > 10000000) {
      showError('Deposit amount exceeds maximum allowable single manual funding limit.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmFunding = async () => {
    if (!selectedUser) return;
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt <= 0) return;

    setSubmitting(true);
    try {
      const userRef = doc(db, 'users', selectedUser.uid);
      const txId = 'VTX-DEP-ADMIN-' + Date.now().toString().slice(-8);
      const now = new Date().toISOString();

      // Atomic transaction on Firestore
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error('User profile does not exist in database.');
        }

        const currentBal = userDoc.data().demoBalance || 0;
        const newBal = currentBal + amt;

        // 1. Update user balance and equity
        transaction.update(userRef, {
          demoBalance: newBal,
          demoEquity: newBal,
          updatedAt: now
        });

        // 2. Create Deposit Request record marked as ADMIN_MANUAL_DEPOSIT / completed
        const depositReqRef = doc(db, 'depositRequests', txId);
        const depositRecord: DepositRequest = {
          id: txId,
          userId: selectedUser.uid,
          userEmail: selectedUser.email,
          userName: selectedUser.fullName || selectedUser.username || 'Client',
          method: 'Admin Manual Deposit',
          methodId: 'admin_manual_deposit',
          amount: amt,
          status: 'approved',
          notes: adminNote || 'Manual funding approved by administrator',
          createdAt: now,
          processedAt: now,
          processedBy: adminEmail
        };
        transaction.set(depositReqRef, depositRecord);
      });

      // 3. Send Notification to User
      await sendNotification(
        selectedUser.uid,
        'Account Credited (Manual Deposit)',
        `Your account has been credited with $${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })} by administration. ${adminNote ? `Note: ${adminNote}` : ''}`,
        'deposit',
        'approved',
        amt
      );

      // 4. Write Immutable Audit Log
      await writeAuditLog(
        adminUid,
        adminEmail,
        'ADMIN_MANUAL_DEPOSIT',
        'USER',
        selectedUser.uid,
        `Credited $${amt.toLocaleString()} to user ${selectedUser.email} (${selectedUser.uid}). Note: ${adminNote || 'N/A'}. Ref: ${txId}`
      );

      showSuccess(`Successfully credited $${amt.toLocaleString()} to ${selectedUser.email}!`);
      setShowConfirmModal(false);
      setAmountStr('');
      setAdminNote('');
      setSelectedUser(null);
      setUserSearch('');
      onRefresh();
    } catch (err: any) {
      console.error('Manual deposit error:', err);
      showError(err.message || 'Failed to process manual deposit transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentBal = selectedUser?.demoBalance || 0;
  const depositNum = parseFloat(amountStr) || 0;
  const projectedBal = currentBal + depositNum;

  return (
    <div className="space-y-8 w-full max-w-full min-w-0 box-border overflow-x-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#111622] via-[#161d2e] to-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-wrap items-start sm:items-center justify-between gap-4 w-full max-w-full min-w-0 box-border">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 flex items-center justify-center shrink-0 flex-shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-white break-words min-w-0">Admin Manual Deposit / Fund User</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed break-words min-w-0">
            Securely credit any registered user account with funds immediately. Generates an auditable transaction reference, logs admin attribution, updates user balance atomically, and notifies the client.
          </p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2 shrink-0 flex-shrink-0 whitespace-nowrap">
          <Shield className="w-4 h-4" />
          <span>Server-Atomic Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-full min-w-0">
        {/* Left Column: Manual Funding Form */}
        <div className="lg:col-span-7 bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-6 shadow-xl space-y-6 w-full max-w-full min-w-0 box-border">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2 border-b border-[#1e2638] pb-3 min-w-0">
            <User className="w-4 h-4 text-amber-400 shrink-0 flex-shrink-0" />
            <span className="break-words min-w-0">Step 1: Select User & Enter Deposit Amount</span>
          </h3>

          <form onSubmit={handleInitiateFunding} className="space-y-5 w-full max-w-full min-w-0">
            {/* User Search & Selection */}
            <div className="space-y-2 w-full max-w-full min-w-0">
              <label className="block text-xs font-bold text-slate-300">
                Search & Select User <span className="text-rose-500">*</span>
              </label>
              
              {selectedUser ? (
                <div className="bg-[#0a0d14] border border-emerald-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 w-full max-w-full min-w-0">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="text-xs font-bold text-white flex flex-wrap items-center gap-2 min-w-0">
                      <span className="break-words min-w-0">{selectedUser.fullName || selectedUser.username || 'Client'}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono shrink-0">
                        UID: {selectedUser.uid.slice(0, 10)}...
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono break-all min-w-0">{selectedUser.email}</div>
                    <div className="text-[11px] text-amber-400 font-medium whitespace-nowrap">
                      Current Balance: ${selectedUser.demoBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="px-3 py-1.5 bg-[#182030] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 text-xs font-bold rounded-lg transition-colors border border-[#1e2638] shrink-0 flex-shrink-0 whitespace-nowrap"
                  >
                    Change User
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or user ID..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-slate-600 outline-none transition-colors"
                    />
                  </div>

                  {/* Dropdown list of users matching search */}
                  <div className="max-h-56 overflow-y-auto space-y-1.5 bg-[#0a0d14] border border-[#1e2638] rounded-xl p-2">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-4 text-xs text-slate-500">No users found matching query.</div>
                    ) : (
                      filteredUsers.map(u => (
                        <div
                          key={u.uid}
                          onClick={() => setSelectedUser(u)}
                          className="p-2.5 hover:bg-[#151c2c] rounded-xl cursor-pointer transition-colors flex items-center justify-between border border-transparent hover:border-[#1e2638]"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">{u.fullName || u.username || 'User'}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-emerald-400 font-mono">
                              ${u.demoBalance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">UID: {u.uid.slice(0, 8)}...</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Deposit Amount ($ USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amountStr}
                  onChange={e => setAmountStr(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-emerald-500 rounded-xl py-2.5 pl-10 pr-3.5 text-sm font-mono font-bold text-white placeholder-slate-600 outline-none transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Will be credited directly to the user's live trading and deposit balance.
              </p>
            </div>

            {/* Admin Note */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Audit Note (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Manual funding approved via wire transfer verification ref #99482..."
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedUser || !amountStr}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              Review & Confirm Manual Deposit
            </button>
          </form>
        </div>

        {/* Right Column: Quick Stats & Guidelines */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Security & Audit Protocol
            </h4>
            <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <div className="p-3 bg-[#0a0d14] rounded-xl border border-[#1e2638] space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Atomic Firestore Transactions
                </div>
                <p className="text-[11px] text-slate-400">
                  Balance increments are performed atomically via server transaction blocks to guarantee data consistency.
                </p>
              </div>

              <div className="p-3 bg-[#0a0d14] rounded-xl border border-[#1e2638] space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Immutable Audit Logging
                </div>
                <p className="text-[11px] text-slate-400">
                  Every manual funding operation records the admin's email, timestamp, user ID, and custom notes in the secure `auditLogs` collection.
                </p>
              </div>

              <div className="p-3 bg-[#0a0d14] rounded-xl border border-[#1e2638] space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                  Real-time User Notification
                </div>
                <p className="text-[11px] text-slate-400">
                  The recipient immediately receives an in-app notification confirming their funded account balance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Funding History Section */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 w-full max-w-full min-w-0 box-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e2638] pb-4 w-full max-w-full min-w-0">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400 shrink-0 flex-shrink-0" />
              <span>Admin Manual Funding Activity Log ({manualDepositRecords.length})</span>
            </h3>
            <p className="text-xs text-slate-400">History of all manual deposits executed by administrators.</p>
          </div>

          <div className="w-full sm:w-64 relative min-w-0">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search history..."
              value={historySearch}
              onChange={e => setHistorySearch(e.target.value)}
              className="w-full bg-[#0a0d14] border border-[#1e2638] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 outline-none min-w-0"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full max-w-full min-w-0 scrollbar-none">
          <table className="w-full min-w-[750px] text-left text-xs border-collapse">
            <thead className="bg-[#0a0d14] text-slate-400 uppercase font-bold tracking-wider border-b border-[#1e2638]">
              <tr>
                <th className="py-3 px-4">Ref ID</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Admin Note / Processed By</th>
                <th className="py-3 px-4">Date / Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638] text-slate-300">
              {filteredManualRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                    No manual deposit records found.
                  </td>
                </tr>
              ) : (
                filteredManualRecords.map(r => (
                  <tr key={r.id} className="hover:bg-[#151c2c] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400 break-all">{r.id}</td>
                    <td className="py-3 px-4 min-w-0">
                      <div className="font-bold text-white break-words min-w-0">{r.userName}</div>
                      <div className="text-[11px] text-slate-400 font-mono break-all min-w-0">{r.userEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm whitespace-nowrap">
                      +${r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-[10px] uppercase">
                        Completed
                      </span>
                    </td>
                    <td className="py-3 px-4 min-w-0">
                      <div className="text-white max-w-xs break-words min-w-0">{r.notes || 'Admin manual funding'}</div>
                      <div className="text-[10px] text-slate-500 break-words min-w-0">By: {r.processedBy || 'Admin'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 w-full max-w-md space-y-5 shadow-2xl relative">
            <div className="flex items-center gap-3 border-b border-[#1e2638] pb-3">
              <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 flex items-center justify-center shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Confirm Manual Deposit</h3>
                <p className="text-[11px] text-slate-400">Please review the balance change before confirming.</p>
              </div>
            </div>

            <div className="bg-[#0a0d14] border border-[#1e2638] rounded-xl p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-[#1e2638] pb-2">
                <span className="text-slate-400">Target User:</span>
                <span className="font-bold text-white">{selectedUser.fullName || selectedUser.username}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1e2638] pb-2">
                <span className="text-slate-400">User Email:</span>
                <span className="font-mono text-slate-200">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1e2638] pb-2">
                <span className="text-slate-400">Current Balance:</span>
                <span className="font-mono font-bold text-white">${currentBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#1e2638] pb-2">
                <span className="text-slate-400">Manual Deposit Credit:</span>
                <span className="font-mono font-bold text-emerald-400">+${depositNum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-bold text-amber-400">New Balance:</span>
                <span className="font-mono font-extrabold text-amber-400 text-sm">${projectedBal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {adminNote && (
              <div className="text-xs text-slate-300 bg-[#0a0d14] p-3 rounded-xl border border-[#1e2638]">
                <strong className="text-white">Admin Note:</strong> {adminNote}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-[#182030] hover:bg-[#222c42] text-slate-300 font-bold rounded-xl transition-all text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmFunding}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Processing...' : 'Confirm Deposit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
