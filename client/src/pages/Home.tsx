import { useAuth } from "@/hooks/use-auth";
import { useScans, useCreateScan } from "@/hooks/use-scans";
import { useProfile } from "@/hooks/use-profile";
import { TotoAvatar } from "@/components/TotoAvatar";
import { Redirect, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan, ShoppingBag, Loader2, Search, X,
  History, Package, ChevronRight, Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { Scan as ScanType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type DBProduct = {
  id: number;
  barcode: string;
  productName: string;
  brand: string;
  category: string | null;
  ingredients: string;
  imageUrl: string | null;
};

type AIProduct = {
  productName: string;
  brand: string;
  category: string | null;
  ingredients: string;
  _aiGenerated: true;
  _aiKey: string;
};

interface AiRecommendation {
  productName: string;
  brand?: string;
  category: string;
  score: number;
  grade: string;
  reason?: string;
  ingredients: string;
  positives: { title: string; description: string; type?: string }[];
  negatives: { title: string; description: string; type?: string }[];
  citations: { source: string; text: string; url?: string }[];
  alternatives: { name: string; score: number }[];
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Fetch product image from Open Food Facts (fast, free, no API key). */
function useProductImage(productName: string, barcode?: string | null) {
  const key = `gutcare-img2-${(barcode || productName).toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 60)}`;
  const [url, setUrl] = useState<string | null>(() => {
    try { return localStorage.getItem(key); } catch { return null; }
  });
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (url || fetchedRef.current) return;
    fetchedRef.current = true;
    const endpoint = barcode
      ? `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=image_url`
      : `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&json=1&fields=image_url,product_name&page_size=1&action=process`;

    fetch(endpoint)
      .then(r => r.json())
      .then(data => {
        const imgUrl = barcode
          ? data?.product?.image_url
          : data?.products?.[0]?.image_url;
        if (imgUrl) {
          setUrl(imgUrl);
          try { localStorage.setItem(key, imgUrl); } catch {}
        }
      })
      .catch(() => {});
  }, []);

  return url;
}

// ─── Grade helpers ─────────────────────────────────────────────────────────────

const GRADE_BG: Record<string, string> = {
  A: "bg-emerald-500", B: "bg-lime-500", C: "bg-amber-500",
  D: "bg-orange-500", F: "bg-red-500",
};
function gradeColor(g: string | null | undefined) {
  return GRADE_BG[g || ""] ?? "bg-gray-400";
}

function GradeBadge({ grade }: { grade: string | null | undefined }) {
  if (!grade) return null;
  return (
    <span className={`${gradeColor(grade)} text-white text-xs font-black w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0`}>
      {grade}
    </span>
  );
}

// ─── Small Components ──────────────────────────────────────────────────────────

function SectionLabel({ icon, label, labelClass = "text-muted-foreground" }: {
  icon: React.ReactNode; label: string; labelClass?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className={labelClass}>{icon}</span>
      <p className={`text-xs font-black uppercase tracking-widest ${labelClass}`}>{label}</p>
    </div>
  );
}

function ProductImage({ name, barcode, accent }: { name: string; barcode?: string | null; accent?: "violet" | "teal" }) {
  const imgUrl = useProductImage(name, barcode);
  const bg = accent === "violet" ? "bg-violet-50" : "bg-teal-50";
  const iconColor = accent === "violet" ? "text-violet-400" : "text-teal-400";
  return (
    <div className={`w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 ${!imgUrl ? bg : ""}`}>
      {imgUrl ? (
        <img src={imgUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full flex items-center justify-center`}>
          <ShoppingBag className={`w-5 h-5 ${iconColor}`} />
        </div>
      )}
    </div>
  );
}

function ProductRow({
  productName, brand, category, ingredients, barcode, trackKey,
  analyzingKey, onAnalyze, showDivider, index, accent = "teal"
}: {
  productName: string; brand: string; category: string | null;
  ingredients: string; barcode?: string | null; trackKey: string;
  analyzingKey: string | null; onAnalyze: () => void;
  showDivider: boolean; index: number; accent?: "teal" | "violet";
}) {
  const isAnalyzing = analyzingKey === trackKey;
  const isDisabled = analyzingKey !== null;
  const btnBg = accent === "violet"
    ? "bg-violet-100 text-violet-600 hover:bg-violet-200"
    : "bg-primary/10 text-primary hover:bg-primary/20";

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <div className={`flex items-center gap-3 px-4 py-3.5 ${showDivider ? "border-b border-black/5" : ""}`}>
        <ProductImage name={productName} barcode={barcode} accent={accent} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{productName}</p>
          <p className="text-xs text-muted-foreground truncate">{brand}{category ? ` · ${category}` : ""}</p>
        </div>
        <button
          onClick={onAnalyze}
          disabled={isDisabled}
          className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full transition-colors flex-shrink-0 disabled:opacity-40 ${btnBg}`}
          data-testid={`button-analyze-${trackKey}`}
        >
          {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Scan className="w-3 h-3" />}
          {isAnalyzing ? "Analyzing…" : "Analyze"}
        </button>
      </div>
    </motion.div>
  );
}

function ScanRow({ scan, showDivider = false }: { scan: ScanType; showDivider?: boolean }) {
  const imgUrl = useProductImage(scan.productName || "", null);
  const displayImg = scan.imageUrl || imgUrl;
  return (
    <Link href={`/scan/${scan.id}`}>
      <div
        className={`flex items-center gap-3 px-4 py-3.5 active:bg-black/5 transition-colors cursor-pointer ${showDivider ? "border-b border-black/5" : ""}`}
        data-testid={`row-scan-${scan.id}`}
      >
        <div className="w-11 h-11 rounded-xl overflow-hidden bg-black/5 flex-shrink-0">
          {displayImg ? (
            <img src={displayImg} alt={scan.productName || ""} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{scan.productName}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(scan.createdAt!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
        <GradeBadge grade={scan.grade} />
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
      </div>
    </Link>
  );
}

// ─── Search Results Panel ──────────────────────────────────────────────────────

function SearchResults({
  query, allScans, analyzingKey, onAnalyze
}: {
  query: string;
  allScans: ScanType[];
  analyzingKey: string | null;
  onAnalyze: (productName: string, ingredients: string, key: string, barcode?: string) => void;
}) {
  const debouncedQuery = useDebounced(query, 400);

  const { data: dbResults, isLoading: dbLoading } = useQuery<DBProduct[]>({
    queryKey: ["/api/products/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 60_000,
  });

  const { data: aiResults, isLoading: aiLoading } = useQuery<AIProduct[]>({
    queryKey: ["/api/products/search-ai", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await fetch(`/api/products/search-ai?q=${encodeURIComponent(debouncedQuery)}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 5 * 60_000,
  });

  const historyResults = (allScans || [])
    .filter(s => s.productName?.toLowerCase().includes(debouncedQuery.toLowerCase()))
    .slice(0, 4);

  const hasAny = historyResults.length > 0 || (dbResults?.length ?? 0) > 0 || (aiResults?.length ?? 0) > 0;
  const showNoResults = !dbLoading && !aiLoading && !hasAny && debouncedQuery.trim().length > 0;

  if (dbLoading && !dbResults) {
    return (
      <div className="flex items-center justify-center pt-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="space-y-5 pt-3">
        {historyResults.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SectionLabel icon={<History className="w-3.5 h-3.5" />} label="Your scans" />
            <div className="rounded-2xl border border-black/8 overflow-hidden shadow-sm bg-white">
              {historyResults.map((scan, i) => (
                <ScanRow key={scan.id} scan={scan} showDivider={i < historyResults.length - 1} />
              ))}
            </div>
          </motion.section>
        )}

        {dbResults && dbResults.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SectionLabel icon={<Package className="w-3.5 h-3.5" />} label="Product database" />
            <div className="rounded-2xl border border-black/8 overflow-hidden shadow-sm bg-white">
              {dbResults.map((p, i) => (
                <ProductRow
                  key={p.id}
                  productName={p.productName}
                  brand={p.brand}
                  category={p.category}
                  ingredients={p.ingredients}
                  barcode={p.barcode}
                  trackKey={String(p.id)}
                  analyzingKey={analyzingKey}
                  onAnalyze={() => onAnalyze(p.productName, p.ingredients, String(p.id), p.barcode)}
                  showDivider={i < dbResults.length - 1}
                  index={i}
                />
              ))}
            </div>
          </motion.section>
        )}

        {aiLoading && (
          <div className="flex items-center gap-2 py-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-bold">Finding more products…</span>
          </div>
        )}

        {aiResults && aiResults.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <SectionLabel
              icon={<Wand2 className="w-3.5 h-3.5 text-violet-500" />}
              label="More products"
              labelClass="text-violet-600"
            />
            <div className="rounded-2xl border border-violet-100 overflow-hidden shadow-sm bg-white">
              {aiResults.map((p, i) => (
                <ProductRow
                  key={p._aiKey}
                  productName={p.productName}
                  brand={p.brand}
                  category={p.category}
                  ingredients={p.ingredients}
                  trackKey={p._aiKey}
                  analyzingKey={analyzingKey}
                  onAnalyze={() => onAnalyze(p.productName, p.ingredients, p._aiKey)}
                  showDivider={i < aiResults.length - 1}
                  index={i}
                  accent="violet"
                />
              ))}
            </div>
          </motion.section>
        )}

        {showNoResults && (
          <div className="text-center pt-10">
            <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-20" />
            <p className="font-bold text-muted-foreground">No results for "{debouncedQuery}"</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Try scanning the product label</p>
            <Link href="/scan">
              <Button className="rounded-full mt-5 px-8">Open Camera</Button>
            </Link>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}

// ─── Recommendation Card ───────────────────────────────────────────────────────

function RecommendationCard({ item, index, isLoadingRec, onClick }: {
  item: AiRecommendation; index: number; isLoadingRec: boolean; onClick: () => void;
}) {
  const imgUrl = useProductImage(item.productName, null);
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      data-testid={`card-recommendation-${index}`}
      className="bg-white p-4 rounded-3xl shadow-sm border border-border flex items-center gap-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden shadow-sm bg-primary/5">
        {imgUrl ? (
          <img src={imgUrl} alt={item.productName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-7 h-7 text-primary/30" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm leading-snug line-clamp-2">{item.productName}</h4>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{item.category}</p>
        {item.reason && (
          <p className="text-[11px] text-primary/70 font-medium mt-1 line-clamp-1">{item.reason}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isLoadingRec ? (
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        ) : (
          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm shadow ${gradeColor(item.grade)}`}>
            {item.grade}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Home() {
  const { user } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: scans, isLoading: isScansLoading } = useScans();
  const createScan = useCreateScan();
  const [, navigate] = useLocation();
  const [loadingRec, setLoadingRec] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [analyzingKey, setAnalyzingKey] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: recommendations, isLoading: isRecsLoading } = useQuery<AiRecommendation[]>({
    queryKey: ["/api/recommendations"],
    enabled: !!profile && !!profile.conditions?.length,
    staleTime: 1000 * 60 * 30,
  });

  if (isProfileLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <TotoAvatar mood="thinking" />
    </div>
  );
  if (!profile || !profile.conditions || profile.conditions.length === 0) return <Redirect to="/onboarding" />;

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const uniqueScans = (scans || []).reduce((acc: typeof scans, scan) => {
    if (!acc!.some(s => s.productName === scan.productName)) acc!.push(scan);
    return acc;
  }, [] as typeof scans);
  const recentScans = (uniqueScans || []).slice(0, 5);

  const findExistingScan = (productName: string) =>
    (scans || []).find(s => s.productName === productName);

  const handleRecommendationClick = async (rec: AiRecommendation, index: number) => {
    if (loadingRec !== null) return;
    const existing = findExistingScan(rec.productName);
    if (existing) { navigate(`/scan/${existing.id}`); return; }
    setLoadingRec(index);
    try {
      const res = await apiRequest("POST", "/api/recommendation-scan", {
        productName: rec.productName, score: rec.score, grade: rec.grade,
        ingredients: rec.ingredients, positives: rec.positives,
        negatives: rec.negatives, citations: rec.citations,
        alternatives: rec.alternatives, additivesDetails: [], isFavorite: false, imageUrl: null,
      });
      const scan = await res.json();
      queryClient.invalidateQueries({ queryKey: [api.scans.list.path] });
      navigate(`/scan/${scan.id}`);
    } catch {
      setLoadingRec(null);
    }
  };

  const runAnalyze = async (productName: string, ingredients: string, key: string) => {
    if (analyzingKey !== null) return;
    setAnalyzingKey(key);
    try {
      const res = await fetch("/api/analyze/product-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productName, ingredients }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const analysis = await res.json();
      const scan = await createScan.mutateAsync({
        productName: analysis.productName || productName,
        ingredients: analysis.ingredients || ingredients,
        score: analysis.score, grade: analysis.grade,
        portionSize: analysis.portionSize || null,
        positives: analysis.positives || [], negatives: analysis.negatives || [],
        alternatives: analysis.alternatives || [], citations: analysis.citations || [],
        additivesDetails: analysis.additivesDetails || [],
        imageUrl: null, isFavorite: false,
      });
      navigate(`/scan/${scan.id}`);
    } catch {
      toast({ title: "Analysis failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setAnalyzingKey(null);
    }
  };

  const isSearching = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* ── Sticky header with greeting + search ── */}
      <div className={`sticky top-0 z-20 bg-background/95 backdrop-blur-md px-6 ${isSearching ? "pt-4 pb-3 border-b border-black/5" : "pt-12 pb-4"}`}>
        {!isSearching && (
          <header className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">{getGreeting()},</h1>
              <p className="text-xl font-bold opacity-80">{profile?.firstName || user?.firstName || "Friend"}!</p>
            </div>
            <Link href="/profile">
              <div className="cursor-pointer ring-4 ring-white shadow-xl rounded-full">
                <TotoAvatar size="sm" mood="happy" />
              </div>
            </Link>
          </header>
        )}

        {/* Search bar */}
        <div className="flex items-center gap-2.5 bg-black/5 rounded-2xl px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search any product…"
            className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground/60"
            data-testid="input-search-home"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-6">
        {/* ── Search results mode ── */}
        {isSearching && (
          <SearchResults
            query={query}
            allScans={scans || []}
            analyzingKey={analyzingKey}
            onAnalyze={runAnalyze}
          />
        )}

        {/* ── Home content mode ── */}
        {!isSearching && (
          <>
            {/* Scan CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden mb-12"
            >
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-3">Check your gut!</h2>
                <p className="text-primary-foreground/80 mb-8 max-w-[180px] text-sm leading-relaxed">
                  Scan any product to see if it fits your profile.
                </p>
                <Link href="/scan">
                  <Button variant="secondary" className="rounded-2xl h-14 px-8 font-bold text-primary shadow-xl hover:bg-white transition-all">
                    <Scan className="w-5 h-5 mr-2" />
                    Scan Now
                  </Button>
                </Link>
              </div>
              <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            </motion.div>

            {/* Recently Viewed */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Recently Viewed</h3>
                <Link href="/history">
                  <span className="text-sm font-bold text-primary">View all</span>
                </Link>
              </div>
              {isScansLoading ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {[1, 2].map(i => <div key={i} className="w-40 h-56 bg-white rounded-3xl animate-pulse flex-shrink-0" />)}
                </div>
              ) : recentScans?.length ? (
                <div className="flex gap-4 overflow-x-auto pb-6 snap-x">
                  {recentScans.map((scan) => (
                    <RecentScanCard key={scan.id} scan={scan} />
                  ))}
                </div>
              ) : (
                <div className="bg-white/50 border-2 border-dashed border-primary/20 rounded-[2rem] p-10 text-center">
                  <p className="text-muted-foreground font-bold">Start scanning items!</p>
                </div>
              )}
            </section>

            {/* For You */}
            <section>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold">For You</h3>
                <span className="text-xs text-muted-foreground font-bold bg-primary/5 px-3 py-1 rounded-full">Toto picks</span>
              </div>
              <p className="text-sm text-muted-foreground mb-5">Tap any product to see its full gut health breakdown</p>
              {isRecsLoading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white p-4 rounded-3xl border border-border flex items-center gap-4">
                      <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                        <div className="h-2 bg-muted rounded animate-pulse w-1/2" />
                      </div>
                      <div className="w-9 h-9 rounded-full bg-muted animate-pulse flex-shrink-0" />
                    </div>
                  ))}
                </div>
              ) : recommendations?.length ? (
                <div className="grid gap-4">
                  {recommendations.map((item, i) => (
                    <RecommendationCard
                      key={i}
                      item={item}
                      index={i}
                      isLoadingRec={loadingRec === i}
                      onClick={() => handleRecommendationClick(item, i)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white/50 border-2 border-dashed border-primary/20 rounded-[2rem] p-10 text-center">
                  <p className="text-muted-foreground font-bold">Could not load recommendations. Try refreshing.</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Recent Scan Card ──────────────────────────────────────────────────────────

function RecentScanCard({ scan }: { scan: ScanType }) {
  const imgUrl = useProductImage(scan.productName || "", null);
  const displayImg = scan.imageUrl || imgUrl;
  return (
    <Link href={`/scan/${scan.id}`} className="block flex-shrink-0">
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white p-4 rounded-[2rem] shadow-sm border border-border w-40 snap-start cursor-pointer flex flex-col"
      >
        <div className="relative mb-3 w-full aspect-square rounded-xl overflow-hidden bg-muted">
          {displayImg ? (
            <img src={displayImg} alt={scan.productName || ""} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <ShoppingBag className="w-8 h-8 text-primary/20" />
            </div>
          )}
          <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-lg ${gradeColor(scan.grade)}`}>
            {scan.grade}
          </div>
        </div>
        <h4 className="font-bold text-xs line-clamp-2 mb-1 leading-tight">{scan.productName}</h4>
        <div className="text-[10px] font-bold text-primary bg-primary/5 self-start px-2 py-1 rounded-lg mt-auto">{scan.score}/100</div>
      </motion.div>
    </Link>
  );
}
