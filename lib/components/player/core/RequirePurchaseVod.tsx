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
      <div className="mx-auto relative w-fit h-full">
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

        <div className="absolute top-0 left-0 w-full h-full bg-black-09 z-[1] flex flex-col items-center justify-center">
          <p className="font-[600] text-[24px] leading-[130%] tracking-[0.48px] text-white-smoke mb-[16px] text-center">
            {dataChannel?.source_provider === SOURCE_PROVIDER.GALAXY_PLAY
              ? messageConfigs?.preview?.title_end_preview_by_package
              : requirePurchaseData?.is_tvod
              ? messageConfigs?.preview?.title_end_preview_rent_movie
              : messageConfigs?.preview?.title_end_preview_by_package}
          </p>
          <p className="text-[16px] leading-[130%] tracking-[0.32px] text-silver-chalice mb-[32px] text-center">
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
              className="font-[600] fpl-bg text-[16px] leading-[130%] tracking-[0.32px] text-white-smoke mb-[32px] px-[70px] py-[14px] rounded-[40px] hover:cursor-pointer"
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
