// ModalReportChat.tsx

import React from 'react';
import ModalWrapper from './ModalWrapper';

export interface ReportOption {
  value: string;
  label: string;
}

export interface ModalReportChatProps {
  open: boolean;
  onHidden?: () => void;
  onSubmit?: (selected: string) => void;
  onCancel?: () => void;
  title?: string;
  options: ReportOption[];
  selectedOption?: string;
  onSelectOption: (value: string) => void;
  submitText?: string;
  cancelText?: string;
  portalTarget?: HTMLElement;
}

const ModalReportChat: React.FC<ModalReportChatProps> = ({
  open,
  onHidden,
  onSubmit,
  onCancel,
  title = 'Báo cáo bình luận',
  options,
  selectedOption,
  onSelectOption,
  submitText = 'Gửi',
  cancelText = 'Đóng',
  portalTarget,
}) => {
  return (
    <ModalWrapper
      open={open}
      onHidden={onHidden}
      contentClassName="w-full max-w-[576px] bg-eerie-black rounded-2xl p-8 text-white shadow-lg relative"
      overlayClassName="fixed inset-0 bg-black-06 flex justify-center items-center z-[9999]"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      portalTarget={portalTarget}
    >
      <div className="flex flex-col gap-6">
        <h4 className="text-2xl font-semibold text-white mb-2">{title}</h4>
        <div className="flex flex-col gap-4">
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <input
                type="radio"
                name="report-option"
                value={opt.value}
                checked={selectedOption === opt.value}
                onChange={() => onSelectOption(opt.value)}
                className="peer hidden"
              />

              <span
                className="w-5 h-5 rounded-full border-2 border-gray-400 peer-checked:border-orange-500 relative
    before:content-[''] before:absolute before:top-1/2 before:left-1/2 
    before:w-2.5 before:h-2.5 before:bg-orange-500 before:rounded-full
    before:transform before:-translate-x-1/2 before:-translate-y-1/2
    before:scale-0 peer-checked:before:scale-100 "
              ></span>

              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-4 mt-6">
          <button
            className="flex-1 h-12 rounded-[40px] bg-black-olive-404040 text-white-smoke text-base font-medium hover:bg-black-olive transition-colors"
            onClick={onCancel || onHidden}
          >
            {cancelText}
          </button>
          <button
            className={`flex-1 h-12 rounded-[40px] text-base font-medium transition-colors ${
              selectedOption
                ? 'bg-gradient-to-r from-portland-orange to-lust text-white-smoke hover:from-safety-orange hover:to-cg-red'
                : 'bg-charleston-green text-black-olive-404040 cursor-not-allowed'
            }`}
            onClick={() => selectedOption && onSubmit?.(selectedOption)}
            disabled={!selectedOption}
          >
            {submitText}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ModalReportChat;
