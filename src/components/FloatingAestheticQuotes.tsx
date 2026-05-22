import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface FloatingAestheticQuotesProps {
  quotes: string[];
}

export default function FloatingAestheticQuotes({ quotes }: FloatingAestheticQuotesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!quotes || quotes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }, 7000); // Shift every 7 seconds for a relaxed reading experience

    return () => clearInterval(interval);
  }, [quotes]);

  if (!quotes || quotes.length === 0) return null;

  const currentQuote = quotes[currentIndex];

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6 text-center pointer-events-none select-none z-10">
      {/* Cinematic subtle grid overlay behind quotes but on top of video */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/45 pointer-events-none" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 15, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -15, filter: "blur(10px)" }}
          transition={{ duration: 1.8, ease: [0.25, 1, 0.5, 1] }}
          className="max-w-2xl px-4 flex flex-col items-center gap-4"
        >
          {/* Poetic typewriter styled subtitle edit */}
          <p className="text-lg md:text-2xl lg:text-3xl font-serif italic text-white/95 leading-relaxed tracking-wide drop-shadow-[0_2px_15px_rgba(0,0,0,0.6)]">
            "{currentQuote}"
          </p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 5, ease: "linear" }}
            className="w-12 h-[1px] bg-white/20 origin-center"
          />

          <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-white/40">
            reel #{currentIndex + 1}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
