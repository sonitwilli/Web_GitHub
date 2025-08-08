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

        <div className="absolute z-[1] top-1/2 left-16px xl:left-[20px] 2xl:left-[66px] w-[361px] flex flex-col items-center -translate-y-1/2">
          <p className="font-[600] text-[24px] leading-[130%] tracking-[0.48px] text-white-smoke mb-[16px] text-center">
            {requirePurchaseData?.require_vip_title}
          </p>
          <p className="text-[16px] leading-[130%] tracking-[0.32px] text-silver-chalice mb-[32px] text-center">
            {requirePurchaseData?.require_vip_description}
          </p>
          <div>
            <button
              onClick={handleGetPlan}
              aria-label="purchase"
              className="font-[600] fpl-bg text-[16px] leading-[130%] tracking-[0.32px] text-white-smoke mb-[32px] px-[70px] py-[14px] rounded-[40px] hover:cursor-pointer"
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
