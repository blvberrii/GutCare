import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { TotoAvatar } from "@/components/TotoAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  role: "user" | "model";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Hi! I'm Toto. Ask me anything about gut health, low FODMAP foods, or your symptoms!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    try {
      // Mocking the chat endpoint call since I don't have the full conversation ID logic here
      // In production, this would use the /api/conversations/... endpoints
      
      // Temporary: Simulate network delay for effect
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: "model", 
          content: "I'm still learning, but try eating more fiber like oats or bananas if you're feeling sluggish! Remember to drink water too." 
        }]);
        setIsTyping(false);
      }, 1500);

    } catch (e) {
      console.error(e);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background pb-20"> {/* pb-20 for nav bar */}
      <div className="flex items-center justify-center p-4 border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <TotoAvatar size="sm" mood="happy" />
          <h1 className="font-display font-bold text-lg text-primary">Chat with Toto</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              msg.role === "user" 
                ? "bg-primary text-white rounded-tr-none" 
                : "bg-white border border-border rounded-tl-none"
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-border rounded-2xl rounded-tl-none p-4 flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-75" />
              <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce delay-150" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-border">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about food, symptoms..."
            className="rounded-full h-12 bg-muted/50 border-transparent focus:bg-white transition-all"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full h-12 w-12 shrink-0 bg-accent hover:bg-accent/90 shadow-md shadow-accent/20"
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
}
