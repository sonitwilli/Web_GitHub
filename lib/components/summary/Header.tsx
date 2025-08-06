import React from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { FaChevronLeft } from "react-icons/fa6";
import { IoCloseOutline } from "react-icons/io5";

interface HeaderProps {
  isIconLoaded: boolean;
  isHint?: boolean;
  hintRef?: React.RefObject<HTMLDivElement>;
  onToggle?: () => void;
  onClose: () => void;
  isBack?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isIconLoaded,
  isHint = false,
  hintRef,
  onToggle,
  onClose,
  isBack = false,
  onBack,
}) => {
  return (
    <div className="fixed top-0 w-full z-10 flex items-center justify-between p-4 bg-rich-black">
      {isIconLoaded && (
        <h3
          className={`relative flex items-center text-base font-semibold leading-tight text-white/87 gap-2 mb-0 ${
            isBack ? 'cursor-pointer' : ''
          }`}
          onClick={isBack ? onBack : undefined}
        >
          {!isBack ? (
            <>
              Tổng hợp từ
              <img
                className="max-w-4"
                src="/images/ai-summary/ai-icon.png"
                alt="ai"
              />
              <div
                ref={hintRef}
                className="relative"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle?.();
                }}
              >
                <AiOutlineQuestionCircle size={16} className="text-white" />
                {isHint && (
                  <span className="absolute left-1/2 top-8 transform -translate-x-1/2 px-2 py-1 text-sm font-normal leading-tight text-white/87 bg-portland-orange min-w-60 rounded-md">
                    <img
                      src="/images/ai-summary/polygon.png"
                      alt="ai"
                      className="w-4 h-4 absolute top-[-12px] left-1/2 transform -translate-x-1/2"
                    />
                    Tất cả bình luận của người dùng được tổng hợp bằng trí tuệ
                    nhân tạo (AI)
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <FaChevronLeft size={16} className="text-white-smoke" />
              Đóng góp ý kiến
            </>
          )}
        </h3>
      )}
      <button
        className="outline-0 m-0 p-0 bg-transparent border-0"
        onClick={onClose}
      >
        <IoCloseOutline size={28} className="text-white-smoke" />
      </button>
    </div>
  );
};

export default Header;
