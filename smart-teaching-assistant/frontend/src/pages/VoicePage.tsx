import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { AppSidebar } from "../components/AppSidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { Mic, MicOff, Play, Pause, Square, Volume2, VolumeX, Settings } from "lucide-react";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { Badge } from "../components/ui/badge";

const VoicePage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([75]);
  const [voiceStatus, setVoiceStatus] = useState("Ready");
  const [listeningTime, setListeningTime] = useState(0);

  // ✅ FIXED TIMER TYPE (Browser safe)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isListening) {
      interval = setInterval(() => {
        setListeningTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  const toggleListening = () => {
    setIsListening(!isListening);
    setVoiceStatus(isListening ? "Ready" : "Listening...");
    if (!isListening) {
      setListeningTime(0);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    setVoiceStatus(isPlaying ? "Paused" : "Teaching");
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setVoiceStatus("Ready");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
                Voice Controls
              </h1>
              <p className="text-muted-foreground text-lg">
                Interact with your AI teacher using voice commands and audio controls
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Voice Control Panel */}
              <div className="glass-card p-8 hover-bounce text-center">
                <h3 className="font-semibold text-xl mb-6 flex items-center justify-center gap-2">
                  <Mic className="h-6 w-6 text-primary" />
                  Voice Control Center
                </h3>

                {/* Microphone */}
                <div className="mb-8">
                  <button
                    onClick={toggleListening}
                    className={`w-32 h-32 rounded-full border-8 transition-all duration-500 hover-bounce mx-auto block ${
                      isListening
                        ? "bg-primary border-primary text-white pulse-glow shadow-glow"
                        : "bg-primary/10 border-primary/30 text-primary hover:border-primary/50"
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="h-12 w-12 mx-auto" />
                    ) : (
                      <Mic className="h-12 w-12 mx-auto" />
                    )}
                  </button>

                  <div className="mt-4">
                    <Badge
                      variant="outline"
                      className={`${
                        isListening
                          ? "border-primary text-primary"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {voiceStatus}
                    </Badge>

                    {isListening && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Listening for {formatTime(listeningTime)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Playback */}
                <div className="space-y-4">
                  <h4 className="font-medium">Lesson Playback</h4>

                  <div className="flex justify-center gap-3">
                    <Button onClick={togglePlayback} size="lg">
                      {isPlaying ? (
                        <Pause className="h-5 w-5 mr-2" />
                      ) : (
                        <Play className="h-5 w-5 mr-2" />
                      )}
                      {isPlaying ? "Pause" : "Start Teaching"}
                    </Button>

                    <Button variant="outline" onClick={stopPlayback} size="lg">
                      <Square className="h-5 w-5 mr-2" />
                      Stop
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div className="space-y-6">

                {/* Audio Settings */}
                <div className="glass-card p-6 hover-bounce">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    {isMuted ? (
                      <VolumeX className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-primary" />
                    )}
                    Audio Settings
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Volume</span>
                        <span className="text-sm font-medium">{volume[0]}%</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>

                        <Slider
                          value={volume}
                          onValueChange={setVolume}
                          max={100}
                          step={1}
                          className="flex-1"
                          disabled={isMuted}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Voice Commands */}
                <div className="glass-card p-6 hover-bounce">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-accent" />
                    Voice Commands
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Start Teaching:</span>
                      <span className="text-muted-foreground">
                        "Robot start teaching"
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Pause/Stop:</span>
                      <span className="text-muted-foreground">
                        "Stop teaching"
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Ask Questions:</span>
                      <span className="text-muted-foreground">
                        "What is...?"
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Resume:</span>
                      <span className="text-muted-foreground">
                        "Continue" or "Resume"
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Log */}
            <div className="glass-card p-6 hover-bounce">
              <h3 className="font-semibold mb-4">Recent Voice Interactions</h3>

              <div className="space-y-3">
                {[
                  {
                    time: "2 min ago",
                    type: "command",
                    text: "What is machine learning?",
                    response: "Explained ML concepts with examples",
                  },
                  {
                    time: "5 min ago",
                    type: "control",
                    text: "Pause teaching",
                    response: "Lesson paused",
                  },
                ].map((interaction, index) => (
                  <div key={index} className="p-3 bg-muted/20 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">
                        {interaction.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {interaction.time}
                      </span>
                    </div>

                    <p className="text-sm font-medium mb-1">
                      "{interaction.text}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      → {interaction.response}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default VoicePage;