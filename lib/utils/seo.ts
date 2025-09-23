import { getPageData } from '@/lib/api/blocks';
import { SeoProps, createDefaultSeoProps } from '@/lib/components/seo/SeoHead';

// Function to determine robots value based on URL patterns
const getRobotsValueFromUrl = (url: string): string | null => {
  // index, follow
  if (
    url.endsWith('/tv') || 
    url.includes('/tv?') || 
    (url.includes('/xem-video/') && !url.includes('/tap-'))
  ) {
    return 'index, follow';
  }
  
  // noindex, follow  
  if (
    url.includes('/tim-kiem/') ||
    url.includes('/mua-goi') ||
    url.includes('/mua-goi/') ||
    url.includes('/dien-vien/') ||
    url.includes('/tai-khoan/') ||
    (url.includes('/xem-video/') && url.includes('/tap-'))
  ) {
    return 'noindex, follow';
  }
  
  // noindex, nofollow
  if (
    url.includes('/su-kien/') ||
    url.includes('/thong-tin/') ||
    url.includes('/cong-chieu/') ||
    url.includes('/block/highlight/')
  ) {
    return 'noindex, nofollow';
  }

  return null;
};

interface MetaData {
  meta_title?: string;
  name?: string;
  meta_description?: string;
  meta_image?: string;
  canonical?: string;
  index?: number;
  follow?: number;
}

interface CreateSeoPropsFromMetaOptions {
  pageId: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  pathPrefix?: string;
}

/**
 * Creates SEO props from page metadata with fallbacks
 */
export const createSeoPropsFromMeta = async ({
  pageId,
  fallbackTitle = 'FPT Play',
  fallbackDescription = 'FPT Play - Xem không giới hạn',
  pathPrefix = '/trang',
}: CreateSeoPropsFromMetaOptions): Promise<SeoProps> => {
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fptplay.vn';
  const fallbackUrl = `${siteUrl}${pathPrefix}/${pageId}`;

  try {
    let apiPageId = pageId;
    if (pathPrefix.includes('/block/')) {
      apiPageId = `${pathPrefix}`.replace(/^\/block/, '');
    }
    
    const pageDataRes = await getPageData({ page_id: apiPageId });
    const meta = pageDataRes?.data?.data?.meta;
    //console.log(`SEO Props ${apiPageId}:`, meta);
    if (!meta || (!meta.meta_title && !meta.name && !meta.meta_description && !meta.meta_image)) {
      return createDefaultSeoProps({
        title: fallbackTitle,
        description: fallbackDescription,
        url: fallbackUrl,
        robots: getRobotsValueFromUrl(fallbackUrl) || 'index, follow',
      });
    }

    const pageUrl = meta.canonical || fallbackUrl;

    // Force replace robots based on URL patterns, otherwise use API data
    const robotsOverride = getRobotsValueFromUrl(pageUrl);
    const robotsValue = robotsOverride || `${meta.index === 0 ? 'noindex' : 'index'}, ${
      meta.follow === 0 ? 'nofollow' : 'follow'
    }`;

    return createDefaultSeoProps({
      ...(meta.meta_title && { title: meta.meta_title }),
      ...(meta.meta_description && { description: meta.meta_description }),
      url: pageUrl,
      ...(meta.meta_image && { ogImage: meta.meta_image }),
      robots: robotsValue,
    });
  } catch (error) {
    console.error(
      `Error fetching metadata for ${pathPrefix}/${pageId}:`,
      error,
    );

    return createDefaultSeoProps({
      title: fallbackTitle,
      description: fallbackDescription,
      url: fallbackUrl,
      robots: getRobotsValueFromUrl(fallbackUrl) || 'index, follow',
    });
  }
};

/**
 * Creates SEO props from metadata object (for when you already have the meta data)
 */
export const createSeoPropsFromMetaData = (
  meta: MetaData,
  pageId: string,
  pathPrefix: string = '/trang',
): SeoProps => {
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fptplay.vn';
  const pageUrl = meta.canonical || `${siteUrl}${pathPrefix}/${pageId}`;

  return createDefaultSeoProps({
    ...(meta.meta_title && { title: meta.meta_title }),
    ...(meta.meta_description && { description: meta.meta_description }),
    url: pageUrl,
    ...(meta.meta_image && { ogImage: meta.meta_image }),
    robots: `${meta.index === 1 ? 'index' : 'noindex'}, ${
      meta.follow === 1 ? 'follow' : 'nofollow'
    }`,
  });
};

