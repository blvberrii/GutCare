import { useAuth } from "@/hooks/use-auth";
import { useScans } from "@/hooks/use-scans";
import { useProfile } from "@/hooks/use-profile";
import { TotoAvatar } from "@/components/TotoAvatar";
import { Redirect, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Scan, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

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

function gradeColor(g: string) {
  return g === "A" ? "bg-green-500" : g === "B" ? "bg-lime-500" : g === "C" ? "bg-yellow-500" : "bg-red-500";
}

function RecommendationCard({
  item,
  index,
  isLoadingRec,
  onClick,
  onImageLoaded,
}: {
  item: AiRecommendation;
  index: number;
  isLoadingRec: boolean;
  onClick: () => void;
  onImageLoaded: (url: string) => void;
}) {
  const cacheKey = `gutcare-img-${item.productName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
  const [imageUrl, setImageUrl] = useState<string | null>(() => {
    try { return localStorage.getItem(cacheKey); } catch { return null; }
  });
  const [imgLoading, setImgLoading] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (imageUrl || fetchedRef.current) return;
    fetchedRef.current = true;
    setImgLoading(true);
    apiRequest("POST", "/api/generate-product-image", { productName: item.productName, brand: item.brand })
      .then(r => r.json())
      .then(data => {
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
          onImageLoaded(data.imageUrl);
          try { localStorage.setItem(cacheKey, data.imageUrl); } catch {}
        }
      })
      .catch(() => {})
      .finally(() => setImgLoading(false));
  }, []);

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      data-testid={`card-recommendation-${index}`}
      className="bg-white p-4 rounded-3xl shadow-sm border border-border flex items-center gap-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden shadow-sm bg-primary/5">
        {imgLoading ? (
          <div className="w-full h-full bg-primary/5 animate-pulse" />
        ) : imageUrl ? (
          <img src={imageUrl} alt={item.productName} className="w-full h-full object-cover" />
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

export default function Home() {
  const { user } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: scans, isLoading: isScansLoading } = useScans();
  const [, navigate] = useLocation();
  const [loadingRec, setLoadingRec] = useState<number | null>(null);
  const loadedImages = useRef<Record<string, string>>({});

  const { data: recommendations, isLoading: isRecsLoading } = useQuery<AiRecommendation[]>({
    queryKey: ["/api/recommendations"],
    enabled: !!profile && !!profile.conditions?.length,
    staleTime: 1000 * 60 * 30,
  });

  if (isProfileLoading) return <div className="flex items-center justify-center min-h-screen"><TotoAvatar mood="thinking" /></div>;
  if (!profile || !profile.conditions || profile.conditions.length === 0) return <Redirect to="/onboarding" />;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
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
      const cachedImage = loadedImages.current[rec.productName] || null;
      const res = await apiRequest("POST", "/api/recommendation-scan", {
        productName: rec.productName,
        score: rec.score,
        grade: rec.grade,
        ingredients: rec.ingredients,
        positives: rec.positives,
        negatives: rec.negatives,
        citations: rec.citations,
        alternatives: rec.alternatives,
        additivesDetails: [],
        isFavorite: false,
        imageUrl: cachedImage,
      });
      const scan = await res.json();
      queryClient.invalidateQueries({ queryKey: [api.scans.list.path] });
      navigate(`/scan/${scan.id}`);
    } catch {
      setLoadingRec(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32 px-6 pt-12">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-primary">{getGreeting()},</h1>
          <p className="text-xl font-bold opacity-80">{profile?.firstName || user?.firstName || 'Friend'}!</p>
        </div>
        <Link href="/profile">
          <div className="cursor-pointer ring-4 ring-white shadow-xl rounded-full">
            <TotoAvatar size="sm" mood="happy" />
          </div>
        </Link>
      </header>

      {/* Main CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-primary rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden mb-12"
      >
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-3">Check your gut!</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-[180px] text-sm leading-relaxed">Scan any product to see if it fits your profile.</p>
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
              <Link key={scan.id} href={`/scan/${scan.id}`} className="block flex-shrink-0">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white p-4 rounded-[2rem] shadow-sm border border-border w-40 snap-start cursor-pointer flex flex-col"
                >
                  <div className="relative mb-3 w-full aspect-square rounded-xl overflow-hidden bg-muted">
                    {scan.imageUrl ? (
                      <img src={scan.imageUrl} alt={scan.productName || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <ShoppingBag className="w-8 h-8 text-primary/20" />
                      </div>
                    )}
                    <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-lg ${gradeColor(scan.grade || "")}`}>
                      {scan.grade}
                    </div>
                  </div>
                  <h4 className="font-bold text-xs line-clamp-2 mb-1 leading-tight">{scan.productName}</h4>
                  <div className="text-[10px] font-bold text-primary bg-primary/5 self-start px-2 py-1 rounded-lg mt-auto">{scan.score}/100</div>
                </motion.div>
              </Link>
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
                onImageLoaded={(url) => { loadedImages.current[item.productName] = url; }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/50 border-2 border-dashed border-primary/20 rounded-[2rem] p-10 text-center">
            <p className="text-muted-foreground font-bold">Could not load recommendations. Try refreshing.</p>
          </div>
        )}
      </section>
    </div>
  );
}
