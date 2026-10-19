"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import {
  Target,
  Flag,
  TrendingUp,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Briefcase,
  GraduationCap,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  const fetchGoals = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setGoals(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, [supabase]);

  const toggleGoalStatus = async (goal: any) => {
    const newStatus = goal.status === "completed" ? "in_progress" : "completed";
    const { error } = await supabase
      .from("goals")
      .update({ status: newStatus, progress: newStatus === "completed" ? 100 : 50 })
      .eq("id", goal.id);

    if (error) alert(error.message);
    else fetchGoals();
  };

  const deleteGoal = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchGoals();
  };

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Goals & Aspirations</h1>
            <p className="text-slate-500 mt-1">Track your academic targets and career milestones.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            Set New Goal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GoalStat
            title="Total Goals"
            value={goals.length.toString()}
            icon={Target}
            color="text-indigo-600"
            bgColor="bg-indigo-50"
          />
          <GoalStat
            title="Completed"
            value={goals.filter(g => g.status === 'completed').length.toString()}
            icon={CheckCircle2}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
          <GoalStat
            title="Success Rate"
            value={goals.length > 0 ? `${Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100)}%` : "0%"}
            icon={TrendingUp}
            color="text-amber-600"
            bgColor="bg-amber-50"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.length > 0 ? (
              goals.map((goal) => (
                <div key={goal.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-2xl",
                        goal.category === 'Career' ? "bg-amber-50 text-amber-600" :
                        goal.category === 'Academic' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                      )}>
                        {goal.category === 'Career' ? <Briefcase className="h-6 w-6" /> :
                         goal.category === 'Academic' ? <GraduationCap className="h-6 w-6" /> : <Award className="h-6 w-6" />}
                      </div>
                      <div>
                        <h3 className={cn(
                          "text-xl font-bold text-slate-900",
                          goal.status === 'completed' && "text-slate-400 line-through"
                        )}>
                          {goal.title}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{goal.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleGoalStatus(goal)}
                        className={cn(
                          "p-2 rounded-xl transition-all",
                          goal.status === 'completed' ? "text-emerald-500 bg-emerald-50" : "text-slate-300 hover:text-slate-400 bg-slate-50"
                        )}
                      >
                        {goal.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    {goal.description || "No description provided."}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <span>Progress</span>
                      <span>{goal.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-1000",
                          goal.status === 'completed' ? "bg-emerald-500" : "bg-primary"
                        )}
                        style={{ width: `${goal.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {goal.target_date && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <Flag className="h-3.5 w-3.5" />
                        Target: {new Date(goal.target_date).toLocaleDateString()}
                      </div>
                      {goal.status !== 'completed' && new Date(goal.target_date) < new Date() && (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Overdue</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Target className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">What do you want to achieve?</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  Setting clear goals is the first step toward success. Add your academic or career targets here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-6">Set New Goal</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = Object.fromEntries(formData.entries());

              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              const { error } = await supabase.from("goals").insert([{
                ...data,
                user_id: user.id,
                status: 'in_progress',
                progress: 0
              }]);

              if (error) alert(error.message);
              else {
                setIsModalOpen(false);
                fetchGoals();
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Goal Title</label>
                <input name="title" required placeholder="e.g. Master React.js" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select name="category" className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="Academic">Academic</option>
                  <option value="Career">Career</option>
                  <option value="Skill">Skill</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Target Date</label>
                <input name="target_date" type="date" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea name="description" rows={3} placeholder="Why is this goal important?" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function GoalStat({ title, value, icon: Icon, color, bgColor }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={cn("p-4 rounded-2xl", bgColor)}>
        <Icon className={cn("h-6 w-6", color)} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
    </div>
  );
}
