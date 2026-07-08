import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/Store';
import { fetchBrandInfo } from '../store/slice/BrandInfoSlice';
import { SITE_NAME } from '../config/siteConfig';

// Sitewide SEO identity sourced from the admin "Brand Info" settings:
// title template, robots default, favicon, and a fallback OG image.
// Deliberately does NOT set meta description/keywords — every public route
// has its own <Seo> for that, so there's no ancestor/descendant tag to
// arbitrate between (react-helmet-async resolves duplicate tags by mount
// order, so leaving this ambiguity out entirely is safer than relying on it).
export default function BrandMeta() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: brand, initialized } = useSelector((state: RootState) => state.brandInfo);

  useEffect(() => {
    if (!initialized) dispatch(fetchBrandInfo());
  }, [dispatch, initialized]);

  const siteName = brand.companyName || SITE_NAME;

  return (
    <Helmet titleTemplate={`%s | ${siteName}`} defaultTitle={brand.metaTitle || siteName}>
      <meta name="robots" content="index, follow" />
      <meta property="og:site_name" content={siteName} />
      {brand.ogImage && <meta property="og:image" content={brand.ogImage} />}
      {brand.favicon && <link rel="icon" href={brand.favicon} />}
    </Helmet>
  );
}
