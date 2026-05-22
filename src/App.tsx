import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Instagram, 
  Linkedin, 
  Music as MusicIcon, 
  Settings, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Check, 
  Eye, 
  EyeOff, 
  X, 
  Upload, 
  FileVideo, 
  Image as ImageIcon,
  Heart, 
  ArrowDown, 
  Sparkles, 
  VolumeX, 
  Volume2,
  Calendar,
  CloudLightning,
  ExternalLink,
  Save,
  ChevronDown
} from "lucide-react";
import { SiteSettings, Memory, SocialLink } from "./types";
import SplashLoader from "./components/SplashLoader";
import AudioPlayerControl from "./components/AudioPlayerControl";
import AnubisChat from "./components/AnubisChat";

const AVAILABLE_ACCENTS = [
  { id: "rose", name: "aesthetic pink", color: "#ff2d7a", class: "rose-accent" },
  { id: "cyan", name: "cyber cyan", color: "#06b6d4", class: "cyan-accent" },
  { id: "violet", name: "dreamy violet", color: "#8b5cf6", class: "violet-accent" },
  { id: "emerald", name: "electric emerald", color: "#10b981", class: "emerald-accent" },
  { id: "amber", name: "sunset amber", color: "#f59e0b", class: "amber-accent" }
] as const;

const AVAILABLE_FONTS = [
  { id: "Space Grotesk", class: "font-display" },
  { id: "Playfair Display", class: "font-serif" },
  { id: "Inter", class: "font-sans" },
  { id: "JetBrains Mono", class: "font-mono" }
] as const;

