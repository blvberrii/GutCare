import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { TotoAvatar } from "@/components/TotoAvatar";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, ShieldCheck, Smile } from "lucide-react";
import { Redirect } from "wouter";

export default function Landing() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Redirect to="/" />;

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

      <main className="flex-1 container mx-auto px-6 py-12 flex flex-col items-center justify-center text-center z-10">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-8"
        >
          <TotoAvatar size="xl" mood="excited" />
        </motion.div>

        <motion.h1 
          className="text-5xl md:text-6xl font-bold text-primary mb-4 font-display"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          GutCheck
        </motion.h1>

        <motion.p 
          className="text-lg md:text-xl text-muted-foreground max-w-md mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your friendly guide to a happier belly. Scan products, get grades, and feel great.
        </motion.p>

        <motion.div 
          className="grid gap-4 w-full max-w-xs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            size="lg" 
            onClick={handleLogin}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <p className="text-xs text-muted-foreground mt-4">
            Join thousands of happy guts today!
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full">
          {[
            { icon: ShieldCheck, title: "Smart Scanning", desc: "Instantly know if food is safe for you" },
            { icon: Leaf, title: "Clean Alternatives", desc: "Find better options automatically" },
            { icon: Smile, title: "AI Companion", desc: "Chat with Toto about your health" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + (i * 0.1) }}
            >
              <div className="w-12 h-12 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
