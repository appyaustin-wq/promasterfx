import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const { orders } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = orders.filter(o => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Order Execution History</h1>
          <p className="text-xs text-slate-400">Log of all market and limit orders placed across major asset categories</p>
        </div>

        <div className="flex bg-[#0a0d14] p-1 rounded-xl border border-[#1e2638]">
          {['all', 'completed', 'open', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                filterStatus === st ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl overflow-hidden shadow-xl">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500 space-y-2">
            <Clock className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No orders recorded under "{filterStatus}" status.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e2638] bg-[#0d111a] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-4">Order ID</th>
                  <th className="py-4 px-4">Asset</th>
                  <th className="py-4 px-4">Type</th>
                  <th className="py-4 px-4">Direction</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Total Value</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2638] text-xs">
                {filteredOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-[#182030]/50 transition-colors">
                    <td className="py-4 px-4 font-mono text-amber-400 font-bold">{ord.id}</td>
                    <td className="py-4 px-4 font-bold text-white">{ord.symbol}</td>
                    <td className="py-4 px-4 font-semibold uppercase text-slate-300">{ord.orderType}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        ord.direction === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {ord.direction}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-white">${ord.price.toFixed(ord.price < 10 ? 4 : 2)}</td>
                    <td className="py-4 px-4 font-mono font-bold text-white">${ord.totalAmount.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-500/20">
                        {(ord.status || '').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-slate-400">
                      {new Date(ord.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
