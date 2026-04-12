import { useState, useEffect, useRef } from "react";
import { Mic, Pause, Square, Play } from "lucide-react";
import { Button } from "./ui/button";

type Chunk = { id: number; text: string };

type VoiceMessage = {
  role: "user" | "assistant";
  content: string;
};

/* =========================
   🌍 Language Support
   ========================= */
const VOICE_LANG_MAP: Record<string, string> = {
  English: "en-US",
  Tamil: "ta-IN",
  Hindi: "hi-IN",
  Telugu: "te-IN",
};

const getTeachingLanguage = () =>
  (window as any).teachingLanguage &&
  VOICE_LANG_MAP[(window as any).teachingLanguage]
    ? (window as any).teachingLanguage
    : "English";

export function VoiceControls() {
  const [isListening, setIsListening] = useState(false);
  const [isTeaching, setIsTeaching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState<string | null>(null);
  const [voiceHistory, setVoiceHistory] = useState<VoiceMessage[]>([]);

  const recognitionRef = useRef<any>(null);
  const stopRef = useRef(false);

  /* =========================
     🔊 FORCE VOICE LOAD
     ========================= */
  useEffect(() => {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => {
      speechSynthesis.getVoices();
    };
  }, []);

  /* =========================
     🔊 SPEAK
     ========================= */
  const speak = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }

      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const language = getTeachingLanguage();
      const langCode = VOICE_LANG_MAP[language] || "en-US";

      utterance.lang = langCode;
      utterance.rate = 0.9;

      const voices = speechSynthesis.getVoices();
      const selectedVoice =
        voices.find((v) => v.lang === langCode) ||
        voices.find((v) => v.lang.startsWith(langCode.split("-")[0])) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        null;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      speechSynthesis.speak(utterance);
    });
  };

  /* =========================
     🎓 TEACHING LOOP (FIXED)
     ========================= */
  const runTeachingLoop = async (chunks: Chunk[]) => {
    if (isTeaching) return;

    setIsTeaching(true);
    stopRef.current = false;
    setStatus("Teaching started");

    const language = getTeachingLanguage();

    await speak(`I will now teach in ${language}.`);

    for (let i = 0; i < chunks.length; i++) {
      if (stopRef.current) break;

      const chunk = chunks[i];

      // ✅ HARD FILTER (CRITICAL FIX)
      if (
        !chunk ||
        typeof chunk.text !== "string" ||
        chunk.text.trim().length < 20 ||
        chunk.text.includes("Sample chunk")
      ) {
        console.error("❌ Skipping invalid chunk:", chunk);
        continue;
      }

      setStatus(`Teaching section ${i + 1} of ${chunks.length}`);

      const payload = {
        document_id: (window as any).currentDocumentId || "doc_123",
        topic: "From Uploaded Document", // ✅ REMOVE "General"
        difficulty_level: (window as any).currentDifficulty || "Beginner",
        language: language.toLowerCase(),
        session_id: (window as any).sessionId || "session_123",
        chunk_text: String(chunk.text),
        chunk_index: i,
      };

      try {
        const res = await fetch(
          "http://localhost:8000/api/teaching/start-teaching",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        const content =
          data.lesson_content?.content ||
          data.lesson_content ||
          data.answer;

        if (content) {
          setVoiceHistory((p) => [
            ...p,
            { role: "assistant", content },
          ]);

          if (!stopRef.current) {
            await speak(content);
          }
        }
      } catch (err) {
        console.error(`Error teaching chunk ${i}:`, err);
      }

      if (!stopRef.current) {
        await new Promise((r) => setTimeout(r, 800));
      }
    }

    setIsTeaching(false);
    setStatus("Teaching completed");
    stopRef.current = false;
  };

  /* =========================
     ▶ START TEACHING (FIXED)
     ========================= */
  const handleStartTeaching = () => {
    let chunks: Chunk[] =
      (window as any).currentChunks ||
      JSON.parse(localStorage.getItem("st_chunks") || "[]");

    // ✅ FILTER BAD DATA BEFORE START
    chunks = chunks.filter(
      (c) =>
        c &&
        typeof c.text === "string" &&
        c.text.trim().length > 20 &&
        !c.text.includes("Sample chunk")
    );

    if (!chunks.length) {
      setError("No valid PDF content found. Re-upload file.");
      return;
    }

    setError(null);
    setIsPaused(false);

    runTeachingLoop(chunks);
  };

  /* =========================
     ⏸ / ▶ PAUSE
     ========================= */
  const handlePauseContinue = () => {
    if (!isPaused) {
      speechSynthesis.cancel();
      setIsPaused(true);
      setStatus("Teaching paused");
    } else {
      setIsPaused(false);
      setStatus("Teaching resumed");
    }
  };

  /* =========================
     ⏹ STOP
     ========================= */
  const handleStopTeaching = () => {
    speechSynthesis.cancel();
    stopRef.current = true;
    setIsTeaching(false);
    setIsPaused(false);
    setStatus("Teaching stopped");
  };

  /* =========================
     🎤 SPEECH RECOGNITION
     ========================= */
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window))
      return;

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = VOICE_LANG_MAP[getTeachingLanguage()] || "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();

      setVoiceHistory((p) => [
        ...p,
        { role: "user", content: transcript },
      ]);

      if (transcript.includes("start teaching")) handleStartTeaching();
      else if (transcript.includes("pause teaching")) handlePauseContinue();
      else if (transcript.includes("continue teaching")) handlePauseContinue();
      else if (transcript.includes("stop teaching")) handleStopTeaching();
    };

    recognitionRef.current = recognition;
  }, []);

  /* =========================
     🎛 UI (UNCHANGED)
     ========================= */
  return (
    <div className="glass-card p-6 animate-fade-in hover-bounce">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Mic className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Voice Controls</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <Button onClick={handleStartTeaching} disabled={isTeaching} className="flex-1">
          Start Teaching
        </Button>

        <Button
          variant="outline"
          onClick={handlePauseContinue}
          disabled={!isTeaching}
          className="flex-1"
        >
          {isPaused ? (
            <>
              <Play className="h-4 w-4 mr-1" /> Continue
            </>
          ) : (
            <>
              <Pause className="h-4 w-4 mr-1" /> Pause
            </>
          )}
        </Button>

        <Button
          variant="destructive"
          onClick={handleStopTeaching}
          disabled={!isTeaching}
          className="flex-1"
        >
          <Square className="h-4 w-4 mr-1" /> Stop
        </Button>
      </div>

      <div className="flex flex-col items-center mb-6">
        <button
          onClick={() =>
            isListening
              ? recognitionRef.current?.stop()
              : recognitionRef.current?.start()
          }
          className={`w-20 h-20 rounded-full border-4 transition-all ${
            isListening
              ? "bg-primary border-primary text-white pulse-glow"
              : "bg-primary/10 border-primary/30 text-primary"
          }`}
        >
          <Mic className="h-8 w-8 mx-auto" />
        </button>
        <p className="text-sm text-muted-foreground mt-2">
          {isListening ? "Listening..." : "Click to speak"}
        </p>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        Status: <span className="font-medium">{status}</span>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold mb-3">
          Voice Interaction History
        </h3>

        <div className="max-h-48 overflow-y-auto space-y-2">
          {voiceHistory.map((msg, i) => (
            <div
              key={i}
              className={`text-sm p-3 rounded-lg ${
                msg.role === "user" ? "bg-primary/10" : "bg-muted"
              }`}
            >
              <strong>{msg.role === "user" ? "You" : "Assistant"}:</strong>{" "}
              {msg.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}