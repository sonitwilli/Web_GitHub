import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import BroadcastSchedule from './BroadcastSchedule';
import type { ComponentProps } from 'react';
import { VIDEO_ID } from '@/lib/constant/texts';

type BroadcastPortalProps = {
  containerId: string;
  props: ComponentProps<typeof BroadcastSchedule>;
  onClose?: () => void;
};

const BroadcastPortal = ({
  containerId,
  props,
  onClose,
}: BroadcastPortalProps) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const isFullscreen = props.isFullscreen;

  useEffect(() => {
    const tryFind = () => {
      let el: HTMLElement | null = null;
      if (isFullscreen) {
        el = document.getElementById('player_wrapper');
      } else {
        // Gắn vào class "video-id"
        const playerWrapper = document.getElementById(VIDEO_ID);
        if (!playerWrapper) return;
        el = document.getElementById(containerId);
        if (!el) {
          el = document.createElement('div');
          el.id = containerId;
          el.className =
            'absolute top-0 right-0 w-[520px] h-full z-2 backdrop-blur-md pointer-events-auto bg-eerie-black';
          playerWrapper.appendChild(el);
        }
      }
      if (el) setContainer(el);
    };

    const timeout = setTimeout(tryFind, 100); // Delay ngắn sau khi mount
    return () => clearTimeout(timeout);
  }, [containerId, isFullscreen]);

  if (!container) return null;

  return ReactDOM.createPortal(
    <BroadcastSchedule {...props} onClose={onClose} />,
    container,
  );
};

export default BroadcastPortal;
