import React from 'react';

interface PaymentMethodIconProps {
  type: string;
  iconUrl?: string;
}

const PaymentMethodIcon: React.FC<PaymentMethodIconProps> = ({
  type,
  iconUrl,
}) => {
  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={type}
        className="w-6 h-6 object-cover rounded-[4.8px]"
      />
    );
  }
  // Fallback: render icon theo type như cũ
  // TODO: Thay thế bằng logic icon mặc định nếu cần
  return (
    <span className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
      {type}
    </span>
  );
};

export default PaymentMethodIcon;
