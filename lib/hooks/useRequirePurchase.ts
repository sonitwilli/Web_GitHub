import { useState } from 'react';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';
import { getPackagePlan, PackagePlanResponseType } from '../api/vod';
import { trackingStoreKey } from '../constant/tracking';
import { useRouter } from 'next/router';
import { changeTimeOpenModalRequireLogin } from '../store/slices/appSlice';
import { useAppDispatch } from '../store';

export const useRequirePurchase = () => {
  const { requirePurchaseData } = usePlayerPageContext();
  const [planData, setPlanData] = useState<PackagePlanResponseType>({});
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const handleGetPlan = async () => {
    try {
      const res = await getPackagePlan({
        plan_id: requirePurchaseData?.require_vip_plan,
      });
      if (res.data?.msg_code !== 'success') {
        planData.msg_content = res.data?.msg_content;
        setOpenModal(true);
      } else {
        localStorage.setItem(
          trackingStoreKey.BACK_LINK_PLAY,
          window.location.pathname,
        );
        router.push(
          `/mua-goi/dich-vu/${requirePurchaseData?.require_vip_plan}?from_source=play`,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const { status } = error?.response || {};
      if (status === 401) {
        dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      }
    }
  };

  return { handleGetPlan, planData, openModal, setPlanData, setOpenModal };
};
