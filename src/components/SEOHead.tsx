import { useEffect } from 'react';
import { useSiteConfigContext } from '@/contexts/SiteConfigContext';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

const SEOHead = ({ title, description, image, type = 'website' }: SEOHeadProps) => {
  const { getConfig, isLoading } = useSiteConfigContext();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    const siteUrl = getConfig('site_url', 'https://alpina-house.com');
    const currentUrl = `${siteUrl}${location.pathname}`;
    const metaTitle = title || getConfig('meta_title', 'Alpina House | Winteri Arquitectura');
    const metaDescription = description || getConfig('meta_description', 'Arquitectura eficiente lista para tu terreno. Modelos pre-diseñados a 30 UF/m² con entrega en 6 meses.');
    const metaImage = image || getConfig('og_image', `${siteUrl}/hero-refugio.jpg`);

    // Update document title
    document.title = metaTitle;

    // Update or create meta description
    updateMetaTag('name', 'description', metaDescription);

    // Update OG tags
    updateMetaTag('property', 'og:title', metaTitle);
    updateMetaTag('property', 'og:description', metaDescription);
    updateMetaTag('property', 'og:type', type);
    updateMetaTag('property', 'og:image', metaImage);
    updateMetaTag('property', 'og:url', currentUrl);

    // Update Twitter Card
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', metaTitle);
    updateMetaTag('name', 'twitter:description', metaDescription);
    updateMetaTag('name', 'twitter:image', metaImage);

    // Update canonical URL
    updateLinkTag('canonical', currentUrl);

    // Add Schema.org structured data
    addStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Alpina House',
      alternateName: 'Winteri Arquitectura',
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      description: metaDescription,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'CL',
        addressRegion: 'Región de Los Lagos',
        addressLocality: 'Puerto Varas'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        availableLanguage: ['Spanish']
      },
      sameAs: [
        // Add social media links if available
      ]
    });

    // Add LocalBusiness schema if on home page
    if (location.pathname === '/') {
      addStructuredData({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${siteUrl}#business`,
        name: 'Alpina House',
        image: metaImage,
        description: metaDescription,
        url: siteUrl,
        telephone: getConfig('phone', ''),
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'CL',
          addressRegion: 'Región de Los Lagos',
          addressLocality: 'Puerto Varas'
        },
        priceRange: '$$$',
        servesCuisine: 'Arquitectura y Construcción',
        areaServed: {
          '@type': 'Country',
          name: 'Chile'
        }
      });
    }
  }, [isLoading, getConfig, title, description, image, type, location.pathname]);

  return null;
};

function updateMetaTag(attribute: 'name' | 'property', value: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${value}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function addStructuredData(data: object) {
  // Remove existing script with same type if exists
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

export default SEOHead;
