import React, { useState } from 'react';
import {
  Bell,
  X,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Sparkles,
  Flame,
  ArrowRight,
  Check
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: 'deadline' | 'reminder' | 'streak' | 'insight';
  title: string;
  message: string;
  timeAgo: string;
  unread: boolean;
  priority?: 'high' | 'medium' | 'low';
  actionTaskId?: string;
  actionTaskTitle?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'deadline',
    title: 'Deadline Approaching Today',
    message: 'Complete AI/ML Assignment is due today at 6:00 PM. ~2h of focused work remaining.',
    timeAgo: '15m ago',
    unread: true,
    priority: 'high',
    actionTaskTitle: 'Complete AI/ML Assignment',
  },
  {
    id: 'notif-2',
    type: 'deadline',
    title: '2 Days Left to Complete',
    message: 'Prepare Chapters 3 & 4 has 2 days to go before the Friday test. Schedule 45 min revision today.',
    timeAgo: '1h ago',
    unread: true,
    priority: 'medium',
    actionTaskTitle: 'Prepare Chapters 3 & 4',
  },
  {
    id: 'notif-3',
    type: 'reminder',
    title: 'Upcoming Meeting in 30 Min',
    message: 'Team Architecture Review starts at 11:00 AM (11:00 AM - 12:30 PM).',
    timeAgo: '2h ago',
    unread: true,
    priority: 'high',
    actionTaskTitle: 'Team Architecture Review',
  },
  {
    id: 'notif-4',
    type: 'streak',
    title: '5-Day Productivity Streak! 🔥',
    message: 'You have stayed on top of your high-priority goals for 5 consecutive days.',
    timeAgo: 'Yesterday',
    unread: false,
    priority: 'low',
  },
  {
    id: 'notif-5',
    type: 'insight',
    title: 'AI Smart Schedule Tip',
    message: 'Protected a 30-minute buffer block before lunch to prevent cognitive fatigue.',
    timeAgo: 'Yesterday',
    unread: false,
    priority: 'low',
  },
];

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTask?: (taskTitle: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onSelectTask,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'deadlines' | 'unread'>('all');

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'deadlines') return n.type === 'deadline';
    if (activeFilter === 'unread') return n.unread;
    return true;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'deadline':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-purple-600" />;
      case 'streak':
        return <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />;
      case 'insight':
        return <Sparkles className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl border border-slate-100 relative flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">Notifications</h3>
              <p className="text-[11px] text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread reminders` : 'All caught up!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills & Actions */}
        <div className="flex items-center justify-between pt-3 pb-2 gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-xl gap-1">
            {(['all', 'deadlines', 'unread'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`py-1 px-2.5 rounded-lg text-[11px] font-bold capitalize transition-all ${
                  activeFilter === filter
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 transition"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 py-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markAsRead(item.id);
                if (item.actionTaskTitle && onSelectTask) {
                  onSelectTask(item.actionTaskTitle);
                  onClose();
                }
              }}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                item.unread
                  ? 'bg-purple-50/50 border-purple-200/80 shadow-2xs'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {item.timeAgo}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {item.message}
                  </p>

                  {item.actionTaskTitle && (
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1 font-bold text-purple-700 hover:underline">
                        <span>Open Focus / Task</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>

                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-slate-600">No notifications here</p>
              <p className="text-[11px] mt-0.5">You're all set on your tasks and schedule!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
