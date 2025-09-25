import React from 'react';

export interface ActivePackageCardProps {
  name: string;
  fromDate: string;
  toDate: string;
  isSub?: boolean; // true: gói trả phí, false: gói tặng/khuyến mãi
}

const ActivePackageCard: React.FC<ActivePackageCardProps> = ({
  name,
  fromDate,
  toDate,
  isSub,
}) => {
  return (
    <div className="bg-eerie-black rounded-[12px] flex flex-col min-w-[350px] lg:max-w-[420px]">
      <div
        className="text-white py-4 px-6 font-semibold text-base border-b border-charleston-green overflow-hidden text-ellipsis whitespace-nowrap max-w-[420px]"
      >
        {name}
      </div>
      <div className="flex justify-between text-xs text-gray-400 py-4 px-6">
        <div>
          <div className="text-base font-normal text-spanish-gray line-[1.3] mb-[16px]">
            {isSub ? 'Ngày bắt đầu tính cước' : 'Ngày sử dụng từ'}
          </div>
          <div className="text-base font-normal text-spanish-gray line-[1.3]">
            {isSub ? 'Chu kỳ cước tiếp theo' : 'Có thời hạn đến'}
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-normal text-white-smoke line-[1.3] mb-[16px]">
            {fromDate}
          </div>
          <div className="text-base font-normal text-white-smoke line-[1.3]">
            {toDate}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivePackageCard;
