import { useState, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";
import { BookOpen, Clock, CheckCircle, Play } from "lucide-react";
import { Button } from "./ui/button";

type Chunk = { 
  id: number; 
  text: string;
  status?: 'completed' | 'current' | 'pending';
  title?: string;
  duration?: string;
};

export function CurrentLesson() {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [completedChunks, setCompletedChunks] = useState<number[]>([]);
  const [lessonStatus, setLessonStatus] = useState("Ready");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const checkForChunks = () => {

      let globalChunks = (window as any).currentChunks;

      if (!globalChunks || globalChunks.length === 0) {
        try {
          globalChunks = JSON.parse(localStorage.getItem("st_chunks") || "[]");
        } catch {
          globalChunks = [];
        }
      }

      const uploadedFileName =
        (window as any).currentFileName || "Uploaded Document";

      if (globalChunks && globalChunks.length > 0) {

        (window as any).currentChunks = globalChunks;

        const processedChunks: Chunk[] = globalChunks.map((chunk: any, index: number) => ({
          id: index,
          text: chunk.text || '',
          title: generateChunkTitle(chunk.text, index),
          duration: estimateDuration(chunk.text),
          status: (index === 0 ? 'current' : 'pending') as 'current' | 'pending'
        }));
        
        setChunks(processedChunks);
        setFileName(uploadedFileName);
        setLessonStatus("PDF loaded - Ready to teach");

      } else {

        setChunks([]);
        setFileName("");
        setLessonStatus("No lesson loaded");

      }
    };
    
    checkForChunks();
    const interval = setInterval(checkForChunks, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkVoiceStatus = () => {
      const voiceStatus = (window as any).currentVoiceStatus;
      if (voiceStatus) {
        setLessonStatus(voiceStatus);
      }
    };
    
    const interval = setInterval(checkVoiceStatus, 500);
    return () => clearInterval(interval);
  }, []);

  const generateChunkTitle = (text: string, index: number): string => {
    if (!text) return `Chunk ${index + 1}`;
    
    const sentences = text.split('.').filter(s => s.trim().length > 0);
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      if (firstSentence.length > 50) {
        return firstSentence.substring(0, 47) + '...';
      }
      return firstSentence;
    }
    
    return text.length > 50 ? text.substring(0, 47) + '...' : text;
  };

  const estimateDuration = (text: string): string => {
    const words = text.split(' ').length;
    const minutes = Math.ceil(words / 200);
    const seconds = Math.round((words % 200) / 200 * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = (): number => {
    if (chunks.length === 0) return 0;
    return Math.round((completedChunks.length / chunks.length) * 100);
  };

  const handleChunkClick = (chunkId: number) => {
    setCurrentChunkIndex(chunkId);
    (window as any).currentChunkIndex = chunkId;
    
    const updatedChunks: Chunk[] = chunks.map(chunk => ({
      ...chunk,
      status: (chunk.id < chunkId
        ? 'completed'
        : chunk.id === chunkId
        ? 'current'
        : 'pending') as 'completed' | 'current' | 'pending'
    }));
    
    setChunks(updatedChunks);
    setCompletedChunks(chunks.filter(c => c.id <= chunkId).map(c => c.id));
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'current': return 'bg-primary/10 text-primary';
      case 'pending': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'current': return 'Current';
      case 'pending': return 'Pending';
      default: return 'Pending';
    }
  };

  const displayChunks = chunks;
  const currentProgress = calculateProgress();
  const totalChunks = chunks.length || 0;

  return (
    <div className="glass-card p-6 animate-fade-in hover-bounce">
      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="h-5 w-5 text-secondary" />
        <h2 className="text-lg font-semibold">Current Lesson</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Review the active lesson and control playback. Resume, pause or restart the lesson as needed.
      </p>

      {fileName && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800">📄 {fileName}</p>
          <p className="text-xs text-blue-600">{chunks.length} chunks ready for teaching</p>
        </div>
      )}

      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Lesson Progress</span>
          <span className="text-sm text-muted-foreground">
            {completedChunks.length} / {totalChunks} chunks
          </span>
        </div>
        <Progress value={currentProgress} className="mb-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Status: {lessonStatus}</span>
          <span>Progress: {currentProgress}%</span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-medium text-sm">
          Lesson Chunks {chunks.length > 0 && `(${chunks.length})`}
        </h3>

        <ScrollArea className="h-64">
          <div className="space-y-3 pr-3">

            {displayChunks.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-10">
                No PDF loaded. Please upload a document.
              </div>
            ) : (
              displayChunks.map((chunk) => (
                <div 
                  key={chunk.id}
                  onClick={() => handleChunkClick(chunk.id)}
                  className={`p-4 rounded-lg border transition-all duration-200 hover-bounce cursor-pointer ${
                    chunk.status === "current" 
                      ? "border-primary bg-primary/5" 
                      : chunk.status === "completed"
                      ? "border-green-200 bg-green-50/50"
                      : "border-border bg-muted/20"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {chunk.status === "completed" && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {chunk.status === "current" && (
                        <div className="w-2 h-2 bg-primary rounded-full pulse-glow"></div>
                      )}
                      <span className="font-medium text-sm">Chunk {chunk.id}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(chunk.status || 'pending')}`}>
                        {getStatusText(chunk.status || 'pending')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {chunk.duration}
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-1">{chunk.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {chunk.text}
                  </p>
                  
                  {chunk.status === "current" && (
                    <div className="mt-2 pt-2 border-t border-primary/20">
                      <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10">
                        <Play className="h-3 w-3 mr-1" />
                        Ask questions about this chunk
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}

          </div>
        </ScrollArea>
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <p className="text-sm">
          <span className="font-medium">Lesson:</span> {
            chunks.length > 0 
              ? `Ready to teach ${chunks.length} chunks — click the mic or say "What is this about?"`
              : `Upload a PDF to start learning with your AI teacher`
          }
        </p>
      </div>
    </div>
  );
}