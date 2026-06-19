import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/Store';
import { fetchBrandInfo } from '../store/slice/BrandInfoSlice';

function upsertMeta(selector: string, attrKey: string, attrVal: string, content: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrKey, attrVal);
    document.head.appendChild(el);
  }
  el.content = content;
}

function applyToDom(brand: { metaTitle: string; metaDesc: string; keywords: string; ogImage: string; favicon: string }) {
  if (brand.metaTitle) document.title = brand.metaTitle;

  if (brand.metaDesc)
    upsertMeta('meta[name="description"]', 'name', 'description', brand.metaDesc);

  if (brand.keywords)
    upsertMeta('meta[name="keywords"]', 'name', 'keywords', brand.keywords);

  if (brand.ogImage)
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', brand.ogImage);

  if (brand.favicon) {
    // Update all existing icon link tags so browsers pick up the change
    const links = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
    if (links.length > 0) {
      links.forEach((l) => {
        (l as HTMLLinkElement).href = brand.favicon + '?v=' + Date.now();
      });
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = brand.favicon + '?v=' + Date.now();
      document.head.appendChild(link);
    }
  }
}

export function useBrandMeta() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: brand, initialized } = useSelector((state: RootState) => state.brandInfo);

  // Fetch only once per session
  useEffect(() => {
    if (!initialized) {
      dispatch(fetchBrandInfo());
    }
  }, [dispatch, initialized]);

  // Apply to DOM whenever brand data changes
  useEffect(() => {
    if (initialized) {
      applyToDom(brand);
    }
  }, [brand, initialized]);
}
