'use client';

import { FC } from 'react';
import NoData from '@/lib/components/empty-data/NoData';
import { useTransactionHistory } from '@/lib/hooks/useTransactionHistory';

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return { time: '', date: '' };
  const [time, date] = dateStr.split(' ');
  return { time, date };
};

const History: FC = () => {
  const { data, loading, error, refetch } = useTransactionHistory({
    page: 1,
    per_page: 10,
    sso: true, // Enable SSO if needed
  });

  if (loading) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        id="history-payment-manage"
      >
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="w-full h-full flex items-center justify-center"
        id="history-payment-manage"
      >
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!data?.transactions?.length) {
    return (
      <div className="w-full h-full" id="history-payment-manage">
        <NoData />
      </div>
    );
  }

  return (
    <div className="w-full h-full" id="history-payment-manage">
      <div className="flex flex-col">
        {data.transactions.map((element, idx) => {
          const { time, date } = formatDateTime(element?.timestamp || '');
          return (
            <div
              key={idx}
              className="w-full mx-auto mb-2 py-5 px-[24px] bg-smoky-block-090909 rounded-lg flex flex-col gap-2"
            >
              <p className="text-white font-semibold text-2xl leading-6 truncate mb-2">
                {element.detail}
              </p>
              <p className="text-dark-gray font-normal text-sm leading-[17px] lg:text-xs">
                Giao dịch lúc {time} ngày {date}
              </p>
            </div>
          );
        })}
      </div>
      {(data.page && data.total_page) && data.page < data.total_page && (
        <button
          onClick={() =>
            refetch({ page: data.page && data.page + 1, per_page: data.per_page, sso: true })
          }
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default History;
