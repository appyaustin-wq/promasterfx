import React, { useState } from 'react';
import { WithdrawalCode, UserProfile } from '../../types';
import { Key, Shield, Plus, RefreshCw, Trash2, CheckCircle2, Clock, User, AlertTriangle, Copy, Check, Lock, Sparkles } from 'lucide-react';

interface WithdrawalCodesTabProps {
  withdrawalCodesList: WithdrawalCode[];
  usersList: UserProfile[];
  generatingSlot: number | null;
  selectedUserForCode: string;
  setSelectedUserForCode: (uid: string) => void;
  onGenerateCode: (slot: 1 | 2) => Promise<void>;
  onGenerateBothCodes: () => Promise<void>;
  onRevokeCode: (code: WithdrawalCode) => Promise<void>;
  onAssignCode: (codeId: string, userId: string) => Promise<void>;
  onRefresh: () => void;
}

export const WithdrawalCodesTab: React.FC<WithdrawalCodesTabProps> = ({
  withdrawalCodesList,
  usersList,
  generatingSlot,
  selectedUserForCode,
  setSelectedUserForCode,
  onGenerateCode,
  onGenerateBothCodes,
  onRevokeCode,
  onAssignCode,
  onRefresh,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'used' | 'revoked'>('all');

  const slot1Active = withdrawalCodesList.find(c => c.slotNumber === 1 && c.status === 'active');
  const slot2Active = withdrawalCodesList.find(c => c.slotNumber === 2 && c.status === 'active');
  const activeCount = [slot1Active, slot2Active].filter(Boolean).length;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredHistory = withdrawalCodesList.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 box-border overflow-x-hidden">
      {/* Top Banner & Quick Controls */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-5 shadow-xl space-y-5 w-full max-w-full min-w-0 box-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1e2638] pb-4 w-full max-w-full min-w-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 shrink-0 flex-shrink-0">
                <Key className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-extrabold text-white flex flex-wrap items-center gap-2 min-w-0">
                  <span className="break-words min-w-0">Admin Authorization Codes</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono font-bold shrink-0">
                    {activeCount}/2 Active Codes
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 break-words min-w-0">
                  Generate and manage single-use, cryptographically secure 6-digit numeric codes required for client withdrawals.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 flex-shrink-0">
            <button
              onClick={onRefresh}
              className="px-3 py-2 bg-[#182030] hover:bg-[#222c42] text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-[#2a3650] flex items-center gap-1.5 transition-all shrink-0 flex-shrink-0 whitespace-nowrap"
              title="Refresh Codes"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>

            <button
              onClick={onGenerateBothCodes}
              disabled={generatingSlot !== null}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0 flex-shrink-0 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              {generatingSlot === 3 ? 'Generating Both...' : 'Generate / Refresh Both Codes'}
            </button>
          </div>
        </div>

        {/* Optional User Assignment Selector */}
        <div className="bg-[#0a0d14] border border-[#1e2638] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <User className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Target specific user (optional):</span>
          </div>
          <select
            value={selectedUserForCode}
            onChange={e => setSelectedUserForCode(e.target.value)}
            className="bg-[#111622] border border-[#2a3650] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-amber-400 sm:w-72"
          >
            <option value="">Any user (open code)</option>
            {usersList.map(u => (
              <option key={u.uid} value={u.uid}>
                {u.fullName ? `${u.fullName} (${u.email})` : u.email}
              </option>
            ))}
          </select>
        </div>

        {/* 2 Active Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SLOT 1 */}
          <div className={`p-5 rounded-2xl border transition-all ${
            slot1Active 
              ? 'bg-[#0d121c] border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.06)]' 
              : 'bg-[#0a0d14] border-[#1e2638]'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 font-black text-xs flex items-center justify-center font-mono">
                  1
                </span>
                <span className="font-extrabold text-sm text-white">Authorization Code Slot 1</span>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                slot1Active 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {slot1Active ? 'Active & Ready' : 'Empty / Revoked'}
              </span>
            </div>

            {slot1Active ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#080a10] border border-amber-400/20 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Active Code</span>
                    <span className="text-2xl font-black font-mono tracking-widest text-amber-300">
                      {slot1Active.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(slot1Active.code, slot1Active.id)}
                    className="p-2.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 transition-all flex items-center gap-1.5 text-xs font-bold"
                    title="Copy 6-digit code"
                  >
                    {copiedId === slot1Active.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Generated:</span>
                    <span className="text-slate-200">{new Date(slot1Active.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned To:</span>
                    <span className="text-amber-300 font-semibold">
                      {slot1Active.assignedUserEmail || 'Any user'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => onGenerateCode(1)}
                    disabled={generatingSlot !== null}
                    className="flex-1 py-2 bg-[#182030] hover:bg-[#232e44] text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-[#2a3650] transition-all disabled:opacity-50"
                  >
                    {generatingSlot === 1 ? 'Regenerating...' : 'Regenerate Authorization Code 1'}
                  </button>
                  <button
                    onClick={() => onRevokeCode(slot1Active)}
                    className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-bold rounded-xl border border-rose-500/30 transition-all"
                    title="Revoke code immediately"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-slate-500">No active code in Authorization Slot 1</p>
                <button
                  onClick={() => onGenerateCode(1)}
                  disabled={generatingSlot !== null}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {generatingSlot === 1 ? 'Generating...' : 'Generate Authorization Code 1'}
                </button>
              </div>
            )}
          </div>

          {/* SLOT 2 */}
          <div className={`p-5 rounded-2xl border transition-all ${
            slot2Active 
              ? 'bg-[#0d121c] border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.06)]' 
              : 'bg-[#0a0d14] border-[#1e2638]'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 font-black text-xs flex items-center justify-center font-mono">
                  2
                </span>
                <span className="font-extrabold text-sm text-white">Authorization Code Slot 2</span>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                slot2Active 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {slot2Active ? 'Active & Ready' : 'Empty / Revoked'}
              </span>
            </div>

            {slot2Active ? (
              <div className="space-y-3">
                <div className="p-3 bg-[#080a10] border border-amber-400/20 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Active Code</span>
                    <span className="text-2xl font-black font-mono tracking-widest text-amber-300">
                      {slot2Active.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(slot2Active.code, slot2Active.id)}
                    className="p-2.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 transition-all flex items-center gap-1.5 text-xs font-bold"
                    title="Copy 6-digit code"
                  >
                    {copiedId === slot2Active.id ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400 text-[11px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Generated:</span>
                    <span className="text-slate-200">{new Date(slot2Active.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned To:</span>
                    <span className="text-amber-300 font-semibold">
                      {slot2Active.assignedUserEmail || 'Any user'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => onGenerateCode(2)}
                    disabled={generatingSlot !== null}
                    className="flex-1 py-2 bg-[#182030] hover:bg-[#232e44] text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-[#2a3650] transition-all disabled:opacity-50"
                  >
                    {generatingSlot === 2 ? 'Regenerating...' : 'Regenerate Authorization Code 2'}
                  </button>
                  <button
                    onClick={() => onRevokeCode(slot2Active)}
                    className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-bold rounded-xl border border-rose-500/30 transition-all"
                    title="Revoke code immediately"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-slate-500">No active code in Authorization Slot 2</p>
                <button
                  onClick={() => onGenerateCode(2)}
                  disabled={generatingSlot !== null}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow transition-all disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {generatingSlot === 2 ? 'Generating...' : 'Generate Authorization Code 2'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Log / History Table */}
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 w-full max-w-full min-w-0 box-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2638] pb-4 w-full max-w-full min-w-0">
          <div>
            <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0 flex-shrink-0" /> 
              <span>Authorization Code Audit History ({withdrawalCodesList.length})</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Full lifecycle tracking of all generated, consumed, and revoked codes with cryptographic hash audit trail
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#0a0d14] p-1 rounded-xl border border-[#1e2638] text-xs shrink-0 flex-shrink-0 overflow-x-auto scrollbar-none">
            {(['all', 'active', 'used', 'revoked'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-amber-400 text-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto w-full max-w-full min-w-0 scrollbar-none">
          <table className="w-full min-w-[750px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[10px] font-bold uppercase text-slate-400">
                <th className="p-3">Slot</th>
                <th className="p-3">Code</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned User</th>
                <th className="p-3">Created</th>
                <th className="p-3">Used / Consumed</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2638]">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No authorization codes matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map(c => (
                  <tr key={c.id} className="hover:bg-[#182030]/50">
                    <td className="p-3">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold text-[11px] inline-flex items-center justify-center">
                        {c.slotNumber}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-amber-300 text-sm tracking-wider">
                          {c.code}
                        </span>
                        <button
                          onClick={() => handleCopy(c.code, c.id)}
                          className="text-slate-400 hover:text-white p-1 shrink-0"
                          title="Copy Code"
                        >
                          {copiedId === c.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : c.status === 'used'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 min-w-0">
                      {c.assignedUserEmail ? (
                        <div className="min-w-0">
                          <div className="text-white font-medium break-words min-w-0">{c.assignedUserName || c.assignedUserEmail}</div>
                          <div className="text-[10px] text-slate-400 font-mono break-all min-w-0">{c.assignedUserEmail}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Any User</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-[11px] min-w-0">
                      {c.status === 'used' ? (
                        <div className="min-w-0">
                          <div className="text-cyan-300 font-semibold break-all min-w-0">{c.usedByEmail || 'User'}</div>
                          <div className="text-[10px] text-slate-400 whitespace-nowrap">
                            {c.usedAt ? new Date(c.usedAt).toLocaleString() : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {c.status === 'active' && (
                        <button
                          onClick={() => onRevokeCode(c)}
                          className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-bold rounded-lg border border-rose-500/30 text-[11px] transition-all inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Revoke</span>
                        </button>
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
  );
};
