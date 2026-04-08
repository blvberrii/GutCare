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

export function TotoAvatar({ size = "md", className = "", noAnimate = false }: TotoAvatarProps) {
  const sizeClass = SIZES[size];

  const floatAnimation = noAnimate ? {} : {
    animate: { y: [0, -6, 0] },
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  };

  return (
    <motion.div
      {...floatAnimation}
      className={`relative ${sizeClass} ${className}`}
    >
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-md scale-90 -z-10" />
      <img
        src={totoLogo}
        alt="Toto the whale"
        className="w-full h-full object-contain drop-shadow-md"
        draggable={false}
      />
    </motion.div>
  );
}
