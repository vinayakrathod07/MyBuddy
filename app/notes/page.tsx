"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Search,
  BookOpen,
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Edit3,
  Tag,
  ChevronRight,
  MoreVertical,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);

  const supabase = createClient();

  const fetchNotes = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [notesRes, subjectsRes] = await Promise.all([
      supabase.from("notes").select("*, subjects(name, color)").eq("user_id", user.id).order("note_date", { ascending: false }),
      supabase.from("subjects").select("*").eq("user_id", user.id)
    ]);

    setNotes(notesRes.data || []);
    setSubjects(subjectsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, [supabase]);

  const deleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) alert(error.message);
    else fetchNotes();
  };

  const filteredNotes = notes.filter(note =>
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Notes & Check-ins</h1>
            <p className="text-slate-500 mt-1">Capture class summaries and personal reflections.</p>
          </div>
          <button
            onClick={() => {
              setEditingNote(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search in your notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <div key={note.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {note.subjects?.name || "General"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingNote(note);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">{note.title || "Untitled Note"}</h3>
                  <p className="text-sm text-slate-500 line-clamp-4 flex-1 mb-4 leading-relaxed">
                    {note.content || "No content."}
                  </p>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <CalendarIcon className="h-3 w-3" />
                      {format(new Date(note.note_date), "MMM d, yyyy")}
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3 text-slate-300" />
                        <span className="text-[10px] text-slate-400 font-medium">{note.tags[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <BookOpen className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No notes found</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  Start capturing your thoughts and class check-ins here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-6">
              {editingNote ? "Edit Note" : "Daily Academic Check-in"}
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
                tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : [],
              };

              let error;
              if (editingNote) {
                const { error: err } = await supabase.from("notes").update(payload).eq("id", editingNote.id);
                error = err;
              } else {
                const { error: err } = await supabase.from("notes").insert([payload]);
                error = err;
              }

              if (error) {
                alert(error.message);
              } else {
                setIsModalOpen(false);
                fetchNotes();
              }
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                    <select name="subject_id" defaultValue={editingNote?.subject_id} className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="">General</option>
                      {subjects.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      name="note_date"
                      type="date"
                      defaultValue={editingNote?.note_date || format(new Date(), "yyyy-MM-dd")}
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                  <input
                    name="title"
                    defaultValue={editingNote?.title}
                    required
                    placeholder="e.g. DBMS Lecture - Normalization"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Content</label>
                  <textarea
                    name="content"
                    defaultValue={editingNote?.content}
                    rows={8}
                    required
                    placeholder="Topics covered, assignments given, or personal reflections..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tags (Comma separated)</label>
                  <input
                    name="tags"
                    defaultValue={editingNote?.tags?.join(', ')}
                    placeholder="e.g. important, exam, revision"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
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
                  {editingNote ? "Save Changes" : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
