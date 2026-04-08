import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Camera, Upload, X, ImageIcon, ScanLine, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeProduct, useCreateScan } from "@/hooks/use-scans";
import { useToast } from "@/hooks/use-toast";
import { TotoAvatar } from "@/components/TotoAvatar";
import { apiRequest } from "@/lib/queryClient";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";
import type { IScannerControls } from "@zxing/browser";

const ANALYZE_STEPS = [
  "Reading ingredients...",
  "Checking your gut profile...",
  "Analyzing additives & risks...",
  "Generating health score...",
  "Finding better alternatives...",
];

type Mode = "barcode" | "photo";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoStreamRef = useRef<MediaStream | null>(null);
  const zxingControlsRef = useRef<IScannerControls | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef(false);

  const [mode, setMode] = useState<Mode>("barcode");
  const [image, setImage] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const analyzeProduct = useAnalyzeProduct();
  const createScan = useCreateScan();

  // ── ZXing barcode scanner (works on iOS, Android, Firefox, Chrome) ────────

  const stopZxing = useCallback(() => {
    zxingControlsRef.current?.stop();
    zxingControlsRef.current = null;
    setCameraReady(false);
  }, []);

  const startZxingScan = useCallback(async () => {
    if (!videoRef.current) return;
    setCameraError(false);
    setCameraReady(false);

    try {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13, BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128, BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93, BarcodeFormat.ITF,
        BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX,
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);

      const reader = new BrowserMultiFormatReader(hints, {
        delayBetweenScanAttempts: 100,
        delayBetweenScanSuccess: 300,
      });

      zxingControlsRef.current = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } } },
        videoRef.current,
        (result, error) => {
          if (result && !processingRef.current) {
            handleBarcodeDetectedRef.current(result.getText());
          }
        }
      );

      setCameraReady(true);
    } catch {
      setCameraError(true);
    }
  }, []);

  // ── Manual camera for photo mode ──────────────────────────────────────────

  const stopPhotoCamera = useCallback(() => {
    photoStreamRef.current?.getTracks().forEach(t => t.stop());
    photoStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
  }, []);

  const startPhotoCamera = useCallback(async () => {
    setCameraError(false);
    setCameraReady(false);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      photoStreamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      setCameraError(true);
    }
  }, []);

  // ── Barcode detection handler (uses a ref so ZXing callback always has latest) ──

  const handleBarcodeDetectedRef = useRef<(code: string) => Promise<void>>(async () => {});

  const handleBarcodeDetected = useCallback(async (code: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setDetected(code);

    // Brief green flash before starting analysis
    await new Promise(r => setTimeout(r, 400));
    setIsAnalyzing(true);
    setAnalyzeStep(0);

    const stepInterval = setInterval(() => {
      setAnalyzeStep(prev => Math.min(prev + 1, ANALYZE_STEPS.length - 1));
    }, 1800);

    const resetAndRetry = (title: string, description: string) => {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setDetected(null);
      processingRef.current = false;
      toast({ title, description });
      startZxingScan();
    };

    try {
      const barcodeRes = await apiRequest("GET", `/api/barcode/${encodeURIComponent(code)}`);
      if (!barcodeRes.ok) {
        return resetAndRetry(
          "Product not found",
          `Barcode ${code} isn't in our database yet. Try Label mode to photograph the ingredients.`,
        );
      }
      const product = await barcodeRes.json();
      if (!product?.productName) {
        return resetAndRetry("Product not found", "Try Label mode to photograph the ingredients.");
      }

      const analyzeRes = await apiRequest("POST", "/api/analyze/product-text", {
        productName: product.productName,
        ingredients: product.ingredients || "",
      });
      if (!analyzeRes.ok) throw new Error("Analysis failed");
      const analysis = await analyzeRes.json();

      const savedScan = await createScan.mutateAsync({
        productName: analysis.productName || product.productName,
        imageUrl: product.imageUrl || null,
        grade: analysis.grade,
        score: analysis.score,
        ingredients: analysis.ingredients || product.ingredients || "",
        portionSize: analysis.portionSize || null,
        positives: analysis.positives || [],
        negatives: analysis.negatives || [],
        alternatives: analysis.alternatives || [],
        citations: analysis.citations || [],
        additivesDetails: analysis.additivesDetails || [],
        nutritionFacts: analysis.nutritionFacts || null,
        isFavorite: false,
      });
      clearInterval(stepInterval);
      setLocation(`/scan/${savedScan.id}`);
    } catch {
      resetAndRetry("Scan failed", "Couldn't analyze that barcode. Try again or switch to Label mode.");
    }
  }, [createScan, setLocation, toast, startZxingScan]);

  // Keep the ref in sync with the latest callback
  useEffect(() => {
    handleBarcodeDetectedRef.current = handleBarcodeDetected;
  }, [handleBarcodeDetected]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    startZxingScan();
    return () => {
      zxingControlsRef.current?.stop();
      photoStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Mode switching ─────────────────────────────────────────────────────────

  const switchMode = useCallback((m: Mode) => {
    if (m === mode) return;
    setDetected(null);
    setImage(null);
    processingRef.current = false;

    if (m === "barcode") {
      stopPhotoCamera();
      startZxingScan();
    } else {
      stopZxing();
      startPhotoCamera();
    }
    setMode(m);
  }, [mode, stopPhotoCamera, startZxingScan, stopZxing, startPhotoCamera]);

  // ── Photo mode ─────────────────────────────────────────────────────────────

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    setImage(c.toDataURL("image/jpeg", 0.85));
    stopPhotoCamera();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        stopPhotoCamera();
        stopZxing();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setImage(null);
    if (mode === "photo") startPhotoCamera();
    else startZxingScan();
  };

  const handleAnalyzePhoto = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setAnalyzeStep(0);
    const stepInterval = setInterval(() => {
      setAnalyzeStep(prev => Math.min(prev + 1, ANALYZE_STEPS.length - 1));
    }, 1800);
    try {
      const result = await analyzeProduct.mutateAsync(image);
      const savedScan = await createScan.mutateAsync({
        productName: result.productName,
        imageUrl: result.imageUrl,
        grade: result.grade,
        score: result.score,
        ingredients: result.ingredients,
        portionSize: result.portionSize || null,
        positives: result.positives,
        negatives: result.negatives,
        alternatives: result.alternatives,
        citations: (result as any).citations || [],
        additivesDetails: (result as any).additivesDetails || [],
        nutritionFacts: (result as any).nutritionFacts || null,
        isFavorite: false,
      });
      setLocation(`/scan/${savedScan.id}`);
    } catch {
      toast({ title: "Analysis Failed", description: "Couldn't analyze that photo. Try a clearer shot.", variant: "destructive" });
      setIsAnalyzing(false);
    } finally {
      clearInterval(stepInterval);
    }
  };

  // ── Analyzing screen ───────────────────────────────────────────────────────

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center p-8 text-center">
        <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <TotoAvatar mood="thinking" size="xl" />
        </motion.div>
        <h2 className="text-2xl font-black text-foreground mt-8 mb-2">Toto is working...</h2>
        <AnimatePresence mode="wait">
          <motion.p key={analyzeStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-muted-foreground font-medium mb-8">
            {ANALYZE_STEPS[analyzeStep]}
          </motion.p>
        </AnimatePresence>
        <div className="w-full max-w-xs bg-black/5 rounded-full h-2 overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" initial={{ width: "0%" }} animate={{ width: `${((analyzeStep + 1) / ANALYZE_STEPS.length) * 100}%` }} transition={{ duration: 0.8, ease: "easeInOut" }} />
        </div>
        <div className="mt-12 flex gap-2">
          {ANALYZE_STEPS.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-500 ${i <= analyzeStep ? "bg-primary" : "bg-black/10"}`} />
          ))}
        </div>
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => { stopZxing(); stopPhotoCamera(); setLocation("/"); }} data-testid="button-back">
          <X className="w-6 h-6" />
        </Button>

        {/* Mode toggle */}
        <div className="flex bg-black/50 backdrop-blur-md rounded-full p-1 gap-1 border border-white/10">
          <button
            onClick={() => switchMode("barcode")}
            data-testid="button-mode-barcode"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === "barcode" ? "bg-primary text-white shadow" : "text-white/60 hover:text-white"}`}
          >
            <ScanLine className="w-4 h-4" />
            Barcode
          </button>
          <button
            onClick={() => switchMode("photo")}
            data-testid="button-mode-photo"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === "photo" ? "bg-primary text-white shadow" : "text-white/60 hover:text-white"}`}
          >
            <Camera className="w-4 h-4" />
            Label
          </button>
        </div>

        <div className="w-10" />
      </div>

      {/* Camera feed */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gray-950">
        {image ? (
          <img src={image} alt="Preview" className="w-full h-full object-contain" />
        ) : (
          <>
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

            {!cameraReady && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950">
                <Camera className="w-16 h-16 text-white/20 mb-3 animate-pulse" />
                <p className="text-white/30 text-sm font-bold">Starting camera...</p>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 p-8 text-center">
                <ImageIcon className="w-14 h-14 text-white/15 mb-4" />
                <p className="text-white/40 text-sm font-bold mb-1">Camera unavailable</p>
                <p className="text-white/25 text-xs">Upload a photo from your gallery below</p>
              </div>
            )}

            {/* ── Barcode viewfinder ── */}
            {cameraReady && mode === "barcode" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Darkened overlay with transparent cutout */}
                <div
                  className="absolute inset-0 bg-black/50"
                  style={{
                    clipPath: "polygon(0% 0%, 0% 100%, calc(50% - 145px) 100%, calc(50% - 145px) calc(50% - 80px), calc(50% + 145px) calc(50% - 80px), calc(50% + 145px) calc(50% + 80px), calc(50% - 145px) calc(50% + 80px), calc(50% - 145px) 100%, 100% 100%, 100% 0%)",
                  }}
                />

                {/* Viewfinder box */}
                <div className={`relative w-72 h-40 transition-all duration-300 ${detected ? "scale-[1.02]" : ""}`}>
                  {/* Corner brackets */}
                  {[
                    "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-xl",
                    "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-xl",
                    "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl",
                    "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl",
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-8 h-8 transition-colors duration-300 ${cls} ${detected ? "border-green-400" : "border-white"}`} />
                  ))}

                  {/* Laser sweep line */}
                  {!detected && (
                    <motion.div
                      className="absolute left-2 right-2 h-[2px] rounded-full"
                      style={{ background: "linear-gradient(to right, transparent, rgba(56,189,248,0.9), transparent)" }}
                      animate={{ top: ["10%", "85%", "10%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}

                  {/* Green flash on detect */}
                  {detected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 bg-green-400 rounded-lg"
                    />
                  )}
                </div>

                {/* Hint text */}
                <div className="absolute bottom-[calc(50%-120px)] left-1/2 -translate-x-1/2 translate-y-full mt-6">
                  <p className={`text-xs font-bold uppercase tracking-widest mt-4 transition-colors ${detected ? "text-green-400" : "text-white/50"}`}>
                    {detected ? `Detected: ${detected}` : "Move camera over barcode"}
                  </p>
                </div>
              </div>
            )}

            {/* ── Photo viewfinder ── */}
            {cameraReady && mode === "photo" && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-64 relative">
                  {[
                    "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-xl",
                    "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-xl",
                    "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl",
                    "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl",
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-10 h-10 border-white ${cls}`} />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest text-center px-4">Aim at ingredients label</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Bottom controls */}
      <div className="bg-black/90 p-6 pb-10 backdrop-blur-md">
        <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} data-testid="input-file" />

        {mode === "barcode" && !detected && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <p className="text-white/60 text-sm font-bold">Auto-scanning — no tap needed</p>
            </div>
          </div>
        )}

        {mode === "photo" && !image && (
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-10">
              <Button size="lg" variant="outline" className="rounded-full w-14 h-14 border-2 border-white/30 bg-transparent text-white hover:bg-white/10" onClick={() => fileInputRef.current?.click()} data-testid="button-upload">
                <Upload className="w-5 h-5" />
              </Button>
              <button
                className={`w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-gray-400 shadow-2xl transition-transform ${cameraReady ? "active:scale-95" : "opacity-40"}`}
                onClick={capturePhoto}
                disabled={!cameraReady}
                data-testid="button-capture"
              >
                <div className="w-14 h-14 rounded-full bg-white border-2 border-gray-200" />
              </button>
              <div className="w-14" />
            </div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
              {cameraError ? "Use gallery button to upload" : "Tap to capture label"}
            </p>
          </div>
        )}

        {mode === "photo" && image && (
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 bg-transparent text-white border-white/30 hover:bg-white/10 rounded-2xl h-14 font-bold" onClick={handleRetake} data-testid="button-retake">
              Retake
            </Button>
            <Button className="flex-1 bg-primary text-white hover:bg-primary/90 rounded-2xl h-14 font-bold shadow-lg shadow-primary/30" onClick={handleAnalyzePhoto} data-testid="button-analyze">
              Analyze Label
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
