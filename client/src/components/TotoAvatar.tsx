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
      className={`relative ${sizeClass} ${className}`}
    >
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-md scale-90 -z-10" />
      <img
        src={totoLogo}
        alt="Toto the whale"
        className="w-full h-full object-contain drop-shadow-md"
        style={{ objectPosition: "40% 50%" }}
        draggable={false}
      />
    </motion.div>
  );
}
