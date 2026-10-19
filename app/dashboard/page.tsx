"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  BookOpen,
  Plus,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, tasksRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("tasks").select("*, subjects(name)").eq("user_id", user.id).order("due_at", { ascending: true }).limit(5)
      ]);

      setProfile(profileRes.data);
      setTasks(tasksRes.data || []);
      setLoading(false);
    }

    fetchDashboardData();
  }, [supabase]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {profile?.preferred_name || "Student"}! 👋
            </h1>
            <p className="text-slate-500 mt-1">
              Here&apos;s what&apos;s happening with your academic life today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/tasks/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Tasks Due Today"
            value={tasks.filter(t => t.status !== 'completed').length.toString()}
            icon={Clock}
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
          <StatCard
            title="Next Class"
            value="10:30 AM"
            subValue="DBMS - Lab 3"
            icon={Calendar}
            color="text-primary"
            bgColor="bg-indigo-50"
          />
          <StatCard
            title="Attendance"
            value="84%"
            icon={TrendingUp}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <StatCard
            title="Alerts"
            value="2"
            subValue="Pending uploads"
            icon={AlertCircle}
            color="text-rose-600"
            bgColor="bg-rose-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Tasks */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Upcoming Deadlines</h2>
              <Link href="/tasks" className="text-sm text-primary font-medium hover:underline">View all</Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {tasks.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "mt-1 p-2 rounded-lg",
                          task.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                        )}>
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className={cn(
                            "font-semibold text-slate-900",
                            task.status === 'completed' && "line-through text-slate-400"
                          )}>
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {task.subjects?.name || "General"}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(task.due_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-primary transition-all">
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-6 w-6 text-slate-300" />
                  </div>
                  <h3 className="font-semibold text-slate-900">No upcoming tasks</h3>
                  <p className="text-sm text-slate-500 mt-1">You&apos;re all caught up! Take a break.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Briefing */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Daily AI Briefing</h2>
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="font-semibold">StudyMate AI</span>
              </div>
              <p className="text-indigo-50 text-sm leading-relaxed mb-6">
                &quot;Good morning, {profile?.preferred_name}! You have a busy day ahead. Your DBMS assignment is due tomorrow,
                and I notice you haven&apos;t reviewed the lecture notes from Monday yet.
                I suggest a 45-minute revision session at 4 PM.&quot;
              </p>
              <Link
                href="/chat"
                className="w-full py-3 bg-white text-indigo-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all"
              >
                Start Study Session
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ title, value, subValue, icon: Icon, color, bgColor }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </div>
      <div className={cn("p-3 rounded-xl", bgColor)}>
        <Icon className={cn("h-6 w-6", color)} />
      </div>
    </div>
  );
}
