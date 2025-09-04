/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  IS_PREVIEW_LIVE,
  PREVIEW_MESSAGES,
  VIDEO_ID,
  IS_NOT_RESET_PLAYING_SESSION,
} from '@/lib/constant/texts';
import SeparatorLine from '@/lib/components/svg/SeparatorLine';
import { IoClose } from 'react-icons/io5';
import {
  fetchPackagesPreview,
  PackagePreview,
  checkAccountStatus,
} from '@/lib/api/payment';
import ModalWrapper from '@/lib/components/modal/ModalWrapper';
import PackageListModal from '../../modal/PackageListModal';
import ModalConfirm, { ModalContent } from '../../modal/ModalConfirm';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { useRouter } from 'next/router';
import { useAppSelector } from '@/lib/store';
import { useAppDispatch } from '@/lib/store';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import { AxiosError } from 'axios';
import { trackingStoreKey } from '@/lib/constant/tracking';
import useCodec from '@/lib/hooks/useCodec';

export type PreviewType = 'vod' | 'playlist' | 'live' | 'event' | 'channel';

interface CurrentUser {
  id: string;
  name: string;
}

interface PaymentData {
  id: string;
  planType: string;
}

interface RequireObjMsg {
  title?: string;
  subtitle?: string;
  available?: string;
}

interface CurrentStream {
  require_obj_msg?: RequireObjMsg;
}

interface DataEndedPreviewEvent {
  is_ended?: boolean;
  url_banner_event?: string;
}

interface PlayerErrorType {
  content?: string;
  code?: string;
}

interface PreviewProps {
  type: PreviewType;
  currentUser?: CurrentUser | null;
  isPreviewActive?: boolean;
  isPreviewEnded?: boolean;
  isTvod?: boolean;
  requireVipPlan?: string;
  paymentData?: PaymentData | null;
  currentStream?: CurrentStream | null;
  dataEndedPreviewEvent?: DataEndedPreviewEvent | null;
  onExitPreviewLive?: (url: string) => void;
  onExitPreviewEvent?: () => void;
  onBuyPackage?: (planType: string) => void;
  playerError?: PlayerErrorType | undefined;
}

