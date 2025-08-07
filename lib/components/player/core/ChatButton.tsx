/* eslint-disable jsx-a11y/alt-text */

import { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store';
import { setIsOpenLiveChat } from '@/lib/store/slices/playerSlice';
import { SHOW_REAL_TIME_CHAT } from '@/lib/constant/texts';
import { useDownloadBarControl } from '@/lib/hooks/useDownloadBarControl';

export default function ChatButton() {
  const isOpenLiveChat =
    useAppSelector((s) => s.player.isOpenLiveChat) || false;
  const dispatch = useAppDispatch();
  const { hideBar, showBar } = useDownloadBarControl();
  const text = useMemo(() => {
    if (isOpenLiveChat) {
      return 'Ẩn trò chuyện';
    }
    return 'Hiển thị trò chuyện';
  }, [isOpenLiveChat]);
  const click = () => {
    localStorage.setItem(SHOW_REAL_TIME_CHAT, isOpenLiveChat ? '0' : '1');
    dispatch(setIsOpenLiveChat(!isOpenLiveChat));
    
    // Hide download bar when showing chat, show when hiding chat
    if (!isOpenLiveChat) {
      // About to show chat
      hideBar();
    } else {
      // About to hide chat
      showBar();
    }
  };
  return (
    <div className="c-control-button c-control-button-chat">
      <div onClick={click} className="c-control-button-icon">
        <div className={`${isOpenLiveChat ? 'hidden' : ''}`}>
          <img
            src="/images/player/comments_disabled.png"
            className="w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px]"
          />
        </div>
        <div className={`${isOpenLiveChat ? '' : 'hidden'}`}>
          <img
            src="/images/player/chat.png"
            className="w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px]"
          />
        </div>
      </div>
      <div className="c-control-hover-text">{text}</div>
    </div>
  );
}
