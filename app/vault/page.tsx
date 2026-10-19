"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  FileText,
  Search,
  Trash2,
  Download,
  ExternalLink,
  Loader2,
  FileUp,
  Filter,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function VaultPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const supabase = createClient();

  const fetchDocuments = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [docsRes, subjectsRes] = await Promise.all([
      supabase.from("documents").select("*, subjects(name)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("subjects").select("*").eq("user_id", user.id)
    ]);

    setDocuments(docsRes.data || []);
    setSubjects(subjectsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [supabase]);

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    const subjectId = formData.get("subject_id") as string;
    const category = formData.get("category") as string;

    if (!file) {
      alert("Please select a file");
      setIsUploading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Create document record in database
      const { data: docData, error: dbError } = await supabase
        .from("documents")
        .insert([
          {
            user_id: user.id,
            title: file.name,
            category,
            subject_id: subjectId || null,
            storage_path: filePath,
            mime_type: file.type,
            size_bytes: file.size,
            processing_status: "pending"
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. Trigger AI Processing (RAG pipeline)
      // In a real app, this would be a webhook or background job.
      // For this implementation, we'll simulate the start of processing.
      await fetch(`/api/docs/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docData.id })
      });

      setIsUploadModalOpen(false);
      fetchDocuments();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = async (doc: any) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await supabase.storage.from("documents").remove([doc.storage_path]);
      await supabase.from("documents").delete().eq("id", doc.id);
      fetchDocuments();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Document Vault</h1>
            <p className="text-slate-500 mt-1">Store and query your academic materials.</p>
          </div>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <FileUp className="h-4 w-4" />
            Upload Document
          </button>
        </div>

        {/* Search & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents by name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Files</span>
            <span className="text-lg font-bold text-slate-900">{documents.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {filteredDocs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Document</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Added</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 truncate max-w-[200px]">{doc.title}</div>
                              <div className="text-[10px] text-slate-400">{(doc.size_bytes / 1024 / 1024).toFixed(2)} MB</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {doc.subjects?.name || "Uncategorized"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {doc.category || "General"}
                        </td>
                        <td className="px-6 py-4">
                          {doc.processing_status === 'completed' ? (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Indexed
                            </span>
                          ) : doc.processing_status === 'failed' ? (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase">
                              <AlertCircle className="h-3.5 w-3.5" />
                              Error
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Processing
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {format(new Date(doc.created_at), "MMM d, yyyy")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg border border-transparent hover:border-slate-100">
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteDocument(doc)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center text-center px-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <FileText className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Your vault is empty</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                  Upload lecture notes, textbooks, or previous papers to start using the AI document search.
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-6 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  Upload your first document
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-6">Upload Document</h3>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors group relative">
                <input
                  type="file"
                  name="file"
                  required
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept=".pdf,.txt,.doc,.docx"
                />
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-slate-50 rounded-full mb-4 group-hover:bg-primary/10 transition-colors">
                    <FileUp className="h-8 w-8 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="font-semibold text-slate-900">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, TXT or DOC (Max 10MB)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                <select name="subject_id" className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">General / No Subject</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
                <select name="category" className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="Lecture Notes">Lecture Notes</option>
                  <option value="Question Paper">Question Paper</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Project Report">Project Report</option>
                  <option value="Study Material">Study Material</option>
                  <option value="Certificate">Certificate</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70"
                >
                  {isUploading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Start Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
