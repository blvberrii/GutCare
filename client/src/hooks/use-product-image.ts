import { useState, useEffect, useRef } from "react";

/** Fetch product image via the smart backend endpoint.
 *  Falls back to AI-generated image if Open Food Facts finds nothing.
 *  Only caches real HTTP URLs in localStorage (not base64 to avoid storage overflow). */
export function useProductImage(productName: string, barcode?: string | null): string | null {
  const key = `gutcare-img5-${(barcode || productName).toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 60)}`;
  const [url, setUrl] = useState<string | null>(() => {
    try { return localStorage.getItem(key); } catch { return null; }
  });
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (url || fetchedRef.current) return;
    fetchedRef.current = true;

    const params = new URLSearchParams();
    if (productName) params.set("name", productName);
    if (barcode) params.set("barcode", barcode);

    fetch(`/api/product-image?${params}`)
      .then(r => r.json())
      .then((data: { url: string | null }) => {
        if (data?.url) {
          setUrl(data.url);
          // Only persist regular HTTP URLs to localStorage (base64 are too large)
          if (!data.url.startsWith("data:")) {
            try { localStorage.setItem(key, data.url); } catch {}
          }
        }
      })
      .catch(() => {});
  }, []);

  return url;
}
