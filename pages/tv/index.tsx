import Head from 'next/head';
import dynamic from 'next/dynamic';
import DefaultLayout from '@/lib/layouts/Default';
import { useEffect, useState, useContext, useMemo } from 'react';
import { AppContext } from '@/lib/components/container/AppContainer';
import { scaleImageUrl } from '@/lib/utils/methods';
import useScreenSize from '@/lib/hooks/useScreenSize';
import styles from '@/lib/components/login/LoginModal.module.css';

const LoginFastDialog = dynamic(
  () => import('@/lib/components/quickLogin/LoginFastDialog'),
  { ssr: false },
);

export default function LoginFastPage() {
  const title = 'Đăng nhập nhanh FPT Play trên Smart TV';
  const description =
    'Nhập mã kết nối từ Smart TV để đăng nhập FPT Play nhanh chóng. Trải nghiệm giải trí mượt mà không giới hạn.';
  const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/login-fast`;

  const { configs } = useContext(AppContext);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [bgLoaded, setBgLoaded] = useState(false);
  const [maskLoaded, setMaskLoaded] = useState(false);
  const { width } = useScreenSize();

  // Check if user is mobile
  const isTablet = useMemo(() => {
    return width <= 1280;
  }, [width]);

  const isMobile = useMemo(() => {
    return width <= 768;
  }, [width]);

  // Load background image from API
  useEffect(() => {
    if (configs?.image?.bg_signin_signup_tv) {
      const url = scaleImageUrl({
        imageUrl: configs.image.bg_signin_signup_tv,
        width: isTablet ? width : 1080,
      });
      if (url) {
        setBackgroundImage(url as string);
        const img = new Image();
        img.src = url;
        img.onload = () => setBgLoaded(true);
      }
    }
  }, [configs, isTablet, width]);

  // Load mask
  useEffect(() => {
    const mask = new Image();
    mask.src = '/images/Mask_Quick_Login.png';
    mask.onload = () => setMaskLoaded(true);
  }, []);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <DefaultLayout>
        <main className="fixed w-full h-screen overflow-hidden">
          {/* Background image */}
          {bgLoaded &&
            (isTablet || isMobile ? (
              <div className="absolute inset-0 z-1 transition-opacity duration-500 opacity-100">
                <img
                  src={`${
                    isMobile
                      ? '/images/mobile-mask.png'
                      : '/images/mask-tablet.png'
                  }`}
                  alt="shadow"
                  className="absolute inset-0 top-[90px] left-0 w-full h-auto object-cover"
                />
                <img
                  src={backgroundImage}
                  alt="background"
                  className="mt-[80px] w-full h-auto object-fill"
                />
              </div>
            ) : (
              <div
                className="absolute inset-0 z-[1] bg-cover bg-top"
                style={{ backgroundImage: `url(${backgroundImage})` }}
              />
            ))}

          {/* Mask overlay */}
          {maskLoaded && (
            <div
              className={`absolute inset-0 z-[2] bg-cover ${
                isTablet || isMobile ? styles.bgMaskMobile : styles.bgMask
              }`}
            />
          )}

          {/* Content layer */}
          <div className="relative z-[3]">
            <LoginFastDialog />
          </div>
        </main>
      </DefaultLayout>
    </>
  );
}
