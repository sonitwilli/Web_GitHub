import Image from 'next/image';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const DownloadLandingPageComponent = () => {
  const router = useRouter();

  useEffect(() => {
    const detectDeviceAndRedirect = () => {
      const userAgent = navigator.userAgent;
      
      if (/iPad|iPhone|iPod/.test(userAgent)) {
        router.push('https://apps.apple.com/app/id646297996');
        return;
      }
      
      if (/android/i.test(userAgent)) {
        router.push('https://play.google.com/store/apps/details?id=com.fplay.activity');
        return;
      }
    };

    detectDeviceAndRedirect();
  }, [router]);

  return (
    <div className="flex flex-col items-center min-h-screen sm:mx-15 xl:mx-25">
      <h1 className="text-xl text-center sm:text-[32px] font-bold mx-2 sm:mx-5 pt-25">
        Xem phim và truyền hình trực tuyến trên ứng dụng FPT Play
      </h1>
      <div className="flex flex-col items-center xl:flex-row">
        <Image
          src={'/images/landing-page/bg-Mobile-1.png'}
          alt="download-1"
          width={784}
          height={496}
          quality={100}
          className="object-cover object-[30%_10%] min-h-[400px] max-w-full h-auto"
        />

        <Image
          src={'/images/landing-page/bg-Mobile-2.png'}
          alt="download-2"
          width={560}
          height={496}
          quality={100}
          className="object-contain max-w-full h-auto px-2"
        />
      </div>
    </div>
  );
};

export default DownloadLandingPageComponent;
