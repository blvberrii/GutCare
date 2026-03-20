import { useScan, useUpdateScan } from "@/hooks/use-scans";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, CheckCircle2, AlertCircle, Bookmark, BookmarkCheck,
  GraduationCap, ChevronDown, ExternalLink, Heart, Leaf, Zap, Droplets,
  AlertTriangle, Flame, Bean, Apple, Shield, Clock, Package, Star, ShoppingBag, Info, Loader2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const GRADE_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; emoji: string }> = {
  A: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Excellent", emoji: "🌟" },
  B: { color: "text-lime-600",    bg: "bg-lime-50",    border: "border-lime-200",    label: "Good",      emoji: "✅" },
  C: { color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",   label: "Moderate",  emoji: "⚠️" },
  D: { color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-200",  label: "Poor",      emoji: "⬇️" },
  F: { color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200",     label: "Avoid",     emoji: "🚫" },
};

const ICON_MAP: Record<string, { icon: any; color: string; bg: string }> = {
  calories:  { icon: Flame,         color: "text-orange-500", bg: "bg-orange-50" },
  protein:   { icon: Zap,           color: "text-blue-500",   bg: "bg-blue-50" },
  fiber:     { icon: Leaf,          color: "text-green-500",  bg: "bg-green-50" },
  sugar:     { icon: Apple,         color: "text-pink-500",   bg: "bg-pink-50" },
  sodium:    { icon: Droplets,      color: "text-cyan-500",   bg: "bg-cyan-50" },
  additives: { icon: AlertTriangle, color: "text-red-500",    bg: "bg-red-50" },
  vitamins:  { icon: Heart,         color: "text-purple-500", bg: "bg-purple-50" },
  fat:       { icon: Package,       color: "text-yellow-500", bg: "bg-yellow-50" },
  probiotics:{ icon: Shield,        color: "text-teal-500",   bg: "bg-teal-50" },
  default:   { icon: Bean,          color: "text-gray-500",   bg: "bg-gray-50" },
};

function getIcon(type: string) {
  const cfg = ICON_MAP[type?.toLowerCase()] || ICON_MAP.default;
  const IconComponent = cfg.icon;
  return { IconComponent, color: cfg.color, bg: cfg.bg };
}

function ScoreCircle({ score, grade }: { score: number; grade: string }) {
  const cfg = GRADE_CONFIG[grade] || GRADE_CONFIG.C;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const pct = (score / 100) * circ;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f0f0f0" strokeWidth="10" />
        <motion.circle
          cx="70" cy="70" r={r} fill="none"
          stroke={grade === 'A' ? '#10b981' : grade === 'B' ? '#84cc16' : grade === 'C' ? '#f59e0b' : grade === 'D' ? '#f97316' : '#ef4444'}
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - pct }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-4xl font-black leading-none ${cfg.color}`}>{grade}</span>
        <span className="text-xs font-black text-muted-foreground mt-1">{score}/100</span>
      </div>
    </div>
  );
}

function ExpandableItem({
  item,
  isPositive,
  isLast,
  onSeeAdditives,
}: {
  item: any;
  isPositive: boolean;
  isLast: boolean;
  onSeeAdditives?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { IconComponent, color, bg } = getIcon(item.type);
  const dotColor = isPositive ? "bg-emerald-500" : "bg-red-500";
  const hasAmount = item.amount && String(item.amount).trim() !== "";

  return (
    <div className={`bg-white overflow-hidden ${!isLast ? "border-b border-black/5" : ""}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left"
        data-testid={`button-expand-${item.type}`}
      >
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <IconComponent className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasAmount && (
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${isPositive ? "text-emerald-700 bg-emerald-50" : "text-red-700 bg-red-50"}`}>
              {item.amount}
            </span>
          )}
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              <div className="bg-[#FDFCF8] rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed">
                {item.detail || item.description}
              </div>
              {item.type === "additives" && onSeeAdditives && (
                <button
                  onClick={(e) => { e.stopPropagation(); onSeeAdditives(); }}
                  className="mt-3 flex items-center gap-1.5 text-sm font-black text-primary hover:text-primary/80 transition-colors"
                >
                  <Info className="w-4 h-4" />
                  See full additives list →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const RISK_CFG: Record<string, { color: string; bg: string; border: string; dot: string; label: string }> = {
  High:   { color: "text-red-700",    bg: "bg-red-100",    border: "border-red-200",    dot: "bg-red-500",    label: "Dangerous" },
  Medium: { color: "text-amber-700",  bg: "bg-amber-100",  border: "border-amber-200",  dot: "bg-amber-500",  label: "Risky" },
  Low:    { color: "text-emerald-700",bg: "bg-emerald-100",border: "border-emerald-200",dot: "bg-emerald-500",label: "Safe" },
};
const DEFAULT_RISK = { color: "text-gray-700", bg: "bg-gray-100", border: "border-gray-200", dot: "bg-gray-400", label: "Unknown" };

function AdditiveCard({ additive, index }: { additive: any; index: number }) {
  const [open, setOpen] = useState(false);
  const riskCfg = RISK_CFG[additive.risk as string] || DEFAULT_RISK;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`bg-white rounded-2xl border ${riskCfg.border} overflow-hidden`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left"
        data-testid={`button-additive-${index}`}
      >
        <div className={`w-2 h-8 rounded-full ${riskCfg.dot} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <span className="font-black text-sm">{additive.label || additive.name}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{additive.name}</p>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-full ${riskCfg.bg} ${riskCfg.color}`}>
          {riskCfg.label}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="h-px bg-black/5" />
              <p className="text-xs leading-relaxed text-muted-foreground">{additive.description}</p>
              {additive.category && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Category:</span>
                  <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full">{additive.category}</span>
                </div>
              )}
              {additive.gutEffect && (
                <div className="bg-red-50 rounded-xl p-3 text-[11px] text-red-700 font-medium">
                  <span className="font-black">Gut Impact: </span>{additive.gutEffect}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function AdditivesSheet({ additives, onClose }: { additives: any[]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="w-full bg-[#FDFCF8] rounded-t-[2.5rem] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-black text-base">Additives Breakdown</h3>
              <p className="text-[11px] text-muted-foreground">{additives.length} additive{additives.length !== 1 ? "s" : ""} detected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-3 px-6 pt-4">
          {Object.entries(RISK_CFG).map(([, cfg]) => (
            <div key={cfg.label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className="text-[10px] font-black text-muted-foreground">{cfg.label}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {additives.map((add, i) => (
            <AdditiveCard key={i} additive={add} index={i} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ResultsPage() {
  const [, params] = useRoute("/scan/:id");
  const scanId = parseInt(params?.id || "0");
  const { data: scan, isLoading, error } = useScan(scanId);
  const updateScan = useUpdateScan();
  const { toast } = useToast();

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");
  const [showAdditivesSheet, setShowAdditivesSheet] = useState(false);
  const [showCitationsSection, setShowCitationsSection] = useState(false);
  const [lazyImageUrl, setLazyImageUrl] = useState<string | null>(null);
  const imageGenStarted = useRef(false);

  useEffect(() => {
    if (!scan || scan.imageUrl || imageGenStarted.current) return;
    imageGenStarted.current = true;
    apiRequest("POST", "/api/generate-product-image", { productName: scan.productName })
      .then(res => res.json())
      .then(({ imageUrl }: { imageUrl: string | null }) => {
        if (imageUrl) {
          setLazyImageUrl(imageUrl);
          updateScan.mutateAsync({ id: scanId, imageUrl }).catch(() => {});
        }
      })
      .catch(() => {});
  }, [scan?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">Loading results...</p>
      </div>
    );
  }
  if (error || !scan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Product not found</p>
      </div>
    );
  }

  const grade = scan.grade || "C";
  const gradeCfg = GRADE_CONFIG[grade] || GRADE_CONFIG.C;
  const positives = (scan.positives as any[]) || [];
  const negatives = (scan.negatives as any[]) || [];
  const additives = (scan.additivesDetails as any[]) || [];
  const citations = (scan.citations as any[]) || [];
  const alternatives = (scan.alternatives as any[]) || [];
  const isGood = (scan.score || 0) >= 70;

  const handleFavorite = async () => {
    try {
      await updateScan.mutateAsync({ id: scanId, isFavorite: !scan.isFavorite });
      toast({ title: scan.isFavorite ? "Removed from favorites" : "Added to favorites! 🔖" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const handleRate = async (rating: string) => {
    try {
      await updateScan.mutateAsync({ id: scanId, userRating: rating });
      toast({ title: `Rated ${rating}!` });
    } catch {
      toast({ title: "Failed to save rating", variant: "destructive" });
    }
  };

  const handleCommentSubmit = async () => {
    try {
      await updateScan.mutateAsync({ id: scanId, userComment: comment });
      setShowCommentInput(false);
      toast({ title: "Note saved! ✍️" });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-12 font-sans">
      {/* Additives Sheet */}
      <AnimatePresence>
        {showAdditivesSheet && additives.length > 0 && (
          <AdditivesSheet additives={additives} onClose={() => setShowAdditivesSheet(false)} />
        )}
      </AnimatePresence>

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 flex items-center px-4 py-3 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-black/5">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" data-testid="button-back">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="flex-1 text-center font-bold text-base truncate px-4">{scan.productName}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-10 h-10"
          onClick={handleFavorite}
          data-testid="button-favorite"
        >
          {scan.isFavorite
            ? <BookmarkCheck className="w-6 h-6 text-primary fill-primary" />
            : <Bookmark className="w-6 h-6 text-muted-foreground" />}
        </Button>
      </header>

      <main className="max-w-lg mx-auto">
        {/* Product Hero */}
        <section className="relative px-6 pt-8 pb-0 flex flex-col items-center">
          <div className={`absolute inset-0 ${gradeCfg.bg} opacity-60 rounded-b-[4rem]`} />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative z-10 w-44 h-44 rounded-[2.5rem] overflow-hidden shadow-2xl mb-6 bg-white ring-4 ring-white"
          >
            {(lazyImageUrl || scan.imageUrl) ? (
              <img src={lazyImageUrl || scan.imageUrl || ""} alt={scan.productName || ""} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex flex-col items-center justify-center gap-2 ${gradeCfg.bg}`}>
                <div className="animate-pulse flex flex-col items-center gap-3">
                  <ShoppingBag className={`w-14 h-14 ${gradeCfg.color} opacity-20`} />
                  <div className="w-16 h-1.5 bg-black/10 rounded-full" />
                </div>
              </div>
            )}
          </motion.div>

          <div className="relative z-10 text-center mb-6">
            <h2 className="text-2xl font-black mb-1">{scan.productName}</h2>
            <span className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${gradeCfg.bg} ${gradeCfg.color} ${gradeCfg.border} border`}>
              {gradeCfg.emoji} {gradeCfg.label} for your gut
            </span>
          </div>

          <div className="relative z-10 mb-8">
            <ScoreCircle score={scan.score || 0} grade={grade} />
          </div>
        </section>

        {/* Main Content Card */}
        <div className="bg-white rounded-t-[3rem] pt-10 px-5 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.08)] -mt-2">
          <div className="space-y-8">

            {/* Negatives Section */}
            {negatives.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <h3 className="font-black text-base">Negatives</h3>
                  </div>
                  {scan.portionSize ? (
                    <span className="text-xs font-black text-muted-foreground bg-black/5 px-2.5 py-1 rounded-full">
                      Per portion ({scan.portionSize})
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">{negatives.length} found</span>
                  )}
                </div>
                <div className="rounded-2xl border border-black/8 overflow-hidden shadow-sm">
                  {negatives.map((neg, i) => (
                    <ExpandableItem
                      key={i}
                      item={neg}
                      isPositive={false}
                      isLast={i === negatives.length - 1}
                      onSeeAdditives={neg.type === "additives" && additives.length > 0 ? () => setShowAdditivesSheet(true) : undefined}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Positives Section */}
            {positives.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h3 className="font-black text-base">Positives</h3>
                  </div>
                  {scan.portionSize ? (
                    <span className="text-xs font-black text-muted-foreground bg-black/5 px-2.5 py-1 rounded-full">
                      Per portion ({scan.portionSize})
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">{positives.length} found</span>
                  )}
                </div>
                <div className="rounded-2xl border border-black/8 overflow-hidden shadow-sm">
                  {positives.map((pos, i) => (
                    <ExpandableItem key={i} item={pos} isPositive={true} isLast={i === positives.length - 1} />
                  ))}
                </div>
              </section>
            )}

            {/* Additives Quick-Access */}
            {additives.length > 0 && (
              <section>
                <button
                  onClick={() => setShowAdditivesSheet(true)}
                  className="w-full bg-red-50/70 rounded-[2rem] p-5 border border-red-100 flex items-center gap-4 hover:bg-red-50 transition-colors"
                  data-testid="button-additives-toggle"
                >
                  <div className="w-11 h-11 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-black text-sm">Additives & Risks</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{additives.length} additives detected — tap to see breakdown</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-red-600 bg-red-100 px-3 py-1 rounded-full">{additives.length}</span>
                    <ChevronDown className="w-4 h-4 text-red-400 -rotate-90" />
                  </div>
                </button>
              </section>
            )}

            {/* Alternatives */}
            {!isGood && alternatives.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 px-1">
                  <Star className="w-5 h-5 text-amber-500" />
                  <h3 className="font-black text-lg">Better Choices</h3>
                  <span className="ml-auto text-xs text-muted-foreground font-bold">80+ score</span>
                </div>
                <div className="space-y-3">
                  {alternatives.slice(0, 3).map((alt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-2xl border border-black/5 p-4 flex items-center gap-4 shadow-sm hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted shadow-sm">
                        {alt.image ? (
                          <img src={alt.image} alt={alt.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm truncate">{alt.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1.5 flex-1 bg-black/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${alt.score}%` }}
                              className="h-full bg-emerald-500 rounded-full"
                            />
                          </div>
                          <span className="text-[11px] font-black text-emerald-600">{alt.score}/100</span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                        <span className="text-white font-black text-xs">A</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Scientific Citations */}
            {citations.length > 0 && (
              <section className="bg-[#F0F9FF] rounded-[2rem] border border-sky-100 overflow-hidden">
                <button
                  onClick={() => setShowCitationsSection(!showCitationsSection)}
                  className="w-full flex items-center justify-between p-5"
                  data-testid="button-citations-toggle"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 rounded-2xl flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-sky-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-black text-base">Scientific Sources</h3>
                      <p className="text-[11px] text-muted-foreground">{citations.length} peer-reviewed references</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-sky-500 transition-transform ${showCitationsSection ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showCitationsSection && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4">
                        {citations.map((cite, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="w-1 bg-sky-300 rounded-full flex-shrink-0" />
                            <div>
                              <p className="text-[11px] leading-relaxed text-foreground italic mb-1.5">"{cite.text}"</p>
                              <a
                                href={cite.url || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-black text-sky-600 uppercase tracking-wider hover:underline"
                              >
                                {cite.source} <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                        <p className="text-[10px] text-muted-foreground/60 font-medium pt-2 border-t border-sky-100">
                          All citations are from validated, peer-reviewed scientific sources only.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )}

            {/* Personal Rating */}
            <section className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10">
              <h3 className="font-black text-lg mb-1 text-center">Your Personal Take</h3>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-6 text-center">
                How did this make you feel?
              </p>

              <div className="flex justify-between items-center mb-6 px-2">
                {['A', 'B', 'C', 'D', 'F'].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRate(r)}
                    data-testid={`button-rate-${r}`}
                    className={`w-12 h-12 rounded-2xl font-black text-lg transition-all duration-200 ${
                      scan.userRating === r
                        ? "bg-primary text-white shadow-xl shadow-primary/30 scale-115"
                        : "bg-white text-primary border border-primary/20 hover:bg-primary/10 hover:scale-105"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {!showCommentInput ? (
                <button
                  onClick={() => { setShowCommentInput(true); setComment(scan.userComment || ""); }}
                  className="w-full py-4 bg-white rounded-2xl border border-primary/10 font-bold text-sm text-primary shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                  data-testid="button-add-comment"
                >
                  <Clock className="w-4 h-4" />
                  {scan.userComment ? "Edit your note" : "Add a personal note..."}
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share how this product made you feel, any reactions, or tips..."
                    className="w-full h-28 p-4 bg-white rounded-2xl border border-primary/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    data-testid="textarea-comment"
                  />
                  <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1 rounded-xl font-black text-xs" onClick={() => setShowCommentInput(false)}>
                      Cancel
                    </Button>
                    <Button className="flex-1 rounded-xl font-black text-xs" onClick={handleCommentSubmit} data-testid="button-save-comment">
                      Save Note
                    </Button>
                  </div>
                </div>
              )}

              {scan.userComment && !showCommentInput && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-white/70 rounded-2xl border border-primary/5 text-xs font-medium italic text-primary/80"
                >
                  "{scan.userComment}"
                </motion.div>
              )}
            </section>

            {/* Ingredients List */}
            {scan.ingredients && (
              <section className="bg-white rounded-[2rem] border border-black/5 p-5 shadow-sm">
                <h3 className="font-black text-sm text-muted-foreground uppercase tracking-widest mb-3">
                  Full Ingredients
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{scan.ingredients}</p>
              </section>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
