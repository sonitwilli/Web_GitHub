import React from 'react';

interface SubmitButtonProps {
  isDisabled: boolean;
  onSendReport: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isDisabled,
  onSendReport,
}) => {
  return (
    <div className="absolute w-full bottom-0 p-3 bg-transparent pb-[calc(12px+constant(safe-area-inset-bottom))] pb-[calc(12px+env(safe-area-inset-bottom))]">
      <button
        className={`w-full bg-true-blue rounded-lg outline-none border-none py-2.5 text-base font-semibold leading-tight text-white/87 ${
          isDisabled ? 'opacity-40' : ''
        }`}
        disabled={isDisabled}
        onClick={onSendReport}
      >
        Gửi góp ý
      </button>
    </div>
  );
};

export default SubmitButton;
