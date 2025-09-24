import React, { useEffect } from 'react';
import { useTransactionHistory } from '@/lib/hooks/useTransactionHistory';
import NoData from '@/lib/components/empty-data/NoData';
import ErrorData from '@/lib/components/error/ErrorData';
import { Transaction } from '@/lib/api/history';
import Loading from '@/lib/components/common/Loading';
import styles from './PaymentTransactionHistoryTable.module.css';
import { setSideBarLeft } from '@/lib/store/slices/multiProfiles';
import { useDispatch } from 'react-redux';
import CustomImage from '../common/CustomImage';

const PaymentTransactionHistoryTable: React.FC = () => {
  const { data, loading, error, refetch } = useTransactionHistory({
    page: 1,
    per_page: 10,
  });
  const transactions: Transaction[] =
    (data?.transactions as Transaction[]) || [];

  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      dispatch(
        setSideBarLeft({
          text: 'Quản lý thanh toán và gói',
          url: `${window?.location?.origin}/tai-khoan?tab=thanh-toan-va-goi`,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="text-white m-0 max-w-[1136px]">
        <h2 className="text-2xl font-semibold mb-6 xl:mt-3">Lịch sử giao dịch</h2>
        <div className="relative min-h-[300px] rounded-t-[16px] rounded-b-[16px]">
          <Loading />
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="text-white m-0 max-w-[1136px]">
        <h2 className="text-2xl font-semibold mb-6 xl:mt-3">Lịch sử giao dịch</h2>
        <div className="rounded-t-[16px] rounded-b-[16px]">
          <ErrorData
            onRetry={() => {
              refetch();
            }}
          />
        </div>
      </div>
    );
  }

  if (transactions.length === 0 && !loading) {
    return (
      <div className="text-white m-0 max-w-[1136px]">
        <h2 className="text-2xl font-semibold mb-6 xl:mt-3">Lịch sử giao dịch</h2>
        <div className="rounded-t-[16px] rounded-b-[16px]">
          <NoData />
        </div>
      </div>
    );
  }

  return (
    <div className="text-white m-0 max-w-[1136px]">
      <h2 className="text-2xl font-semibold mb-6 xl:mt-3">Lịch sử giao dịch</h2>
      <div className="rounded-[16px] overflow-hidden">
        <div
          className={`max-h-[589px] max-w-[768px] md:max-w-full overflow-x-auto overflow-y-auto bg-eerie-black ${styles.tbodyScrollbar}`}
        >
          <table className="w-full border-collapse text-white">
            <thead className="bg-charleston-green sticky top-0 z-10">
              <tr className="text-left text-white/60 text-sm">
                <th className="py-[16px] text-base text-white-smoke font-normal px-8 min-w-[250px] lg:min-w-[17%]">
                  Gói dịch vụ
                </th>
                <th className="py-[16px] text-base text-white-smoke font-normal px-8 min-w-[240px] lg:min-w-[23%]">
                  Mã giao dịch
                </th>
                <th className="py-[16px] text-base text-white-smoke font-normal px-8 min-w-[238px] lg:min-w-[23%]">
                  Thời gian giao dịch
                </th>
                <th className="py-[16px] text-base text-white-smoke font-normal px-8 min-w-[204px] lg:min-w-[23%]">
                  Phương thức thanh toán
                </th>
                <th className="py-[16px] text-right text-base text-white-smoke font-normal px-8 min-w-[197px] lg:min-w-[14%]">
                  Giá tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item, idx) => (
                <tr
                  key={item.trans_id || item.id || idx}
                  className="border-t border-charleston-green text-base"
                >
                  <td className="py-[17px] px-8 font-semibold min-w-[250px] lg:min-w-[17%]">
                    <div className="line-clamp-2 overflow-hidden break-words">
                      {item.description || item.detail || '-'}
                    </div>
                  </td>
                  <td className="py-[17px] line-break-anywhere px-8 font-normal min-w-[240px] lg:min-w-[23%]">
                    {item.trans_id || '-'}
                  </td>
                  <td className="py-[17px] px-8 font-normal min-w-[238px] lg:min-w-[23%]">
                    {item.purchase_date || item.timestamp || '-'}
                  </td>
                  <td className="py-[17px] px-8 font-normal min-w-[204px] lg:min-w-[23%]">
                    <div className="flex items-center gap-2">
                      <CustomImage
                        src={item?.image_v2 || ''}
                        alt={
                          item.payment_gateway_name ||
                          item.payment_gateway ||
                          ''
                        }
                        placeHolder={'/images/settings/placeholder_wallet.png'}
                        width={'20px'}
                        height={'20px'}
                        className="rounded-[4px]"
                      />
                      {item.payment_gateway_name || item.payment_gateway || '-'}
                    </div>
                  </td>
                  <td className="py-[17px] px-8 font-normal text-right min-w-[197px] lg:min-w-[14%]">
                    {item.price_display || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentTransactionHistoryTable;
