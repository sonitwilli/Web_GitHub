import React from 'react';

interface ErrorDataProps {
  onRetry?: () => void;
  text?: string;
}

export default function ErrorData({
  onRetry,
  text = 'Không tìm thấy nội dung',
}: ErrorDataProps) {
  return (
    <div className="w-full h-full flex items-center justify-center text-center">
      <div className="flex flex-col items-center">
        <div className="min-h-[178px]">
          <img
            src="/images/errorData.png"
            alt="ErrorData"
            className="max-w-[260px]"
          />
        </div>
        <h6 className="text-[20px] font-semibold leading-[1.3] my-8 text-white-smoke">
          {text}
        </h6>
        <button
          onClick={onRetry}
          className="min-w-[184px] cursor-pointer text-[16px] text-white-smoke font-semibold leading-[1.3] px-[45px] py-[10px] rounded-[40px] bg-[linear-gradient(135deg,_#FE592A_0%,_#E93013_100%)]"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
