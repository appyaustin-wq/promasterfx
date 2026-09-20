import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, User, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ALL_CURRENCIES } from '../../data/countries';

export const SettingsPage: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [fullName, setFullName] = useState(userProfile?.fullName || '');
  const [fullLegalName, setFullLegalName] = useState(userProfile?.fullLegalName || '');
  const [financialInstitution, setFinancialInstitution] = useState(userProfile?.financialInstitution || '');
  const [username, setUsername] = useState(userProfile?.username || '');
  const [phone, setPhone] = useState(userProfile?.phoneNumber || '');
  const [country, setCountry] = useState(userProfile?.country || 'United States');
  const [currency, setCurrency] = useState(userProfile?.preferredCurrency || 'USD ($) — US Dollar');
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      fullName,
      fullLegalName,
      financialInstitution,
      username,
      phoneNumber: phone,
      country,
      preferredCurrency: currency
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full max-w-full min-w-0">
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Account & Profile Settings</h1>
            <p className="text-xs text-slate-400">Manage profile credentials, preferred currency, and security options</p>
          </div>
        </div>
      </div>

      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-xl space-y-6">
        <h2 className="text-base font-extrabold text-white border-b border-[#1e2638] pb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-amber-400" /> Profile Details
        </h2>

        {saved && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile settings successfully saved to Firestore!</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Full Legal Name <span className="text-amber-400 font-bold">*</span>
              </label>
              <input
                type="text"
                value={fullLegalName}
                onChange={e => setFullLegalName(e.target.value)}
                placeholder="Enter your full legal name"
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-sm text-white outline-none"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Required for deposits & withdrawals</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Bank / Financial Institution <span className="text-amber-400 font-bold">*</span>
              </label>
              <input
                type="text"
                value={financialInstitution}
                onChange={e => setFinancialInstitution(e.target.value)}
                placeholder="e.g. JPMorgan Chase, Barclays, Fidelity"
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-sm text-white outline-none"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">Required for deposits & withdrawals</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Display Name / Profile Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={userProfile?.email || ''}
                className="w-full bg-[#0d111a] border border-[#1e2638] text-slate-500 rounded-xl py-2.5 px-3.5 text-sm outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Preferred Currency Base
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3.5 text-sm text-white outline-none"
              >
                {ALL_CURRENCIES.map(curr => (
                  <option key={curr} value={curr}>{curr}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow transition-all"
          >
            Save Profile Settings
          </button>
        </form>
      </div>
    </div>
  );
};
