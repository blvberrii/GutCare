import { motion } from "framer-motion";

interface TotoAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  mood?: "happy" | "thinking" | "excited";
  className?: string;
}

export function TotoAvatar({ size = "md", mood = "happy", className = "" }: TotoAvatarProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  return (
    <motion.div 
      className={`relative ${sizeClasses[size]} ${className}`}
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className={`w-full h-full rounded-full bg-primary flex items-center justify-center shadow-inner overflow-hidden relative border-4 border-white shadow-lg`}>
        {/* Whale Body - Simple SVG representation */}
        <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] text-white fill-current mt-2">
          <path d="M10,50 Q10,20 50,20 Q90,20 90,50 Q90,80 50,80 Q30,80 10,50 Z" />
          {/* Tail */}
          <path d="M85,50 L100,35 L100,65 Z" />
          {/* Eye */}
          <circle cx="35" cy="45" r="5" fill="#334155" />
          {/* Mouth */}
          {mood === "happy" && <path d="M35,60 Q50,70 65,60" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />}
          {mood === "thinking" && <circle cx="50" cy="65" r="3" fill="#334155" />}
          {mood === "excited" && <path d="M35,60 Q50,75 65,60" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />}
        </svg>
        
        {/* Water Spout */}
        <motion.div 
          className="absolute -top-2 left-1/2 -translate-x-1/2"
          animate={{ opacity: [0, 1, 0], y: [0, -10, -15], scale: [0.5, 1, 1.2] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-blue-200 rounded-full" />
        </motion.div>
      </div>
    </motion.div>
  );
}
