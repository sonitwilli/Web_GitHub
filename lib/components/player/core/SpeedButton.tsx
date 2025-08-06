/* eslint-disable jsx-a11y/alt-text */

import { useState, useContext, useEffect } from 'react';
import useClickOutside from '@/lib/hooks/useClickOutside';
// import usePlaybackSpeed from '@/lib/hooks/usePlaybackSpeed';
import useScreenSize from '@/lib/hooks/useScreenSize';
import { PlayerWrapperContext } from './PlayerWrapper';
import SpeedContent from './SpeedContent';

export default function SpeedButton() {
  const [showMenu, setShowMenu] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setShowMenu(false));
  const { width } = useScreenSize();
  const { setControlPopupType, isUserInactive } =
    useContext(PlayerWrapperContext);

  // Close menu when user becomes inactive
  useEffect(() => {
    if (isUserInactive && showMenu) {
      setShowMenu(false);
    }
  }, [isUserInactive, showMenu]);

  const toggleMenu = () => {
    if (width < 768) {
      if (setControlPopupType) {
        setControlPopupType('speed');
      }
    } else {
      setShowMenu((prev) => !prev);
    }
  };

  return (
    <div ref={ref} className="c-control-button c-control-button-speed relative">
      {/* Popup cho desktop/tablet */}
      <div
        className={`min-w-[280px] pb-[16px] absolute left-[-48px] bottom-[calc(100%+28px)] -translate-x-1/2 rounded-[8px] bg-eerie-black-09 z-50 ${
          width < 768 ? 'hidden' : showMenu ? 'block' : 'hidden'
        }`}
      >
        <SpeedContent onClick={() => setShowMenu(false)} />
      </div>
      <div onClick={toggleMenu} className="c-control-button-icon">
        <img
          src="/images/player/speed.png"
          className="w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px]"
        />
      </div>
      <div
        className={`c-control-hover-text ${
          showMenu && width >= 768 ? 'hidden' : 'block'
        }`}
      >
        Tốc độ phát
      </div>
    </div>
  );
}
