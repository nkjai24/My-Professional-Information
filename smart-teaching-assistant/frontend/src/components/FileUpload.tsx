// src/components/FileUpload.tsx
import React, { useCallback, useState } from "react";

type UploadStatus = "idle" | "dragging" | "uploading" | "done" | "error";

export default function FileUpload(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const reset = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setMessage(null);
    setProgress(null);
    try {
      localStorage.removeItem("st_chunks");
      localStorage.removeItem("st_currentIndex");
    } catch {}
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0] ?? null;
    if (!f) { setMessage("No file dropped"); return; }
    if (f.type !== "application/pdf") { setMessage("Please drop a PDF file."); return; }
    setFile(f);
    setMessage(null);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus("dragging");
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setStatus("idle");
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    const f = e.target.files && e.target.files[0];
    if (!f) { setFile(null); return; }
    if (f.type !== "application/pdf") { setMessage("Please select a PDF file."); setFile(null); return; }
    setFile(f);
  }, []);

  const extractTextWithPdfJs = async (fileBlob: Blob) => {
    if (!(window as any).pdfjsLib) throw new Error("pdfjsLib not available");
    const pdfjsLib = (window as any).pdfjsLib;

    if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";

    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const txt = await page.getTextContent();
      const pageText = txt.items.map((it: any) => it.str).join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText;
  };

  // 🔥🔥🔥 FINAL FIXED FUNCTION
  const callHookWithChunks = (chunks: any[], originalFile: File) => {

    // ✅ CLEAN + VALIDATE CHUNKS (CRITICAL)
    const cleanedChunks = (chunks || [])
      .map((c: any, i: number) => ({
        id: i,
        text: String(c?.text || "").trim()
      }))
      .filter(
        (c: any) =>
          c.text.length > 20 &&
          !c.text.toLowerCase().includes("sample chunk")
      );

    console.log("✅ CLEANED CHUNKS:", cleanedChunks);

    // ❌ If still empty → stop
    if (!cleanedChunks.length) {
      setStatus("error");
      setMessage("Invalid PDF content. Please try another file.");
      return;
    }

    // ✅ STORE CORRECT DATA
    (window as any).currentChunks = cleanedChunks;
    (window as any).currentFileName = originalFile.name;

    try {
      localStorage.setItem("st_chunks", JSON.stringify(cleanedChunks));
    } catch {}

    const extractedContent = cleanedChunks.map((c: any) => c.text).join(" ");

    const uploadedFiles = [
      {
        name: originalFile.name,
        size: originalFile.size,
        extractedContent,
        chunks: cleanedChunks,
      },
    ];

    try {
      (window as any).__st_onFilesReady?.(uploadedFiles);
    } catch (err) {
      console.warn("Error calling __st_onFilesReady", err);
    }
  };

  const uploadToServer = async (targetUrl: string, fileToUpload: File) => {
    const fd = new FormData();
    fd.append("file", fileToUpload);

    const resp = await fetch(targetUrl, { method: "POST", body: fd });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`Server ${resp.status} ${txt}`);
    }

    return await resp.json();
  };

  const upload = async () => {
    if (!file) { setMessage("No file selected."); return; }

    setStatus("uploading");
    setMessage("Uploading & processing...");
    setProgress(null);

    try {
      try {
        const json = await uploadToServer("/process_pdf", file);
        const chunks = Array.isArray(json.chunks) ? json.chunks : [];

        if (!chunks.length) throw new Error("No chunks returned");

        callHookWithChunks(chunks, file);

        setStatus("done");
        setMessage(`Processed ${chunks.length} chunks on server`);

        return;
      } catch {}

      try {
        const json = await uploadToServer("/api/process_pdf", file);
        const chunks = Array.isArray(json.chunks) ? json.chunks : [];

        if (!chunks.length) throw new Error("No chunks returned");

        callHookWithChunks(chunks, file);

        setStatus("done");
        setMessage(`Processed ${chunks.length} chunks`);

        return;
      } catch {}

      try {
        const text = await extractTextWithPdfJs(file);

        const sentences =
          text.match(/[^\.!\?]+[\.!\?]+/g) || [text];

        const chunks = sentences.map((s: string, idx: number) => ({
          id: idx,
          text: s.trim(),
        }));

        callHookWithChunks(chunks, file);

        setStatus("done");
        setMessage(`Processed ${chunks.length} chunks (client)`);

        return;
      } catch {}

      setStatus("error");
      setMessage("Failed to process file");

    } catch (err: any) {
      setStatus("error");
      setMessage(err?.message || "Upload failed");
    }
  };

  return (
    <div className="p-4 rounded-lg border bg-white shadow-sm max-w-full">
      <h3 className="text-lg font-semibold mb-2">Upload Learning Material (PDF)</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Upload a PDF document. The backend will process it into lesson chunks.
      </p>

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`mb-3 flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${
          status === "dragging" ? "border-robot-primary bg-robot-primary/5" : "border-border bg-background"
        }`}
        onClick={() => {
          const el = document.getElementById("pdf-file") as HTMLInputElement | null;
          el?.click();
        }}
      >
        <div>
          <div className="mb-3 text-3xl">📄</div>
          <div className="text-sm font-medium">
            {file ? file.name : "Drop files here or click to browse"}
          </div>
        </div>
      </div>

      <input id="pdf-file" type="file" accept="application/pdf" onChange={onFileChange} className="hidden" />

      <div className="flex gap-3">
        <button onClick={upload} disabled={!file || status === "uploading"}>
          {status === "uploading" ? "Uploading..." : "Upload & Process"}
        </button>

        <button onClick={reset}>Clear</button>
      </div>

      {message && <div className="mt-2">{message}</div>}
    </div>
  );
}