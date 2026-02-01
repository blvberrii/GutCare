import { useScan } from "@/hooks/use-scans";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Check, AlertTriangle, ExternalLink, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TotoAvatar } from "@/components/TotoAvatar";

export default function ResultsPage() {
  const [match, params] = useRoute("/scan/:id");
  const { data: scan, isLoading, error } = useScan(parseInt(params?.id || "0"));

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><TotoAvatar mood="thinking" /></div>;
  if (error || !scan) return <div className="min-h-screen flex items-center justify-center bg-background">Scan not found</div>;

  const isGood = (scan.score || 0) >= 70;
  const colorClass = isGood ? "text-green-600 bg-green-50 border-green-200" : (scan.score || 0) >= 40 ? "text-yellow-600 bg-yellow-50 border-yellow-200" : "text-red-600 bg-red-50 border-red-200";
  const bgGradient = isGood ? "from-green-50 to-background" : (scan.score || 0) >= 40 ? "from-yellow-50 to-background" : "from-red-50 to-background";

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgGradient} pb-24`}>
      {/* Header */}
      <div className="p-4 flex items-center relative">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50 backdrop-blur">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <span className="absolute left-1/2 -translate-x-1/2 font-display font-bold text-lg">Results</span>
      </div>

      <main className="px-6 py-4 space-y-6">
        {/* Product Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-black/5 text-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-2 ${isGood ? 'bg-green-500' : 'bg-red-500'}`} />
          
          <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-xl overflow-hidden shadow-inner">
            <img src={scan.imageUrl || ""} alt={scan.productName || ""} className="w-full h-full object-cover" />
          </div>
          
          <h1 className="text-2xl font-bold mb-1 text-foreground">{scan.productName}</h1>
          <p className="text-muted-foreground text-sm mb-6">Scanned just now</p>
          
          <div className="flex justify-center items-center gap-6">
            <div className="text-center">
              <div className={`text-4xl font-display font-bold ${isGood ? 'text-green-600' : 'text-red-600'}`}>
                {scan.grade}
              </div>
              <span className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Grade</span>
            </div>
            
            <div className="h-10 w-[1px] bg-border" />
            
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-foreground">
                {scan.score}
              </div>
              <span className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Score</span>
            </div>
          </div>
        </div>

        {/* Toto's Take */}
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0">
             <TotoAvatar size="sm" mood={isGood ? "happy" : "thinking"} />
          </div>
          <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-border flex-1">
            <p className="text-sm font-medium">
              {isGood 
                ? "This looks great for your tummy! No major irritants found." 
                : "Hmm, be careful. This contains ingredients that might upset your gut."}
            </p>
          </div>
        </div>

        {/* Positives */}
        {(scan.positives as any[])?.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50/50 border border-green-100 rounded-2xl p-5"
          >
            <h3 className="flex items-center gap-2 font-bold text-green-800 mb-3">
              <Check className="w-5 h-5" /> The Good Stuff
            </h3>
            <ul className="space-y-3">
              {(scan.positives as any[]).map((pos: any, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-green-900">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0" />
                  <span>
                    <strong className="block">{pos.title}</strong>
                    <span className="opacity-80">{pos.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Negatives */}
        {(scan.negatives as any[])?.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-red-50/50 border border-red-100 rounded-2xl p-5"
          >
            <h3 className="flex items-center gap-2 font-bold text-red-800 mb-3">
              <AlertTriangle className="w-5 h-5" /> Watch Out
            </h3>
            <ul className="space-y-3">
              {(scan.negatives as any[]).map((neg: any, i: number) => (
                <li key={i} className="text-sm text-red-900">
                  <div className="flex gap-3 mb-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                     <strong className="block">{neg.title}</strong>
                  </div>
                  <p className="pl-4.5 opacity-80 mb-2">{neg.description}</p>
                  {neg.additives && (
                    <div className="pl-4.5 flex gap-2 flex-wrap">
                      {neg.additives.map((add: string) => (
                         <span key={add} className="px-2 py-0.5 bg-white border border-red-200 rounded text-xs text-red-600 font-mono">
                           {add}
                         </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Alternatives if bad score */}
        {!isGood && (scan.alternatives as any[])?.length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold text-lg mb-4">Better Alternatives</h3>
            <div className="space-y-3">
              {(scan.alternatives as any[]).map((alt: any, i: number) => (
                <div key={i} className="bg-white p-3 rounded-xl border border-border shadow-sm flex items-center gap-3">
                   <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                     {alt.image && <img src={alt.image} alt={alt.name} className="w-full h-full object-cover" />}
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold text-sm truncate">{alt.name}</h4>
                     <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                       <span className="w-2 h-2 rounded-full bg-green-500" />
                       Match Score: {alt.score}
                     </div>
                   </div>
                   <Button size="sm" variant="outline" className="h-8 rounded-full text-xs">View</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback */}
        <div className="border-t border-border pt-6 mt-8">
           <p className="text-center text-sm text-muted-foreground mb-4">Was this analysis helpful?</p>
           <div className="flex justify-center gap-4">
              <Button variant="outline" className="rounded-full w-12 h-12 p-0"><ThumbsUp className="w-5 h-5" /></Button>
              <Button variant="outline" className="rounded-full w-12 h-12 p-0"><ThumbsDown className="w-5 h-5" /></Button>
           </div>
        </div>
      </main>
    </div>
  );
}
