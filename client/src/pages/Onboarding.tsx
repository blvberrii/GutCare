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

const conditionsList = [
  "IBS", "SIBO", "Crohn's Disease", "Celiac Disease",
  "Lactose Intolerance", "GERD / Acid Reflux", "Ulcerative Colitis",
  "Gastritis", "Leaky Gut Syndrome", "Diverticulitis",
  "Gastroparesis", "H. Pylori Infection", "Food Intolerances",
  "Chronic Constipation",
];
const symptomsList = [
  "Bloating", "Fatigue", "Brain Fog", "Skin Issues",
  "Stomach Pain", "Diarrhea", "Constipation", "Nausea",
  "Heartburn", "Gas / Flatulence", "Cramping", "Loss of Appetite",
  "Mucus in Stool", "Urgency", "Weight Changes",
  "Joint Pain", "Headaches", "Food Cravings",
];
const allergiesList = ["Gluten", "Dairy", "Nuts", "Soy", "Eggs", "Shellfish"];

// Extension schema to include name if needed, though Replit Auth usually has it
// We'll just capture what we need for the profile
type FormData = z.infer<typeof insertUserProfileSchema> & { firstName?: string };

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
    resolver: zodResolver(insertUserProfileSchema.extend({
      firstName: z.string().min(2, "Name is required"),
      dob: z.any().refine((val) => val && val !== "", "DOB is required")
    })),
    defaultValues: {
      userId: user?.id,
      firstName: user?.firstName || "",
      dob: "" as any,
      gender: "",
      conditions: [],
      symptoms: [],
      allergies: [],
      struggles: [],
    }
  });

  const [otherAllergy, setOtherAllergy] = useState("");
  const [otherCondition, setOtherCondition] = useState("");
  const [otherSymptom, setOtherSymptom] = useState("");

  const steps = [
    {
      title: "Welcome Friend!",
      subtitle: "What should we call you?",
      content: (
        <div className="space-y-6 flex flex-col items-center">
          <div className="space-y-2 w-full">
            <Label>Your Name</Label>
            <Input 
              {...form.register("firstName")} 
              className="rounded-2xl h-14 bg-white border-2 border-primary/10 focus:border-primary transition-all text-lg font-bold" 
              placeholder="e.g. Alex" 
            />
          </div>
        </div>
      )
    },
    {
      title: "Tell us about you",
      subtitle: "Help us personalize your experience!",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input 
              type="date" 
              max={new Date().toISOString().split('T')[0]}
              {...form.register("dob")} 
              className="rounded-2xl h-14 bg-white border-2 border-primary/10 focus:border-primary transition-all text-lg font-bold" 
            />
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
          {[...conditionsList, "Others"].map((item) => (
            <div key={item} className="space-y-2">
              <label className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                form.watch("conditions")?.includes(item)
                  ? "bg-primary/5 border-primary"
                  : "bg-white border-primary/10 hover:border-primary/30"
              }`}>
                <Checkbox
                  checked={form.watch("conditions")?.includes(item)}
                  onCheckedChange={(checked) => {
                    const current = form.getValues("conditions") || [];
                    if (checked) form.setValue("conditions", [...current, item]);
                    else {
                      form.setValue("conditions", current.filter(c => c !== item));
                      if (item === "Others") setOtherCondition("");
                    }
                  }}
                  className="w-5 h-5 rounded-md border-2 border-primary"
                />
                <span className={`font-bold text-sm ${form.watch("conditions")?.includes(item) ? "text-primary" : "text-foreground"}`}>{item}</span>
              </label>
              {item === "Others" && form.watch("conditions")?.includes("Others") && (
                <Input
                  value={otherCondition}
                  onChange={(e) => setOtherCondition(e.target.value)}
                  placeholder="Describe your condition"
                  className="rounded-xl h-10 bg-white border-2 border-primary/10 focus:border-primary"
                />
              )}
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Recent symptoms?",
      subtitle: "What's been bothering you lately?",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {[...symptomsList, "Others"].map((item) => (
            <div key={item} className="space-y-2">
              <label className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                form.watch("symptoms")?.includes(item)
                  ? "bg-secondary/5 border-secondary"
                  : "bg-white border-primary/10 hover:border-primary/30"
              }`}>
                <Checkbox
                  checked={form.watch("symptoms")?.includes(item)}
                  onCheckedChange={(checked) => {
                    const current = form.getValues("symptoms") || [];
                    if (checked) form.setValue("symptoms", [...current, item]);
                    else {
                      form.setValue("symptoms", current.filter(c => c !== item));
                      if (item === "Others") setOtherSymptom("");
                    }
                  }}
                  className="w-5 h-5 rounded-md border-2 border-secondary"
                />
                <span className={`font-bold text-sm ${form.watch("symptoms")?.includes(item) ? "text-secondary-foreground" : "text-foreground"}`}>{item}</span>
              </label>
              {item === "Others" && form.watch("symptoms")?.includes("Others") && (
                <Input
                  value={otherSymptom}
                  onChange={(e) => setOtherSymptom(e.target.value)}
                  placeholder="Describe your symptom"
                  className="rounded-xl h-10 bg-white border-2 border-primary/10 focus:border-secondary"
                />
              )}
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Any Allergies?",
      subtitle: "We'll strictly avoid these.",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {["None", ...allergiesList, "Others"].map((item) => (
            <div key={item} className="space-y-2">
              <label className={`flex items-center space-x-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                form.watch("allergies")?.includes(item) || (item === "Others" && otherAllergy)
                  ? "bg-red-5 border-red-500"
                  : "bg-white border-primary/10 hover:border-primary/30"
              }`}>
                <Checkbox 
                  checked={form.watch("allergies")?.includes(item)}
                  onCheckedChange={(checked) => {
                    const current = form.getValues("allergies") || [];
                    if (item === "None" && checked) {
                      form.setValue("allergies", ["None"]);
                      setOtherAllergy("");
                      return;
                    }
                    if (checked) {
                      const next = current.filter(i => i !== "None");
                      form.setValue("allergies", [...next, item]);
                    } else {
                      form.setValue("allergies", current.filter(c => c !== item));
                      if (item === "Others") setOtherAllergy("");
                    }
                  }}
                  className="w-5 h-5 rounded-md border-2 border-red-500"
                />
                <span className={`font-bold text-sm ${form.watch("allergies")?.includes(item) ? "text-red-600" : "text-foreground"}`}>{item}</span>
              </label>
              {item === "Others" && form.watch("allergies")?.includes("Others") && (
                <Input 
                  value={otherAllergy}
                  onChange={(e) => setOtherAllergy(e.target.value)}
                  placeholder="Specify other allergies"
                  className="rounded-xl h-10 bg-white border-2 border-primary/10 focus:border-red-500"
                />
              )}
            </div>
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
        const values = form.getValues();

        let conditions = values.conditions || [];
        if (conditions.includes("Others") && otherCondition) {
          conditions = [...conditions.filter(c => c !== "Others"), `Other: ${otherCondition}`];
        } else {
          conditions = conditions.filter(c => c !== "Others");
        }

        let symptoms = values.symptoms || [];
        if (symptoms.includes("Others") && otherSymptom) {
          symptoms = [...symptoms.filter(s => s !== "Others"), `Other: ${otherSymptom}`];
        } else {
          symptoms = symptoms.filter(s => s !== "Others");
        }

        let allergies = values.allergies || [];
        if (allergies.includes("Others") && otherAllergy) {
          allergies = [...allergies.filter(a => a !== "Others"), `Other: ${otherAllergy}`];
        }

        await updateProfile.mutateAsync({
          userId: user?.id,
          firstName: values.firstName || "",
          dob: values.dob ? new Date(values.dob) : null,
          gender: values.gender,
          conditions,
          symptoms,
          allergies,
          struggles: values.struggles,
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
        <motion.div className="flex justify-center mb-12">
          <TotoAvatar mood="happy" size="lg" />
        </motion.div>
        
        <div className="mb-12 text-center">
          <motion.h2 
            key={`title-${step}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-primary mb-4 tracking-tight"
          >
            {steps[step].title}
          </motion.h2>
          <motion.p
             key={`subtitle-${step}`}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="text-muted-foreground text-xl font-medium"
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

        <div className="mt-12 flex justify-center items-center gap-4">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep(step - 1)} className="rounded-full h-16 px-10 font-black text-lg">
              Back
            </Button>
          )}
          
          <Button 
            onClick={handleNext} 
            disabled={updateProfile.isPending || (step === 0 && !form.watch("firstName")) || (step === 1 && (!form.watch("dob") || !form.watch("gender")))}
            className={`${step === 0 ? "w-full" : "flex-1"} bg-primary text-white rounded-full h-16 font-black text-xl shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all active:scale-95`}
          >
            {step === steps.length - 1 ? (updateProfile.isPending ? "Saving..." : "Finish") : "Next"}
          </Button>
        </div>

        <div className="flex justify-center gap-3 mt-12">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2.5 rounded-full transition-all ${i === step ? 'w-10 bg-primary' : 'w-2.5 bg-primary/20'}`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
