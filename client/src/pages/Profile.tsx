import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { TotoAvatar } from "@/components/TotoAvatar";
import { Settings, LogOut, Edit2 } from "lucide-react";
import { Redirect } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: profile } = useProfile();

  if (!user) return <Redirect to="/" />;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary text-white pt-12 pb-24 px-6 relative overflow-hidden rounded-b-[3rem]">
        <div className="absolute top-0 right-0 p-6">
           <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => logout()}>
             <LogOut className="w-5 h-5" />
           </Button>
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
          <h1 className="text-2xl font-display font-bold">{user.firstName} {user.lastName}</h1>
          <p className="opacity-80 text-sm">Member since {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-6 -mt-12 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-primary/10 flex justify-around">
          <div className="text-center">
            <span className="block text-2xl font-bold text-primary">12</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Scans</span>
          </div>
          <div className="w-[1px] bg-border" />
          <div className="text-center">
            <span className="block text-2xl font-bold text-primary">4</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Safe</span>
          </div>
          <div className="w-[1px] bg-border" />
          <div className="text-center">
            <span className="block text-2xl font-bold text-accent">2</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-bold">Avoid</span>
          </div>
        </div>
      </div>

      {/* Gut Profile */}
      <div className="px-6 space-y-6">
        <section>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">My Gut Profile</h3>
            <Button variant="ghost" size="sm" className="text-primary text-xs h-auto p-0 hover:bg-transparent">Edit</Button>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-border shadow-sm space-y-4">
            <div>
               <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Conditions</h4>
               <div className="flex flex-wrap gap-2">
                 {profile?.conditions?.map(c => (
                   <span key={c} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-100">
                     {c}
                   </span>
                 ))}
               </div>
            </div>
            
            <div>
               <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Allergies</h4>
               <div className="flex flex-wrap gap-2">
                 {profile?.allergies?.map(a => (
                   <span key={a} className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
                     {a}
                   </span>
                 ))}
                 {!profile?.allergies?.length && <span className="text-sm text-muted-foreground italic">None listed</span>}
               </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-bold text-lg mb-3">Settings</h3>
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
             {[
               "Notifications",
               "Privacy Policy",
               "Support",
               "About GutCheck"
             ].map((item, i) => (
               <div key={item} className={`p-4 flex justify-between items-center cursor-pointer hover:bg-muted/50 ${i !== 3 ? 'border-b border-border' : ''}`}>
                 <span className="font-medium">{item}</span>
                 <Settings className="w-4 h-4 text-muted-foreground" />
               </div>
             ))}
          </div>
        </section>
      </div>
    </div>
  );
}
