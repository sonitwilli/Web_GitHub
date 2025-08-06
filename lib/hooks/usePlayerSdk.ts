import { SHAKA_UI_PATH, SIGMA_PACKER_PATH } from '../constant/texts';
import { loadJsScript } from '../utils/methods';

export default function usePlayerSdk() {
  const loadSdkSigma = ({ callback }: { callback?: () => void }) => {
    if (typeof window.SigmaPacker !== 'undefined') {
      handleLoadSdkSigmaDone({ callback });
    } else {
      loadJsScript({
        id: 'sigma_packer_sdk',
        src: SIGMA_PACKER_PATH,
        cb: () => {
          handleLoadSdkSigmaDone({ callback });
        },
      });
    }
  };
  const handleLoadSdkSigmaDone = ({ callback }: { callback?: () => void }) => {
    if (window.sigmaPacker) {
      loadShakaSdk({ callback });
    } else {
      window.sigmaPacker = new window.SigmaPacker();
      window.sigmaPacker.onload = () => {
        loadShakaSdk({ callback });
      };
      window.sigmaPacker.init();
    }
  };
  const loadShakaSdk = ({ callback }: { callback?: () => void }) => {
    if (typeof window.shaka !== 'undefined') {
      if (callback) {
        callback();
      }
    } else {
      loadJsScript({
        id: 'shaka_ui_sdk',
        src: SHAKA_UI_PATH,
        cb: () => {
          if (callback) {
            callback();
          }
        },
      });
    }
  };

  return { loadSdkSigma, handleLoadSdkSigmaDone, loadShakaSdk };
}
