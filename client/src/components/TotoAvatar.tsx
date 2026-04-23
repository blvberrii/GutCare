import { motion } from "framer-motion";
import totoLogo from "@/assets/toto-logo.png";

interface TotoAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  noAnimate?: boolean;
  /** @deprecated No longer used — kept for backwards compatibility */
  mood?: "happy" | "thinking" | "excited";
}

const SIZES = {
  sm:  "w-10 h-10",
  md:  "w-16 h-16",
  lg:  "w-24 h-24",
  xl:  "w-32 h-32",
};

export function TotoAvatar({ size = "md", className = "" }: TotoAvatarProps) {
  const sizeClass = SIZES[size];

  return (
    <motion.div
      className={`relative ${sizeClass} ${className} rounded-full bg-white overflow-hidden`}
    >
      <div className="absolute inset-0 flex items-center justify-center -z-10">
        <div className="w-2/3 h-2/3 rounded-full bg-primary/30 blur-xl" />
      </div>
      <img
        src={totoLogo}
        alt="Toto the whale"
        className="w-full h-full object-contain drop-shadow-md"
        style={{ objectPosition: "25% 75%" }}
        draggable={false}
      />
    </motion.div>
  );
}
