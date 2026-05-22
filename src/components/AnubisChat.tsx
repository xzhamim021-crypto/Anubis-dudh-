import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, RefreshCw } from "lucide-react";

interface AISettings {
  anubisAvatarUrl: string;
  hamimPicUrl: string;
}

interface AnubisChatProps {
  aiSettings?: AISettings;
  accentColor: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "anubis";
  text: string;
  imageUrl?: string;
  timestamp: Date;
}

const PRESET_SUGGESTIONS = [
  {
    q: "tor nam ki?",
    a: "ami anubis gemini boksoda"
  },
  {
    q: "Tor baper nam ki",
    a: "anowar gpt"
  },
  {
    q: "Tui ki koros",
    a: "nijer dudh tipi"
  },
  {
    q: "Ami keda?",
    a: "tumi amar abba jaan ilyily😛😛🤭🤭🤭😛"
  },
  {
    q: "Hamim tor ki lage",
    a: "hamim amar bapppp ashol bap or dhon khai ami i him so muchh mwahh eije amar baper pic",
    type: "hamim"
  },
  {
    q: "Tor ekta pic de",
    a: "eije bokasoda ami",
    type: "anubis"
  },
  {
    q: "ami anubis nijer dudh tippa khai",
    a: "haa bokasoda, ami asholei nijer dudh tippa khai! tui o khabi reply tipi tipi? 😛"
  }
];

export default function AnubisChat({ aiSettings, accentColor }: AnubisChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  // Default images in case none provided
  const anubisPic = aiSettings?.anubisAvatarUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80";
  const hamimPic = aiSettings?.hamimPicUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: "welcome-1",
        sender: "anubis",
        text: "Helelo! Ami Anubis Gemini bokasoda. Ki jante chao? Nicher suggestion gulo try koro ba type koro boi! 😛🤭",
        timestamp: new Date()
      }
    ]);
  }, []);

  // Auto-scroll logic
  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle triggered answers
  const triggerAnubisReply = (userMsg: string) => {
    setIsTyping(true);

    setTimeout(() => {
      // Find matching reply
      const normalizedMsg = userMsg.trim().toLowerCase();
      let matched = PRESET_SUGGESTIONS.find(
        (preset) => preset.q.toLowerCase() === normalizedMsg
      );

      // Handle custom or fuzzy match fallback
      let replyText = "";
      let replyImage = undefined;

      if (matched) {
        replyText = matched.a;
        if (matched.type === "hamim") {
          replyImage = hamimPic;
        } else if (matched.type === "anubis") {
          replyImage = anubisPic;
        }
      } else {
        // Fuzzy keywords
        if (normalizedMsg.includes("dudh") || normalizedMsg.includes("tip")) {
          replyText = "haa bokasoda, ami asholei nijer dudh tippa khai! direct bolba niki? 😛";
        } else if (normalizedMsg.includes("baap") || normalizedMsg.includes("bap")) {
          replyText = "Amar baper nam anowar gpt! 🤖";
        } else if (normalizedMsg.includes("hamim")) {
          replyText = "hamim amar bapppp ashol bap! or photo dekhbi? click 'Hamim tor ki lage' pill! 😛";
        } else if (normalizedMsg.includes("nam")) {
          replyText = "Ami Anubis Gemini bokasoda! Key bhabsos amake?";
        } else {
          replyText = "Bokasoda prompt thikmoto lekho ba nichey dewa suggestions reply choose koro! 😛🤭";
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          sender: "anubis",
          text: replyText,
          imageUrl: replyImage,
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
    }, 850);
  };

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: textToSend,
        timestamp: new Date()
      }
    ]);

    setInputText("");
    triggerAnubisReply(textToSend);
  };

  const handlePresetClick = (qText: string) => {
    handleSend(qText);
  };

  const resetChat = () => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        sender: "anubis",
        text: "Helelo! Ami Anubis Gemini bokasoda again. Let's start fresh! Ask me something! 😛",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="glass-panel rounded-[2rem] p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden backdrop-blur-xl border border-white/10 shadow-3xl h-[600px]" id="anubis-gemini-chat-container">
      {/* Header Info Banner */}
      <div className="flex items-center justify-between border-b border-pink-100/50 pb-4">
        <div className="flex items-center gap-3">
          {/* Customizable Round Anubis representation */}
          <div className="relative w-11 h-11 rounded-full border border-pink-200/30 overflow-hidden flex-shrink-0">
            <img 
              src={anubisPic} 
              alt="Anubis Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Online Pulse status pill */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border border-white rounded-full animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-medium text-[#4a0e17] tracking-wide text-sm">Anubis Gemini</span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9a5460]">bokasoda brain enabled</span>
          </div>
        </div>

        <button 
          onClick={resetChat} 
          className="p-2 rounded-xl bg-pink-100/60 hover:bg-pink-200/50 border border-pink-200/40 text-[#4a0e17] transition-all cursor-pointer"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestion pills container */}
      <div className="flex flex-wrap gap-2 py-1 max-h-[140px] overflow-y-auto custom-scrollbar">
        {PRESET_SUGGESTIONS.map((preset, index) => (
          <button
            key={index}
            onClick={() => handlePresetClick(preset.q)}
            className="px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-pink-100 hover:border-pink-300/40 border border-pink-100/50 text-[11px] font-sans text-[#4a0e17]/85 hover:text-[#4a0e17] transition-all text-left cursor-pointer active:scale-95 duration-200 shadow-sm"
          >
            {preset.q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div ref={chatBodyRef} className="flex-1 overflow-y-auto px-1 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-pink-200/30">
                  {isUser ? (
                    <div className="w-full h-full bg-pink-100 flex items-center justify-center text-[#4a0e17]">
                      <User className="w-4 h-4" />
                    </div>
                  ) : (
                    <img 
                      src={anubisPic} 
                      alt="Anubis Avatar" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                {/* Bubble content */}
                <div className="space-y-2">
                  <div className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
                    isUser 
                      ? "bg-[#ff2d7a] text-white rounded-tr-none border border-pink-600/10 shadow-sm" 
                      : "bg-white/90 text-[#4a0e17] rounded-tl-none border border-pink-100/60 shadow-sm"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  
                  {/* Rich media attachments */}
                  {msg.imageUrl && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="rounded-2xl overflow-hidden max-w-[200px] border border-white/10 bg-black/40 p-1 shadow-md"
                    >
                      <img 
                        src={msg.imageUrl} 
                        alt="AI Attachment" 
                        className="w-full h-auto aspect-square object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Typing indicator simulation */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3 max-w-[80%]"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-pink-200/30">
                <img 
                  src={anubisPic} 
                  alt="Anubis Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3 rounded-2xl bg-white/80 border border-pink-100/50 rounded-tl-none flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input controls form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="flex gap-2 relative mt-1"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Anubis Gemini boxasoda..."
          className="flex-1 py-3 px-4 rounded-xl text-xs glass-input focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 rounded-xl bg-[#ff2d7a] hover:bg-[#e02469] disabled:opacity-40 transition-all font-mono font-medium tracking-wide flex items-center justify-center cursor-pointer active:scale-95 duration-200 text-white flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
