import { useAuth } from "@/hooks/use-auth";
import { useScans } from "@/hooks/use-scans";
import { useProfile } from "@/hooks/use-profile";
import { TotoAvatar } from "@/components/TotoAvatar";
import { Redirect, Link } from "wouter";
import { motion } from "framer-motion";
import { Scan, Star, ShoppingBag, Carrot, Soup } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: scans, isLoading: isScansLoading } = useScans(5);

  if (isProfileLoading) return <div className="flex items-center justify-center min-h-screen"><TotoAvatar mood="thinking" /></div>;
  if (!profile || !profile.conditions || profile.conditions.length === 0) return <Redirect to="/onboarding" />;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const recommendations = [
    { title: "Grass-fed Ghee", category: "Cooking Oil", icon: Carrot, color: "bg-orange-100 text-orange-600" },
    { title: "Kefir Water", category: "Probiotic", icon: Soup, color: "bg-blue-100 text-blue-600" },
    { title: "Bone Broth", category: "Supplement", icon: ShoppingBag, color: "bg-primary/10 text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background pb-32 px-6 pt-12">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-primary">{getGreeting()},</h1>
          <p className="text-xl font-bold opacity-80">{user?.firstName || 'Friend'}!</p>
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
    </div>
  );
}
