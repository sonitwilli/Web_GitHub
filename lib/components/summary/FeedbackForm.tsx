import React, { useCallback } from 'react';
import { FeedbackItem } from '@/lib/api/evaluate';
import styles from './FeedbackForm.module.css';

interface FeedbackFormProps {
  listReports: FeedbackItem[];
  idSelected: string | null;
  onIdSelectedChange: (id: string) => void;
  text: string;
  onTextChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  characterCount: number;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  isButton: boolean;
  onTextareaFocus: () => void;
  onTextareaBlur: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  listReports,
  idSelected,
  onIdSelectedChange,
  text,
  onTextChange,
  textAreaRef,
  characterCount,
  scrollContainerRef,
  isButton,
  onTextareaFocus,
  onTextareaBlur,
}) => {
  const handleTextareaFocus = useCallback(() => {
    // Gọi callback từ parent component
    onTextareaFocus();

    // Scroll để hiển thị textarea khi focus
    setTimeout(() => {
      if (scrollContainerRef.current && textAreaRef.current) {
        const textarea = textAreaRef.current;
        const container = scrollContainerRef.current;

        // Lấy vị trí của textarea trong container
        const textareaRect = textarea.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Tính toán vị trí scroll để textarea hiển thị đầy đủ
        const textareaTop =
          textareaRect.top - containerRect.top + container.scrollTop;
        const textareaBottom = textareaTop + textareaRect.height;
        const containerVisibleTop = container.scrollTop;
        const containerVisibleBottom =
          containerVisibleTop + container.clientHeight;

        // Chỉ scroll nếu textarea không hiển thị đầy đủ
        if (
          textareaTop < containerVisibleTop ||
          textareaBottom > containerVisibleBottom
        ) {
          // Scroll để đưa textarea vào giữa viewport
          const scrollTop =
            textareaTop - (container.clientHeight - textareaRect.height) / 2;

          container.scrollTo({
            top: Math.max(0, scrollTop),
            behavior: 'smooth',
          });
        }
      }
    }, 300); // Delay để đợi bàn phím xuất hiện
  }, [onTextareaFocus, scrollContainerRef, textAreaRef]);
  return (
    <div
      ref={scrollContainerRef}
      className={`max-h-[calc(100vh-64px-env(safe-area-inset-bottom))] mb-0 sm:mb-[60px] overflow-y-auto ${
        !isButton ? 'max-h-screen pb-3' : ''
      }`}
    >
      <div className="mt-17 px-3">
        <div className="mb-4">
          {listReports.map((item) => (
            <div key={item?.id} className="relative flex items-center mb-4">
              <input
                id={item?.id}
                type="radio"
                name="dislike-reason"
                value={item?.id}
                checked={idSelected === item?.id}
                onChange={() => onIdSelectedChange(item?.id || '')}
                className={`peer appearance-none w-[15px] h-[15px] rounded-full border-[1px] bg-transparent transition-colors duration-200 cursor-pointer ${
                  idSelected === item?.id
                    ? 'border-portland-orange'
                    : 'border-white-06'
                }`}
              />
              {/* Outer ring */}
              <span
                className={`pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-[15px] h-[15px] rounded-full border-[1px] ${
                  idSelected === item?.id
                    ? 'border-portland-orange'
                    : 'border-white-06'
                }`}
              ></span>
              {/* Inner dot, only visible when checked */}
              <span
                className={`pointer-events-none absolute left-[3.5px] top-1/2 -translate-y-1/2 w-[7.5px] h-[7.5px] rounded-full ${
                  styles.portlandOrangeBg
                } transition-opacity duration-200 ${
                  idSelected === item?.id ? 'opacity-100' : 'opacity-0'
                }`}
              ></span>
              <label
                htmlFor={item?.id}
                className="pl-[10px] cursor-pointer text-white-087 text-base select-none"
              >
                {item?.title}
              </label>
            </div>
          ))}
        </div>

        <div className="mt-8 relative">
          <h3 className="text-base font-medium leading-6 text-white-087 mb-4">
            Ý kiến khác (Không bắt buộc)
          </h3>
          <div className={`rounded-xl ${styles.textareaContainer} p-2 pb-7`}>
            <textarea
              ref={textAreaRef}
              name="submit-area"
              className={styles.textarea}
              placeholder="Thêm thông tin chi tiết, bạn không nên cung cấp mật khẩu, số thẻ tín dụng, và thông tin cá nhân nhạy cảm"
              value={text}
              onChange={onTextChange}
              onFocus={handleTextareaFocus}
              onBlur={onTextareaBlur}
            />
            <div
              className={`flex items-center text-xs font-normal leading-tight ${styles.characterCount} absolute right-3 bottom-2 top-auto`}
            >
              <span
                className={characterCount > 1000 ? 'text-portland-orange' : ''}
              >
                {characterCount}
              </span>
              /<span>1000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
