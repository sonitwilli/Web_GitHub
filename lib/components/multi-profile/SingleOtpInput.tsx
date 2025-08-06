import React, { useState, useEffect, useRef } from 'react';
import styles from './SingleOtpInput.module.css';
export interface SingleOtpInputProps {
  value?: string;
  separator?: string;
  focus?: boolean;
  inputClasses?: string;
  inputType?: 'tel' | 'password' | 'text';
  isLastChild?: boolean;
  shouldAutoFocus?: boolean;
  onPaste?: (event: React.ClipboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const SingleOtpInput: React.FC<SingleOtpInputProps> = ({
  value = '',
  focus = false,
  inputClasses = '',
  shouldAutoFocus = false,
  onPaste,
  onFocus,
  onBlur,
  onChange,
  onKeyDown,
}) => {
  const [model, setModel] = useState<string>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== model) {
      setModel(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (focus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [focus]);

  useEffect(() => {
    if (inputClasses === 'error' && inputRef.current) {
      setModel('');
    }
  }, [inputClasses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input
    const newValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
    setModel(newValue);
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation, backspace, delete, tab
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
    ];
    if (
      allowedKeys.includes(e.key) ||
      (e.ctrlKey && (e.key === 'v' || e.key === 'V'))
    ) {
      onKeyDown?.(e);
      return;
    }
    // Only allow number keys
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    onKeyDown?.(e);
  };

  const handleFocus = () => {
    inputRef.current?.select();
    onFocus?.();
  };

  return (
    <div className="flex items-center">
      {/* Dấu nháy nếu focus & chưa nhập */}
      {focus && !model && (
        <span
          className={`absolute bottom-[7px] tablet:bottom-[25px] left-1/2 w-[2px] h-[32px] bg-[#F5F5F4] -translate-x-1/2 ${styles.blinkCaret}`}
        />
      )}

      <input
        id={focus ? 'otp-input-focus' : undefined}
        ref={inputRef}
        value={model}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        min="0"
        max="9"
        maxLength={1}
        className={`
          caret-transparent
          bg-transparent border-t-0 border-r-0 border-l-0 border-b-2 border-black-olive-404040
          text-center font-bold text-[24px] tablet:text-[40px] leading-[48px] text-white
          p-0 outline-none
          focus:ring-0
          ${inputClasses === 'error' ? 'border-b-scarlet' : ''}
          ${inputClasses}
          w-[40px] h-[50px]
          ml-1 mr-1
          tablet:w-[52px] tablet:h-[60px] tablet:mx-[5px]
          tablet:ml-2 tablet:mr-2
        `}
        autoComplete="one-time-code"
        autoFocus={shouldAutoFocus}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onPaste={onPaste}
        onFocus={handleFocus}
        onBlur={onBlur}
      />
    </div>
  );
};

export default SingleOtpInput;
