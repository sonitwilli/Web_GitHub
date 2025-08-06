// https://wiki.fptplay.net/display/ADV/%5BSDK-WEB%5D+Web+SDK+Quick+Start+Guide

import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';
import { PLAYER_BOOKMARK_SECOND } from '../constant/texts';
import { loadJsScript } from '../utils/methods';

export const useAdsPlayer = () => {
  const { dataChannel, dataStream, previewHandled } = usePlayerPageContext();

  const runAds = () => {
    if (typeof window.Ads !== 'undefined') {
      const t = sessionStorage.getItem(PLAYER_BOOKMARK_SECOND);
      window.Ads(window.shakaPlayer, t ? Number(t) : 0);
      console.log('--- RUN ADS', { timeplay: t });
    }
  };

  const loadAdsCdns = () => {
    loadJsScript({
      src: process.env.NEXT_PUBLIC_API_ADS!,
      id: 'ads-script',
      cb: () => {
        loadJsScript({
          //   src: 'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
          src: process.env.NEXT_PUBLIC_ADS_GOOGLE_IMA,
          id: 'google_ima_sdk',
          cb: () => {
            loadJsScript({
              //   src: 'https://ads.fptplay.vn/sdk/v2/shaka-ima.js',
              src: process.env.NEXT_PUBLIC_ADS_SHAKA_IMA,
              id: 'shaka_ima_sdk',
              cb: () => {
                runAds();
              },
            });
          },
        });
      },
    });
  };

  const handleLoadAds = () => {
    try {
      if (
        (dataChannel?.enable_ads == '1' && dataStream?.enable_ads == 1) ||
        (previewHandled && dataStream?.enable_ads == 1)
      ) {
        if (typeof window.Ads !== 'undefined') {
          runAds();
        } else {
          loadAdsCdns();
        }
      }
    } catch {}
  };

  return { loadAdsCdns, handleLoadAds };
};
