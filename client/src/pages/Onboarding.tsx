import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserProfileSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { Redirect, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TotoAvatar } from "@/components/TotoAvatar";

const conditionsList = ["IBS", "SIBO", "Crohn's", "Celiac", "Lactose Intolerance", "GERD"];
const symptomsList = ["Bloating", "Fatigue", "Brain Fog", "Skin Issues", "Stomach Pain"];
const allergiesList = ["Gluten", "Dairy", "Nuts", "Soy", "Eggs", "Shellfish"];

type FormData = z.infer<typeof insertUserProfileSchema>;

export default function Onboarding() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);

  if (profile && profile.conditions && profile.conditions.length > 0) {
    return <Redirect to="/" />;
  }

  const form = useForm<FormData>({
    resolver: zodResolver(insertUserProfileSchema),
    defaultValues: {
      userId: user?.id,
      age: 0,
      gender: "",
      conditions: [],
      symptoms: [],
      allergies: [],
      struggles: [],
    }
  });

  const steps = [
    {
      title: "Tell us about you",
      subtitle: "Let's get to know each other!",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>How old are you?</Label>
            <Input type="number" {...form.register("age", { valueAsNumber: true })} className="rounded-2xl h-14 bg-white border-2 border-primary/10 focus:border-primary transition-all text-lg font-bold" placeholder="e.g. 28" />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <div className="grid grid-cols-3 gap-3">
              {["Female", "Male", "Neither"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => form.setValue("gender", g)}
                  className={`h-14 rounded-2xl border-2 font-bold transition-all ${
                    form.watch("gender") === g
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                      : "bg-white border-primary/10 text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Any conditions?",
      subtitle: "We'll tailor recommendations to these.",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {conditionsList.map((item) => (
            <label key={item} className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              form.watch("conditions")?.includes(item)
                ? "bg-primary/5 border-primary"
                : "bg-white border-primary/10 hover:border-primary/30"
            }`}>
              <Checkbox 
                checked={form.watch("conditions")?.includes(item)}
                onCheckedChange={(checked) => {
                  const current = form.getValues("conditions") || [];
                  if (checked) form.setValue("conditions", [...current, item]);
                  else form.setValue("conditions", current.filter(c => c !== item));
                }}
                className="w-5 h-5 rounded-md border-2 border-primary"
              />
              <span className={`font-bold text-sm ${form.watch("conditions")?.includes(item) ? "text-primary" : "text-foreground"}`}>{item}</span>
            </label>
          ))}
        </div>
      )
    },
    {
      title: "Recent symptoms?",
      subtitle: "What's been bothering you lately?",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {symptomsList.map((item) => (
            <label key={item} className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              form.watch("symptoms")?.includes(item)
                ? "bg-secondary/5 border-secondary"
                : "bg-white border-primary/10 hover:border-primary/30"
            }`}>
              <Checkbox 
                checked={form.watch("symptoms")?.includes(item)}
                onCheckedChange={(checked) => {
                  const current = form.getValues("symptoms") || [];
                  if (checked) form.setValue("symptoms", [...current, item]);
                  else form.setValue("symptoms", current.filter(c => c !== item));
                }}
                className="w-5 h-5 rounded-md border-2 border-secondary"
              />
              <span className={`font-bold text-sm ${form.watch("symptoms")?.includes(item) ? "text-secondary-foreground" : "text-foreground"}`}>{item}</span>
            </label>
          ))}
        </div>
      )
    },
    {
      title: "Any Allergies?",
      subtitle: "We'll strictly avoid these.",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {allergiesList.map((item) => (
            <label key={item} className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              form.watch("allergies")?.includes(item)
                ? "bg-red-50 border-red-500"
                : "bg-white border-primary/10 hover:border-primary/30"
            }`}>
              <Checkbox 
                checked={form.watch("allergies")?.includes(item)}
                onCheckedChange={(checked) => {
                  const current = form.getValues("allergies") || [];
                  if (checked) form.setValue("allergies", [...current, item]);
                  else form.setValue("allergies", current.filter(c => c !== item));
                }}
                className="w-5 h-5 rounded-md border-2 border-red-500"
              />
              <span className={`font-bold text-sm ${form.watch("allergies")?.includes(item) ? "text-red-600" : "text-foreground"}`}>{item}</span>
            </label>
          ))}
        </div>
      )
    }
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      try {
        await updateProfile.mutateAsync({
          ...form.getValues(),
          userId: user?.id
        });
        setLocation("/");
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <div className="flex-1 max-w-md mx-auto w-full flex flex-col justify-center">
        <motion.div className="flex justify-center mb-8">
          <TotoAvatar mood="happy" size="lg" />
        </motion.div>
        
        <div className="mb-10 text-center">
          <motion.h2 
            key={`title-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-primary mb-3"
          >
            {steps[step].title}
          </motion.h2>
          <motion.p
             key={`subtitle-${step}`}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="text-muted-foreground text-lg"
          >
            {steps[step].subtitle}
          </motion.p>
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {steps[step].content}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex justify-between items-center gap-4">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="rounded-full h-14 px-8 font-bold">
              Back
            </Button>
          ) : <div className="w-24" />}
          
          <Button 
            onClick={handleNext} 
            disabled={updateProfile.isPending || (step === 0 && (!form.watch("age") || !form.watch("gender")))}
            className="flex-1 bg-primary text-white rounded-full h-14 font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl transition-all"
          >
            {step === steps.length - 1 ? (updateProfile.isPending ? "Saving..." : "Finish") : "Next"}
          </Button>
        </div>

        <div className="flex justify-center gap-3 mt-10">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-primary' : 'w-2 bg-primary/20'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
