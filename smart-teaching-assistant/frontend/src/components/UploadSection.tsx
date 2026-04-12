import { useState, useCallback } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { useMutation } from "@tanstack/react-query";
import api from "@/utils/apiClient";

type Chunk = { id: number; text: string };

type TeachingSession = {
  fileId: string;
  fileName: string;
  uploadedAt: number;
  chunks: Chunk[];
  currentChunkIndex: number;
  progressPercent: number;
  questions: {
    question: string;
    answer: string;
    timestamp: number;
  }[];
};

const getSessions = (): Record<string, TeachingSession> =>
  JSON.parse(localStorage.getItem("teachingSessions") || "{}");

const saveSessions = (sessions: Record<string, TeachingSession>) =>
  localStorage.setItem("teachingSessions", JSON.stringify(sessions));

export function UploadSection() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploadMut = useMutation({
    mutationFn: (file: File) => api.processPdf(file),

    onMutate: () => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      const interval = setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? 90 : p + 15));
      }, 300);

      setTimeout(() => clearInterval(interval), 3000);
    },

    onSuccess: (data) => {
      const cs = Array.isArray(data.chunks) ? data.chunks : [];
      setChunks(cs);
      setUploadProgress(100);
      setIsUploading(false);

      const fileId = crypto.randomUUID();

      const newSession: TeachingSession = {
        fileId,
        fileName: uploadedFile!.name,
        uploadedAt: Date.now(),
        chunks: cs,
        currentChunkIndex: 0,
        progressPercent: 0,
        questions: [],
      };

      const sessions = getSessions();
      sessions[fileId] = newSession;
      saveSessions(sessions);

      // 🌍 Global sync for teaching components
      (window as any).currentChunks = cs;
      (window as any).currentFileId = fileId;

      // 🔔 Notify other pages
      window.dispatchEvent(new Event("teachingSessionsUpdated"));
    },

    onError: (err: any) => {
      setIsUploading(false);
      setUploadProgress(0);
      setError(String(err?.message ?? err));
    },
  });

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    setUploadedFile(file);
    uploadMut.mutate(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = Array.from(e.dataTransfer.files).find(
      (f) => f.type === "application/pdf"
    );
    if (file) processFile(file);
    else setError("Please upload a PDF file.");
  }, []);

  const clearFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setChunks([]);
    setError(null);
    (window as any).currentChunks = [];
    (window as any).currentFileId = null;
  };

  return (
    <div className="glass-card p-6 animate-fade-in hover-bounce">
      <div className="flex items-center gap-3 mb-4">
        <Upload className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">Upload Learning Materials</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!uploadedFile ? (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center ${
            isDragOver ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />

          {isUploading ? (
            <>
              <Progress value={uploadProgress} />
              <p className="text-sm text-primary mt-2">
                Processing PDF… {uploadProgress}%
              </p>
            </>
          ) : (
            <>
              <label htmlFor="file-upload">
                <Button asChild>
                  <span>Upload & Process</span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-muted/30 rounded-lg p-4 flex justify-between">
            <div>
              <p className="font-medium">{uploadedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {chunks.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                ✅ PDF processed successfully! Created {chunks.length} lesson
                chunks.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
