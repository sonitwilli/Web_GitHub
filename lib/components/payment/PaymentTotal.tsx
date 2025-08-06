import React, { useState, useMemo, useEffect } from 'react';
import { useAppSelector } from '@/lib/store';
import { checkCoupon, Plan } from '@/lib/api/payment';
import { currencyFormat } from '@/lib/utils/formatString';

interface PaymentTotalProps {
  selectedPlan: Plan;
  onCheckout: () => void;
  policyHtml?: { html_desktop?: string };
  onCouponChange?: (couponData: CouponData | null) => void;
  loading?: boolean;
}
export interface CouponData {
  price: number;
  time?: number;
  code?: string;
  coupon_type?: string;
  value?: number;
  discount_amount?: number;
}
const PaymentTotal: React.FC<PaymentTotalProps> = ({
  selectedPlan,
  onCheckout,
  policyHtml,
  onCouponChange,
  loading,
}) => {
  // User info from Redux
  const user = useAppSelector((state) => state.user.info);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponErrorMsg, setCouponErrorMsg] = useState('');
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [isInput, setIsInput] = useState(false);

  // Discount logic
  const getDiscountPrice = (plan: Plan, coupon: { price: number } | null) => {
    const amount = plan?.amount ?? 0;
    if (coupon) {
      return currencyFormat(amount - coupon.price / 1000, plan?.currency);
    } else if (plan?.discount_display) {
      return currencyFormat(plan?.discount_display, plan?.currency);
    } else {
      return `0 ${plan?.currency}`;
    }
  };

  // Total price logic
  const totalPrice = useMemo(() => {
    if (couponData) {
      return couponData.price / 1000;
    }
    return selectedPlan?.amount ?? 0;
  }, [couponData, selectedPlan?.amount]);

  useEffect(() => {
    setCouponData(null);
    setCouponErrorMsg('');
    setCouponInput('');
    setIsInput(false);
  }, [selectedPlan]);
  useEffect(() => {
    onCouponChange?.(couponData);
  }, [couponData, onCouponChange]);
  // Coupon apply handler (simulate or call API)
  const handleApplyCoupon = async () => {
    if (couponInput.trim() === '') {
      return;
    }
    const response = await checkCoupon({
      plan_id: selectedPlan?.plan_id?.toString() ?? '',
      coupon: couponInput,
    });
    const couponRes = response.data;
    const planAmount = selectedPlan.amount ?? 0;
    if (!couponRes.status) {
      setCouponErrorMsg(
        couponRes.msg || 'Mã khuyến mãi không hợp lệ hoặc đã hết hạn.',
      );
      setCouponData({
        price: planAmount * 1000,
        time: selectedPlan.value_date ?? 0,
      });
    } else {
      setCouponErrorMsg(couponRes.msg || '');
      if (couponRes?.msg_data?.coupon_type) {
        switch (couponRes.msg_data.coupon_type) {
          case 'percentMoney':
          case 'money':
            setCouponData({
              price: (couponRes.msg_data.applyCouponValue ?? 0) * 1000,
              time: selectedPlan.value_date ?? 0,
              coupon_type: couponRes.msg_data.coupon_type,
              code: couponRes.msg_data.code,
              value: couponRes.msg_data.value,
              discount_amount: couponRes.msg_data.discount_amount,
            });
            break;
          case 'day':
          case 'percentDay':
            setCouponData({
              price: planAmount * 1000,
              time: couponRes.msg_data.applyCouponValue ?? 0,
              coupon_type: couponRes.msg_data.coupon_type,
              code: couponRes.msg_data.code,
              value: couponRes.msg_data.value,
              discount_amount: couponRes.msg_data.discount_amount,
            });
            break;
          default:
            setCouponData({
              price: planAmount * 1000,
              time: selectedPlan.value_date ?? 0,
              coupon_type: couponRes.msg_data.coupon_type,
              code: couponRes.msg_data.code,
              value: couponRes.msg_data.value,
              discount_amount: couponRes.msg_data.discount_amount,
            });
        }
      } else {
        setCouponData({
          price: planAmount * 1000,
          time: selectedPlan.value_date ?? 0,
        });
      }
    }
  };

  // Policy HTML
  const policyHtmlString = useMemo(() => {
    let html =
      policyHtml?.html_desktop ||
      '<p>Bằng việc chấp nhận thanh toán, Quý khách đã đồng ý với Quy chế sử dụng dịch vụ của FPT Play, và ủy quyền cho FPT Play tự động gia hạn khi hết hạn sử dụng. Quý khách có thể hủy gia hạn bất cứ lúc nào. Xem chi tiết <a href="/dieu-khoan-su-dung">Tại đây</a></p>';
    html = html.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
    return html.replace('<a ', '<a style="color: #ff6500" ');
  }, [policyHtml]);

  return (
    <div
      className="bg-eerie-black rounded-lg min-w-0 h-fit w-full"
      id="payment-total"
    >
      <div className="text-lg font-semibold text-white mb-4">
        Thông tin thanh toán
      </div>
      {/* Account */}
      <div className="flex justify-between items-center py-2">
        <div className="text-white text-base font-normal">Tài khoản</div>
        <div className="text-right text-white font-semibold">
          {user?.user_phone || ''}
        </div>
      </div>
      <hr className="border-charleston-green my-4" />
      {/* Plan Name */}
      <div className="flex justify-between items-center py-2">
        <div className="text-white text-base font-normal">Tên gói</div>
        <div className="text-right text-white font-semibold">
          {selectedPlan?.name || ''}
        </div>
      </div>
      {/* Plan Duration */}
      <div className="flex justify-between items-center py-2">
        <div className="text-white text-base font-normal shrink-0">
          Thời hạn gói
        </div>
        <div className="text-right text-white font-semibold">
          {selectedPlan?.display_value ||
            (selectedPlan?.value_date
              ? `${selectedPlan?.value_date} Ngày`
              : '')}
        </div>
      </div>
      {/* Service */}
      <div className="flex justify-between items-center py-2">
        <div className="text-white text-base font-normal shrink-0">Dịch vụ</div>
        <div className="text-right text-white font-semibold max-w-[75%]">
          Gói dịch vụ FPT Play
        </div>
      </div>
      <hr className="border-charleston-green my-4" />
      {/* Plan Price */}
      <div className="flex justify-between items-center py-2">
        <div className="text-white text-base font-normal shrink-0">Giá gói</div>
        <div className="text-right text-white font-semibold">
          {selectedPlan?.amount_str ||
            currencyFormat(selectedPlan?.amount ?? 0, selectedPlan?.currency)}
        </div>
      </div>
      {/* Discount */}
      <div className="flex justify-between items-center py-2 ">
        <div className="text-white text-base font-normal shrink-0">
          Giảm giá
        </div>
        <div className="text-right text-white font-semibold">
          {getDiscountPrice(selectedPlan, couponData)}
        </div>
      </div>
      {/* Coupon input */}
      <div className="flex items-center mt-4 mb-2 gap-2 w-full">
        <input
          className="flex-1 py-3 px-4 rounded-lg bg-[#0f0f0f] text-white border-none outline-none text-base"
          type="text"
          placeholder="Mã khuyến mãi"
          value={couponInput}
          onChange={(e) => {
            setCouponInput(e.target.value);
            setIsInput(!!e.target.value?.trim());
            setCouponErrorMsg('');
          }}
        />
        <button
          className={`px-6 py-3 rounded-lg font-semibold text-base transition-colors ${
            isInput
              ? 'bg-gradient-to-r from-[#fe592a] to-[#e93013] text-white cursor-pointer'
              : 'bg-[#2c2c2e] text-[#616161]'
          }`}
          onClick={handleApplyCoupon}
          type="button"
        >
          Áp dụng
        </button>
      </div>
      {/* Coupon error */}
      {couponErrorMsg && (
        <div className="text-red-500 font-semibold text-sm mb-2">
          {couponErrorMsg}
        </div>
      )}
      <hr className="border-charleston-green my-4" />
      {/* Total */}
      <div className="flex justify-between items-center py-4 mt-2">
        <div className="text-white text-base font-semibold">
          Tổng thanh toán:
        </div>
        <div className="text-right text-primary font-bold text-2xl text-fpl">
          {currencyFormat(totalPrice, selectedPlan?.currency)}
        </div>
      </div>
      {/* Checkout button */}
      <div className="flex flex-col items-center mt-6">
        <button
          id="btn_payment_submit"
          className="font-semibold rounded-lg px-8 py-3 text-white text-base bg-gradient-to-r from-[#fe592a] to-[#e93013] hover:bg-[#ff5833] transition-colors w-full cursor-pointer"
          onClick={onCheckout}
          disabled={loading}
        >
          Thanh toán
        </button>
      </div>
      {/* Policy HTML */}
      <div
        className="mt-6 text-center text-white text-sm"
        dangerouslySetInnerHTML={{ __html: policyHtmlString }}
      />
    </div>
  );
};

export default PaymentTotal;
