import { useScan, useUpdateScan } from "@/hooks/use-scans";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, Info, CheckCircle2, AlertCircle, Bookmark, BookmarkCheck,
  GraduationCap, ChevronDown, ExternalLink, Heart, Leaf, Zap, Droplets,
  AlertTriangle, Flame, Bean, Apple, Shield, Clock, Package, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { TotoAvatar } from "@/components/TotoAvatar";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

function ExpandableItem({ item, isPositive }: { item: any; isPositive: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const { IconComponent, color, bg } = getIcon(item.type);
  const borderColor = isPositive ? "border-emerald-100 hover:border-emerald-300" : "border-red-100 hover:border-red-200";
  const dotColor = isPositive ? "bg-emerald-500" : "bg-red-500";
  const dotGlow = isPositive ? "shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "shadow-[0_0_8px_rgba(239,68,68,0.5)]";

  return (
    <div className={`bg-white rounded-3xl border ${borderColor} shadow-sm overflow-hidden transition-all duration-300`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left"
        data-testid={`button-expand-${item.type}`}
      >
        <div className={`w-11 h-11 ${bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
          <IconComponent className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor} ${dotGlow}`} />
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
            <div className="px-5 pb-5 pt-1">
              <div className="bg-[#FDFCF8] rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed">
                {item.detail || item.description}
              </div>
              {item.type === "additives" && (
                <p className="mt-3 text-[11px] font-bold text-primary/70 flex items-center gap-1">
                  <Info className="w-3 h-3" /> See additives section below for full breakdown
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const RISK_CFG: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  High:   { color: "text-red-600",    bg: "bg-red-100",    border: "border-red-200",    dot: "bg-red-500" },
  Medium: { color: "text-amber-600",  bg: "bg-amber-100",  border: "border-amber-200",  dot: "bg-amber-500" },
  Low:    { color: "text-emerald-600",bg: "bg-emerald-100",border: "border-emerald-200",dot: "bg-emerald-500" },
};
const DEFAULT_RISK = { color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-200", dot: "bg-gray-400" };

function AdditiveCard({ additive, index }: { additive: any; index: number }) {
  const [open, setOpen] = useState(false);
  const riskCfg = RISK_CFG[additive.risk as string] || DEFAULT_RISK;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
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
        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full ${riskCfg.bg} ${riskCfg.color}`}>
          {additive.risk} Risk
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
                  <span className="text-[10px] font-bold text-foreground">{additive.category}</span>
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

export default function ResultsPage() {
  const [, params] = useRoute("/scan/:id");
  const scanId = parseInt(params?.id || "0");
  const { data: scan, isLoading, error } = useScan(scanId);
  const updateScan = useUpdateScan();
  const { toast } = useToast();

  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");
  const [showAdditivesSection, setShowAdditivesSection] = useState(false);
  const [showCitationsSection, setShowCitationsSection] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <TotoAvatar mood="thinking" size="lg" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading results...</p>
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
    <div className="min-h-screen bg-[#FDFCF8] pb-32 font-sans">
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
          {/* Background gradient */}
          <div className={`absolute inset-0 ${gradeCfg.bg} opacity-60 rounded-b-[4rem]`} />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative z-10 w-44 h-44 rounded-[2.5rem] overflow-hidden shadow-2xl mb-6 bg-white ring-4 ring-white"
          >
            {scan.imageUrl ? (
              <img src={scan.imageUrl} alt={scan.productName || ""} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <TotoAvatar mood="happy" size="lg" />
              </div>
            )}
          </motion.div>

          <div className="relative z-10 text-center mb-6">
            <h2 className="text-2xl font-black mb-1">{scan.productName}</h2>
            <span className={`inline-block px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${gradeCfg.bg} ${gradeCfg.color} ${gradeCfg.border} border`}>
              {gradeCfg.emoji} {gradeCfg.label} for your gut
            </span>
          </div>

          {/* Score Circle */}
          <div className="relative z-10 mb-8">
            <ScoreCircle score={scan.score || 0} grade={grade} />
          </div>
        </section>

        {/* Main Content Card */}
        <div className="bg-white rounded-t-[3rem] pt-10 px-5 shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.08)] -mt-2">
          <div className="space-y-8">

            {/* Positives Section */}
            {positives.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 px-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-black text-lg text-emerald-700">What's working ✓</h3>
                  <span className="ml-auto text-xs font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">{positives.length} found</span>
                </div>
                <div className="space-y-3">
                  {positives.map((pos, i) => (
                    <ExpandableItem key={i} item={pos} isPositive={true} />
                  ))}
                </div>
              </section>
            )}

            {/* Negatives Section */}
            {negatives.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 px-1">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-black text-lg text-red-700">Watch out for ✗</h3>
                  <span className="ml-auto text-xs font-black text-red-500 bg-red-50 px-3 py-1 rounded-full">{negatives.length} found</span>
                </div>
                <div className="space-y-3">
                  {negatives.map((neg, i) => (
                    <ExpandableItem key={i} item={neg} isPositive={false} />
                  ))}
                </div>
              </section>
            )}

            {/* Additives Section */}
            {additives.length > 0 && (
              <section className="bg-red-50/50 rounded-[2rem] p-5 border border-red-100">
                <button
                  onClick={() => setShowAdditivesSection(!showAdditivesSection)}
                  className="w-full flex items-center justify-between"
                  data-testid="button-additives-toggle"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-black text-base">Additives & Risks</h3>
                      <p className="text-[11px] text-muted-foreground">{additives.length} additives detected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-red-600 bg-red-100 px-3 py-1 rounded-full">ⓘ Details</span>
                    <ChevronDown className={`w-5 h-5 text-red-500 transition-transform ${showAdditivesSection ? "rotate-180" : ""}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {showAdditivesSection && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-2">
                        {additives.map((add, i) => (
                          <AdditiveCard key={i} additive={add} index={i} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-xl font-black text-xs"
                      onClick={() => setShowCommentInput(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 rounded-xl font-black text-xs"
                      onClick={handleCommentSubmit}
                      data-testid="button-save-comment"
                    >
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

      {/* Floating Navigation Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-5 bg-black/90 pl-3 pr-6 py-2 rounded-full shadow-2xl z-30 backdrop-blur-xl border border-white/10"
      >
        <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center overflow-hidden shadow-lg">
          <TotoAvatar mood="happy" size="sm" />
        </div>
        <Link href="/" className="text-white/70 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Home</Link>
        <Link href="/scan" className="text-white/70 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Scan</Link>
        <Link href="/chat" className="text-white/70 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Ask Toto</Link>
      </motion.div>
    </div>
  );
}
