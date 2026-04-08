import { useScans } from "@/hooks/use-scans";
import { useUpdateScan } from "@/hooks/use-scans";
import { useProductImage } from "@/hooks/use-product-image";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TotoAvatar } from "@/components/TotoAvatar";
import { useToast } from "@/hooks/use-toast";

function ScanImage({ name, barcode, savedUrl }: { name: string; barcode?: string | null; savedUrl?: string | null }) {
  const { url: fetchedUrl, loading } = useProductImage(name, barcode);
  const src = savedUrl || fetchedUrl;
  const isLoading = !savedUrl && loading;
  if (isLoading) {
    return <div className="w-full h-full animate-pulse bg-gray-200 rounded-lg" />;
  }
  if (src) {
    return (
      <div className="w-full h-full bg-white p-1.5">
        <img src={src} alt={name} className="w-full h-full object-contain" />
      </div>
    );
  }
  return <div className="w-full h-full rounded-lg bg-gray-100" />;
}

const GRADE_COLOR: Record<string, string> = {
  A: "bg-emerald-500", B: "bg-lime-500", C: "bg-amber-500", D: "bg-orange-500", F: "bg-red-500"
};

export default function FavoritesPage() {
  const { data: allScans, isLoading } = useScans();
  const updateScan = useUpdateScan();
  const { toast } = useToast();

  const favorites = (allScans || []).filter(s => s.isFavorite);

  const handleUnfavorite = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await updateScan.mutateAsync({ id, isFavorite: false });
      toast({ title: "Removed from favorites" });
    } catch {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-32">
      <header className="sticky top-0 z-20 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-black/5 px-4 py-3 flex items-center gap-4">
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full w-10 h-10" data-testid="button-back">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="font-black text-lg flex-1">Favorites</h1>
        <span className="text-sm font-bold text-muted-foreground">{favorites.length} saved</span>
      </header>

      <div className="max-w-lg mx-auto px-5 pt-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-6"
            >
              <TotoAvatar mood="thinking" size="lg" />
            </motion.div>
            <h2 className="font-black text-xl mb-2">No favorites yet</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Tap the bookmark icon on any scan result to save it here.
            </p>
            <Link href="/scan">
              <Button className="rounded-full px-8">Scan a Product</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((scan, i) => (
              <Link key={scan.id} href={`/scan/${scan.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-white rounded-2xl border border-black/5 p-4 flex items-center gap-4 shadow-sm hover:border-primary/20 cursor-pointer transition-all group"
                  data-testid={`card-favorite-${scan.id}`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted shadow-sm">
                    <ScanImage name={scan.productName || ""} barcode={scan.barcode} savedUrl={scan.imageUrl} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm truncate">{scan.productName}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Score: {scan.score}/100</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="h-1.5 w-24 bg-black/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${GRADE_COLOR[scan.grade || "C"]} rounded-full`}
                          style={{ width: `${scan.score || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm ${GRADE_COLOR[scan.grade || "C"]}`}>
                      {scan.grade}
                    </div>
                    <button
                      onClick={(e) => handleUnfavorite(scan.id, e)}
                      className="text-primary hover:text-red-500 transition-colors"
                      data-testid={`button-unfavorite-${scan.id}`}
                    >
                      <BookmarkCheck className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
