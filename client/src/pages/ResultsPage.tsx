import { useScan, useUpdateScan } from "@/hooks/use-scans";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Info, CheckCircle2, AlertCircle, Bookmark, Star, GraduationCap, ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TotoAvatar } from "@/components/TotoAvatar";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ResultsPage() {
  const [, params] = useRoute("/scan/:id");
  const scanId = parseInt(params?.id || "0");
  const { data: scan, isLoading, error } = useScan(scanId);
  const updateScan = useUpdateScan();
  const { toast } = useToast();
  const [activeAdditive, setActiveAdditive] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState("");

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><TotoAvatar mood="thinking" /></div>;
  if (error || !scan) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const isGood = (scan.score || 0) >= 70;
  const gradeColor = scan.grade === 'A' ? 'text-green-500' : scan.grade === 'B' ? 'text-lime-500' : scan.grade === 'C' ? 'text-yellow-500' : 'text-red-500';

  const handleRate = async (rating: string) => {
    try {
      await updateScan.mutateAsync({ id: scanId, userRating: rating });
      toast({ title: "Rating saved!" });
    } catch (e) {
      toast({ title: "Failed to save rating", variant: "destructive" });
    }
  };

  const handleCommentSubmit = async () => {
    try {
      await updateScan.mutateAsync({ id: scanId, userComment: comment });
      setShowCommentInput(false);
      toast({ title: "Comment saved!" });
    } catch (e) {
      toast({ title: "Failed to save comment", variant: "destructive" });
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'calories': return <span className="text-xl">🔥</span>;
      case 'protein': return <span className="text-xl">💪</span>;
      case 'fiber': return <span className="text-xl">🌾</span>;
      case 'sugar': return <span className="text-xl">🍭</span>;
      case 'sodium': return <span className="text-xl">🧂</span>;
      case 'additives': return <span className="text-xl">🧪</span>;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-32 font-sans">
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-[#FDFCF8]/90 backdrop-blur-md z-20 border-b border-black/5">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5">
            <ChevronLeft className="w-7 h-7" />
          </Button>
        </Link>
        <div className="flex-1 text-center">
          <h1 className="font-bold text-base truncate px-4">{scan.productName}</h1>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-black/5">
          <Bookmark className={`w-6 h-6 ${scan.isFavorite ? 'fill-primary text-primary' : ''}`} />
        </Button>
      </header>

      <main className="max-w-md mx-auto">
        {/* Hero Section */}
        <section className="px-6 pt-8 pb-12 flex flex-col items-center">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-48 h-48 rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 bg-white ring-4 ring-white relative group"
          >
            {scan.imageUrl ? (
              <img src={scan.imageUrl} alt={scan.productName || ""} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <TotoAvatar mood="happy" size="lg" />
              </div>
            )}
          </motion.div>
          
          <h2 className="text-2xl font-black text-center mb-2">{scan.productName}</h2>
          <div className="px-4 py-1 bg-black/5 rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-10">
            Scan Result
          </div>
          
          <div className="flex items-center justify-center gap-16 w-full max-w-xs">
            <div className="text-center group cursor-pointer">
              <div className={`text-7xl font-black leading-none transition-transform group-hover:scale-110 ${gradeColor}`}>
                {scan.grade}
              </div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-3">Grade</div>
            </div>
            
            <div className="h-20 w-[2px] bg-black/5 rounded-full" />
            
            <div className="text-center group cursor-pointer">
              <div className="text-7xl font-black leading-none text-foreground transition-transform group-hover:scale-110">
                {scan.score}
              </div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-3">Score</div>
            </div>
          </div>
        </section>

        <div className="bg-white rounded-t-[3rem] px-6 pt-12 pb-20 shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)] -mt-4 min-h-screen">
          <div className="space-y-10">
            {/* Positives */}
            <div className="space-y-4">
              <h3 className="font-black text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" /> Positives
              </h3>
              <div className="space-y-3">
                {(scan.positives as any[])?.map((pos, i) => (
                  <motion.div 
                    key={i} 
                    whileTap={{ scale: 0.98 }}
                    className="group bg-[#FDFCF8] p-5 rounded-[2rem] border border-black/5 flex items-center gap-4 cursor-pointer hover:border-green-500/30 transition-all shadow-sm hover:shadow-md"
                  >
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-green-600 border border-black/5">
                      {getIconForType(pos.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-foreground">{pos.title}</h4>
                      <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight">{pos.description}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Negatives & Additives */}
            <div className="space-y-4">
              <h3 className="font-black text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> Negatives
              </h3>
              <div className="space-y-3">
                {(scan.negatives as any[])?.map((neg, i) => (
                  <div key={i} className="space-y-2">
                    <motion.div 
                      whileTap={{ scale: 0.98 }}
                      className="group bg-[#FDFCF8] p-5 rounded-[2rem] border border-black/5 flex items-center gap-4 cursor-pointer hover:border-red-500/30 transition-all shadow-sm hover:shadow-md"
                    >
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-red-500 border border-black/5">
                        {getIconForType(neg.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-foreground">{neg.title}</h4>
                        <p className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-tight">{neg.description}</p>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      <ChevronDown className="w-4 h-4 text-muted-foreground/30 group-hover:text-red-500 transition-colors" />
                    </motion.div>
                    
                    {neg.type === 'additives' && (scan.additivesDetails as any[])?.length > 0 && (
                      <div className="px-2 pt-2 pb-4 space-y-2">
                        {(scan.additivesDetails as any[]).map((add, idx) => (
                          <motion.div
                            key={idx}
                            layout
                            className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-black text-xs px-3 py-1 bg-black/5 rounded-full">{add.label || add.name}</span>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                add.risk === 'High' ? 'bg-red-100 text-red-600' : 
                                add.risk === 'Medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                              }`}>
                                {add.risk} Risk
                              </span>
                            </div>
                            <h5 className="font-bold text-xs mb-1">{add.name}</h5>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{add.description}</p>
                            <button className="mt-2 text-[10px] font-black text-primary flex items-center gap-1 hover:underline">
                              <Info className="w-3 h-3" /> ⓘ Learn more
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Citations */}
            {(scan.citations as any[])?.length > 0 && (
              <section className="bg-[#FDFCF8] p-6 rounded-[2.5rem] border border-black/5 shadow-inner">
                <h3 className="flex items-center gap-2 font-black text-xs mb-6 text-muted-foreground uppercase tracking-[0.2em]">
                  <GraduationCap className="w-4 h-4 text-primary" /> Scientific Citations
                </h3>
                <div className="space-y-6">
                  {(scan.citations as any[]).map((cite, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-1 h-auto bg-primary/20 rounded-full" />
                      <div>
                        <p className="text-[11px] font-bold text-foreground leading-relaxed mb-1 italic">"{cite.text}"</p>
                        <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-wider">
                          {cite.source} <ExternalLink className="w-2 h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Alternatives */}
            {!isGood && (scan.alternatives as any[])?.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-black text-lg">Better Choices</h3>
                  <Link href="/scan">
                    <Button variant="link" className="text-primary font-black text-xs uppercase tracking-widest">See all</Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {(scan.alternatives as any[]).map((alt, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 5 }}
                      className="bg-[#FDFCF8] p-4 rounded-[2rem] border border-black/5 shadow-sm flex items-center gap-5 hover:border-primary/20 transition-all cursor-pointer group"
                    >
                      <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden flex-shrink-0 shadow-md border border-black/5 group-hover:scale-105 transition-transform">
                        {alt.image ? (
                          <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <TotoAvatar mood="happy" size="sm" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-sm text-foreground mb-1">{alt.name}</h4>
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 bg-black/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${alt.score}%` }}
                              className="h-full bg-green-500 rounded-full" 
                            />
                          </div>
                          <span className="text-[11px] font-black text-green-600 w-6">{alt.score}</span>
                        </div>
                      </div>
                      <Button size="icon" className="rounded-2xl h-10 w-10 bg-primary text-white shadow-lg shadow-primary/20">
                        <CheckCircle2 className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* User Rating System */}
            <section className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 text-center">
              <h3 className="font-black text-lg mb-2">Personal Rating</h3>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-8">How did this make you feel?</p>
              
              <div className="flex justify-between items-center mb-10 px-4">
                {['A', 'B', 'C', 'D', 'F'].map(r => (
                  <button 
                    key={r} 
                    onClick={() => handleRate(r)}
                    className={`w-12 h-12 rounded-2xl font-black text-lg transition-all ${
                      scan.userRating === r 
                      ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110' 
                      : 'bg-white text-primary border border-primary/10 hover:bg-primary/10'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              
              {!showCommentInput ? (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCommentInput(true)}
                  className="w-full py-4 bg-white rounded-2xl border border-primary/10 font-bold text-sm text-primary shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4 fill-primary" /> {scan.userComment ? 'Edit comment' : 'Add a note...'}
                </motion.button>
              ) : (
                <div className="space-y-4">
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this product..."
                    className="w-full h-32 p-4 bg-white rounded-2xl border border-primary/20 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1 rounded-xl font-black text-xs uppercase" onClick={() => setShowCommentInput(false)}>Cancel</Button>
                    <Button className="flex-1 rounded-xl font-black text-xs uppercase" onClick={handleCommentSubmit}>Save Note</Button>
                  </div>
                </div>
              )}
              {scan.userComment && !showCommentInput && (
                <div className="mt-6 p-4 bg-white/50 rounded-2xl border border-primary/5 text-xs font-medium italic text-primary/80">
                  "{scan.userComment}"
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Floating Toto Navigation */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/90 p-2 pr-6 rounded-full border border-white/10 shadow-2xl z-30 backdrop-blur-xl"
      >
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center overflow-hidden shadow-lg border-2 border-white/20">
          <TotoAvatar mood="happy" size="sm" />
        </div>
        <div className="flex gap-6">
          <Link href="/" className="text-white/70 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Home</Link>
          <Link href="/scan" className="text-white/70 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Scan</Link>
          <Link href="/chat" className="text-white/70 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Toto</Link>
        </div>
      </motion.div>
    </div>
  );
}
