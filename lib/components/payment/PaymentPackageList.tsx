import React, { useEffect } from 'react';
import { MdOutlineWallet } from 'react-icons/md';
import { TiArrowSync } from 'react-icons/ti';
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaChevronRight } from 'react-icons/fa6';
import { MdRedeem } from "react-icons/md";
import Link from 'next/link';
import { useAppDispatch } from '@/lib/store';
import { setSideBarLeft } from '@/lib/store/slices/multiProfiles';

const items = [
  {
    icon: MdOutlineWallet, // Thay bằng icon thực tế nếu có
    label: 'Gói đang sử dụng',
    href: '/tai-khoan?tab=goi-dang-su-dung',
  },
  {
    icon: TiArrowSync,
    label: 'Quản lý gia hạn dịch vụ',
    href: '/tai-khoan?tab=quan-ly-gia-han-dich-vu',
  },
  {
    icon: MdOutlineShoppingCart,
    label: 'Lịch sử giao dịch',
    href: '/tai-khoan?tab=lich-su-giao-dich',
  },
  {
    icon: MdRedeem,
    label: 'Đổi mã quà tặng',
    href: '/tai-khoan?tab=ma-kich-hoat',
  },
];

const PaymentPackageList: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      setSideBarLeft({
        text: 'Quay lại FPT Play',
        url: '/',
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className='max-w-[856px]'>
      <h2 className="text-[28px] font-semibold leading-[1.3] text-white-smoke mb-6 xl:mt-3">
        Quản lý thanh toán và gói
      </h2>
      <div className="flex flex-col gap-[16px]">
        {items.map((item, idx) => (
          <Link
            href={item.href}
            key={idx}
            className="flex items-center bg-eerie-black gap-[16px] hover:bg-charleston-green rounded-[12px] px-6 py-[18px] text-base font-medium cursor-pointer relative"
          >
            <item.icon size={24} className="text-silver-chalice" />
            <span className="flex-1 text-white-smoke font-base line-[1.3]">
              {item.label}
            </span>
            <FaChevronRight size={18} className="text-silver-chalice" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PaymentPackageList;
