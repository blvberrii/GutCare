import { useScan } from "@/hooks/use-scans";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Info, CheckCircle2, AlertCircle, Bookmark, Star, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TotoAvatar } from "@/components/TotoAvatar";
import { useState } from "react";

export default function ResultsPage() {
  const [, params] = useRoute("/scan/:id");
  const { data: scan, isLoading, error } = useScan(parseInt(params?.id || "0"));
  const [activeAdditive, setActiveAdditive] = useState<string | null>(null);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><TotoAvatar mood="thinking" /></div>;
  if (error || !scan) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  const isGood = (scan.score || 0) >= 70;
  const gradeColor = scan.grade === 'A' ? 'text-green-500' : scan.grade === 'B' ? 'text-lime-500' : scan.grade === 'C' ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-7 h-7" />
          </Button>
        </Link>
        <h1 className="font-bold text-lg">{scan.productName}</h1>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bookmark className="w-6 h-6" />
        </Button>
      </header>

      <main className="px-6 space-y-8">
        {/* Hero Section (Yuka Style) */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 flex flex-col items-center">
          <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-2xl mb-6 bg-muted ring-8 ring-white">
            {scan.imageUrl && <img src={scan.imageUrl} alt={scan.productName || ""} className="w-full h-full object-cover" />}
          </div>
          <h2 className="text-2xl font-bold mb-1">{scan.productName}</h2>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mb-6">Gut Analysis</p>
          
          <div className="flex items-center gap-12">
            <div className="text-center">
              <div className={`text-6xl font-black ${gradeColor}`}>{scan.grade}</div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Grade</div>
            </div>
            <div className="h-16 w-1 bg-muted rounded-full" />
            <div className="text-center">
              <div className="text-6xl font-black text-foreground">{scan.score}</div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Score</div>
            </div>
          </div>
        </section>

        {/* Factors Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl px-2">Analysis Factors</h3>
          
          {/* Positives */}
          <div className="space-y-3">
            {(scan.positives as any[])?.map((pos, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border border-border shadow-sm flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-2xl text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-base">{pos.title}</h4>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{pos.description}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
            ))}
          </div>

          {/* Negatives with Additive Info */}
          <div className="space-y-3">
            {(scan.negatives as any[])?.map((neg, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="bg-red-50 p-3 rounded-2xl text-red-500">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-base">{neg.title}</h4>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{neg.description}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                
                {neg.additives && (
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                    {neg.additives.map((add: string) => (
                      <button
                        key={add}
                        onClick={() => setActiveAdditive(activeAdditive === add ? null : add)}
                        className="px-3 py-1.5 bg-muted rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-muted/80 transition-all"
                      >
                        {add} <Info className="w-3 h-3 text-primary" />
                      </button>
                    ))}
                  </div>
                )}
                
                <AnimatePresence>
                  {activeAdditive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 p-4 bg-primary/5 rounded-2xl text-xs font-bold leading-relaxed text-primary">
                        ⓘ Learn more: {activeAdditive} is often used as a stabilizer but can affect gut microflora in sensitive individuals.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Citations (Evidence Based) */}
        <section className="bg-muted/30 p-6 rounded-3xl">
          <h3 className="flex items-center gap-2 font-bold text-sm mb-4 text-muted-foreground uppercase tracking-widest">
            <GraduationCap className="w-4 h-4" /> Evidence Based Citations
          </h3>
          <ul className="space-y-3 text-[10px] font-bold text-muted-foreground leading-relaxed">
            <li>• Harvard T.H. Chan School of Public Health: Nutrition Source</li>
            <li>• British Journal of Nutrition (Cambridge University Press)</li>
            <li>• Cleveland Clinic: Center for Human Nutrition</li>
          </ul>
        </section>

        {/* Alternatives */}
        {!isGood && (scan.alternatives as any[])?.length > 0 && (
          <section className="space-y-4">
            <h3 className="font-bold text-xl px-2">Better Alternatives</h3>
            <div className="space-y-3">
              {(scan.alternatives as any[]).map((alt, i) => (
                <div key={i} className="bg-white p-4 rounded-3xl border border-border shadow-sm flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-2xl overflow-hidden flex-shrink-0">
                    {alt.image && <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{alt.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${alt.score}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-green-600">{alt.score}</span>
                    </div>
                  </div>
                  <Button size="sm" className="rounded-xl font-bold bg-primary text-white">Switch</Button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* User Rating */}
        <section className="bg-white rounded-3xl p-6 border border-border shadow-sm">
           <h3 className="font-bold text-lg mb-4 text-center">Your Rating</h3>
           <div className="flex justify-center gap-3 mb-6">
             {['A', 'B', 'C', 'D', 'F'].map(r => (
               <button key={r} className="w-10 h-10 rounded-full border-2 border-primary/20 font-bold text-primary hover:bg-primary hover:text-white transition-all">{r}</button>
             ))}
           </div>
           <div className="p-4 bg-muted rounded-2xl text-center cursor-pointer hover:bg-muted/80 transition-all font-bold text-sm text-muted-foreground">
             Leave a comment...
           </div>
        </section>
      </main>
    </div>
  );
}
