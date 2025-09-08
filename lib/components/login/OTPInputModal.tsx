'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  onSendOTPResponse,
  onSubmitVerifyOTPResponse,
  verifyUserWithPhoneNumberResponse,
} from '@/lib/api/login';
import ClickAnimation from '../animation/ClickAnimation';
import { LOGIN_PHONE_NUMBER } from '@/lib/constant/texts';

type Props = {
  resPhoneInput?: verifyUserWithPhoneNumberResponse['data'] | null;
  resSendOTP?: onSendOTPResponse | null;
  resVerifyOTP?: onSubmitVerifyOTPResponse | null;
  error?: string;
  handleSendOTP: (phone?: string, verifyToken?: string) => void;
  handleReSendOTP: (phone?: string) => void;
  handleVerifyOTP: (phone?: string, otpCode?: string) => void;
  onClose: () => void;
  otpCountdown: number;
};

export default function OTPInputModal({
  resPhoneInput,
  resSendOTP,
  handleSendOTP,
  handleReSendOTP,
  handleVerifyOTP,
  error,
  otpCountdown,
}: Props) {
  const { register, handleSubmit, watch, setValue } = useForm<{ otp: string }>({
    defaultValues: { otp: '' },
  });

  const [countdown, setCountdown] = useState<number>(0);
  const [otpLength, setOtpLength] = useState<number>(10);
  const [title, setTitle] = useState<string>('');
  const [responseMsg, setResponseMsg] = useState<string>('');
  const [isOtpValid, setIsOtpValid] = useState(false);
  const [errorResponse, setErrorResponse] = useState('');
  const [isLoadingReSendOTP, setIsLoadingReSendOTP] = useState(false);

  const otp = watch('otp');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!resSendOTP?.data) return;

    const { title, otp_length } = resSendOTP.data;

    if (title != null) {
      setTitle(title);
    }

    if (otp_length != null) {
      setOtpLength(Number(otp_length));
    }

    if (resSendOTP.msg) {
      setResponseMsg(resSendOTP.msg);
    }

    setIsLoadingReSendOTP(false);
  }, [resSendOTP]);

  useEffect(() => {
    setCountdown(otpCountdown);
  }, [otpCountdown]);

  useEffect(() => {
    if (typeof otp === 'string' && otpLength > 0) {
      setIsOtpValid(otp.length === otpLength);
    } else {
      setIsOtpValid(false);
    }
  }, [otp, otpLength]);

  useEffect(() => {
    setErrorResponse(error || '');
  }, [error]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Chỉ giữ số
    setValue('otp', value);
    if (errorResponse && value.length === 0) {
      setErrorResponse('');
    }
  };

  const clickSendOTP = () => {
    handleSendOTP(
      localStorage.getItem(LOGIN_PHONE_NUMBER) as string,
      resPhoneInput?.verify_token,
    );
    setTimeout(() => inputRef.current?.focus(), 500);
  };

  const clickReSendOTP = () => {
    if (isLoadingReSendOTP || countdown > 0) return; // Prevent spam clicking and countdown

    setIsLoadingReSendOTP(true);
    setErrorResponse(''); // Clear previous errors

    handleReSendOTP(localStorage.getItem(LOGIN_PHONE_NUMBER) as string);
    setTimeout(() => inputRef.current?.focus(), 500);
  };

  const handleOtpSubmit = ({ otp }: { otp: string }) => {
    // Gọi API xác thực OTP tại đây nếu cần
    handleVerifyOTP(localStorage.getItem(LOGIN_PHONE_NUMBER) as string, otp);
    if (document.fullscreenElement) document.exitFullscreen();
  };

  const renderDescription = () => {
    const phone = resPhoneInput?.mask_phone || '';
    if (responseMsg.includes(phone)) {
      const [part1, part2] = responseMsg.split(phone);
      return (
        <p className="content text-spanish-gray mb-8 text-[14px] tablet:text-[16px]">
          {part1}
          <span className="font-semibold text-white-smoke"> {phone} </span>
          {part2}
        </p>
      );
    }

    return responseMsg ? (
      <p className="text-[14px] tablet:text-[16px] content text-spanish-gray mb-8">
        {responseMsg}
      </p>
    ) : (
      <p className="text-[14px] tablet:text-[16px] content text-spanish-gray mb-8">
        Nhấn nút
        <span className="text-white-smoke font-semibold">
          {' '}
          {resPhoneInput?.text_format?.[0] || 'Nhận mã OTP ngay'}{' '}
        </span>
        để tiếp tục. Mã OTP sẽ được gửi đến số điện thoại
        <span className="text-white-smoke font-semibold">
          {' '}
          {resPhoneInput?.text_format?.[1] || resPhoneInput?.mask_phone}{' '}
        </span>
      </p>
    );
  };

  return (
    <div className="fixed top-1/2 left-1/2 z-[1002] w-[320px] tablet:w-[460px] transform -translate-x-1/2 -translate-y-1/2 rounded-[16px] p-[24px] tablet:p-[32px] bg-eerie-black">
      <div>
        <h1 className="text-[20px] mb-4 tablet:mb-8 tablet:text-2xl text-center tablet:text-left font-semibold text-smoke-white">
          {title || 'Xác thực mã OTP'}
        </h1>

        {renderDescription()}

        {!resSendOTP ? (
          <button
            onClick={clickSendOTP}
            className="relative h-12 w-full rounded-[52px] fpl-bg text-white-smoke font-medium cursor-pointer"
          >
            {'Nhận mã OTP ngay'}
            <div className="absolute top-1/2 right-4 w-[70px] h-[70px] tablet:w-[100px] tablet:h-[100px] -translate-y-1/2">
              <ClickAnimation />
            </div>
          </button>
        ) : (
          <form
            onSubmit={handleSubmit(handleOtpSubmit)}
            className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-1 mb-4"
          >
            {/* Input OTP */}
            <input
              {...register('otp', {
                minLength: {
                  value: otpLength,
                  message: `OTP phải có ${otpLength} chữ số`,
                },
                maxLength: {
                  value: otpLength,
                  message: `OTP không vượt quá ${otpLength} chữ số`,
                },
              })}
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={otpLength}
              autoFocus
              placeholder="Nhập mã OTP"
              value={otp}
              onInput={handleInput}
              className={`
                peer
                col-span-1 row-span-1
                h-[48px] tablet:h-14 w-full rounded-[52px] px-4 
                placeholder:text-davys-grey text-white
                border
                transition-all duration-200
                ${
                  errorResponse ? 'border-scarlet' : 'border-black-olive-404040'
                }
                focus:outline-none
              `}
            />

            {/* Gửi lại OTP / countdown */}
            {countdown > 0 ? (
              <div className="row-span-1 w-[48px] tablet:w-[56px] h-[48px] tablet:h-14 flex items-center justify-center rounded-[52px] bg-charleston-green text-spanish-gray text-[14px] tablet:text-base font-medium">
                {countdown}s
              </div>
            ) : (
              <button
                type="button"
                onClick={clickReSendOTP}
                disabled={isLoadingReSendOTP}
                className="row-span-1 w-[138px] h-[48px] tablet:h-14 rounded-[52px] fpl-bg text-white-smoke text-[14px] tablet:text-base font-medium cursor-pointer hover:opacity-90 active:scale-[0.98]"
              >
                Gửi lại OTP
              </button>
            )}

            {/* Error Message */}
            {errorResponse && (
              <p className="col-span-2 mt-1 text-sm font-normal text-scarlet!">
                {errorResponse}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isOtpValid}
              className={`col-span-2 h-12 mt-8 w-full rounded-[52px] font-medium transition-colors duration-200 border-none outline-none
              ${
                isOtpValid
                  ? 'fpl-bg text-white hover:opacity-90 active:scale-[0.98] cursor-pointer'
                  : 'bg-charleston-green text-black-olive-404040 cursor-default'
              }
            `}
            >
              Xác nhận
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
