import React, { useState, useEffect } from 'react';
import ProfileSingleOtpInput from '@/lib/components/multi-profile/SingleOtpInput';

// Key code constants
const KEY_BACKSPACE = 'Backspace';
const LEFT_ARROW = 37;
const RIGHT_ARROW = 39;
const DELETE = 46;
const TAB = 9;

interface ProfileOtpInputProps {
  numInputs?: number;
  urlParam?: string;
  separator?: string;
  inputClasses?: string;
  inputType?: 'tel' | 'password' | 'text';
  shouldAutoFocus?: boolean;
  defaultValue?: string[];
  onChange?: (otp: string) => void;
  onComplete?: (otp: string) => void;
}

const ProfileOtpInput: React.FC<ProfileOtpInputProps> = ({
  numInputs = 4,
  separator = '',
  inputClasses = '',
  inputType = 'tel',
  shouldAutoFocus = false,
  defaultValue = [],
  onChange,
  onComplete,
}) => {
  const [activeInput, setActiveInput] = useState<number>(0);
  const [otp, setOtp] = useState<string[]>(defaultValue || []);
  const [oldOtp, setOldOtp] = useState<string[]>([]);

  useEffect(() => {
    clearInput();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inputClasses === 'error') {
      clearInput();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputClasses]);

  useEffect(() => {
    if (defaultValue.length === 4) {
      const timer = setTimeout(() => {
        setActiveInput(3);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [defaultValue]);

  const setOtpFromPaste = (rawCode: string) => {
    const otpCode = rawCode.slice(0, numInputs - activeInput).split('');
    if (inputType !== 'text' && !otpCode.join('').match(/^\d+$/)) {
      return 'Invalid pasted data';
    }
    const currentCharsInOtp = otp.slice(0, activeInput);
    const combinedWithPastedData = currentCharsInOtp.concat(otpCode);
    setOtp(combinedWithPastedData.slice(0, numInputs));
    focusInput(combinedWithPastedData.slice(0, numInputs).length);
  };

  const focusInput = (input: number) => {
    const debouncedFocus = () => {
      setActiveInput(Math.max(Math.min(numInputs - 1, input), 0));
    };
    debouncedFocus();
  };

  const focusNextInput = () => {
    focusInput(activeInput + 1);
  };

  const focusPrevInput = () => {
    focusInput(activeInput - 1);
  };

  const checkFilledAllInputs = () => {
    if (otp.join('').length === numInputs && activeInput === numInputs - 1) {
      onComplete?.(otp.join(''));
      return true;
    }
    return 'Wait until the user enters the required number of characters';
  };

  const changeCodeAtFocus = (value: string) => {
    setOldOtp([...otp]);
    const newOtp = JSON.parse(JSON.stringify(otp));
    newOtp[activeInput] = value;
    setOtp(newOtp);
    onChange?.(newOtp.join(''));
    if (oldOtp.join('') !== newOtp.join('')) {
      checkFilledAllInputs();
    }
  };

  const clearInput = () => {
    if (otp.length > 0) {
      onChange?.('');
    }
    setOtp([]);
    setTimeout(() => {
      setActiveInput(0);
    }, 500);
  };

  const handleOnFocus = (index: number) => {
    setActiveInput(index);
  };

  const handleOnChange = (value: string) => {
    if (value) {
      changeCodeAtFocus(value);
      setTimeout(() => {
        focusNextInput();
      }, 50);
    } else {
      changeCodeAtFocus('');
    }
  };

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.keyCode) {
      case DELETE:
        event.preventDefault();
        changeCodeAtFocus('');
        break;
      case LEFT_ARROW:
        event.preventDefault();
        focusPrevInput();
        break;
      case RIGHT_ARROW:
        event.preventDefault();
        focusNextInput();
        break;
      case TAB:
        event.preventDefault();
        focusNextInput();
        break;
      default:
        break;
    }

    switch (event.key) {
      case KEY_BACKSPACE:
        event.preventDefault();
        changeCodeAtFocus('');
        focusPrevInput();
        break;
      default:
        break;
    }
  };

  const handleOnPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text/plain');
    setOtpFromPaste(pastedData);
  };

  return (
    <div className="flex justify-center">
      <input
        autoComplete="false"
        name="hidden"
        type="text"
        className="hidden"
      />
      {Array.from({ length: numInputs }).map((_, i) => (
        <div key={i} className="relative">
          {!otp[i] && activeInput !== i && (
            <span className="absolute inset-0 bottom-[7px] tablet:bottom-[26px] flex items-center justify-center text-white-smoke text-[24px] tablet:text-[40px] font-semibold pointer-events-none select-none">
              -
            </span>
          )}

          <ProfileSingleOtpInput
            focus={activeInput === i}
            value={otp[i] || ''}
            separator={separator}
            inputType={inputType}
            inputClasses={inputClasses}
            isLastChild={i === numInputs - 1}
            shouldAutoFocus={shouldAutoFocus}
            onChange={handleOnChange}
            onKeyDown={handleOnKeyDown}
            onPaste={handleOnPaste}
            onFocus={() => handleOnFocus(i)}
          />
        </div>
      ))}
    </div>
  );
};

export default ProfileOtpInput;
