"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/client";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Trash2,
  MoreVertical,
  Plus,
  Loader2,
  Bot,
  User,
  Paperclip,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  citations?: any[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchConversations();
    setupSpeechRecognition();
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    setConversations(data || []);
    if (data && data.length > 0 && !currentConversationId) {
      loadConversation(data[0].id);
    }
  };

  const loadConversation = async (id: string) => {
    setCurrentConversationId(id);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });

    setMessages(data || []);
  };

  const setupSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Automatically send after voice input
        sendMessage(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const sendMessage = async (content?: string) => {
    const messageContent = content || input;
    if (!messageContent.trim() || isLoading) return;

    setIsLoading(true);
    setInput("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let convoId = currentConversationId;
      if (!convoId) {
        const { data: newConvo } = await supabase
          .from("conversations")
          .insert([{ user_id: user.id, title: messageContent.slice(0, 40) }])
          .select()
          .single();
        convoId = newConvo.id;
        setCurrentConversationId(convoId);
        fetchConversations();
      }

      // Add user message to UI
      const userMessage: Message = {
        id: Math.random().toString(),
        role: "user",
        content: messageContent,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Call AI Backend
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          conversationId: convoId
        })
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      const aiMessage: Message = {
        id: data.id || Math.random().toString(),
        role: "assistant",
        content: data.content,
        created_at: new Date().toISOString(),
        citations: data.citations
      };

      setMessages(prev => [...prev, aiMessage]);

      if (autoSpeak) {
        speak(data.content.replace(/[*#]/g, ''));
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  return (
    <DashboardShell>
      <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">StudyMate AI</h2>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Online & Grounded</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={cn(
                "p-2 rounded-lg transition-all",
                autoSpeak ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-50"
              )}
              title={autoSpeak ? "Auto-speak enabled" : "Auto-speak disabled"}
            >
              {autoSpeak ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            <button
              onClick={createNewChat}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-all"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
            <div className="h-8 w-px bg-slate-100 mx-2" />
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar scroll-smooth"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">How can I help you today?</h3>
              <p className="text-slate-500 mt-2">
                Ask me about your schedule, assignments, or search through your uploaded lecture notes.
              </p>

              <div className="grid grid-cols-1 gap-3 mt-8 w-full">
                <button
                  onClick={() => setInput("What classes do I have tomorrow?")}
                  className="p-4 text-sm font-medium text-slate-600 border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-primary/20 transition-all text-left flex items-center justify-between group"
                >
                  "What classes do I have tomorrow?"
                  <ChevronDown className="h-4 w-4 -rotate-90 text-slate-300 group-hover:text-primary" />
                </button>
                <button
                  onClick={() => setInput("Do I have any pending assignments?")}
                  className="p-4 text-sm font-medium text-slate-600 border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-primary/20 transition-all text-left flex items-center justify-between group"
                >
                  "Do I have any pending assignments?"
                  <ChevronDown className="h-4 w-4 -rotate-90 text-slate-300 group-hover:text-primary" />
                </button>
                <button
                  onClick={() => setInput("Summarize my Operating Systems notes.")}
                  className="p-4 text-sm font-medium text-slate-600 border border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-primary/20 transition-all text-left flex items-center justify-between group"
                >
                  "Summarize my Operating Systems notes."
                  <ChevronDown className="h-4 w-4 -rotate-90 text-slate-300 group-hover:text-primary" />
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-4 max-w-[85%] animate-in slide-in-from-bottom-2",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0",
                  msg.role === "user" ? "bg-slate-100" : "bg-primary text-white"
                )}>
                  {msg.role === "user" ? <User className="h-5 w-5 text-slate-600" /> : <Bot className="h-5 w-5" />}
                </div>
                <div className={cn(
                  "space-y-2",
                  msg.role === "user" ? "text-right" : "text-left"
                )}>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-tr-none"
                      : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100"
                  )}>
                    <ReactMarkdown
                      className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-white"
                    >
                      {msg.content}
                    </ReactMarkdown>

                    {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200/50 space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sources</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.citations.map((cite, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-medium text-slate-600">
                              <Paperclip className="h-3 w-3" />
                              {cite.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {format(new Date(msg.created_at), "h:mm a")}
                    </span>
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => speak(msg.content)}
                        className="p-1 text-slate-400 hover:text-primary transition-colors"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start gap-4 max-w-[85%] animate-pulse">
              <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5 text-primary opacity-50" />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100">
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-slate-50">
          <div className="max-w-4xl mx-auto relative group">
            {isListening && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-bounce shadow-lg">
                <Mic className="h-3 w-3" />
                Listening...
              </div>
            )}

            <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-3xl p-2 pr-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all focus-within:bg-white focus-within:border-primary/30">
              <button
                onClick={toggleListening}
                className={cn(
                  "p-3 rounded-2xl transition-all",
                  isListening ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-200" : "text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                )}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ask anything..."
                rows={1}
                className="flex-1 bg-transparent border-none py-3 px-2 text-sm text-slate-700 outline-none resize-none max-h-32 min-h-[44px]"
              />

              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className={cn(
                  "p-3 rounded-2xl transition-all shadow-md",
                  input.trim() && !isLoading ? "bg-primary text-white shadow-primary/20 hover:scale-105" : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                )}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">
              StudyMate AI can make mistakes. Verify important academic information.
            </p>
          </div>
        </div>
      </div>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="fixed bottom-32 right-8 z-50 animate-in fade-in slide-in-from-right-4">
          <button
            onClick={stopSpeaking}
            className="flex items-center gap-3 bg-white border border-slate-100 shadow-2xl rounded-2xl p-4 pr-6 hover:bg-slate-50 transition-all group"
          >
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center relative overflow-hidden">
              <Volume2 className="h-5 w-5 text-primary z-10" />
              <div className="absolute inset-0 bg-primary/20 animate-ping opacity-50" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Speaking</p>
              <p className="text-sm font-bold text-slate-700">Click to stop</p>
            </div>
            <Trash2 className="h-4 w-4 text-slate-300 group-hover:text-rose-500 transition-colors ml-2" />
          </button>
        </div>
      )}
    </DashboardShell>
  );
}
