"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  BookOpen,
  Trash2,
  Edit2,
  Layers,
  GraduationCap,
  Loader2,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AcademicPage() {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"semesters" | "subjects">("subjects");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [semRes, subRes] = await Promise.all([
      supabase.from("semesters").select("*").eq("user_id", user.id).order("start_date", { ascending: false }),
      supabase.from("subjects").select("*, semesters(name)").eq("user_id", user.id).order("name")
    ]);

    setSemesters(semRes.data || []);
    setSubjects(subRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleDelete = async (table: string, id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;

    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      alert(error.message);
    } else {
      fetchData();
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Academic Records</h1>
            <p className="text-slate-500 mt-1">Manage your semesters and subjects.</p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Add {activeTab === "subjects" ? "Subject" : "Semester"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("subjects")}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-all relative",
              activeTab === "subjects" ? "text-primary" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Subjects
            {activeTab === "subjects" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button
            onClick={() => setActiveTab("semesters")}
            className={cn(
              "px-6 py-3 text-sm font-medium transition-all relative",
              activeTab === "semesters" ? "text-primary" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Semesters
            {activeTab === "semesters" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "subjects" ? (
              subjects.length > 0 ? (
                subjects.map((subject) => (
                  <AcademicCard
                    key={subject.id}
                    title={subject.name}
                    subtitle={subject.subject_code || "No code"}
                    details={[
                      { icon: Layers, text: subject.semesters?.name || "No semester" },
                      { icon: GraduationCap, text: subject.instructor || "No instructor" }
                    ]}
                    color={subject.color}
                    onEdit={() => {
                      setEditingItem(subject);
                      setIsModalOpen(true);
                    }}
                    onDelete={() => handleDelete("subjects", subject.id)}
                  />
                ))
              ) : (
                <EmptyState
                  title="No subjects yet"
                  description="Start by adding the subjects you are studying this semester."
                  icon={BookOpen}
                />
              )
            ) : (
              semesters.length > 0 ? (
                semesters.map((semester) => (
                  <AcademicCard
                    key={semester.id}
                    title={semester.name}
                    subtitle={semester.is_current ? "Current Semester" : "Past Semester"}
                    details={[
                      { icon: Calendar, text: `${semester.start_date || 'N/A'} - ${semester.end_date || 'N/A'}` }
                    ]}
                    onEdit={() => {
                      setEditingItem(semester);
                      setIsModalOpen(true);
                    }}
                    onDelete={() => handleDelete("semesters", semester.id)}
                  />
                ))
              ) : (
                <EmptyState
                  title="No semesters yet"
                  description="Define your academic terms to organize your subjects."
                  icon={Layers}
                />
              )
            )}
          </div>
        )}
      </div>

      {/* Basic Modal Implementation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-4">
              {editingItem ? "Edit" : "Add"} {activeTab === "subjects" ? "Subject" : "Semester"}
            </h3>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data: any = Object.fromEntries(formData.entries());

              const { data: { user } } = await supabase.auth.getUser();
              if (!user) return;

              let error;
              if (activeTab === "subjects") {
                const payload = {
                  ...data,
                  user_id: user.id,
                  difficulty_rating: parseInt(data.difficulty_rating) || 3
                };
                if (editingItem) {
                  const { error: err } = await supabase.from("subjects").update(payload).eq("id", editingItem.id);
                  error = err;
                } else {
                  const { error: err } = await supabase.from("subjects").insert([payload]);
                  error = err;
                }
              } else {
                const payload = {
                  ...data,
                  user_id: user.id,
                  is_current: data.is_current === "on"
                };
                if (editingItem) {
                  const { error: err } = await supabase.from("semesters").update(payload).eq("id", editingItem.id);
                  error = err;
                } else {
                  const { error: err } = await supabase.from("semesters").insert([payload]);
                  error = err;
                }
              }

              if (error) {
                alert(error.message);
              } else {
                setIsModalOpen(false);
                fetchData();
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    name="name"
                    defaultValue={editingItem?.name}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                {activeTab === "subjects" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Subject Code</label>
                      <input name="subject_code" defaultValue={editingItem?.subject_code} className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Instructor</label>
                      <input name="instructor" defaultValue={editingItem?.instructor} className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Semester</label>
                      <select name="semester_id" defaultValue={editingItem?.semester_id} className="w-full rounded-xl border border-slate-200 px-4 py-2 bg-white outline-none">
                        <option value="">Select Semester</option>
                        {semesters.map(sem => (
                          <option key={sem.id} value={sem.id}>{sem.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                        <input name="start_date" type="date" defaultValue={editingItem?.start_date} className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                        <input name="end_date" type="date" defaultValue={editingItem?.end_date} className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input name="is_current" type="checkbox" defaultChecked={editingItem?.is_current} className="rounded text-primary" />
                      <label className="text-sm text-slate-600">Current Semester</label>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function AcademicCard({ title, subtitle, details, color, onEdit, onDelete }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
      {color && (
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: color }} />
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <p className="text-sm font-medium text-primary mt-0.5">{subtitle}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 text-slate-400 hover:text-primary rounded-lg hover:bg-slate-50">
            <Edit2 className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {details.map((detail: any, idx: number) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-slate-500">
            <detail.icon className="h-4 w-4 text-slate-400" />
            {detail.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, description, icon: Icon }: any) {
  return (
    <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center text-center">
      <div className="p-4 bg-slate-50 rounded-full mb-4">
        <Icon className="h-8 w-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-slate-500 max-w-xs mt-1">{description}</p>
    </div>
  );
}
