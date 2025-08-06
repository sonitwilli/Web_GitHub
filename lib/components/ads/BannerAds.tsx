import useScroll from '@/lib/hooks/useScroll';
import styles from './BannerAds.module.css';
export default function BannerAds() {
  const { scrollDistance } = useScroll();

  return (
    <div
      className={`${styles.bannerAds} ${
        scrollDistance === 0 ? 'mb-[12px]' : ''
      }`}
    >
      {scrollDistance === 0 ? (
        <div className={styles.img_container}>
          <img src="/images/ads.webp" alt="ads" />
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
