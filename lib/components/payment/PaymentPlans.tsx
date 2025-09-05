import React from 'react';
import { Plan } from '@/lib/api/payment';
import { currencyFormat } from '@/lib/utils/formatString';
// Select indicator (radio style)
interface PaymentPlanSelectBoxProps {
  active: boolean;
}
const PaymentPlanSelectBox: React.FC<PaymentPlanSelectBoxProps> = ({
  active,
}) => (
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

// Single plan item
interface PaymentPlanItemProps {
  item: Plan;
  active: boolean;
  onClick: () => void;
  showDisplayValue: (item: Plan) => string;
  showDiscountPercent: (item: Plan) => boolean;
  showPromotionName: (item: Plan) => boolean;
  getPopularPlan: (item: Plan) => string;
  getDiscountPercent: (item: Plan) => string;
  getOriginalPrice: (item: Plan) => string;
}
const PaymentPlanItem: React.FC<PaymentPlanItemProps> = ({
  item,
  active,
  onClick,
  showDisplayValue,
  showDiscountPercent,
  showPromotionName,
  getPopularPlan,
  getDiscountPercent,
  getOriginalPrice,
}) => (
  <div
    className={`PayPlan p-3 sm:p-4 relative cursor-pointer bg-eerie-black rounded-lg`}
    onClick={onClick}
  >
    <div className="flex items-center relative">
      <PaymentPlanSelectBox active={active} />
      <div className="PayPlan__Name font-semibold text-xs sm:text-sm flex-1 pl-2 pr-16 sm:pr-24 relative">
        {showDisplayValue(item)}
        {showDiscountPercent(item) && getPopularPlan(item) && (
          <span className="PayPlan__Label is-orange absolute top-[-20px] sm:top-[-24px] right-0 text-[8px] sm:text-[10px] font-semibold rounded px-1 sm:px-2 py-0.5 sm:py-1 bg-primary">
            {getPopularPlan(item)}
          </span>
        )}
      </div>
      <div className="PayPlan__Price flex items-center absolute right-2 sm:right-5 top-1/2 -translate-y-1/2">
        {item.discount_percent && item.discount_percent > 0 ? (
          <span className="PayPlan__OriginalAmount mr-1 text-[12px] sm:text-[14px] text-[#8a8a8a] line-through">
            {getOriginalPrice(item)}
          </span>
        ) : (
          ''
        )}
        <span className="PayPlan__Amount text-[12px] sm:text-[14px] font-semibold">
          {item.amount_str}
          {(showDiscountPercent(item) || showPromotionName(item)) && (
            <span className="PayPlan__Label ml-1 sm:ml-2 text-[8px] sm:text-[10px] font-semibold rounded px-1 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-[#fe592a] to-[#e93013] absolute top-[-20px] sm:top-[-24px] right-[2px] sm:right-[4px] whitespace-nowrap">
              {getDiscountPercent(item)}
            </span>
          )}
        </span>
      </div>
    </div>
  </div>
);

// Main PaymentPlans component
interface PaymentPlansProps {
  plan: Plan;
  list: Plan[];
  upsellPlans?: Plan[];
  upsellDescription?: string;
  onSetPlan: (planId: string) => void;
  // onSetUpsellPlan?: (planId: string, type: string) => void;
  onCheckServiceList?: (item: Plan) => void;
}

const PaymentPlans: React.FC<PaymentPlansProps> = ({
  plan,
  list,
  upsellPlans = [],
  upsellDescription = '',
  onSetPlan,
  onCheckServiceList,
}) => {
  // Helper logic
  const showDiscountPercent = (item: Plan) =>
    item.discount_percent && item.discount_percent > 0;
  const showPromotionName = (item: Plan) => !!item.fptplay_promotion_name;
  const getPopularPlan = (item: Plan) =>
    item.plan_type === 'vip' && item.value === 365 ? 'Phổ biến' : '';
  const getDiscountPercent = (item: Plan) =>
    item.discount_percent !== 0
      ? `Giảm ${item.discount_percent}%`
      : ` ${item.fptplay_promotion_name}`;
  const getOriginalPrice = (item: Plan) =>
    item.original_price
      ? currencyFormat(item.original_price, item.currency)
      : '';
  const showDisplayValue = (item: Plan, isUpsell?: boolean) =>
    isUpsell
      ? item.plan_name
      : !item.display_value || item.display_value === '-'
      ? item.name
      : item.display_value;

  // Handlers
  const handlePlanClick = (item: Plan) => {
    onSetPlan(item.plan_id?.toString() || '');
    onCheckServiceList?.(item);
  };
  // const handleUpsellPlanClick = (item: Plan) => {
  //   onSetUpsellPlan?.(item.plan_id?.toString() || '', 'upsell');
  //   onSetPlan(item.plan_id?.toString() || '');
  //   onCheckServiceList?.(item);
  // };

  return (
    <div className="mb-4 sm:mb-6">
      <div className="text-lg font-semibold mb-4 text-white text-left">
        Chọn thời hạn gói
      </div>
      <div className="space-y-3 sm:space-y-4">
        {list.map((item, i) => (
          <PaymentPlanItem
            key={`plan-${item.plan_id}-${i}`}
            item={item}
            active={plan.plan_id === item.plan_id}
            onClick={() => handlePlanClick(item)}
            showDisplayValue={(item: Plan) => showDisplayValue(item) || ''}
            showDiscountPercent={(item: Plan) => !!showDiscountPercent(item)}
            showPromotionName={(item: Plan) => !!showPromotionName(item)}
            getPopularPlan={getPopularPlan}
            getDiscountPercent={getDiscountPercent}
            getOriginalPrice={getOriginalPrice}
          />
        ))}
      </div>
      {!!upsellPlans.length && (
        <div className="UpsellPlan mt-4 sm:mt-6">
          <div className="UpsellPlan__Title flex items-center text-white my-4 text-[14px] px-2 sm:px-0">
            <span className="flex-grow h-px bg-[#3b3b3e] mr-4" />
            {upsellDescription}
            <span className="flex-grow h-px bg-[#3b3b3e] ml-4" />
          </div>
          <div className="space-y-3 sm:space-y-4">
            {upsellPlans.map((item, i) => (
              <PaymentPlanItem
                key={`upsell-plan-${item.plan_id}-${i}`}
                item={item}
                active={plan.plan_id === item.plan_id}
                onClick={() => handlePlanClick(item)}
                showDisplayValue={(item: Plan) =>
                  showDisplayValue(item, true) || ''
                }
                showDiscountPercent={(item: Plan) =>
                  !!showDiscountPercent(item)
                }
                showPromotionName={(item: Plan) => !!showPromotionName(item)}
                getPopularPlan={getPopularPlan}
                getDiscountPercent={getDiscountPercent}
                getOriginalPrice={getOriginalPrice}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPlans;
