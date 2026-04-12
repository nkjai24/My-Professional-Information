import { useState } from "react";
import { Header } from "../components/Header";
import { AppSidebar } from "../components/AppSidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { BookOpen, Play, Pause, RotateCcw, Clock, CheckCircle, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";

const lessons = [
  {
    id: 1,
    title: "Introduction to Artificial Intelligence",
    description: "Fundamental concepts and applications of AI in modern technology",
    totalChunks: 8,
    completedChunks: 8,
    duration: "12:30",
    lastAccessed: "2 hours ago",
    status: "completed",
    subject: "AI Fundamentals"
  },
  {
    id: 2,
    title: "Machine Learning Algorithms",
    description: "Deep dive into supervised and unsupervised learning techniques",
    totalChunks: 12,
    completedChunks: 7,
    duration: "18:45",
    lastAccessed: "1 day ago", 
    status: "in-progress",
    subject: "Machine Learning"
  },
  {
    id: 3,
    title: "Computer Vision with OpenCV",
    description: "Image processing and computer vision applications",
    totalChunks: 15,
    completedChunks: 0,
    duration: "22:15",
    lastAccessed: "Never",
    status: "not-started",
    subject: "Computer Vision"
  },
  {
    id: 4,
    title: "Neural Networks and Deep Learning",
    description: "Building and training neural networks for complex problems",
    totalChunks: 20,
    completedChunks: 3,
    duration: "28:30",
    lastAccessed: "3 days ago",
    status: "in-progress", 
    subject: "Deep Learning"
  }
];

const LessonsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "not-started":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  return (
    <SidebarProvider>
      <div className={`min-h-screen w-full ${isDarkMode ? 'dark' : ''}`}>
        <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        
        <div className="flex w-full">
          <AppSidebar />
          
          <main className="flex-1 p-6 space-y-6 animate-fade-in">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2 gradient-text">
                My Lessons
              </h1>
              <p className="text-muted-foreground text-lg">
                Track your learning progress and continue where you left off
              </p>
            </div>

            {/* Progress Overview */}
            <div className="glass-card p-6 hover-bounce">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Learning Progress Overview
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{lessons.length}</div>
                  <div className="text-sm text-muted-foreground">Total Lessons</div>
                </div>
                <div className="text-center p-4 bg-green-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {lessons.filter(l => l.status === "completed").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-4 bg-blue-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {lessons.filter(l => l.status === "in-progress").length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
                <div className="text-center p-4 bg-accent/5 rounded-lg">
                  <div className="text-2xl font-bold text-accent">
                    {lessons.reduce((acc, lesson) => {
                      const [hours, minutes] = lesson.duration.split(':').map(Number);
                      return acc + hours + (minutes / 60);
                    }, 0).toFixed(1)}h
                  </div>
                  <div className="text-sm text-muted-foreground">Total Duration</div>
                </div>
              </div>
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lessons.map((lesson, index) => (
                <div 
                  key={lesson.id}
                  className="glass-card p-6 hover-bounce animate-slide-in-right cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedLesson(selectedLesson === lesson.id ? null : lesson.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <Badge variant="outline" className={getStatusColor(lesson.status)}>
                        {lesson.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Subject</div>
                      <div className="font-medium text-sm">{lesson.subject}</div>
                    </div>
                  </div>

                  <h3 className="font-semibold text-lg mb-2">{lesson.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{lesson.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{lesson.completedChunks}/{lesson.totalChunks} chunks</span>
                    </div>
                    <Progress 
                      value={getProgressPercentage(lesson.completedChunks, lesson.totalChunks)} 
                      className="h-2"
                    />
                  </div>

                  {/* Lesson Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{lesson.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>{lesson.lastAccessed}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {lesson.status === "completed" && (
                      <Button size="sm" variant="outline" className="hover-bounce">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    )}
                    
                    {lesson.status === "in-progress" && (
                      <Button size="sm" className="hover-bounce">
                        <Play className="h-4 w-4 mr-2" />
                        Continue
                      </Button>
                    )}
                    
                    {lesson.status === "not-started" && (
                      <Button size="sm" className="hover-bounce">
                        <Play className="h-4 w-4 mr-2" />
                        Start Lesson
                      </Button>
                    )}

                    <Button size="sm" variant="outline" className="hover-bounce">
                      View Details
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {selectedLesson === lesson.id && (
                    <div className="mt-4 pt-4 border-t border-border/50 animate-fade-in">
                      <h4 className="font-medium mb-2">Lesson Breakdown</h4>
                      <div className="space-y-2">
                        {Array.from({ length: lesson.totalChunks }, (_, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span>Chunk {i + 1}</span>
                            <div className="flex items-center gap-2">
                              {i < lesson.completedChunks ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : i === lesson.completedChunks ? (
                                <div className="w-2 h-2 bg-primary rounded-full pulse-glow"></div>
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-muted-foreground/30"></div>
                              )}
                              <span className="text-muted-foreground">
                                ~{Math.floor(Math.random() * 3 + 1)}:{String(Math.floor(Math.random() * 60)).padStart(2, '0')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default LessonsPage;