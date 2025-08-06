import React from 'react';

export type PaymentResultStatus = 'pending' | 'success' | 'error';

export interface PaymentResultDetail {
  label: string;
  value: string | null;
}

interface PaymentResultCardProps {
  status: PaymentResultStatus;
  title: string;
  message: string;
  details: PaymentResultDetail[];
  buttonText?: string;
  onButtonClick?: () => void;
}

const icons: Record<PaymentResultStatus, string> = {
  pending: '/images/payments/card_waiting.png',
  success: '/images/payments/card_success.png',
  error: '/images/payments/card_error.png',
};

export const PaymentResultCard: React.FC<PaymentResultCardProps> = ({
  status,
  title,
  message,
  details,
  buttonText,
  onButtonClick,
}) => (
  <div
    className="relative rounded-[16px] w-full max-w-lg mx-auto bg-smoky-black shadow-lg p-8 flex flex-col items-center mt-12 mb-8"
    style={{
      backgroundImage: `url('/images/payments/bg-payment.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center -1px',
      backgroundRepeat: 'no-repeat',
    }}
  >
    <img src={icons[status]} alt={status} className="mb-6 h-16" />
    <h3 className="font-bold text-white text-2xl mb-3">{title}</h3>
    <div className="w-3/4 mx-auto mb-4 text-base text-white/90 text-center">
      {message}
    </div>
    <div className="w-5/6 mx-auto my-6 bg-white/10 p-4 rounded-md">
      {details.map((item, idx) =>
        item.value ? (
          <div
            className="flex justify-between text-base text-white mb-2 last:mb-0"
            key={idx}
          >
            <p className="text-left max-w-[45%] mb-0">{item.label}</p>
            <p className="text-right font-bold max-w-[55%] mb-0">
              {item.value}
            </p>
          </div>
        ) : null,
      )}
    </div>
    {buttonText && (
      <button
        className="mt-4 bg-gradient-to-r from-[#fe592a] to-[#e93013] rounded-lg w-60 h-12 text-white text-base font-semibold border-none outline-none focus:ring-2 focus:ring-orange-400"
        onClick={onButtonClick}
      >
        {buttonText}
      </button>
    )}
  </div>
);
