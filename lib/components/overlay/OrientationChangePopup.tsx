import React from 'react';
import useOrientationPopup from '@/lib/hooks/useOrientationPopup';

const OrientationChangePopup: React.FC = () => {
  const {open} = useOrientationPopup({ mobileMaxWidth: 1024 });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
      <div className="absolute inset-0 bg-black" />
        <div className="relative bg-black text-white rounded-lg p-6 max-w-[361px] w-[90%] shadow-xl pointer-events-auto text-center">
        <h3 className="text-[20px] font-semibold text-[#F5F5F4] mb-[16px]">Chế độ ngang không được hỗ trợ</h3>
        <p className="text-[16px] mb-4 text-[#959595]">Vui lòng xoay thiết bị về chế độ dọc để tiếp tục sử dụng dịch vụ</p>
      </div>
    </div>
  );
};

export default OrientationChangePopup;
