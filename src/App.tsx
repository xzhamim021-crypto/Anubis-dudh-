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
import { createClient } from "@supabase/supabase-js";

// Initialize client-side Supabase as a safe fallback when running on static servers (like Vercel)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "https://kgiocgwtkncsebhzqxzs.supabase.co";
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnaW9jZ3d0a25jc2ViaHpxeHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDI5OTQsImV4cCI6MjA5NTAxODk5NH0.CJ7zm6eyPnJZakr46eFmy1IVIIeBdQgaK5_w5hZ_l8E";
const clientSupabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

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

const DEFAULT_CLIENT_SETTINGS: SiteSettings = {
  siteName: "Aria Sterling",
  siteTitle: "cinematic daydreaming",
  bio: "21. digital artist & storyteller. capturing ephemeral feelings, neon dreams, and midnight drives. welcome to my safe space.",
  fontFamily: "Space Grotesk",
  themeAccent: "rose",
  videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-over-a-gentle-ocean-40939-large.mp4",
  audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
  audioTitle: "Reflections of Midnight",
  audioArtist: "Ambient Lab & Luna",
  floatingQuotes: [
    "we are all just stories in the end.",
    "collecting quiet moments before they fade.",
    "nostalgia is a file we download when we are lonely.",
    "neon glow and warm rain.",
    "there is a beautiful poetry in everyday chaos."
  ],
  socialLinks: [
    { platform: "Instagram", url: "https://instagram.com" },
    { platform: "TikTok", url: "https://tiktok.com" },
    { platform: "Spotify", url: "https://spotify.com" },
    { platform: "Pinterest", url: "https://pinterest.com" }
  ],
  memories: [
    {
      id: "1",
      title: "midnight drives in the fog",
      description: "listening to slow-reverb songs, watching streetlights blur.",
      imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
      date: "May 2026"
    },
    {
      id: "2",
      title: "quiet coffee & rain",
      description: "the perfect afternoon spent holding warm mugs while the storm passed.",
      imageUrl: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=800&q=80",
      date: "April 2026"
    },
    {
      id: "3",
      title: "gazing at city silhouettes",
      description: "climbing up the high point to watch the city blink below.",
      imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80",
      date: "March 2026"
    },
    {
      id: "4",
      title: "dreamy sunset horizons",
      description: "where the sky blushes purple and peach just before dark.",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      date: "February 2026"
    }
  ],
  adminPasscode: "1111",
  aboutMe: {
    myName: "Aria Sterling",
    dadName: "Edward Sterling",
    momName: "Elena Sterling",
    age: "21",
    customFields: [
      { id: "f1", label: "Profession", value: "Digital Artist" },
      { id: "f2", label: "Favorite Space", value: "Neon-lit studio at 2 AM" }
    ]
  },
  aiSettings: {
    anubisAvatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    hamimPicUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  }
};

