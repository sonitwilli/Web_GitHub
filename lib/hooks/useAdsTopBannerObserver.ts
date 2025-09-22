import { useElementObserver } from '@/lib/hooks/useElementObserver';

/**
 * Hook chuyên dụng để lắng nghe khi Top Banner Ads xuất hiện
 * Lắng nghe element có class "ads_top_banner mt-[40px] tablet:mt-[80px]"
 */
export const useAdsTopBannerObserver = (
  onAppear?: (element: Element) => void,
  onDisappear?: (element: Element) => void,
) => {
  return useElementObserver({
    selector: '.ads_top_banner.mt-\\[40px\\].tablet\\:mt-\\[80px\\]',
    onElementAppear: onAppear,
    onElementDisappear: onDisappear,
    rootMargin: '0px',
    threshold: 0.1, // Trigger khi 10% element visible
  });
};

/**
 * Hook đơn giản hơn để lắng nghe Top Banner Ads với class cơ bản
 * Lắng nghe element có class "ads_top_banner"
 */
export const useTopBannerAdsObserver = (
  onAppear?: (element: Element) => void,
  onDisappear?: (element: Element) => void,
) => {
  return useElementObserver({
    selector: '.ads_top_banner',
    onElementAppear: onAppear,
    onElementDisappear: onDisappear,
    rootMargin: '0px',
    threshold: 0.1,
  });
};

export default useAdsTopBannerObserver;
