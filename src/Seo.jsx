import { Helmet } from 'react-helmet-async';

// Canonical production domain (matches public/index.html, robots.txt, sitemap.xml).
const SITE_URL = 'https://peachesfitnessclub.com';

/**
 * Per-route SEO tags (title, description, canonical, Open Graph, Twitter).
 * Googlebot renders JS so these are picked up on the client.
 * Social scrapers that don't run JS fall back to the defaults in public/index.html.
 */
export default function Seo({ title, description, path = '/', image = '/logo.png' }) {
  const url = `${SITE_URL}${path}`;
  const img = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet prioritizeSeoTags>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Peaches Fitness Club" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}
