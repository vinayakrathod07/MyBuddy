# StudentOS AI: Personalized Academic & Life Assistant

**Academic Year**: 2026–2027  
**Team**: Vinayak Rathod (Lead), Koka Himaja, Twesha Tyagi, Harshita Periwal  
**Supervisor**: Dr. Prakash K.

StudentOS AI is a premium, full-stack, AI-powered companion designed to help college students manage their academic life. It combines scheduling, task management, document retrieval (RAG), and a voice-enabled AI assistant grounded in the user's own data.

## 🚀 Key Features

- **StudyMate AI Chatbot**: Context-aware assistant that knows your timetable, tasks, and documents.
- **Voice Interaction**: Two-way talk-back capability (Listen → Understand → Speak).
- **RAG (Retrieval-Augmented Generation)**: Securely upload PDF/Text notes and query them using vector search.
- **Smart Timetable**: Overlap detection and recurring class management.
- **AI Study Planner**: Automatically generated daily revision schedules based on deadlines.
- **Academic Analytics**: Performance tracking, attendance trends, and goal progress.
- **Secure Vault**: Private storage with Row Level Security (RLS) and pgvector indexing.

## 🛠 Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn/UI.
- **Backend**: Next.js Server Actions & API Routes.
- **Database**: Supabase (PostgreSQL) with `pgvector` for AI search.
- **AI**: Google Gemini 1.5 Flash (Generation) & Gemini Embedding (Vectorization).
- **Voice**: Web Speech API (Browser-based STT and TTS).
- **Auth**: Supabase Auth (Email/Password).
- **Storage**: Supabase Storage (Private Buckets).

## 📋 Prerequisites

- Node.js 18+
- Supabase Project (Free Tier works)
- Google AI Studio API Key (Gemini)

## ⚙️ Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd studentos-ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env.local` file based on `.env.example`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GEMINI_API_KEY=your_gemini_key
   ```

4. **Database Setup**:
   - Enable the **Vector** extension in Supabase.
   - Run the migrations found in `/supabase/migrations/` in the Supabase SQL Editor.
   - Create a private storage bucket named `documents`.

5. **Run Locally**:
   ```bash
   npm run dev
   ```

## 🧪 Testing

Run the automated test suite:
```bash
npm test
```

## 🔐 Security & Privacy

- **Isolation**: Every table uses PostgreSQL RLS (Row Level Security) ensuring `auth.uid() = user_id`.
- **Private Data**: Document chunks and embeddings are strictly filtered by user ID at the database level.
- **AI Safety**: System prompts prevent prompt injection and ensure the model only uses authorized context.

## 📄 License
Final Year BCA Project Deliverable. Academic Year 2026-2027.