interface VodSeoData {
  index?: number;
  follow?: number;
  description?: string;
  title?: string;
  sameAs?: string[];
  max_video_preview?: string;
  alternateName?: string[];
  max_image_preview?: string;
  availableLanguage?: string[];
  canonical?: string;
}

/**
 * Generates TV Series structured data for Google Star Rating
 */
const generateTVSeriesStructuredData = (
  vodData: Record<string, unknown>,
  url: string,
  title: string,
  description: string,
  image?: string,
  seoData?: VodSeoData | null,
): Record<string, unknown> | null => {
  // Extract rating data
  const highlightedInfo = vodData.highlighted_info as Array<{ type?: string; avg_rate?: string; count?: string }> | undefined;
  const ratingInfo = highlightedInfo?.find(info => info.type === 'rating');
  const ratingValue = ratingInfo?.avg_rate ? parseFloat(ratingInfo.avg_rate) : 0;
  const reviewCount = ratingInfo?.count ? parseInt(ratingInfo.count.replace(/[()]/g, ''), 10) : 0;

  // Get movie release date
  const movieReleaseDate = vodData.movie_release_date ? parseInt(String(vodData.movie_release_date), 10) : undefined;

  // Extract image data
  const imageData = vodData.image as { landscape_title?: string; thumb?: string } | undefined;
  const finalImage = image || 
                    (vodData.landscape_title as string) || 
                    (imageData?.landscape_title) || 
                    (vodData.thumb as string) || 
                    (imageData?.thumb) || 
                    (vodData.background as string) || 
                    (vodData.standing_thumb as string) || 
                    '';

  // Determine if it's a TV series or movie based on episode count
  const episodeTotal = vodData.episode_total ? parseInt(String(vodData.episode_total), 10) : 1;
  const isMovie = episodeTotal <= 1;

  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': isMovie ? 'Movie' : 'TVSeries',
    url,
    name: title,
    image: finalImage,
  };

  // Only add aggregateRating if we have rating data
  if (reviewCount > 0) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue,
      ratingCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add dates if available
  if (movieReleaseDate) {
    structuredData.dateCreated = movieReleaseDate;
    structuredData.startDate = movieReleaseDate;
  }

  // Add only the specific SEO fields we need for structured data
  if (seoData) {
    // Only extract the fields we actually need
    const { description, availableLanguage, canonical, sameAs, alternateName } = seoData;

    // Map specific fields to schema.org properties
    if (description && description.trim()) {
      structuredData.description = description;
    } else {
      // Fallback to VOD data description if SEO description is empty
      const vodDescription = vodData.description as string;
      if (vodDescription && vodDescription.trim()) {
        structuredData.description = vodDescription;
      }
    }
    if (availableLanguage && availableLanguage.length > 0) {
      structuredData.inLanguage = availableLanguage[0]; // Use first language as string
      structuredData.availableLanguage = availableLanguage; // Keep array for all languages
    }
    if (canonical) {
      structuredData.url = canonical;
    }
    if (sameAs && sameAs.length > 0) {
      structuredData.sameAs = sameAs;
    }
    if (alternateName && alternateName.length > 0) {
      structuredData.alternateName = alternateName;
    }
  }

  return structuredData;
};

/**
 * Creates SEO props from VOD detail data
 */
