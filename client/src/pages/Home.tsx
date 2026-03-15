import { useAuth } from "@/hooks/use-auth";
import { useScans, useCreateScan } from "@/hooks/use-scans";
import { useProfile } from "@/hooks/use-profile";
import { TotoAvatar } from "@/components/TotoAvatar";
import { Redirect, Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Scan, ShoppingBag, Carrot, Soup, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Recommendation {
  title: string;
  category: string;
  icon: typeof Carrot;
  color: string;
  score: number;
  grade: string;
  ingredients: string;
  positives: { title: string; description: string }[];
  negatives: { title: string; description: string }[];
  citations: { source: string; text: string; url?: string }[];
  alternatives: { name: string; score: number }[];
}

const recommendations: Recommendation[] = [
  {
    title: "Grass-fed Ghee",
    category: "Cooking Oil",
    icon: Carrot,
    color: "bg-orange-100 text-orange-600",
    score: 95,
    grade: "A",
    ingredients: "Grass-fed clarified butter (butyrate, conjugated linoleic acid, fat-soluble vitamins A, D, E, K2)",
    positives: [
      { title: "Rich in Butyrate", description: "Butyrate is a short-chain fatty acid that feeds colonocytes (gut lining cells) and reduces gut inflammation significantly." },
      { title: "Lactose & Casein Free", description: "All milk solids are removed during clarification, making it safe for most lactose-intolerant and dairy-sensitive individuals." },
      { title: "High Smoke Point", description: "Stable at high temperatures, unlike many vegetable oils that oxidise and produce inflammatory compounds when heated." },
    ],
    negatives: [],
    citations: [
      { source: "Harvard T.H. Chan School of Public Health", text: "Butyrate produced by gut bacteria from fermentable fibre — and found in ghee — is associated with reduced colonic inflammation and improved gut barrier integrity.", url: "https://www.hsph.harvard.edu" },
      { source: "Cleveland Clinic", text: "Clarified butter (ghee) is an excellent choice for those with dairy sensitivities as it is free from lactose and casein.", url: "https://www.clevelandclinic.org" },
    ],
    alternatives: [
      { name: "Extra Virgin Olive Oil", score: 90 },
      { name: "Coconut Oil (unrefined)", score: 82 },
    ],
  },
  {
    title: "Kefir Water",
    category: "Probiotic Drink",
    icon: Soup,
    color: "bg-blue-100 text-blue-600",
    score: 88,
    grade: "A",
    ingredients: "Filtered water, organic cane sugar (fermented), kefir water grains (Lactobacillus hilgardii, Lactobacillus casei, Leuconostoc mesenteroides, Pediococcus parvulus)",
    positives: [
      { title: "Live Probiotic Cultures", description: "Contains diverse lactic acid bacteria strains that replenish the gut microbiome and compete against pathogenic bacteria." },
      { title: "Dairy-Free Fermented Drink", description: "Delivers the microbiome benefits of kefir without dairy — ideal for those with lactose intolerance or dairy allergies." },
      { title: "Low Residual Sugar", description: "Bacteria consume most of the sugar during fermentation, leaving a naturally low-sugar probiotic drink." },
    ],
    negatives: [
      { title: "FODMAP Consideration", description: "Some kefir water varieties with added fruit juice may contain fructose — check labels if following a low-FODMAP protocol." },
    ],
    citations: [
      { source: "Monash University FODMAP Research", text: "Plain water kefir (without fruit additions) is generally well-tolerated on a low-FODMAP diet.", url: "https://www.monashfodmap.com" },
      { source: "NIH National Library of Medicine", text: "Fermented beverages containing Lactobacillus strains have shown benefit in modulating gut microbiota composition in IBS patients.", url: "https://pubmed.ncbi.nlm.nih.gov" },
    ],
    alternatives: [
      { name: "Plain Kombucha (unsweetened)", score: 80 },
      { name: "Yakult Original", score: 72 },
    ],
  },
  {
    title: "Bone Broth",
    category: "Gut Supplement",
    icon: ShoppingBag,
    color: "bg-primary/10 text-primary",
    score: 92,
    grade: "A",
    ingredients: "Grass-fed beef bones, filtered water, apple cider vinegar, onion, garlic, celery, bay leaves, black pepper, sea salt",
    positives: [
      { title: "Glutamine for Gut Lining", description: "L-Glutamine is the primary fuel for intestinal epithelial cells, supporting tight junction integrity and reducing intestinal permeability ('leaky gut')." },
      { title: "Collagen & Gelatin", description: "Gelatin derived from collagen coats the gut lining, soothes inflammation and supports healthy bowel movements." },
      { title: "Anti-inflammatory", description: "Glycine and proline in bone broth have documented anti-inflammatory properties, particularly beneficial for those with Crohn's or IBD." },
    ],
    negatives: [
      { title: "High Histamine Content", description: "Long-simmered broths are high in histamine — those with histamine intolerance should consume with caution or choose shorter-cooked versions." },
    ],
    citations: [
      { source: "Johns Hopkins Medicine", text: "Glutamine supplementation has been shown to reduce intestinal permeability and support mucosal healing in inflammatory bowel conditions.", url: "https://www.hopkinsmedicine.org" },
      { source: "Mayo Clinic", text: "Bone broth contains gelatin, which may help restore the gut lining and is frequently recommended for people with leaky gut syndrome.", url: "https://www.mayoclinic.org" },
    ],
    alternatives: [
      { name: "Collagen Peptide Powder", score: 89 },
      { name: "Chicken Bone Broth", score: 91 },
    ],
  },
];

export default function Home() {
  const { user } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: scans, isLoading: isScansLoading } = useScans(5);
  const createScan = useCreateScan();
  const [, navigate] = useLocation();
  const [loadingRec, setLoadingRec] = useState<number | null>(null);

  if (isProfileLoading) return <div className="flex items-center justify-center min-h-screen"><TotoAvatar mood="thinking" /></div>;
  if (!profile || !profile.conditions || profile.conditions.length === 0) return <Redirect to="/onboarding" />;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const handleRecommendationClick = async (rec: Recommendation, index: number) => {
    if (loadingRec !== null) return;
    setLoadingRec(index);
    try {
      const scan = await createScan.mutateAsync({
        productName: rec.title,
        score: rec.score,
        grade: rec.grade,
        ingredients: rec.ingredients,
        positives: rec.positives as any,
        negatives: rec.negatives as any,
        citations: rec.citations as any,
        alternatives: rec.alternatives as any,
        additivesDetails: [] as any,
        isFavorite: false,
        userId: undefined,
        barcode: null,
        imageUrl: null,
        userRating: null,
        userComment: null,
      });
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
            {[1, 2].map(i => <div key={i} className="w-48 h-56 bg-white rounded-3xl animate-pulse flex-shrink-0" />)}
          </div>
        ) : scans?.length ? (
          <div className="flex gap-4 overflow-x-auto pb-6 snap-x">
            {scans.map((scan) => (
              <Link key={scan.id} href={`/scan/${scan.id}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white p-4 rounded-[2rem] shadow-sm border border-border min-w-[180px] snap-start cursor-pointer flex flex-col h-full"
                >
                  <div className="relative mb-4 aspect-square rounded-2xl overflow-hidden bg-muted shadow-inner">
                    {scan.imageUrl ? (
                      <img src={scan.imageUrl} alt={scan.productName || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 opacity-20" /></div>
                    )}
                    <div className={`absolute top-2 right-2 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg
                      ${scan.grade === 'A' ? 'bg-green-500' : scan.grade === 'B' ? 'bg-lime-500' : scan.grade === 'C' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                      {scan.grade}
                    </div>
                  </div>
                  <h4 className="font-bold text-sm line-clamp-1 mb-1">{scan.productName}</h4>
                  <div className="text-xs font-bold text-primary bg-primary/5 self-start px-2 py-1 rounded-lg">Score: {scan.score}</div>
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
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">For You</h3>
          <span className="text-xs text-muted-foreground font-bold bg-primary/5 px-3 py-1 rounded-full">Toto picks</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4 -mt-2">Tap any product to see its full gut health analysis</p>
        <div className="grid gap-4">
          {recommendations.map((item, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRecommendationClick(item, i)}
              data-testid={`card-recommendation-${i}`}
              className="bg-white p-5 rounded-3xl shadow-sm border border-border flex items-center gap-4 cursor-pointer hover:border-primary transition-all"
            >
              <div className={`${item.color} p-4 rounded-2xl flex-shrink-0`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base">{item.title}</h4>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.category}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm shadow
                  ${item.grade === 'A' ? 'bg-green-500' : item.grade === 'B' ? 'bg-lime-500' : 'bg-yellow-500'}`}>
                  {item.grade}
                </div>
                {loadingRec === i ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
