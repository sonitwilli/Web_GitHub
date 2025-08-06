'use client';

import { FC } from 'react';
import Link from 'next/link';

interface NoDataProps {
  text?: string;
}

const NoData: FC<NoDataProps> = ({ text = 'Không có dữ liệu!' }) => {
  return (
    <div
      id="no-data"
      className="w-full h-full flex items-center justify-center text-center"
    >
      <div className="flex flex-col items-center">
        <img
          src="/images/EmptyData.png"
          alt="NoData"
          className="max-w-[260px]"
        />
        <h6 className="text-[20px] font-semibold leading-[1.3] my-8 text-white-smoke">
          {text}
        </h6>
        <Link
          href={'/'}
          prefetch={false}
          title="Về trang chủ"
          className="min-w-[184px] cursor-pointer text-[16px] text-white-smoke font-semibold leading-[1.3] px-[45px] py-[10px] rounded-[40px] bg-[linear-gradient(135deg,_#FE592A_0%,_#E93013_100%)]"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NoData;
