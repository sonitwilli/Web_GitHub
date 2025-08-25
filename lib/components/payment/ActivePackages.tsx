import React, { useEffect } from 'react';
import { useFetchServices } from '@/lib/hooks/useServices';
import ActivePackageCard from './ActivePackageCard';
import {
  ACTIVE_PACKAGES_TITLE,
  PACKAGE_AND_PAYMENT_MANAGEMENT,
} from '@/lib/constant/texts';
import ErrorData from '@/lib/components/error/ErrorData';
import Loading from '@/lib/components/common/Loading';
import NoData from '@/lib/components/empty-data/NoData';
import { useAppDispatch } from '@/lib/store';
import { setSideBarLeft } from '@/lib/store/slices/multiProfiles';
import { trackingLog186 } from '@/lib/hooks/useTrackingModule';

const ActivePackages: React.FC = () => {
  const { data, loading, error, refetch } = useFetchServices();
  const packages = data?.packages || [];
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      setSideBarLeft({
        url: '/tai-khoan?tab=thanh-toan-va-goi',
        text: PACKAGE_AND_PAYMENT_MANAGEMENT,
      }),
    );
    trackingLog186({
      Screen: 'SubscriptionList',
      ItemName: packages.map((pkg) => pkg.plan_name).join('#'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-[28px] font-semibold leading-[1.3] text-white-smoke mb-[32px] pl-[16px]">
          {ACTIVE_PACKAGES_TITLE}
        </h1>
        <div className="flex flex-col gap-[56px] min-h-[300px]">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative max-w-[1200px]">
        <h1 className="text-[28px] font-semibold leading-[1.3] text-white-smoke mb-[32px] pl-[16px]">
          {ACTIVE_PACKAGES_TITLE}
        </h1>
        <div className="flex flex-col gap-[56px]">
          <ErrorData onRetry={refetch} />
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="relative max-w-[1200px]">
        <h1 className="text-[28px] font-semibold leading-[1.3] text-white-smoke mb-[32px] pl-[16px]">
          {ACTIVE_PACKAGES_TITLE}
        </h1>
        <div className="flex flex-col gap-[56px]">
          <NoData />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px]">
      <h3 className="text-white text-xl font-bold mb-4">Gói đang sử dụng</h3>
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 max-w-[860px]">
        {packages.map((pkg, idx) => (
          <div key={idx}>
            <ActivePackageCard
              name={pkg.plan_name || ''}
              fromDate={pkg.from_date || ''}
              toDate={pkg.next_date || ''}
              isSub={pkg.is_sub === 1}
            />
          </div>
        ))}
      </div>
      {!loading && packages.length === 0 && (
        <div className="text-gray-400 mt-4">Không có gói nào đang sử dụng</div>
      )}
    </div>
  );
};

export default ActivePackages;
