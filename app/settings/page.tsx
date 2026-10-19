"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Bell,
  Lock,
  Eye,
  Volume2,
  Moon,
  Globe,
  Shield,
  Trash2,
  Save,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
      setLoading(false);
    }
    fetchSettings();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").update(profile).eq("id", profile.id);
    if (error) alert(error.message);
    setSaving(false);
  };

  if (loading) return <DashboardShell><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DashboardShell>;

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Manage your account and app preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <nav className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold bg-primary text-white rounded-xl shadow-md shadow-primary/20">
              <User className="h-4 w-4" />
              Profile
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
              <Bell className="h-4 w-4" />
              Notifications
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
              <Shield className="h-4 w-4" />
              Privacy & Security
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
              <Volume2 className="h-4 w-4" />
              Voice & AI
            </button>
          </nav>

          <div className="md:col-span-3 space-y-6">
            <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-slate-900 border-b border-slate-50 pb-4">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    value={profile?.full_name || ""}
                    onChange={e => setProfile({...profile, full_name: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Preferred Name</label>
                  <input
                    value={profile?.preferred_name || ""}
                    onChange={e => setProfile({...profile, preferred_name: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">College/University</label>
                  <input
                    value={profile?.college || ""}
                    onChange={e => setProfile({...profile, college: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Course</label>
                  <input
                    value={profile?.course || ""}
                    onChange={e => setProfile({...profile, course: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    value={profile?.semester || 1}
                    onChange={e => setProfile({...profile, semester: parseInt(e.target.value)})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-70"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </form>

            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-slate-900 text-rose-600">Danger Zone</h3>
              <p className="text-sm text-slate-500">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="flex items-center gap-2 px-6 py-3 border border-rose-200 text-rose-600 rounded-2xl text-sm font-bold hover:bg-rose-50 transition-all">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
