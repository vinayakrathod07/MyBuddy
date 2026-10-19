"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import {
  Bell,
  Check,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchNotifications = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [supabase]);

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-500 mt-1">Stay updated with your academic schedule.</p>
          </div>
          <button
            onClick={markAllRead}
            className="text-sm font-semibold text-primary hover:underline flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all flex items-start gap-4",
                    !notification.is_read && "border-l-4 border-l-primary bg-indigo-50/30"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-2xl",
                    notification.type === 'reminder' ? "bg-amber-100 text-amber-600" :
                    notification.type === 'alert' ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {notification.type === 'reminder' ? <Clock className="h-5 w-5" /> :
                     notification.type === 'alert' ? <AlertCircle className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className={cn("font-bold text-slate-900", !notification.is_read && "text-primary")}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {format(new Date(notification.created_at), "MMM d, h:mm a")}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.is_read && (
                            <button onClick={() => markAsRead(notification.id)} className="p-1 text-slate-400 hover:text-emerald-500">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => deleteNotification(notification.id)} className="p-1 text-slate-400 hover:text-rose-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{notification.body}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Bell className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">All clear!</h3>
                <p className="text-slate-500 mt-2">You don&apos;t have any new notifications.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
