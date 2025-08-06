import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { AllowPaymentGatewayInfo } from '@/lib/api/payment';

interface PaymentMethodsProps {
  data: AllowPaymentGatewayInfo[];
  currentGateway: string;
  onSetGateway: (slug: string) => void;
}

const PaySelectBox: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={`inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-orange-500 transition-colors duration-200 mr-3 align-middle ${
      active ? 'border-primary bg-primary' : 'border-white-06 bg-transparent'
    }`}
  >
    {active && (
      <span className="block w-3 h-3 m-1 rounded-full shrink-0 bg-orange-500" />
    )}
  </span>
);

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  data,
  currentGateway,
  onSetGateway,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const visibleCount = 5;
  const showExpand = data.length > visibleCount;

  return (
    <div>
      {data && data.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {data.map((item, i) => {
            if (i >= visibleCount && isCollapsed) return null;
            return (
              <div key={item.slug} className="PayMethod__Wrapper">
                <a
                  id={item.slug}
                  href={`#tab-${item.slug}`}
                  className={`PayMethod block relative bg-eerie-black rounded-lg p-3 sm:p-4 cursor-pointer transition-colors`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSetGateway(item?.slug || '');
                  }}
                >
                  <div className="PayMethod__Select absolute left-3 sm:left-4 top-1/2 -translate-y-1/2">
                    <PaySelectBox active={currentGateway === item.slug} />
                  </div>
                  <div className="PayMethod__Icon absolute left-10 sm:left-14 top-1/2 -translate-y-1/2 w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] rounded-[8px] sm:rounded-[10px] overflow-hidden">
                    {item.image_v2 ? (
                      <img
                        src={item.image_v2}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-lg sm:text-xl font-bold rounded-[8px] sm:rounded-[10px]">
                        {item.name?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="PayMethod__Item flex items-center w-full min-h-[45px] sm:min-h-[55px] pl-[70px] sm:pl-[100px]">
                    <div className="PayMethod__Meta w-full">
                      <h5 className="mb-0 text-[13px] sm:text-[15px] font-semibold leading-[17px] sm:leading-[19px]">
                        {item.name}
                      </h5>
                      {item.promotion_info && item.promotion_info !== '' && (
                        <p className="mb-0 mt-1 text-[11px] sm:text-[12px] leading-[13px] sm:leading-[14px] text-[#8a8a8a]">
                          {item.promotion_info}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              </div>
            );
          })}

          {showExpand && isCollapsed && (
            <div
              className="PayMethod__Wrapper"
              onClick={() => setIsCollapsed(false)}
            >
              <div className="PayMethod is-blank flex items-center justify-center bg-gradient-to-b from-black/35 to-black/35 bg-[#202020] rounded-lg text-center py-3 sm:py-4 cursor-pointer">
                <FaPlus className="mr-2 text-white text-sm sm:text-base" />
                <span className="font-medium text-[12px] sm:text-[14px] leading-[150%] text-white">
                  Hiển thị thêm hình thức thanh toán
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
