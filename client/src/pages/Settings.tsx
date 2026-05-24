import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { Button } from "@/components/ui/button";
import { ChevronLeft, LogOut, User, Shield, Heart, AlertCircle, ChevronRight, HelpCircle, FileText, Lock, Camera } from "lucide-react";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
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
const languageOptions = [
  { value: "English", label: "English" },
  { value: "Bahasa Indonesia", label: "Bahasa Indonesia" },
  { value: "Spanish", label: "Español" },
  { value: "French", label: "Français" },
  { value: "German", label: "Deutsch" },
  { value: "Portuguese", label: "Português" },
  { value: "Arabic", label: "العربية" },
  { value: "Chinese", label: "中文 (简体)" },
  { value: "Japanese", label: "日本語" },
  { value: "Korean", label: "한국어" },
  { value: "Hindi", label: "हिन्दी" },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  if (!user) return <Redirect to="/" />;

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      toast({ title: "Please choose an image file" });
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = dataUrl;
      });
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const ratio = Math.max(size / img.width, size / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      const resized = canvas.toDataURL("image/jpeg", 0.85);
      await apiRequest("POST", "/api/user/avatar", { url: resized });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Profile picture updated" });
    } catch (err: any) {
      toast({ title: "Couldn't update picture", description: err?.message ?? "Try a smaller image" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUpdate = (field: string, value: any) => {
    updateProfile.mutate({ [field]: value });
  };

  const handleLogout = async () => {
    try {
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
    <div className="relative isolate min-h-screen pb-24 font-sans overflow-x-clip bg-[#FFFDF9]">
      <div aria-hidden className="pointer-events-none absolute -z-10 -top-32 -left-24 w-[26rem] h-[26rem] bg-teal-300/40 rounded-full blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -z-10 -top-20 -right-24 w-[24rem] h-[24rem] bg-coral-300/40 rounded-full blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[28%] -right-32 w-[22rem] h-[22rem] bg-teal-200/40 rounded-full blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[42%] -left-32 w-[24rem] h-[24rem] bg-coral-200/50 rounded-full blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[60%] right-[10%] w-[20rem] h-[20rem] bg-teal-200/45 rounded-full blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[78%] -left-20 w-[22rem] h-[22rem] bg-coral-300/45 rounded-full blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -z-10 -bottom-24 right-[20%] w-[24rem] h-[24rem] bg-coral-200/40 rounded-full blur-3xl" />

      <div aria-hidden className="pointer-events-none absolute -z-10 -bottom-40 left-1/4 w-[28rem] h-[28rem] bg-coral-100/50 rounded-full blur-3xl" />
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
          <div className="bg-white rounded-[2rem] border border-border/50 shadow-sm p-6 space-y-5">
            <div className="flex flex-col items-center gap-3 pb-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative group disabled:opacity-60"
                data-testid="button-change-avatar"
              >
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-primary/20"
                    data-testid="img-avatar-preview"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-white shadow-lg ring-2 ring-primary/20">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform">
                  <Camera className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarPick}
                data-testid="input-avatar-file"
              />
              <p className="text-xs text-muted-foreground font-medium">
                {uploading ? "Uploading..." : "Tap to change profile picture"}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-sm pl-1">Display Name</Label>
              <Input
                key={`fn-${profile?.id ?? "loading"}`}
                defaultValue={profile?.firstName || user.firstName || ""}
                className="rounded-2xl h-12 bg-muted/30 border-none font-bold"
                placeholder="Your name"
                onBlur={(e) => handleUpdate("firstName", e.target.value)}
                data-testid="input-display-name"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-sm pl-1">Username</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">@</span>
                <Input
                  key={`un-${profile?.id ?? "loading"}`}
                  defaultValue={(profile as any)?.username || ""}
                  placeholder="your_username"
                  className="rounded-2xl h-12 bg-muted/30 border-none font-bold pl-8"
                  onBlur={(e) => {
                    const cleaned = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                    e.target.value = cleaned;
                    if (cleaned) handleUpdate("username", cleaned);
                  }}
                  data-testid="input-username"
                />
              </div>
              <p className="text-[10px] text-muted-foreground pl-1">Lowercase letters, numbers, and underscores only</p>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-sm pl-1">Email Address</Label>
              <Input
                defaultValue={user.email || ""}
                className="rounded-2xl h-12 bg-muted/30 border-none font-bold opacity-60"
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
                  max={new Date().toISOString().split('T')[0]}
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
                {languageOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
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
            <Link href="/help">
              <div className="p-5 border-b border-border/50 hover:bg-muted/30 cursor-pointer font-bold text-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 text-teal-600" />
                  </div>
                  Help Center
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/privacy">
              <div className="p-5 border-b border-border/50 hover:bg-muted/30 cursor-pointer font-bold text-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Lock className="w-4 h-4 text-blue-600" />
                  </div>
                  Privacy Policy
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/terms">
              <div className="p-5 border-b border-border/50 hover:bg-muted/30 cursor-pointer font-bold text-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  Terms of Service
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link>

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

        <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">GutCare v1.0</p>
      </div>
    </div>
  );
}
