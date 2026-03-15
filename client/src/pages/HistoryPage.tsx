import { useScans } from "@/hooks/use-scans";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, ShoppingBag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TotoAvatar } from "@/components/TotoAvatar";

const GRADE_COLOR: Record<string, string> = {
  A: "bg-emerald-500", B: "bg-lime-500", C: "bg-amber-500", D: "bg-orange-500", F: "bg-red-500"
};
const GRADE_LABEL: Record<string, string> = {
  A: "Excellent", B: "Good", C: "Moderate", D: "Poor", F: "Avoid"
};

export default function HistoryPage() {
  const { data: scans, isLoading } = useScans();

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-32">
      <header className="sticky top-0 z-20 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-black/5 px-4 py-3 flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" data-testid="button-back">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="font-black text-lg flex-1">Scan History</h1>
        <span className="text-sm font-bold text-muted-foreground">{(scans || []).length} scans</span>
      </header>

      <div className="max-w-lg mx-auto px-5 pt-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !scans?.length ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-6"
            >
              <TotoAvatar mood="happy" size="lg" />
            </motion.div>
            <h2 className="font-black text-xl mb-2">No scans yet!</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Start scanning food products to build your history.
            </p>
            <Link href="/scan">
              <Button className="rounded-full px-8">Scan Your First Product</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {(["A", "B", "C", "D", "F"] as const).slice(0, 3).map((grade) => {
                const count = scans.filter(s => s.grade === grade).length;
                return count > 0 ? (
                  <div key={grade} className="bg-white rounded-2xl p-3 text-center border border-black/5 shadow-sm">
                    <div className={`w-8 h-8 rounded-xl ${GRADE_COLOR[grade]} flex items-center justify-center text-white font-black text-sm mx-auto mb-1`}>{grade}</div>
                    <div className="font-black text-lg">{count}</div>
                    <div className="text-[10px] text-muted-foreground font-bold">{GRADE_LABEL[grade]}</div>
                  </div>
                ) : null;
              })}
            </div>

            <div className="space-y-3">
              {scans.map((scan, i) => (
                <Link key={scan.id} href={`/scan/${scan.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                    className="bg-white rounded-2xl border border-black/5 p-4 flex items-center gap-4 shadow-sm hover:border-primary/20 cursor-pointer transition-all group"
                    data-testid={`card-history-${scan.id}`}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted shadow-sm">
                      {scan.imageUrl ? (
                        <img src={scan.imageUrl} alt={scan.productName || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm truncate">{scan.productName || "Unknown Product"}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-20 bg-black/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${GRADE_COLOR[scan.grade || "C"]} rounded-full`}
                            style={{ width: `${scan.score || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">{scan.score}/100</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3 text-muted-foreground/40" />
                        <span className="text-[11px] text-muted-foreground">{formatDate(scan.createdAt)}</span>
                      </div>
                    </div>

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm ${GRADE_COLOR[scan.grade || "C"]}`}>
                      {scan.grade || "?"}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
