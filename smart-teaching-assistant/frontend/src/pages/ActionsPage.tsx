import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { AppSidebar } from "../components/AppSidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { Lightbulb, FolderOpen, FileText, Target, Zap, MessageSquare, BookOpen, HelpCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { useLocation } from "react-router-dom";
import { toast } from "../hooks/use-toast";

const quickActions = [
  {
    id: 1,
    label: "Explain a concept",
    description: "Ask the AI to explain any topic in simple terms",
    icon: Lightbulb,
    emoji: "💡",
    color: "from-yellow-400 to-orange-500",
    examples: ["What is machine learning?", "Explain neural networks", "How does AI work?"]
  },
  {
    id: 2,
    label: "Give me examples", 
    description: "Get real-world examples and use cases",
    icon: FileText,
    emoji: "📝",
    color: "from-blue-400 to-cyan-500",
    examples: ["Examples of AI in healthcare", "Show me ML applications", "Computer vision examples"]
  },
  {
    id: 3,
    label: "Suggest projects",
    description: "Get project ideas to practice your skills",
    icon: FolderOpen,
    emoji: "📂", 
    color: "from-green-400 to-emerald-500",
    examples: ["Beginner AI projects", "Python ML projects", "Computer vision ideas"]
  },
  {
    id: 4,
    label: "Practice questions",
    description: "Test your knowledge with interactive questions",
    icon: Target,
    emoji: "🎯",
    color: "from-purple-400 to-pink-500",
    examples: ["Quiz me on AI basics", "Test my ML knowledge", "Practice interview questions"]
  },
  {
    id: 5,
    label: "Summarize lesson",
    description: "Get a quick summary of key points",
    icon: BookOpen,
    emoji: "📚",
    color: "from-indigo-400 to-purple-500",
    examples: ["Summarize this chapter", "Key takeaways", "Main concepts review"]
  },
  {
    id: 6,
    label: "Ask follow-up",
    description: "Dive deeper into specific topics",
    icon: MessageSquare,
    emoji: "💬",
    color: "from-pink-400 to-red-500",
    examples: ["Tell me more about...", "Can you elaborate?", "What are the benefits?"]
  }
];

const recentActions = [
  { action: "Explain a concept", query: "What is deep learning?", time: "2 min ago", status: "completed" },
  { action: "Practice questions", query: "Quiz me on neural networks", time: "15 min ago", status: "completed" },
  { action: "Give me examples", query: "AI in healthcare examples", time: "1 hour ago", status: "completed" },
  { action: "Suggest projects", query: "Beginner ML projects", time: "2 hours ago", status: "completed" }
];

const ActionsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedAction, setSelectedAction] = useState<number | null>(null);
  const [actionHistory, setActionHistory] = useState(recentActions);
  const location = useLocation();

  // Handle navigation from quick actions
  useEffect(() => {
    if (location.state?.selectedAction) {
      const actionId = location.state.selectedAction;
      setSelectedAction(actionId);
      
      // Find the action and show a toast
      const action = quickActions.find(a => a.id === actionId);
      if (action) {
        toast({
          title: `${action.emoji} ${action.label} activated!`,
          description: "Ready to help you learn. Choose an example or ask your own question.",
        });
      }
      
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleActionClick = (action: typeof quickActions[0]) => {
    console.log(`Triggered action: ${action.label}`);
    
    // Add to history
    const newAction = {
      action: action.label,
      query: `Triggered: ${action.label}`,
      time: "Just now",
      status: "completed" as const
    };
    
    setActionHistory(prev => [newAction, ...prev.slice(0, 9)]);
    setSelectedAction(selectedAction === action.id ? null : action.id);
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
                Quick Actions
              </h1>
              <p className="text-muted-foreground text-lg">
                Instant access to AI-powered learning tools and interactive features
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions Grid */}
              <div className="space-y-6">
                <div className="glass-card p-6 hover-bounce">
                  <h3 className="font-semibold text-xl mb-4 flex items-center gap-2">
                    <Zap className="h-6 w-6 text-primary" />
                    Learning Actions
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-6">
                    Click any action to instantly engage with your AI teacher
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {quickActions.map((action, index) => (
                      <div key={action.id} className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={() => handleActionClick(action)}
                          className={`w-full justify-start gap-3 p-4 h-auto hover-bounce bg-gradient-to-r ${action.color} bg-opacity-10 border-transparent hover:shadow-lg transition-all duration-300 animate-slide-in-right`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <span className="text-lg">{action.emoji}</span>
                          <div className="text-left">
                            <div className="font-medium">{action.label}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                          </div>
                        </Button>
                        
                        {/* Expanded Examples */}
                        {selectedAction === action.id && (
                          <div className="ml-6 p-3 bg-muted/20 rounded-lg animate-fade-in">
                            <h5 className="font-medium text-sm mb-2">Try these examples:</h5>
                            <div className="space-y-1">
                              {action.examples.map((example, idx) => (
                                <Button
                                  key={idx}
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-xs hover-bounce"
                                  onClick={() => console.log(`Example: ${example}`)}
                                >
                                  "{example}"
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Statistics */}
                <div className="glass-card p-6 hover-bounce">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-secondary" />
                    Usage Statistics
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg">
                      <div className="text-2xl font-bold text-primary">47</div>
                      <div className="text-sm text-muted-foreground">Actions Today</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/5 rounded-lg">
                      <div className="text-2xl font-bold text-secondary">12</div>
                      <div className="text-sm text-muted-foreground">Favorites Used</div>
                    </div>
                    <div className="text-center p-4 bg-accent/5 rounded-lg">
                      <div className="text-2xl font-bold text-accent">156</div>
                      <div className="text-sm text-muted-foreground">Total Questions</div>
                    </div>
                    <div className="text-center p-4 bg-green-500/5 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">89%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action History */}
              <div className="space-y-6">
                <div className="glass-card p-6 hover-bounce">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-accent" />
                    Recent Actions
                  </h3>
                  
                  <ScrollArea className="h-96">
                    <div className="space-y-3 pr-3">
                      {actionHistory.map((item, index) => (
                        <div 
                          key={index}
                          className="p-4 border rounded-lg hover-bounce animate-slide-in-right"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="border-primary text-primary">
                              {item.action}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.time}</span>
                          </div>
                          
                          <p className="text-sm font-medium mb-2">"{item.query}"</p>
                          
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600">Completed</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Quick Tips */}
                <div className="glass-card p-6 hover-bounce">
                  <h3 className="font-semibold mb-4">💡 Pro Tips</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-primary/5 rounded-lg">
                      <h4 className="font-medium text-primary mb-1">Voice Commands</h4>
                      <p className="text-muted-foreground">
                        You can trigger any action using voice commands like "Explain machine learning"
                      </p>
                    </div>
                    
                    <div className="p-3 bg-secondary/5 rounded-lg">
                      <h4 className="font-medium text-secondary mb-1">Follow-up Questions</h4>
                      <p className="text-muted-foreground">
                        Ask "tell me more" or "give me examples" to dive deeper into any topic
                      </p>
                    </div>
                    
                    <div className="p-3 bg-accent/5 rounded-lg">
                      <h4 className="font-medium text-accent mb-1">Context Awareness</h4>
                      <p className="text-muted-foreground">
                        Actions consider your current lesson progress for personalized responses
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ActionsPage;