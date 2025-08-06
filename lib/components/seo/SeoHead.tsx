import Head from 'next/head';

/**
 * SeoHead Component
 * 
 * A comprehensive SEO component for FPT Play that handles:
 * - Basic SEO metadata (title, description, keywords, robots)
 * - Open Graph tags for social sharing
 * - Twitter Card metadata
 * - Facebook App ID for social features
 * - App Links metadata for deep linking to mobile apps
 * - Google Play Store integration for Android apps
 * - Apple App Store integration for iOS apps
 * - Web fallback URLs for app links
 * 
 * Supports all major platforms: iOS, Android, iPad, iPhone, and web fallbacks
 */

export interface SeoProps {
  title: string;
  description: string;
  url: string;
  keywords?: string;
  ogImage?: string;
  robots?: string;
  fbAppId?: string;
  iosAppStoreId?: string;
  iosAppName?: string;
  iosAppUrl?: string;
  androidPackage?: string;
  androidAppName?: string;
  androidGooglePlayId?: string;
  ipadAppStoreId?: string;
  ipadAppName?: string;
  ipadAppUrl?: string;
  iphoneAppStoreId?: string;
  iphoneAppName?: string;
  iphoneAppUrl?: string;
  appleMobileWebAppTitle?: string;
  webFallbackUrl?: string;
  webShouldFallback?: boolean;
}

// Default SEO props
export const defaultSeoProps: SeoProps = {
  title: 'FPT Play: Xem Không Giới Hạn Phim, Show, Anime, TV, Thể Thao',
  description: 'Xem không giới hạn kho phim, anime đặc sắc, show đỉnh độc quyền, thể thao 24 giờ và các chương trình truyền hình trực tuyến mọi lúc mọi nơi.',
  url: 'https://fptplay.vn',
  keywords: 'Phim mới, VTV, HTV, Thể Thao, Truyền Hình Trực Tuyến, Bóng Đá, Phim Hàn Quốc, Phim Trung Quốc',
  ogImage: 'https://fptplay.vn/images/SEO-images/cover-img-n-x.jpg',
  robots: 'index, follow',
  fbAppId: '1168477793717754',
  iosAppStoreId: '646297996',
  iosAppName: 'FPT Play - TV Online',
  iosAppUrl: 'fptplay://app',
  androidPackage: 'com.fptplay.app',
  androidAppName: 'FPT Play - TV Online',
  androidGooglePlayId: '646297996',
  ipadAppStoreId: '646297996',
  ipadAppName: 'FPT Play - TV Online',
  ipadAppUrl: 'fptplay://app',
  iphoneAppStoreId: '646297996',
  iphoneAppName: 'FPT Play - TV Online',
  iphoneAppUrl: 'fptplay://app',
  appleMobileWebAppTitle: 'FPT Play - TV Online',
  webFallbackUrl: 'https://fptplay.vn',
  webShouldFallback: true,
};

// Utility function to create default SEO props with overrides
export const createDefaultSeoProps = (overrides: Partial<SeoProps> = {}): SeoProps => ({
  ...defaultSeoProps,
  ...overrides,
});

const SeoHead = ({ seo }: { seo: SeoProps }) => {
  const {
    title,
    description,
    url,
    keywords = 'Phim mới, VTV, HTV, Thể Thao, Truyền Hình Trực Tuyến, Bóng Đá, Phim Hàn Quốc, Phim Trung Quốc',
    ogImage = 'https://fptplay.vn/images/SEO-images/cover-img-n-x.jpg', // Default OG image from _app.tsx
    robots = 'index, follow',
    fbAppId,
    iosAppStoreId,
    iosAppName,
    iosAppUrl,
    androidPackage,
    androidAppName,
    androidGooglePlayId,
    ipadAppStoreId,
    ipadAppName,
    ipadAppUrl,
    iphoneAppStoreId,
    iphoneAppName,
    iphoneAppUrl,
    appleMobileWebAppTitle,
    webFallbackUrl,
    webShouldFallback = true,
  } = seo;

  const siteName = 'FPT Play';
  const twitterHandle = '@FPTPlay';

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <meta name="author" content={siteName} />

      {/* Viewport and Basic SEO */}
      <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
      <meta name="language" content="vi" />

      {/* --- Open Graph --- */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="vi_VN" />

      {/* --- Twitter Card --- */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* --- Facebook App ID --- */}
      {fbAppId && <meta property="fb:app_id" content={fbAppId} />}

      {/* --- App Links --- */}
      {/* iOS App Links */}
      {iosAppStoreId && <meta property="al:ios:app_store_id" content={iosAppStoreId} />}
      {iosAppName && <meta property="al:ios:app_name" content={iosAppName} />}
      {iosAppUrl && <meta property="al:ios:url" content={iosAppUrl} />}
      
      {/* iPad App Links */}
      {ipadAppStoreId && <meta property="al:ipad:app_store_id" content={ipadAppStoreId} />}
      {ipadAppName && <meta property="al:ipad:app_name" content={ipadAppName} />}
      {ipadAppUrl && <meta property="al:ipad:url" content={ipadAppUrl} />}
      
      {/* iPhone App Links */}
      {iphoneAppStoreId && <meta property="al:iphone:app_store_id" content={iphoneAppStoreId} />}
      {iphoneAppName && <meta property="al:iphone:app_name" content={iphoneAppName} />}
      {iphoneAppUrl && <meta property="al:iphone:url" content={iphoneAppUrl} />}
      
      {/* Android App Links */}
      {androidPackage && <meta property="al:android:package" content={androidPackage} />}
      {androidAppName && <meta property="al:android:app_name" content={androidAppName} />}
      {/* {androidAppUrl && <meta property="al:android:url" content={androidAppUrl} />} */}
      
      {/* Google Play Store Link - Additional URL for Google Play deep linking */}
      {androidGooglePlayId && (
        <meta property="al:android:url" content={`https://play.google.com/store/apps/details?id=${androidGooglePlayId}`} />
      )}
      
      {/* Web Fallback for App Links */}
      {webFallbackUrl && <meta property="al:web:url" content={webFallbackUrl} />}
      {webShouldFallback !== undefined && (
        <meta property="al:web:should_fallback" content={webShouldFallback ? 'true' : 'false'} />
      )}

      {/* --- Apple Mobile Web App --- */}
      {appleMobileWebAppTitle && <meta name="apple-mobile-web-app-title" content={appleMobileWebAppTitle} />}

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#e85b2d" />
      <meta name="msapplication-TileColor" content="#e85b2d" />

      {/* --- Canonical --- */}
      <link rel="canonical" href={url} />
    </Head>
  );
};

export default SeoHead;