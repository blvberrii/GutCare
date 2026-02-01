import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Edit2, ChevronRight } from "lucide-react";
import { Redirect, Link } from "wouter";

export default function Profile() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  if (!user) return <Redirect to="/" />;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-white pt-12 pb-24 px-6 relative overflow-hidden rounded-b-[3rem]">
        <div className="absolute top-0 right-0 p-6">
           <Link href="/settings">
             <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
               <Settings className="w-6 h-6" />
             </Button>
           </Link>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mb-4">
             {user.profileImageUrl ? (
               <img src={user.profileImageUrl} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow-xl" />
             ) : (
               <div className="w-24 h-24 rounded-full bg-secondary border-4 border-white shadow-xl flex items-center justify-center text-2xl font-bold">
                 {user.firstName?.[0]}{user.lastName?.[0]}
               </div>
             )}
             <div className="absolute bottom-0 right-0 bg-accent p-1.5 rounded-full border-2 border-white shadow-sm">
               <Edit2 className="w-3 h-3 text-white" />
             </div>
          </div>
          <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
          <div className="flex items-center gap-2 mt-1 opacity-80 text-sm">
            <span>{profile?.age} years old</span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span>{profile?.gender}</span>
          </div>
        </div>
      </div>

      {/* Gut Profile Section */}
      <div className="px-6 -mt-10 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-primary/10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">My Gut Profile</h3>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="text-primary text-xs h-auto p-0 hover:bg-transparent">
                Edit <ChevronRight className="ml-1 w-3 h-3" />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-6">
            <section>
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Conditions</h4>
              <div className="flex flex-wrap gap-2">
                {profile?.conditions?.map(c => (
                  <span key={c} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                    {c}
                  </span>
                ))}
                {!profile?.conditions?.length && <span className="text-sm text-muted-foreground italic">No conditions listed</span>}
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Allergies</h4>
              <div className="flex flex-wrap gap-2">
                {profile?.allergies?.map(a => (
                  <span key={a} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                    {a}
                  </span>
                ))}
                {!profile?.allergies?.length && <span className="text-sm text-muted-foreground italic">None listed</span>}
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Symptoms</h4>
              <div className="flex flex-wrap gap-2">
                {profile?.symptoms?.map(s => (
                  <span key={s} className="px-3 py-1 bg-secondary/10 text-secondary-foreground rounded-lg text-sm font-medium">
                    {s}
                  </span>
                ))}
                {!profile?.symptoms?.length && <span className="text-sm text-muted-foreground italic">None listed</span>}
              </div>
            </section>
          </div>
        </div>

        {/* Collections */}
        <section>
          <h3 className="font-bold text-lg mb-4">My Collections</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center gap-2 aspect-square cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <span className="font-bold text-sm">Saved</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-border shadow-sm flex flex-col items-center justify-center gap-2 aspect-square cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <span className="font-bold text-sm">Liked</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

import { Star, Heart } from "lucide-react";
