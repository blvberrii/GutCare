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

// Step schema logic would go here, simplifying for generation
type FormData = z.infer<typeof insertUserProfileSchema>;

export default function Onboarding() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);

  // If profile exists and has conditions set, skip onboarding
  if (profile && profile.conditions && profile.conditions.length > 0) {
    return <Redirect to="/" />;
  }

  const form = useForm<FormData>({
    resolver: zodResolver(insertUserProfileSchema),
    defaultValues: {
      userId: user?.id,
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
        <div className="space-y-4">
          <div>
            <Label>How old are you?</Label>
            <Input type="number" {...form.register("age", { valueAsNumber: true })} className="rounded-xl h-12" placeholder="e.g. 28" />
          </div>
          <div>
            <Label>Gender</Label>
            <Input {...form.register("gender")} className="rounded-xl h-12" placeholder="How do you identify?" />
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
            <label key={item} className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary transition-colors">
              <Checkbox 
                checked={form.watch("conditions")?.includes(item)}
                onCheckedChange={(checked) => {
                  const current = form.getValues("conditions") || [];
                  if (checked) form.setValue("conditions", [...current, item]);
                  else form.setValue("conditions", current.filter(c => c !== item));
                }}
              />
              <span className="font-medium text-sm">{item}</span>
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
            <label key={item} className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary transition-colors">
              <Checkbox 
                checked={form.watch("symptoms")?.includes(item)}
                onCheckedChange={(checked) => {
                  const current = form.getValues("symptoms") || [];
                  if (checked) form.setValue("symptoms", [...current, item]);
                  else form.setValue("symptoms", current.filter(c => c !== item));
                }}
              />
              <span className="font-medium text-sm">{item}</span>
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
            <label key={item} className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-border shadow-sm cursor-pointer hover:border-primary transition-colors">
              <Checkbox 
                checked={form.watch("allergies")?.includes(item)}
                onCheckedChange={(checked) => {
                  const current = form.getValues("allergies") || [];
                  if (checked) form.setValue("allergies", [...current, item]);
                  else form.setValue("allergies", current.filter(c => c !== item));
                }}
              />
              <span className="font-medium text-sm">{item}</span>
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
        
        <div className="mb-8 text-center">
          <motion.h2 
            key={`title-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-display font-bold text-primary mb-2"
          >
            {steps[step].title}
          </motion.h2>
          <motion.p
             key={`subtitle-${step}`}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="text-muted-foreground"
          >
            {steps[step].subtitle}
          </motion.p>
        </div>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {steps[step].content}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-8 flex justify-between items-center">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          <div className="flex-1" />
          <Button 
            onClick={handleNext} 
            disabled={updateProfile.isPending}
            className="bg-primary text-white rounded-full px-8 shadow-lg shadow-primary/25"
          >
            {step === steps.length - 1 ? (updateProfile.isPending ? "Saving..." : "Finish") : "Next"}
          </Button>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-primary/20'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
