import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getGeminiModel = (modelName?: string) => {
  return genAI.getGenerativeModel({ model: modelName || process.env.GEMINI_MODEL || "gemini-1.5-flash" });
};

export const getEmbeddingModel = (modelName?: string) => {
  return genAI.getGenerativeModel({ model: modelName || process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004" });
};

export async function generateText(prompt: string, context?: string) {
  const model = getGeminiModel();

  const fullPrompt = context
    ? `Context:\n${context}\n\nUser Prompt: ${prompt}`
    : prompt;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  return response.text();
}

export async function generateEmbedding(text: string) {
  const model = getEmbeddingModel();
  const result = await model.embedContent(text);
  return result.embedding.values;
}
