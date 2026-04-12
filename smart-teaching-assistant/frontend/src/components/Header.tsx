import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";

interface HeaderProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export function Header({ isDarkMode, setIsDarkMode }: HeaderProps) {
  return (
    <header className="glass-card border-b-0 rounded-none backdrop-blur-xl border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">
              Smart Teacher Robot
            </span>
            <div className="flex gap-2">
              <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">
                Original UI
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                Voice Mode
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Voice-first teaching interface
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="hover-bounce"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}