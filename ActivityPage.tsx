import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  History, 
  Activity, 
  Bell, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Layers, 
  Megaphone, 
  ShieldCheck, 
  Check, 
  Trash2,
  Filter
} from 'lucide-react';

export const ActivityPage: React.FC = () => {
  const { 
    activities, 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useAuth();
  const [activeTab, setActiveTab] = useState<'activity' | 'notifications'>('activity');
  const [filterType, setFilterType] = useState<string>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !n.read;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6 w-full max-w-full min-w-0">
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Activity & Notifications</h1>
          <p className="text-xs text-slate-400 mt-1">Complete record of account security, order executions, and administrative notifications</p>
        </div>

        <div className="flex items-center gap-2 bg-[#0a0d14] p-1 rounded-xl border border-[#1e2638]">
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'activity' 
                ? 'bg-[#182030] text-amber-400 shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Activity Logs ({activities.length})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'notifications' 
                ? 'bg-[#182030] text-amber-400 shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> Notifications ({notifications.length})
            {unreadCount > 0 && (
              <span className="ml-1 bg-rose-500 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'activity' ? (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl overflow-hidden shadow-xl">
          {activities.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-500 space-y-2">
              <History className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No activity records logged yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1e2638] text-xs">
              {activities.map(act => (
                <div key={act.id} className="p-4 hover:bg-[#182030]/50 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1a2333] border border-[#2b374e] flex items-center justify-center font-bold text-amber-400 text-xs">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white">{act.title}</div>
                      <div className="text-slate-400">{act.description}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-slate-400">
                    <div>{new Date(act.timestamp).toLocaleTimeString()}</div>
                    <div className="text-[10px] text-slate-500">{new Date(act.timestamp).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#111622] border border-[#1e2638] rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e2638] pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-bold">
                <Filter className="w-3.5 h-3.5 text-slate-500" /> Filter:
              </span>
              {(['all', 'unread', 'deposit', 'withdrawal', 'loan', 'announcement', 'system'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors ${
                    filterType === type 
                      ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' 
                      : 'bg-[#0a0d14] text-slate-400 hover:text-white border border-[#1e2638]'
                  }`}
                >
                  {type === 'all' ? 'All' : type}
                </button>
              ))}
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => markAllNotificationsAsRead()}
                  className="px-3 py-1 bg-[#182030] hover:bg-[#202b40] text-amber-400 text-xs font-bold rounded-lg border border-[#2b374e] transition-colors"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all notifications?')) {
                      clearAllNotifications();
                    }
                  }}
                  className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg border border-rose-500/20 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-500 space-y-2">
              <Bell className="w-8 h-8 text-slate-600 mx-auto" />
              <p>No notifications match this filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#1e2638] text-xs">
              {filteredNotifications.map(notif => {
                let Icon = Bell;
                let iconColor = 'text-blue-400';
                let iconBg = 'bg-blue-400/10 border-blue-400/20 border';

                if (notif.type === 'deposit') {
                  Icon = ArrowDownCircle;
                  if (notif.status === 'approved') {
                    iconColor = 'text-emerald-400';
                    iconBg = 'bg-emerald-400/10 border-emerald-500/20 border';
                  } else {
                    iconColor = 'text-rose-400';
                    iconBg = 'bg-rose-400/10 border-rose-500/20 border';
                  }
                } else if (notif.type === 'withdrawal') {
                  Icon = ArrowUpCircle;
                  if (notif.status === 'approved') {
                    iconColor = 'text-emerald-400';
                    iconBg = 'bg-emerald-400/10 border-emerald-500/20 border';
                  } else {
                    iconColor = 'text-rose-400';
                    iconBg = 'bg-rose-400/10 border-rose-500/20 border';
                  }
                } else if (notif.type === 'loan') {
                  Icon = Layers;
                  if (notif.status === 'approved') {
                    iconColor = 'text-amber-400';
                    iconBg = 'bg-amber-400/10 border-amber-500/20 border';
                  } else {
                    iconColor = 'text-rose-400';
                    iconBg = 'bg-rose-400/10 border-rose-500/20 border';
                  }
                } else if (notif.type === 'announcement') {
                  Icon = Megaphone;
                  iconColor = 'text-amber-400';
                  iconBg = 'bg-amber-400/10 border border-amber-500/20';
                } else if (notif.type === 'system') {
                  Icon = ShieldCheck;
                  iconColor = 'text-sky-400';
                  iconBg = 'bg-sky-400/10 border border-sky-500/20';
                }

                return (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-[#182030]/50 transition-colors flex items-start justify-between gap-4 ${
                      !notif.read ? 'bg-[#182030]/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center font-bold text-xs shrink-0 mt-0.5`}>
                        <Icon className={`w-4 h-4 ${iconColor}`} />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-bold ${!notif.read ? 'text-white' : 'text-slate-300'}`}>
                            {notif.title}
                          </span>
                          {!notif.read && (
                            <span className="bg-amber-400/20 text-amber-400 border border-amber-400/30 text-[9px] px-1.5 py-0.2 rounded font-bold">
                              NEW
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 capitalize bg-[#0a0d14] px-1.5 py-0.5 rounded border border-[#1e2638]">
                            {notif.type}
                          </span>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-xs break-words">
                          {notif.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-center">
                      <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
                        {new Date(notif.createdAt).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-1">
                        {!notif.read && (
                          <button
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                          title="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
