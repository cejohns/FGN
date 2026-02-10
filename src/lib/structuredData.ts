export interface Article {
  title: string;
  description: string;
  image?: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  url: string;
  tags?: string[];
}

export interface GameReview extends Article {
  rating?: number;
  gameName: string;
}

export function generateArticleSchema(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image || "https://yourdomain.com/NewFSELogo.png",
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "FireStar Gaming Network",
      "logo": {
        "@type": "ImageObject",
        "url": "https://yourdomain.com/NewFSELogo.png"
      }
    },
    "datePublished": article.publishedTime,
    "dateModified": article.modifiedTime || article.publishedTime,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    },
    ...(article.tags && {
      "keywords": article.tags.join(", ")
    })
  };
}

export function generateReviewSchema(review: GameReview) {
  const articleSchema = generateArticleSchema(review);

  return {
    ...articleSchema,
    "@type": "Review",
    "itemReviewed": {
      "@type": "VideoGame",
      "name": review.gameName,
      "image": review.image
    },
    ...(review.rating && {
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": 10,
        "worstRating": 0
      }
    })
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function generateVideoSchema(video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  embedUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.name,
    "description": video.description,
    "thumbnailUrl": video.thumbnailUrl,
    "uploadDate": video.uploadDate,
    ...(video.duration && { "duration": video.duration }),
    ...(video.embedUrl && { "embedUrl": video.embedUrl })
  };
}

export function generateGameSchema(game: {
  name: string;
  description: string;
  image?: string;
  genre?: string[];
  releaseDate?: string;
  publisher?: string;
  platform?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "name": game.name,
    "description": game.description,
    ...(game.image && { "image": game.image }),
    ...(game.genre && { "genre": game.genre }),
    ...(game.releaseDate && { "datePublished": game.releaseDate }),
    ...(game.publisher && {
      "publisher": {
        "@type": "Organization",
        "name": game.publisher
      }
    }),
    ...(game.platform && {
      "gamePlatform": game.platform
    })
  };
}

export function injectStructuredData(data: object) {
  const existingScript = document.querySelector('script[type="application/ld+json"][data-dynamic]');
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-dynamic', 'true');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function removeStructuredData() {
  const script = document.querySelector('script[type="application/ld+json"][data-dynamic]');
  if (script) {
    script.remove();
  }
}
