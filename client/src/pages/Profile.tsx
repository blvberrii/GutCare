import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Settings, Edit2, ChevronRight, Bookmark, Heart, Star } from "lucide-react";
import { Redirect, Link } from "wouter";

export default function Profile() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  if (!user) return <Redirect to="/" />;

  const displayName = profile?.firstName || user.firstName;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-primary text-white pt-16 pb-20 px-6 relative overflow-hidden rounded-b-[3.5rem] shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 p-6 pt-12">
           <Link href="/settings">
             <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
               <Settings className="w-6 h-6" />
             </Button>
           </Link>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-6">
             {user.profileImageUrl ? (
               <img src={user.profileImageUrl} alt="Profile" className="w-28 h-28 rounded-full border-4 border-white shadow-2xl object-cover" />
             ) : (
               <div className="w-28 h-28 rounded-full bg-[#E0F2F1] border-4 border-white shadow-2xl flex items-center justify-center text-primary">
                 <User className="w-14 h-14" />
               </div>
             )}
             <div className="absolute bottom-1 right-1 bg-accent p-2 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
               <Edit2 className="w-4 h-4 text-white" />
             </div>
          </div>
          <h1 className="text-3xl font-black mb-1">{displayName} {user.lastName}</h1>
          <div className="flex items-center gap-3 opacity-90 text-sm font-bold bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm">
            <span>{profile?.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : '?'} yrs</span>
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span>{profile?.gender}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 -mt-8 space-y-8 relative z-10">
        {/* Gut Profile Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/10 border border-border/50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xl tracking-tight text-foreground/90">My Gut Profile</h3>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="text-primary font-bold text-xs hover:bg-primary/5 rounded-xl">
                Edit Details <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-8">
            <section>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Conditions</h4>
              <div className="flex flex-wrap gap-2.5">
                {profile?.conditions?.map(c => (
                  <span key={c} className="px-4 py-2 bg-primary/5 text-primary rounded-2xl text-sm font-bold border border-primary/10">
                    {c}
                  </span>
                ))}
                {!profile?.conditions?.length && <span className="text-sm text-muted-foreground italic font-medium">None listed</span>}
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Allergies</h4>
              <div className="flex flex-wrap gap-2.5">
                {profile?.allergies?.map(a => (
                  <span key={a} className="px-4 py-2 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
                    {a}
                  </span>
                ))}
                {!profile?.allergies?.length && <span className="text-sm text-muted-foreground italic font-medium">None listed</span>}
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Symptoms</h4>
              <div className="flex flex-wrap gap-2.5">
                {profile?.symptoms?.map(s => (
                  <span key={s} className="px-4 py-2 bg-secondary/5 text-secondary-foreground rounded-2xl text-sm font-bold border border-secondary/10">
                    {s}
                  </span>
                ))}
                {!profile?.symptoms?.length && <span className="text-sm text-muted-foreground italic font-medium">None listed</span>}
              </div>
            </section>
          </div>
        </div>

        {/* Collections - List Style */}
        <section className="space-y-4">
          <h3 className="font-black text-xl px-2 tracking-tight text-foreground/90">Collections</h3>
          <div className="bg-white rounded-[2.5rem] border border-border/50 shadow-sm overflow-hidden divide-y divide-border/50">
            <div className="flex items-center gap-4 p-5 hover:bg-muted/30 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Bookmark className="w-6 h-6 fill-current" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-base">Favorites</h4>
                <p className="text-xs font-bold text-muted-foreground">Items you want to try</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <div className="flex items-center gap-4 p-5 hover:bg-muted/30 transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-base">Previously Reviewed Items</h4>
                <p className="text-xs font-bold text-muted-foreground">Your gut-friendly favorites</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
