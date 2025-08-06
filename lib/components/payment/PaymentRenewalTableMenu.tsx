import React, { useEffect, useState, useRef } from 'react';
import { IoMdCloseCircleOutline } from 'react-icons/io';

interface PaymentRenewalTableMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const PaymentRenewalTableMenu: React.FC<PaymentRenewalTableMenuProps> = ({
  isOpen,
  onToggle,
  onClose,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleClose = () => {
    onClose(); // Trigger "Hủy gia hạn" action
  };

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 192; // min-w-[192px]

      // Calculate position
      let left = rect.right - menuWidth;
      const top = rect.bottom + 4; // 4px spacing

      // Ensure menu doesn't go off-screen
      if (left < 8) left = 8; // 8px from left edge
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }

      setPosition({ top, left });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Handle click outside to close menu (without triggering action)
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        !target.closest('[data-menu]') &&
        !target.closest('[data-menu-button]')
      ) {
        onToggle(); // Just close menu, don't trigger action
      }
    };

    // Handle scroll to close menu
    const handleScroll = () => {
      onToggle(); // Close menu when scrolling
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true); // Use capture to catch all scroll events

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  return (
    <>
      <button
        ref={buttonRef}
        data-menu-button
        className="bg-transparent border-none text-white text-2xl cursor-pointer w-8 h-8 rounded-full flex items-center justify-center hover:bg-charleston-green"
        onClick={onToggle}
      >
        ⋮
      </button>
      {isOpen && (
        <div
          data-menu
          className="fixed bg-charleston-green rounded-[12px] py-3 shadow-lg z-[9999] min-w-[192px]"
          style={{ top: position.top, left: position.left }}
        >
          <div
            className="flex items-center gap-2 px-[19px] py-[12px] cursor-pointer text-white-smoke text-base font-normal hover:bg-black-olive-404040"
            onClick={handleClose}
          >
            <IoMdCloseCircleOutline size={24} className="text-white-smoke" />
            <span>Hủy gia hạn</span>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentRenewalTableMenu;
