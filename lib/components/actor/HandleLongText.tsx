import { useEffect, useRef, useState } from 'react';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa6';

type Props = {
  text?: string;
  className?: string;
  lineClamp?: number;
};

const HandleLongText = ({
  text = '',
  className = '',
  lineClamp = 3,
}: Props) => {
  const [isShow, setIsShow] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const descRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;

    const hasOverflow = el.scrollHeight > el.clientHeight;
    setIsOverflow(hasOverflow);
  }, [text]);

  if (!text) return null;

  return (
    <div className={`relative max-w-full ${className}`}>
      <div
        ref={descRef}
        className={`text-white-smoke text-[14px] tablet:text-[16px] ${
          isShow ? 'h-auto' : `overflow-hidden line-clamp-${lineClamp}`
        }`}
      >
        {text}
      </div>

      {isOverflow && (
        <div className="absolute flex right-0 bottom-0 text-spanish-gray hover:text-fpl text-base font-normal cursor-pointer">
          <div className="w-[48px] bg-gradient-to-r from-smoky-black/10 via-smoky-black/50 to-smoky-black" />
          <span
            className="bg-smoky-black flex items-center gap-1 text-[14px] tablet:text-[16px]"
            onClick={() => setIsShow(!isShow)}
          >
            {!isShow ? (
              <>
                &hellip;Xem thêm <FaAngleDown />
              </>
            ) : (
              <>
                Ẩn bớt <FaAngleUp />
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default HandleLongText;
