// src/components/ModeSelector.tsx
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * ModeSelector - simple mode switcher used on the Index page.
 *
 * - Keeps local UI for selecting 'voice' or 'chat' (or 'files')
 * - Emits a DOM CustomEvent "st:modechange" with { detail: { mode } } so other parts can react
 * - Persists selection in localStorage under "st_mode"
 *
 * Usage:
 *  import ModeSelector from "@/components/ModeSelector";
 *  <ModeSelector />
 */

type Mode = "voice" | "chat" | "files";

export default function ModeSelector(): JSX.Element {
  const [mode, setMode] = useState<Mode>(() => {
    try {
      const v = localStorage.getItem("st_mode");
      return (v === "chat" || v === "files") ? (v as Mode) : "voice";
    } catch {
      return "voice";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("st_mode", mode);
    } catch {}
    // emit global event so other components can react
    try {
      const ev = new CustomEvent("st:modechange", { detail: { mode } });
      window.dispatchEvent(ev);
    } catch {}
  }, [mode]);

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-muted-foreground">Mode:</div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode("voice")}
          className={`px-3 py-1 rounded-full ${mode === "voice" ? "bg-robot-primary text-white" : "bg-slate-50 text-slate-800 border border-border"}`}
          aria-pressed={mode === "voice"}
        >
          Voice
        </button>

        <button
          onClick={() => setMode("chat")}
          className={`px-3 py-1 rounded-full ${mode === "chat" ? "bg-robot-primary text-white" : "bg-slate-50 text-slate-800 border border-border"}`}
          aria-pressed={mode === "chat"}
        >
          Chat
        </button>

        <button
          onClick={() => setMode("files")}
          className={`px-3 py-1 rounded-full ${mode === "files" ? "bg-robot-primary text-white" : "bg-slate-50 text-slate-800 border border-border"}`}
          aria-pressed={mode === "files"}
        >
          Files
        </button>
      </div>
    </div>
  );
}