export const createSeoPropsFromVodData = (
  vodSeoData: VodSeoData | null | undefined,
  vodSlug: string,
  fallbackTitle?: string,
  fallbackDescription?: string,
  ogImage?: string,
  vodData?: Record<string, unknown>,
): SeoProps => {
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fptplay.vn';

  // Handle short-video URLs differently
  let canonicalUrl: string;
  if (vodSlug.startsWith('short-videos/')) {
    canonicalUrl = `${siteUrl}/short-videos`;
  } else {
    // Remove episode part from slug for canonical URL (e.g., "/tap-1", "/tap-2", etc.)
    const canonicalSlug = vodSlug.replace(/\/tap-\d+$/, '');
    canonicalUrl = `${siteUrl}/xem-video/${canonicalSlug}`;
  }

  // Use original slug with episode info for robots logic
  const originalUrl = `${siteUrl}/xem-video/${vodSlug}`;

  // Override canonical URL if provided in SEO data
  const finalCanonicalUrl = (vodSeoData?.canonical && vodSeoData.canonical.trim()) 
    ? vodSeoData.canonical 
    : canonicalUrl;

  // Determine final title and description based on SEO data availability
  const finalTitle = (vodSeoData?.title && vodSeoData.title.trim()) 
    ? vodSeoData.title 
    : (fallbackTitle || 'FPT Play');
  const finalDescription = (vodSeoData?.description && vodSeoData.description.trim()) 
    ? vodSeoData.description 
    : (fallbackDescription || 'FPT Play - Xem không giới hạn');

  // Generate structured data if VOD data is available (same logic for both branches)
  const structuredData: Record<string, unknown>[] = [];
  if (vodData) {
    const googleStarRatingData = generateTVSeriesStructuredData(vodData, finalCanonicalUrl, finalTitle, finalDescription, ogImage, vodSeoData);
    if (googleStarRatingData) {
      structuredData.push(googleStarRatingData);
    }
  }

  if (!vodSeoData) {
    return createDefaultSeoProps({
      title: finalTitle,
      description: finalDescription,
      url: finalCanonicalUrl,
      robots: getRobotsValueFromUrl(originalUrl) || 'index, follow',
      ...(ogImage && { ogImage }),
      ...(structuredData.length > 0 && { structuredData }),
    });
  }

  // Force replace robots based on URL patterns for main branch
  const robotsOverride = getRobotsValueFromUrl(originalUrl);
  let robotsValue = robotsOverride || `${vodSeoData.index === 1 ? 'index' : 'noindex'}, ${
    vodSeoData.follow === 1 ? 'follow' : 'nofollow'
  }`;

  // Add max video preview and max image preview directives if provided
  const additionalRobotsDirectives: string[] = [];
  if (vodSeoData.max_video_preview && vodSeoData.max_video_preview.trim()) {
    additionalRobotsDirectives.push(`max-video-preview:${vodSeoData.max_video_preview}`);
  }
  if (vodSeoData.max_image_preview && vodSeoData.max_image_preview.trim()) {
    additionalRobotsDirectives.push(`max-image-preview:${vodSeoData.max_image_preview}`);
  }
  
  if (additionalRobotsDirectives.length > 0) {
    robotsValue = `${robotsValue}, ${additionalRobotsDirectives.join(', ')}`;
  }

  return createDefaultSeoProps({
    title: finalTitle,
    description: finalDescription,
    url: finalCanonicalUrl,
    robots: robotsValue,
    ...(ogImage && { ogImage }),
    ...(structuredData.length > 0 && { structuredData }),
  });
};

interface ChannelSeoData {
  index?: number;
  follow?: number;
  description?: string;
  title?: string;
  canonical?: string;
}

/**
 * Creates SEO props from Channel detail data
 */
export const createSeoPropsFromChannelData = (
  channelSeoData: ChannelSeoData | null | undefined,
  channelId: string,
  fallbackTitle?: string,
  fallbackDescription?: string,
  ogImage?: string,
): SeoProps => {
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fptplay.vn';
  const canonicalUrl = `${siteUrl}/xem-truyen-hinh/${channelId}`;

  if (!channelSeoData) {
    return createDefaultSeoProps({
      title: fallbackTitle || 'FPT Play - Xem Truyền Hình',
      description: fallbackDescription || 'FPT Play - Xem truyền hình trực tuyến chất lượng cao',
      url: canonicalUrl,
      robots: getRobotsValueFromUrl(canonicalUrl) || 'index, follow',
      ...(ogImage && { ogImage }),
    });
  }

  // Force replace robots based on URL patterns
  const robotsOverride = getRobotsValueFromUrl(canonicalUrl);
  const robotsValue = robotsOverride || `${channelSeoData.index === 1 ? 'index' : 'noindex'}, ${
    channelSeoData.follow === 1 ? 'follow' : 'nofollow'
  }`;

  // Use SEO data if available, otherwise fallback to main channel data
  const finalTitle = (channelSeoData.title && channelSeoData.title.trim()) 
    ? channelSeoData.title 
    : (fallbackTitle || 'FPT Play - Xem Truyền Hình');
  const finalDescription = (channelSeoData.description && channelSeoData.description.trim()) 
    ? channelSeoData.description 
    : (fallbackDescription || 'FPT Play - Xem truyền hình trực tuyến chất lượng cao');

  const finalUrl = (channelSeoData.canonical && channelSeoData.canonical.trim()) 
    ? channelSeoData.canonical 
    : canonicalUrl;

  return createDefaultSeoProps({
    title: finalTitle,
    description: finalDescription,
    url: finalUrl,
    robots: robotsValue,
    ...(ogImage && { ogImage }),
  });
};