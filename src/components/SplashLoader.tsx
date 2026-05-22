import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play } from "lucide-react";

interface SplashLoaderProps {
  onComplete: () => void;
  siteName: string;
  key?: string;
}

export default function SplashLoader({ onComplete, siteName }: SplashLoaderProps) {
  const [percent, setPercent] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setReady(true);
          return 100;
        }
        // Random incremental values for natural feel
        const step = Math.floor(Math.random() * 8) + 4;
        const nextValue = Math.min(prev + step, 100);

        return nextValue;
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fff0f3] select-none text-[#4a0e17] overflow-hidden"
    >
      {/* Background soft glowing orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-rose-300/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/4 left-1/3 w-[250px] h-[250px] bg-pink-300/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Floating dust/particles styling with subtle animation */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <div className="text-center z-10 px-6 max-w-sm flex flex-col items-center">
        {/* Cinematic site title */}
        <motion.h1
          initial={{ letterSpacing: "0.2em", opacity: 0 }}
          animate={{ letterSpacing: "0.3em", opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="text-2xl md:text-3xl font-display font-light uppercase tracking-[0.3em] mb-12 text-[#4a0e17] mt-8"
        >
          {siteName || "SILENT REELS"}
        </motion.h1>

        {/* Unlocking User Gesture Button */}
        <div className="h-16 flex items-center justify-center w-full">
          <AnimatePresence mode="wait">
            {!ready ? (
              <motion.div
                key="loading-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-48 flex flex-col items-center gap-2"
              >
                <div className="w-full bg-pink-200 h-[2px] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#ff2d7a] origin-left"
                    style={{ width: `${percent}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
                <div className="text-[10px] font-mono tracking-widest text-[#9a5460] uppercase">
                  {percent}%
                </div>
              </motion.div>
            ) : (
              <motion.button
                key="enter-btn"
                onClick={onComplete}
                whileHover={{ scale: 1.05, border: "1px solid rgba(255, 45, 122, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center gap-3 px-8 py-3.5 rounded-full border border-pink-200 bg-white hover:bg-pink-50/50 backdrop-blur-md cursor-pointer transition-colors shadow-sm"
                id="enter-exp-btn"
              >
                <Play className="w-3.5 h-3.5 text-[#ff2d7a] fill-[#ff2d7a]" />
                <span className="text-xs font-display tracking-[0.2em] uppercase font-medium text-[#4a0e17]">
                  dudu dekhte click
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <span className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#9a5460]/70">
          sound recommended • headphones on
        </span>
      </div>
    </motion.div>
  );
}
