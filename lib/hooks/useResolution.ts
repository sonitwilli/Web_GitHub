/* eslint-disable @typescript-eslint/no-explicit-any */
import useClickOutside from '@/lib/hooks/useClickOutside';
import { useCallback, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import {
  SELECTED_AUDIO_LABEL,
  SELECTED_AUDIO_LABEL_LIVE,
  SELECTED_VIDEO_QUALITY,
} from '@/lib/constant/texts';
import { userAgentInfo } from '@/lib/utils/ua';
import { StreamProfile } from '@/lib/api/channel';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';
import { useVodPageContext } from '../components/player/context/VodPageContext';
import { saveSessionStorage } from '../utils/storage';
import { trackingChangeVideoQualityLog416 } from './useTrackingPlayback';
import { trackingStoreKey } from '../constant/tracking';
export interface ResolutionItemType {
  language?: string;
  id?: string | number;
  name?: string;
  codec?: string;
  default?: boolean;
  audioCodec?: string;
  videoCodec?: string;
  codecSet?: string;
  height?: number | string;
  width?: number;
  bitrate?: number;
  type?: 'hls' | 'dash';
  fps?: number;
}

export default function useResolution() {
  const {
    playerName,
    dataChannel,
    streamType,
    isDrm,
    audios,
    videoQualities,
    dataStream,
  } = usePlayerPageContext();
  const { currentEpisode } = useVodPageContext();
  const [selectedQuality, setSelectedQuality] = useState<ResolutionItemType>();

  const [open, setOpen] = useState(false);
  const containerRef = useClickOutside<HTMLDivElement>(() => {
    setOpen(false);
  });

  const qualitiesMapWithDataChannel = useMemo(() => {
    let apiProfiles: StreamProfile[] = [];
    if (streamType === 'vod') {
      apiProfiles = dataStream?.stream_profiles || [];
    } else {
      apiProfiles = dataChannel?.stream_profiles || [];
    }
    if (!videoQualities?.length) {
      return [];
    }
    if (!apiProfiles?.length) {
      return videoQualities;
    }
    // chỉ giữ lại profile có liệt kê trong stream_profiles
    const check1 = videoQualities.filter((item) => {
      const found = (apiProfiles || []).find(
        (pr) => pr?.manifest_id == item?.height,
      );
      return !!found;
    });
    const check2 = check1?.map((item) => {
      const found = (apiProfiles || []).find(
        (pr) => pr?.manifest_id == item?.height,
      );
      if (!found?.manifest_id) {
        return item;
      } else {
        return {
          ...item,
          // name: index === 0 ? 'Tự động' : found?.name || found?.manifest_id,
          name: found?.name || found?.manifest_id,
        };
      }
    });
    return check2;
  }, [dataChannel?.stream_profiles, videoQualities, streamType, dataStream]);

  const qualitiesToShow = useMemo(() => {
    const auto: ResolutionItemType = {
      name: 'Auto',
      id: dataChannel?.auto_profile,
      height: dataChannel?.auto_profile || currentEpisode?.auto_profile || '',
    };
    if (!qualitiesMapWithDataChannel?.length) {
      return [auto];
    } else {
      const result = _.orderBy(
        _.uniqBy(qualitiesMapWithDataChannel, 'height'),
        ['height'],
        ['desc'],
      );
      return [auto].concat(result);
    }
  }, [qualitiesMapWithDataChannel, dataChannel, currentEpisode]);

  const click = (x: ResolutionItemType) => {
    localStorage.setItem(SELECTED_VIDEO_QUALITY, x.height as string);
    sessionStorage.setItem(trackingStoreKey.IS_MANUAL_CHANGE_RESOLUTION, '1');
    saveSessionStorage({
      data: [
        {
          key: SELECTED_VIDEO_QUALITY,
          value: x.height as string,
        },
      ],
    });
    setSelectedQuality(x);
    if (x.height) {
      switchQuality({ h: x.height });
    }
    setOpen(false);
    trackingChangeVideoQualityLog416({
      ItemName: x.name || (x.height as string),
    });
  };

  const switchQuality = useCallback(
    ({ h, firstTime }: { h: number | string; firstTime?: boolean }) => {
      if (isDrm && userAgentInfo()?.isSafari) {
        return;
      }
      try {
        if (playerName === 'hls' && window.hlsPlayer) {
          const n = Number(h);
          if (isNaN(n)) {
            if (firstTime) {
              window.hlsPlayer.loadLevel = -1;
            } else {
              window.hlsPlayer.currentLevel = -1;
            }
            return;
          }
          const qualityList = window.hlsPlayer.levels || [];
          if (qualityList?.length) {
            const matched = qualityList?.filter(
              (x) => Number(x.height) == Number(h),
            );
            if (matched?.length) {
              const sort = _.maxBy(matched, 'bitrate');
              const index = _.findIndex(qualityList, {
                bitrate: sort?.bitrate,
              });
              if (firstTime) {
                window.hlsPlayer.loadLevel = index;
              } else {
                window.hlsPlayer.currentLevel = index;
              }
            }
          }
          return;
        }
        if (playerName === 'shaka' && window.shakaPlayer) {
          const playlist = window?.shakaPlayer?.getVariantTracks() || [];
          const height = Number(h);
          if (isNaN(height)) {
            window.shakaPlayer.configure({
              abr: {
                enabled: true,
                restrictions: {
                  maxBandwidth: Infinity,
                  minBandwidth: 0,
                },
              },
            });
          } else {
            let founds =
              playlist.filter(
                (item: any) =>
                  item?.height === height && item?.audioCodec === 'mp4a.40.2',
              ) || [];
            if (founds?.length) {
              founds.sort((a: any, b: any) => b.bandwidth - a.bandwidth);
            }
            let audio: any;
            if (streamType === 'channel' || streamType === 'event') {
              audio = localStorage.getItem(SELECTED_AUDIO_LABEL_LIVE);
            } else {
              audio = localStorage.getItem(SELECTED_AUDIO_LABEL);
            }
            const currentAudio = audios?.find((x) => x.language === audio);
            const matchedAudio = founds.filter(
              (item: any) => item.language === currentAudio?.shortLanguage,
            );
            if (matchedAudio?.length) {
              founds = [...matchedAudio];
            }
            if (founds && founds[0]) {
              window.shakaPlayer.configure({
                abr: {
                  enabled: false,
                },
              });
              window.shakaPlayer.selectVariantTrack(founds[0], false);
            } else {
              window.shakaPlayer.configure({
                abr: {
                  enabled: true,
                  restrictions: {
                    maxBandwidth: Infinity,
                    minBandwidth: 0,
                  },
                },
              });
            }
          }
        }
      } catch (error) {
        console.log('--- ERROR SWITCH VIDEO QUALITY', error);
      } finally {
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [qualitiesToShow],
  );

  useEffect(() => {
    if (qualitiesToShow?.length) {
      const saved = localStorage.getItem(SELECTED_VIDEO_QUALITY);
      if (!saved) {
        // chưa lưu
        setSelectedQuality(qualitiesToShow[0]);
        return;
      }
      const found = qualitiesToShow?.find((x) => x.height == saved);
      if (!found || found?.height === dataChannel?.auto_profile) {
        // có lưu nhưng ko có quality nào khớp
        setSelectedQuality(qualitiesToShow[0]);
        return;
      } else {
        setSelectedQuality(found);
      }

      const timeout = setTimeout(() => {
        switchQuality({ h: saved, firstTime: true });
      }, 2000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [qualitiesToShow, playerName, dataChannel, switchQuality]);

  return {
    selectedQuality,
    open,
    containerRef,
    click,
    qualitiesToShow,
    setOpen,
  };
}
