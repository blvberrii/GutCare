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
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full bg-primary/35 blur-2xl" />
      <img
        src={totoLogo}
        alt="Toto the whale"
        className="relative w-full h-full object-contain"
        style={{ objectPosition: "33% 68%" }}
        draggable={false}
      />
    </motion.div>
  );
}
