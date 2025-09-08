import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { BsKey } from 'react-icons/bs';
import { FiChevronRight } from 'react-icons/fi';
import { GoLinkExternal } from 'react-icons/go';
import { ReactSVG } from 'react-svg';
import {
  MdAutorenew,
  MdSupportAgent,
  MdOutlineGroup,
  MdRedeem,
} from 'react-icons/md';
import { RootState, useAppSelector } from '@/lib/store';
import {
  ACCOUNT_INFO,
  ACTIVATION_CODE,
  FILES,
  MANAGE_AUTO_EXTEND,
  MANAGE_DEVICES,
  SEND_OTP_TYPES,
} from '@/lib/constant/texts';
import styles from './Overview.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { setOtpType } from '@/lib/store/slices/otpSlice';
import ForgetPasswordModalProfile, {
  ForgetPasswordModalProfileRef,
} from '../modal/ModalForgetPassword';
import { setSideBarLeft } from '@/lib/store/slices/multiProfiles';
import { useCheckUserInfo } from '@/lib/hooks/useCheckUserInfo';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import LaptopIcon from '../icons/LaptopIcon';

const Overview: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const forgotPasswordModalRef = useRef<ForgetPasswordModalProfileRef>(null); // Ref for ForgetPasswordModalProfile
  const currentUser = useSelector((state: RootState) => state.user.info);
  const { checkUserInfo } = useCheckUserInfo();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      dispatch(
        setSideBarLeft({
          text: 'Quay lại FPT Play',
          url: `/`,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    checkUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const quickLinks = [
    {
      icon: <BsKey className="w-6 h-6 text-silver-chalice mr-4" />,
      label:
        String(currentUser?.allow_pin) === '1' && currentUser
          ? 'Thiết lập mã quản lý'
          : 'Đổi mã quản lý',
      tab: '',
      action: () => {
        if (!currentUser || Object.keys(currentUser).length === 0) {
          dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
          return;
        }
        if (String(currentUser?.allow_pin) === '1') {
          // Chưa có mã quản lý -> Thiết lập trực tiếp
          dispatch(setOtpType(SEND_OTP_TYPES.CREATE_MANAGEMENT_CODE));
          forgotPasswordModalRef.current?.openModal();
        } else {
          // Đã có mã quản lý -> Yêu cầu OTP trước khi thiết lập
          dispatch(setOtpType(SEND_OTP_TYPES.CHANGE_MANAGEMENT_CODE));
          forgotPasswordModalRef.current?.setOpen(true);
        }
      },
    },
    {
      icon: <MdAutorenew className="w-6 h-6 text-silver-chalice mr-4" />,
      label: 'Quản lý gia hạn tự động',
      tab: MANAGE_AUTO_EXTEND,
    },
    {
      icon: <MdRedeem className="w-6 h-6 text-silver-chalice mr-4" />,
      label: 'Đổi mã quà tặng',
      tab: ACTIVATION_CODE,
    },
    {
      icon: <LaptopIcon className="w-6 h-6 text-silver-chalice mr-4" />,
      label: 'Quản lý thiết bị',
      tab: MANAGE_DEVICES,
    },
    {
      icon: (
        <div className="mr-4">
          <MdOutlineGroup size={24} className="text-silver-chalice" />
        </div>
      ),
      label: 'Quản lý hồ sơ',
      tab: FILES,
    },
  ];

  const profiles = useAppSelector((state) => state.multiProfile.profiles);
  const fallbackAvatar = '/images/default-avatar.png';

  return (
    <>
      <div className="2xl:max-w-[856px] text-white-smoke">
        <h1 className="text-[20px] sm:text-[28px] font-semibold mb-6 sm:mb-4">
          Tổng quan
        </h1>

        <div className="bg-eerie-black rounded-lg mb-6">
          {(currentUser?.user_full_name || currentUser?.user_phone) && (
            <>
              <p className="text-[20px] font-medium pt-4 pb-4 pl-6 pr-6">
                {currentUser?.user_full_name || currentUser?.user_phone}
              </p>
              <div className="border-t border-charleston-green" />
            </>
          )}
          <div
            className="flex justify-between items-center rounded-md hover:bg-charleston-green divide-charleston-green cursor-pointer pt-4 pb-4 pl-6 pr-6"
            onClick={() => router.push(`/tai-khoan?tab=${ACCOUNT_INFO}`)}
          >
            <div className="flex items-center gap-4">
              <ReactSVG
                src="/images/settings/settings_account_box.svg"
                className="w-[24px] h-[24px]"
              />
              <span>Thông tin tài khoản</span>
            </div>
            <FiChevronRight className="w-5 h-5 text-silver-chalice" />
          </div>
        </div>

        <p className="text-base text-silver-chalice mb-2">Liên kết nhanh</p>
        <div className="bg-eerie-black rounded-lg divide-y divide-charleston-green mb-6">
          {quickLinks.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (item.tab) {
                  router.push(`/tai-khoan?tab=${item.tab}`);
                } else if (item.action) {
                  item.action();
                }
              }}
              className="flex justify-between items-center pt-4 pb-4 pl-6 pr-6 hover:bg-charleston-green divide-charleston-green cursor-pointer"
            >
              <div className="flex items-center">
                {item.icon}
                <span>{item.label}</span>
              </div>

              <div className="flex items-center">
                {item.label === 'Quản lý hồ sơ' &&
                  profiles &&
                  profiles.length > 0 && (
                    <div className={`${styles.avatarList} mr-2`}>
                      {profiles.map((profile, i) => (
                        <div
                          key={i}
                          className={`${styles.avatar}`}
                          style={{
                            backgroundImage: `url(${
                              profile.avatar_url || fallbackAvatar
                            })`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            zIndex: profiles.length - i,
                          }}
                        >
                          {profile?.profile_type === '2' && (
                            <img
                              className="absolute bottom-[4px] left-0 right-[4px] pl-[4px] pr-[4px]"
                              src="/images/profiles/child.png"
                              alt="child"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                <FiChevronRight className="w-5 h-5 text-silver-chalice" />
              </div>
            </div>
          ))}
        </div>

        <p className="text-base text-silver-chalice my-2">Bạn cần trợ giúp?</p>
        <div
          className="bg-eerie-black rounded-lg pt-4 pb-4 pl-6 pr-6 flex justify-between items-center hover:bg-charleston-green divide-charleston-green cursor-pointer"
          onClick={() => window.open('https://hotro.fptplay.vn', '_blank')}
        >
          <div className="flex items-center gap-2">
            <MdSupportAgent className="w-6 h-6 text-silver-chalice mr-4" />
            <span>Trung tâm trợ giúp FPT Play</span>
          </div>
          <GoLinkExternal className="w-5 h-5 text-silver-chalice" />
        </div>
      </div>

      <ForgetPasswordModalProfile ref={forgotPasswordModalRef} />
    </>
  );
};

export default Overview;
