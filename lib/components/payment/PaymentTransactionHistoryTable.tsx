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
        <h2 className="text-2xl font-semibold mb-6">Lịch sử giao dịch</h2>
        <div className="relative min-h-[300px] rounded-t-[16px] rounded-b-[16px]">
          <Loading />
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="text-white m-0 max-w-[1136px]">
        <h2 className="text-2xl font-semibold mb-6">Lịch sử giao dịch</h2>
        <div className="rounded-t-[16px] rounded-b-[16px]">
          <ErrorData onRetry={() => {
            refetch();
          }}/>
        </div>
      </div>
    );
  }

  if (transactions.length === 0 && !loading) {
    return (
      <div className="text-white m-0 max-w-[1136px]">
        <h2 className="text-2xl font-semibold mb-6">Lịch sử giao dịch</h2>
        <div className="rounded-t-[16px] rounded-b-[16px]">
          <NoData />
        </div>
      </div>
    );
  }

  return (
    <div className="text-white m-0 max-w-[1136px]">
      <h2 className="text-2xl font-semibold mb-6">Lịch sử giao dịch</h2>
      <div className={`rounded-[16px] overflow-x-auto ${styles.tbodyScrollbar}`}>
        <table className="w-full border-collapse text-white">
          <thead className="bg-charleston-green table w-full">
            <tr className="text-left text-white/60 text-sm table w-full">
              <th className="py-[16px] text-base text-white-smoke font-normal min-w-[301px] px-8">
                Gói dịch vụ
              </th>
              <th className="py-[16px] text-base text-white-smoke font-normal min-w-[240px] px-8">
                Mã giao dịch
              </th>
              <th className="py-[16px] text-base text-white-smoke font-normal min-w-[238px] px-8">
                Thời gian giao dịch
              </th>
              <th className="py-[16px] text-base text-white-smoke font-normal min-w-[204px] px-8">
                Phương thức thanh toán
              </th>
              <th className="py-[16px] text-base text-white-smoke font-normal min-w-[146px] px-8">
                Giá tiền
              </th>
            </tr>
          </thead>
          <tbody
            className={`block max-h-[520px] overflow-y-auto bg-eerie-black max-w-[1136px] overflow-x-hidden ${styles.tbodyScrollbar}`}
          >
            {transactions.map((item, idx) => (
              <tr
                key={item.trans_id || item.id || idx}
                className="border-t border-charleston-green text-base table w-full"
              >
                <td className="py-[17px] min-w-[301px] px-8 font-semibold">
                  <div className="line-clamp-2 overflow-hidden break-words">
                    {item.description || item.detail || '-'}
                  </div>
                </td>
                <td className="py-[17px] min-w-[240px] line-break-anywhere px-8 font-normal">
                  {item.trans_id || '-'}
                </td>
                <td className="py-[17px] min-w-[238px] px-8 font-normal">
                  {item.purchase_date || item.timestamp || '-'}
                </td>
                <td className="py-[17px] min-w-[204px] px-8 font-normal">
                  <div className="flex items-center gap-2">
                    <CustomImage
                      src={item?.image_v2 || ''}
                      alt={
                        item.payment_gateway_name || item.payment_gateway || ''
                      }
                      placeHolder={'/images/settings/placeholder_wallet.png'}
                      width={'20px'}
                      height={'20px'}
                      className="rounded-[4px]"
                    />
                    {item.payment_gateway_name || item.payment_gateway || '-'}
                  </div>
                </td>
                <td className="py-[17px] min-w-[146px] px-8 font-normal text-right">
                  {item.price_display || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentTransactionHistoryTable;
