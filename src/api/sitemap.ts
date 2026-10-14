const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://global-flame-ministry-api-76b7d6e7f41a.herokuapp.com';
const SITE_URL = 'https://globalflameministry.org';

interface SlugItem {
  slug: string;
}

interface SitemapResponse {
  setHeader(name: string, value: string): void;
  status(code: number): SitemapResponse;
  send(body: string): void;
}

function url(loc: string, priority: string, changefreq: string): string {
  return `  <url>
    <loc>${loc}</loc>
    <priority>${priority}</priority>
    <changefreq>${changefreq}</changefreq>
  </url>`;
}

export default async function handler(_req: unknown, res: SitemapResponse) {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate');

  let sermonSlugs: string[] = [];
  let eventSlugs: string[] = [];
  let blogSlugs: string[] = [];
  let ministrySlugs: string[] = [];

  await Promise.all([
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/ministry/sermons?pageSize=500`);
        const json = await resp.json() as { data?: { items?: SlugItem[] } };
        sermonSlugs = (json.data?.items ?? []).map(i => i.slug).filter(Boolean);
      } catch (e) {
        console.error('Failed to fetch sermons for sitemap:', e);
      }
    })(),
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/ministry/events?pageSize=500&isCancelled=false`);
        const json = await resp.json() as { data?: { items?: SlugItem[] } };
        eventSlugs = (json.data?.items ?? []).map(i => i.slug).filter(Boolean);
      } catch (e) {
        console.error('Failed to fetch events for sitemap:', e);
      }
    })(),
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/blog?pageSize=500`);
        const json = await resp.json() as { data?: { items?: SlugItem[] } };
        blogSlugs = (json.data?.items ?? []).map(i => i.slug).filter(Boolean);
      } catch (e) {
        console.error('Failed to fetch blog posts for sitemap:', e);
      }
    })(),
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/ministry/ministries?pageSize=500`);
        const json = await resp.json() as { data?: { items?: SlugItem[] } };
        ministrySlugs = (json.data?.items ?? []).map(i => i.slug).filter(Boolean);
      } catch (e) {
        console.error('Failed to fetch ministries for sitemap:', e);
      }
    })(),
  ]);

  const staticRoutes = [
    { path: '/', priority: '1.0' },
    { path: '/about', priority: '0.8' },
    { path: '/sermons', priority: '0.8' },
    { path: '/events', priority: '0.8' },
    { path: '/ministries', priority: '0.8' },
    { path: '/blog', priority: '0.8' },
    { path: '/books', priority: '0.8' },
    { path: '/give', priority: '0.8' },
    { path: '/contact', priority: '0.8' },
    { path: '/announcements', priority: '0.8' },
    { path: '/plan-your-visit', priority: '0.8' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map(r => url(`${SITE_URL}${r.path}`, r.priority, 'weekly')).join('\n')}
${sermonSlugs.map(slug => url(`${SITE_URL}/sermons/${slug}`, '0.6', 'monthly')).join('\n')}
${eventSlugs.map(slug => url(`${SITE_URL}/events/${slug}`, '0.6', 'monthly')).join('\n')}
${blogSlugs.map(slug => url(`${SITE_URL}/blog/${slug}`, '0.6', 'monthly')).join('\n')}
${ministrySlugs.map(slug => url(`${SITE_URL}/ministries/${slug}`, '0.6', 'monthly')).join('\n')}
</urlset>`;

  res.status(200).send(xml);
}
