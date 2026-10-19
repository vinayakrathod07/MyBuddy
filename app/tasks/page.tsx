"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  MoreVertical,
  Calendar as CalendarIcon,
  Trash2,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const supabase = createClient();

  const fetchTasks = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [tasksRes, subjectsRes] = await Promise.all([
      supabase.from("tasks").select("*, subjects(name, color)").eq("user_id", user.id).order("due_at", { ascending: true }),
      supabase.from("subjects").select("*").eq("user_id", user.id)
    ]);

    setTasks(tasksRes.data || []);
    setSubjects(subjectsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, [supabase]);

  const toggleTaskStatus = async (task: any) => {
    const newStatus = task.status === "completed" ? "todo" : "completed";
    const completedAt = newStatus === "completed" ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus, completed_at: completedAt })
      .eq("id", task.id);

    if (error) {
      alert(error.message);
    } else {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus, completed_at: completedAt } : t));
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchTasks();
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Tasks & Assignments</h1>
            <p className="text-slate-500 mt-1">Keep track of your academic workload.</p>
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {filteredTasks.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="group p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className={cn(
                        "mt-0.5 transition-colors",
                        task.status === 'completed' ? "text-emerald-500" : "text-slate-300 hover:text-slate-400"
                      )}
                    >
                      {task.status === 'completed' ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn(
                          "font-semibold text-slate-900 truncate",
                          task.status === 'completed' && "line-through text-slate-400 font-normal"
                        )}>
                          {task.title}
                        </h3>
                        {task.priority === 'high' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider">High</span>
                        )}
                        {task.priority === 'urgent' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">Urgent</span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        {task.subjects && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.subjects.color || '#cbd5e1' }} />
                            {task.subjects.name}
                          </div>
                        )}
                        {task.due_at && (
                          <div className={cn(
                            "flex items-center gap-1.5 text-xs font-medium",
                            new Date(task.due_at) < new Date() && task.status !== 'completed' ? "text-rose-500" : "text-slate-400"
                          )}>
                            <Clock className="h-3.5 w-3.5" />
                            {format(new Date(task.due_at), "MMM d, h:mm a")}
                          </div>
                        )}
                        {task.task_type && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Tag className="h-3.5 w-3.5" />
                            {task.task_type.charAt(0).toUpperCase() + task.task_type.slice(1)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
                <p className="text-slate-500 mt-1 max-w-xs mx-auto">
                  {searchQuery ? "No tasks matching your search." : "You don't have any tasks right now. Great job!"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-6">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h3>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data: any = Object.fromEntries(formData.entries());

              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              const payload = {
                ...data,
                user_id: user.id,
                due_at: data.due_at ? new Date(data.due_at).toISOString() : null,
                estimated_minutes: parseInt(data.estimated_minutes) || null,
              };

              let error;
              if (editingTask) {
                const { error: err } = await supabase.from("tasks").update(payload).eq("id", editingTask.id);
                error = err;
              } else {
                const { error: err } = await supabase.from("tasks").insert([payload]);
                error = err;
              }

              if (error) {
                alert(error.message);
              } else {
                setIsModalOpen(false);
                fetchTasks();
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Task Title</label>
                  <input
                    name="title"
                    defaultValue={editingTask?.title}
                    required
                    placeholder="e.g. Finish DBMS Assignment 2"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                    <select name="subject_id" defaultValue={editingTask?.subject_id} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">No Subject</option>
                      {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Task Type</label>
                    <select name="task_type" defaultValue={editingTask?.task_type || 'assignment'} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="assignment">Assignment</option>
                      <option value="project">Project</option>
                      <option value="exam">Examination</option>
                      <option value="submission">Submission</option>
                      <option value="revision">Revision</option>
                      <option value="personal">Personal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date & Time</label>
                    <input
                      name="due_at"
                      type="datetime-local"
                      defaultValue={editingTask?.due_at ? format(new Date(editingTask.due_at), "yyyy-MM-dd'T'HH:mm") : ""}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
                    <select name="priority" defaultValue={editingTask?.priority || 'medium'} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description (Optional)</label>
                  <textarea
                    name="description"
                    defaultValue={editingTask?.description}
                    rows={3}
                    placeholder="Add details about this task..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  {editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
