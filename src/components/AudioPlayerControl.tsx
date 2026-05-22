import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Music, Disc } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AudioPlayerControlProps {
  audioUrl: string;
  audioTitle: string;
  audioArtist: string;
  unlocked: boolean;
  accentColor: string;
}

export default function AudioPlayerControl({
  audioUrl,
  audioTitle,
  audioArtist,
  unlocked,
  accentColor
}: AudioPlayerControlProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeFadeInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize and handle play/pause on entering
  useEffect(() => {
    if (unlocked && audioRef.current) {
      // Trigger play with smooth vol fade in
      setIsPlaying(true);
      audioRef.current.play().catch((err) => {
        console.log("Autoplay was prevented, waiting for user interaction:", err);
        setIsPlaying(false);
      });
    }
  }, [unlocked]);

  // Handle source changes smoothly
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying && unlocked) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [audioUrl]);

  // Handle smooth volume fade-in when playing starts
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying && !isMuted) {
      let targetVolume = volume;
      audioRef.current.volume = 0;
      
      if (volumeFadeInterval.current) clearInterval(volumeFadeInterval.current);
      
      let currentVol = 0;
      volumeFadeInterval.current = setInterval(() => {
        if (audioRef.current) {
          currentVol = Math.min(currentVol + 0.02, targetVolume);
          audioRef.current.volume = currentVol;
          if (currentVol >= targetVolume) {
            if (volumeFadeInterval.current) clearInterval(volumeFadeInterval.current);
          }
        }
      }, 50);
    } else {
      if (volumeFadeInterval.current) clearInterval(volumeFadeInterval.current);
      audioRef.current.volume = 0;
    }

    return () => {
      if (volumeFadeInterval.current) clearInterval(volumeFadeInterval.current);
    };
  }, [isPlaying, isMuted, volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Playback failed", err);
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
    }
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  return (
    <div className="flex items-center gap-4">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
        loop
      />

      {/* Floating glass player controls */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="glass-panel hover:border-pink-300/30 transition-colors p-2.5 px-4 rounded-full flex items-center gap-3 md:gap-4 max-w-xs md:max-w-md pointer-events-auto"
      >
        {/* Disc Vinyl art spin */}
        <div className="relative flex-shrink-0">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-8 h-8 rounded-full bg-pink-100 border border-pink-200/40 flex items-center justify-center relative shadow-sm"
          >
            <Disc className="w-5 h-5 text-[#4a0e17]" />
            <div className="absolute w-2 h-2 rounded-full bg-[#fff0f3] border border-pink-200/30" />
          </motion.div>
        </div>

        {/* Music Metadata */}
        <div className="flex flex-col min-w-0 pr-1 select-none">
          <span className="text-[11px] font-display font-semibold text-[#4a0e17] truncate leading-tight tracking-wider uppercase">
            {audioTitle}
          </span>
          <span className="text-[9px] font-mono text-[#9a5460] lowercase truncate tracking-wide">
            {audioArtist}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {/* Wave Visualizer bars */}
          <div className="flex items-end gap-1 px-1 h-3 flex-shrink-0 mr-1">
            {[1, 2, 3, 4, 5].map((bar) => (
              <motion.div
                key={bar}
                animate={
                  isPlaying
                    ? { height: [3, 12, 4, 14, 3][bar - 1] + (Math.random() * 2) }
                    : { height: 3 }
                }
                transition={{
                  duration: isPlaying ? 0.6 + bar * 0.12 : 0,
                  repeat: isPlaying ? Infinity : 0,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
                className="w-[2px] rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            ))}
          </div>

          {/* Action Trigger keys */}
          <button
            onClick={togglePlay}
            className="p-1.5 rounded-full hover:bg-pink-100 text-[#4a0e17] transition-all cursor-pointer"
            title={isPlaying ? "Pause music" : "Play music"}
            id="audio-play-toggle-btn"
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-[#4a0e17] text-[#4a0e17]" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-[#4a0e17] text-[#4a0e17]" />
            )}
          </button>

          <div className="relative flex items-center gap-2 group">
            <button
              onClick={toggleMute}
              className="p-1.5 rounded-full hover:bg-pink-100 text-[#4a0e17]/80 hover:text-[#4a0e17] transition-all cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
              id="audio-mute-toggle-btn"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-[#9a5460]" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#4a0e17]" />
              )}
            </button>

            {/* Slider on hover (Desktop friendly feature!) */}
            <div className="w-0 scale-x-0 group-hover:w-16 group-hover:scale-x-100 transition-all duration-300 origin-left hidden md:flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-[2px] bg-pink-200/60 accent-current rounded-full cursor-pointer outline-none font-mono"
                style={{ color: accentColor }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
