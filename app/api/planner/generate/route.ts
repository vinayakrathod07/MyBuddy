import { createServerClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Gather context
    const [tasks, timetable, subjects, profile] = await Promise.all([
      supabase.from("tasks").select("*, subjects(name)").eq("user_id", user.id).eq("status", "todo").order("due_at", { ascending: true }),
      supabase.from("timetable_entries").select("*, subjects(name)").eq("user_id", user.id),
      supabase.from("subjects").select("*").eq("user_id", user.id),
      supabase.from("profiles").select("*").eq("id", user.id).single()
    ]);

    // 2. Build prompt for AI
    const systemPrompt = `
      You are an expert academic study planner.
      Given the student's tasks, timetable, and subjects, generate a highly effective daily study plan.

      DATA:
      Student Profile: ${JSON.stringify(profile.data)}
      Tasks: ${JSON.stringify(tasks.data)}
      Today's Classes (Timetable): ${JSON.stringify(timetable.data)}
      Subjects: ${JSON.stringify(subjects.data)}

      OUTPUT FORMAT:
      Return ONLY a JSON object with this structure:
      {
        "plan": {
          "sessions": [
            { "time": "09:00 AM", "type": "study" | "break" | "class", "title": "string", "description": "string", "subject": "string" }
          ],
          "insight": "A brief motivational insight or advice for the day.",
          "recommendations": ["string", "string"]
        }
      }

      INSTRUCTIONS:
      - Respect the student's class times (already in timetable).
      - Prioritize tasks with closer due dates or high priority.
      - Include breaks (Pomodoro style or similar).
      - Ensure study sessions are focused on specific subjects from the list.
    `;

    const aiResponse = await generateText("Generate a plan for today.", systemPrompt);

    // Clean JSON response (sometimes models add markdown blocks)
    const jsonString = aiResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const plan = JSON.parse(jsonString);

    return NextResponse.json(plan);

  } catch (error: any) {
    console.error("Planner API Error:", error);
    // Fallback static plan if AI fails
    return NextResponse.json({
      plan: {
        sessions: [
          { time: "09:00 AM", type: "study", title: "Morning Deep Work", description: "Focus on your most difficult subject.", subject: "General" },
          { time: "11:00 AM", type: "break", title: "Short Break", description: "Stretch and hydrate.", subject: null },
          { time: "11:15 AM", type: "study", title: "Task Review", description: "Work on pending assignments.", subject: "General" }
        ],
        insight: "Consistency is key. Focus on progress, not perfection.",
        recommendations: ["Complete one assignment today", "Review notes before class"]
      }
    });
  }
}
