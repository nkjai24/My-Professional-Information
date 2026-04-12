// src/pages/UploadDetails.tsx
// ⚠️ READ-ONLY PAGE — NO EXISTING UI IS MODIFIED

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getProgress,
  TeachingProgress,
} from "@/store/teachingStore";
import { Progress } from "@/components/ui/progress";
import { FileText, HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UploadDetails() {
  const { fileId } = useParams<{ fileId: string }>();
  const [data, setData] = useState<TeachingProgress | null>(null);

  useEffect(() => {
    if (!fileId) return;

    // fileId is stored as normalized filename
    const progress = getProgress(fileId.replace(/_/g, " "));
    setData(progress);
  }, [fileId]);

  if (!data) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No teaching data found for this file.
      </div>
    );
  }

  const taughtPercent = Math.round(
    (data.taughtChunks / data.totalChunks) * 100
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-semibold">Upload Details</h1>
      </div>

      {/* File Info */}
      <div className="glass-card p-4 space-y-2">
        <p className="text-sm text-muted-foreground">File Name</p>
        <p className="font-medium">{data.fileName}</p>
      </div>

      {/* Teaching Progress */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span>Teaching Progress</span>
          <span>{taughtPercent}%</span>
        </div>
        <Progress value={taughtPercent} />

        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
          <div>
            <p className="text-muted-foreground">Total Chunks</p>
            <p className="font-medium">{data.totalChunks}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Chunks Taught</p>
            <p className="font-medium">{data.taughtChunks}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Stopped At Chunk</p>
            <p className="font-medium">
              {data.currentChunkIndex + 1}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Activity</p>
            <p className="font-medium">
              {new Date(data.lastUpdated).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Questions Asked */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-secondary" />
          <h2 className="font-medium">
            Questions Asked ({data.questions.length})
          </h2>
        </div>

        {data.questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No questions have been asked yet.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {data.questions.map((q, idx) => (
              <li
                key={idx}
                className="p-3 rounded-lg bg-muted/30"
              >
                <p className="font-medium">{q.question}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Chunk {q.chunkIndex + 1} ·{" "}
                  {new Date(q.timestamp).toLocaleTimeString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Back Button */}
      <div className="pt-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
}
