import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, useAppSelector } from '@/lib/store';
import AccountNameEdit from './AccountEditName';
import { useRouter } from 'next/router';
import {
  setCurrentProfile,
  setSideBarLeft,
} from '@/lib/store/slices/multiProfiles';
import { Profile, updateProfile } from '@/lib/api/user';
import { checkPassword } from '@/lib/api/multi-profiles';
import { showToast } from '@/lib/utils/globalToast';
import axios from 'axios';
import { DEFAULT_ERROR_MSG, TITLE_SERVICE_ERROR } from '@/lib/constant/errors';
import ProfilePasswordModal from '../modal/ModalFillCode';
import { setOtpType } from '@/lib/store/slices/otpSlice';
import { SEND_OTP_TYPES } from '@/lib/constant/texts';
import ForgetPasswordModalProfile, {
  ForgetPasswordModalProfileRef,
} from '../modal/ModalForgetPassword';
import { fetchListProfiles } from '@/lib/utils/multiProfiles/fetchListProfiles';
import { useCheckUserInfo } from '@/lib/hooks/useCheckUserInfo';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';

const AccountInfo: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.user.info);
  const [isEditing, setIsEditing] = useState(false);
  const [showModalFillManagementCode, setShowModalFillManagementCode] =
    useState<boolean>(false);
  const forgotPasswordModalRef = useRef<ForgetPasswordModalProfileRef>(null); // Ref for ForgetPasswordModalProfile
  const [loading, setLoading] = useState<boolean>(false);
  const { checkUserInfo } = useCheckUserInfo();

  useEffect(() => {
    checkUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modalFillManagementCodeRef = useRef<{
    error?: string;
    setError: (error: string) => void;
  }>(null);

  const currentProfile = useAppSelector(
    (state) => state.multiProfile.currentProfile,
  );

  const getUID = useCallback(() => {
    return currentUser?.user_id_str || currentUser?.user_id?.toString() || '';
  }, [currentUser]);

  const getPhoneNumber = useCallback(() => {
    return currentUser?.user_phone || '';
  }, [currentUser]);

  const getContractNumber = useCallback(() => {
    return currentUser?.sub_contract || '';
  }, [currentUser]);

  const [hasManagementCode, setHasManagementCode] = useState(false);

  useEffect(() => {
    setHasManagementCode(String(currentUser?.allow_pin) === '1');
  }, [currentUser?.allow_pin]);

  const confirmManagementCode = async (pw: string) => {
    setLoading(true);
    const result = await checkPassword({ password: pw, version: 1 });
    setLoading(false);
    if (result && result.success) {
      setShowModalFillManagementCode(false);
      router.push('/tai-khoan/multi-profiles?is-setting=1');
    } else {
      if (modalFillManagementCodeRef.current) {
        modalFillManagementCodeRef.current.setError(
          result.error || DEFAULT_ERROR_MSG,
        );
      }
    }
  };

  const handleSaveName = async (newName: string) => {
    if (!currentUser?.user_id) return;

    try {
      const response = await updateProfile(
        currentProfile?.profile_id as string,
        {
          name: newName || '',
          profile_id: currentProfile?.profile_id as string,
        },
      );

      if (response.data?.status === '1') {
        setIsEditing(false);
        if (response?.data?.data) {
          dispatch(setCurrentProfile(response?.data?.data as Profile));
          await fetchListProfiles(dispatch);
        }
      }
    } catch (err) {
      let fallback = '';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data;
        fallback =
          data?.data?.errors ||
          data?.msg ||
          data?.message ||
          data?.detail ||
          fallback;
      }
      showToast({
        title: TITLE_SERVICE_ERROR,
        desc: fallback || DEFAULT_ERROR_MSG,
        timeout: 5000,
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    dispatch(
      setSideBarLeft({
        text: 'Quay lại FPT Play',
        url: `/`,
      }),
    );
  };

  const handleForgetPassword = () => {
    dispatch(setOtpType(SEND_OTP_TYPES.FORGET_MANAGEMENT_CODE));
    forgotPasswordModalRef.current?.setOpen(true);
  };

  const [hasDispatchedSidebar, setHasDispatchedSidebar] = useState(false);

  const onManageCode = () => {
    if (!currentUser || Object.keys(currentUser).length === 0) {
      dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      return;
    }

    if (hasManagementCode) {
      // Chưa có mã quản lý -> Thiết lập trực tiếp
      dispatch(setOtpType(SEND_OTP_TYPES.CREATE_MANAGEMENT_CODE));
      forgotPasswordModalRef.current?.openModal();
    } else {
      // Đã có mã quản lý -> Yêu cầu OTP trước khi thiết lập
      dispatch(setOtpType(SEND_OTP_TYPES.CHANGE_MANAGEMENT_CODE));
      forgotPasswordModalRef.current?.setOpen(true);
    }
  };

  useEffect(() => {
    const isOnAccountTab =
      router.pathname === '/tai-khoan' &&
      router.query.tab === 'tai-khoan' &&
      !router.query.child;

    if (isOnAccountTab && !hasDispatchedSidebar) {
      if (isEditing) {
        setIsEditing(false);
      }
      dispatch(
        setSideBarLeft({
          text: 'Quay lại FPT Play',
          url: `/`,
        }),
      );
      setHasDispatchedSidebar(true);
    }

    if (!isOnAccountTab) {
      setHasDispatchedSidebar(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath, isEditing, hasDispatchedSidebar, dispatch]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[856px] text-white-smoke">
      {isEditing ? (
        <AccountNameEdit
          initialName={''}
          onSave={handleSaveName}
          onCancel={handleCancelEdit}
        />
      ) : (
        <>
          <h1 className="text-[20px] sm:text-[28px] font-semibold leading-[36px] tracking-[0.02em]">
            Thông tin tài khoản
          </h1>

          {/* Tên tài khoản */}
          <div
            // onClick={() => setIsEditing(true)}
            className="flex justify-between items-center bg-eerie-black rounded-[12px] px-6 py-4"
          >
            <div className="flex items-center gap-4">
              <span className="text-[16px] text-platinum w-[180px]">
                Tên tài khoản
              </span>
              <span className="text-[16px] font-medium">
                {currentUser?.user_full_name || currentUser?.user_phone}
              </span>
            </div>
            {/* <FiChevronRight className="w-5 h-5 text-silver-chalice" /> */}
          </div>

          {/* Thông tin khác */}
          <div className="flex flex-col bg-eerie-black rounded-[12px]">
            <div className="flex justify-between items-center px-6 py-4">
              <div className="flex items-center gap-4">
                <span className="text-[16px] text-platinum w-[180px]">UID</span>
                <span className="text-[16px] font-medium">{getUID()}</span>
              </div>
            </div>

            <div className="border-t border-charleston-green" />

            <div className="flex justify-between items-center px-6 py-4">
              <div className="flex items-center gap-4">
                <span className="text-[16px] text-platinum w-[180px]">
                  Số điện thoại
                </span>
                <span className="text-[16px] font-medium">
                  {getPhoneNumber()}
                </span>
              </div>
            </div>

            {getContractNumber() && (
              <>
                <div className="border-t border-charleston-green" />
                <div className="flex justify-between items-center px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[16px] text-platinum w-[180px]">
                      Số hợp đồng
                    </span>
                    <span className="text-[16px] font-medium">
                      {getContractNumber()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mã quản lý */}
          <div
            onClick={onManageCode}
            className="flex justify-between items-center bg-eerie-black rounded-[12px] px-6 py-4 cursor-pointer hover:bg-charleston-green"
          >
            <div className="flex items-center gap-4">
              <span className="text-[16px] text-platinum w-[180px]">
                Mã quản lý
              </span>
              {hasManagementCode ? (
                <span className="text-[16px] font-medium text-white-smoke">
                  Chưa thiết lập
                </span>
              ) : (
                <div className="flex gap-1">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-[6px] h-[6px] bg-white-smoke rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
            <FiChevronRight className="w-5 h-5 text-silver-chalice" />
          </div>

          <ProfilePasswordModal
            ref={modalFillManagementCodeRef}
            open={showModalFillManagementCode}
            loading={loading}
            onConfirm={confirmManagementCode}
            onCancel={() => setShowModalFillManagementCode(false)}
            onForget={handleForgetPassword}
            onHidden={() => setShowModalFillManagementCode(false)}
          />


          <ForgetPasswordModalProfile ref={forgotPasswordModalRef} />
        </>
      )}
    </div>
  );
};

export default AccountInfo;
