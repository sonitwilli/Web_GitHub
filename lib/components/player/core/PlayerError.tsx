import { useContext, useMemo } from 'react';
import { PlayerWrapperContext } from './PlayerWrapper';
import { useAppSelector } from '@/lib/store';
import getBrowser from '@/lib/utils/getBrowser';
import { APP_VERSION } from '@/lib/constant/texts';
import moment from 'moment';
import { useRouter } from 'next/router';
import { usePlayerPageContext } from '../context/PlayerPageContext';

export default function PlayerError() {
  const { shakaErrorDetail } = useAppSelector((s) => s.player);
  const isKeyExpired = useMemo(() => {
    if (!shakaErrorDetail) {
      return false;
    }
    const parsed = JSON.parse(shakaErrorDetail);
    return (
      parsed?.code === 1001 &&
      parsed?.data &&
      parsed?.data[1] &&
      parsed?.data[1] === 403
    );
  }, [shakaErrorDetail]);
  const { playerError } = useContext(PlayerWrapperContext);
  const { dataChannel } = usePlayerPageContext();
  const router = useRouter();
  const wrapperCtx = useContext(PlayerWrapperContext);
  const { closePlayerErrorModal } = wrapperCtx;
  const { info } = useAppSelector((s) => s.user);
  const userAgent = useMemo(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const ua = navigator.userAgent || '';
    const browser = getBrowser(ua);
    return browser;
  }, []);
  const currentTime = useMemo(() => {
    if (typeof window === 'undefined') {
      return;
    }
    return moment(new Date()).format('DD/MM/YYYY');
  }, []);
  const errorType = useMemo(() => {
    const { pathname } = router;
    const { time_shift_id } = router.query;
    if (pathname.includes('/xem-truyen-hinh/')) {
      if (time_shift_id) {
        return 'LiveTV Timeshift';
      } else {
        return 'LiveTV';
      }
    }

    if (pathname.includes('/playlist/')) {
      return 'Playlist';
    }

    if (pathname.includes('/xem-video/')) {
      return 'VOD';
    }

    if (pathname.includes('/cong-chieu/')) {
      return 'Premiere';
    }

    if (pathname.includes('/su-kien/')) {
      if (dataChannel?.type === 'eventtv') {
        return 'Event TV';
      } else {
        return 'Event';
      }
    }
    return '';
  }, [router, dataChannel]);

  return (
    <div className="fixed w-full h-full top-0 left-0 flex items-center justify-center z-[99] bg-black-06">
      <div className="w-[400px] max-w-full p-[32px] bg-eerie-black rounded-[16px]">
        <div className="text-center text-white-smoke font-[600] text-[24px] leading-[130%] tracking-[0.48px] mb-[16px]">
          Lỗi kết nối dịch vụ
        </div>
        <div className="text-center text-white-smoke leading-[130%] tracking-[0.32px] mb-[16px]">
          {isKeyExpired ? (
            <span className="text-spanish-gray modal-content-tracking">
              Phiên kết nối không hợp lệ
            </span>
          ) : (
            <>
              <span className="text-spanish-gray modal-content-tracking">
                {playerError?.content ||
                  'Kết nối tới dịch vụ tạm thời đang có lỗi hoặc gián đoạn. Bạn có thể thử lại sau hoặc chọn một nội dung khác.'}
              </span>{' '}
              <span className="text-dodger-blue">
                (Mã lỗi {playerError?.code || 'N/A'})
              </span>
            </>
          )}
        </div>
        {/* Thông tin chung */}
        <div className="mb-[32px] flex flex-col gap-[16px]">
          {info?.user_id_str && (
            <div className="flex items-center justify-between">
              <span className="text-left text-spanish-gray leading-[130%] tracking-[0.32px]">
                User ID
              </span>
              <span className="text-right text-white leading-[130%] tracking-[0.32px]">
                {info?.user_id_str}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-left text-spanish-gray leading-[130%] tracking-[0.32px]">
              Trình duyệt
            </span>
            <span className="text-right text-white leading-[130%] tracking-[0.32px]">
              {userAgent?.name} {userAgent?.version}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-left text-spanish-gray leading-[130%] tracking-[0.32px]">
              Phiên bản web
            </span>
            <span className="text-right text-white leading-[130%] tracking-[0.32px]">
              {APP_VERSION}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-left text-spanish-gray leading-[130%] tracking-[0.32px]">
              Thời gian
            </span>
            <span className="text-right text-white leading-[130%] tracking-[0.32px]">
              {currentTime}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-left text-spanish-gray leading-[130%] tracking-[0.32px]">
              Thể loại
            </span>
            <span className="text-right text-white leading-[130%] tracking-[0.32px]">
              {errorType}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-left text-spanish-gray leading-[130%] tracking-[0.32px] whitespace-nowrap pr-2">
              Nội dung
            </span>
            <span className="text-center text-white leading-[130%] tracking-[0.32px] line-clamp-2">
              {dataChannel?.name ||
                dataChannel?.title ||
                dataChannel?.title_vie ||
                dataChannel?.title_origin}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-[16px] text-white-smoke font-[600]">
          <button
            className="bg-charleston-green flex items-center justify-center h-[48px] hover:cursor-pointer rounded-[40px]"
            onClick={() => {
              if (closePlayerErrorModal) closePlayerErrorModal();
              router.push('/');
            }}
          >
            Đóng
          </button>
          <button
            className="fpl-bg flex items-center justify-center h-[48px] hover:cursor-pointer rounded-[40px]"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    </div>
  );
}
