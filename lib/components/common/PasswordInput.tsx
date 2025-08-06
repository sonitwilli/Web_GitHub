import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';

interface ProfilePasswordInputProps {
  disabled?: boolean;
  placeholder?: string;
  onChangeValue?: (value: string) => void;
  classCustom?: string;
  autoFocus?: boolean;
  clearOnMount?: boolean;
  initialValue?: string;
}

export interface PasswordInputRef {
  focus: () => void;
  clear: () => void;
  getValue: () => string;
}

const ProfilePasswordInput = forwardRef<
  PasswordInputRef,
  ProfilePasswordInputProps
>(
  (
    {
      disabled = false,
      placeholder = '',
      classCustom,
      onChangeValue,
      autoFocus = false,
      clearOnMount = false,
      initialValue = '',
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [value, setValue] = useState<string>(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
      clear: () => {
        setValue('');
        onChangeValue?.('');
      },
      getValue: () => value,
    }));

    // Handle auto focus and clear on mount
    useEffect(() => {
      if (clearOnMount) {
        setValue('');
        onChangeValue?.('');
      }

      if (autoFocus && inputRef.current) {
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
        return () => clearTimeout(timer);
      }
    }, [autoFocus, clearOnMount, onChangeValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
      setValue(newValue);
      onChangeValue?.(newValue);
    };

    const icon = showPassword
      ? '/images/profiles/eye_show.png'
      : '/images/profiles/eye_hide.png';

    return (
      <div className="relative w-full">
        <form autoComplete="off">
          <input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            min="0"
            max="9"
            maxLength={6}
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-form-type="other"
            data-lpignore="true"
            type={showPassword ? 'number' : 'password'}
            disabled={disabled}
            placeholder={placeholder}
            className={`${classCustom} w-full placeholder-davys-grey rounded-[104px] bg-black/5 py-[18px] px-6 text-white text-base leading-5 outline-none 
                     disabled:cursor-not-allowed appearance-none 
                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none 
                     [&::-webkit-inner-spin-button]:appearance-none`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />
        </form>
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer flex items-center"
          onClick={() => setShowPassword(!showPassword)}
        >
          {}
          <img
            src={icon}
            alt="eye"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </div>
      </div>
    );
  },
);

ProfilePasswordInput.displayName = 'ProfilePasswordInput';

export default ProfilePasswordInput;
