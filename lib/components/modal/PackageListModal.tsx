import { openLoginModal } from '@/lib/store/slices/loginSlice';
import React from 'react';
import { useDispatch } from 'react-redux';
import styles from './PackageListModal.module.css';

interface PackageItem {
  plan_type: string;
  img_url: string;
  title: string;
}

interface PackageListModalProps {
  listPackagesPreview: PackageItem[];
  onClose: () => void;
  onBuy: (planType: string) => void;
}

const PackageListModal: React.FC<PackageListModalProps> = ({
  listPackagesPreview,
  onClose,
  onBuy,
}) => {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col items-center w-full bg-eerie-black rounded-2xl p-0 relative">
      <h4 className="text-center text-[20px] font-medium leading-[26px] text-white-smoke mb-6 w-full">
        {listPackagesPreview[0]?.title || 'Đăng ký'}
      </h4>
      <div
        className={`max-h-[520px] tablet:max-h-auto  ${
          listPackagesPreview.length >= 3 ? 'pt-46' : 'pt-0'
        } px-2 tablet:px-0 tablet:pt-0 overflow-y-auto ${
          styles.customScrollBar
        } flex flex-col md:flex-row gap-6 justify-center items-center px-0 py-0 w-full`}
      >
        {listPackagesPreview.map((item, idx) => (
          <button
            key={idx}
            className="w-full md:w-auto rounded-2xl flex flex-col items-center cursor-pointer transition-transform"
            onClick={() => {
              if (item.plan_type === 'lite') {
                dispatch(openLoginModal());
                onClose();
              } else {
                onBuy(item.plan_type);
              }
            }}
          >
            <img
              className="w-full max-w-[200px] tablet:max-w-[280px] xl:max-w-[340px] h-auto rounded-2xl object-contain"
              src={item.img_url}
              alt={`package-img-${item.plan_type}`}
              onError={(e) =>
                (e.currentTarget.src = '/images/default-poster-vertical.jpg')
              }
              loading="lazy"
              title={item.plan_type}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PackageListModal;
