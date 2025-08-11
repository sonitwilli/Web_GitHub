import { usePlayerPageContext } from '../context/PlayerPageContext';
import CustomImage from '../../common/CustomImage';
import { scaleImageUrl } from '@/lib/utils/methods';
import { SOURCE_PROVIDER } from '@/lib/constant/texts';
import { useRequirePurchase } from '@/lib/hooks/useRequirePurchase';
import ConfirmDialog from '@/lib/components/modal/ModalConfirm';
import { useAppSelector } from '@/lib/store';

export default function RequirePurchaseVod() {
  const { messageConfigs } = useAppSelector((s) => s.app);
  const { requirePurchaseData, dataChannel } = usePlayerPageContext();
  const { planData, handleGetPlan, openModal, setOpenModal } =
    useRequirePurchase();

  return (
    <div className="RequirePurchaseVod w-full h-full relative rounded-[16px] overflow-hidden">
      <div className="relative">
        {dataChannel?.image?.landscape ||
        dataChannel?.image?.landscape_title ? (
          <CustomImage
            src={scaleImageUrl({
              imageUrl:
                dataChannel?.image?.landscape ||
                dataChannel?.image?.landscape_title,
            })}
            placeHolder="/images/player_page_placeholder.png"
            className="mx-auto h-full"
          />
        ) : (
          <img
            src="/images/player_page_placeholder.png"
            alt={dataChannel?.name || dataChannel?.title}
            className="mx-auto h-full"
          />
        )}

        {/* Dark overlay over the image - only on mobile and tablet */}
        <div className="absolute inset-0 bg-black/86 xl:hidden"></div>

        {/* Dark overlay for desktop */}
        <div className="absolute inset-0 bg-black/86 hidden xl:block"></div>

        {/* Mobile: centered content */}
        <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-6 md:hidden">
          <div className="max-w-[81vw] w-full">
            <p className="font-[600] text-[16px] leading-[130%] tracking-[0.48px] text-white-smoke mb-[8px] text-center">
              {dataChannel?.source_provider === SOURCE_PROVIDER.GALAXY_PLAY
                ? messageConfigs?.preview?.title_end_preview_by_package
                : requirePurchaseData?.is_tvod
                ? messageConfigs?.preview?.title_end_preview_rent_movie
                : messageConfigs?.preview?.title_end_preview_by_package}
            </p>
            <p className="text-[14px] leading-[130%] tracking-[0.32px] text-silver-chalice mb-[16px] text-center">
              {dataChannel?.source_provider === SOURCE_PROVIDER.GALAXY_PLAY
                ? messageConfigs?.preview?.msg_not_preview_buy_package
                : requirePurchaseData?.is_tvod
                ? messageConfigs?.preview?.msg_not_preview_rent_movie
                : messageConfigs?.preview?.msg_not_preview_buy_package}
            </p>
          </div>
          <div>
            <button
              onClick={handleGetPlan}
              aria-label="purchase"
              className="font-[600] fpl-bg text-[14px] leading-[130%] tracking-[0.32px] text-white-smoke mb-[32px] px-[32px] py-[14px] rounded-[40px] hover:cursor-pointer"
            >
              {dataChannel?.source_provider === SOURCE_PROVIDER.GALAXY_PLAY
                ? messageConfigs?.preview?.btn_buy_package
                : requirePurchaseData?.is_tvod
                ? messageConfigs?.preview?.btn_rent_movie || 'Thuê phim'
                : messageConfigs?.preview?.btn_buy_package || 'Đăng ký'}
            </button>
          </div>
        </div>

        {/* Tablet: centered content with larger text */}
        <div className="absolute inset-0 z-10 hidden md:flex xl:hidden flex-col items-center justify-center p-8">
          <div className="max-w-[50vw] w-full">
            <p className="font-[600] text-[18px] leading-[130%] tracking-[0.48px] text-white-smoke mb-[12px] text-center">
              {dataChannel?.source_provider === SOURCE_PROVIDER.GALAXY_PLAY
                ? messageConfigs?.preview?.title_end_preview_by_package
                : requirePurchaseData?.is_tvod
                ? messageConfigs?.preview?.title_end_preview_rent_movie
                : messageConfigs?.preview?.title_end_preview_by_package}
            </p>
            <p className="text-[16px] leading-[130%] tracking-[0.32px] text-silver-chalice mb-[24px] text-center">
              {dataChannel?.source_provider === SOURCE_PROVIDER.GALAXY_PLAY
                ? messageConfigs?.preview?.msg_not_preview_buy_package
                : requirePurchaseData?.is_tvod
                ? messageConfigs?.preview?.msg_not_preview_rent_movie
                : messageConfigs?.preview?.msg_not_preview_buy_package}
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleGetPlan}
                aria-label="purchase"
                className="font-[600] fpl-bg text-[16px] leading-[130%] tracking-[0.32px] text-white-smoke mb-[32px] px-[48px] py-[16px] rounded-[40px] hover:cursor-pointer"
              >
                {dataChannel?.source_provider === SOURCE_PROVIDER.GALAXY_PLAY
                  ? messageConfigs?.preview?.btn_buy_package
                  : requirePurchaseData?.is_tvod
                  ? messageConfigs?.preview?.btn_rent_movie || 'Thuê phim'
                  : messageConfigs?.preview?.btn_buy_package || 'Đăng ký'}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: centered content */}
        <div className="absolute inset-0 z-10 hidden xl:flex flex-col items-center justify-center">
          <p className="font-[600] text-[24px] leading-[130%] tracking-[0.48px] text-white-smoke mb-[16px] text-center">
            {dataChannel?.source_provider === SOURCE_PROVIDER.GALAXY_PLAY
              ? messageConfigs?.preview?.title_end_preview_by_package
              : requirePurchaseData?.is_tvod
              ? messageConfigs?.preview?.title_end_preview_rent_movie
              : messageConfigs?.preview?.title_end_preview_by_package}
          </p>
          <p className="text-[16px] leading-[130%] tracking-[0.32px] text-silver-chalice mb-[16px] text-center">
            {dataChannel?.source_provider === SOURCE_PROVIDER.GALAXY_PLAY
              ? messageConfigs?.preview?.msg_not_preview_buy_package
              : requirePurchaseData?.is_tvod
              ? messageConfigs?.preview?.msg_not_preview_rent_movie
              : messageConfigs?.preview?.msg_not_preview_buy_package}
          </p>
          <div>
            <button
              onClick={handleGetPlan}
              aria-label="purchase"
              className="font-[600] fpl-bg text-[14px] leading-[130%] tracking-[0.32px] text-white-smoke mb-[32px] px-[64px] py-[14px] rounded-[40px] hover:cursor-pointer"
            >
              {dataChannel?.source_provider === SOURCE_PROVIDER.GALAXY_PLAY
                ? messageConfigs?.preview?.btn_buy_package
                : requirePurchaseData?.is_tvod
                ? messageConfigs?.preview?.btn_rent_movie || 'Thuê phim'
                : messageConfigs?.preview?.btn_buy_package || 'Đăng ký'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={openModal}
        modalContent={{
          title: 'Thông báo',
          content: planData?.msg_content,
          buttons: {
            accept: 'Đóng',
          },
        }}
        bodyContentClassName="!text-[16px] !text-spanish-gray !leading-[130%] tracking-[0.32px]"
        onSubmit={() => setOpenModal(false)}
      />
    </div>
  );
}