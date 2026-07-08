import { useEffect, useRef } from 'react';
import { RouterProvider } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { router } from './routes';
import BrandMeta from './components/BrandMeta';
import { initGA, trackPageView } from './utils/analytics';

export default function App() {
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    initGA();

    const track = (pathname: string, search: string) => {
      const path = pathname + search;
      if (path === lastTracked.current) return;
      lastTracked.current = path;
      // Admin usage isn't visitor traffic — keep it out of analytics.
      if (pathname.startsWith('/admin')) return;
      trackPageView(path);
    };

    track(router.state.location.pathname, router.state.location.search);
    return router.subscribe((state) => track(state.location.pathname, state.location.search));
  }, []);

  return (
    <HelmetProvider>
      <BrandMeta />
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </HelmetProvider>
  );
}
