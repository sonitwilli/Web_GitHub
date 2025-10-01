import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from 'react';
import ModalWrapper from '@/lib/components/modal/ModalWrapper';
import styles from './AccountInfoModal.module.css';
import Spinner from '../svg/Spinner';
import Link from 'next/link';
import useScreenSize from '@/lib/hooks/useScreenSize';

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
    const { width, height } = useScreenSize();

    // Detect landscape mode on mobile/tablet
    const isLandscape = width > height && width <= 1024;
    const isMobile = width <= 768;

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

    // Note: Body scroll handling is now managed at page level (xoa-tai-khoan.tsx)

    // Handle modal overlay background
    useEffect(() => {
      if (open) {
        const overlay = document.querySelector(
          '#delete-account-policy-modal .ReactModal__Overlay',
        );
        if (overlay) {
          (overlay as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        }
      }
    }, [open]);

    return (
      <ModalWrapper
        id="delete-account-policy-modal"
        open={open}
        onHidden={() => setOpen(false)}
        shouldCloseOnEsc={false}
        shouldCloseOnOverlayClick={false}
        contentClassName={`
          w-full bg-eerie-black rounded-[12px]
          ${
            isLandscape
              ? 'max-w-[596px]'
              : isMobile
              ? 'max-w-[343px] min-h-[400px] max-h-[90vh]'
              : 'max-w-[576px] min-h-[540px] max-h-[90vh]'
          }
          ${styles.accountInfoModalWrapper}
        `}
        overlayClassName={`
          fixed inset-0 z-[9999]
          ${
            isLandscape
              ? 'flex justify-center items-start pt-[87px] pb-[24px] overflow-y-auto'
              : 'flex justify-center items-center p-4'
          }
        `}
      >
        {/* Landscape: 596x587, Mobile: 343x400+, Tablet/PC: 576x540 */}
        <div
          className={`
            flex flex-col justify-center items-center gap-4
            ${isLandscape ? 'gap-4' : isMobile ? 'p-6 gap-6' : 'p-8 gap-8'}
            ${isLandscape ? '' : 'max-h-full overflow-y-auto'}
            ${styles.scrollBar} ${styles.modalContainer}
          `}
          style={isLandscape ? {} : { maxHeight: '90vh' }}
        >
          {/* Header Section */}
          <div
            className={`
              flex flex-col items-center gap-4 w-full
              ${
                isLandscape
                  ? 'max-w-[564px]'
                  : isMobile
                  ? 'max-w-[311px]'
                  : 'max-w-[386px]'
              }
              ${styles.headerSection}
            `}
          >
            {/* Title */}
            <h2
              className={`
                text-white-smoke font-semibold leading-[130%] tracking-[0.02em] text-center w-full
                ${
                  isLandscape ? 'text-[20px]' : 'text-[20px] tablet:text-[24px]'
                }
                ${styles.headerTitle}
              `}
            >
              Điều khoản nội dung khi thực hiện xóa tài khoản
            </h2>
          </div>

          {/* Content Section */}
          <div
            className={`
              flex flex-col gap-4 w-full
              ${
                isLandscape
                  ? 'max-w-[564px]'
                  : isMobile
                  ? 'max-w-[311px]'
                  : 'max-w-[512px]'
              }
              ${styles.contentSection}
            `}
          >
            {/* Policy Content Container */}
            <div className="relative">
              {loading ? (
                <div
                  className={`flex justify-center items-center min-h-[200px] bg-white-007 rounded-[12px] p-4 ${styles.policySpinner}`}
                >
                  <div className="icon-spin">
                    <Spinner />
                  </div>
                </div>
              ) : (
                <div
                  className={`
                    bg-white-007 rounded-[12px] p-4 text-white-smoke font-normal leading-[130%] tracking-[0.02em]
                    ${
                      isLandscape
                        ? 'text-[16px]'
                        : 'text-[14px] tablet:text-[16px]'
                    }
                    ${styles.servicesContainer}
                    ${
                      policy.length > 500
                        ? `min-h-[200px] overflow-y-auto ${styles.scrollBar}
                           ${
                             isLandscape
                               ? 'max-h-[265px]'
                               : 'max-h-[calc(50vh-80px)] tablet:max-h-[263px]'
                           }`
                        : 'min-h-[200px]'
                    }
                  `}
                  dangerouslySetInnerHTML={{ __html: policy }}
                />
              )}
            </div>
          </div>

          {/* Button Section */}
          <div
            className={`
              flex flex-col justify-center items-start gap-4 w-full
              ${
                isLandscape
                  ? 'max-w-[564px]'
                  : isMobile
                  ? 'max-w-[311px]'
                  : 'max-w-[512px]'
              }
              ${styles.buttonSection}
            `}
          >
            {/* Continue Button */}
            <button
              onClick={onSubmit}
              disabled={!checked || loading}
              className={`
                flex flex-row justify-center items-center gap-2 w-full font-semibold text-[16px] leading-[130%] tracking-[0.02em] transition-all duration-200
                ${
                  isLandscape
                    ? 'px-4 py-2 h-[40px]'
                    : 'px-4 tablet:px-6 py-2 tablet:py-3 h-[40px] tablet:h-[47px]'
                }
                rounded-[40px] ${styles.continueButton}
                ${
                  checked && !loading
                    ? 'bg-gradient-to-r from-portland-orange to-lust text-white-smoke cursor-pointer hover:opacity-90'
                    : 'bg-charleston-green text-spanish-gray cursor-not-allowed'
                }
              `}
            >
              Tiếp tục
            </button>

            {/* Checkbox Section */}
            <div
              className={`flex flex-row items-center gap-2 w-full ${styles.policyCheckboxSection}`}
            >
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
                <span
                  className={`text-white-06 font-normal text-[12px] tablet:text-[14px] leading-[130%] tracking-[0.02em] flex-1 ${styles.policyCheckboxLabel}`}
                >
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
