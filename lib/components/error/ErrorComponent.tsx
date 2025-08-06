import Image from 'next/image';
import Img_404 from '@/public/images/404_error.png';
import { BACK_TO_HOME_TEXT } from '@/lib/constant/texts';
import { useRouter } from 'next/router';
import { trackingLoadPageErrorLog176 } from '@/lib/tracking/trackingCommon';
import { useEffect } from 'react';

type ErrorPageProps = {
  code?: number | string;
  message?: string;
  subMessage?: string;
  hideCode?: boolean;
};

const ErrorComponent = (props: ErrorPageProps) => {
  const { code, message, subMessage } = props;

  const router = useRouter();

  const handleBackHome = () => {
    router.push('/');
  };
  useEffect(() => {
    trackingLoadPageErrorLog176({
      Screen: 'PageError',
      ErrCode: code?.toString() || '',
      ErrMessage: message || '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-5 2xl:gap-8 mt-[124px] mb-[129px]">
        <div
          className="w-full max-w-[280px] 2xl:max-w-[520px] xl:max-w-[400px] lg:max-w-[380px]
            md:max-w-[320px] sm:max-w-[280px] overflow-hidden flex flex-col items-center justify-center"
        >
          <Image
            src={Img_404}
            alt={`${code}`}
            className="object-contain w-full h-auto"
          />
          {code && (
            <span
              className="text-[36px] 2xl:text-[72px] xl:text-[60px] lg:text-[50px] md:text-[44px] 
            sm:text-[36px] font-bold"
            >
              {code}
            </span>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <span className="text-[16px] 2xl:text-[24px] lg:text-[20px] md:text-[18px] sm:text-[16px] font-semibold text-white-smoke">
              {message}
            </span>
            <span className="text-[13px] 2xl:text-[16px] lg:text-[14px] md:text-[13px] font-normal text-spanish-gray">
              {subMessage}
            </span>
          </div>

          <div
            className="fpl-bg p-3 px-6 rounded-[40px] 
              hover:scale-110 hover:brightness-110 transition-transform transition-filter duration-300 
              ease-in-out will-change-transform will-change-filter cursor-pointer"
            onClick={handleBackHome}
          >
            <button className="text-[12px] 2xl:text-[16px] lg:text-[14px] sm:text-[13px] font-semibold text-white-smoke cursor-pointer">
              {BACK_TO_HOME_TEXT}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ErrorComponent;
