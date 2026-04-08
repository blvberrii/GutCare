import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useScans } from "@/hooks/use-scans";
import { Button } from "@/components/ui/button";
import { Settings, Edit2, ChevronRight, Bookmark, Star, User, Heart } from "lucide-react";
import { Redirect, Link } from "wouter";
import { motion } from "framer-motion";

function productInitialBg(name: string) {
  const G = ["bg-gradient-to-br from-teal-400 to-teal-600","bg-gradient-to-br from-coral-400 to-coral-600","bg-gradient-to-br from-violet-400 to-violet-600","bg-gradient-to-br from-amber-400 to-amber-600"];
  return G[(name.charCodeAt(0) || 0) % G.length];
}

export default function Profile() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: allScans } = useScans();

  if (!user) return <Redirect to="/" />;

  // Use firstName from profile (set during onboarding), fall back to Replit user info
  const displayName = profile?.firstName || user?.firstName || "Friend";
  const lastName = user?.lastName || "";

  const favoriteScans = (allScans || []).filter(s => s.isFavorite);
  const recentScans = (allScans || []).slice(0, 10);

  const age = profile?.dob
    ? new Date().getFullYear() - new Date(profile.dob).getFullYear()
    : null;

  // Grade color
  const gradeColor = (grade: string | null | undefined) => {
    if (!grade) return "bg-gray-400";
    return { A: "bg-emerald-500", B: "bg-lime-500", C: "bg-amber-500", D: "bg-orange-500", F: "bg-red-500" }[grade] || "bg-gray-400";
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-32">
      {/* Header */}
      <div className="bg-primary text-white pt-16 pb-20 px-6 relative overflow-hidden rounded-b-[3.5rem] shadow-2xl shadow-primary/20">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="absolute top-0 right-0 p-6 pt-12 z-10">
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" data-testid="button-settings">
              <Settings className="w-6 h-6" />
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center relative z-10">
          <div className="relative mb-5">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="Profile"
                className="w-28 h-28 rounded-full border-4 border-white shadow-2xl object-cover"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-white/20 border-4 border-white shadow-2xl flex items-center justify-center">
                <User className="w-14 h-14 text-white/70" />
              </div>
            )}
            <Link href="/settings">
              <div className="absolute bottom-1 right-1 bg-accent p-2 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <Edit2 className="w-3.5 h-3.5 text-white" />
              </div>
            </Link>
          </div>

          <h1 className="text-3xl font-black mb-2 text-center">
            {displayName} {lastName}
          </h1>

          <div className="flex items-center gap-3 text-sm font-bold bg-white/15 px-5 py-2 rounded-full backdrop-blur-sm">
            {age && <span>{age} yrs</span>}
            {age && profile?.gender && <div className="w-1.5 h-1.5 rounded-full bg-white/40" />}
            {profile?.gender && <span>{profile.gender}</span>}
            {!age && !profile?.gender && <span>Update your profile →</span>}
          </div>

          {/* Stats row */}
          <div className="flex gap-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-black">{recentScans.length}</div>
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Scans</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-black">{favoriteScans.length}</div>
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Saved</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-black">
                {recentScans.length > 0
                  ? (recentScans.find(s => s.grade === 'A')?.grade
                    || recentScans.find(s => s.grade === 'B')?.grade
                    || recentScans[0]?.grade
                    || "–")
                  : "–"}
              </div>
              <div className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Best Grade</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8 space-y-6 relative z-10">
        {/* Gut Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-7 shadow-xl shadow-primary/10 border border-black/5"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-xl">My Gut Profile</h3>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="text-primary font-bold text-xs hover:bg-primary/5 rounded-xl" data-testid="button-edit-profile">
                Edit <ChevronRight className="ml-0.5 w-3 h-3" />
              </Button>
            </Link>
          </div>

          <div className="space-y-6">
            <section>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Conditions</h4>
              <div className="flex flex-wrap gap-2">
                {profile?.conditions?.length ? profile.conditions.map(c => (
                  <span key={c} className="px-4 py-1.5 bg-primary/8 text-primary rounded-2xl text-sm font-bold border border-primary/15">
                    {c}
                  </span>
                )) : <span className="text-sm text-muted-foreground italic">None listed — add via settings</span>}
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Allergies</h4>
              <div className="flex flex-wrap gap-2">
                {profile?.allergies?.length ? profile.allergies.map(a => (
                  <span key={a} className="px-4 py-1.5 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
                    {a}
                  </span>
                )) : <span className="text-sm text-muted-foreground italic">None listed</span>}
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Symptoms</h4>
              <div className="flex flex-wrap gap-2">
                {profile?.symptoms?.length ? profile.symptoms.map(s => (
                  <span key={s} className="px-4 py-1.5 bg-amber-50 text-amber-700 rounded-2xl text-sm font-bold border border-amber-100">
                    {s}
                  </span>
                )) : <span className="text-sm text-muted-foreground italic">None listed</span>}
              </div>
            </section>
          </div>
        </motion.div>

        {/* Collections */}
        <section>
          <h3 className="font-black text-xl px-1 mb-4">Collections</h3>
          <div className="bg-white rounded-[2.5rem] border border-black/5 shadow-sm overflow-hidden divide-y divide-black/5">
            <Link href="/favorites">
              <div className="flex items-center gap-4 p-5 hover:bg-primary/3 transition-colors cursor-pointer group" data-testid="link-favorites">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Bookmark className="w-5 h-5 fill-current" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-base">Favorites</h4>
                  <p className="text-xs font-medium text-muted-foreground">
                    {favoriteScans.length > 0 ? `${favoriteScans.length} saved products` : "No favorites yet"}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
            </Link>

            <Link href="/history">
              <div className="flex items-center gap-4 p-5 hover:bg-primary/3 transition-colors cursor-pointer group" data-testid="link-history">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-base">Previously Reviewed</h4>
                  <p className="text-xs font-medium text-muted-foreground">
                    {recentScans.length > 0 ? `${recentScans.length} products analyzed` : "Scan your first product!"}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </div>
        </section>

        {/* Recent Activity Preview */}
        {recentScans.length > 0 && (
          <section>
            <div className="flex items-center justify-between px-1 mb-4">
              <h3 className="font-black text-xl">Recent Scans</h3>
              <Link href="/history">
                <span className="text-xs font-black text-primary uppercase tracking-widest">See all</span>
              </Link>
            </div>
            <div className="space-y-3">
              {recentScans.slice(0, 3).map((scan) => (
                <Link key={scan.id} href={`/scan/${scan.id}`}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="bg-white rounded-2xl border border-black/5 p-4 flex items-center gap-4 shadow-sm cursor-pointer hover:border-primary/20 transition-all"
                    data-testid={`card-scan-${scan.id}`}
                  >
                    <div className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ${scan.imageUrl ? "bg-white p-1" : productInitialBg(scan.productName || "?")}`}>
                      {scan.imageUrl ? (
                        <img src={scan.imageUrl} alt={scan.productName || ""} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white font-black text-sm">{(scan.productName || "?")[0]?.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{scan.productName || "Unknown Product"}</h4>
                      <p className="text-xs text-muted-foreground">Score: {scan.score}/100</p>
                    </div>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm ${gradeColor(scan.grade)}`}>
                      {scan.grade || "?"}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
