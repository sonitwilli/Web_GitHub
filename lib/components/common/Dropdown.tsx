import React from 'react';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';
import useClickOutside from '@/lib/hooks/useClickOutside';

interface DropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectDevice?: (device: { name: string; val: string }) => void;
  onSelectQuality?: (quality: { name: string; val: string }) => void;
  onSelectQuantity?: (quantity: { name: string; val: number }) => void;
  selected: { name: string };
  options: Array<{ name: string; val: string | number }>;
  placeholder?: string;
  className?: string;
  type: 'device' | 'quality' | 'quantity';
}

const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onToggle,
  onSelectDevice,
  onSelectQuality,
  onSelectQuantity,
  selected,
  options,
  placeholder = 'Chọn...',
  className = '',
  type,
}) => {
  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    if (isOpen) onToggle();
  });

  const handleSelect = (option: { name: string; val: string | number }) => {
    if (type === 'device' && onSelectDevice) {
      onSelectDevice(option as { name: string; val: string });
    } else if (type === 'quality' && onSelectQuality) {
      onSelectQuality(option as { name: string; val: string });
    } else if (type === 'quantity' && onSelectQuantity) {
      onSelectQuantity(option as { name: string; val: number });
    }
    onToggle();
  };

  return (
    <div ref={dropdownRef} className={`relative ${className} cursor-pointer`}>
      <button
        onClick={onToggle}
        className="cursor-pointer w-full bg-eerie-black text-white rounded px-3 py-2 text-sm flex items-center justify-between hover:bg-charleston-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-fpl"
      >
        <span className="truncate">{selected?.name || placeholder}</span>
        <MdOutlineKeyboardArrowDown
          className={`ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-eerie-black border border-charleston-green rounded shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className="cursor-pointer w-full text-left px-3 py-2 text-sm text-white hover:bg-charleston-green transition-colors duration-200 focus:outline-none focus:bg-charleston-green"
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
