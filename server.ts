import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { SiteSettings } from "./src/types";
import multer from "multer";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client if variables exist
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Seed settings
const SETTINGS_PATH = path.join(process.cwd(), "settings.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const sanitizedName = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, sanitizedName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

const defaultSettings: SiteSettings = {
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
    age: "21"
  },
  aiSettings: {
    anubisAvatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    hamimPicUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  }
};

// Check folders and files on startup
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(SETTINGS_PATH)) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Make sure body limit is generous enough for media upload (500MB)
  app.use(express.json({ limit: "500mb" }));
  app.use(express.urlencoded({ limit: "500mb", extended: true }));

  // Serve static uploads
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Helper to load settings from Supabase or fallback to local file
  const loadSettingsAndAdminCode = async (): Promise<{ settings: SiteSettings; adminPasscode: string }> => {
    let currentSettings: SiteSettings = { ...defaultSettings };
    
    // 1. Try local settings.json first as a stable default/cache
    try {
      if (fs.existsSync(SETTINGS_PATH)) {
        const fileContent = fs.readFileSync(SETTINGS_PATH, "utf-8");
        currentSettings = { ...currentSettings, ...JSON.parse(fileContent) };
      }
    } catch (err) {
      console.warn("Local settings read warning, using default:", err);
    }

    // 2. Query Supabase if configured
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("portfolio_settings")
          .select("data")
          .eq("id", 1)
          .single();

        if (!error && data?.data) {
          currentSettings = { ...currentSettings, ...data.data };
          
          // Sync changes back to local fallback files just in case
          try {
            fs.writeFileSync(SETTINGS_PATH, JSON.stringify(currentSettings, null, 2), "utf-8");
          } catch (_) {}
        } else if (error) {
          // If row not found but relation exists, seed Supabase with our local settings!
          if (error.code === "PGRST116") {
            try {
              await supabase.from("portfolio_settings").upsert({ id: 1, data: currentSettings });
            } catch (seedErr) {
              console.warn("Could not seed Supabase settings table:", seedErr);
            }
          } else {
            console.warn("Supabase load query error (maybe table not created yet):", error.message);
          }
        }
      } catch (err: any) {
        console.warn("Supabase connection exception:", err.message);
      }
    }

    return {
      settings: currentSettings,
      adminPasscode: currentSettings.adminPasscode || "1111"
    };
  };

  // Helper to save settings
  const saveSettings = async (newSettings: Partial<SiteSettings>): Promise<SiteSettings> => {
    const { settings: current } = await loadSettingsAndAdminCode();
    
    const merged: SiteSettings = {
      ...current,
      ...newSettings,
      adminPasscode: newSettings.adminPasscode || current.adminPasscode || "1111"
    };

    // Save locally
    try {
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2), "utf-8");
    } catch (err) {
      console.error("Local settings write error:", err);
    }

    // Save to Supabase
    if (supabase) {
      try {
        const { error } = await supabase
          .from("portfolio_settings")
          .upsert({ id: 1, data: merged });
        if (error) {
          console.error("Supabase upsert settings error:", error.message);
        }
      } catch (err: any) {
        console.error("Supabase upsert exception:", err.message);
      }
    }

    return merged;
  };

  // --- API Routes ---

  // Get current configurations
  app.get("/api/settings", async (req, res) => {
    try {
      const { settings } = await loadSettingsAndAdminCode();
      const safeSettings = { ...settings };
      delete safeSettings.adminPasscode; // Remove lock code before sending to client
      res.json({ success: true, settings: safeSettings });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Verify Admin Code and pull full settings (including code)
  app.post("/api/settings/auth", async (req, res) => {
    const { passcode } = req.body;
    try {
      const { settings, adminPasscode } = await loadSettingsAndAdminCode();
      if (adminPasscode === passcode) {
        res.json({ success: true, settings });
      } else {
        res.status(401).json({ success: false, error: "Incorrect passcode" });
      }
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Save new settings
  app.post("/api/settings", async (req, res) => {
    const { settings, passcode } = req.body;
    try {
      // Authenticate save request
      const { adminPasscode } = await loadSettingsAndAdminCode();
      if (adminPasscode !== passcode) {
        return res.status(401).json({ success: false, error: "Unauthorized operation" });
      }

      const updatedSettings = await saveSettings(settings);
      res.json({ success: true, settings: updatedSettings });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Native File Upload Handler (Support Multipart Form Data or Base64 fallback)
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      const passcode = (req.headers["x-admin-passcode"] as string) || req.body.passcode;

      // Validate credentials
      const { adminPasscode } = await loadSettingsAndAdminCode();
      if (adminPasscode !== passcode) {
        // Clean up multer file if uploaded unauthorized
        if (req.file) {
          try { fs.unlinkSync(req.file.path); } catch (err) {}
        }
        return res.status(401).json({ success: false, error: "Unauthorized upload" });
      }

      // Helper to process uploaded file path/buffer to Supabase Storage or fallback to local
      const processUpload = async (filePath: string, originalName: string, mimeType: string, relativeLocalPath: string): Promise<string> => {
        if (supabase) {
          try {
            const fileBuffer = fs.readFileSync(filePath);
            const fileName = path.basename(filePath);
            
            // Try uploading to 'portfolio_media' bucket (will fail gracefully if not created)
            const { error } = await supabase.storage
              .from("portfolio_media")
              .upload(fileName, fileBuffer, {
                contentType: mimeType,
                upsert: true
              });
              
            if (!error) {
              const { data: urlData } = supabase.storage
                .from("portfolio_media")
                .getPublicUrl(fileName);
                
              if (urlData?.publicUrl) {
                // Delete local file to save storage space
                try { fs.unlinkSync(filePath); } catch (_) {}
                return urlData.publicUrl;
              }
            } else {
              console.warn("Supabase Storage error:", error.message);
            }
          } catch (err: any) {
            console.warn("Supabase Storage exception:", err.message);
          }
        }
        return relativeLocalPath; // Use local path fallback
      };

      // A. Multipart file upload case (Standard form-data)
      if (req.file) {
        const localPath = `/uploads/${req.file.filename}`;
        const finalUrl = await processUpload(req.file.path, req.file.originalname, req.file.mimetype, localPath);
        return res.json({ success: true, url: finalUrl });
      }

      // B. Base64 fallback case
      const { fileData, fileName } = req.body;
      if (!fileData || !fileName) {
        return res.status(400).json({ success: false, error: "Empty media content received" });
      }

      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ success: false, error: "Format structure incorrect. Must be Base64 data URI." });
      }

      const fileBuffer = Buffer.from(matches[2], "base64");
      const sanitizedName = `${Date.now()}_${path.basename(fileName).replace(/\s+/g, "_")}`;
      const destinationPath = path.join(UPLOADS_DIR, sanitizedName);
      const mimeType = matches[1];

      fs.writeFileSync(destinationPath, fileBuffer);
      const localPath = `/uploads/${sanitizedName}`;
      const finalUrl = await processUpload(destinationPath, fileName, mimeType, localPath);

      res.json({ success: true, url: finalUrl });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // --- Serve Assets and Pages ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cinematic Portfolio is live on http://localhost:${PORT}`);
  });
}

startServer();
