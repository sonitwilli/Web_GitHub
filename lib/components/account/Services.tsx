import React, { useState } from 'react';
import { useFetchServices } from '@/lib/hooks/useServices';

// Define interfaces for service items
interface ServiceItem {
  plan_name?: string;
  from_date?: string;
  next_date?: string;
  is_sub?: number;
}

// NoData component
const NoData: React.FC = () => (
  <div className="text-gray-400 text-center py-4 border-t border-charleston-green">Không có dữ liệu</div>
);

const Services: React.FC = () => {
  const { data, loading, error, refetch } = useFetchServices();
  const [isShow, setIsShow] = useState<boolean>(false);

  const toggleExtras = () => {
    setIsShow((prev) => !prev);
  };

  const renderTable = (items: ServiceItem[] | null) => {
    if (!items || items.length === 0) {
      return <NoData />;
    }

    return (
      <table className="w-full border-t border-charleston-green text-sm text-gray-400 bg-raisin-black bg-gradient-to-b from-black/35 to-black/35">
        <tbody>
          {items.map((item, index) => (
            <tr
              key={index}
              className="border-t border-charleston-green bg-raisin-black bg-gradient-to-b from-black/35 to-black/35"
            >
              <td className="w-[5%] py-4 px-2 rounded-tl-lg rounded-bl-lg"></td>
              <td className="py-4 px-2">
                <div className="text-white text-lg mb-4 mt-4">
                  {item.plan_name}
                </div>
                <div className="text-[15px] my-1">
                  {item.is_sub === 0
                    ? 'Ngày sử dụng từ'
                    : 'Ngày bắt đầu tính cước'}
                </div>
                <div className="text-[15px] mt-4 mb-4">
                  {item.is_sub === 0
                    ? 'Có thời hạn đến'
                    : 'Chu kỳ cước tiếp theo'}
                </div>
              </td>
              <td className="py-4 px-2 text-right rounded-tr-lg rounded-br-lg">
                <div className="h-4"></div>
                <div className="text-[15px] my-4">{item.from_date}</div>
                <div className="text-[15px] my-4">{item.next_date}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return <div className="text-gray-400 text-center py-4">Đang tải...</div>;
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-4">
        Lỗi: {error}{' '}
        <button className="text-white underline" onClick={() => refetch?.()}>
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Packages */}
      <h4 className="w-full mx-auto bg-gradient-to-b from-black/35 to-black/35 bg-raisin-black text-white text-sm font-medium px-6 py-4 rounded-t-lg flex items-center justify-between">
        <span>Gói đã mua</span>
      </h4>
      <div
        id="purchased-service"
        className="w-full mx-auto bg-gradient-to-b from-black/35 to-black/35 bg-raisin-black px-6 pb-4 rounded-b-lg"
      >
        {renderTable(data?.packages ?? null)}
      </div>

      {/* Extras */}
      <h4
        onClick={toggleExtras}
        className="w-full mx-auto mt-4 bg-gradient-to-b from-black/35 to-black/35 bg-raisin-black text-white text-sm font-medium px-6 py-4 rounded-t-lg flex items-center justify-between cursor-pointer"
      >
        <span>Chi tiết dịch vụ đang sử dụng</span>
        <svg
          className={`w-3 h-3 fill-current text-white transition-transform duration-200 ${
            isShow ? 'rotate-0' : 'rotate-180'
          }`}
          viewBox="0 0 12 12"
        >
          <polygon points="6,2 10,8 2,8" />
        </svg>
      </h4>
      {isShow && (
        <div
          id="purchased-service"
          className="w-full mx-auto bg-gradient-to-b from-black/35 to-black/35 bg-raisin-black px-6 pb-4 rounded-b-lg"
        >
          {renderTable(data?.extras ?? null)}
        </div>
      )}
    </div>
  );
};

export default Services;
