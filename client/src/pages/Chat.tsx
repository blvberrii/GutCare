import { useState, useRef, useEffect } from "react";
import { useProfile } from "@/hooks/use-profile";
import { TotoAvatar } from "@/components/TotoAvatar";
import { Button } from "@/components/ui/button";
import { Send, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "model";
  content: string;
}

const QUICK_QUESTIONS = [
  "What foods should I avoid with IBS?",
  "Best probiotics for gut health?",
  "Is sourdough bread gut-friendly?",
  "What is a low-FODMAP diet?",
  "Help me understand my scan results",
  "Foods that reduce bloating",
];

const TOTO_FACTS = [
  "I've analyzed over 1.5M food products for gut health!",
  "I'm trained on research from Harvard, Johns Hopkins & the NIH.",
  "I keep my answers short — under 5 lines, always!",
  "Ask me about any ingredient and I'll break it down.",
];

export default function Chat() {
  const { data: profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const firstName = profile?.firstName || "there";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    if (!started) setStarted(true);

    setInput("");
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setIsTyping(true);

    try {
      const response = await apiRequest("POST", "/api/chat", { message: text });
      const data = await response.json();
      setMessages(prev => [...prev, { role: "model", content: data.message }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "model",
        content: "I'm having a bit of trouble right now. Try again in a moment! 🐳"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col bg-[#FDFCF8]" style={{ height: "calc(100dvh - 76px)" }}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-black/5 shadow-sm">
        <div className="flex items-center gap-4 p-4 max-w-lg mx-auto">
          <div className="relative">
            <TotoAvatar size="sm" mood={isTyping ? "thinking" : "happy"} />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="font-black text-base text-foreground leading-none">Toto</h1>
            <p className="text-[11px] text-emerald-500 font-bold mt-0.5">
              {isTyping ? "Typing..." : "Online · Gut Health AI"}
            </p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-1 bg-primary/5 px-3 py-1.5 rounded-full">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-wide">Gemini AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="max-w-lg mx-auto p-4 space-y-4 pb-2">
          {/* Welcome State */}
          {!started && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center pt-6 pb-4"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mb-6"
              >
                <TotoAvatar size="xl" mood="happy" />
              </motion.div>

              <h2 className="text-2xl font-black mb-2">
                Hey {firstName}! 👋
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-2">
                I'm Toto, your gut health assistant. I'm powered by evidence-based research from top medical institutions.
              </p>

              {/* Toto Facts */}
              <div className="w-full bg-primary/5 rounded-2xl p-4 mb-6 text-left border border-primary/10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">About Toto</p>
                <div className="space-y-2">
                  {TOTO_FACTS.map((fact, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <p className="text-xs text-muted-foreground font-medium">{fact}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest mb-4">
                Quick questions — or type anything below
              </p>
              <div className="w-full space-y-2">
                {QUICK_QUESTIONS.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => sendMessage(q)}
                    className="w-full flex items-center gap-3 p-4 bg-white rounded-2xl border border-black/5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all text-left group"
                    data-testid={`button-quick-${i}`}
                  >
                    <span className="text-sm font-medium text-foreground flex-1">{q}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/60 mt-4 font-medium">
                You can also type <span className="text-primary font-bold">any question</span> in the box below ↓
              </p>
            </motion.div>
          )}

          {/* Message Bubbles */}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "model" && (
                <div className="flex-shrink-0 mt-1">
                  <TotoAvatar size="sm" mood="happy" />
                </div>
              )}
              <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-white border border-black/5 rounded-tl-sm"
                }`}>
                  <div className="text-sm leading-relaxed">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="space-y-1 mt-1">{children}</ul>,
                        li: ({ children }) => (
                          <li className="flex items-start gap-2">
                            <span className={msg.role === "user" ? "text-white/70" : "text-primary"}>•</span>
                            <span>{children}</span>
                          </li>
                        ),
                        strong: ({ children }) => <strong className="font-black">{children}</strong>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <TotoAvatar size="sm" mood="thinking" />
                <div className="bg-white border border-black/5 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      className="w-2 h-2 bg-primary/40 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick follow-ups after first response */}
          {started && messages.length >= 2 && !isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 flex-wrap"
            >
              {["Tell me more", "Any alternatives?", "Is this safe for me?"].map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 bg-white border border-black/10 rounded-full text-xs font-bold text-muted-foreground hover:border-primary hover:text-primary transition-all shadow-sm"
                >
                  {q}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 bg-white border-t border-black/5 p-4 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-lg mx-auto">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything — gut health, foods, symptoms..."
            className="flex-1 h-12 px-5 bg-[#F4F4F0] rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 border-transparent placeholder:text-muted-foreground/50"
            data-testid="input-message"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isTyping}
            className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex-shrink-0 disabled:opacity-40"
            data-testid="button-send"
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </form>
        <p className="text-center text-[10px] text-muted-foreground/40 mt-2 font-medium">
          Evidence-based · Not medical advice · Consult your doctor
        </p>
      </div>
    </div>
  );
}
