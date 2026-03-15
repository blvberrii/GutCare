import { motion } from "framer-motion";

interface TotoAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  mood?: "happy" | "thinking" | "excited";
  className?: string;
  noAnimate?: boolean;
}

const SIZES = {
  sm:  { container: "w-10 h-10",   svg: "w-9 h-9" },
  md:  { container: "w-16 h-16",   svg: "w-14 h-14" },
  lg:  { container: "w-24 h-24",   svg: "w-20 h-20" },
  xl:  { container: "w-32 h-32",   svg: "w-28 h-28" },
};

export function TotoAvatar({ size = "md", mood = "happy", className = "", noAnimate = false }: TotoAvatarProps) {
  const { container, svg } = SIZES[size];

  const floatAnimation = noAnimate ? {} : {
    animate: { y: [0, -6, 0] },
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  };

  return (
    <motion.div
      {...floatAnimation}
      className={`relative ${container} ${className}`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-md scale-90 -z-10" />

      <svg
        viewBox="0 0 120 120"
        className={svg}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        {/* Shadow/reflection underneath */}
        <ellipse cx="60" cy="112" rx="28" ry="6" fill="#00897B" opacity="0.15" />

        {/* Tail fin */}
        <path
          d="M88 68 C95 58 105 54 108 46 C110 40 104 36 98 40 C94 42 90 50 88 60Z"
          fill="#00897B"
        />
        <path
          d="M88 72 C95 82 105 86 108 94 C110 100 104 104 98 100 C94 98 90 88 88 76Z"
          fill="#00897B"
        />

        {/* Body - main whale shape, Duolingo-roundness */}
        <ellipse cx="54" cy="70" rx="44" ry="36" fill="#00BFA5" />

        {/* Belly highlight */}
        <ellipse cx="46" cy="78" rx="28" ry="20" fill="#E0F2F1" />

        {/* Head bump */}
        <circle cx="32" cy="52" r="30" fill="#00BFA5" />

        {/* Face area */}
        <circle cx="30" cy="50" r="26" fill="#00C9B1" />

        {/* Cheek blush - left */}
        <ellipse cx="18" cy="62" rx="9" ry="6" fill="#FF8A65" opacity="0.4" />

        {/* Eye white */}
        <circle cx="32" cy="50" r="9" fill="white" />
        {/* Eye iris */}
        <circle cx="33" cy="50" r="6" fill="#263238" />
        {/* Eye shine */}
        <circle cx="35" cy="47" r="2.5" fill="white" />
        <circle cx="30" cy="52" r="1" fill="white" opacity="0.6" />

        {/* Mouth expressions */}
        {mood === "happy" && (
          <>
            <path
              d="M20 65 Q30 75 40 65"
              stroke="#263238"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
        {mood === "thinking" && (
          <>
            <path
              d="M22 67 Q30 67 38 67"
              stroke="#263238"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Thought dots */}
            <circle cx="46" cy="36" r="3" fill="#00BFA5" opacity="0.6" />
            <circle cx="52" cy="28" r="4" fill="#00BFA5" opacity="0.4" />
            <circle cx="60" cy="18" r="5" fill="#00BFA5" opacity="0.2" />
          </>
        )}
        {mood === "excited" && (
          <>
            <path
              d="M18 63 Q30 76 42 63"
              stroke="#263238"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Stars */}
            <text x="60" y="44" fontSize="12" fill="#FFD600">★</text>
            <text x="72" y="56" fontSize="8" fill="#FFD600">✦</text>
          </>
        )}

        {/* Dorsal fin */}
        <path
          d="M58 34 C56 22 64 14 70 20 C76 26 72 34 68 36Z"
          fill="#009688"
        />

        {/* Water spout */}
        <motion.g
          animate={{ opacity: [0, 1, 0], y: [0, -8, -14] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        >
          <path
            d="M30 24 C28 18 32 12 30 8"
            stroke="#80DEEA"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M36 22 C36 16 40 12 38 8"
            stroke="#80DEEA"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M24 26 C22 20 24 16 22 12"
            stroke="#B2EBF2"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </motion.g>

        {/* Pectoral fin */}
        <path
          d="M44 82 C36 90 24 92 20 88 C16 84 22 78 30 78 C36 78 40 80 44 82Z"
          fill="#009688"
          opacity="0.8"
        />
      </svg>
    </motion.div>
  );
}
