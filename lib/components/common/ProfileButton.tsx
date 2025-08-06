import React from 'react';
import styles from './ProfileButton.module.css';

interface ProfileButtonProps {
  content?: string;
  disabled?: boolean;
  variant?: 'dark' | '';
  width?: 'full' | '';
  onClickBtn?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({
  content = 'Button',
  disabled = false,
  variant = '',
  width = '',
  className = 'bg-gradient-to-r from-[#fe592a] to-[#e93013]',
  onClickBtn,
  children,
}) => {
  const handleClick = () => {
    if (onClickBtn) {
      onClickBtn();
    }
  };

  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={`
        rounded-[40px] cursor-pointer px-5 py-[13px] text-base font-semibold leading-5
        flex items-center justify-center
        border-none outline-none
        transition-all duration-200
        whitespace-nowrap
        md:px-10 md:text-base md:leading-6
        ${variant === 'dark' ? 'text-[#d2d2d2] bg-[#2c2c2e]' : ''}
        ${width === 'full' ? 'w-full' : ''}
        ${
          disabled
            ? `cursor-not-allowed ${styles.disabledText}`
            : 'text-white-smoke'
        }
        ${className ? className : ''}
      `}
    >
      {children || content}
    </button>
  );
};

export default ProfileButton;
