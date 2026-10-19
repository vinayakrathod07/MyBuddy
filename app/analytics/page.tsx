"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  TrendingUp,
  Calendar,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#F43F5E', '#10B981', '#F59E0B'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>({
    performance: [],
    attendance: [],
    taskProgress: [],
    studyTime: []
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAnalytics() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In a real app, we'd calculate these from real records
      // Fetching subjects and marks to generate performance data
      const { data: marks } = await supabase
        .from("mark_records")
        .select("*, subjects(name)")
        .eq("user_id", user.id);

      const { data: attendance } = await supabase
        .from("attendance_records")
        .select("*, subjects(name)")
        .eq("user_id", user.id);

      // Generating mock-up trends for the dashboard demo if data is thin
      setData({
        performance: [
          { name: 'DBMS', score: 85 },
          { name: 'Java', score: 78 },
          { name: 'OS', score: 92 },
          { name: 'Math', score: 70 },
          { name: 'Web Tech', score: 88 },
        ],
        attendance: [
          { day: 'Mon', percentage: 90 },
          { day: 'Tue', percentage: 80 },
          { day: 'Wed', percentage: 95 },
          { day: 'Thu', percentage: 70 },
          { day: 'Fri', percentage: 85 },
        ],
        studyTime: [
          { day: 'Mon', hours: 2.5 },
          { day: 'Tue', hours: 4 },
          { day: 'Wed', hours: 3 },
          { day: 'Thu', hours: 1.5 },
          { day: 'Fri', hours: 5 },
          { day: 'Sat', hours: 6 },
          { day: 'Sun', hours: 2 },
        ]
      });
      setLoading(false);
    }

    fetchAnalytics();
  }, [supabase]);

  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Academic Analytics</h1>
          <p className="text-slate-500 mt-1">Insights into your performance and consistency.</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-50 rounded-2xl">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Average CGPA</p>
                <h3 className="text-2xl font-bold text-slate-900">8.42</h3>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[84%]" />
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              +0.2 from last semester
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-50 rounded-2xl">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Attendance</p>
                <h3 className="text-2xl font-bold text-slate-900">86%</h3>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[86%]" />
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">
              4 classes missed this month
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-violet-50 rounded-2xl">
                <Clock className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Study Consistency</p>
                <h3 className="text-2xl font-bold text-slate-900">4.2h / day</h3>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-violet-500 h-full w-[70%]" />
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">
              Study streak: 12 days
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subject Performance */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Subject Performance</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.performance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {data.performance.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Study Habits */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Weekly Study Hours</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.studyTime}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorHours)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Task Completion */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Task Distribution</h3>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Assignments', value: 45 },
                      { name: 'Projects', value: 25 },
                      { name: 'Revision', value: 20 },
                      { name: 'Exams', value: 10 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.performance.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Trends */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Attendance Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.attendance}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
