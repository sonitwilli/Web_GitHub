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

export default forwardRef<AccountInfoModalRef, Props>(function AccountInfoModal(
  { onContinue },
  ref,
) {
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

  const handleContinue = () => {
    setOpen(false);
    onContinue();
  };

  return (
    <ModalWrapper
      id="account-info-modal"
      open={open}
      onHidden={() => setOpen(false)}
      shouldCloseOnEsc={false}
      shouldCloseOnOverlayClick={false}
      contentClassName={`w-full max-w-[343px] tablet:max-w-[568px] bg-eerie-black rounded-[12px] tablet:rounded-[16px] ${styles.accountInfoModalWrapper}`}
      overlayClassName="fixed inset-0 flex justify-center items-center z-[9999] p-4"
    >
      {/* Mobile: 343x454, Tablet/PC: 568x578 */}
      <div
        className={`flex flex-col justify-center items-center p-4 tablet:p-8 gap-8 max-h-full overflow-y-auto ${styles.scrollBar} ${styles.modalContainer}`}
      >
        {/* Header Section */}
        <div
          className={`flex flex-col items-center gap-4 w-full max-w-[311px] tablet:max-w-[388px] ${styles.headerSection}`}
        >
          {/* Title */}
          <h2
            className={`text-white-smoke font-semibold text-[20px] tablet:text-[24px] leading-[130%] tracking-[0.02em] text-center ${styles.headerTitle}`}
          >
            Thông tin tài khoản
          </h2>

          {/* Description */}
          <p
            className={`text-spanish-gray font-normal text-[16px] leading-[130%] tracking-[0.02em] text-center w-full ${styles.headerDescription}`}
          >
            Vui lòng kiểm tra thông tin tài khoản của quý khách trước khi thao
            tác
          </p>
        </div>

        {/* Content Section */}
        <div
          className={`flex flex-col gap-4 w-full max-w-[311px] tablet:max-w-[504px] ${styles.contentSection}`}
        >
          {/* Account Info Row */}
          <div
            className={`flex flex-row justify-between items-center gap-2 tablet:gap-3 tablet:justify-start ${styles.infoRow}`}
          >
            <span
              className={`text-silver-chalice font-normal text-[16px] leading-[130%] tracking-[0.02em] w-[120px] tablet:w-[160px] flex-shrink-0 ${styles.labelText}`}
            >
              Tài khoản
            </span>
            <span
              className={`text-white-smoke font-medium text-[16px] leading-[130%] tracking-[0.02em] text-right tablet:text-left ${styles.valueText}`}
            >
              {user?.user_phone || '-'}
            </span>
          </div>

          {/* Divider */}
          <div className="w-full h-px border-t border-black-olive-404040"></div>

          {/* User ID Row */}
          <div
            className={`flex flex-row justify-between items-center gap-2 tablet:gap-3 tablet:justify-start ${styles.infoRow}`}
          >
            <span
              className={`text-silver-chalice font-normal text-[16px] leading-[130%] tracking-[0.02em] w-[120px] tablet:w-[160px] flex-shrink-0 ${styles.labelText}`}
            >
              Số ID
            </span>
            <span
              className={`text-white-smoke font-medium text-[16px] leading-[130%] tracking-[0.02em] text-right tablet:text-left ${styles.valueText}`}
            >
              {user?.user_id_str || '-'}
            </span>
          </div>

          {/* Divider */}
          <div className="w-full h-px border-t border-black-olive-404040"></div>

          {/* Services Section */}
          <div
            className={`flex ${
              !activePackages || activePackages.length === 0
                ? 'flex-row justify-between items-center gap-2 tablet:gap-3 tablet:justify-start'
                : 'flex-col'
            } tablet:flex-row tablet:items-start gap-3 tablet:gap-3`}
          >
            <span
              className={`w-[120px] tablet:w-[160px] text-silver-chalice font-normal text-[16px] leading-[130%] tracking-[0.02em] flex-shrink-0 ${styles.servicesLabel}`}
            >
              Dịch vụ đã mua
            </span>

            {!activePackages || activePackages.length === 0 ? (
              <span
                className={`text-white-smoke font-medium text-[16px] leading-[130%] tracking-[0.02em] text-right tablet:text-left ${styles.valueText}`}
              >
                Không có
              </span>
            ) : (
              <div className="flex-1">
                {activePackages && activePackages.length > 0 ? (
                  <div
                    className={`rounded-[12px] bg-white-007 p-4 text-silver-chalice ${
                      styles.servicesContainer
                    } ${
                      activePackages.length > 1
                        ? `min-h-[79px] max-h-[calc(40vh-145px)] tablet:max-h-[208px] overflow-y-auto ${styles.scrollBar}`
                        : ''
                    }`}
                  >
                    {activePackages.map((item: PackageItem, index: number) => (
                      <div
                        key={index}
                        className={`${index > 0 ? 'mt-4' : ''} ${
                          styles.serviceItem
                        }`}
                      >
                        <div
                          className={`text-white-smoke font-medium text-[16px] leading-[130%] tracking-[0.02em] ${styles.serviceName}`}
                        >
                          {item?.plan_name}
                        </div>
                        <div
                          className={`flex items-center justify-between text-silver-chalice mt-2 pb-2 ${
                            styles.serviceDetails
                          } ${
                            index === activePackages.length - 1
                              ? 'border-b-0'
                              : 'border-b border-black-olive'
                          }`}
                        >
                          <div
                            className={`text-[14px] tablet:text-[16px] leading-[130%] tracking-[0.02em] ${styles.serviceDetailText}`}
                          >
                            Có thời hạn đến
                          </div>
                          <div
                            className={`text-[14px] tablet:text-[16px] leading-[130%] tracking-[0.02em] ${styles.serviceDetailText}`}
                          >
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
                  <div
                    className={`rounded-[12px] bg-white-007 p-4 text-white-smoke ${styles.servicesContainer}`}
                  >
                    -
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Button Section */}
        <div
          className={`flex flex-row items-center gap-4 w-full max-w-[311px] tablet:max-w-[504px] ${styles.buttonSection}`}
        >
          <button
            onClick={handleContinue}
            className={`cursor-pointer flex flex-row justify-center items-center px-4 tablet:px-6 py-2 tablet:py-3 gap-2 w-full h-[40px] tablet:h-[47px] bg-gradient-to-r from-portland-orange to-lust rounded-[40px] text-white-smoke font-semibold text-[16px] leading-[130%] tracking-[0.02em] ${styles.continueButton}`}
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
});
