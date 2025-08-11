import ConfirmDialog from '../../modal/ModalConfirm';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import { useRequirePurchase } from '@/lib/hooks/useRequirePurchase';

export default function RequirePurchase() {
  const { requirePurchaseData } = usePlayerPageContext();
  const { handleGetPlan, openModal, setOpenModal, planData } =
    useRequirePurchase();

  return (
    <div className="RequirePurchase h-full w-full relative rounded-[16px] overflow-hidden flex justify-center">
      <div className="relative">
        <img
          src={requirePurchaseData?.require_vip_image}
          alt="purchase"
          className="mx-auto h-full"
        />
        
        {/* Dark overlay over the image - only on mobile and tablet */}
        <div className="absolute inset-0 bg-black/86 xl:hidden"></div>

        {/* Mobile: centered content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 md:hidden">
          <div className="max-w-[81vw] w-full">
            <p className="font-[600] text-[16px] leading-[130%] tracking-[0.48px] text-white-smoke mb-[8px] text-center">
              {requirePurchaseData?.require_vip_title}
            </p>
            <p className="text-[14px] leading-[130%] tracking-[0.32px] text-silver-chalice mb-[16px] text-center">
              {requirePurchaseData?.require_vip_description}
            </p>
          </div>
            <div>
              <button
                onClick={handleGetPlan}
                aria-label="purchase"
                className="font-[600] fpl-bg text-[14px] leading-[130%] tracking-[0.32px] text-white-smoke mb-[32px] px-[32px] py-[14px] rounded-[40px] hover:cursor-pointer"
              >
                {requirePurchaseData?.btn_active}
              </button>
          </div>
        </div>

        {/* Tablet: centered content with larger text */}
        <div className="absolute inset-0 z-10 hidden md:flex xl:hidden flex-col items-center justify-center p-8">
          <div className="max-w-[41vw] w-full">
            <p className="font-[600] text-[18px] leading-[130%] tracking-[0.48px] text-white-smoke mb-[12px] text-center">
              {requirePurchaseData?.require_vip_title}
            </p>
            <p className="text-[16px] leading-[130%] tracking-[0.32px] text-silver-chalice mb-[24px] text-center">
              {requirePurchaseData?.require_vip_description}
            </p>
            <div className="flex justify-center">
              <button
                onClick={handleGetPlan}
                aria-label="purchase"
                className="font-[600] fpl-bg text-[16px] leading-[130%] tracking-[0.32px] text-white-smoke mb-[32px] px-[48px] py-[16px] rounded-[40px] hover:cursor-pointer"
              >
                {requirePurchaseData?.btn_active}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: left-aligned content */}
        <div className="absolute z-10 top-1/2 left-[0px] 2xl:left-[66px] w-[361px] hidden xl:flex flex-col items-center -translate-y-1/2">
          <p className="font-[600] text-[24px] leading-[130%] tracking-[0.48px] text-white-smoke mb-[16px] text-center">
            {requirePurchaseData?.require_vip_title}
          </p>
          <p className="text-[16px] leading-[130%] tracking-[0.32px] text-silver-chalice mb-[16px] text-center">
            {requirePurchaseData?.require_vip_description}
          </p>
          <div>
            <button
              onClick={handleGetPlan}
              aria-label="purchase"
              className="font-[600] fpl-bg text-[14px] leading-[130%] tracking-[0.32px] text-white-smoke mb-[32px] px-[64px] py-[14px] rounded-[40px] hover:cursor-pointer"
            >
              {requirePurchaseData?.btn_active}
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