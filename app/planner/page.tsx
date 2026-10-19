"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import {
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  ChevronRight,
  Brain,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlannerPage() {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSubjects() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("subjects").select("*").eq("user_id", user.id);
      setSubjects(data || []);
    }
    fetchSubjects();
  }, [supabase]);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/planner/generate", {
        method: "POST",
      });
      const data = await response.json();
      setPlan(data.plan);
    } catch (error) {
      console.error("Failed to generate plan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">AI Study Planner</h1>
            <p className="text-slate-500 mt-1">Smart revision schedules tailored to your deadlines.</p>
          </div>
          <button
            onClick={generatePlan}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {plan ? "Regenerate Plan" : "Generate Daily Plan"}
          </button>
        </div>

        {!plan && !loading ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Brain className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Ready to boost your productivity?</h3>
            <p className="text-slate-500 mt-2 mb-8">
              StudyMate AI will analyze your upcoming exams, task priorities, and current schedule to create a realistic, high-impact study plan for today.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                <p className="text-xs font-medium text-slate-600">Prioritizes urgent assignments</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                <p className="text-xs font-medium text-slate-600">Suggests optimal break times</p>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <Brain className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">AI is crafting your plan...</h3>
            <p className="text-slate-500 mt-2">Analyzing your workload, preferences, and deadlines.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Today&apos;s Schedule
                  </h3>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                </div>

                <div className="divide-y divide-slate-50">
                  {plan.sessions.map((session: any, i: number) => (
                    <div key={i} className={cn(
                      "p-6 flex gap-6 items-start transition-colors",
                      session.type === 'break' ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                    )}>
                      <div className="w-20 text-sm font-bold text-slate-400 mt-1">{session.time}</div>
                      <div className="flex-1 flex gap-4">
                        <div className={cn(
                          "mt-1 p-2 rounded-xl",
                          session.type === 'study' ? "bg-indigo-100 text-primary" :
                          session.type === 'break' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                        )}>
                          {session.type === 'study' ? <BookOpen className="h-5 w-5" /> :
                           session.type === 'break' ? <Coffee className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{session.title}</h4>
                          <p className="text-sm text-slate-500 mt-1">{session.description}</p>
                          {session.subject && (
                            <span className="inline-block mt-3 px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                              {session.subject}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
                <h3 className="text-xl font-bold mb-4">AI Insight</h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                  {plan.insight}
                </p>
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <Brain className="h-8 w-8 text-indigo-200" />
                    <div>
                      <p className="text-xs font-medium text-indigo-200">Focus Score</p>
                      <p className="text-lg font-bold">High (88%)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-4">Recommended Topics</h4>
                <div className="space-y-3">
                  {plan.recommendations.map((rec: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-600">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