export default function App() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_CLIENT_SETTINGS);
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
  const [draftSettings, setDraftSettings] = useState<SiteSettings>(DEFAULT_CLIENT_SETTINGS);
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
      // 1. Try backend server API first
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          const loadedSettings: SiteSettings = {
            ...DEFAULT_CLIENT_SETTINGS,
            ...data.settings,
            aboutMe: {
              ...DEFAULT_CLIENT_SETTINGS.aboutMe,
              ...(data.settings.aboutMe || {})
            },
            aiSettings: {
              ...DEFAULT_CLIENT_SETTINGS.aiSettings,
              ...(data.settings.aiSettings || {})
            },
            socialLinks: data.settings.socialLinks || DEFAULT_CLIENT_SETTINGS.socialLinks || [],
            memories: data.settings.memories || DEFAULT_CLIENT_SETTINGS.memories || [],
            floatingQuotes: data.settings.floatingQuotes || DEFAULT_CLIENT_SETTINGS.floatingQuotes || []
          };
          setSettings(loadedSettings);
          setDraftSettings(loadedSettings);
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Express backend API unavailable. Attempting direct client-side Supabase connection:", err);
    }

    // 2. Client-side Supabase direct fetch fallback (supports pure static serverless deployments like Vercel)
    if (clientSupabase) {
      try {
        const { data, error } = await clientSupabase
          .from("portfolio_settings")
          .select("data")
          .eq("id", 1)
          .single();

        if (!error && data?.data) {
          const loadedSettings: SiteSettings = {
            ...DEFAULT_CLIENT_SETTINGS,
            ...data.data,
            aboutMe: {
              ...DEFAULT_CLIENT_SETTINGS.aboutMe,
              ...(data.data.aboutMe || {})
            },
            aiSettings: {
              ...DEFAULT_CLIENT_SETTINGS.aiSettings,
              ...(data.data.aiSettings || {})
            },
            socialLinks: data.data.socialLinks || DEFAULT_CLIENT_SETTINGS.socialLinks || [],
            memories: data.data.memories || DEFAULT_CLIENT_SETTINGS.memories || [],
            floatingQuotes: data.data.floatingQuotes || DEFAULT_CLIENT_SETTINGS.floatingQuotes || []
          };
          setSettings(loadedSettings);
          setDraftSettings(loadedSettings);
          setIsLoading(false);
          return;
        } else if (error) {
          console.warn("Could not load directly from Supabase, falling back to local defaults:", error.message);
        }
      } catch (err) {
        console.error("Supabase direct load error:", err);
      }
    }

    // 3. Fallback to client state (DEFAULT_CLIENT_SETTINGS)
    setSettings(DEFAULT_CLIENT_SETTINGS);
    setDraftSettings(DEFAULT_CLIENT_SETTINGS);
    setIsLoading(false);
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
      // 1. Try saving through back-end Express API
      try {
        const response = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            settings: draftSettings,
            passcode: adminPasscode
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSettings(data.settings);
            alert("Settings saved successfully! Feeling the vibe.");
            return;
          }
        }
      } catch (apiErr) {
        console.warn("Backend API not reachable for saving, trying direct client-side Supabase write:", apiErr);
      }

      // 2. Direct client-side Supabase upsert fallback (supports pure static serverless deployments like Vercel)
      if (clientSupabase) {
        const { error } = await clientSupabase
          .from("portfolio_settings")
          .upsert({ id: 1, data: draftSettings });

        if (!error) {
          setSettings(draftSettings);
          alert("Settings saved directly to Supabase sandbox! Ephemeral Vercel state bypassed successfully.");
          return;
        } else {
          throw new Error(error.message);
        }
      }

      throw new Error("Unable to save settings. Setup neither server nor direct client-side Supabase parameters.");
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

    const updateFieldWithUrl = (url: string) => {
      if (fieldKey === 'memoryImage' && typeof memoryIndex === 'number') {
        const updatedMemories = [...draftSettings.memories];
        updatedMemories[memoryIndex] = {
          ...updatedMemories[memoryIndex],
          imageUrl: url
        };
        setDraftSettings({ ...draftSettings, memories: updatedMemories });
      } else if (fieldKey === 'videoUrl') {
        setDraftSettings({ ...draftSettings, videoUrl: url });
      } else if (fieldKey === 'audioUrl') {
        setDraftSettings({ ...draftSettings, audioUrl: url });
      } else if (fieldKey === 'anubisAvatarUrl') {
        setDraftSettings({
          ...draftSettings,
          aiSettings: {
            ...(draftSettings.aiSettings || { anubisAvatarUrl: "", hamimPicUrl: "" }),
            anubisAvatarUrl: url
          }
        });
      } else if (fieldKey === 'hamimPicUrl') {
        setDraftSettings({
          ...draftSettings,
          aiSettings: {
            ...(draftSettings.aiSettings || { anubisAvatarUrl: "", hamimPicUrl: "" }),
            hamimPicUrl: url
          }
        });
      }
    };

    try {
      // 1. Try standard back-end Express API upload first
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

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.url) {
            updateFieldWithUrl(data.url);
            setUploadProgress(prev => ({ ...prev, [fieldKey]: "Upload successful!" }));
            return;
          }
        }
      } catch (apiErr) {
        console.warn("Backend upload failed/unavailable, trying client-side Supabase Storage directly:", apiErr);
      }

      // 2. Direct client-side Supabase Storage upload fallback
      if (clientSupabase) {
        const fileExt = file.name.split('.').pop() || 'bin';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await clientSupabase.storage
          .from("portfolio_media")
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (!uploadError && uploadData) {
          const { data: urlData } = clientSupabase.storage
            .from("portfolio_media")
            .getPublicUrl(fileName);

          if (urlData?.publicUrl) {
            updateFieldWithUrl(urlData.publicUrl);
            setUploadProgress(prev => ({ ...prev, [fieldKey]: "Upload successful!" }));
            return;
          }
        } else if (uploadError) {
          throw new Error(uploadError.message);
        }
      }

      throw new Error("Could not find upload provider. Verify API or Supabase Credentials.");
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
              // Handle immediate audio and video playing synchronously inside the user-gesture click tick
              try {
                const audioEl = document.querySelector("audio");
                if (audioEl) {
                  const p = audioEl.play();
                  if (p && typeof p.catch === "function") {
                    p.catch(err => {
                      console.log("Synchronous interactive audio playback prevented:", err);
                    });
                  }
                }
              } catch (audioErr) {
                console.error("Audio trigger synchronous error:", audioErr);
              }

              try {
                if (videoRef.current) {
                  const p = videoRef.current.play();
                  if (p && typeof p.catch === "function") {
                    p.catch(err => {
                      console.log("Synchronous interactive video playback prevented:", err);
                    });
                  }
                }
              } catch (videoErr) {
                console.error("Video trigger synchronous error:", videoErr);
              }
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
              {settings.aboutMe?.customFields?.map((field) => (
                <div key={field.id} className="p-5 rounded-2xl bg-white/40 border border-pink-200/50 space-y-1.5 hover:bg-white/70 transition-all duration-300">
                  <span className="text-[10px] font-mono uppercase tracking-widest block text-[#9a5460]">{field.label}</span>
                  <span className="text-lg font-display text-[#4a0e17] font-medium">{field.value}</span>
                </div>
              ))}
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

                        <div className="flex flex-col gap-1.5 font-sans">
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

                        {/* Custom dynamic fields */}
                        <div className="border-t border-white/10 pt-4 space-y-3 font-sans">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Custom Fields</label>
                            <button
                              type="button"
                              onClick={() => {
                                const existingAbout = draftSettings.aboutMe || { myName: "", dadName: "", momName: "", age: "" };
                                const existingFields = existingAbout.customFields || [];
                                const newField = {
                                  id: Date.now().toString(),
                                  label: "Custom Field Name",
                                  value: "Custom Value"
                                };
                                setDraftSettings({
                                  ...draftSettings,
                                  aboutMe: {
                                    ...existingAbout,
                                    customFields: [...existingFields, newField]
                                  }
                                });
                              }}
                              className="text-[10px] font-mono text-[#ff2d7a] uppercase hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3 text-[#ff2d7a]" /> Add Field
                            </button>
                          </div>

                          {(draftSettings.aboutMe?.customFields || []).length === 0 ? (
                            <p className="text-xs text-neutral-500 italic font-mono">No custom fields yet. Click 'Add Field' to add some.</p>
                          ) : (
                            <div className="space-y-3">
                              {(draftSettings.aboutMe?.customFields || []).map((field, fieldIdx) => (
                                <div key={field.id || fieldIdx} className="flex gap-2 items-end bg-white/5 p-3 rounded-xl border border-white/5">
                                  <div className="flex-1 space-y-1.5">
                                    <label className="text-[9px] font-mono text-neutral-500 uppercase">Field Name</label>
                                    <input
                                      type="text"
                                      value={field.label}
                                      onChange={(e) => {
                                        const existingAbout = draftSettings.aboutMe || { myName: "", dadName: "", momName: "", age: "" };
                                        const updatedFields = (existingAbout.customFields || []).map(f => 
                                          f.id === field.id ? { ...f, label: e.target.value } : f
                                        );
                                        setDraftSettings({
                                          ...draftSettings,
                                          aboutMe: { ...existingAbout, customFields: updatedFields }
                                        });
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 text-xs border border-white/10 text-white"
                                      placeholder="FieldName (e.g. Profession)"
                                    />
                                  </div>
                                  <div className="flex-1 space-y-1.5">
                                    <label className="text-[9px] font-mono text-neutral-500 uppercase">Value</label>
                                    <input
                                      type="text"
                                      value={field.value}
                                      onChange={(e) => {
                                        const existingAbout = draftSettings.aboutMe || { myName: "", dadName: "", momName: "", age: "" };
                                        const updatedFields = (existingAbout.customFields || []).map(f => 
                                          f.id === field.id ? { ...f, value: e.target.value } : f
                                        );
                                        setDraftSettings({
                                          ...draftSettings,
                                          aboutMe: { ...existingAbout, customFields: updatedFields }
                                        });
                                      }}
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 text-xs border border-white/10 text-white"
                                      placeholder="Value"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const existingAbout = draftSettings.aboutMe || { myName: "", dadName: "", momName: "", age: "" };
                                      const filteredFields = (existingAbout.customFields || []).filter(f => f.id !== field.id);
                                      setDraftSettings({
                                        ...draftSettings,
                                        aboutMe: { ...existingAbout, customFields: filteredFields }
                                      });
                                    }}
                                    className="p-2 text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors self-end"
                                    title="Delete custom field"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
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
