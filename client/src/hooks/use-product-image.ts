import { useState, useEffect, useRef, useCallback } from "react";

/** Fetch product image via the smart backend endpoint.
 *  Falls back to AI-generated image if Open Food Facts finds nothing.
 *  Returns { url, loading, onError } — call onError if the <img> fails to load
 *  so a stale cache entry (e.g. /api/ai-image/* invalidated by server restart)
 *  can be refreshed. */
export function useProductImage(
  productName: string,
  barcode?: string | null
): { url: string | null; loading: boolean; onError: () => void } {
  const key = `gutcare-img5-${(barcode || productName)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .slice(0, 60)}`;

  const [url, setUrl] = useState<string | null>(() => {
    try { return localStorage.getItem(key); } catch { return null; }
  });

  const [loading, setLoading] = useState<boolean>(() => {
    if (!productName) return false;
    try { return !localStorage.getItem(key); } catch { return true; }
  });

  const fetchedRef = useRef(false);
  const refetchedRef = useRef(false);

  const doFetch = useCallback(() => {
    if (!productName) { setLoading(false); return; }
    const params = new URLSearchParams();
    params.set("name", productName);
    if (barcode) params.set("barcode", barcode);
    setLoading(true);
    fetch(`/api/product-image?${params}`)
      .then(r => r.json())
      .then((data: { url: string | null }) => {
        if (data?.url) {
          setUrl(data.url);
          // Persist short URLs (OFF and /api/ai-image/*); never raw data: URLs.
          if (!data.url.startsWith("data:")) {
            try { localStorage.setItem(key, data.url); } catch {}
          }
        } else {
          setUrl(null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productName, barcode, key]);

  useEffect(() => {
    if (url || fetchedRef.current) return;
    fetchedRef.current = true;
    doFetch();
  }, []);

  // If the <img> fails to load (e.g. cached /api/ai-image/<hash>.png 404s
  // after a server restart), clear the bad URL and re-fetch once.
  const onError = useCallback(() => {
    if (refetchedRef.current) return;
    refetchedRef.current = true;
    try { localStorage.removeItem(key); } catch {}
    setUrl(null);
    doFetch();
  }, [doFetch, key]);

  return { url, loading, onError };
}
