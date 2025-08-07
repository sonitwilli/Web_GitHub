import { useAppSelector } from '@/lib/store';
import { useMemo } from 'react';

export default function ScrollTop() {
  const sidetagPosition = useAppSelector((state) => state.sidetag.position);

  // Calculate dynamic right position based on sidetag position
  const dynamicStyle = useMemo(() => {
    const baseRight = 24;
    const additionalOffset = 24; // Additional offset when sidetag is at right bottom

    if (
      sidetagPosition.hasPosition &&
      sidetagPosition.position === 'right bottom'
    ) {
      return { right: `${baseRight + additionalOffset}px` };
    }

    return { right: `${baseRight}px` };
  }, [sidetagPosition]);

  const click = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };
  return (
    <div>
      <button
        onClick={click}
        className="shadow-[0_4px_16px_0px_rgba(0,0,0,0.4)] fixed bottom-[80px] z-[99] bg-eerie-black w-[56px] h-[56px] flex items-center justify-center hover:cursor-pointer hover:bg-charleston-green ease-out duration-300 rounded-full"
        style={dynamicStyle}
      >
        <img
          src="/images/vertical_align_top.png"
          alt="scroll top"
          width={32}
          height={32}
        />
      </button>
    </div>
  );
}
