import React from 'react';
import Link from 'next/link';
import { GoArrowLeft } from 'react-icons/go';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import DefaultLayout from '@/lib/layouts/Account';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';
import { useAppSelector } from '@/lib/store';
import SideBar from '@/lib/components/account/Sidebar';
import Services from '@/lib/components/account/Services';
import ActivationCode from '@/lib/components/account/ActivationCode';
import LibraryBlock from '@/lib/components/blocks/LibraryBlock';
import ProfileInfoWrapper from '@/lib/components/multi-profile/ProfileInfoWrapper';
import PaymentRenewalTable from '@/lib/components/payment/PaymentRenewalTable';
import ActivePackages from '@/lib/components/payment/ActivePackages';
import DeviceManagement from '@/lib/components/devices/DeviceManagement';
import {
  TRANSACTION_HISTORY,
  MANAGE_AUTO_EXTEND,
  SERVICES,
  LIBRARY,
  FILES,
  ACTIVATION_CODE,
  ACCOUNT_INFO,
  ACCOUNT_OVERVIEW,
  MANAGE_PAYMENT_AND_PACKAGE,
  USING_PACKAGE,
  MANAGE_DEVICES,
} from '@/lib/constant/texts';
import AccountInfo from '@/lib/components/account/AccountInfo';
import Overview from '@/lib/components/account/Overview';
import PaymentPackageList from '@/lib/components/payment/PaymentPackageList';
import PaymentTransactionHistoryTable from '@/lib/components/payment/PaymentTransactionHistoryTable';

const tabComponents: { [key: string]: React.FC } = {
  [ACCOUNT_OVERVIEW]: Overview,
  [ACCOUNT_INFO]: AccountInfo,
  [MANAGE_AUTO_EXTEND]: PaymentRenewalTable,
  [TRANSACTION_HISTORY]: PaymentTransactionHistoryTable,
  [SERVICES]: Services,
  [LIBRARY]: LibraryBlock,
  [FILES]: ProfileInfoWrapper,
  [ACTIVATION_CODE]: ActivationCode,
  [MANAGE_PAYMENT_AND_PACKAGE]: PaymentPackageList,
  [USING_PACKAGE]: ActivePackages,
  [MANAGE_DEVICES]: DeviceManagement,
};

const AccountPage: React.FC = () => {
  const { sideBarLeft } = useAppSelector((state) => state.multiProfile);
  const urlBack = sideBarLeft?.text || '';
  const router = useRouter();
  const { tab } = router.query;
  const SelectedComponent =
    tab && tabComponents[tab as string] ? tabComponents[tab as string] : null;

  return (
    <DefaultLayout>
      <div className="min-h-screen">
        <div className="mx-auto f-container px-4 2xl:px-8 pt-[104px] xl:pt-[120px] pb-8">
          <div className="flex flex-col xl:flex-row gap-6 md:gap-[32px] 2xl:gap-[148px]">
            <div className="widget-sidebar w-full xl:w-1/5 xl:max-w-[280px] flex-shrink-0">
              <Link
                href={sideBarLeft?.url || '#'}
                className={`flex items-center text-base font-medium hover:bg-eerie-black text-platinum hover:text-white transition-colors rounded-[10px] pl-0 xl:pl-4 p-[10px] xl:p-4 ${
                  sideBarLeft?.url === '/' ? 'mb-6 xl:mb-8' : 'mb-0'
                }`}
              >
                <GoArrowLeft className="text-[24px]" />
                <span className="ml-4">{urlBack}</span>
              </Link>
              {sideBarLeft?.url === '/' && (
                <div className="w-full">
                  <SideBar />
                </div>
              )}
            </div>
            <div className="content w-full xl:flex-1 min-w-0 overflow-hidden">
              {SelectedComponent ? (
                <SelectedComponent />
              ) : (
                <div className="text-white text-center py-8">
                  Tab không hợp lệ
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AccountPage;

export const getServerSideProps = (async () => {
  const seoProps = await createSeoPropsFromMeta({
    pageId: 'tai-khoan',
    fallbackTitle: 'FPT Play - Tài Khoản | Quản Lý Thông Tin Cá Nhân',
    fallbackDescription:
      'Quản lý tài khoản FPT Play của bạn - Cập nhật thông tin cá nhân, thanh toán, gói dịch vụ và thiết bị truy cập.',
    pathPrefix: '/tai-khoan',
  });

  return { props: { seoProps, key: new Date().getTime() } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps; key: number }>;
