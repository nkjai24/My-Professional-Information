import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { AppSidebar } from "../components/AppSidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { UploadSection } from "../components/UploadSection";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";


/**
 * ✅ READ UPLOADED PDF + TEACHING PROGRESS
 * (LOGIC ONLY – UI UNCHANGED)
 */
const getRecentUploads = () => {
  const session = (window as any).currentTeachingSession;

  if (!session) return [];

  const hoursAgo = Math.max(
    1,
    Math.floor((Date.now() - session.uploadedAt) / (1000 * 60 * 60))
  );

  return [
    {
      id: 1,
      name: session.fileName,
      size: `${(session.fileSize / 1024 / 1024).toFixed(1)} MB`,
      uploadedAt: `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`,
      status: "completed",
      chunks: session.chunks.length,
      duration: `${session.chunks.length * 2}:00`,
    },
  ];
};


const UploadPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  /** ✅ DYNAMIC UPLOAD LIST */
  const recentUploads = getRecentUploads();


  /* =========================
     TOAST FEEDBACK
  ========================= */

  useEffect(() => {
    if (recentUploads.length > 0) {
      toast({
        title: "Upload Loaded",
        description: "Your recent learning material is ready.",
      });
    }
  }, []);


  const handleStartTeaching = (fileName: string) => {
    toast({
      title: "Teaching Started",
      description: `AI is preparing lesson for ${fileName}`,
    });
  };


  return (
    <SidebarProvider>
      <div className={`min-h-screen w-full ${isDarkMode ? "dark" : ""}`}>
        <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        <div className="flex w-full">
          <AppSidebar />

          <main className="flex-1 p-6 space-y-6 animate-fade-in">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2 gradient-text">
                Upload Learning Materials
              </h1>
              <p className="text-muted-foreground text-lg">
                Upload and manage your learning documents for AI-powered teaching
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                <UploadSection />
              </div>

              {/* RIGHT COLUMN – RECENT UPLOADS */}
              <div className="glass-card p-6 hover-bounce">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-secondary" />
                  Recent Uploads
                </h3>

                <ScrollArea className="h-96">
                  <div className="space-y-4 pr-3">

                    {recentUploads.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No uploads yet. Upload a PDF from Dashboard.
                      </p>
                    )}

                    {recentUploads.map((upload, index) => (
                      <div
                        key={upload.id}
                        className="p-4 border rounded-lg hover-bounce animate-slide-in-right"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-medium">{upload.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {upload.size} • {upload.uploadedAt}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                              completed
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Chunks:
                            </span>
                            <span className="ml-2 font-medium">
                              {upload.chunks}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Duration:
                            </span>
                            <span className="ml-2 font-medium">
                              {upload.duration}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleStartTeaching(upload.name)}
                          >
                            Start Teaching
                          </Button>
                        </div>
                      </div>
                    ))}

                  </div>
                </ScrollArea>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default UploadPage;