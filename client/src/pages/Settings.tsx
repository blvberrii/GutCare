import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { ChevronLeft, LogOut, User, Shield, Heart, AlertCircle } from "lucide-react";
import { Link, Redirect } from "wouter";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const conditionsList = ["IBS", "SIBO", "Crohn's", "Celiac", "Lactose Intolerance", "GERD"];
const symptomsList = ["Bloating", "Fatigue", "Brain Fog", "Skin Issues", "Stomach Pain"];
const allergiesList = ["Gluten", "Dairy", "Nuts", "Soy", "Eggs", "Shellfish"];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  if (!user) return <Redirect to="/" />;

  const handleUpdate = (field: string, value: any) => {
    updateProfile.mutate({ [field]: value });
  };

  const handleLogout = async () => {
    try {
      // Clear profile to trigger re-onboarding on next login
      await apiRequest("DELETE", "/api/profile");
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      logout();
    } catch (e) {
      console.error("Failed to reset profile", e);
      logout();
    }
  };

  const toggleArray = (field: "conditions" | "allergies" | "symptoms", item: string) => {
    const current = profile?.[field] || [];
    const next = current.includes(item) 
      ? current.filter(i => i !== item)
      : [...current, item];
    handleUpdate(field, next);
  };

  return (
    <div className="min-h-screen bg-background pb-24 font-sans">
      <header className="p-6 pt-12 flex items-center bg-white border-b sticky top-0 z-10">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-7 h-7" />
          </Button>
        </Link>
        <h1 className="ml-3 text-2xl font-black tracking-tight">Settings</h1>
      </header>

      <div className="p-6 space-y-10 max-w-md mx-auto">
        {/* Account Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
            <User className="w-3 h-3" /> Account Details
          </h2>
          <div className="bg-white rounded-[2rem] border border-border/50 shadow-sm p-6 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-sm pl-1">Name</Label>
              <Input 
                defaultValue={`${user.firstName} ${user.lastName}`} 
                className="rounded-2xl h-12 bg-muted/30 border-none font-bold"
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-sm pl-1">Email Address</Label>
              <Input 
                defaultValue={user.email || ""} 
                className="rounded-2xl h-12 bg-muted/30 border-none font-bold"
                readOnly
              />
            </div>
          </div>
        </section>

        {/* Health Profile Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
            <Shield className="w-3 h-3" /> Health Profile
          </h2>
          <div className="bg-white rounded-[2rem] border border-border/50 shadow-sm p-6 space-y-8">
            <div>
              <Label className="mb-4 block font-bold text-sm pl-1">Conditions</Label>
              <div className="flex flex-wrap gap-2.5">
                {conditionsList.map(item => (
                  <button
                    key={item}
                    onClick={() => toggleArray("conditions", item)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition-all active:scale-95 ${
                      profile?.conditions?.includes(item)
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-4 block font-bold text-sm pl-1">Allergies</Label>
              <div className="flex flex-wrap gap-2.5">
                {allergiesList.map(item => (
                  <button
                    key={item}
                    onClick={() => toggleArray("allergies", item)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition-all active:scale-95 ${
                      profile?.allergies?.includes(item)
                        ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <Label className="font-bold text-sm pl-1">DOB</Label>
                <Input 
                  type="date" 
                  defaultValue={profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : ""}
                  onBlur={(e) => handleUpdate("dob", e.target.value ? new Date(e.target.value) : null)}
                  className="rounded-2xl h-12 bg-muted/30 border-none font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-sm pl-1">Gender</Label>
                <select 
                  className="w-full h-12 px-4 rounded-2xl bg-muted/30 border-none font-bold text-sm appearance-none"
                  value={profile?.gender || ""}
                  onChange={(e) => handleUpdate("gender", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Neither">Neither</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm pl-1">Language</Label>
              <select 
                className="w-full h-12 px-4 rounded-2xl bg-muted/30 border-none font-bold text-sm appearance-none"
                value={profile?.language || "English"}
                onChange={(e) => handleUpdate("language", e.target.value)}
              >
                <option value="English">English</option>
                <option value="Bahasa Indonesia">Bahasa Indonesia</option>
              </select>
            </div>
          </div>
        </section>

        {/* Support & Legal */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
            <Heart className="w-3 h-3" /> Support & Legal
          </h2>
          <div className="bg-white rounded-[2rem] border border-border/50 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/50 hover:bg-muted/30 cursor-pointer font-bold text-sm">Help Center</div>
            <div className="p-5 border-b border-border/50 hover:bg-muted/30 cursor-pointer font-bold text-sm">Privacy Policy</div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div className="p-5 hover:bg-red-50 cursor-pointer font-black text-sm text-red-500 flex items-center gap-2 transition-colors">
                  <LogOut className="w-4 h-4" /> Log Out
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[2.5rem] p-8 border-none shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-2xl text-red-500">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    Log Out?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-base font-medium pt-2">
                    Are you sure you want to log out? You'll need to sign back in to see your scans and profile.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-6 gap-3">
                  <AlertDialogCancel className="rounded-full h-14 font-bold border-muted">Stay Logged In</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="rounded-full h-14 font-black bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20">Yes, Log Out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>

        <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">GutCheck v1.0</p>
      </div>
    </div>
  );
}
