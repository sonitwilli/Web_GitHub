import React from 'react';

const PaymentRenewalTableHeader: React.FC = () => (
  <thead className="bg-charleston-green rounded-t-[16px]">
    <tr>
      <th className="px-8 py-4 font-normal text-base text-left rounded-tl-[16px]">
        Tên gói
      </th>
      <th className="px-8 py-4 font-normal text-base text-left max-w-[210px]">
        <div className="line-clamp-2 overflow-hidden text-ellipsis">
          Ngày bắt đầu tính cước
        </div>
      </th>
      <th className="px-8 py-4 font-normal text-base text-left max-w-[210px]">
        <div className="line-clamp-2 overflow-hidden text-ellipsis">
          Chu kỳ cước tiếp theo
        </div>
      </th>
      <th className="px-8 py-4 font-normal text-base text-left max-w-[252px]">
        Phương thức thanh toán
      </th>
      <th className="px-8 py-4 font-normal text-base text-left max-w-[160px]">
        Giá tiền
      </th>
      <th className="w-10 rounded-tr-[16px]"></th>
    </tr>
  </thead>
);

export default PaymentRenewalTableHeader;
