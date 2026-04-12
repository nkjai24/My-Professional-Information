import { useState, useEffect } from "react";
import { Lightbulb, FolderOpen, FileText, Target } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "../hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import api from "@/utils/apiClient";

type Chunk = { id: number; text: string };

/**
 * Language → Browser TTS voice mapping
 */
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

const quickActions = [
  {
    id: 1,
    label: "Explain a concept",
    icon: Lightbulb,
    emoji: "💡",
    color: "from-yellow-400 to-orange-500",
    prompt: "Please explain the key concepts from this lesson in simple terms."
  },
  {
    id: 2,
    label: "Give me examples",
    icon: FileText,
    emoji: "📝",
    color: "from-blue-400 to-cyan-500",
    prompt: "Can you provide practical examples and real-world applications of the topics covered?"
  },
  {
    id: 3,
    label: "Suggest projects",
    icon: FolderOpen,
    emoji: "📂",
    color: "from-green-400 to-emerald-500",
    prompt: "What hands-on projects or exercises would help me practice these concepts?"
  },
  {
    id: 4,
    label: "Practice questions",
    icon: Target,
    emoji: "🎯",
    color: "from-purple-400 to-pink-500",
    prompt: "Generate some practice questions to test my understanding of this material."
  }
];

export function QuickActions() {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [systemStatus, setSystemStatus] = useState("No files loaded");
  const [mode, setMode] = useState("Voice Learning");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkSystemStatus = () => {
      const globalChunks = (window as any).currentChunks;
      const chunkIndex = (window as any).currentChunkIndex || 0;

      if (globalChunks && globalChunks.length > 0) {
        setChunks(globalChunks);
        setCurrentChunkIndex(chunkIndex);
        setSystemStatus("System Ready");
        setMode("Voice Learning");
      } else {
        setChunks([]);
        setSystemStatus("Upload PDF first");
        setMode("File Upload");
      }
    };

    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const quickActionMut = useMutation({
    mutationFn: (payload: any) => api.askQuestionVoice(payload),
    onMutate: () => setIsProcessing(true),
    onSuccess: (data: { blob: Blob; url: string }) => {
      setIsProcessing(false);

      const audio = new Audio(data.url);
      audio.play().catch(console.error);

      (window as any).currentAudioUrl = data.url;
      (window as any).currentVoiceStatus = "Playing response";

      toast({
        title: "🎵 Voice Response Ready",
        description: "AI teacher is explaining in your selected language.",
      });
    },
    onError: () => setIsProcessing(false),
  });

  const textActionMut = useMutation({
    mutationFn: (payload: any) => api.askQuestion(payload),
    onMutate: () => setIsProcessing(true),
    onSuccess: (data: { answer: string }) => {
      setIsProcessing(false);

      const language =
        (window as any).teachingLanguage && VOICE_LANG_MAP[(window as any).teachingLanguage]
          ? (window as any).teachingLanguage
          : "English";

      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(data.answer);
        utterance.lang = VOICE_LANG_MAP[language] || "en-US";
        speechSynthesis.speak(utterance);
      }

      toast({
        title: "💬 Text Response Ready",
        description: "Explanation generated in selected language.",
      });
    },
    onError: () => setIsProcessing(false),
  });

  const handleActionClick = async (action: typeof quickActions[0]) => {
    if (chunks.length === 0) {
      toast({
        title: `${action.emoji} Upload Required`,
        description: "Please upload a PDF file first to use quick actions.",
        variant: "destructive",
      });
      return;
    }

    const language =
      (window as any).teachingLanguage && VOICE_LANG_MAP[(window as any).teachingLanguage]
        ? (window as any).teachingLanguage
        : "English";

    toast({
      title: `${action.emoji} ${action.label}`,
      description: "Activating AI teacher response...",
    });

    const payload = {
      question: `You are a teaching assistant. Teach and explain ONLY in ${language}. ${action.prompt}`,
      chunks,
      context_chunk_index: currentChunkIndex,
    };

    try {
      await quickActionMut.mutateAsync(payload);
    } catch {
      await textActionMut.mutateAsync(payload);
    }
  };

  const getStatusColor = (status: string): string => {
    if (status === "System Ready") return "text-green-600";
    if (status === "Upload PDF first") return "text-orange-600";
    return "text-muted-foreground";
  };

  const getModeColor = (mode: string): string => {
    if (mode === "Voice Learning") return "bg-primary/10 text-primary border-primary/20";
    if (mode === "File Upload") return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-muted/10 text-muted-foreground border-border";
  };

  return (
    <div className="glass-card p-6 animate-fade-in hover-bounce">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/10">
          <Target className="h-5 w-5 text-accent" />
        </div>
        <h2 className="text-lg font-semibold">Quick Actions</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Fast access to common learning actions. Click any button to trigger the Smart Teacher Robot.
      </p>

      <div className="space-y-3">
        {quickActions.map((action, index) => (
          <Button
            key={action.id}
            variant="outline"
            onClick={() => handleActionClick(action)}
            disabled={isProcessing || chunks.length === 0}
            className={`w-full justify-start gap-3 p-4 h-auto hover-bounce bg-gradient-to-r ${action.color} bg-opacity-10 border-transparent hover:shadow-lg transition-all duration-300 animate-slide-in-right ${
              chunks.length === 0 ? "opacity-50" : ""
            } ${isProcessing ? "opacity-75" : ""}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <span className="text-lg">{action.emoji}</span>
            <span className="font-medium">
              {isProcessing ? "Processing..." : action.label}
            </span>
            {chunks.length === 0 && (
              <span className="ml-auto text-xs text-orange-600">(Upload PDF)</span>
            )}
          </Button>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                chunks.length > 0 ? "bg-green-500" : "bg-orange-500"
              }`}
            ></div>
            <span className="text-muted-foreground">Files Ready:</span>
            <span className="font-medium">{chunks.length}</span>
            {chunks.length > 0 && (
              <span className="text-xs text-muted-foreground">
                (Chunk {currentChunkIndex + 1})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Mode:</span>
            <span className={`px-2 py-1 text-xs rounded-full border ${getModeColor(mode)}`}>
              {mode}
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-2">
          <div className="flex items-center gap-1 text-xs">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                systemStatus === "System Ready"
                  ? "bg-green-500"
                  : systemStatus === "Upload PDF first"
                  ? "bg-orange-500"
                  : "bg-gray-500"
              }`}
            ></div>
            <span className={getStatusColor(systemStatus)}>{systemStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
