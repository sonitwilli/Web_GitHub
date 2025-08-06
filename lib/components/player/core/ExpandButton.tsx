import { useMemo } from 'react';
import { usePlayerPageContext } from '../context/PlayerPageContext';
import styles from './ExpandButton.module.css';

export default function ExpandButton() {
  const { isExpanded, setIsExpanded } = usePlayerPageContext();
  const text = useMemo(() => {
    return isExpanded ? 'Thu gọn' : 'Mở rộng';
  }, [isExpanded]);
  return (
    <div
      className={`flex items-center justify-center py-[8px] rounded-l-[12px] hover:cursor-pointer bg-black-024 hover:bg-black-036 relative ${styles.container}`}
      onClick={() => {
        if (setIsExpanded) setIsExpanded(!isExpanded);
      }}
    >
      <img
        src="/images/player/keyboard_arrow_right.png"
        alt="expanded"
        width={32}
        height={32}
        className={`${isExpanded ? 'hidden' : ''}`}
      />
      <img
        src="/images/player/keyboard_arrow_left.png"
        alt="expanded"
        width={32}
        height={32}
        className={`${isExpanded ? '' : 'hidden'}`}
      />
      <div
        className={`absolute right-[calc(100%_+_16px)] top-1/2 -translate-y-1/2 whitespace-nowrap bg-eerie-black-09 rounded-[6px] px-[10px] py-[4px] texy-white text-[16px] leading-[150%] opacity-0 ease-out duration-300 ${styles.text}`}
      >
        {text}
      </div>
    </div>
  );
}
