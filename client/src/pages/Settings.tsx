import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { ChevronLeft, LogOut, User, Shield, Heart } from "lucide-react";
import { Link, Redirect } from "wouter";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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

  const toggleArray = (field: "conditions" | "allergies" | "symptoms", item: string) => {
    const current = profile?.[field] || [];
    const next = current.includes(item) 
      ? current.filter(i => i !== item)
      : [...current, item];
    handleUpdate(field, next);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 flex items-center bg-white border-b sticky top-0 z-10">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="ml-2 text-xl font-bold">Settings</h1>
      </header>

      <div className="p-6 space-y-8 max-w-md mx-auto">
        {/* Account Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <User className="w-3 h-3" /> Account
          </h2>
          <div className="bg-white rounded-2xl border border-border shadow-sm p-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input 
                defaultValue={`${user.firstName} ${user.lastName}`} 
                className="rounded-xl"
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input 
                defaultValue={user.email || ""} 
                className="rounded-xl"
                readOnly
              />
            </div>
          </div>
        </section>

        {/* Health Profile Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-3 h-3" /> Health Profile
          </h2>
          <div className="bg-white rounded-2xl border border-border shadow-sm p-4 space-y-6">
            <div>
              <Label className="mb-3 block">Conditions</Label>
              <div className="flex flex-wrap gap-2">
                {conditionsList.map(item => (
                  <button
                    key={item}
                    onClick={() => toggleArray("conditions", item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      profile?.conditions?.includes(item)
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Allergies</Label>
              <div className="flex flex-wrap gap-2">
                {allergiesList.map(item => (
                  <button
                    key={item}
                    onClick={() => toggleArray("allergies", item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      profile?.allergies?.includes(item)
                        ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label>Age</Label>
                <Input 
                  type="number" 
                  defaultValue={profile?.age || 0}
                  onBlur={(e) => handleUpdate("age", parseInt(e.target.value))}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <select 
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm"
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
          </div>
        </section>

        {/* Support & Legal */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Heart className="w-3 h-3" /> Support & Legal
          </h2>
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border hover:bg-muted/50 cursor-pointer font-medium text-sm">Help Center</div>
            <div className="p-4 border-b border-border hover:bg-muted/50 cursor-pointer font-medium text-sm">Privacy Policy</div>
            <div className="p-4 hover:bg-muted/50 cursor-pointer font-medium text-sm text-red-500 flex items-center gap-2" onClick={() => logout()}>
              <LogOut className="w-4 h-4" /> Log Out
            </div>
          </div>
        </section>

        <p className="text-center text-[10px] text-muted-foreground">Version 1.0.0 (Build 2026)</p>
      </div>
    </div>
  );
}
