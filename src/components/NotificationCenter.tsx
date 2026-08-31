import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  CheckCheck,
  Sparkles,
  Award,
  AlertCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Volume2,
} from "lucide-react";
import { LmsNotification, NotificationType } from "../types";
import { StorageService } from "../utils/storage";
import { sound } from "../utils/audio";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: LmsNotification[];
  onRefreshNotifications?: () => void;
  onSelectCourse: (courseId: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onRefreshNotifications,
  onSelectCourse,
}) => {
  const [filter, setFilter] = useState<"all" | "updates" | "certs">("all");
  const [localItems, setLocalItems] = useState<LmsNotification[]>(() => {
    if (notifications && Array.isArray(notifications)) return notifications;
    return StorageService.getNotifications() || [];
  });

  useEffect(() => {
    if (isOpen) {
      if (notifications && Array.isArray(notifications)) {
        setLocalItems(notifications);
      } else {
        setLocalItems(StorageService.getNotifications() || []);
      }
    }
  }, [isOpen, notifications]);

  if (!isOpen) return null;

  const currentList = Array.isArray(localItems) ? localItems : [];

  const filtered = currentList.filter((n) => {
    if (!n) return false;
    if (filter === "updates") return n.type === "course_update";
    if (filter === "certs") return n.type === "certificate";
    return true;
  });

  const unreadCount = currentList.filter((n) => n && !n.read).length;

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsRead();
    const updated = StorageService.getNotifications() || [];
    setLocalItems(updated);
    if (onRefreshNotifications) onRefreshNotifications();
  };

  const handleItemClick = (n: LmsNotification) => {
    if (!n) return;
    StorageService.markNotificationRead(n.id);
    const updated = StorageService.getNotifications() || [];
    setLocalItems(updated);
    if (onRefreshNotifications) onRefreshNotifications();

    if (n.payload?.courseId) {
      onSelectCourse(n.payload.courseId);
      onClose();
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case "course_update":
        return <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">📦</span>;
      case "certificate":
        return <span className="p-2 rounded-lg bg-amber-500/20 text-amber-400">🎓</span>;
      case "announcement":
        return <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">📢</span>;
      case "alert":
        return <span className="p-2 rounded-lg bg-rose-500/20 text-rose-400">⚠️</span>;
      default:
        return <span className="p-2 rounded-lg bg-white/5 text-slate-300">🔔</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#16191f] border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base text-white">Student Notifications</h2>
              <p className="text-xs text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread alerts` : "All notifications read"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                id="mark-all-read-btn"
                onClick={handleMarkAllRead}
                title="Mark all as read"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-xs flex items-center gap-1 transition"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
            <button
              id="test-chime-btn"
              onClick={() => sound.playNotification()}
              title="Test notification sound chime"
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              id="close-notifications-btn"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2 bg-[#0f1115]">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              filter === "all"
                ? "bg-emerald-500 text-black font-semibold"
                : "bg-white/5 text-slate-400 hover:text-slate-200"
            }`}
          >
            All ({currentList.length})
          </button>
          <button
            onClick={() => setFilter("updates")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              filter === "updates"
                ? "bg-emerald-500 text-black font-semibold"
                : "bg-white/5 text-slate-400 hover:text-slate-200"
            }`}
          >
            Course Updates
          </button>
          <button
            onClick={() => setFilter("certs")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              filter === "certs"
                ? "bg-emerald-500 text-black font-semibold"
                : "bg-white/5 text-slate-400 hover:text-slate-200"
            }`}
          >
            Certificates
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notifications found.</p>
              <p className="text-xs text-slate-600 mt-1">Real-time alerts will appear here automatically.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`p-3.5 rounded-xl border transition cursor-pointer relative group ${
                  !item.read
                    ? "bg-white/5 border-emerald-500/40 shadow-xs"
                    : "bg-[#0f1115] border-white/5 hover:bg-white/5 hover:border-white/10"
                }`}
              >
                {!item.read && (
                  <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                )}

                <div className="flex items-start gap-3">
                  <div className="text-xl shrink-0 mt-0.5">{getTypeIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-semibold truncate ${!item.read ? "text-white" : "text-slate-200"}`}>
                        {item.title}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.message}</p>

                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5 text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timestamp}
                      </span>

                      {item.actionLabel && (
                        <span className="text-emerald-400 font-medium group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                          {item.actionLabel}
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info on data sovereignty & sync */}
        <div className="p-3 border-t border-white/10 bg-[#0f1115] text-center text-[11px] text-slate-400">
          🔒 Real-time alerts encrypted & routed through sovereign DB.
        </div>
      </div>
    </div>
  );
};
