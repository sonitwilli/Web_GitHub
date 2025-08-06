/* eslint-disable @typescript-eslint/no-explicit-any */
import { PLAYER_NAME } from '../constant/texts';

interface Props {
  player?: any;
  type?: (typeof PLAYER_NAME)[keyof typeof PLAYER_NAME];
}

export default function usePlayerControl({ type }: Props) {
  const renderCustomButtons = () => {
    if (typeof window.videojs === 'undefined') {
      return;
    }
    const Button = window.videojs.getComponent('Button');
    class CustomButton extends Button {
      constructor(player: any, options: any) {
        super(player, options);
      }
      handleClick() {
        console.log('Custom button clicked!');
        // Add your custom functionality here
      }
      createEl() {
        const div = document.createElement('div');
        div.className = 'vjs-control vjs-button !bg-fpl';
        return div;
      }
    }

    // Register the component
    window.videojs.registerComponent('CustomButton', CustomButton);
  };

  const generateBottomMask = ({ player }: { player: any }) => {
    const bottomMask = document.getElementById('player_bottom_mask');
    if (bottomMask) {
      generatePlayerOverlay({ element: bottomMask, player });
    }
  };

  const generateTopMask = ({ player }: { player: any }) => {
    const topMask = document.getElementById('player_top_mask');
    if (topMask) {
      generatePlayerOverlay({ element: topMask, player });
    }
  };

  const generateOverlayLogo = ({ player }: { player: any }) => {
    const logo = document.getElementById('overlay-logo');
    if (logo) {
      generatePlayerOverlay({ element: logo, player });
    }
  };

  const generateControlBar = ({ player }: { player: any }) => {
    const target = document.getElementById('nvm_player_control');
    if (target) {
      generatePlayerOverlay({ element: target, player });
    }
  };

  const generatePlayerOverlay = ({
    // hàm này để render các thẻ html trong player
    player,
    element,
  }: {
    player?: any;
    element?: HTMLElement;
  }) => {
    if (type === 'videojs') {
      const wrapper = player.el();
      if (wrapper) {
        wrapper.appendChild(element);
      }
    }
  };

  return {
    renderCustomButtons,
    generatePlayerOverlay,
    generateBottomMask,
    generateTopMask,
    generateOverlayLogo,
    generateControlBar,
  };
}
