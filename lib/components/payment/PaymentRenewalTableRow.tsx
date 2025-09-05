import React from 'react';
import PaymentMethodIcon from '@/lib/components/payment/PaymentMethodIcon';
import PaymentRenewalTableMenu from '@/lib/components/payment/PaymentRenewalTableMenu';

interface RowProps {
  name: string;
  startDate: string;
  nextCycle: string;
  method: { type: string; value: string; name: string };
  price: string;
  showMenu: boolean;
  onMenuToggle: () => void;
  onCloseMenu: () => void;
  isLast?: boolean;
  iconUrl?: string;
}

const PaymentRenewalTableRow: React.FC<RowProps> = ({
  name,
  startDate,
  nextCycle,
  method,
  price,
  showMenu,
  onMenuToggle,
  onCloseMenu,
  isLast = false,
  iconUrl,
}) => {
  return (
    <tr
      className={`text-base relative ${
        isLast ? 'rounded-b-[16px]' : 'border-b border-[#333]'
      }`}
    >
      <td
        className="px-8 py-3 rounded-bl-[16px] font-semibold text-white-smoke text-base font-normal min-w-[180px] lg:min-w-[25%]"
        title={name}
      >
        <div className="line-clamp-2 overflow-hidden break-words">{name}</div>
      </td>
      <td className="px-8 py-3 min-w-[195px] lg:min-w-[18%] text-white-smoke text-base font-normal">
        {startDate}
      </td>
      <td className="px-8 py-3 min-w-[195px] lg:min-w-[18%] text-white-smoke text-base font-normal">
        {nextCycle}
      </td>
      <td className="px-8 py-3 min-w-[252px] lg:min-w-[25%]">
        <div className="flex items-center gap-4">
          <PaymentMethodIcon type={method.type} iconUrl={iconUrl} />
          <div className="flex flex-col gap-1">
            <span className="text-base font-normal text-white-smoke">
              {method.name}
            </span>
            <span className="text-sm font-normal text-spanish-gray">
              {method.value}
            </span>
          </div>
        </div>
      </td>
      <td className="px-8 py-3 min-w-[140px] lg:min-w-[14%] text-white-smoke text-base font-normal">
        {price}
      </td>
      <td className="px-8 py-3 text-center relative min-w-[10px] lg:min-w-[10%] rounded-br-[16px]">
        <PaymentRenewalTableMenu
          isOpen={showMenu}
          onToggle={onMenuToggle}
          onClose={onCloseMenu}
        />
      </td>
    </tr>
  );
};

export default PaymentRenewalTableRow;
