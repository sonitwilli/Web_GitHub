import React from 'react';

interface TogglerButtonProps {
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  isKid?:boolean;
}

const TogglerButton: React.FC<TogglerButtonProps> = ({
  defaultValue = false,
  onChange,
  disabled = false,
  isKid = false,
}) => {
  const [isToggled, setIsToggled] = React.useState<boolean>(defaultValue);

  // Cập nhật trạng thái khi defaultValue thay đổi
  React.useEffect(() => {
    setIsToggled(defaultValue);
  }, [defaultValue]);

  // Xử lý khi người dùng nhấp vào nút chuyển đổi
  const handleToggle = () => {
    if(isKid) return
    if (!disabled) {
      const newValue = !isToggled;
      setIsToggled(newValue);
      onChange?.(newValue);
    }
  };

  return (
    <div
      className={`relative inline-flex items-center w-10 h-6 rounded-full cursor-pointer transition-colors duration-300 ${
        isToggled ? 'bg-[#ff3d00]' : 'bg-[#404040]'
      } ${disabled ? 'opacity-37 pointer-events-none' : ''}`}
      onClick={handleToggle}
    >
      <span
        className={`absolute w-[18px] h-[18px] bg-white rounded-full transition-transform duration-300 ${
          isToggled ? 'translate-x-[19px]' : 'translate-x-1'
        }`}
      />
    </div>
  );
};

export default TogglerButton;