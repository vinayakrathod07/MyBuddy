import { createAdminClient } from "@/lib/supabase/server";
import { generateEmbedding } from "./gemini";

export async function getRelevantChunks(query: string, userId: string, limit = 5) {
  const supabase = createAdminClient();
  const embedding = await generateEmbedding(query);

  // Use rpc to call the vector similarity function in Postgres
  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: limit,
    filter_user_id: userId
  });

  if (error) {
    console.error("Vector search error:", error);
    return [];
  }

  return data || [];
}

export async function processDocument(documentId: string) {
  const supabase = createAdminClient();

  // 1. Get document details
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (docError || !doc) return;

  // Update status to processing
  await supabase.from("documents").update({ processing_status: "processing" }).eq("id", documentId);

  try {
    // 2. Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(doc.storage_path);

    if (downloadError) throw downloadError;

    // 3. Extract text (Simplified for TXT/PDF)
    const text = await fileData.text(); // Basic text extraction

    // 4. Chunking (Simple overlap chunking)
    const chunks = chunkText(text, 1000, 200);

    // 5. Generate embeddings and save
    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const embedding = await generateEmbedding(chunkText);

      await supabase.from("document_chunks").insert({
        user_id: doc.user_id,
        document_id: doc.id,
        chunk_index: i,
        chunk_text: chunkText,
        embedding: embedding,
        metadata: { title: doc.title, category: doc.category }
      });
    }

    // 6. Final update
    await supabase.from("documents").update({
      processing_status: "completed",
      extracted_text: text.slice(0, 10000) // Keep a sample
    }).eq("id", documentId);

  } catch (error) {
    console.error("Processing error:", error);
    await supabase.from("documents").update({ processing_status: "failed" }).eq("id", documentId);
  }
}

function chunkText(text: string, size: number, overlap: number) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size - overlap) {
    chunks.push(text.slice(i, i + size));
    if (i + size >= text.length) break;
  }
  return chunks;
}
