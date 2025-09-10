import { axiosInstance } from '@/lib/api/axios';
import React, { useState, useEffect, useRef } from 'react';
import { RE_ENTER_ERROR_MESSAGE, REVISION_FAIL } from '@/lib/constant/errors';
import {
  ACTIVATED_CODE_TEXT,
  BASE64_PATTERN,
  CODE,
  CONFIRM_BUTTON_TEXT,
  INPUT_ACTIVATED_CODE,
  LOCK_USER,
  NOTIFY_TEXT,
  REVISION,
  REVISION_UPPER,
  SUCCESS_UPDATE_REVISION,
  SUCCESS_UPDATE_WIDEVINE,
  TRUE,
  UNDEFINED,
  URL_DEVISION,
  URL_PROMOTION_CODE,
  USER,
  WEB,
  WIDEVINE,
} from '@/lib/constant/texts';
import { showToast } from '@/lib/utils/globalToast';
import { useDispatch } from 'react-redux';
import { setSideBarLeft } from '@/lib/store/slices/multiProfiles';
import { AxiosError } from 'axios';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';

const required = (value: string) => value.trim() !== '';

const ActiveCode: React.FC = () => {
  const [formCode, setFormCode] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [lockUser, setLockUser] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const getCurrentUser = () => {
    if (typeof window !== UNDEFINED) {
      const userStr = localStorage.getItem(USER);
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      dispatch(
        setSideBarLeft({
          text: 'Quản lý thanh toán và gói',
          url: `${window?.location?.origin}/tai-khoan?tab=thanh-toan-va-goi`,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromQuery = params.get(CODE);
    if (codeFromQuery) {
      setFormCode(codeFromQuery);
      setIsActive(true);
    }
    inputRef.current?.focus();
  }, []);

  const isValid = () => required(formCode);

  const resetForm = () => {
    setFormCode('');
    setIsActive(false);
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid() || !isActive) return;

    const currentUser = getCurrentUser();

    const base64Pattern = BASE64_PATTERN;
    const isBase64 = base64Pattern.test(formCode);

    try {
      if (
        isBase64 &&
        currentUser &&
        atob(formCode) === currentUser.user_id_str
      ) {
        localStorage.setItem(WIDEVINE, TRUE);
        showToast({
          title: NOTIFY_TEXT,
          desc: SUCCESS_UPDATE_WIDEVINE,
        });
        resetForm();
        return;
      } else if (formCode.toUpperCase() === REVISION_UPPER) {
        const response = await axiosInstance.get(URL_DEVISION);
        if (response?.data?.revision) {
          localStorage.setItem(REVISION, response.data.revision);
          showToast({
            title: NOTIFY_TEXT,
            desc: SUCCESS_UPDATE_REVISION,
          });
          resetForm();
          return;
        } else {
          showToast({
            title: NOTIFY_TEXT,
            desc: REVISION_FAIL,
          });
          resetForm();
          return;
        }
      } else {
        const response = await axiosInstance.post(URL_PROMOTION_CODE, {
          promotion_code: formCode,
          device_type: WEB,
        });

        const result = response.data;

        if (result) {
          if (result.status) {
            showToast({
              title: NOTIFY_TEXT,
              desc: result.msg,
            });
            resetForm();
            return;
          } else {
            if (result.lock_user === LOCK_USER) {
              setLockUser(true);
            }
            showToast({
              title: NOTIFY_TEXT,
              desc: result.msg,
            });
            resetForm();
            return;
          }
        }
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
      } else {
        showToast({
          title: NOTIFY_TEXT,
          desc: RE_ENTER_ERROR_MESSAGE,
        });
      }
      resetForm();
      return;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormCode(e.target.value);
    setIsActive(e.target.value.trim() !== '');
  };

  return (
    <div
      id="active-code"
      className="text-white max-w-full 2xl:max-w-[856px] 2xl:mr-20"
    >
      <form onSubmit={sendCode} className="flex flex-col gap-6">
        <h1 className="text-[24px] tablet:text-[28px] font-semibold leading-[130%] tracking-[0.56px] mt-2">
          Đổi mã quà tặng
        </h1>
        <div className="text-base text-spanish-gray">
          {INPUT_ACTIVATED_CODE}
        </div>

        <div className="mb-4">
          <div className="text-base text-spanish-gray pb-2">Mã kích hoạt</div>
          <input
            id="input-code"
            type="text"
            ref={inputRef}
            value={formCode}
            onChange={handleInputChange}
            placeholder={ACTIVATED_CODE_TEXT}
            autoFocus
            className="w-full h-14 rounded-full bg-transparent border border-black-olive-404040 text-[14px] 
             px-7 py-2 text-white placeholder-dim-gray outline-none"
            disabled={lockUser}
            aria-describedby="input-code-feedback"
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={lockUser}
            className={`block w-full tablet:w-auto h-12 ml-auto rounded-[40px] text-base font-medium px-[24px] py-[12px] box-border mt-6 ${
              isActive
                ? 'fpl-bg text-white cursor-pointer'
                : 'bg-charleston-green text-dim-gray cursor-not-allowed'
            }`}
          >
            {CONFIRM_BUTTON_TEXT}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActiveCode;
