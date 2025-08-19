/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from 'react';
import {
  AUDIO_CODEC_NAMES,
  AUDIO_NAME_MODE_LIVE,
  CHANNEL_NAME_RULES,
  CODECS_FULL_RULES,
  KEY_LANGUAGES_AUDIO_CODECS,
  MANIFEST_TYPE,
  MANUAL_PARSED_MANIFEST,
  PLAYER_NAME,
  RUNNING_MANIFEST_TYPE,
  SELECTED_AUDIO_LABEL,
  SELECTED_AUDIO_LABEL_LIVE,
} from '@/lib/constant/texts';
import useClickOutside from '@/lib/hooks/useClickOutside';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';
import { AudioItemType } from '../components/player/core/AudioButton';
import { saveSessionStorage } from '../utils/storage';
import { trackingStoreKey } from '../constant/tracking';

export default function useAudio() {
  const { playerName, streamType, audios, isMetaDataLoaded, dataChannel } =
    usePlayerPageContext();
  const [selectedAudio, setSelectedAudio] = useState<AudioItemType>();
  const [open, setOpen] = useState(false);
  const [audioNameList, setAudioNameList] = useState<string[]>([]);
  const generateAudioText = ({
    audioTrack,
    index,
  }: {
    audioTrack?: AudioItemType;
    index?: number;
  } = {}) => {
    if (typeof index === 'undefined') {
      return '';
    }
    const rawManifest = sessionStorage.getItem(MANUAL_PARSED_MANIFEST);
    const runningManifestType = sessionStorage.getItem(RUNNING_MANIFEST_TYPE);
    const parsedManifest = rawManifest ? JSON.parse(rawManifest) : {};
    const manifestAudios = parsedManifest?.audioTracks || [];

    let languageText = `Âm thanh ${index + 1}`;
    let appendText = '';
    let result = '';
    try {
      // 1. Lấy từ API
      if (
        streamType === 'channel' &&
        dataChannel?.audio_name_mode === AUDIO_NAME_MODE_LIVE?.FROM_API &&
        dataChannel.audio_config_name?.length
      ) {
        // truyền hình
        if (dataChannel.audio_config_name[index]) {
          result = dataChannel.audio_config_name[index];
        }
      } else if (
        // sự kiện
        streamType === 'event' &&
        dataChannel?.multi_audio?.length &&
        dataChannel?.multi_audio[index] &&
        dataChannel?.multi_audio[index].audio_name
      ) {
        result = dataChannel?.multi_audio[index].audio_name;
      } else {
        // 2. Lấy từ manifest
        const matchedLanguage =
          playerName === PLAYER_NAME.HLS
            ? /*@ts-ignore*/
              KEY_LANGUAGES_AUDIO_CODECS[audioTrack?.language]
            : /*@ts-ignore*/
              KEY_LANGUAGES_AUDIO_CODECS[audioTrack];
        // đề phòng trường hợp key language có 2 hoặc 3 ký tự
        const matchedManifestAudio = manifestAudios.find((item: any) =>
          item.X_LANGUAGE
            ? /*@ts-ignore*/
              KEY_LANGUAGES_AUDIO_CODECS[item.X_LANGUAGE] === matchedLanguage
            : false,
        );
        // không có label nhưng có có valid language thì đi ghép theo format
        // language code + codec + channel + bitrate + sampling rate
        if (matchedLanguage) {
          languageText = matchedLanguage;
        }
        // codec + channel
        const codec = matchedManifestAudio?.X_CODEC;
        const channel = matchedManifestAudio?.X_CHANNEL;

        const foundCodec = CODECS_FULL_RULES.find(
          (item: any) => item.dash_codec === codec,
        );
        if (codec && foundCodec && !codec.includes('mp4a.40')) {
          appendText = `${appendText} ${foundCodec?.name}`;
        }
        /*@ts-ignore*/
        if (channel && CHANNEL_NAME_RULES[channel]) {
          /*@ts-ignore*/
          appendText = `${appendText} ${CHANNEL_NAME_RULES[channel]}`;
        }

        if (runningManifestType === MANIFEST_TYPE.DASH) {
          // nếu trùng với tên trước đó thì thêm bitrate/bandwidth (dash only)
          const sameName1 = audioNameList.find(
            (item: any) => item === languageText + appendText,
          );
          if (sameName1) {
            if (matchedManifestAudio?.X_BITRATE) {
              const int = parseInt(matchedManifestAudio?.X_BITRATE);
              const value =
                int >= 1000 ? Math.round(int / 1000) : int <= 0 ? '' : int;
              if (int > 0) {
                appendText = `${appendText} ${value} ${
                  int >= 1000 ? 'kbps' : 'bps'
                }`;
              }
            }
          }
          const sameName2 = audioNameList.find(
            (item: any) => item === languageText + appendText,
          );
          // nếu trùng với tên trước đó thì thêm sample rate (dash only)
          if (sameName2) {
            if (matchedManifestAudio?.X_SAMPLING_RATE) {
              const int = parseInt(matchedManifestAudio?.X_SAMPLING_RATE);
              const value =
                int >= 1000 ? Math.round(int / 1000) : int <= 0 ? '' : int;
              if (int > 0) {
                appendText = `${appendText} ${value} ${
                  int >= 1000 ? 'kHz' : 'Hz'
                }`;
              }
            }
          }
        }
        const text = languageText + appendText;
        let sameIndex = 1;
        const sameName3 = audioNameList.find((item: any, idx: number) => {
          if (item === text) {
            sameIndex = idx + 1;
            return true;
          } else {
            return false;
          }
        });
        // nếu trùng với tên trước đó thì thêm index
        if (appendText) {
          appendText = appendText.trim();
          if (sameName3) {
            result = `${languageText} ${sameIndex} (${appendText})`;
          } else {
            result = `${languageText} (${appendText})`;
          }
        } else {
          result = languageText;
        }
        // có label thì xài luôn label
        setAudioNameList((prevItems) => [...prevItems, text]);
        if (audioTrack?.X_LABEL) {
          result = audioTrack?.X_LABEL;
        }
      }
      return result;
    } catch (error) {
      console.log('--- ERROR generateAudioText', error);
      return result;
    }
  };

  const audiosAAC = useMemo(() => {
    const results: AudioItemType[] = audios ? [...audios] : [];
    const withLables = results?.map((x, index) => {
      const label = generateAudioText({
        audioTrack: x,
        index,
      });
      return {
        ...x,
        X_LABEL: label,
      };
    });

    return withLables?.filter((x) => x.X_CODEC === AUDIO_CODEC_NAMES.AAC);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audios, playerName, dataChannel, streamType]);

  function filterAudioTracks(audioList: any) {
    try {
      const seen = new Map();
      const result = [];
      for (const track of audioList) {
        const key = `${track.X_CODEC}_${track.X_LANGUAGE}_${track.X_CHANNEL}`;
        if (!seen.has(key)) {
          // Lưu track đầu tiên làm chuẩn
          seen.set(key, track);
          result.push(track);
        } else {
          const reference = seen.get(key);
          const bitrateDiff = Math.abs(track.X_BITRATE - reference.X_BITRATE);
          // Nếu lệch bitrate >= 1000 thì giữ lại track này
          if (bitrateDiff >= 1000) {
            result.push(track);
          }
        }
      }

      return result;
    } catch {
      return [];
    }
  }

  const filterdAudios = useMemo(() => {
    const filteredList = filterAudioTracks(audiosAAC);
    return filteredList;
  }, [audiosAAC]);

  useEffect(() => {
    if (filterdAudios) {
      saveSessionStorage({
        data: [
          {
            key: trackingStoreKey.PLAYER_AUDIO_LIST,
            value: JSON.stringify(audios),
          },
        ],
      });
    }

    if (
      !filterdAudios?.length ||
      filterdAudios.length < 2 ||
      !isMetaDataLoaded
    ) {
      return;
    }

    const found = filterdAudios?.find((x, index) => {
      let saved = '';
      if (streamType === 'channel' || streamType === 'event') {
        saved = localStorage.getItem(SELECTED_AUDIO_LABEL_LIVE) || '';
      } else {
        saved = localStorage.getItem(SELECTED_AUDIO_LABEL) || '';
      }
      const matched = filterdAudios?.find((y) => y.X_NAME === saved);
      if (matched) {
        return x.X_NAME === matched.X_NAME;
      } else {
        if (playerName === PLAYER_NAME.HLS && window.hlsPlayer) {
          const audioList = window.hlsPlayer.audioTracks;
          if (audioList?.length) {
            const f = audioList?.find((x) => x.autoselect || x.default);
            if (f) {
              return f.name === x.X_NAME;
            } else {
              return index === 0;
            }
          }
        }
        if (playerName === PLAYER_NAME.SHAKA && window.shakaPlayer) {
          const audioList = window.shakaPlayer.getAudioTracks();
          if (audioList?.length) {
            const f = audioList?.find((x: any) => x?.active);
            if (f) {
              return f.label === x.X_NAME;
            } else {
              return index === 0;
            }
          }
        }
      }
    });
    if (found) {
      setSelectedAudio(found);
      if (playerName === PLAYER_NAME.HLS && window.hlsPlayer) {
        const audioList = window.hlsPlayer.audioTracks;
        if (audioList?.length) {
          const f = audioList?.find((x) => x.name === found.X_NAME);
          window.hlsPlayer.setAudioOption(f);
        }
      } else if (playerName === PLAYER_NAME.SHAKA && window.shakaPlayer) {
        const audioList = window.shakaPlayer.getAudioTracks();
        const f = audioList?.find((x: any) => x?.label === found.X_NAME);
        if (f) {
          // window.shakaPlayer.selectAudioTrack(f);
          // window.shakaPlayer.selectAudioLanguage(found?.X_SHORT_LANGUAGE);
          // window.shakaPlayer.selectAudioLanguage(found?.X_LANGUAGE);
          window.shakaPlayer.selectAudioLanguage(found?.X_LANGUAGE);
        }
      }
    }
  }, [
    audiosAAC,
    streamType,
    playerName,
    isMetaDataLoaded,
    audios,
    filterdAudios,
  ]);

  const clickAudio = (a: AudioItemType) => {
    setSelectedAudio(a);
    if (a.X_NAME) {
      if (streamType === 'channel' || streamType === 'event') {
        localStorage.setItem(SELECTED_AUDIO_LABEL_LIVE, a.X_NAME || '');
        saveSessionStorage({
          data: [
            {
              key: SELECTED_AUDIO_LABEL_LIVE,
              value: a.X_NAME,
            },
          ],
        });
      } else {
        localStorage.setItem(SELECTED_AUDIO_LABEL, a.X_NAME || '');
        saveSessionStorage({
          data: [
            {
              key: SELECTED_AUDIO_LABEL,
              value: a.X_NAME,
            },
          ],
        });
      }
    }

    if (playerName === PLAYER_NAME.HLS && window.hlsPlayer) {
      const audioList = window.hlsPlayer.audioTracks;
      if (audioList?.length) {
        const f = audioList?.find((x) => x.name === a.X_NAME);
        window.hlsPlayer.setAudioOption(f);
      }
    } else if (playerName === PLAYER_NAME.SHAKA && window.shakaPlayer) {
      window.shakaPlayer.selectAudioLanguage(a?.X_LANGUAGE);
    }
    setOpen(false);
  };

  const containerRef = useClickOutside<HTMLDivElement>(() => {
    setOpen(false);
  });

  useEffect(() => {
    saveSessionStorage({
      data: [
        {
          key: trackingStoreKey.PLAYER_ACTIVE_AUDIO_OBJECT,
          value: JSON.stringify(selectedAudio),
        },
      ],
    });
  }, [selectedAudio]);

  return {
    playerName,
    streamType,
    audios,
    isMetaDataLoaded,
    dataChannel,
    selectedAudio,
    setSelectedAudio,
    open,
    setOpen,
    audioNameList,
    setAudioNameList,
    generateAudioText,
    audiosAAC,
    clickAudio,
    containerRef,
    filterdAudios,
  };
}
