import React, { forwardRef, useImperativeHandle, useState } from 'react';
import ModalWrapper from '@/lib/components/modal/ModalWrapper';
import styles from './AccountInfoModal.module.css';

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
      } catch (error) {
        console.error('Failed to fetch policy content:', error);
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
        contentClassName="w-full max-w-[600px] bg-eerie-black rounded-[16px] p-8 text-white-smoke"
        overlayClassName="fixed inset-0 bg-black-06 flex justify-center items-center z-[9999]"
      >
        <div className={`max-h-[70vh] overflow-y-auto ${styles.scrollBar}`}>
          {loading ? (
            <div className="flex justify-center items-center h-[200px]">
              <div className="text-silver-chalice">Đang tải...</div>
            </div>
          ) : (
            <div
              className={`rounded-lg bg-licorice px-6 py-4 max-h-[320px] overflow-y-auto ${styles.scrollBar}`}
              dangerouslySetInnerHTML={{ __html: policy }}
            />
          )}

          <div className="mt-8 flex items-start gap-3">
            <label className="relative inline-flex cursor-pointer items-start mt-[2px]">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="peer sr-only"
              />
              <div className="h-[16px] w-[16px] shrink-0 rounded-[2px] border border-ash-grey bg-transparent peer-checked:border-none peer-checked:bg-[url('/images/svg/check.svg')] peer-checked:bg-no-repeat peer-checked:bg-cover" />
            </label>
            <span
              className="text-[14px] text-white-smoke cursor-pointer"
              onClick={() => setChecked(!checked)}
            >
              Tôi đồng ý với điều khoản nội dung khi thực hiện xóa tài khoản
            </span>
          </div>

          <button
            className={`block w-full max-w-[240px] h-12 rounded-lg font-medium text-[16px] mx-auto mt-8 transition-colors duration-300 ${
              checked
                ? 'bg-gradient-to-r from-portland-orange to-lust text-white-smoke hover:opacity-90'
                : 'bg-charleston-green text-spanish-gray cursor-not-allowed'
            }`}
            disabled={!checked || loading}
            onClick={() => onSubmit()}
          >
            Tiếp tục
          </button>
        </div>
      </ModalWrapper>
    );
  },
);
