import { useState, useEffect, useRef } from "react";
import { Send, Bot, Copy, Trash2, Download, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/utils/apiClient";
import { toast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "assistant";
  content: string;
};

/* Language mapping */

const VOICE_LANG_MAP: Record<string, string> = {
  English: "en-US",
  Tamil: "ta-IN",
  Hindi: "hi-IN",
  Telugu: "te-IN",
  Malayalam: "ml-IN",
  Kannada: "kn-IN",
  Marathi: "mr-IN",
  Gujarati: "gu-IN",
  Bengali: "bn-IN",
  Punjabi: "pa-IN",
  Urdu: "ur-PK",
  Spanish: "es-ES",
  French: "fr-FR",
  German: "de-DE",
  Italian: "it-IT",
  Portuguese: "pt-PT",
  Russian: "ru-RU",
  Japanese: "ja-JP",
  Korean: "ko-KR",
  Chinese: "zh-CN",
  Arabic: "ar-SA",
};

const getTeachingLanguage = () =>
  (window as any).teachingLanguage &&
  VOICE_LANG_MAP[(window as any).teachingLanguage]
    ? (window as any).teachingLanguage
    : "English";

/* Shared history */

const getHistory = (): Message[] =>
  (window as any).teachingChatHistory || [];

const setHistory = (msgs: Message[]) => {
  (window as any).teachingChatHistory = msgs;
};

export function TeachingChatBox() {

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  /* Initial load */

  useEffect(() => {
    setMessages(getHistory());
  }, []);

  /* Smart auto scroll */

  useEffect(() => {

    const container = chatContainerRef.current;

    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

  }, [messages, loading]);

  /* File attach */

  const handleFileUpload = (file: File) => {

    const msg: Message = {
      role: "user",
      content: `[Attached file: ${file.name}]`,
    };

    const updated = [...getHistory(), msg];

    setHistory(updated);
    setMessages(updated);
  };

  /* Send message */

  const sendMessage = async () => {

    if (!input.trim()) return;

    const chunks = (window as any).currentChunks || [];

    if (!chunks.length) {
      toast({
        title: "Upload PDF first",
        description: "Please upload a PDF to ask questions.",
        variant: "destructive",
      });
      return;
    }

    const userMsg: Message = { role: "user", content: input };

    const history = [...getHistory(), userMsg];

    setHistory(history);
    setMessages(history);

    setInput("");
    setLoading(true);

    try {

      const res = await api.askQuestion({
        question: `Answer ONLY in ${getTeachingLanguage()}. ${input}`,
        session_id: "session_123",        // ✅ FIX ADDED
        document_id: "doc_123",           // ✅ FIX ADDED
        language: getTeachingLanguage(),  // ✅ FIX ADDED
        chunks: chunks                    // ✅ FIX ADDED
      });

      const aiMsg: Message = {
        role: "assistant",
        content: res.answer,
      };

      const updated = [...getHistory(), aiMsg];

      setHistory(updated);
      setMessages(updated);

      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(res.answer);
        u.lang = VOICE_LANG_MAP[getTeachingLanguage()];
        speechSynthesis.speak(u);
      }

    } catch (e: any) {

      toast({
        title: "Chat failed",
        description: e?.message ?? "Error",
        variant: "destructive",
      });

    } finally {
      setLoading(false);
    }
  };

  /* Download chat */

  const downloadChat = () => {

    const text = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const blob = new Blob([text], { type: "text/plain" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "chat-history.txt";
    a.click();
  };

  /* Delete message */

  const deleteMsg = (index: number) => {

    const updated = messages.filter((_, i) => i !== index);

    setHistory(updated);
    setMessages(updated);
  };

  /* Copy message */

  const copyMsg = (text: string) => {

    navigator.clipboard.writeText(text);

    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  return (

    <div className="glass-card p-6 animate-fade-in">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-4">

        <div className="flex items-center gap-3">

          <div className="p-2 rounded-lg bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Teaching Assistant Chat
            </h2>
            <p className="text-sm text-muted-foreground">
              Ask doubts about the current lesson
            </p>
          </div>

        </div>

        <button
          onClick={downloadChat}
          title="Download chat"
          className="hover:scale-110 transition"
        >
          <Download className="h-4 w-4 text-muted-foreground" />
        </button>

      </div>

      {/* MESSAGES */}

      <div
        ref={chatContainerRef}
        className="h-64 overflow-y-auto space-y-3 mb-4 pr-2"
      >

        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Ask questions like “Explain this again”.
          </p>
        )}

        <AnimatePresence>

          {messages.map((msg, i) => (

            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`group relative max-w-[80%] px-4 py-3 rounded-xl text-sm ${
                msg.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >

              <div className="whitespace-pre-wrap">
                {msg.content}
              </div>

              <div
                className={`absolute top-1 right-1 hidden group-hover:flex gap-1 ${
                  msg.role === "user"
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                }`}
              >

                <button
                  onClick={() => copyMsg(msg.content)}
                  className="p-1 rounded hover:bg-black/10"
                >
                  <Copy size={14} />
                </button>

                <button
                  onClick={() => deleteMsg(i)}
                  className="p-1 rounded hover:bg-black/10"
                >
                  <Trash2 size={14} />
                </button>

              </div>

            </motion.div>

          ))}

        </AnimatePresence>

        {loading && (
          <p className="text-sm text-muted-foreground">
            🤖 Teaching assistant is thinking...
          </p>
        )}

        <div ref={chatEndRef} />

      </div>

      {/* INPUT */}

      <div className="flex gap-2">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question here…"
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <input
          type="file"
          ref={fileInputRef}
          hidden
          onChange={(e) =>
            e.target.files && handleFileUpload(e.target.files[0])
          }
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 rounded-lg border hover:bg-muted"
        >
          <Paperclip size={16} />
        </button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={sendMessage}
          disabled={loading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-1"
        >
          <Send size={16} />
          Send
        </motion.button>

      </div>

    </div>
  );
}