const Preview: React.FC<PreviewProps> = ({
  type,
  currentUser = null,
  isPreviewActive = false,
  isPreviewEnded = false,
  isTvod = false,
  requireVipPlan,
  paymentData = null,
  currentStream = null,
  dataEndedPreviewEvent = null,
  onExitPreviewLive,
  onExitPreviewEvent,
  playerError,
}) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    isEndVideo,
    hlsErrors,
    dataStream,
    dataChannel,
    realPlaySeconds,
    stopPlayerStream,
  } = usePlayerPageContext();
  const { messageConfigs } = useAppSelector((s) => s.app);
  const { isLogged } = useAppSelector((state) => state.user);
  const userInfo = useAppSelector((state) => state.user.info);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { setIsVideoPaused } = usePlayerPageContext();

  // Helper to check if type is live-like (live, channel, event)
  const isLiveType = type === 'live' || type === 'channel' || type === 'event';

  // Packages and modal
  const [packages, setPackages] = useState<PackagePreview[]>([]);
  const [showPackageModal, setShowPackageModal] = useState(false);

  // Modal confirm state - uncomment for account status check
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalContent, setConfirmModalContent] = useState<ModalContent>({
    title: '',
    content: '',
    buttons: {
      accept: 'Đóng',
    },
  });

  const { getUrlToPlayH264 } = useCodec({
    dataChannel,
    dataStream,
  });

  const isLiveEnded = useMemo(() => {
    return (
      isLiveType &&
      currentStream?.require_obj_msg?.available === '0' &&
      !getUrlToPlayH264()
    );
  }, [isLiveType, currentStream, getUrlToPlayH264]);

  // Single preview state
  const [previewState, setPreviewState] = useState<
    'popup' | 'background' | 'banner' | null
  >(null);

  // Track if user has manually closed the popup
  const [isPopupManuallyClosed, setIsPopupManuallyClosed] = useState(false);

  const PREVIEW_TIME_LIMIT = 300; // 5 minutes in seconds

  // Track preview time elapsed based on real play seconds
  useEffect(() => {
    if (
      isLiveType &&
      isPreviewActive &&
      realPlaySeconds &&
      realPlaySeconds > 0
    ) {
      // Auto stop when time limit reached
      if (realPlaySeconds >= PREVIEW_TIME_LIMIT) {
        handleAutoStopPreview();
      }
    }
  }, [isLiveType, isPreviewActive, realPlaySeconds, PREVIEW_TIME_LIMIT]);

  // Auto hide popup if user is logged in and no payment required
  // But skip this for live/event when user is not logged in
  useEffect(() => {
    if (previewState === 'popup' && isPreviewActive) {
      const timer = setTimeout(() => {
        if (currentUser && !paymentData) {
          setPreviewState(null);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, paymentData, isPreviewActive, previewState]);

  // Setup video element reference
  useEffect(() => {
    const videoElement = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (videoElement) {
      videoRef.current = videoElement;
    }
  }, []);

  // Load packages when opening modal
  useEffect(() => {
    if (showPackageModal && packages.length === 0) {
      const vipPlan = dataStream?.require_vip_plan || requireVipPlan || '';
      fetchPackagesPreview(vipPlan)
        .then((data) => setPackages(data))
        .catch(() => setPackages([]));
    }
  }, [showPackageModal]);

  useEffect(() => {
    const redirectToBuy = localStorage.getItem(
      trackingStoreKey.REDIRECT_TO_BUY,
    );
    if (redirectToBuy) {
      router.push(redirectToBuy);
      localStorage.removeItem(trackingStoreKey.REDIRECT_TO_BUY);
    }
  }, []);

  // Banner state for live event ended
  useEffect(() => {
    if (
      previewState === 'background' &&
      isLiveType &&
      dataEndedPreviewEvent?.is_ended
    ) {
      setPreviewState('banner');
    }
  }, [previewState, type, dataEndedPreviewEvent]);

  // Reset manual close state when page reloads or route changes
  useEffect(() => {
    setIsPopupManuallyClosed(false);
  }, [router.asPath]);

  // --- TEXT FROM CONFIGS (preview) ---
  const previewConfig = messageConfigs?.preview || {};

  const popupMessage = useMemo(() => {
    if (type === 'vod' || type === 'playlist') {
      if (isTvod)
        return previewConfig.msg_rent_movie || PREVIEW_MESSAGES.VOD.POPUP.TVOD;
      return previewConfig.msg_buy_package || PREVIEW_MESSAGES.VOD.POPUP.SVOD;
    }
    return (
      previewConfig.msg_buy_package_for_channel ||
      PREVIEW_MESSAGES.LIVE.POPUP.DEFAULT
    );
  }, [type, isTvod, previewConfig]);

  const popupButtonText = useMemo(() => {
    if (type === 'vod' || type === 'playlist') {
      if (isTvod)
        return previewConfig.btn_rent_movie || PREVIEW_MESSAGES.VOD.BUTTON.TVOD;
      return previewConfig.btn_buy_package || PREVIEW_MESSAGES.VOD.BUTTON.SVOD;
    }
    return (
      previewConfig.btn_buy_package || PREVIEW_MESSAGES.LIVE.BUTTON.DEFAULT
    );
  }, [type, isTvod, previewConfig]);

  const backgroundTitle = useMemo(() => {
    if (type === 'vod' || type === 'playlist') {
      if (isTvod)
        return (
          previewConfig.title_end_preview_rent_movie ||
          PREVIEW_MESSAGES.VOD.BACKGROUND.TITLE.TVOD
        );
      return (
        previewConfig.title_end_preview_by_package ||
        PREVIEW_MESSAGES.VOD.BACKGROUND.TITLE.SVOD
      );
    }
    return (
      currentStream?.require_obj_msg?.title ||
      PREVIEW_MESSAGES.LIVE.BACKGROUND.TITLE
    );
  }, [type, isTvod, previewConfig, currentStream]);

  const backgroundDescription = useMemo(() => {
    if (type === 'vod' || type === 'playlist') {
      if (isTvod)
        return (
          previewConfig.msg_end_preview_rent_movie ||
          PREVIEW_MESSAGES.VOD.BACKGROUND.DESCRIPTION.TVOD
        );
      return (
        previewConfig.msg_end_preview_by_package ||
        PREVIEW_MESSAGES.VOD.BACKGROUND.DESCRIPTION.SVOD
      );
    }
    return (
      currentStream?.require_obj_msg?.subtitle ||
      PREVIEW_MESSAGES.LIVE.BACKGROUND.DESCRIPTION
    );
  }, [type, isTvod, previewConfig, currentStream]);

  const backgroundButtonText = useMemo(() => {
    if (type === 'vod' || type === 'playlist') {
      if (isTvod)
        return (
          previewConfig.btn_rent_movie ||
          PREVIEW_MESSAGES.VOD.BACKGROUND.BUTTON.TVOD
        );
      return (
        previewConfig.btn_buy_package ||
        PREVIEW_MESSAGES.VOD.BACKGROUND.BUTTON.SVOD
      );
    }
    return (
      previewConfig.btn_buy_package || PREVIEW_MESSAGES.LIVE.BUTTON.DEFAULT
    );
  }, [type, isTvod, previewConfig]);

  // --- HANDLERS ---
  const handleAutoStopPreview = useCallback(() => {
    // Stop player stream
    if (stopPlayerStream) {
      stopPlayerStream();
    }

    // Pause the video context state
    if (setIsVideoPaused) {
      setIsVideoPaused(true);
    }

    // Also try to pause via video element directly
    if (videoRef.current) {
      videoRef.current.pause();
    }

    // Show background overlay with time limit message
    setPreviewState('background');
    sessionStorage.removeItem(IS_PREVIEW_LIVE);
  }, [setIsVideoPaused, stopPlayerStream]);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
  }, []);

  const linkToBuy = useCallback(
    async (type: string) => {
      exitFullscreen();

      if (isLogged) {
        try {
          const canGoToPayment = await checkAccountStatus(type);
          if (canGoToPayment.status === false && canGoToPayment.msg) {
            let noticeContent = canGoToPayment.msg;
            if (
              canGoToPayment.data &&
              canGoToPayment.data.from_date &&
              canGoToPayment.data.next_date
            ) {
              noticeContent += `<br><br>Ngày bắt đầu tính cước: ${canGoToPayment.data.from_date}`;
              noticeContent += `<br>Chu kỳ cước tiếp theo: ${canGoToPayment.data.next_date}`;
            }

            setConfirmModalContent({
              title: 'Thông báo',
              content: noticeContent,
              buttons: {
                accept: 'Đóng',
              },
            });
            setShowConfirmModal(true);
          } else {
            localStorage.setItem(
              trackingStoreKey.BACK_LINK_PLAY,
              window.location.pathname,
            );

            localStorage.setItem(
              trackingStoreKey.BACK_LINK_BUY,
              '/mua-goi/dich-vu/' + type + '?from_source=play&showList=false',
            );
            sessionStorage.setItem(IS_NOT_RESET_PLAYING_SESSION, '1');
            router.push(`/mua-goi/dich-vu/${type}?from_source=play`);
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
              dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
            }
          }
        }
      } else {
        if (sessionStorage) {
          sessionStorage.setItem(
            trackingStoreKey.REDIRECT_TO_BUY,
            `/mua-goi/dich-vu/${type}`,
          );
          sessionStorage.setItem(IS_NOT_RESET_PLAYING_SESSION, '1');
        }
        dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      }
    },
    [exitFullscreen, router, dispatch, isLogged, userInfo],
  );

  const handlePurchaseAction = useCallback(() => {
    if (isTvod) {
      // For TVOD, use linkToBuy logic
      const vipPlan = dataStream?.require_vip_plan || requireVipPlan || '';
      linkToBuy(vipPlan);
    } else {
      // For SVOD/LIVE, show package modal
      exitFullscreen();

      // Only pause player when opening package modal for VOD
      if (type === 'vod' && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsVideoPaused?.(true);
      }

      setShowPackageModal(true);
    }
  }, [exitFullscreen, isTvod, requireVipPlan, linkToBuy, setIsVideoPaused]);

  const handleClosePopup = useCallback(() => {
    setPreviewState(null);
    setIsPopupManuallyClosed(true);
  }, []);

  const handleExitPreview = useCallback(() => {
    if (isLiveType) {
      if (dataEndedPreviewEvent?.is_ended) {
        onExitPreviewEvent?.();
        setPreviewState('banner');
      } else {
        onExitPreviewLive?.(dataStream?.trailer_url || '');
        setPreviewState('popup');
      }
    }
  }, [
    type,
    dataEndedPreviewEvent,
    onExitPreviewEvent,
    onExitPreviewLive,
    dataStream,
  ]);

  // Main effect to control preview state
  useEffect(() => {
    // Only show background overlay if player is NOT successfully playing
    const shouldShowBackground =
      isPreviewEnded ||
      (isEndVideo && isEndVideo > 0) ||
      (hlsErrors && Array.isArray(hlsErrors) && hlsErrors.length > 0) ||
      (playerError && isLiveType) ||
      isLiveEnded;

    if (shouldShowBackground) {
      setPreviewState('background');
      sessionStorage.removeItem(IS_PREVIEW_LIVE);
      // Reset manual close state when preview ends
      setIsPopupManuallyClosed(false);
    } else if (isPreviewActive && !isPopupManuallyClosed && !isLiveEnded) {
      if (isLiveType && !isLogged) {
        const hasPreviewUrl = !!getUrlToPlayH264();
        if (hasPreviewUrl) {
          setPreviewState('popup');
          sessionStorage.setItem(IS_PREVIEW_LIVE, 'true');
        } else {
          onExitPreviewLive?.(dataStream?.trailer_url || '');
          setPreviewState(null);
          sessionStorage.removeItem(IS_PREVIEW_LIVE);
        }
      } else {
        setPreviewState('popup');
        sessionStorage.setItem(IS_PREVIEW_LIVE, 'true');
      }
    } else if (!isPreviewActive) {
      setPreviewState(null);
      sessionStorage.removeItem(IS_PREVIEW_LIVE);
      // Reset manual close state when preview becomes inactive
      setIsPopupManuallyClosed(false);
    }
  }, [
    isPreviewEnded,
    isEndVideo,
    hlsErrors,
    playerError,
    type,
    isLiveEnded,
    isPreviewActive,
    isPopupManuallyClosed,
    isLogged,
    onExitPreviewLive,
    dataStream,
    getUrlToPlayH264,
  ]);

  // --- RENDER ---
  if (!previewState) return null;

  return (
    <div className={isLiveType ? 'preview-noti-live' : 'preview-noti-vod'}>
      {/* Popup Preview Notification */}
      {previewState === 'popup' && (
        <div
          className={`${
            type === 'live' || type === 'channel' || type === 'event'
              ? 'preview-popup-live'
              : 'preview-popup-vod'
          } absolute z-2 right-[1%] bottom-[60px] tablet:right-[4%] tablet:bottom-[72px] bg-licorice/80 rounded-lg flex items-center px-4 py-2`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`${
                isLiveType
                  ? 'preview-popup-live__text'
                  : 'preview-popup-vod__text'
              } flex items-center tablet:w-[317px]`}
            >
              <p className="text-white-smoke text-sm font-medium leading-5 m-0 max-sm:text-xs mr-4">
                {popupMessage}
              </p>
            </div>
            <button
              onClick={handlePurchaseAction}
              className={`${
                isLiveType
                  ? 'preview-popup-live__btn-buy'
                  : 'preview-popup-vod__btn-buy'
              } flex items-center justify-center h-10 px-4 py-[2px] mr-2 border border-white-08 rounded-lg text-white-smoke text-sm font-bold leading-9 text-center cursor-pointer transition-all duration-200 max-sm:text-xs whitespace-nowrap`}
              aria-label={popupButtonText}
            >
              {popupButtonText}
            </button>
          </div>
          <div
            className={`${
              isLiveType
                ? 'preview-popup-live__line'
                : 'preview-popup-vod__line'
            } w-px h-9 bg-gradient-to-b from-transparent via-white to-transparent mx-2`}
          >
            <SeparatorLine width={1} height={36} />
          </div>
          <button
            onClick={handleClosePopup}
            className={`${
              isLiveType
                ? 'preview-popup-live__close-btn'
                : 'preview-popup-vod__close-btn'
            } flex items-center justify-center cursor-pointer w-4 h-4`}
            aria-label="Đóng"
          >
            <IoClose className="text-white-smoke hover:opacity-80" size={16} />
          </button>
        </div>
      )}

      {/* Background Overlay for Ended Preview */}
      {previewState === 'background' && (
        <div
          className={`${
            isLiveType ? 'preview-background-live' : 'preview-background-vod'
          } absolute top-0 left-0 w-full h-full z-3 flex flex-col items-center justify-center`}
          style={{
            backgroundImage: `url('/images/OverlayPreview.png')`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
          }}
        >
          <div className="flex flex-col justify-center items-center p-0 gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center p-0 gap-4 h-[68px] flex-none order-0 self-stretch">
              <h2
                className={`${
                  isLiveType
                    ? 'preview-background-live__title'
                    : 'preview-background-vod__title'
                } whitespace-nowrap tablet:whitespace-normal font-semibold text-[20px] tablet:text-2xl leading-[130%] text-center tracking-[0.02em] text-white-smoke flex-none order-0 flex-grow-0`}
              >
                {backgroundTitle}
              </h2>
              <span
                className={`${
                  isLiveType
                    ? 'preview-background-live__description'
                    : 'preview-background-vod__description'
                } font-normal text-[14px] tablet:text-base leading-[130%] text-center tracking-[0.02em] text-silver-chalice flex-none order-1 self-stretch flex-grow-0`}
              >
                {backgroundDescription}
              </span>
            </div>
            <div className="flex flex-row justify-center items-start p-0 gap-4 w-[343px] tablet:w-[361px] h-12 flex-none order-1 flex-grow-0">
              {isLiveType &&
              currentStream?.require_obj_msg?.available &&
              parseInt(currentStream.require_obj_msg.available) > 0 ? (
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={handleExitPreview}
                    className={`${
                      isLiveType
                        ? 'preview-background-live__exit-btn'
                        : 'preview-background-vod__exit-btn'
                    } w-[172.5px] flex h-12 px-6 py-3 items-center justify-center gap-2 rounded-[40px] bg-charleston-green text-light-gray text-base font-semibold leading-[130%] tracking-[0.02em] cursor-pointer transition-all duration-200`}
                  >
                    Thoát
                  </button>
                  <button
                    onClick={handlePurchaseAction}
                    className={`${
                      isLiveType
                        ? 'preview-background-live__register-btn'
                        : 'preview-background-vod__register-btn'
                    }  w-[172.5px] flex h-12 px-6 py-3 items-center justify-center gap-2 rounded-[40px] bg-gradient-to-r from-portland-orange to-lust text-white-smoke text-base font-semibold leading-[130%] tracking-[0.02em] cursor-pointer transition-all duration-200`}
                  >
                    {backgroundButtonText}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handlePurchaseAction}
                  className={`${
                    isLiveType
                      ? 'preview-background-live__register-btn'
                      : 'preview-background-vod__register-btn'
                  } w-[152.5px] tablet:w-[200px] flex h-10 tablet:h-12 px-6 py-3 items-center justify-center gap-2 rounded-[40px] bg-gradient-to-r from-portland-orange to-lust text-white-smoke text-base font-semibold leading-[130%] tracking-[0.02em] cursor-pointer transition-all duration-200`}
                >
                  {backgroundButtonText}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Background Banner for Live Events (only for live type) */}
      {previewState === 'banner' &&
        isLiveType &&
        !dataStream?.trailer_url &&
        (dataChannel?.image?.landscape_title ||
          dataChannel?.image?.landscape) && (
          <div
            className="absolute top-0 left-0 w-full h-full z-2 flex flex-col justify-between"
            style={{
              backgroundImage: `url(${
                dataChannel?.image?.landscape_title ||
                dataChannel?.image?.landscape
              })`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: '100%',
            }}
          ></div>
        )}

      {showPackageModal && packages.length > 0 && (
        <ModalWrapper
          id="modal-package-list"
          open={showPackageModal}
          isCustom
          onHidden={() => {
            setShowPackageModal(false);
            if (type === 'vod' && videoRef.current && videoRef.current.paused) {
              videoRef.current.play();
              setIsVideoPaused?.(false);
            }
          }}
          contentClassName="bg-eerie-black rounded-[16px] p-[32px] text-white-smoke shadow-lg relative"
          overlayClassName="fixed inset-0 bg-black-06 flex justify-center items-center z-[9999]"
          shouldCloseOnOverlayClick={false}
          shouldCloseOnEsc={false}
          htmlOpenClassName={'overflow-hidden'}
        >
          <PackageListModal
            listPackagesPreview={
              Array.isArray(packages)
                ? packages.map((pkg) => ({
                    img_url: pkg.img_url || '',
                    plan_type: pkg.plan_type || '',
                    title: pkg.title || '',
                  }))
                : []
            }
            onClose={() => {
              setShowPackageModal(false);
            }}
            onBuy={(planType) => {
              linkToBuy(planType);
              setShowPackageModal(false);
            }}
          />
        </ModalWrapper>
      )}

      {/* Modal Confirm for Account Status */}
      <ModalConfirm
        open={showConfirmModal}
        modalContent={confirmModalContent}
        onHidden={() => setShowConfirmModal(false)}
        onSubmit={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default Preview;