export default function App() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [videoMuted, setVideoMuted] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Admin Customizer Workspace Panel State
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("1111");
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [showPassError, setShowPassError] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "multimedia" | "memories" | "about">("general");

  // Local settings copy for updates
  const [draftSettings, setDraftSettings] = useState<SiteSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: string }>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastClickRef = useRef<number>(0);

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastClickRef.current < 350) {
      setAdminOpen(true);
      setIsAuthorized(true);
      setAdminPasscode("1111");
    }
    lastClickRef.current = now;
  };

  // Fetch initial configuration on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (data.success && data.settings) {
        // Guarantee aboutMe defaults are present
        const loadedSettings = {
          ...data.settings,
          aboutMe: data.settings.aboutMe || {
            myName: "Aria Sterling",
            dadName: "Edward Sterling",
            momName: "Elena Sterling",
            age: "21"
          },
          aiSettings: data.settings.aiSettings || {
            anubisAvatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
            hamimPicUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
          }
        };
        setSettings(loadedSettings);
        setDraftSettings(loadedSettings);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      // Simulate minimal loader buffer
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  // Scroll offset listener for transparent to glass transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 150) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync autoplay behavior on unlock
  useEffect(() => {
    if (unlocked && videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log("Video auto playback prevented initially:", err);
      });
    }
  }, [unlocked, settings?.videoUrl]);

  if (isLoading || !settings) {
    return <SplashLoader onComplete={() => setUnlocked(true)} siteName="" />;
  }

  const activeAccent = AVAILABLE_ACCENTS.find(a => a.id === settings.themeAccent) || AVAILABLE_ACCENTS[0];
  const activeFont = AVAILABLE_FONTS.find(f => f.id === settings.fontFamily) || AVAILABLE_FONTS[0];

  // Helper trigger for video volume toggler
  const toggleVideoMute = () => {
    if (videoRef.current) {
      const newMuteState = !videoRef.current.muted;
      videoRef.current.muted = newMuteState;
      setVideoMuted(newMuteState);
    }
  };

  // Authenticate Admin Panel
  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowPassError(false);
    try {
      const response = await fetch("/api/settings/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: adminPasscode })
      });
      const data = await response.json();
      if (data.success) {
        setIsAuthorized(true);
        // Load the full settings include passcode so we can write back
        setDraftSettings(data.settings);
      } else {
        setShowPassError(true);
      }
    } catch (err) {
      console.error(err);
      setShowPassError(true);
    }
  };

  // Save Settings Back
  const handleSaveSettings = async () => {
    if (!draftSettings) return;
    setSavingSettings(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: draftSettings,
          passcode: adminPasscode
        })
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
        alert("Settings saved successfully! Feeling the vibe.");
      } else {
        alert("Authorization failed or save error: " + (data.error || "Unknown"));
      }
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  // File uploader helper using FormData (supports streaming large files, never crashes)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: 'videoUrl' | 'audioUrl' | 'memoryImage' | 'anubisAvatarUrl' | 'hamimPicUrl', memoryIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file || !draftSettings) return;

    setUploadProgress(prev => ({ ...prev, [fieldKey]: "Uploading..." }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("passcode", adminPasscode);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-admin-passcode": adminPasscode
        },
        body: formData
      });
      const data = await response.json();
      if (data.success && data.url) {
        if (fieldKey === 'memoryImage' && typeof memoryIndex === 'number') {
          const updatedMemories = [...draftSettings.memories];
          updatedMemories[memoryIndex] = {
            ...updatedMemories[memoryIndex],
            imageUrl: data.url
          };
          setDraftSettings({ ...draftSettings, memories: updatedMemories });
        } else if (fieldKey === 'videoUrl') {
          setDraftSettings({ ...draftSettings, videoUrl: data.url });
        } else if (fieldKey === 'audioUrl') {
          setDraftSettings({ ...draftSettings, audioUrl: data.url });
        } else if (fieldKey === 'anubisAvatarUrl') {
          setDraftSettings({
            ...draftSettings,
            aiSettings: {
              ...(draftSettings.aiSettings || { anubisAvatarUrl: "", hamimPicUrl: "" }),
              anubisAvatarUrl: data.url
            }
          });
        } else if (fieldKey === 'hamimPicUrl') {
          setDraftSettings({
            ...draftSettings,
            aiSettings: {
              ...(draftSettings.aiSettings || { anubisAvatarUrl: "", hamimPicUrl: "" }),
              hamimPicUrl: data.url
            }
          });
        }
        setUploadProgress(prev => ({ ...prev, [fieldKey]: "Upload successful!" }));
      } else {
        setUploadProgress(prev => ({ ...prev, [fieldKey]: "Upload failed: " + (data.error || "") }));
      }
    } catch (err: any) {
      setUploadProgress(prev => ({ ...prev, [fieldKey]: "Error: " + err.message }));
    }
  };

  // Helper edits for memories
  const updateMemoryField = (id: string, field: keyof Memory, value: string) => {
    if (!draftSettings) return;
    const updatedMemories = draftSettings.memories.map(m => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    });
    setDraftSettings({ ...draftSettings, memories: updatedMemories });
  };

  const deleteMemory = (id: string) => {
    if (!draftSettings) return;
    const filtered = draftSettings.memories.filter(m => m.id !== id);
    setDraftSettings({ ...draftSettings, memories: filtered });
  };

  const addMemory = () => {
    if (!draftSettings) return;
    const newM: Memory = {
      id: Date.now().toString(),
      title: "new memory",
      description: "describe the vibe or date details...",
      imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
      date: "Spring 2026"
    };
    setDraftSettings({
      ...draftSettings,
      memories: [...draftSettings.memories, newM]
    });
  };

  // Dynamic social buttons helper
  const getSocialIcon = (platform: string) => {
    const norm = platform.toLowerCase();
    if (norm.includes("instagram") || norm.includes("ig")) return <Instagram className="w-5 h-5" />;
    if (norm.includes("linkedin")) return <Linkedin className="w-5 h-5" />;
    if (norm.includes("music") || norm.includes("spotify") || norm.includes("sound")) return <MusicIcon className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
  };

  return (
    <div className={`min-h-screen bg-[#fff0f3] text-[#4a0e17] relative ${activeAccent.class} ${activeFont.class} overflow-x-hidden`} id="root-app">
      
      {/* Overlay Splash Loader with absolute user-gesture sound activation triggers */}
      <AnimatePresence mode="wait">
        {!unlocked && (
          <SplashLoader 
            key="splash-overlay-wrapper"
            onComplete={() => {
              setUnlocked(true);
              // Handle immediate audio and video playing on mobile/computer within exact same user interaction tick
              setTimeout(() => {
                const audioEl = document.querySelector("audio");
                if (audioEl) {
                  audioEl.play().catch(err => {
                    console.log("Interactive sound playback triggered failed or was muted:", err);
                  });
                }
                if (videoRef.current) {
                  videoRef.current.play().catch(err => {
                    console.log("Interactive video playback triggered failed:", err);
                  });
                }
              }, 40);
            }} 
            siteName={settings.siteName} 
          />
        )}
      </AnimatePresence>

      {/* Dynamic Background glowing ambient circles */}
      <div className="fixed -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[150px] opacity-40 pointer-events-none animate-glow-slow-1 transition-all duration-1000" style={{ backgroundColor: "#ffb6c1" }} />
      <div className="fixed -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[170px] opacity-35 pointer-events-none animate-glow-slow-2 transition-all duration-1000" style={{ backgroundColor: "#ffc0cb" }} />

      {/* Cinematic Film Grain Scanline Noise Layer */}
      <div className="noise-overlay" />

      {/* Fullscreen Background Cinematic Video */}
      <div className="absolute top-0 left-0 w-full h-[100vh] overflow-hidden select-none z-0">
        <video
          ref={videoRef}
          src={settings.videoUrl}
          autoPlay
          muted={videoMuted}
          loop
          playsInline
          className="w-full h-full object-cover opacity-70 scale-102 transition-all duration-[2000ms]"
        />
        {/* Cinematic gradient framing covering the bottom for transition seamlessness */}
        <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-[#fff0f3] via-[#fff0f3]/85 to-transparent pointer-events-none z-10" />
      </div>

      {/* Premium Float Glass Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ${isScrolled ? "py-4 px-6 md:px-12 bg-[#fff0f3]/60 backdrop-blur-xl border-b border-pink-200/30" : "py-8 px-6 md:px-12 bg-transparent"}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            onClick={handleLogoClick}
            className="flex items-center select-none cursor-pointer group hover:opacity-80 active:scale-95 transition-all text-[#4a0e17]"
            title="Double-tap site name to open customizer"
            id="heading-logo-trigger"
          >
            <span className="text-sm font-display font-medium tracking-[0.3em] uppercase">
              {settings.siteName}
            </span>
          </motion.div>

          {/* Settings button is now completely hidden and integrated into double-tap above */}
          <div className="w-1 h-1 opacity-0 pointer-events-none" />
        </div>
      </header>

      {/* Hero Over-Video Layer & Screen #1 */}
      <section className="relative h-[100vh] w-full max-w-full flex flex-col justify-end items-center px-6 pb-24 z-10">
        
        {/* Action Controls for Video Playing & Ambient Audio */}
        <div className="absolute bottom-32 left-0 right-0 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 w-full max-w-7xl mx-auto pointer-events-none">
          
          {/* Audio volume controller floats beautifully on the bottom left corner */}
          <div className="z-10">
            <AudioPlayerControl 
              audioUrl={settings.audioUrl}
              audioTitle={settings.audioTitle}
              audioArtist={settings.audioArtist}
              unlocked={unlocked}
              accentColor={activeAccent.color}
            />
          </div>

        </div>
      </section>

      {/* Section #2 Scrollable Page Layer */}
      <main className="relative z-20 max-w-4xl mx-auto px-6 pb-32 pt-12 space-y-24">
         
        {/* SECTION 2: About Me (Personal Outline Details Grid) */}
        <section id="section-about-me">
          {/* About Me Details Table/Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel p-6 md:p-10 rounded-[2rem] relative overflow-hidden flex flex-col gap-6 shadow-2xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/40 border border-pink-200/50 space-y-1.5 hover:bg-white/70 transition-all duration-300">
                <span className="text-[10px] font-mono uppercase tracking-widest block text-[#9a5460]">My Name</span>
                <span className="text-lg font-display text-[#4a0e17] font-medium">{settings.aboutMe?.myName || "Aria Sterling"}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white/40 border border-pink-200/50 space-y-1.5 hover:bg-white/70 transition-all duration-300">
                <span className="text-[10px] font-mono uppercase tracking-widest block text-[#9a5460]">Age</span>
                <span className="text-lg font-display text-[#4a0e17] font-medium">{settings.aboutMe?.age || "21"}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white/40 border border-pink-200/50 space-y-1.5 hover:bg-white/70 transition-all duration-300">
                <span className="text-[10px] font-mono uppercase tracking-widest block text-[#9a5460]">Dad's Name</span>
                <span className="text-lg font-display text-[#4a0e17] font-medium">{settings.aboutMe?.dadName || "Edward Sterling"}</span>
              </div>
              <div className="p-5 rounded-2xl bg-white/40 border border-pink-200/50 space-y-1.5 hover:bg-white/70 transition-all duration-300">
                <span className="text-[10px] font-mono uppercase tracking-widest block text-[#9a5460]">Mom's Name</span>
                <span className="text-lg font-display text-[#4a0e17] font-medium">{settings.aboutMe?.momName || "Elena Sterling"}</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* SECTION 3: AI (Anubis Gemini AI Chat System) */}
        <section id="section-ai">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnubisChat aiSettings={settings.aiSettings} accentColor={activeAccent.color} />
          </motion.div>
        </section>

        {/* SECTION 4: Photo / Memories (Memory Box Reels Grid) */}
        <section id="section-photos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {settings.memories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-3xl overflow-hidden glass-panel h-[400px] flex flex-col justify-end p-6 border border-white/10 hover:border-white/20 transition-all duration-500 shadow-xl"
              >
                {/* Visual Image Background */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={memory.imageUrl}
                    alt={memory.title}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-108 filter saturate-[0.85] brightness-[0.75]"
                    referrerPolicy="no-referrer"
                  />
                  {/* Frosted framing overlay using a deep ruby gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-t from-[#4a0e17] via-[#4a0e17]/75 to-transparent pointer-events-none" />
                </div>

                <div className="relative z-10 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-white/50" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-white/60">
                      {memory.date}
                    </span>
                  </div>
                  <h4 className="text-xl font-display font-medium text-white/95 group-hover:text-white transition-colors">
                    {memory.title}
                  </h4>
                  <p className="text-sm text-neutral-300 font-sans font-light leading-relaxed">
                    {memory.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 5: Links (Social anchor portals & bookmarks) */}
        <section id="section-links">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel p-8 rounded-[2rem] border border-pink-250/30 shadow-2xl space-y-6"
          >
            <p className="text-xs font-mono text-[#9a5460] uppercase tracking-widest text-center md:text-left">
              Direct connection anchors to external safe-spaces
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {settings.socialLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl bg-white/45 hover:bg-white/80 hover:border-pink-300/40 border border-pink-100/60 transition-all text-center flex flex-col items-center justify-center gap-3 select-none cursor-pointer duration-300 group"
                  id={`social-link-${link.platform}`}
                >
                  <div className="p-3.5 rounded-full bg-pink-100/50 group-hover:bg-pink-100/90 transition-colors" style={{ color: activeAccent.color }}>
                    {getSocialIcon(link.platform)}
                  </div>
                  <span className="text-xs font-mono tracking-widest uppercase text-[#4a0e17]/85 group-hover:text-[#4a0e17] transition-colors">{link.platform}</span>
                </a>
              ))}
            </div>
          </motion.div>
        </section>

      </main>

      {/* Footer Branding Area */}
      <footer className="border-t border-pink-200/50 py-16 px-6 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center">
          <div className="flex flex-col items-center md:items-start gap-1 select-none">
            <span className="text-xs font-display tracking-[0.2em] text-[#4a0e17] uppercase">
              {settings.siteName} © 2026
            </span>
            <span className="text-[9px] font-mono text-[#9a5460] tracking-wide uppercase">
              designed with cinematic precision
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="text-[10px] font-mono text-[#9a5460] uppercase tracking-widest">
              capturing beautiful chaos
            </span>
          </div>
        </div>
      </footer>

      {/* Slide-out Customizer Workspace & Admin Lock Screen */}
      <AnimatePresence>
        {adminOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            
            {/* Backdrop filter trigger click away */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
              onClick={() => setAdminOpen(false)}
            />

            {/* Customizer Drawer Form Area */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg h-full glass-panel-heavy overflow-y-auto px-6 py-8 md:p-8 flex flex-col gap-6 z-10"
              id="admin-drawer"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-neutral-400" />
                  <h3 className="text-lg font-display font-medium uppercase tracking-wider">
                    Site Customizer
                  </h3>
                </div>
                <button
                  onClick={() => setAdminOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
                  id="close-drawer-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!isAuthorized ? (
                /* Admin lock authenticate page */
                <form onSubmit={handleAdminAuth} className="flex-1 flex flex-col justify-center items-center gap-6 max-w-sm mx-auto text-center">
                  <div className="p-4 rounded-full border border-white/10 bg-white/5">
                    <Lock className="w-8 h-8 text-neutral-400" />
                  </div>
                  <div>
                    <h4 className="text-md uppercase font-display tracking-widest mb-1.5">
                      Enter Admin Workspace
                    </h4>
                    <p className="text-xs text-neutral-500 font-mono">
                      Passcode required to save customizations or replace multimedia reels (default code: 1111)
                    </p>
                  </div>
                  <div className="w-full relative">
                    <input
                      type="password"
                      placeholder="Enter Passcode..."
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      className="w-full py-3.5 px-4 rounded-xl text-center glass-input font-mono text-sm tracking-[0.4em]"
                      id="admin-passcode-input"
                    />
                    {showPassError && (
                      <p className="text-rose-500 text-xs font-mono mt-2 uppercase tracking-wide">
                        Incorrect Passcode. Try 1111.
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-widest cursor-pointer hover:border-white/30 transition-all"
                    id="submit-auth-btn"
                  >
                    Unlock Workspace
                  </button>
                </form>
              ) : (
                /* Authenticated Settings Workspace Form */
                <div className="flex-1 flex flex-col gap-6">
                  
                  {/* Status Alerts */}
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono text-emerald-300">
                      Successfully authenticated admin controls.
                    </span>
                  </div>

                  {/* Settings Category Tabs Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5 text-[9px] sm:text-[10px] font-mono tracking-wider uppercase">
                    {(["general", "multimedia", "memories", "about"] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-1 text-center truncate rounded-lg cursor-pointer transition-all ${activeTab === tab ? "bg-white/10 text-white border border-white/10" : "text-neutral-400 hover:text-white"}`}
                      >
                        {tab === "about" ? "about me" : tab}
                      </button>
                    ))}
                  </div>

                  {/* Settings Form Content wrapper */}
                  <div className="flex-1 space-y-6">
                    {draftSettings && activeTab === "general" && (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-mono text-neutral-400 uppercase">Site Pen Name</label>
                          <input
                            type="text"
                            value={draftSettings.siteName}
                            onChange={(e) => setDraftSettings({ ...draftSettings, siteName: e.target.value })}
                            className="w-full p-3.5 rounded-xl glass-input text-sm"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-mono text-neutral-400 uppercase">Subtitle Mood</label>
                          <input
                            type="text"
                            value={draftSettings.siteTitle}
                            onChange={(e) => setDraftSettings({ ...draftSettings, siteTitle: e.target.value })}
                            className="w-full p-3.5 rounded-xl glass-input text-sm"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-mono text-neutral-400 uppercase">Interactive Bio / Pen Outline</label>
                          <textarea
                            rows={3}
                            value={draftSettings.bio}
                            onChange={(e) => setDraftSettings({ ...draftSettings, bio: e.target.value })}
                            className="w-full p-3.5 rounded-xl glass-input text-sm resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-mono text-neutral-400 uppercase">Typography Selection</label>
                            <div className="relative">
                              <select
                                value={draftSettings.fontFamily}
                                onChange={(e) => setDraftSettings({ ...draftSettings, fontFamily: e.target.value as any })}
                                className="w-full p-3.5 rounded-xl glass-input text-sm bg-black border border-white/10 appearance-none font-mono cursor-pointer"
                              >
                                {AVAILABLE_FONTS.map(f => (
                                  <option key={f.id} value={f.id} className="bg-neutral-950 text-white font-mono">{f.id}</option>
                                ))}
                              </select>
                              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronDown className="w-4 h-4 text-neutral-400" />
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-mono text-neutral-400 uppercase">Interactive Accent Theme</label>
                            <div className="relative">
                              <select
                                value={draftSettings.themeAccent}
                                onChange={(e) => setDraftSettings({ ...draftSettings, themeAccent: e.target.value as any })}
                                className="w-full p-3.5 rounded-xl glass-input text-sm bg-black border border-white/10 appearance-none font-mono cursor-pointer"
                              >
                                {AVAILABLE_ACCENTS.map(a => (
                                  <option key={a.id} value={a.id} className="bg-neutral-950 text-white font-mono">{a.name}</option>
                                ))}
                              </select>
                              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                <ChevronDown className="w-4 h-4 text-neutral-400" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-white/10 pt-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-mono text-neutral-400 uppercase">Social Connectivity Connections</h5>
                          </div>
                          {draftSettings.socialLinks.map((link, idx) => (
                            <div key={idx} className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={link.platform}
                                placeholder="Platform (e.g. TikTok)"
                                onChange={(e) => {
                                  const updated = [...draftSettings.socialLinks];
                                  updated[idx] = { ...updated[idx], platform: e.target.value };
                                  setDraftSettings({ ...draftSettings, socialLinks: updated });
                                }}
                                className="p-2.5 rounded-lg glass-input text-xs"
                              />
                              <input
                                type="text"
                                value={link.url}
                                placeholder="Social Profile URL"
                                onChange={(e) => {
                                  const updated = [...draftSettings.socialLinks];
                                  updated[idx] = { ...updated[idx], url: e.target.value };
                                  setDraftSettings({ ...draftSettings, socialLinks: updated });
                                }}
                                className="p-2.5 rounded-lg glass-input text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {draftSettings && activeTab === "multimedia" && (
                      <div className="space-y-6">
                        
                        {/* Video Reel Settings */}
                        <div className="space-y-3">
                          <h5 className="text-xs font-mono text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
                            <FileVideo className="w-4 h-4" />
                            Fullscreen Autoplay Reel Video
                          </h5>
                          <div className="flex flex-col gap-1.5">
                            <input
                              type="text"
                              value={draftSettings.videoUrl}
                              placeholder="Direct HTTP source .mp4 URL..."
                              onChange={(e) => setDraftSettings({ ...draftSettings, videoUrl: e.target.value })}
                              className="w-full p-3.5 rounded-xl glass-input text-xs"
                            />
                            <div className="text-[10px] font-mono text-neutral-500 lowercase leading-relaxed">
                              Tip: You can use a direct link to any MP4/WebM video asset. Alternatively, replace by uploading below.
                            </div>
                          </div>

                          {/* Quick upload drop zone simulator */}
                          <div className="relative">
                            <label className="w-full py-4 border border-dashed border-white/15 hover:border-white/35 bg-white/5 hover:bg-white/10 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                              <Upload className="w-4 h-4 text-neutral-400" />
                              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 text-center">
                                {uploadProgress.videoUrl || "Choose or Drag Scene MP4 File"}
                              </span>
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleFileUpload(e, 'videoUrl')}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        {/* AudioTrack Settings */}
                        <div className="space-y-3 border-t border-white/10 pt-4">
                          <h5 className="text-xs font-mono text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
                            <MusicIcon className="w-4 h-4" />
                            Ambient Autoplay Sound/Music
                          </h5>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-mono text-neutral-400 uppercase">Song Title</label>
                              <input
                                type="text"
                                value={draftSettings.audioTitle}
                                placeholder="Midnight reflection..."
                                onChange={(e) => setDraftSettings({ ...draftSettings, audioTitle: e.target.value })}
                                className="p-3 rounded-lg glass-input text-xs"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-mono text-neutral-400 uppercase">Artist Name</label>
                              <input
                                type="text"
                                value={draftSettings.audioArtist}
                                placeholder="Luna & Sounds..."
                                onChange={(e) => setDraftSettings({ ...draftSettings, audioArtist: e.target.value })}
                                className="p-3 rounded-lg glass-input text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-mono text-neutral-400 uppercase">Direct Audio Track Link (.mp3)</label>
                            <input
                              type="text"
                              value={draftSettings.audioUrl}
                              placeholder="Direct MP3 Link URL..."
                              onChange={(e) => setDraftSettings({ ...draftSettings, audioUrl: e.target.value })}
                              className="w-full p-3.5 rounded-xl glass-input text-xs"
                            />
                          </div>

                          {/* Quick music track upload element */}
                          <div className="relative">
                            <label className="w-full py-4 border border-dashed border-white/15 hover:border-white/35 bg-white/5 hover:bg-white/10 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                              <Upload className="w-4 h-4 text-neutral-400" />
                              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 text-center">
                                {uploadProgress.audioUrl || "Choose Ambient Mp3 File"}
                              </span>
                              <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => handleFileUpload(e, 'audioUrl')}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                      </div>
                    )}

                    {draftSettings && activeTab === "memories" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-mono text-neutral-400 uppercase">Captured Memory Reels</h5>
                          <button
                            onClick={addMemory}
                            className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/25 hover:bg-white/5 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            New Memory
                          </button>
                        </div>

                        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-1">
                          {draftSettings.memories.map((m, idx) => (
                            <div key={m.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 relative">
                              <button
                                onClick={() => deleteMemory(m.id)}
                                className="absolute top-4 right-4 text-red-400 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Delete Memory"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              <p className="text-[10px] font-mono text-neutral-500 uppercase">Memory Item #{idx + 1}</p>

                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={m.title}
                                  placeholder="Memory Title"
                                  onChange={(e) => updateMemoryField(m.id, 'title', e.target.value)}
                                  className="p-2.5 rounded-lg glass-input text-xs"
                                />
                                <input
                                  type="text"
                                  value={m.date}
                                  placeholder="Season or Date Label"
                                  onChange={(e) => updateMemoryField(m.id, 'date', e.target.value)}
                                  className="p-2.5 rounded-lg glass-input text-xs"
                                />
                              </div>

                              <input
                                type="text"
                                value={m.description}
                                placeholder="Brief memory note descriptive sentence..."
                                onChange={(e) => updateMemoryField(m.id, 'description', e.target.value)}
                                className="w-full p-2.5 rounded-lg glass-input text-xs"
                              />

                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={m.imageUrl}
                                    placeholder="Image URL link..."
                                    onChange={(e) => updateMemoryField(m.id, 'imageUrl', e.target.value)}
                                    className="flex-1 p-2.5 rounded-lg glass-input text-[11px]"
                                  />
                                </div>
                                <label className="w-full py-2.5 border border-dashed border-white/15 hover:border-white/35 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all">
                                  <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                                  <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 text-center">
                                    Upload Photo
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'memoryImage', idx)}
                                    className="hidden"
                                  />
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {draftSettings && activeTab === "about" && (
                      <div className="space-y-4">
                        <h5 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                          About Me Information
                        </h5>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-neutral-400 uppercase">My Name</label>
                          <input
                            type="text"
                            value={draftSettings.aboutMe?.myName || ""}
                            onChange={(e) => {
                              const existingAbout = draftSettings.aboutMe || { myName: "", dadName: "", momName: "", age: "" };
                              setDraftSettings({
                                ...draftSettings,
                                aboutMe: { ...existingAbout, myName: e.target.value }
                              });
                            }}
                            className="w-full p-3.5 rounded-xl glass-input text-sm"
                            placeholder="Enter your name"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-neutral-400 uppercase">Age</label>
                          <input
                            type="text"
                            value={draftSettings.aboutMe?.age || ""}
                            onChange={(e) => {
                              const existingAbout = draftSettings.aboutMe || { myName: "", dadName: "", momName: "", age: "" };
                              setDraftSettings({
                                ...draftSettings,
                                aboutMe: { ...existingAbout, age: e.target.value }
                              });
                            }}
                            className="w-full p-3.5 rounded-xl glass-input text-sm"
                            placeholder="Enter age"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-neutral-400 uppercase">Dad's Name</label>
                          <input
                            type="text"
                            value={draftSettings.aboutMe?.dadName || ""}
                            onChange={(e) => {
                              const existingAbout = draftSettings.aboutMe || { myName: "", dadName: "", momName: "", age: "" };
                              setDraftSettings({
                                ...draftSettings,
                                aboutMe: { ...existingAbout, dadName: e.target.value }
                              });
                            }}
                            className="w-full p-3.5 rounded-xl glass-input text-sm"
                            placeholder="Dad's name"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono text-neutral-400 uppercase">Mom's Name</label>
                          <input
                            type="text"
                            value={draftSettings.aboutMe?.momName || ""}
                            onChange={(e) => {
                              const existingAbout = draftSettings.aboutMe || { myName: "", dadName: "", momName: "", age: "" };
                              setDraftSettings({
                                ...draftSettings,
                                aboutMe: { ...existingAbout, momName: e.target.value }
                              });
                            }}
                            className="w-full p-3.5 rounded-xl glass-input text-sm"
                            placeholder="Mom's name"
                          />
                        </div>

                        {/* AI ANUBIS CONFIGURATION */}
                        <div className="border-t border-white/10 pt-4 space-y-4">
                          <h6 className="text-xs font-mono text-neutral-300 uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-neutral-400" />
                            Anubis Gemini AI Visuals
                          </h6>

                          {/* Anubis avatar controls */}
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-mono text-neutral-400 uppercase">Anubis Profile Picture URL</label>
                            <input
                              type="text"
                              value={draftSettings.aiSettings?.anubisAvatarUrl || ""}
                              onChange={(e) => {
                                const existingAI = draftSettings.aiSettings || { anubisAvatarUrl: "", hamimPicUrl: "" };
                                setDraftSettings({
                                  ...draftSettings,
                                  aiSettings: { ...existingAI, anubisAvatarUrl: e.target.value }
                                });
                              }}
                              className="w-full p-3.5 rounded-xl glass-input text-xs"
                              placeholder="Avatar image URL..."
                            />
                            <label className="w-full py-2.5 border border-dashed border-white/15 hover:border-white/35 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all">
                              <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                              <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 text-center">
                                {uploadProgress.anubisAvatarUrl || "Upload Anubis Avatar Image"}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'anubisAvatarUrl')}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {/* Hamim custom pic controls */}
                          <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                            <label className="text-[10px] font-mono text-neutral-400 uppercase">Hamim (Father/Self) Photo Attachment</label>
                            <input
                              type="text"
                              value={draftSettings.aiSettings?.hamimPicUrl || ""}
                              onChange={(e) => {
                                const existingAI = draftSettings.aiSettings || { anubisAvatarUrl: "", hamimPicUrl: "" };
                                setDraftSettings({
                                  ...draftSettings,
                                  aiSettings: { ...existingAI, hamimPicUrl: e.target.value }
                                });
                              }}
                              className="w-full p-3.5 rounded-xl glass-input text-xs"
                              placeholder="Hamim photo URL..."
                            />
                            <label className="w-full py-2.5 border border-dashed border-white/15 hover:border-white/35 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all">
                              <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                              <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 text-center">
                                {uploadProgress.hamimPicUrl || "Upload Hamim Attachment Image"}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'hamimPicUrl')}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar fixed footer within drawer */}
                  <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                    <button
                      onClick={() => {
                        // Reset copy
                        setDraftSettings({ ...settings });
                        alert("Reset configuration buffer. Current active settings loaded.");
                      }}
                      className="px-4 py-3 rounded-xl hover:bg-white/5 text-xs font-mono text-neutral-400 hover:text-neutral-100 cursor-pointer"
                    >
                      Reset Draft
                    </button>

                    <button
                      onClick={handleSaveSettings}
                      disabled={savingSettings}
                      className="px-6 py-3 rounded-xl bg-white text-black hover:bg-neutral-200 disabled:opacity-50 text-xs font-mono font-medium tracking-widest uppercase flex items-center gap-2 cursor-pointer transition-all shadow-lg"
                      id="save-settings-btn"
                    >
                      {savingSettings ? (
                        <span>Saving...</span>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 fill-black text-black" />
                          <span>Apply changes</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
