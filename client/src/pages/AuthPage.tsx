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
import { Eye, EyeOff, User, Lock, Smile, ArrowLeft } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

const registerSchema = z.object({
  firstName: z.string().min(1, "Display name is required").max(50),
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

export default function AuthPage({ initialTab = "login" }: { initialTab?: "login" | "register" }) {
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: "", username: "", password: "", confirmPassword: "" },
  });

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) =>
      apiRequest("POST", "/api/auth/register", {
        username: data.username,
        firstName: data.firstName,
        password: data.password,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      navigate("/onboarding");
    },
    onError: async (err: any) => {
      const body = await err.json?.().catch(() => ({ message: "Registration failed" }));
      toast({ title: body.message || "Registration failed", variant: "destructive" });
    },
  });

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
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col">
      {/* Back to home */}
      <div className="p-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-3 mb-10"
        >
          <TotoAvatar size="lg" mood="happy" />
          <div className="text-center">
            <h1 className="font-display font-bold text-3xl text-teal-700">GutCare</h1>
            <p className="text-sm text-muted-foreground mt-1">Your personal gut health companion</p>
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
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                data-testid={`tab-${t}`}
                className={`flex-1 py-4 text-sm font-black transition-colors ${
                  tab === t
                    ? "text-teal-700 border-b-2 border-teal-600"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "login" ? "Log In" : "Get Started"}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {tab === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={loginForm.handleSubmit((d) => loginMutation.mutate(d))}
                  className="space-y-4"
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
                        {...loginForm.register("username")}
                      />
                    </div>
                    {loginForm.formState.errors.username && (
                      <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.username.message}</p>
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
                        {...loginForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-red-500 mt-1">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    data-testid="button-login-submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black py-5"
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
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="reg-firstName" className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                      Display Name
                    </Label>
                    <div className="relative mt-1.5">
                      <Smile className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-firstName"
                        data-testid="input-reg-firstname"
                        placeholder="e.g. Fiona"
                        className="pl-10 rounded-xl"
                        {...registerForm.register("firstName")}
                      />
                    </div>
                    {registerForm.formState.errors.firstName && (
                      <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="reg-username" className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                      Username
                    </Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reg-username"
                        data-testid="input-reg-username"
                        placeholder="e.g. fiona_gut"
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
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black py-5"
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
