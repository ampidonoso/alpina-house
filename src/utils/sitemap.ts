/**
 * Sitemap generator utility
 * Generates sitemap.xml dynamically based on routes and projects
 */

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapConfig {
  baseUrl: string;
  routes: SitemapUrl[];
  projects?: Array<{ slug: string; updated_at?: string }>;
}

/**
 * Generate sitemap.xml content
 */
export function generateSitemap(config: SitemapConfig): string {
  const { baseUrl, routes, projects = [] } = config;

  const urls: SitemapUrl[] = [
    ...routes,
    ...projects.map(project => ({
      loc: `${baseUrl}/modelos/${project.slug}`,
      lastmod: project.updated_at || new Date().toISOString(),
      changefreq: 'weekly' as const,
      priority: 0.8,
    })),
  ];

  const urlEntries = urls.map(url => {
    const parts = [
    `  <url>`,
    `    <loc>${escapeXml(url.loc)}</loc>`,
  ];

    if (url.lastmod) {
      parts.push(`    <lastmod>${url.lastmod}</lastmod>`);
    }

    if (url.changefreq) {
      parts.push(`    <changefreq>${url.changefreq}</changefreq>`);
    }

    if (url.priority !== undefined) {
      parts.push(`    <priority>${url.priority}</priority>`);
    }

    parts.push(`  </url>`);
    return parts.join('\n');
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Default routes for the sitemap
 */
export const defaultRoutes: SitemapUrl[] = [
  {
    loc: '/',
    changefreq: 'daily',
    priority: 1.0,
  },
  {
    loc: '/modelos',
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    loc: '/configurador',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    loc: '/quienes-somos',
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    loc: '/servicios',
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    loc: '/privacidad',
    changefreq: 'yearly',
    priority: 0.3,
  },
  {
    loc: '/terminos',
    changefreq: 'yearly',
    priority: 0.3,
  },
];
