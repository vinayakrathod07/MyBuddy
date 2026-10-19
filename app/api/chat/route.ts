import { createServerClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/ai/gemini";
import { getRelevantChunks } from "@/lib/ai/rag";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, conversationId } = await req.json();
    const supabase = createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Retrieve Personal Context (Timetable, Tasks, etc.)
    const [timetable, tasks, profile] = await Promise.all([
      supabase.from("timetable_entries").select("*, subjects(name, room)").eq("user_id", user.id),
      supabase.from("tasks").select("*, subjects(name)").eq("user_id", user.id).eq("status", "todo"),
      supabase.from("profiles").select("*").eq("id", user.id).single()
    ]);

    // 2. Retrieve Document Context (RAG)
    const chunks = await getRelevantChunks(message, user.id);
    const documentContext = chunks.map((c: any) => c.chunk_text).join("\n\n");
    const citations = chunks.map((c: any) => ({ title: c.metadata.title, id: c.document_id }));

    // 3. Build System Prompt with Data
    const systemPrompt = `
      You are StudyMate AI, a personalized academic assistant for ${profile.data?.preferred_name || 'the student'}.

      STUDENT RECORDS:
      Timetable: ${JSON.stringify(timetable.data)}
      Current Tasks: ${JSON.stringify(tasks.data)}

      UPLOADED DOCUMENTS CONTEXT:
      ${documentContext}

      INSTRUCTIONS:
      - Answer based on the provided records and documents.
      - If information is not in the records, use your general knowledge but clarify it's general.
      - Be concise, helpful, and encouraging.
      - If asked about the schedule or tasks, refer to the "STUDENT RECORDS".
      - If explaining a concept from documents, refer to the "UPLOADED DOCUMENTS CONTEXT".
      - Never invent grades, attendance, or tasks that aren't in the records.
    `;

    // 4. Generate AI Response
    const aiResponse = await generateText(message, systemPrompt);

    // 5. Store message in history
    const { data: savedMsg, error: saveError } = await supabase
      .from("messages")
      .insert([{
        user_id: user.id,
        conversation_id: conversationId,
        role: "assistant",
        content: aiResponse,
        citations: citations
      }])
      .select()
      .single();

    if (saveError) throw saveError;

    // Also update conversation timestamp
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);

    return NextResponse.json({
      id: savedMsg.id,
      content: aiResponse,
      citations: citations
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
