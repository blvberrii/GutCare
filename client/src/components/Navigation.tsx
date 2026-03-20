import { Link, useLocation } from "wouter";
import { Home, User, MessageCircle, Scan, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    {
      href: "/", icon: Home, label: "Home",
      isActive: (loc: string) => loc === "/",
    },
    {
      href: "/", icon: Search, label: "Search",
      isActive: (_loc: string) => false,
    },
    {
      href: "/chat", icon: MessageCircle, label: "Toto",
      isActive: (loc: string) => loc === "/chat",
    },
    {
      href: "/profile", icon: User, label: "Profile",
      isActive: (loc: string) => ["/profile", "/favorites", "/history"].includes(loc),
    },
  ];

  const hiddenPaths = ["/scan", "/onboarding", "/settings", "/favorites", "/history"];
  const isResultsPage = /^\/scan\/\d+/.test(location);
  const isHidden = !user || isResultsPage || hiddenPaths.some(path => location.startsWith(path));

  if (isHidden) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-black/5 pb-safe pt-2 px-6 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex justify-around items-end pb-4 max-w-md mx-auto">
          {navItems.map((item) => {
            const active = item.isActive(location);
            return (
              <Link key={item.label} href={item.href}>
                <div
                  className={`flex flex-col items-center gap-1 p-2 cursor-pointer transition-all duration-200 ${
                    active ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <item.icon className={`w-6 h-6 transition-all ${active ? "stroke-[2.5px] scale-110" : "stroke-2"}`} />
                  <span className={`text-[10px] font-bold transition-all ${active ? "opacity-100" : "opacity-60"}`}>
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="w-1.5 h-1.5 bg-primary rounded-full"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Floating Scan Button — shown on Home page */}
      {location === "/" && (
        <Link href="/scan">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="fixed bottom-24 right-5 z-50 bg-accent text-white p-4 rounded-full shadow-xl shadow-accent/30 cursor-pointer flex items-center justify-center w-16 h-16"
            data-testid="button-float-scan"
          >
            <Scan className="w-7 h-7" />
          </motion.div>
        </Link>
      )}
    </>
  );
}
