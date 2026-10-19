import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, CheckCircle, GraduationCap, Mic, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="ml-2 text-xl font-bold tracking-tight text-slate-900">StudentOS <span className="text-primary">AI</span></span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Login
          </Link>
          <Link
            className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            href="/signup"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your Entire Academic Life, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                    Powered by Intelligence.
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl dark:text-slate-400 mt-4">
                  Manage timetable, assignments, notes, and documents in one secure place.
                  Talk to your personalized AI assistant that knows your schedule and coursework.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  href="/signup"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  href="#demo"
                >
                  See how it works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border bg-slate-50/50">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Mic className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Voice-First AI Assistant</h3>
                <p className="text-slate-500">
                  Ask your assistant about your schedule, deadlines, or document contents using natural speech.
                  It listens and talks back.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border bg-slate-50/50">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <BookOpen className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold">Smart Document Vault</h3>
                <p className="text-slate-500">
                  Securely upload your lecture notes and papers. Our RAG technology lets you query them
                  like you're talking to a tutor.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 rounded-2xl border bg-slate-50/50">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Calendar className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Personalized Planner</h3>
                <p className="text-slate-500">
                  Automatically generate study schedules based on your exam dates, subject difficulty,
                  and personal goals.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © 2026 StudentOS AI. Final Year BCA Project. Team: Vinayak, Himaja, Twesha, Harshita.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link className="text-xs hover:underline underline-offset-4" href="#">
              Privacy Policy
            </Link>
            <Link className="text-xs hover:underline underline-offset-4" href="#">
              Terms of Service
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
