"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GraduationCap, BookOpen, Calendar, Rocket, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "profile", title: "Basic Info", icon: GraduationCap },
  { id: "academic", title: "Academic Details", icon: BookOpen },
  { id: "preferences", title: "Preferences", icon: Calendar },
  { id: "complete", title: "Ready!", icon: Rocket },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    college: "",
    course: "",
    semester: 1,
    academic_year: "2024-2025",
    preferred_name: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkOnboarding() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed_at, preferred_name")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_completed_at) {
        router.push("/dashboard");
      } else if (profile?.preferred_name) {
        setFormData(prev => ({ ...prev, preferred_name: profile.preferred_name || "" }));
      }
    }
    checkOnboarding();
  }, [router, supabase]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      router.push("/dashboard");
    } catch (error) {
      console.error("Error saving onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Progress Bar */}
        <div className="flex w-full bg-slate-100 h-2">
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className={cn(
                "flex-1 transition-all duration-500",
                idx <= currentStep ? "bg-primary" : "bg-transparent"
              )}
            />
          ))}
        </div>

        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">StudentOS</span>
            </div>
            <div className="text-sm font-medium text-slate-400">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>

          {/* Step 1: Profile */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-3xl font-bold text-slate-900">Let&apos;s get to know you.</h2>
              <p className="text-slate-500">How should your assistant address you?</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Name</label>
                  <input
                    type="text"
                    value={formData.preferred_name}
                    onChange={(e) => setFormData({ ...formData, preferred_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary outline-none transition-all"
                    placeholder="e.g. Alex"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Academic */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-3xl font-bold text-slate-900">Academic details.</h2>
              <p className="text-slate-500">This helps personalize your schedule and AI responses.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">College/University</label>
                  <input
                    type="text"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary outline-none transition-all"
                    placeholder="e.g. Stanford University"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Course/Program</label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary outline-none transition-all"
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary outline-none transition-all bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h2 className="text-3xl font-bold text-slate-900">Your preferences.</h2>
              <p className="text-slate-500">Customize how StudentOS works for you.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary outline-none transition-all bg-white"
                  >
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                    <option value="Asia/Kolkata">IST (Indian Standard Time)</option>
                    {/* Add more common timezones or use a library */}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 3 && (
            <div className="text-center space-y-6 animate-in zoom-in-95">
              <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Rocket className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">You&apos;re all set!</h2>
              <p className="text-slate-500">
                Welcome to StudentOS AI. Your personalized academic companion is ready to help you succeed.
              </p>
            </div>
          )}

          <div className="flex justify-between mt-12">
            <button
              onClick={handleBack}
              disabled={currentStep === 0 || isLoading}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                currentStep === 0 ? "opacity-0 cursor-default" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            {currentStep === STEPS.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enter Dashboard"}
                {!isLoading && <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
