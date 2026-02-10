import { useEffect } from 'react';
import { injectStructuredData, removeStructuredData } from './structuredData';

export interface SEOMetadata {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: object;
}

export function useSEO(metadata: SEOMetadata) {
  useEffect(() => {
    const baseTitle = 'FireStar Gaming Network';
    const fullTitle = metadata.title === baseTitle
      ? baseTitle
      : `${metadata.title} | ${baseTitle}`;

    document.title = fullTitle;

    const metaTags: Record<string, string> = {
      description: metadata.description,
      'og:title': metadata.title,
      'og:description': metadata.description,
      'og:type': metadata.type || 'website',
      'twitter:card': 'summary_large_image',
      'twitter:title': metadata.title,
      'twitter:description': metadata.description,
    };

    if (metadata.image) {
      metaTags['og:image'] = metadata.image;
      metaTags['twitter:image'] = metadata.image;
    }

    if (metadata.url) {
      metaTags['og:url'] = metadata.url;
    }

    if (metadata.author) {
      metaTags['article:author'] = metadata.author;
    }

    if (metadata.publishedTime) {
      metaTags['article:published_time'] = metadata.publishedTime;
    }

    if (metadata.modifiedTime) {
      metaTags['article:modified_time'] = metadata.modifiedTime;
    }

    Object.entries(metaTags).forEach(([name, content]) => {
      if (!content) return;

      const property = name.startsWith('og:') || name.startsWith('article:') ? 'property' : 'name';
      let element = document.querySelector(`meta[${property}="${name}"]`) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(property, name);
        document.head.appendChild(element);
      }

      element.content = content;
    });

    if (metadata.structuredData) {
      injectStructuredData(metadata.structuredData);
    }

    return () => {
      document.title = baseTitle;
      if (metadata.structuredData) {
        removeStructuredData();
      }
    };
  }, [metadata]);
}

export const defaultSEO: SEOMetadata = {
  title: 'FireStar Gaming Network',
  description: 'Your ultimate destination for gaming news, reviews, guides, and community content. Stay updated with the latest in gaming.',
  type: 'website',
};

export const pageSEO = {
  home: {
    title: 'FireStar Gaming Network',
    description: 'Your ultimate destination for gaming news, reviews, guides, and community content. Stay updated with the latest in gaming.',
    type: 'website' as const,
  },
  news: {
    title: 'Gaming News',
    description: 'Latest gaming news, updates, and announcements from the industry. Stay informed with FireStar Gaming Network.',
    type: 'website' as const,
  },
  reviews: {
    title: 'Game Reviews',
    description: 'In-depth game reviews and ratings. Find out if your next game is worth playing with FireStar Gaming Network.',
    type: 'website' as const,
  },
  blog: {
    title: 'Gaming Blog',
    description: 'Gaming insights, opinions, and editorial content from the FireStar Gaming Network team.',
    type: 'website' as const,
  },
  guides: {
    title: 'Gaming Guides',
    description: 'Comprehensive gaming guides, tutorials, and tips to help you master your favorite games.',
    type: 'website' as const,
  },
  videos: {
    title: 'Gaming Videos',
    description: 'Watch the latest gaming videos, trailers, gameplay, and content from FireStar Gaming Network.',
    type: 'website' as const,
  },
  gallery: {
    title: 'Gaming Gallery',
    description: 'Stunning gaming screenshots, concept art, and visual content from the gaming world.',
    type: 'website' as const,
  },
  releases: {
    title: 'Game Release Calendar',
    description: 'Never miss a release! Track upcoming game releases and stay updated with launch dates.',
    type: 'website' as const,
  },
};
