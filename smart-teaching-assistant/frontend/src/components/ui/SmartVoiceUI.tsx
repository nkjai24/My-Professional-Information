// src/components/ui/SmartTeacherVoiceUI.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Mic,
  MicOff,
  Play,
  Pause,
  Volume2,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import robotAvatar from "@/assets/robot-avatar.png";

/* Backend base (reads from .env: VITE_BACKEND_URL) */
const BACKEND_BASE =
  (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:8002";

/* Types */
interface LessonChunk {
  id: number;
  text: string;
}
type RobotState = "idle" | "teaching" | "paused" | "answering";

interface VoiceUIState {
  isListening: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  isProcessing: boolean;
  isThinking: boolean;
  currentChunkIndex: number;
  chunks: LessonChunk[];
  lastTranscripts: string[];
  robotState: RobotState;
}

/* Declarations for browser SpeechRecognition */
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
    __st_onFilesReady?: (files: any[]) => void;
  }
}

const initialState: VoiceUIState = {
  isListening: false,
  isSpeaking: false,
  isPaused: false,
  isProcessing: false,
  isThinking: false,
  currentChunkIndex: 0,
  chunks: [],
  lastTranscripts: [],
  robotState: "idle",
};

export default function SmartTeacherVoiceUI(): JSX.Element {
  const { toast } = useToast();
  const [state, setState] = useState<VoiceUIState>(initialState);

  // keep ref to avoid stale closures inside callbacks
  const stateRef = useRef<VoiceUIState>(initialState);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const recognitionRef = useRef<any | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const pendingAutoStartRef = useRef<boolean>(false);

  /* ---------------- Restore cached chunks on mount & file-ready hook ---------------- */
  useEffect(() => {
    try {
      const cached = localStorage.getItem("st_chunks");
      const idx = localStorage.getItem("st_currentIndex");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setState((prev) => ({
            ...prev,
            chunks: parsed,
            currentChunkIndex: Number(idx || 0),
            robotState: "idle",
          }));
        }
      }
    } catch (e) {
      console.warn("Failed to restore cached chunks:", e);
    }

    // allow external uploader to call window.__st_onFilesReady(files)
    window.__st_onFilesReady = (uploadedFiles: any[]) => {
      try {
        let chunks: LessonChunk[] = [];
        uploadedFiles.forEach((f: any) => {
          if (Array.isArray(f.chunks) && f.chunks.length) {
            f.chunks.forEach((c: any) =>
              chunks.push({ id: chunks.length, text: String(c.text || "") })
            );
          } else if (typeof f.extractedContent === "string") {
            const parts = f.extractedContent.match(/[^\.!\?]+[\.!\?]+/g) || [
              f.extractedContent,
            ];
            parts.forEach((p: string) =>
              chunks.push({ id: chunks.length, text: p.trim() })
            );
          }
        });

        if (chunks.length > 0) {
          setState((prev) => ({
            ...prev,
            chunks,
            currentChunkIndex: 0,
            robotState: "idle",
          }));
          localStorage.setItem("st_chunks", JSON.stringify(chunks));
          localStorage.setItem("st_currentIndex", "0");
          toast({ title: "Lesson ready", description: `Loaded ${chunks.length} chunks.` });
          if (pendingAutoStartRef.current) {
            pendingAutoStartRef.current = false;
            setTimeout(() => startTeaching(), 300);
          }
        } else {
          toast({ title: "No text found", description: "Uploaded file contained no extractable text.", variant: "destructive" });
        }
      } catch (e) {
        console.error("window.__st_onFilesReady error:", e);
      }
    };

    return () => {
      window.__st_onFilesReady = undefined;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- TTS (speak) helpers ---------------- */
  const speakText = (text: string, onend?: () => void) => {
    if (!text) {
      onend?.();
      return;
    }
    if (!("speechSynthesis" in window)) {
      toast({ title: "TTS not supported", description: "speechSynthesis not available in this browser." });
      onend?.();
      return;
    }
    try {
      window.speechSynthesis.cancel();
    } catch {}
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    utt.pitch = 1.0;
    utt.onstart = () => setState((prev) => ({ ...prev, isSpeaking: true }));
    utt.onend = () => {
      setState((prev) => ({ ...prev, isSpeaking: false }));
      onend?.();
    };
    utt.onerror = () => {
      setState((prev) => ({ ...prev, isSpeaking: false }));
      onend?.();
    };
    utteranceRef.current = utt;
    window.speechSynthesis.speak(utt);
  };

  /* ---------------- Teaching flow (speak chunks) ---------------- */
  const speakChunk = (index: number) => {
    const chunks = stateRef.current.chunks;
    if (!chunks || index >= chunks.length) {
      setState((prev) => ({ ...prev, robotState: "idle", isSpeaking: false, currentChunkIndex: 0 }));
      toast({ title: "Lesson complete", description: "You have reached the end of the lesson." });
      return;
    }

    const text = chunks[index].text;
    speakText(text, () => {
      setState((prev) => {
        const nextIndex = prev.currentChunkIndex + 1;
        localStorage.setItem("st_currentIndex", String(nextIndex));
        return { ...prev, isSpeaking: false, currentChunkIndex: nextIndex };
      });

      if (stateRef.current.robotState === "teaching") {
        setTimeout(() => speakChunk(index + 1), 450);
      }
    });
  };

  const startTeaching = useCallback(() => {
    if (!stateRef.current.chunks || stateRef.current.chunks.length === 0) {
      toast({ title: "No content", description: "Please upload or process a PDF." });
      return;
    }
    setState((prev) => ({ ...prev, robotState: "teaching", isPaused: false }));
    speakChunk(stateRef.current.currentChunkIndex);
  }, [toast]);

  const stopTeaching = useCallback(() => {
    try { window.speechSynthesis.cancel(); } catch {}
    setState((prev) => ({ ...prev, robotState: "paused", isSpeaking: false, isPaused: true }));
  }, []);

  const resumeTeaching = useCallback(() => {
    setState((prev) => ({ ...prev, robotState: "teaching", isPaused: false }));
    speakChunk(stateRef.current.currentChunkIndex);
  }, []);

  /* ---------------- PDF upload & processing ---------------- */
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ title: "Invalid file", description: "Please select a PDF file.", variant: "destructive" });
      return;
    }
    setUploadedFile(file);
    toast({ title: "PDF selected", description: "Click 'Process PDF' or say 'Robot start teaching' to process." });
  };

  const processUploadedPDF = async () => {
    if (!uploadedFile) {
      toast({ title: "No file", description: "Select a PDF first.", variant: "destructive" });
      return;
    }
    setState((prev) => ({ ...prev, isProcessing: true }));
    try {
      const fd = new FormData();
      fd.append("file", uploadedFile);
      const resp = await fetch(`${BACKEND_BASE}/process_pdf`, { method: "POST", body: fd });
      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        throw new Error(`Server error processing PDF (${resp.status}): ${body}`);
      }
      const json = await resp.json();
      const backendChunks: LessonChunk[] = Array.isArray(json.chunks)
        ? json.chunks.map((c: any, i: number) => ({ id: i, text: String(c.text || "") }))
        : [];
      if (backendChunks.length === 0) throw new Error("No chunks returned");
      setState((prev) => ({ ...prev, chunks: backendChunks, currentChunkIndex: 0, isProcessing: false, robotState: "idle" }));
      localStorage.setItem("st_chunks", JSON.stringify(backendChunks));
      localStorage.setItem("st_currentIndex", "0");
      toast({ title: "PDF processed", description: `Loaded ${backendChunks.length} chunks.` });
      if (pendingAutoStartRef.current) {
        pendingAutoStartRef.current = false;
        startTeaching();
      }
    } catch (e: any) {
      console.error("processUploadedPDF error:", e);
      setState((prev) => ({ ...prev, isProcessing: false }));
      toast({ title: "Processing failed", description: e?.message || "Could not process PDF", variant: "destructive" });
    }
  };

  /* ---------------- Ask question backend ---------------- */
  const askQuestionBackend = async (question: string) => {
    try {
      setState((prev) => ({ ...prev, isThinking: true }));
      const idx = stateRef.current.currentChunkIndex || 0;
      const windowSizeBefore = 2;
      const windowSizeAfter = 2;
      const start = Math.max(0, idx - windowSizeBefore);
      const end = Math.min(stateRef.current.chunks.length, idx + windowSizeAfter + 1);
      const ctxChunks = stateRef.current.chunks.slice(start, end);

      const payload: any = { question, context_chunk_index: idx, chunks: ctxChunks };
      const resp = await fetch(`${BACKEND_BASE}/ask_question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        throw new Error(`ask_question failed (${resp.status}): ${body}`);
      }
      const j = await resp.json();
      // backend guarantees { answer: "..." }
      return (j && j.answer) ? j.answer : null;
    } catch (e) {
      console.error("askQuestionBackend", e);
      return null;
    } finally {
      setState((prev) => ({ ...prev, isThinking: false }));
    }
  };

  /* ---------------- Handle question interrupt ---------------- */
  const handleQuestion = async (question: string) => {
    try {
      try { window.speechSynthesis.cancel(); } catch {}
      setState((prev) => ({ ...prev, robotState: "answering", isSpeaking: false }));
      const answer = await askQuestionBackend(question);
      if (answer) {
        await new Promise<void>((resolve) => speakText(answer, resolve));
        toast({ title: "Question answered", description: "Say 'Ok I'm satisfied' to resume the lesson." });
        setState((prev) => ({ ...prev, robotState: "paused" }));
      } else {
        toast({ title: "No answer", description: "I couldn't find a good answer. Please rephrase.", variant: "destructive" });
        setState((prev) => ({ ...prev, robotState: "paused" }));
      }
    } catch (e) {
      console.error("handleQuestion error:", e);
      setState((prev) => ({ ...prev, robotState: "paused" }));
      toast({ title: "Question error", description: "Failed to answer the question.", variant: "destructive" });
    }
  };

  /* ---------------- SpeechRecognition setup & fallback recorder ---------------- */
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      try {
        const lastIndex = event.resultIndex;
        const transcript = Array.from(event.results).slice(lastIndex).map((r: any) => r[0].transcript).join("").trim().toLowerCase();
        if (transcript) {
          setState((prev) => ({ ...prev, lastTranscripts: [transcript, ...prev.lastTranscripts].slice(0, 3) }));
          if (event.results[event.results.length - 1].isFinal) {
            processVoiceCommand(transcript);
          }
        }
      } catch (e) {
        console.error("onresult processing error:", e);
      }
    };

    rec.onerror = (e: any) => {
      console.error("SpeechRecognition error:", e);
      toast({ title: "Voice recognition error", description: "Speech recognition encountered an error.", variant: "destructive" });
      try { rec.stop(); } catch {}
      setState((prev) => ({ ...prev, isListening: false }));
    };

    rec.onend = () => {
      if (stateRef.current.isListening) {
        setTimeout(() => {
          try { rec.start(); } catch (e) { console.warn("Recognition restart failed:", e); setState((prev) => ({ ...prev, isListening: false })); }
        }, 150);
      }
    };

    recognitionRef.current = rec;
    return () => {
      try { rec.onresult = null; rec.onerror = null; rec.onend = null; rec.stop(); } catch {}
      recognitionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (ev) => { audioChunksRef.current.push(ev.data); };
      mr.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await sendAudioForTranscription(blob);
      };

      mr.start();
      setState((prev) => ({ ...prev, isListening: true }));
      setTimeout(() => {
        if (mr.state === "recording") {
          mr.stop();
          setState((prev) => ({ ...prev, isListening: false }));
        }
      }, 4000);
    } catch (e) {
      console.error("startAudioRecording error:", e);
      toast({ title: "Microphone error", description: "Please allow microphone access.", variant: "destructive" });
    }
  };

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    try {
      const fd = new FormData();
      fd.append("audio", audioBlob, "recording.wav");
      const resp = await fetch(`${BACKEND_BASE}/stt`, { method: "POST", body: fd });
      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        throw new Error(`stt failed (${resp.status}): ${body}`);
      }
      const j = await resp.json();
      const transcript = j.transcript ?? "";
      if (transcript) processVoiceCommand(transcript.toLowerCase());
    } catch (e) {
      console.error("sendAudioForTranscription error:", e);
      toast({ title: "Transcription failed", description: "Audio transcription failed.", variant: "destructive" });
    }
  };

  const toggleListening = async () => {
    if (stateRef.current.isListening) {
      try { recognitionRef.current?.stop(); } catch {}
      try { mediaRecorderRef.current?.stop(); } catch {}
      setState((prev) => ({ ...prev, isListening: false }));
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setState((prev) => ({ ...prev, isListening: true }));
        return;
      } catch (e) {
        console.warn("SpeechRecognition start failed, fallback to recorder:", e);
      }
    }

    await startAudioRecording();
  };

  /* ---------------- Voice command parsing ---------------- */
  const processVoiceCommand = useCallback(async (rawTranscript: string) => {
    if (!rawTranscript) return;
    const transcript = rawTranscript.trim().toLowerCase();

    // store last transcripts
    setState((prev) => ({ ...prev, lastTranscripts: [transcript, ...prev.lastTranscripts].slice(0, 3) }));

    // Start teaching
    if (/\b(robot start teaching|start teaching|start lesson|teach me|start the lesson)\b/.test(transcript)) {
      if (stateRef.current.chunks.length === 0) {
        if (uploadedFile) {
          pendingAutoStartRef.current = true;
          await processUploadedPDF();
        } else {
          toast({ title: "No document", description: "Please upload a PDF first to start teaching.", variant: "destructive" });
        }
      } else {
        startTeaching();
      }
      return;
    }

    // Stop / Pause
    if (/\b(stop teaching|pause teaching|stop lesson|pause)\b/.test(transcript)) {
      stopTeaching();
      return;
    }

    // Resume
    if (/\b(ok i'm satisfied|ok im satisfied|resume teaching|continue teaching|carry on)\b/.test(transcript)) {
      if (stateRef.current.robotState === "paused" || stateRef.current.robotState === "answering") {
        resumeTeaching();
      }
      return;
    }

    // Questions detection
    const isQuestion = /\b(what|why|how|explain|define|describe|who|when|question)\b/.test(transcript);
    if (isQuestion && stateRef.current.robotState === "teaching") {
      await handleQuestion(transcript);
      return;
    }

    // fallback: try to ask backend
    const fallbackAnswer = await askQuestionBackend(transcript);
    if (fallbackAnswer) {
      speakText(fallbackAnswer);
    }
  }, [uploadedFile, toast]); // dependencies

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center">
        <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-robot-primary to-robot-secondary p-4 shadow-lg">
  <img
    src={robotAvatar}
    alt="Smart Teacher Robot"
    className={`h-12 w-12 ${state.isSpeaking ? "animate-robot-speak" : ""}`}
  />

  {/* 🤔 Thinking spinner overlay */}
  {state.robotState === "answering" && (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="animate-spin text-xl">🤔</span>
    </div>
  )}
</div>

          <h1 className="mb-2 text-4xl font-bold text-foreground">Smart Teacher Robot</h1>
          <p className="text-lg text-muted-foreground">Your AI-powered voice learning companion</p>
        </div>

        {/* Thinking Indicator */}
        {state.isThinking && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-lg font-medium text-muted-foreground">🤔 Thinking...</span>
            <Loader2 className="h-5 w-5 animate-spin text-robot-primary" />
          </div>
        )}

        {/* Main interface */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left - Controls */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-robot-primary" /> Voice Controls
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Upload Learning Material</label>
                <div className="flex items-center gap-3">
                  <input id="pdf-upload" type="file" accept=".pdf" onChange={onFileSelect} className="hidden" />
                  <label htmlFor="pdf-upload" className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-sm hover:border-robot-primary">
                    <Upload className="h-4 w-4" /> Choose PDF
                  </label>
                  {uploadedFile && <Badge variant="secondary">{uploadedFile.name}</Badge>}
                </div>
                {uploadedFile && (
                  <Button onClick={processUploadedPDF} disabled={state.isProcessing} variant="outline" className="w-full">
                    {state.isProcessing ? "Processing..." : "Process PDF"}
                  </Button>
                )}
              </div>

              {/* Mic Button */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Voice Commands</label>
                <div className="flex flex-col items-center gap-4">
                  <Button size="lg" variant={state.isListening ? "destructive" : "default"} onClick={toggleListening} className={`h-20 w-20 rounded-full ${state.isListening ? "bg-destructive" : "bg-gradient-to-br from-robot-primary to-robot-secondary"}`}>
                    {state.isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">{state.isListening ? "Listening... Speak now!" : "Click to start listening"}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <Button onClick={startTeaching} disabled={state.chunks.length === 0 || state.robotState === "teaching"} className="flex-1"><Play className="h-4 w-4 mr-2" /> Start</Button>
                <Button onClick={stopTeaching} disabled={state.robotState === "idle"} className="flex-1"><Pause className="h-4 w-4 mr-2" /> Pause</Button>
                <Button onClick={resumeTeaching} disabled={state.robotState !== "answering"} className="flex-1">Resume</Button>
              </div>

              {/* Status + Recent transcripts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant={state.robotState === "teaching" ? "default" : state.robotState === "paused" ? "secondary" : state.robotState === "answering" ? "outline" : "secondary"}>
                    {state.isThinking ? "🤔 Thinking..." : state.robotState === "teaching" && state.isSpeaking ? "Speaking" : state.robotState === "teaching" ? "Teaching" : state.robotState === "paused" ? "Paused" : state.robotState === "answering" ? "Answering" : "Ready"}
                  </Badge>
                </div>

                {state.chunks.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress:</span>
                    <span className="text-sm font-medium">{state.currentChunkIndex} / {state.chunks.length}</span>
                  </div>
                )}

                {state.lastTranscripts.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Recent Commands</label>
                    <div className="space-y-1 mt-2">
                      {state.lastTranscripts.map((t, i) => (
                        <div key={i} className="text-xs text-muted-foreground p-2 bg-secondary/50 rounded">"{t}"</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right - Lesson Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">📚 Lesson Preview {state.isSpeaking && <Badge variant="default" className="animate-pulse-glow">Speaking</Badge>}</CardTitle>
            </CardHeader>

            <CardContent>
              {state.chunks.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-center">
                  <div>
                    <p className="text-muted-foreground mb-4">No content loaded yet.</p>
                    <p className="text-sm text-muted-foreground">Upload a PDF or say "Robot start teaching" to begin.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {state.chunks.map((chunk, idx) => {
                    const isCurrent = idx === state.currentChunkIndex;
                    const isCompleted = idx < state.currentChunkIndex;
                    return (
                      <div key={chunk.id} className={`p-4 rounded-lg border-2 transition-all ${isCurrent ? "border-robot-primary bg-robot-primary/10 shadow-md" : isCompleted ? "border-success/30 bg-success/5" : "border-border bg-card"}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-muted-foreground">Chunk {idx + 1}</span>
                          {isCurrent && state.isSpeaking && <Badge variant="default" className="animate-pulse-glow text-xs">Speaking</Badge>}
                          {isCompleted && <Badge variant="outline" className="text-xs">Completed</Badge>}
                        </div>
                        <p className="text-sm leading-relaxed">{chunk.text}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Voice Commands Help */}
        <div className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Voice Commands</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div><p className="font-medium text-sm">Start Teaching:</p><p className="text-xs text-muted-foreground">"Robot start teaching"</p></div>
                <div><p className="font-medium text-sm">Stop/Pause:</p><p className="text-xs text-muted-foreground">"Stop teaching"</p></div>
                <div><p className="font-medium text-sm">Ask Questions:</p><p className="text-xs text-muted-foreground">"What is...?" or "Explain..."</p></div>
                <div><p className="font-medium text-sm">Resume:</p><p className="text-xs text-muted-foreground">"Ok I'm satisfied"</p></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 