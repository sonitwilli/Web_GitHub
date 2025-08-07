import { useAppSelector } from '@/lib/store';
import { useMemo } from 'react';

export default function ScrollTop() {
  const sidetagPosition = useAppSelector((state) => state.sidetag.position);
  const width = window.innerWidth;

  // Calculate dynamic right position based on sidetag position
  const dynamicStyle = useMemo(() => {
    const additionalOffset = 40; // Additional offset when sidetag is at right bottom

    if (width >= 1280) {
      return { marginRight: `${additionalOffset}px` };
    }

    return {};
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
    // Use the same container style as download bar: fixed bottom with w-[92%] ml-[4%]
    <div className="fixed bottom-[80px] left-0 w-[92%] ml-[4%] z-[99] flex justify-end pointer-events-none">
      <button
        onClick={click}
        className="shadow-[0_4px_16px_0px_rgba(0,0,0,0.4)] bg-eerie-black w-[56px] h-[56px] flex items-center justify-center hover:cursor-pointer hover:bg-charleston-green ease-out duration-300 rounded-full pointer-events-auto"
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
