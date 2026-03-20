import { useState, useEffect, useRef } from "react";
import { useScans, useCreateScan } from "@/hooks/use-scans";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ShoppingBag, ChevronRight, History, Package, Loader2, Scan, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Scan as ScanType } from "@shared/schema";

type DBProduct = {
  id: number;
  barcode: string;
  productName: string;
  brand: string;
  category: string | null;
  ingredients: string;
  imageUrl: string | null;
  country: string | null;
  createdAt: Date | null;
};

type AIProduct = {
  productName: string;
  brand: string;
  category: string | null;
  ingredients: string;
  _aiGenerated: true;
  _aiKey: string;
};

const GRADE_CONFIG: Record<string, { bg: string; text: string }> = {
  A: { bg: "bg-emerald-500", text: "text-white" },
  B: { bg: "bg-lime-500",    text: "text-white" },
  C: { bg: "bg-amber-500",   text: "text-white" },
  D: { bg: "bg-orange-500",  text: "text-white" },
  F: { bg: "bg-red-500",     text: "text-white" },
};

function GradeBadge({ grade }: { grade: string | null | undefined }) {
  if (!grade) return null;
  const cfg = GRADE_CONFIG[grade] ?? GRADE_CONFIG["C"];
  return (
    <span className={`${cfg.bg} ${cfg.text} text-xs font-black w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0`}>
      {grade}
    </span>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [analyzingKey, setAnalyzingKey] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: allScans } = useScans();
  const createScan = useCreateScan();

  const debouncedQuery = useDebounced(query, 350);

  // DB search
  const { data: dbResults, isLoading: dbLoading } = useQuery<DBProduct[]>({
    queryKey: ["/api/products/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  // Gemini AI search — runs in parallel with DB search
  const { data: aiResults, isLoading: aiLoading } = useQuery<AIProduct[]>({
    queryKey: ["/api/products/search-ai", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await fetch(`/api/products/search-ai?q=${encodeURIComponent(debouncedQuery)}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 60_000, // Cache AI results for 1 min
  });

  const historyResults: ScanType[] = (allScans || []).filter(s =>
    s.productName?.toLowerCase().includes(debouncedQuery.toLowerCase())
  ).slice(0, 5);

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
        score: analysis.score,
        grade: analysis.grade,
        portionSize: analysis.portionSize || null,
        positives: analysis.positives || [],
        negatives: analysis.negatives || [],
        alternatives: analysis.alternatives || [],
        citations: analysis.citations || [],
        additivesDetails: analysis.additivesDetails || [],
        imageUrl: null,
        isFavorite: false,
      });

      setLocation(`/scan/${scan.id}`);
    } catch {
      toast({ title: "Analysis failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setAnalyzingKey(null);
    }
  };

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const anyLoading = debouncedQuery.trim() && (dbLoading || aiLoading);
  const showEmpty = !debouncedQuery.trim();
  const hasAnyResults = historyResults.length > 0 || (dbResults?.length ?? 0) > 0 || (aiResults?.length ?? 0) > 0;
  const showNoResults = debouncedQuery.trim() && !anyLoading && !hasAnyResults;

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col">
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-black/5 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-1 flex items-center gap-2.5 bg-black/5 rounded-2xl px-4 py-2.5">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search any product..."
              className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-muted-foreground/60"
              data-testid="input-search"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Link href="/">
            <Button variant="ghost" className="rounded-full text-sm font-bold text-muted-foreground px-3">
              Cancel
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-5 pt-4 pb-32">

        {/* Empty state */}
        {showEmpty && (
          <div className="pt-6">
            <p className="text-xs font-black text-muted-foreground/50 uppercase tracking-widest mb-3">Recent scans</p>
            {(allScans || []).slice(0, 6).length > 0 ? (
              <div className="rounded-2xl border border-black/8 overflow-hidden shadow-sm bg-white">
                {(allScans || []).slice(0, 6).map((scan, i, arr) => (
                  <ScanRow key={scan.id} scan={scan} showDivider={i < arr.length - 1} />
                ))}
              </div>
            ) : (
              <div className="text-center pt-12 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No scans yet — try searching for a product!</p>
              </div>
            )}
          </div>
        )}

        {/* Initial loading spinner (before any results appear) */}
        {debouncedQuery.trim() && dbLoading && !dbResults && (
          <div className="flex items-center justify-center pt-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Results */}
        {debouncedQuery.trim() && !dbLoading && (
          <AnimatePresence>
            <div className="space-y-5 pt-2">

              {/* Your scans */}
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

              {/* Local DB products */}
              {dbResults && dbResults.length > 0 && (
                <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <SectionLabel icon={<Package className="w-3.5 h-3.5" />} label="Product database" />
                  <div className="rounded-2xl border border-black/8 overflow-hidden shadow-sm bg-white">
                    {dbResults.map((product, i) => (
                      <ProductRow
                        key={product.id}
                        productName={product.productName}
                        brand={product.brand}
                        category={product.category}
                        ingredients={product.ingredients}
                        trackKey={String(product.id)}
                        analyzingKey={analyzingKey}
                        onAnalyze={() => runAnalyze(product.productName, product.ingredients, String(product.id))}
                        showDivider={i < dbResults.length - 1}
                        index={i}
                      />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* AI-generated suggestions from Gemini */}
              {aiLoading && (
                <div className="flex items-center gap-2 py-3 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-bold">Finding more products...</span>
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
                    {aiResults.map((product, i) => (
                      <ProductRow
                        key={product._aiKey}
                        productName={product.productName}
                        brand={product.brand}
                        category={product.category}
                        ingredients={product.ingredients}
                        trackKey={product._aiKey}
                        analyzingKey={analyzingKey}
                        onAnalyze={() => runAnalyze(product.productName, product.ingredients, product._aiKey)}
                        showDivider={i < aiResults.length - 1}
                        index={i}
                        accent="violet"
                      />
                    ))}
                  </div>
                </motion.section>
              )}

              {/* No results at all */}
              {showNoResults && (
                <div className="text-center pt-12">
                  <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-20" />
                  <p className="font-bold text-muted-foreground">No results for "{debouncedQuery}"</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">Try scanning the product label instead</p>
                  <Link href="/scan">
                    <Button className="rounded-full mt-6 px-8">Open Camera</Button>
                  </Link>
                </div>
              )}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function SectionLabel({
  icon, label, labelClass = "text-muted-foreground"
}: {
  icon: React.ReactNode;
  label: string;
  labelClass?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className={labelClass}>{icon}</span>
      <p className={`text-xs font-black uppercase tracking-widest ${labelClass}`}>{label}</p>
    </div>
  );
}

function ProductRow({
  productName, brand, category, ingredients, trackKey, analyzingKey, onAnalyze, showDivider, index, accent = "teal"
}: {
  productName: string;
  brand: string;
  category: string | null;
  ingredients: string;
  trackKey: string;
  analyzingKey: string | null;
  onAnalyze: () => void;
  showDivider: boolean;
  index: number;
  accent?: "teal" | "violet";
}) {
  const isAnalyzing = analyzingKey === trackKey;
  const isDisabled = analyzingKey !== null;
  const iconBg = accent === "violet" ? "bg-violet-50" : "bg-teal-50";
  const iconColor = accent === "violet" ? "text-violet-500" : "text-teal-500";
  const btnBg = accent === "violet"
    ? "bg-violet-100 text-violet-600 hover:bg-violet-200"
    : "bg-primary/10 text-primary hover:bg-primary/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <div className={`flex items-center gap-3 px-4 py-3.5 ${showDivider ? "border-b border-black/5" : ""}`}>
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <ShoppingBag className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{productName}</p>
          <p className="text-xs text-muted-foreground truncate">
            {brand}{category ? ` · ${category}` : ""}
          </p>
        </div>
        <button
          onClick={onAnalyze}
          disabled={isDisabled}
          className={`flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full transition-colors flex-shrink-0 disabled:opacity-40 ${btnBg}`}
          data-testid={`button-analyze-${trackKey}`}
        >
          {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Scan className="w-3 h-3" />}
          {isAnalyzing ? "Analyzing..." : "Analyze"}
        </button>
      </div>
    </motion.div>
  );
}

function ScanRow({ scan, showDivider = false }: { scan: ScanType; showDivider?: boolean }) {
  const formatDate = (d: string | Date | null | undefined) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  return (
    <Link href={`/scan/${scan.id}`}>
      <div
        className={`flex items-center gap-3 px-4 py-3.5 active:bg-black/5 transition-colors cursor-pointer ${showDivider ? "border-b border-black/5" : ""}`}
        data-testid={`row-scan-${scan.id}`}
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/5 flex-shrink-0">
          {scan.imageUrl ? (
            <img src={scan.imageUrl} alt={scan.productName || ""} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{scan.productName}</p>
          <p className="text-xs text-muted-foreground">{formatDate(scan.createdAt)}</p>
        </div>
        <GradeBadge grade={scan.grade} />
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
      </div>
    </Link>
  );
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
