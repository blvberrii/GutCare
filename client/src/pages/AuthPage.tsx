import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TotoAvatar } from "@/components/TotoAvatar";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Lock, Smile, ArrowLeft, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type RegisterForm = z.infer<typeof registerSchema>;
type LoginForm = z.infer<typeof loginSchema>;

export default function AuthPage({ initialTab = "register" }: { initialTab?: "login" | "register" }) {
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", confirmPassword: "" },
  });

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<{ username?: string; password?: string }>({});

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) =>
      apiRequest("POST", "/api/auth/register", {
        username: data.username,
        password: data.password,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      navigate("/onboarding");
    },
    onError: (err: any) => {
      const raw = String(err?.message || "");
      const jsonStart = raw.indexOf("{");
      let message = "Registration failed";
      if (jsonStart >= 0) {
        try { message = JSON.parse(raw.slice(jsonStart)).message || message; } catch {}
      } else if (raw) {
        message = raw;
      }
      toast({ title: message, variant: "destructive" });
    },
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usernameEl = document.getElementById("login-username") as HTMLInputElement | null;
    const passwordEl = document.getElementById("login-password") as HTMLInputElement | null;
    const username = (loginUsername || usernameEl?.value || "").trim();
    const password = loginPassword || passwordEl?.value || "";
    const errors: { username?: string; password?: string } = {};
    if (!username) errors.username = "Username is required";
    if (!password) errors.password = "Password is required";
    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;
    loginMutation.mutate({ username, password });
  };

  const loginMutation = useMutation({
    mutationFn: (data: LoginForm) =>
      apiRequest("POST", "/api/auth/login", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      navigate("/home");
    },
    onError: async (err: any) => {
      const body = await err.json?.().catch(() => ({ message: "Login failed" }));
      toast({ title: body.message || "Login failed", variant: "destructive" });
    },
  });

  return (
    <div className="relative isolate min-h-[100dvh] sm:min-h-screen bg-[#FFFDF9] flex flex-col overflow-x-clip">
      {/* Scattered ambient gradient blobs */}
      <div aria-hidden className="pointer-events-none absolute -z-10 -top-32 -left-24 w-[32rem] h-[32rem] bg-teal-300/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="pointer-events-none absolute -z-10 -top-20 -right-32 w-[30rem] h-[30rem] bg-coral-300/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[8%] left-[35%] w-[22rem] h-[22rem] bg-coral-200/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[18%] -left-40 w-[28rem] h-[28rem] bg-coral-200/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[22%] right-[20%] w-[24rem] h-[24rem] bg-teal-200/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[34%] left-[42%] w-[26rem] h-[26rem] bg-teal-300/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[42%] -left-24 w-[28rem] h-[28rem] bg-teal-200/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[48%] right-[10%] w-[26rem] h-[26rem] bg-coral-200/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[56%] left-[30%] w-[24rem] h-[24rem] bg-coral-300/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[62%] -right-24 w-[28rem] h-[28rem] bg-teal-200/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[72%] left-[12%] w-[26rem] h-[26rem] bg-coral-300/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[80%] right-[35%] w-[24rem] h-[24rem] bg-teal-300/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="pointer-events-none absolute -z-10 top-[88%] -left-20 w-[28rem] h-[28rem] bg-coral-200/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="pointer-events-none absolute -z-10 -bottom-24 right-[15%] w-[28rem] h-[28rem] bg-teal-200/55 rounded-full blur-[110px] md:blur-[200px] md:scale-[1.6]" />

      {/* Desktop-only center blobs */}
      <div aria-hidden className="hidden md:block pointer-events-none absolute -z-10 top-[12%] left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-coral-200/55 rounded-full blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="hidden md:block pointer-events-none absolute -z-10 top-[28%] left-[45%] w-[30rem] h-[30rem] bg-teal-300/55 rounded-full blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="hidden md:block pointer-events-none absolute -z-10 top-[44%] left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] bg-coral-300/55 rounded-full blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="hidden md:block pointer-events-none absolute -z-10 top-[58%] left-[40%] w-[30rem] h-[30rem] bg-teal-200/55 rounded-full blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="hidden md:block pointer-events-none absolute -z-10 top-[72%] left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-coral-200/55 rounded-full blur-[200px] md:scale-[1.6]" />
      <div aria-hidden className="hidden md:block pointer-events-none absolute -z-10 top-[86%] left-[48%] w-[28rem] h-[28rem] bg-teal-300/55 rounded-full blur-[200px] md:scale-[1.6]" />
      {/* Back to home */}
      <div className="px-3 pt-2 pb-0 sm:p-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground h-8">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-1 pb-3 sm:py-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-1 sm:gap-3 mb-3 sm:mb-10"
        >
          <div className="hidden sm:block ring-4 ring-white shadow-xl rounded-full"><TotoAvatar size="xl" mood="happy" /></div>
          <div className="sm:hidden ring-4 ring-white shadow-xl rounded-full"><TotoAvatar size="lg" mood="happy" /></div>
          <div className="text-center">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-teal-700">GutCare</h1>
            <p className="hidden sm:block text-sm text-muted-foreground mt-1">Your personal gut health companion</p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden"
        >
          {/* Tab switcher */}
          <div className="flex border-b border-black/5">
            {(["register", "login"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                data-testid={`tab-${t}`}
                className={`flex-1 py-3 sm:py-4 text-sm font-black transition-colors ${
                  tab === t
                    ? "text-teal-700 border-b-2 border-teal-600"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "login" ? "Log In" : "Get Started"}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {/* Social sign-in */}
            <div className="space-y-2 sm:space-y-2.5 mb-3 sm:mb-5">
              <a
                href="/api/auth/replit"
                data-testid="button-google-oauth"
                className="flex items-center justify-center gap-3 w-full py-2.5 sm:py-3 rounded-xl border border-black/10 bg-white hover:bg-gray-50 transition-colors text-sm font-bold text-gray-800"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </a>
              <a
                href="/api/auth/replit"
                data-testid="button-apple-oauth"
                className="flex items-center justify-center gap-3 w-full py-2.5 sm:py-3 rounded-xl bg-black hover:bg-gray-900 transition-colors text-sm font-bold text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </a>
              <a
                href="/api/auth/replit"
                data-testid="button-email-oauth"
                className="flex items-center justify-center gap-3 w-full py-2.5 sm:py-3 rounded-xl border border-black/10 bg-white hover:bg-gray-50 transition-colors text-sm font-bold text-gray-800"
              >
                <Mail className="w-[18px] h-[18px] text-teal-600" />
                Continue with Email
              </a>
            </div>

            <div className="flex items-center gap-3 mb-3 sm:mb-5">
              <div className="flex-1 h-px bg-black/10" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">or</span>
              <div className="flex-1 h-px bg-black/10" />
            </div>

            <AnimatePresence mode="wait">
              {tab === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-3"
                >
                  <div>
                    <Label htmlFor="login-username" className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                      Username
                    </Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-username"
                        data-testid="input-login-username"
                        placeholder="your_username"
                        className="pl-10 rounded-xl"
                        autoComplete="username"
                        value={loginUsername}
                        onChange={(e) => {
                          setLoginUsername(e.target.value);
                          if (loginErrors.username) setLoginErrors((p) => ({ ...p, username: undefined }));
                        }}
                      />
                    </div>
                    {loginErrors.username && (
                      <p className="text-xs text-red-500 mt-1">{loginErrors.username}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="login-password" className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                      Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        data-testid="input-login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 rounded-xl"
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => {
                          setLoginPassword(e.target.value);
                          if (loginErrors.password) setLoginErrors((p) => ({ ...p, password: undefined }));
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginErrors.password && (
                      <p className="text-xs text-red-500 mt-1">{loginErrors.password}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    data-testid="button-login-submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black py-4 sm:py-5"
                  >
                    {loginMutation.isPending ? "Signing in…" : "Sign In"}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    No account?{" "}
                    <button type="button" onClick={() => setTab("register")} className="text-teal-600 font-black hover:underline">
                      Create one
                    </button>
                  </p>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={registerForm.handleSubmit((d) => registerMutation.mutate(d))}
                  className="space-y-3"
                >
                  <div>
                    <Label htmlFor="reg-username" className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                      Username
                    </Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-username"
                        data-testid="input-reg-username"
                        placeholder="e.g. sarah_healthy"
                        className="pl-10 rounded-xl"
                        {...registerForm.register("username")}
                      />
                    </div>
                    {registerForm.formState.errors.username && (
                      <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="reg-password" className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                      Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-password"
                        data-testid="input-reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        className="pl-10 pr-10 rounded-xl"
                        {...registerForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.password && (
                      <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="reg-confirm" className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                      Confirm Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-confirm"
                        data-testid="input-reg-confirm"
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter password"
                        className="pl-10 pr-10 rounded-xl"
                        {...registerForm.register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    data-testid="button-register-submit"
                    disabled={registerMutation.isPending}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black py-4 sm:py-5"
                  >
                    {registerMutation.isPending ? "Creating account…" : "Create Account"}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setTab("login")} className="text-teal-600 font-black hover:underline">
                      Sign in
                    </button>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
