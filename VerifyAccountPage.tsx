import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export const VerifyAccountPage: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [docType, setDocType] = useState('Passport');
  const [docNumber, setDocNumber] = useState('');
  const [submitted, setSubmitted] = useState(userProfile?.kycSubmitted || false);
  const [loading, setLoading] = useState(false);

  const handleSubmitKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await updateUserProfile({
      kycSubmitted: true,
      verified: true
    });
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Identity Verification (KYC)</h2>
            <p className="text-xs text-slate-400">Complete document verification to unlock full platform access and verified badges</p>
          </div>
        </div>

        <div className="text-right">
          <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${
            userProfile?.verified 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {userProfile?.verified ? 'VERIFIED' : 'UNVERIFIED'}
          </span>
        </div>
      </div>

      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-xl">
        {userProfile?.verified ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Your Profile is Verified</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your identity verification documents have been processed and approved for full trading access.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitKYC} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3 text-sm text-white outline-none"
                >
                  <option value="Passport">International Passport</option>
                  <option value="National ID">National ID Card</option>
                  <option value="Driver License">Driver's License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Document ID Number
                </label>
                <input
                  type="text"
                  required
                  value={docNumber}
                  onChange={e => setDocNumber(e.target.value)}
                  placeholder="e.g. A98231045"
                  className="w-full bg-[#0a0d14] border border-[#1e2638] focus:border-amber-500 rounded-xl py-2.5 px-3 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Document Upload
              </label>
              <div className="border-2 border-dashed border-[#1e2638] hover:border-amber-500/50 rounded-2xl p-8 text-center bg-[#0a0d14] cursor-pointer transition-colors">
                <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">Drag & drop your document file or click to browse</p>
                <p className="text-[11px] text-slate-500 mt-1">Supports PNG, JPG, or PDF</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              {loading ? 'Submitting Verification...' : 'Submit Verification Document'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
