import React, { forwardRef, useImperativeHandle, useState } from 'react';
import ModalWrapper from '@/lib/components/modal/ModalWrapper';
import styles from './AccountInfoModal.module.css';
import Spinner from '../svg/Spinner';
import Link from 'next/link';

export interface DeleteAccountPolicyModalRef {
  open: (policy?: string) => void;
  close: () => void;
}

interface Props {
  onSubmit: () => void;
}

export default forwardRef<DeleteAccountPolicyModalRef, Props>(
  function DeleteAccountPolicyModal({ onSubmit }, ref) {
    const [open, setOpen] = useState(false);
    const [checked, setChecked] = useState(false);
    const [policy, setPolicy] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useImperativeHandle(ref, () => ({
      open: async (p?: string) => {
        setChecked(false);
        setOpen(true);

        if (p) {
          setPolicy(p);
        } else {
          // Fetch policy from API like in Nuxt
          await fetchPolicyContent();
        }
      },
      close: () => setOpen(false),
    }));

    const fetchPolicyContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_LANDING_PAGE}/page/xac-nhan-xoa-tai-khoan/block`,
        );
        const result = await response.json();

        const htmlContent = result?.data?.[0]?.block_html?.html_desktop || '';
        setPolicy(htmlContent);
      } catch {
        setPolicy('Không thể tải nội dung điều khoản. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    return (
      <ModalWrapper
        id="delete-account-policy-modal"
        open={open}
        onHidden={() => setOpen(false)}
        shouldCloseOnEsc={false}
        shouldCloseOnOverlayClick={false}
        contentClassName="w-full max-w-[343px] min-h-[400px] max-h-[90vh] tablet:max-w-[576px] tablet:min-h-[540px] tablet:max-h-[90vh] bg-eerie-black rounded-[12px] tablet:rounded-[16px]"
        overlayClassName="fixed inset-0 flex justify-center items-center z-[9999] p-4"
      >
        {/* Mobile: 343x400+, Tablet/PC: 576x540 */}
        <div className="flex flex-col justify-center items-center p-6 tablet:p-8 gap-6 tablet:gap-8 max-h-full overflow-y-auto">
          {/* Header Section */}
          <div className="flex flex-col items-center gap-4 w-full max-w-[311px] tablet:max-w-[386px]">
            {/* Title */}
            <h2 className="text-white-smoke font-semibold text-[20px] tablet:text-[24px] leading-[130%] tracking-[0.02em] text-center w-full">
              Điều khoản nội dung khi thực hiện xóa tài khoản
            </h2>
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-4 w-full max-w-[311px] tablet:max-w-[512px]">
            {/* Policy Content Container */}
            <div className="relative">
              {loading ? (
                <div className="flex justify-center items-center h-[200px] bg-white-007 rounded-[12px] p-4">
                  <div className="icon-spin">
                    <Spinner />
                  </div>
                </div>
              ) : (
                <div
                  className={`bg-white-007 rounded-[12px] p-4 text-white-smoke font-normal text-[14px] tablet:text-[16px] leading-[130%] tracking-[0.02em] ${
                    policy.length > 500
                      ? `min-h-[200px] max-h-[263px] overflow-y-auto ${styles.scrollBar} ${styles.policyContent}`
                      : 'min-h-[200px]'
                  }`}
                  dangerouslySetInnerHTML={{ __html: policy }}
                />
              )}
            </div>
          </div>

          {/* Button Section */}
          <div className="flex flex-col justify-center items-start gap-4 w-full max-w-[311px] tablet:max-w-[512px]">
            {/* Continue Button */}
            <button
              onClick={onSubmit}
              disabled={!checked || loading}
              className={`flex flex-row justify-center items-center px-4 tablet:px-6 py-2 tablet:py-3 gap-2 w-full h-[40px] tablet:h-[47px] rounded-[40px] font-semibold text-[16px] leading-[130%] tracking-[0.02em] transition-all duration-200 ${
                checked && !loading
                  ? 'bg-gradient-to-r from-portland-orange to-lust text-white-smoke cursor-pointer hover:opacity-90'
                  : 'bg-charleston-green text-spanish-gray cursor-not-allowed'
              }`}
            >
              Tiếp tục
            </button>

            {/* Checkbox Section */}
            <div className="flex flex-row items-center gap-2 w-full">
              <div className="flex flex-row items-center gap-2">
                {/* Custom Checkbox */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="absolute opacity-0 w-0 h-0"
                  />
                  <div
                    className={`w-[18px] h-[18px] rounded-[3px] cursor-pointer transition-all duration-200 ${
                      checked
                        ? 'bg-fpl border-none'
                        : 'bg-transparent border border-ash-grey'
                    }`}
                    onClick={() => setChecked(!checked)}
                  >
                    {checked && (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          width="12"
                          height="9"
                          viewBox="0 0 12 9"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 4.5L4.5 8L11 1.5"
                            stroke="#F5F5F4"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkbox Label */}
                <span className="text-white-06 font-normal text-[12px] tablet:text-[14px] leading-[130%] tracking-[0.02em] flex-1">
                  Tôi đã đọc và đồng ý với{' '}
                  <Link
                    prefetch={false}
                    href={'/thong-tin/dieu-khoan-su-dung'}
                    className="ml-[3px] cursor-pointer text-fpl underline terms"
                  >
                    Điều khoản sử dụng FPT Play
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </ModalWrapper>
    );
  },
);
