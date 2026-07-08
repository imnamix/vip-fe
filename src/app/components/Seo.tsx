import { Helmet } from 'react-helmet-async';
import { SITE_NAME } from '../config/siteConfig';

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
}

export default function Seo({ title, description, path, image }: SeoProps) {
  // Uses the domain the app is actually being served from, so canonical/OG
  // URLs are correct on any environment (dev, staging, prod) with zero
  // manual config — whatever domain ends up in front of this app just works.
  const url = `${window.location.origin}${path}`;
  const fullTitle = `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
