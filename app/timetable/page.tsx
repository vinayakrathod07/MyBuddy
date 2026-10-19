"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetablePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  const supabase = createClient();

  const fetchTimetable = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [entriesRes, subjectsRes] = await Promise.all([
      supabase.from("timetable_entries").select("*, subjects(name, color, instructor)").eq("user_id", user.id),
      supabase.from("subjects").select("*").eq("user_id", user.id)
    ]);

    setEntries(entriesRes.data || []);
    setSubjects(subjectsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTimetable();
  }, [supabase]);

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this class?")) return;
    const { error } = await supabase.from("timetable_entries").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchTimetable();
  };

  const dayEntries = entries
    .filter(entry => entry.weekday === selectedDay)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Weekly Timetable</h1>
            <p className="text-slate-500 mt-1">Manage your class schedule and locations.</p>
          </div>
          <button
            onClick={() => {
              setEditingEntry(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Add Class
          </button>
        </div>

        {/* Day Selector */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
          {DAYS.map((day, index) => (
            <button
              key={day}
              onClick={() => setSelectedDay(index)}
              className={cn(
                "flex-1 min-w-[100px] py-3 text-sm font-semibold rounded-xl transition-all",
                selectedDay === index
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-500 hover:bg-slate-50"
              )}
            >
              {day}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {dayEntries.length > 0 ? (
              dayEntries.map((entry) => (
                <div key={entry.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 w-1.5 h-full"
                    style={{ backgroundColor: entry.subjects?.color || '#4F46E5' }}
                  />

                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <Clock className="h-4 w-4" />
                        {entry.start_time.slice(0, 5)} - {entry.end_time.slice(0, 5)}
                      </div>
                      <span className="text-xs text-slate-400 font-medium mt-1">Class Duration</span>
                    </div>

                    <div className="h-10 w-[1px] bg-slate-100 hidden md:block" />

                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{entry.title || entry.subjects?.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {entry.room || "TBA"}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <User className="h-4 w-4 text-slate-400" />
                          {entry.subjects?.instructor || "No instructor"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingEntry(entry);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white py-20 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center text-center">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                  <Clock className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No classes scheduled</h3>
                <p className="text-slate-500 mt-1">Enjoy your {DAYS[selectedDay]}!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-6">
              {editingEntry ? "Edit Class" : "Add New Class"}
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
                weekday: parseInt(data.weekday)
              };

              let error;
              if (editingEntry) {
                const { error: err } = await supabase.from("timetable_entries").update(payload).eq("id", editingEntry.id);
                error = err;
              } else {
                const { error: err } = await supabase.from("timetable_entries").insert([payload]);
                error = err;
              }

              if (error) {
                alert(error.message);
              } else {
                setIsModalOpen(false);
                fetchTimetable();
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                  <select name="subject_id" defaultValue={editingEntry?.subject_id} required className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select Subject</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Class Title (Optional)</label>
                  <input
                    name="title"
                    defaultValue={editingEntry?.title}
                    placeholder="e.g. Lab Session, Lecture"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Day of Week</label>
                    <select name="weekday" defaultValue={editingEntry?.weekday ?? selectedDay} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-primary/20">
                      {DAYS.map((day, i) => (
                        <option key={day} value={i}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Room/Location</label>
                    <input name="room" defaultValue={editingEntry?.room} placeholder="e.g. Room 302" className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time</label>
                    <input name="start_time" type="time" required defaultValue={editingEntry?.start_time} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">End Time</label>
                    <input name="end_time" type="time" required defaultValue={editingEntry?.end_time} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
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
                  {editingEntry ? "Save Changes" : "Add Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
