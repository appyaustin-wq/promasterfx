import React, { useState } from 'react';
import { UserProfile, BroadcastRecord } from '../../types';
import { Send, Users, UserCheck, AlertTriangle, CheckCircle2, Search, History, Megaphone, Shield, Clock } from 'lucide-react';
import { sendBroadcastNotification } from '../../services/adminService';

interface BroadcastTabProps {
  usersList: UserProfile[];
  broadcastHistory: BroadcastRecord[];
  onRefresh: () => void;
  adminUid: string;
  adminEmail: string;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

export const BroadcastTab: React.FC<BroadcastTabProps> = ({
  usersList,
  broadcastHistory,
  onRefresh,
  adminUid,
  adminEmail,
  showSuccess,
  showError
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'specific'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // Search users for Specific User selection
  const filteredUsers = usersList.filter(u =>
    u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.uid?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filter broadcast history records
  const filteredHistory = broadcastHistory.filter(b =>
    b.title?.toLowerCase().includes(historySearch.toLowerCase()) ||
    b.message?.toLowerCase().includes(historySearch.toLowerCase()) ||
    b.targetUserEmail?.toLowerCase().includes(historySearch.toLowerCase()) ||
    b.targetUserName?.toLowerCase().includes(historySearch.toLowerCase()) ||
    b.sentByAdminEmail?.toLowerCase().includes(historySearch.toLowerCase())
  );

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const cleanMessage = message.trim();

    if (!cleanTitle) {
      showError('Please enter a broadcast title.');
      return;
    }
    if (!cleanMessage) {
      showError('Please enter the broadcast message body.');
      return;
    }
    if (recipientType === 'specific' && !selectedUser) {
      showError('Please search and select a target user for specific broadcast.');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleSendBroadcast = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const result = await sendBroadcastNotification({
        title,
        message,
        recipientType,
        targetUserId: recipientType === 'specific' ? selectedUser?.uid : undefined,
        adminUid,
        adminEmail
      });

      const successMsgText = recipientType === 'all'
        ? `Broadcast sent successfully to ${result.recipientCount} user(s).`
        : `Broadcast sent successfully to ${selectedUser?.fullName || selectedUser?.email}.`;

      showSuccess(successMsgText);

      // Reset form
      setTitle('');
      setMessage('');
      setRecipientType('all');
      setSelectedUser(null);
      setUserSearch('');
      setShowConfirmModal(false);

      onRefresh();
    } catch (err: any) {
      showError(err.message || 'Failed to send broadcast notification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 box-border overflow-x-hidden">
      {/* Tab Banner */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 w-full max-w-full min-w-0 box-border">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0 flex-shrink-0">
            <Megaphone className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 min-w-0 break-words">
              <span className="break-words min-w-0">Broadcast Message Center</span>
            </h2>
            <p className="text-xs text-slate-400 break-words min-w-0">
              Send system announcements and personalized notices directly to user dashboard notifications.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-[#0a0d14] px-3.5 py-2 rounded-xl border border-[#1e2638] shrink-0 flex-shrink-0">
          <Shield className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="whitespace-nowrap">Admin Authorization Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-full min-w-0">
        {/* Left / Main Composer: Broadcast Composer */}
        <div className="lg:col-span-7 bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-6 shadow-xl space-y-5 w-full max-w-full min-w-0 box-border">
          <div className="border-b border-[#1e2638] pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 min-w-0">
              <Send className="w-4 h-4 text-amber-400 shrink-0 flex-shrink-0" /> 
              <span>Broadcast Composer</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Draft your message and choose target recipients.
            </p>
          </div>

          <form onSubmit={handleOpenConfirm} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Broadcast Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Important Account Update"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-medium"
              />
            </div>

            {/* Recipient Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Target Recipients <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRecipientType('all');
                    setSelectedUser(null);
                  }}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                    recipientType === 'all'
                      ? 'bg-amber-500/10 border-amber-400 text-amber-400 shadow-md'
                      : 'bg-[#0a0d14] border-[#1e2638] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Users className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">All Users</div>
                    <div className="text-[10px] text-slate-500 font-normal">Deliver to all registered accounts ({usersList.length})</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRecipientType('specific')}
                  className={`p-3 rounded-xl border flex items-center gap-3 transition-all text-left ${
                    recipientType === 'specific'
                      ? 'bg-amber-500/10 border-amber-400 text-amber-400 shadow-md'
                      : 'bg-[#0a0d14] border-[#1e2638] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <UserCheck className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Specific User</div>
                    <div className="text-[10px] text-slate-500 font-normal">Select a single user by Name/Email/ID</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Specific User Search Selector */}
            {recipientType === 'specific' && (
              <div className="bg-[#0a0d14] border border-[#1e2638] rounded-xl p-4 space-y-3">
                <label className="block text-[11px] font-bold text-slate-300">
                  Search & Select Recipient
                </label>

                {selectedUser ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-amber-300">{selectedUser.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{selectedUser.email} (ID: {selectedUser.uid})</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="text-xs font-bold text-slate-400 hover:text-rose-400 px-2.5 py-1 bg-[#111622] rounded-lg border border-[#1e2638]"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search user by Name, Email, or User ID..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full bg-[#111622] border border-[#1e2638] focus:border-amber-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    <div className="max-h-40 overflow-y-auto divide-y divide-[#1e2638] border border-[#1e2638] rounded-xl bg-[#111622]">
                      {filteredUsers.length === 0 ? (
                        <div className="p-3 text-[11px] text-slate-500 text-center">No matching users found</div>
                      ) : (
                        filteredUsers.map((u) => (
                          <button
                            key={u.uid}
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="w-full p-2.5 text-left hover:bg-[#182030] flex items-center justify-between transition-colors"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-200">{u.fullName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{u.uid.slice(0, 8)}...</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Message Area */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Notification Message Body <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Write your broadcast message announcement here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-400 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all resize-none leading-relaxed font-sans"
              />
            </div>

            {/* Action Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Broadcast</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Preview / Info card */}
        <div className="lg:col-span-5 space-y-5">
          {/* Notification Preview Card */}
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" /> Dashboard Preview
            </h3>
            <p className="text-[11px] text-slate-400">
              This is how your broadcast will appear in the trader's notification dropdown:
            </p>

            <div className="bg-[#0a0d14] border border-[#1e2638] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white">
                  {title.trim() || 'Broadcast Title'}
                </span>
                <span className="text-[9px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/20">
                  ANNOUNCEMENT
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                {message.trim() || 'Broadcast message content will be displayed here for the recipient.'}
              </p>
              <div className="pt-2 border-t border-[#1e2638]/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>Recipient: <strong className="text-slate-300">{recipientType === 'all' ? 'All Users' : selectedUser?.fullName || 'Selected User'}</strong></span>
                <span>Just Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast History Section */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 w-full max-w-full min-w-0 box-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2638] pb-4 w-full max-w-full min-w-0">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400 shrink-0 flex-shrink-0" /> 
              <span>Broadcast Dispatch History</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Log of previously transmitted system notifications and announcements.
            </p>
          </div>

          <div className="relative w-full sm:w-64 min-w-0">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter history log..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-400 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none min-w-0"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No broadcast history records found.
          </div>
        ) : (
          <div className="overflow-x-auto w-full max-w-full min-w-0 scrollbar-none">
            <table className="w-full min-w-[650px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1e2638] text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-3">Title & Preview</th>
                  <th className="p-3">Recipients</th>
                  <th className="p-3">Sent By Admin</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638]">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-[#161d2d] transition-colors">
                    <td className="p-3 max-w-xs sm:max-w-sm min-w-0">
                      <div className="font-bold text-white break-words min-w-0">{item.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed break-words min-w-0">
                        {item.message}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {item.recipientType === 'all' ? (
                        <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                          <Users className="w-3.5 h-3.5 shrink-0" />
                          <span>All Users ({item.recipientCount})</span>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-slate-200">{item.targetUserName || 'Specific User'}</div>
                          <div className="text-[10px] text-slate-400 font-mono break-all">{item.targetUserEmail || item.targetUserId}</div>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-300 font-mono text-[11px] break-all">
                      {item.sentByAdminEmail}
                    </td>
                    <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{new Date(item.sentAt).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1e2638] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-3 border-b border-[#1e2638] pb-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Broadcast Dispatch</h3>
                <p className="text-xs text-slate-400">Please verify the broadcast details before sending.</p>
              </div>
            </div>

            <div className="bg-[#0a0d14] border border-[#1e2638] rounded-xl p-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Recipients:</span>
                <span className="font-bold text-amber-400 text-sm">
                  {recipientType === 'all'
                    ? `All Users (${usersList.length} accounts)`
                    : `${selectedUser?.fullName} (${selectedUser?.email})`}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Title:</span>
                <span className="font-bold text-white">{title.trim()}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Message:</span>
                <p className="text-slate-300 leading-relaxed font-sans bg-[#111622] p-2.5 rounded-lg border border-[#1e2638] mt-1 max-h-32 overflow-y-auto">
                  {message.trim()}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="px-4 py-2 bg-[#182030] hover:bg-[#202b40] text-slate-300 font-bold text-xs rounded-xl border border-[#2e3b54] transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={submitting}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Broadcast</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
