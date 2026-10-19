import { createAdminClient } from "@/lib/supabase/server";
import { processDocument } from "@/lib/ai/rag";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    // In a production environment, this should be handled by a queue/worker
    // to avoid timeout. For this implementation, we run it as a floating promise
    // or use a longer timeout.

    // We don't await this to respond quickly to the UI,
    // but the process will continue in the background.
    processDocument(documentId).catch(err => {
      console.error("Background document processing failed:", err);
    });

    return NextResponse.json({ message: "Processing started" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
