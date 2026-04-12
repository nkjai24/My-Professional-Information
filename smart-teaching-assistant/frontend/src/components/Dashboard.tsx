import { useState, useEffect } from "react";
import { SidebarProvider } from "./ui/sidebar";
import { Header } from "./Header";
import { UploadSection } from "./UploadSection";
import { CurrentLesson } from "./CurrentLesson";
import { VoiceControls } from "./VoiceControls";
import { QuickActions } from "./QuickActions";
import { AppSidebar } from "./AppSidebar";
import { TeachingChatBox } from "./TeachingChatBox";
import robotAvatar from "../assets/robot-avatar.png";

/**
 * 🌍 Supported teaching languages (20+)
 * (LOGIC ONLY – no UI change elsewhere)
 */
const TEACHING_LANGUAGES = [
  "English",
  "Tamil",
  "Hindi",
  "Telugu",
];

export function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");

  /**
   * 🔁 Make language globally available
   * Used by: VoiceControls, TeachingChatBox, QuickActions
   */
  useEffect(() => {
    (window as any).teachingLanguage = language;
  }, [language]);

  return (
    <SidebarProvider>
      <div className={`min-h-screen w-full ${isDarkMode ? "dark" : ""}`}>
        <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

        <div className="flex w-full">
          <AppSidebar />

          <main className="flex-1 p-6 space-y-6 animate-fade-in">
            {/* ================= HERO SECTION (UNCHANGED) ================= */}
            <section className="text-center mb-8">
              <div className="inline-block mb-4 float">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent p-1">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <img
                      src={robotAvatar}
                      alt="Smart Teacher Robot"
                      className="w-16 h-16 rounded-full"
                    />
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-display font-bold mb-2 gradient-text">
                Smart Teacher Robot
              </h1>
              <p className="text-muted-foreground text-lg mb-4">
                Your AI-powered multilingual voice learning companion
              </p>

              {/* ================= 🌍 LANGUAGE SELECTOR (ADDED) ================= */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 bg-card border rounded-xl px-4 py-2 shadow-sm">
                  <span className="text-sm font-medium text-muted-foreground">
                    Teaching Language:
                  </span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border rounded-md px-3 py-1 text-sm focus:outline-none bg-background"
                  >
                    {TEACHING_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {/* =============================================================== */}
            </section>

            {/* ================= MAIN DASHBOARD GRID (UNCHANGED) ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <UploadSection />
                <VoiceControls />
              </div>

              <div className="space-y-6">
                <CurrentLesson />
                <QuickActions />
                <TeachingChatBox />
              </div>
            </div>
            {/* =================================================================== */}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
