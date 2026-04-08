import { useState, useEffect, useRef } from "react";

/** Fetch product image via the smart backend endpoint.
 *  Falls back to AI-generated image if Open Food Facts finds nothing.
 *  Returns { url, loading } — loading is true while the fetch is in progress. */
export function useProductImage(
  productName: string,
  barcode?: string | null
): { url: string | null; loading: boolean } {
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

  useEffect(() => {
    if (url || fetchedRef.current) return;
    if (!productName) { setLoading(false); return; }
    fetchedRef.current = true;

    const params = new URLSearchParams();
    if (productName) params.set("name", productName);
    if (barcode) params.set("barcode", barcode);

    fetch(`/api/product-image?${params}`)
      .then(r => r.json())
      .then((data: { url: string | null }) => {
        if (data?.url) {
          setUrl(data.url);
          if (!data.url.startsWith("data:")) {
            try { localStorage.setItem(key, data.url); } catch {}
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { url, loading };
}
