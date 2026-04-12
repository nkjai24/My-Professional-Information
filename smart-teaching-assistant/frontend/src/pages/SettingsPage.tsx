import { useState } from "react";
import { Header } from "../components/Header";
import { AppSidebar } from "../components/AppSidebar";
import { SidebarProvider } from "../components/ui/sidebar";
import { Settings, User, Volume2, Mic, Globe, Shield, Bell, Palette, Database, Download } from "lucide-react";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { Slider } from "../components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";

const SettingsPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState([1.0]);
  const [volume, setVolume] = useState([75]);
  const [language, setLanguage] = useState("en");
  const [voiceGender, setVoiceGender] = useState("neutral");

  return (
    <SidebarProvider>
      <div className={`min-h-screen w-full ${isDarkMode ? 'dark' : ''}`}>
        <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        
        <div className="flex w-full">
          <AppSidebar />
          
          <main className="flex-1 p-6 space-y-6 animate-fade-in">
            <div className="mb-8">
              <h1 className="text-3xl font-display font-bold mb-2 gradient-text">
                Settings
              </h1>
              <p className="text-muted-foreground text-lg">
                Customize your Smart Teacher Robot experience
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Settings */}
              <div className="glass-card p-6 hover-bounce">
                <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                  <User className="h-6 w-6 text-primary" />
                  Profile Settings
                </h3>
                
                <div className="space-y-4">
                  {/*<div>
                    <Label htmlFor="name">Display Name</Label>
                    <Input id="name" placeholder="Enter your name" defaultValue="Student" className="mt-1" />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" className="mt-1" />
                  </div>*/}
                  
                  <div>
                  <Label htmlFor="learning-goal">Learning Goal</Label>
<Select defaultValue="ai-fundamentals">
  <SelectTrigger className="mt-1">
    <SelectValue />
  </SelectTrigger>

  <SelectContent>

    {/* AI & Technology */}
    <SelectItem value="ai-fundamentals">AI Fundamentals</SelectItem>
    <SelectItem value="machine-learning">Machine Learning</SelectItem>
    <SelectItem value="deep-learning">Deep Learning</SelectItem>
    <SelectItem value="computer-vision">Computer Vision</SelectItem>
    <SelectItem value="nlp">Natural Language Processing</SelectItem>
    <SelectItem value="data-science">Data Science</SelectItem>
    <SelectItem value="data-analytics">Data Analytics</SelectItem>
    <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
    <SelectItem value="cloud-computing">Cloud Computing</SelectItem>
    <SelectItem value="blockchain">Blockchain</SelectItem>
    <SelectItem value="iot">Internet of Things (IoT)</SelectItem>
    <SelectItem value="robotics">Robotics</SelectItem>
    <SelectItem value="software-engineering">Software Engineering</SelectItem>
    <SelectItem value="web-development">Web Development</SelectItem>
    <SelectItem value="mobile-development">Mobile App Development</SelectItem>
    <SelectItem value="database-management">Database Management</SelectItem>
    <SelectItem value="devops">DevOps</SelectItem>

    {/* Programming */}
    <SelectItem value="programming-basics">Programming Basics</SelectItem>
    <SelectItem value="python">Python Programming</SelectItem>
    <SelectItem value="java">Java Programming</SelectItem>
    <SelectItem value="c-programming">C Programming</SelectItem>
    <SelectItem value="cpp">C++ Programming</SelectItem>
    <SelectItem value="javascript">JavaScript</SelectItem>
    <SelectItem value="react">React Development</SelectItem>
    <SelectItem value="nodejs">Node.js</SelectItem>
    <SelectItem value="django">Django</SelectItem>

    {/* School Subjects */}
    <SelectItem value="mathematics">Mathematics</SelectItem>
    <SelectItem value="physics">Physics</SelectItem>
    <SelectItem value="chemistry">Chemistry</SelectItem>
    <SelectItem value="biology">Biology</SelectItem>
    <SelectItem value="science">General Science</SelectItem>
    <SelectItem value="english">English</SelectItem>
    <SelectItem value="social-studies">Social Studies</SelectItem>
    <SelectItem value="history">History</SelectItem>
    <SelectItem value="geography">Geography</SelectItem>
    <SelectItem value="political-science">Political Science</SelectItem>
    <SelectItem value="economics">Economics</SelectItem>

    {/* Engineering */}
    <SelectItem value="computer-engineering">Computer Engineering</SelectItem>
    <SelectItem value="electrical-engineering">Electrical Engineering</SelectItem>
    <SelectItem value="electronics">Electronics & Communication</SelectItem>
    <SelectItem value="mechanical-engineering">Mechanical Engineering</SelectItem>
    <SelectItem value="civil-engineering">Civil Engineering</SelectItem>

    {/* Medical */}
    <SelectItem value="medicine">Medicine</SelectItem>
    <SelectItem value="anatomy">Anatomy</SelectItem>
    <SelectItem value="physiology">Physiology</SelectItem>
    <SelectItem value="pharmacology">Pharmacology</SelectItem>
    <SelectItem value="nursing">Nursing</SelectItem>
    <SelectItem value="public-health">Public Health</SelectItem>

    {/* Commerce & Business */}
    <SelectItem value="accounting">Accounting</SelectItem>
    <SelectItem value="finance">Finance</SelectItem>
    <SelectItem value="business-management">Business Management</SelectItem>
    <SelectItem value="marketing">Marketing</SelectItem>
    <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
    <SelectItem value="human-resources">Human Resources</SelectItem>

    {/* Humanities */}
    <SelectItem value="psychology">Psychology</SelectItem>
    <SelectItem value="philosophy">Philosophy</SelectItem>
    <SelectItem value="sociology">Sociology</SelectItem>
    <SelectItem value="law">Law</SelectItem>
    <SelectItem value="education">Education Studies</SelectItem>

    {/* Competitive Exams */}
    <SelectItem value="upsc">UPSC Preparation</SelectItem>
    <SelectItem value="ssc">SSC Preparation</SelectItem>
    <SelectItem value="banking">Banking Exams</SelectItem>
    <SelectItem value="gate">GATE Preparation</SelectItem>
    <SelectItem value="jee">JEE Preparation</SelectItem>
    <SelectItem value="neet">NEET Preparation</SelectItem>

    {/* Languages */}
    <SelectItem value="tamil">Tamil</SelectItem>
    <SelectItem value="hindi">Hindi</SelectItem>
    <SelectItem value="english-language">English Language</SelectItem>
    <SelectItem value="spanish">Spanish</SelectItem>
    <SelectItem value="french">French</SelectItem>
    <SelectItem value="german">German</SelectItem>
    <SelectItem value="japanese">Japanese</SelectItem>

    {/* Skills & Career */}
    <SelectItem value="communication-skills">Communication Skills</SelectItem>
    <SelectItem value="presentation-skills">Presentation Skills</SelectItem>
    <SelectItem value="leadership">Leadership</SelectItem>
    <SelectItem value="critical-thinking">Critical Thinking</SelectItem>
    <SelectItem value="problem-solving">Problem Solving</SelectItem>
    <SelectItem value="career-development">Career Development</SelectItem>
    <SelectItem value="interview-preparation">Interview Preparation</SelectItem>

  </SelectContent>
</Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select defaultValue="beginner">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Voice & Audio Settings */}
              <div className="glass-card p-6 hover-bounce">
                <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                  <Volume2 className="h-6 w-6 text-secondary" />
                  Voice & Audio
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Voice Commands</Label>
                      <p className="text-sm text-muted-foreground">Enable voice interaction</p>
                    </div>
                    <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-play Lessons</Label>
                      <p className="text-sm text-muted-foreground">Start lessons automatically</p>
                    </div>
                    <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
                  </div>
                  
                  <div>
                    <Label>Voice Speed</Label>
                    <div className="mt-2 px-3">
                      <Slider
                        value={voiceSpeed}
                        onValueChange={setVoiceSpeed}
                        max={2}
                        min={0.5}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0.5x</span>
                        <span>Speed: {voiceSpeed[0]}x</span>
                        <span>2.0x</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Volume</Label>
                    <div className="mt-2 px-3">
                      <Slider
                        value={volume}
                        onValueChange={setVolume}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0%</span>
                        <span>{volume[0]}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Voice Gender</Label>
                    <Select value={voiceGender} onValueChange={setVoiceGender}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Language & Localization */}
              <div className="glass-card p-6 hover-bounce">
                <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                  <Globe className="h-6 w-6 text-accent" />
                  Language & Region
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Interface Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Time Zone</Label>
                    <Select defaultValue="utc">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc">UTC</SelectItem>
                        <SelectItem value="est">Eastern Time</SelectItem>
                        <SelectItem value="pst">Pacific Time</SelectItem>
                        <SelectItem value="cet">Central European Time</SelectItem>
                        <SelectItem value="jst">Japan Standard Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Date Format</Label>
                    <Select defaultValue="mm-dd-yyyy">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notifications & Privacy */}
              <div className="glass-card p-6 hover-bounce">
                <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                  <Bell className="h-6 w-6 text-green-600" />
                  Notifications & Privacy
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Lesson reminders and updates</p>
                    </div>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Learning Analytics</Label>
                      <p className="text-sm text-muted-foreground">Track progress and performance</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Voice Data Storage</Label>
                      <p className="text-sm text-muted-foreground">Save voice interactions for improvement</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full hover-bounce">
                      <Shield className="h-4 w-4 mr-2" />
                      Privacy Policy
                    </Button>
                    <Button variant="outline" className="w-full hover-bounce">
                      <Download className="h-4 w-4 mr-2" />
                      Export My Data
                    </Button>
                  </div>
                </div>
              </div>

              {/* App Preferences */}
              <div className="glass-card p-6 hover-bounce lg:col-span-2">
                <h3 className="font-semibold text-xl mb-6 flex items-center gap-2">
                  <Palette className="h-6 w-6 text-purple-600" />
                  App Preferences
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label>Theme</Label>
                    <Select defaultValue="system">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Animation Speed</Label>
                    <Select defaultValue="normal">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">Slow</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="off">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Sidebar Behavior</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always-open">Always Open</SelectItem>
                        <SelectItem value="auto">Auto Collapse</SelectItem>
                        <SelectItem value="always-collapsed">Always Collapsed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex flex-wrap gap-3">
                  <Button className="hover-bounce">
                    Save Changes
                  </Button>
                  <Button variant="outline" className="hover-bounce">
                    Reset to Defaults
                  </Button>
                  <Button variant="outline" className="hover-bounce">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Settings
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SettingsPage;