import { useEffect } from 'react';
import { useProjects } from '@/hooks/useProjects';
import { generateSitemap, defaultRoutes } from '@/utils/sitemap';
import { useSiteConfigContext } from '@/contexts/SiteConfigContext';
import { logger } from '@/lib/logger';

/**
 * Sitemap page that generates XML sitemap dynamically
 * This should be served at /sitemap.xml route
 */
const SitemapPage = () => {
  const { data: projects = [] } = useProjects();
  const { getConfig } = useSiteConfigContext();
  const baseUrl = getConfig('site_url', 'https://alpina-house.com');

  useEffect(() => {
    const sitemap = generateSitemap({
      baseUrl,
      routes: defaultRoutes,
      projects: projects.map(p => ({
        slug: p.slug,
        updated_at: p.updated_at,
      })),
    });

    // Set content type and return XML
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    // In a real implementation, this would be handled server-side
    // For now, we'll just log it
    logger.debug('Sitemap generated:', sitemap);
  }, [projects, baseUrl, getConfig]);

  return null;
};

export default SitemapPage;
