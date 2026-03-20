import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Camera, Upload, X, Info, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeProduct, useCreateScan } from "@/hooks/use-scans";
import { useToast } from "@/hooks/use-toast";
import { TotoAvatar } from "@/components/TotoAvatar";

const TIPS = [
  "Point camera at the ingredients label",
  "Make sure the text is in focus",
  "Good lighting helps accuracy",
  "Include the full label in frame",
];

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [tipIndex] = useState(Math.floor(Math.random() * TIPS.length));
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const analyzeProduct = useAnalyzeProduct();
  const createScan = useCreateScan();

  const steps = [
    "Reading ingredients...",
    "Checking your gut profile...",
    "Analyzing additives & risks...",
    "Generating health score...",
    "Finding better alternatives...",
  ];

  const startCamera = useCallback(async () => {
    setCameraError(false);
    setCameraReady(false);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = s;
      setStream(s);
    } catch {
      setCameraError(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setStream(null);
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .then(() => setCameraReady(true))
        .catch(() => setCameraError(true));
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [startCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setImage(dataUrl);
    stopCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setImage(null);
    startCamera();
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setAnalyzeStep(0);

    const stepInterval = setInterval(() => {
      setAnalyzeStep(prev => Math.min(prev + 1, steps.length - 1));
    }, 1800);

    try {
      const result = await analyzeProduct.mutateAsync(image);
      const savedScan = await createScan.mutateAsync({
        productName: result.productName,
        imageUrl: result.imageUrl,
        grade: result.grade,
        score: result.score,
        ingredients: result.ingredients,
        portionSize: (result as any).portionSize || null,
        positives: result.positives,
        negatives: result.negatives,
        alternatives: result.alternatives,
        citations: (result as any).citations || [],
        additivesDetails: (result as any).additivesDetails || [],
        isFavorite: false,
      });
      setLocation(`/scan/${savedScan.id}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: "We couldn't analyze that product. Try a clearer photo of the ingredients.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    } finally {
      clearInterval(stepInterval);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center p-8 text-center">
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <TotoAvatar mood="thinking" size="xl" />
        </motion.div>
        <h2 className="text-2xl font-black text-foreground mt-8 mb-2">Toto is working...</h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={analyzeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-muted-foreground font-medium mb-8"
          >
            {steps[analyzeStep]}
          </motion.p>
        </AnimatePresence>
        <div className="w-full max-w-xs bg-black/5 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${((analyzeStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>
        <div className="mt-12 flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i <= analyzeStep ? "bg-primary" : "bg-black/10"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 z-20 text-white hover:bg-white/20 rounded-full"
        onClick={() => setLocation("/")}
        data-testid="button-back"
      >
        <X className="w-6 h-6" />
      </Button>

      <AnimatePresence>
        {!image && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="bg-primary text-white px-5 py-3 rounded-full text-sm font-bold shadow-xl shadow-primary/30 flex items-center gap-2 whitespace-nowrap">
              <Info className="w-4 h-4 flex-shrink-0" />
              {TIPS[tipIndex]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-900">
        {image ? (
          <img src={image} alt="Preview" className="w-full h-full object-contain" />
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />

            {!cameraReady && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                <Camera className="w-16 h-16 text-white/30 mb-3 animate-pulse" />
                <p className="text-white/40 text-sm font-bold">Starting camera...</p>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-8 text-center">
                <ImageIcon className="w-14 h-14 text-white/20 mb-4" />
                <p className="text-white/50 text-sm font-bold mb-1">Camera unavailable</p>
                <p className="text-white/30 text-xs">Upload a photo from your gallery below</p>
              </div>
            )}

            {cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-56 relative">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-2xl" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                      Aim at ingredients label
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="bg-black/90 p-8 pb-12 rounded-t-3xl backdrop-blur-md">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          data-testid="input-file"
        />

        {!image ? (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-10">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-14 h-14 border-2 border-white/30 bg-transparent text-white hover:bg-white/10"
                onClick={() => fileInputRef.current?.click()}
                data-testid="button-upload"
              >
                <Upload className="w-5 h-5" />
              </Button>

              <button
                className={`w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-gray-400 shadow-2xl transition-transform ${
                  cameraReady ? "active:scale-95" : "opacity-50"
                }`}
                onClick={capturePhoto}
                disabled={!cameraReady}
                data-testid="button-capture"
              >
                <div className="w-14 h-14 rounded-full bg-white border-2 border-gray-200" />
              </button>

              <div className="w-14" />
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
              {cameraError ? "Use gallery button to upload" : "Tap to capture"}
            </p>
          </div>
        ) : (
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1 bg-transparent text-white border-white/30 hover:bg-white/10 rounded-2xl h-14 font-bold"
              onClick={handleRetake}
              data-testid="button-retake"
            >
              Retake
            </Button>
            <Button
              className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-2xl h-14 font-bold shadow-lg shadow-primary/30"
              onClick={handleAnalyze}
              data-testid="button-analyze"
            >
              Analyze Product
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
