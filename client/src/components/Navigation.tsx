import { Link, useLocation } from "wouter";
import { Home, User, MessageCircle, Scan } from "lucide-react";
import { motion } from "framer-motion";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/chat", icon: MessageCircle, label: "Toto" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  // Only show nav on main pages
  if (["/", "/chat", "/profile"].indexOf(location) === -1 && !location.startsWith("/scan")) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-secondary/20 pb-safe pt-2 px-6 z-50">
        <div className="flex justify-around items-end pb-4 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex flex-col items-center gap-1 p-2 cursor-pointer transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"}`}>
                  <item.icon className={`w-6 h-6 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
                  <span className="text-[10px] font-bold">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="nav-dot" 
                      className="w-1 h-1 bg-primary rounded-full mt-1" 
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Floating Scan Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <Link href="/scan">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-accent text-white p-4 rounded-full shadow-lg shadow-accent/30 cursor-pointer flex items-center justify-center w-16 h-16"
          >
            <Scan className="w-8 h-8" />
          </motion.div>
        </Link>
      </div>
    </>
  );
}
