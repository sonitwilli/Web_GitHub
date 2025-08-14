import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useSelector } from 'react-redux';
import ModalWrapper from '@/lib/components/modal/ModalWrapper';
import { RootState } from '@/lib/store';
import { PackageItem } from '@/lib/hooks/account/useDeleteAccount';
import styles from './AccountInfoModal.module.css';

export interface AccountInfoModalRef {
  open: () => void;
  close: () => void;
  setPackages: (packages: PackageItem[], extras: PackageItem[]) => void;
}

interface Props {
  onContinue: () => void;
}

const AccountInfoModal = forwardRef<AccountInfoModalRef, Props>(
  ({ onContinue }, ref) => {
    const [open, setOpen] = useState(false);
    const user = useSelector((state: RootState) => state.user.info);
    const [activePackages, setActivePackages] = useState<PackageItem[]>([]);

    useImperativeHandle(ref, () => ({
      open: () => {
        setOpen(true);
      },
      close: () => {
        setOpen(false);
      },
      setPackages: (packages: PackageItem[], extras: PackageItem[]) => {
        // Combine packages and extras into one array
        setActivePackages([...packages, ...extras]);
      },
    }));

    return (
      <ModalWrapper
        id="delete-account-info-modal"
        open={open}
        onHidden={() => setOpen(false)}
        shouldCloseOnEsc={false}
        shouldCloseOnOverlayClick={false}
        contentClassName="w-full max-w-[600px] bg-eerie-black rounded-[16px] p-8 text-white-smoke"
        overlayClassName="fixed inset-0 flex justify-center items-center z-[9999]"
      >
        <div className={`max-h-[70vh] overflow-y-auto ${styles.scrollBar}`}>
          <h3 className="text-center text-[20px] sm:text-[24px] font-semibold mb-[20px] text-white-smoke">
            Thông tin tài khoản
          </h3>
          <div className="text-center text-silver-chalice mb-8">
            Vui lòng kiểm tra thông tin tài khoản của quý khách trước khi thao
            tác
          </div>
          <div
            className={`rounded-lg bg-white-007 p-4 text-silver-chalice ${
              activePackages && activePackages.length > 2
                ? `max-h-[300px] overflow-y-auto ${styles.scrollBar}`
                : ''
            }`}
          >
            <div className="py-[17px] border-b border-black-olive">
              Tài khoản:{' '}
              <span className="text-white-smoke font-medium">
                {user?.user_phone || '-'}
              </span>
            </div>
            <div className="py-[17px] border-b border-black-olive">
              Số ID:{' '}
              <span className="text-white-smoke font-medium">
                {user?.user_id_str || '-'}
              </span>
            </div>
            <div className="mt-2 flex">
              <div className="shrink-0 mr-2">Dịch vụ đã mua:</div>
              <div className="flex-1">
                {activePackages && activePackages.length ? (
                  <div>
                    {activePackages.map((item: PackageItem, index: number) => (
                      <div key={index} className="mb-2">
                        <div className="text-white-smoke font-medium">
                          {item?.plan_name}
                        </div>
                        <div className="flex items-center justify-between text-silver-chalice mt-2 pb-2 border-b border-black-olive">
                          <div>Có thời hạn đến</div>
                          <div>
                            {
                              (item?.expired_date ||
                                item?.next_date ||
                                '') as string
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white-smoke">-</div>
                )}
              </div>
            </div>
          </div>
          <button
            className="block w-full max-w-[240px] h-12 rounded-lg font-medium text-base mx-auto mt-10 bg-gradient-to-r from-portland-orange to-lust text-white-smoke"
            onClick={onContinue}
          >
            Tiếp tục
          </button>
        </div>
      </ModalWrapper>
    );
  },
);

AccountInfoModal.displayName = 'AccountInfoModal';

export default AccountInfoModal;
