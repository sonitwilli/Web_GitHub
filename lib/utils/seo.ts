import { getPageData } from '@/lib/api/blocks';
import { SeoProps, createDefaultSeoProps } from '@/lib/components/seo/SeoHead';

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
      });
    }

    const pageUrl = meta.canonical || fallbackUrl;

    return createDefaultSeoProps({
      ...(meta.meta_title && { title: meta.meta_title }),
      ...(meta.meta_description && { description: meta.meta_description }),
      url: pageUrl,
      ...(meta.meta_image && { ogImage: meta.meta_image }),
      robots: `${meta.index === 0 ? 'noindex' : 'index'}, ${
        meta.follow === 0 ? 'nofollow' : 'follow'
      }`,
    });
  } catch (error) {
    console.error(
      `Error fetching metadata for ${pathPrefix}/${pageId}:`,
      error,
    );

    // Fallback for SEO if API fails
    return createDefaultSeoProps({
      title: fallbackTitle,
      description: fallbackDescription,
      url: fallbackUrl,
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
}

/**
 * Creates SEO props from VOD detail data
 */
export const createSeoPropsFromVodData = (
  vodSeoData: VodSeoData | null | undefined,
  vodSlug: string,
  fallbackTitle?: string,
  fallbackDescription?: string,
  ogImage?: string,
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

  if (!vodSeoData) {
    return createDefaultSeoProps({
      title: fallbackTitle || 'FPT Play',
      description: fallbackDescription || 'FPT Play - Xem không giới hạn',
      url: canonicalUrl,
      ...(ogImage && { ogImage }),
    });
  }

  return createDefaultSeoProps({
    ...(vodSeoData.title && { title: vodSeoData.title }),
    ...(vodSeoData.description && { description: vodSeoData.description }),
    url: canonicalUrl,
    robots: `${vodSeoData.index === 1 ? 'index' : 'noindex'}, ${
      vodSeoData.follow === 1 ? 'follow' : 'nofollow'
    }`,
    ...(ogImage && { ogImage }),
  });
};
