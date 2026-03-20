import { useState, useEffect, useRef } from "react";
import { useScans, useCreateScan } from "@/hooks/use-scans";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ShoppingBag, ChevronRight, History, Package, Loader2, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Scan as ScanType } from "@shared/schema";

type BarcodeProduct = {
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

const GRADE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: "bg-emerald-500", text: "text-white", label: "Excellent" },
  B: { bg: "bg-lime-500",    text: "text-white", label: "Good"      },
  C: { bg: "bg-amber-500",   text: "text-white", label: "Moderate"  },
  D: { bg: "bg-orange-500",  text: "text-white", label: "Poor"      },
  F: { bg: "bg-red-500",     text: "text-white", label: "Avoid"     },
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
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: allScans } = useScans();
  const createScan = useCreateScan();

  const debouncedQuery = useDebounced(query, 300);

  const { data: dbResults, isLoading: dbLoading } = useQuery<BarcodeProduct[]>({
    queryKey: ["/api/products/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  const historyResults: ScanType[] = (allScans || []).filter(s =>
    s.productName?.toLowerCase().includes(debouncedQuery.toLowerCase())
  ).slice(0, 5);

  const handleAnalyze = async (product: BarcodeProduct) => {
    if (analyzingId !== null) return;
    setAnalyzingId(product.id);
    try {
      const res = await fetch("/api/analyze/product-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productName: product.productName, ingredients: product.ingredients }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const analysis = await res.json();

      const scan = await createScan.mutateAsync({
        productName: analysis.productName || product.productName,
        ingredients: analysis.ingredients || product.ingredients,
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
      setAnalyzingId(null);
    }
  };

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const showEmpty = !debouncedQuery.trim();
  const showNoResults = debouncedQuery.trim() && !dbLoading && !historyResults.length && !dbResults?.length;

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
              placeholder="Search products..."
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
        {/* Empty state — no query */}
        {showEmpty && (
          <div className="pt-8">
            <p className="text-xs font-black text-muted-foreground/60 uppercase tracking-widest mb-3">Recent scans</p>
            {(allScans || []).slice(0, 5).map((scan) => (
              <ScanRow key={scan.id} scan={scan} />
            ))}
            {!allScans?.length && (
              <div className="text-center pt-12 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No scans yet. Start scanning!</p>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {debouncedQuery.trim() && dbLoading && (
          <div className="flex items-center justify-center pt-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {/* Results */}
        {debouncedQuery.trim() && !dbLoading && (
          <AnimatePresence>
            <div className="space-y-6 pt-2">
              {/* Your scans section */}
              {historyResults.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <History className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Your scans</p>
                  </div>
                  <div className="rounded-2xl border border-black/8 overflow-hidden shadow-sm bg-white">
                    {historyResults.map((scan, i) => (
                      <ScanRow key={scan.id} scan={scan} showDivider={i < historyResults.length - 1} />
                    ))}
                  </div>
                </section>
              )}

              {/* Database section */}
              {dbResults && dbResults.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Product database</p>
                  </div>
                  <div className="rounded-2xl border border-black/8 overflow-hidden shadow-sm bg-white">
                    {dbResults.map((product, i) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <div className={`flex items-center gap-3 px-4 py-3.5 ${i < dbResults.length - 1 ? "border-b border-black/5" : ""}`}>
                          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-5 h-5 text-teal-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{product.productName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {product.brand}{product.category ? ` · ${product.category}` : ""}
                            </p>
                          </div>
                          <button
                            onClick={() => handleAnalyze(product)}
                            disabled={analyzingId !== null}
                            className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-black px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors flex-shrink-0 disabled:opacity-50"
                            data-testid={`button-analyze-${product.id}`}
                          >
                            {analyzingId === product.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Scan className="w-3 h-3" />
                            )}
                            {analyzingId === product.id ? "Analyzing..." : "Analyze"}
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* No results */}
              {showNoResults && (
                <div className="text-center pt-12">
                  <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-20" />
                  <p className="font-bold text-muted-foreground">No results for "{debouncedQuery}"</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">Try scanning a product instead</p>
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

function ScanRow({ scan, showDivider = false }: { scan: ScanType; showDivider?: boolean }) {
  const formatDate = (d: string | Date | null | undefined) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  return (
    <Link href={`/scan/${scan.id}`}>
      <div className={`flex items-center gap-3 px-4 py-3.5 active:bg-black/5 transition-colors cursor-pointer ${showDivider ? "border-b border-black/5" : ""}`}
        data-testid={`row-scan-${scan.id}`}>
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
