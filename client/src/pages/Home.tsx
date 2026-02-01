import { useAuth } from "@/hooks/use-auth";
import { useScans } from "@/hooks/use-scans";
import { useProfile } from "@/hooks/use-profile";
import { TotoAvatar } from "@/components/TotoAvatar";
import { Redirect, Link } from "wouter";
import { motion } from "framer-motion";
import { Scan, ArrowRight, Star, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { user } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: scans, isLoading: isScansLoading } = useScans(5); // Get recent 5

  if (isProfileLoading) return <div className="flex items-center justify-center min-h-screen"><TotoAvatar mood="thinking" /></div>;
  
  // New users need onboarding
  if (!profile || !profile.conditions || profile.conditions.length === 0) {
    return <Redirect to="/onboarding" />;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-12">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">{getGreeting()},</h1>
          <p className="text-xl text-foreground font-semibold">
            {profile.age ? `${user?.firstName || 'Friend'}` : 'Friend'}!
          </p>
        </div>
        <Link href="/profile">
          <div className="cursor-pointer">
            <TotoAvatar size="sm" mood="happy" />
          </div>
        </Link>
      </header>

      {/* Hero CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary rounded-3xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden mb-10"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold font-display mb-2">Feeling curious?</h2>
          <p className="text-primary-foreground/90 mb-6 max-w-[200px]">Scan a product to see if it's gut-friendly for you.</p>
          <Link href="/scan">
            <Button variant="secondary" className="rounded-full font-bold text-primary shadow-sm hover:bg-white">
              <Scan className="w-4 h-4 mr-2" />
              Scan Now
            </Button>
          </Link>
        </div>
        <img 
          src="https://pixabay.com/get/gc6db1b73c01012166b3054b82d4db9bffa6608032109163eb9dc34e9c087e7a4940ebcc5f30f1b82b8746a2e54777e03b599fddec37b88f95441c7e1c79b6332_1280.jpg" 
          alt="Healthy Food" 
          className="absolute bottom-[-20px] right-[-20px] w-32 h-32 object-cover rounded-full border-4 border-white/20 shadow-lg"
        />
        {/* Unsplash image of healthy food/ingredients to add texture */}
      </motion.div>

      {/* Recent Scans */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Recent Scans</h3>
          <Link href="/scans">
            <span className="text-sm text-primary font-medium cursor-pointer">View all</span>
          </Link>
        </div>

        {isScansLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1,2,3].map(i => <div key={i} className="w-40 h-48 bg-muted rounded-2xl animate-pulse flex-shrink-0" />)}
          </div>
        ) : scans && scans.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x pl-1">
            {scans.map((scan) => (
              <Link key={scan.id} href={`/scan/${scan.id}`}>
                <motion.div 
                  whileHover={{ y: -5 }}
                  className="bg-white p-3 rounded-2xl shadow-sm border border-border min-w-[160px] snap-start cursor-pointer flex flex-col h-full"
                >
                  <div className="relative mb-3 h-32 rounded-xl overflow-hidden bg-muted">
                    {scan.imageUrl ? (
                      <img src={scan.imageUrl} alt={scan.productName || "Product"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                    )}
                    <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-md
                      ${scan.grade === 'A' ? 'bg-green-500' : scan.grade === 'B' ? 'bg-lime-500' : scan.grade === 'C' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                      {scan.grade}
                    </div>
                  </div>
                  <h4 className="font-bold text-sm line-clamp-2 mb-1">{scan.productName || "Unknown Product"}</h4>
                  <div className="mt-auto flex items-center text-xs text-muted-foreground">
                    <span className="font-mono">{new Date(scan.createdAt!).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white/50 border border-dashed border-muted-foreground/30 rounded-2xl p-8 text-center">
            <p className="text-muted-foreground text-sm">No scans yet. Try scanning your first item!</p>
          </div>
        )}
      </section>

      {/* Tips / For You */}
      <section>
        <h3 className="text-lg font-bold mb-4">For Your Gut</h3>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-border flex items-start gap-4">
            <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">Avoid High Fodmap</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Since you listed IBS, try to avoid garlic and onions today.
              </p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-border flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">Probiotic Boost</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kefir is a great addition to your diet for SIBO management.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
