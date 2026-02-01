import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAnalyzeProduct, useCreateScan } from "@/hooks/use-scans";
import { useToast } from "@/hooks/use-toast";
import { TotoAvatar } from "@/components/TotoAvatar";

export default function ScanPage() {
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const analyzeProduct = useAnalyzeProduct();
  const createScan = useCreateScan();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setIsAnalyzing(true);
    try {
      // 1. Analyze with AI
      const result = await analyzeProduct.mutateAsync(image);
      
      // 2. Save to DB
      const savedScan = await createScan.mutateAsync({
        productName: result.productName,
        imageUrl: image, // Ideally upload to storage first, but for now storing base64 or assuming url
        grade: result.grade,
        score: result.score,
        ingredients: result.ingredients,
        positives: result.positives,
        negatives: result.negatives,
        alternatives: result.alternatives,
      });
      
      // 3. Redirect
      setLocation(`/scan/${savedScan.id}`);
      
    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: "We couldn't analyze that product. Try a clearer photo.",
        variant: "destructive"
      });
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <TotoAvatar mood="thinking" size="xl" />
        <motion.h2 
          animate={{ opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-2xl font-display font-bold text-primary mt-8 mb-4"
        >
          Analyzing Ingredients...
        </motion.h2>
        <p className="text-muted-foreground">Checking against your profile for allergens and irritants.</p>
        
        <div className="w-full max-w-xs bg-muted rounded-full h-2 mt-8 overflow-hidden">
          <motion.div 
            className="h-full bg-accent"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 left-4 z-20 text-white hover:bg-white/20"
        onClick={() => setLocation("/")}
      >
        <X />
      </Button>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-900">
        {image ? (
          <img src={image} alt="Preview" className="w-full h-full object-contain" />
        ) : (
          <div className="text-white/50 text-center p-8">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Take a clear photo of the ingredients label</p>
          </div>
        )}
        
        {/* Helper overlay */}
        {!image && (
          <div className="absolute inset-0 border-[40px] border-black/50 pointer-events-none">
            <div className="w-full h-full border-2 border-white/30 rounded-lg relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-black/80 p-8 pb-12 rounded-t-3xl backdrop-blur-md">
        <input 
          type="file" 
          accept="image/*" 
          capture="environment"
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />
        
        {!image ? (
          <div className="flex justify-center gap-8">
             <Button 
              size="lg"
              variant="outline"
              className="rounded-full w-16 h-16 border-2 border-white/30 bg-transparent text-white hover:bg-white/10"
              onClick={() => fileInputRef.current?.click()}
             >
               <Upload className="w-6 h-6" />
             </Button>
             
             <Button 
              size="lg"
              className="rounded-full w-20 h-20 bg-white hover:bg-gray-100 text-black shadow-lg shadow-white/20 p-0 flex items-center justify-center border-4 border-gray-300"
              onClick={() => fileInputRef.current?.click()}
             >
               <div className="w-16 h-16 bg-white rounded-full border-2 border-black/10" />
             </Button>
             
             <div className="w-16" /> {/* Spacer for balance */}
          </div>
        ) : (
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1 bg-transparent text-white border-white/30 hover:bg-white/10"
              onClick={() => setImage(null)}
            >
              Retake
            </Button>
            <Button 
              className="flex-1 bg-primary text-white hover:bg-primary/90"
              onClick={handleAnalyze}
            >
              Analyze
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
