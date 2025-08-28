import React from 'react';
import useOrientationPopup from '@/lib/hooks/useOrientationPopup';

const OrientationChangePopup: React.FC = () => {
  const {open} = useOrientationPopup({ mobileMaxWidth: 1024 });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white dark:bg-raisin-black text-black dark:text-white rounded-lg p-6 max-w-md w-[90%] shadow-xl pointer-events-auto">
        <h3 className="text-lg font-semibold mb-2">Chuyển hướng màn hình</h3>
        <p className="text-sm mb-4">Bạn đang ở chế độ ngang (landscape). Vui lòng quay về chế độ dọc (portrait) để tiếp tục.</p>
      </div>
    </div>
  );
};

export default OrientationChangePopup;
