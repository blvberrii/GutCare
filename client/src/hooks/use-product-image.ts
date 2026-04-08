import { useState, useEffect, useRef } from "react";

const IMAGE_FIELDS = "image_url,image_front_url,image_front_small_url,image_front_thumb_url,image_small_url,image_thumb_url";

function pickOffImage(product: any): string | null {
  if (!product) return null;
  return product.image_front_url || product.image_url || product.image_front_small_url
    || product.image_small_url || product.image_front_thumb_url || product.image_thumb_url || null;
}

/** Fetch product image: Open Food Facts first, then Unsplash stock photo fallback. */
export function useProductImage(productName: string, barcode?: string | null): string | null {
  const key = `gutcare-img3-${(barcode || productName).toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 60)}`;
  const [url, setUrl] = useState<string | null>(() => {
    try { return localStorage.getItem(key); } catch { return null; }
  });
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (url || fetchedRef.current) return;
    fetchedRef.current = true;

    const offEndpoint = barcode
      ? `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=${IMAGE_FIELDS}`
      : `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(productName)}&json=1&fields=${IMAGE_FIELDS}&page_size=5&action=process`;

    fetch(offEndpoint)
      .then(r => r.json())
      .then(data => {
        let imgUrl: string | null = null;
        if (barcode) {
          imgUrl = pickOffImage(data?.product);
        } else {
          const products: any[] = data?.products || [];
          for (const p of products) {
            imgUrl = pickOffImage(p);
            if (imgUrl) break;
          }
        }
        if (imgUrl) {
          setUrl(imgUrl);
          try { localStorage.setItem(key, imgUrl); } catch {}
        } else {
          const terms = productName.split(" ").slice(0, 3).join(" ");
          const fallback = `https://source.unsplash.com/200x200/?${encodeURIComponent(terms)},food,product`;
          setUrl(fallback);
          try { localStorage.setItem(key, fallback); } catch {}
        }
      })
      .catch(() => {
        const terms = productName.split(" ").slice(0, 3).join(" ");
        const fallback = `https://source.unsplash.com/200x200/?${encodeURIComponent(terms)},food`;
        setUrl(fallback);
      });
  }, []);

  return url;
}
