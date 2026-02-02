import { useAuth } from "@/hooks/use-auth";
import { useScans } from "@/hooks/use-scans";
import { useProfile } from "@/hooks/use-profile";
import { TotoAvatar } from "@/components/TotoAvatar";
import { Redirect, Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, Star, ShoppingBag, Carrot, Soup, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: scans, isLoading: isScansLoading } = useScans(5);
  const [selectedRec, setSelectedRec] = useState<any>(null);

  if (isProfileLoading) return <div className="flex items-center justify-center min-h-screen"><TotoAvatar mood="thinking" /></div>;
  if (!profile || !profile.conditions || profile.conditions.length === 0) return <Redirect to="/onboarding" />;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const recommendations = [
    { 
      title: "Grass-fed Ghee", 
      category: "Cooking Oil", 
      icon: Carrot, 
      color: "bg-orange-100 text-orange-600",
      score: 95,
      description: "A rich source of butyrate, which supports the gut barrier and reduces inflammation.",
      benefits: ["Lactose-free", "High smoke point", "Supports digestion"]
    },
    { 
      title: "Kefir Water", 
      category: "Probiotic", 
      icon: Soup, 
      color: "bg-blue-100 text-blue-600",
      score: 88,
      description: "Packed with live cultures that help balance your gut microbiome.",
      benefits: ["Dairy-free", "Probiotic rich", "Low sugar"]
    },
    { 
      title: "Bone Broth", 
      category: "Supplement", 
      icon: ShoppingBag, 
      color: "bg-primary/10 text-primary",
      score: 92,
      description: "Contains amino acids like glutamine that help heal and seal the gut lining.",
      benefits: ["Collagen rich", "Anti-inflammatory", "Easy to digest"]
    },
  ];

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
          <Link href="/scans">
            <span className="text-sm font-bold text-primary">View all</span>
          </Link>
        </div>

        {isScansLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1,2].map(i => <div key={i} className="w-48 h-56 bg-white rounded-3xl animate-pulse flex-shrink-0" />)}
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
        <h3 className="text-xl font-bold mb-6">For You</h3>
        <div className="grid gap-4">
          {recommendations.map((item, i) => (
            <motion.div 
              key={i}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRec(item)}
              className="bg-white p-5 rounded-3xl shadow-sm border border-border flex items-center gap-4 cursor-pointer hover:border-primary transition-all"
            >
              <div className={`${item.color} p-4 rounded-2xl`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-base">{item.title}</h4>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.category}</p>
              </div>
              <Star className="w-5 h-5 text-yellow-400" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recommendation Details Modal */}
      <AnimatePresence>
        {selectedRec && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRec(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`${selectedRec.color} p-5 rounded-[1.5rem]`}>
                  <selectedRec.icon className="w-8 h-8" />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedRec(null)}
                  className="rounded-full"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{selectedRec.category}</h4>
                  <h2 className="text-3xl font-black tracking-tight">{selectedRec.title}</h2>
                </div>

                <div className="flex items-center gap-6 py-6 border-y border-border/50">
                  <div className="text-center">
                    <div className="text-4xl font-black text-primary">{selectedRec.score}</div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Match Score</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedRec.score}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                    <p className="text-xs font-bold text-primary">Highly compatible with your gut profile</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                    {selectedRec.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRec.benefits.map((benefit: string) => (
                      <span key={benefit} className="px-3 py-1.5 bg-primary/5 text-primary rounded-xl text-xs font-bold">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 mt-4">
                  Add to Favorites
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
