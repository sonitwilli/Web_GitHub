/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

import { AudioItemType } from '../components/player/core/AudioButton';
import { ResolutionItemType } from '../components/player/core/Resolution';
import {
  AUDIO_CODEC_NAMES,
  AUDIO_CODEC_URI_NAMES_DASH,
  AUDIO_NAME_MODE_LIVE,
  CHANNEL_NAME_RULES,
  CODECS_FULL_RULES,
  KEY_LANGUAGES_AUDIO_CODECS,
  MANIFEST_TYPE,
  MANUAL_PARSED_MANIFEST,
  PLAYER_NAME,
  RUNNING_MANIFEST_TYPE,
  VIDEO_ID,
} from '../constant/texts';
import { trackingStoreKey } from '../constant/tracking';
import { saveSessionStorage } from './storage';

/* eslint-disable @typescript-eslint/ban-ts-comment */
const list: {
  [index: string]: string[];
} = {
  DOLBY_VISION_CODEC: [
    'video/mp4; codecs="dvh1.05.01"',
    'video/mp4; codecs="dvh1.20.01"',
  ],
  AV1_CODEC: ['video/mp4; codecs="av01.0.01M.08"'],
  VP9_CODEC: ['video/mp4; codecs="vp09.00.10.08"'],
  H265_CODEC: [
    'video/mp4; codecs="hvc1.1.6.L93.90"',
    'video/mp4; codecs="hev1.1.6.L93.90"',
  ],
};

const supportedVideoCodecs = (): {
  H264_CODEC: boolean;
  DOLBY_VISION_CODEC: boolean;
  AV1_CODEC: boolean;
  VP9_CODEC: boolean;
  H265_CODEC: boolean;
} => {
  try {
    if (typeof window === 'undefined') {
      return {
        H264_CODEC: false,
        DOLBY_VISION_CODEC: false,
        AV1_CODEC: false,
        VP9_CODEC: false,
        H265_CODEC: false,
      };
    }
    const results = {
      H264_CODEC: true,
      DOLBY_VISION_CODEC: false,
      AV1_CODEC: false,
      VP9_CODEC: false,
      H265_CODEC: false,
    };
    const video = document.createElement('video');
    for (const key in list) {
      const valid = list[key].some((type) => {
        const result = video.canPlayType(type);
        return result === 'probably' || result === 'maybe';
      });
      /*@ts-ignore*/
      results[key] = valid;
      sessionStorage.setItem(key, String(valid));
    }
    return results;
  } catch {
    return {
      H264_CODEC: true,
      DOLBY_VISION_CODEC: false,
      AV1_CODEC: false,
      VP9_CODEC: false,
      H265_CODEC: false,
    };
  }
};

export const getSeekPremier = (event?: {
  is_premier?: string;
  type?: string;
  start_time?: string;
  begin_time?: string;
  end_time?: string;
}): number | undefined => {
  if (String(event?.is_premier) !== '1' || event?.type !== 'event') {
    return undefined;
  }

  const now = Math.floor(Date.now() / 1000);
  const start = parseInt(event?.start_time || event?.begin_time || '0', 10);
  const end = parseInt(event?.end_time || '0', 10);

  if (!start || now < start || now > end) return undefined;

  return now - start;
};

export const detectHlsManifest = (manifestContent: string) => {
  try {
    const lines = manifestContent.split('\n');
    const audioTracks: AudioItemType[] = [];
    const playList: any = [];
    const extXMediaRegex = /#EXT-X-MEDIA:(.*)/;
    for (const line of lines) {
      if (line.includes('#EXT-X-STREAM-INF:')) {
        const regex = /([A-Z\-]+)=("[^"]*"|[^,]*)/g;
        const result: any = {};

        let match;
        while ((match = regex.exec(line)) !== null) {
          const key = match[1];
          let value: any = match[2];
          // Remove quotes if value is a string
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value ? value?.slice(1, -1) : '';
          } else if (!isNaN(value)) {
            // Convert numeric values to numbers
            value = parseFloat(value);
          }
          result[key] = value;
        }
        playList.push(result);
      }
    }
    lines.forEach((line: any) => {
      const match = extXMediaRegex.exec(line);
      if (match) {
        const attributes = match[1].split(',');
        const trackInfo: any = {};
        attributes.forEach((attribute) => {
          const [key, value] = attribute.split('=');
          if (key && value) {
            trackInfo[key.trim()] = value.replace(/"/g, '').trim();
          }
        });
        if (trackInfo.TYPE === 'AUDIO') {
          const foundPl = (playList || [])?.find(
            (x: any) => x?.AUDIO === trackInfo['GROUP-ID'],
          );
          const playListCodec = foundPl?.CODECS;
          const arr = playListCodec ? playListCodec.split(',') : [];
          const codec = arr[1];
          audioTracks.push({
            ...trackInfo,
            manifestType: MANIFEST_TYPE.HLS,
            X_ID: trackInfo.URI,
            X_URI: trackInfo.URI,
            X_CODEC: getCodecName({ originalCodec: codec }),
            X_LANGUAGE: trackInfo.LANGUAGE,
            X_SHORT_LANGUAGE: trackInfo?.LANGUAGE?.substring(0, 2),
            X_LABEL: trackInfo.NAME,
            X_NAME: trackInfo.NAME,
            X_CHANNEL: trackInfo.CHANNELS,
            X_AUTOSELECT: trackInfo.AUTOSELECT,
            X_DEFAULT: trackInfo.DEFAULT,
            X_GROUP_ID: trackInfo['GROUP-ID'],
            X_SAMPLE_RATE: trackInfo['SAMPLE-RATE'],
          });
        }
      }
    });
    return { audioTracks, playList };
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
};

export const detectDashManifest = ({
  manifestText,
}: {
  manifestText: string;
}) => {
  const parseXML = (xmlText: string) => {
    return new DOMParser().parseFromString(xmlText, 'application/xml');
  };
  const getAttributes = (element: any) => {
    const attributes: any = {};
    if (element) {
      for (const attr of element.attributes) {
        attributes[attr.name] = attr.value;
      }
    }
    return attributes;
  };
  const extractAudioTracks = (xmlDoc: any) => {
    const adaptationSets = Array.from(
      xmlDoc.getElementsByTagName('AdaptationSet'),
    );
    return adaptationSets
      .filter(
        (set: any) =>
          set.getAttribute('mimeType') &&
          set.getAttribute('mimeType').includes('audio'),
      )
      .map((set: any) => {
        const adaptationSetAttributes = getAttributes(set);
        const representations = Array.from(
          set.getElementsByTagName('Representation'),
        );
        return representations.map((rep: any) => {
          const representationAttributes = getAttributes(rep);
          const audioChannelConfig = rep.getElementsByTagName(
            'AudioChannelConfiguration',
          )[0];
          const audioChannelAttributes = audioChannelConfig
            ? getAttributes(audioChannelConfig)
            : {};
          return {
            ...adaptationSetAttributes,
            ...representationAttributes,
            ...audioChannelAttributes,
            manifestType: MANIFEST_TYPE.DASH,
            X_ID: representationAttributes.id,
            X_URI: representationAttributes.id,
            X_CODEC: getCodecName({
              originalCodec: representationAttributes?.codecs,
            }),
            X_LANGUAGE: adaptationSetAttributes.lang,
            X_SHORT_LANGUAGE: adaptationSetAttributes?.lang?.substring(0, 2),
            X_LABEL: adaptationSetAttributes.label,
            X_NAME: adaptationSetAttributes.label,
            X_CHANNEL: audioChannelAttributes.value,
            X_BITRATE: representationAttributes.bandwidth,
            X_SAMPLING_RATE: representationAttributes.audioSamplingRate,
          } as AudioItemType;
        });
      })
      .flat();
  };
  try {
    const xmlDoc = parseXML(manifestText);
    const audioTracks = extractAudioTracks(xmlDoc) as AudioItemType[];
    return { audioTracks };
  } catch (error) {
    console.error('Error:', error);
    return {};
  }
};

const parseHlsManifest = async ({ manifestUrl }: { manifestUrl: string }) => {
  const m3u8Parser = require('m3u8-parser');
  const parser = new m3u8Parser.Parser();
  let parsedManifest: any = {};
  try {
    const res = await fetch(manifestUrl);
    const manifest = await res.text();
    parser.push(manifest);
    parser.end();
    parsedManifest = parser.manifest;
    const manualParseData = detectHlsManifest(manifest);
    sessionStorage.setItem(
      MANUAL_PARSED_MANIFEST,
      JSON.stringify(manualParseData),
    );
    // playlist
    const qualities: ResolutionItemType[] = (
      parsedManifest?.playlists || []
    ).map((item: any) => ({
      id: item.uri,
      name: item?.attributes?.RESOLUTION?.height
        ? item?.attributes?.RESOLUTION?.height?.toString()
        : '',
      codec: item?.attributes?.CODECS,
      height: item?.attributes?.RESOLUTION?.height,
      width: item?.attributes?.RESOLUTION?.width,
      bitrate: item?.attributes?.BANDWIDTH,
      type: MANIFEST_TYPE.HLS,
      fps: item?.attributes['FRAME-RATE'],
    }));
    // filter audio codecs
    const audioList: AudioItemType[] = [];
    const AUDIO = parsedManifest?.mediaGroups?.AUDIO || {};
    for (const groupId in AUDIO) {
      // check codec of audio groupId
      const playList = (parsedManifest?.playlists || [])?.find(
        (x: any) => x?.attributes?.AUDIO === groupId,
      );
      const playListCodec = playList?.attributes?.CODECS;
      const arr = playListCodec ? playListCodec.split(',') : [];
      const codec = arr[1];
      let codecName = '';
      if (codec === AUDIO_CODEC_URI_NAMES_DASH.AAC) {
        codecName = AUDIO_CODEC_NAMES.AAC;
      } else if (codec === AUDIO_CODEC_URI_NAMES_DASH.AACHE) {
        codecName = AUDIO_CODEC_NAMES.AACHE;
      } else if (codec === AUDIO_CODEC_URI_NAMES_DASH.AACHEV2) {
        codecName = AUDIO_CODEC_NAMES.AACHEV2;
      } else if (codec === AUDIO_CODEC_URI_NAMES_DASH.AC3) {
        codecName = AUDIO_CODEC_NAMES.AC3;
      } else if (codec === AUDIO_CODEC_URI_NAMES_DASH.EC3) {
        codecName = AUDIO_CODEC_NAMES.EC3;
      } else if (codec === AUDIO_CODEC_URI_NAMES_DASH.FLAC) {
        codecName = AUDIO_CODEC_NAMES.FLAC;
      } else if (codec === AUDIO_CODEC_URI_NAMES_DASH.ALAC) {
        codecName = AUDIO_CODEC_NAMES.ALAC;
      }
      const audio = AUDIO[groupId] || {};
      for (const audioId in audio) {
        const detail = {
          id: audioId,
          ...audio[audioId],
          codec: codecName,
          label: audioId,
          shortLanguage: audio[audioId]?.language?.substring(0, 2) || '',
        };
        audioList.push(detail);
      }
    }
    return { qualities, audioList, manualParseData };
  } catch (error: any) {
    console.log('--- ERROR PARSE HLS', error?.message, manifestUrl);
    return { parsedManifest };
  }
};

const parseDashManifest = async ({ manifestUrl }: { manifestUrl: string }) => {
  let parsedManifest: any = {};
  try {
    const res = await fetch(manifestUrl);
    const manifest = await res.text();
    const mpdParser = require('mpd-parser');
    parsedManifest = mpdParser.parse(manifest, {
      manifestUri: manifestUrl,
    });
    // parse thủ công
    const manualParseData = detectDashManifest({ manifestText: manifest });
    sessionStorage.setItem(
      MANUAL_PARSED_MANIFEST,
      JSON.stringify(manualParseData),
    );
    // filter audio codecs
    const audioList: AudioItemType[] = [];
    const AUDIO = parsedManifest?.mediaGroups?.AUDIO?.audio || {};
    for (const audioId in AUDIO) {
      const audio = AUDIO[audioId] || {};
      const playlist = audio?.playlists ? audio?.playlists[0] : {};
      const codec = playlist?.attributes?.CODECS;
      let codecName = '';
      if (codec === AUDIO_CODEC_URI_NAMES_DASH.AAC) {
        codecName = AUDIO_CODEC_NAMES.AAC;
      } else if (codec === AUDIO_CODEC_URI_NAMES_DASH.AACHE) {
        codecName = AUDIO_CODEC_NAMES.AACHE;
      } else if (codec === AUDIO_CODEC_URI_NAMES_DASH.AACHEV2) {
        codecName = AUDIO_CODEC_NAMES.AACHEV2;
      } else if (codec === AUDIO_CODEC_URI_NAMES_DASH.AC3) {
        codecName = AUDIO_CODEC_NAMES.AC3;
      } else if (codec === AUDIO_CODEC_URI_NAMES_DASH.EC3) {
        codecName = AUDIO_CODEC_NAMES.EC3;
      } else if (codec === AUDIO_CODEC_URI_NAMES_DASH.FLAC) {
        codecName = AUDIO_CODEC_NAMES.FLAC;
      } else if (codec === AUDIO_CODEC_URI_NAMES_DASH.ALAC) {
        codecName = AUDIO_CODEC_NAMES.ALAC;
      }
      const detail = {
        id: audioId,
        ...audio,
        codec: codecName,
        label: audioId,
        shortLanguage: audio?.language?.substring(0, 2) || '',
      };
      audioList.push(detail);
    }
    const qualities: ResolutionItemType[] = (
      parsedManifest?.playlists || []
    ).map((item: any) => ({
      id: item?.attributes?.NAME,
      name: item?.attributes?.RESOLUTION?.height,
      codec: item?.attributes?.CODECS,
      height: item?.attributes?.RESOLUTION?.height,
      width: item?.attributes?.RESOLUTION?.width,
      bitrate: item?.attributes?.BANDWIDTH,
      fps: item?.attributes['FRAME-RATE'],
      type: MANIFEST_TYPE.DASH,
    }));
    return { qualities, audioList, manualParseData };
  } catch (error: any) {
    console.log('--- ERROR PARSE DASH', error?.message, manifestUrl);
    return { parsedManifest };
  }
};

const parseManifest = async ({ manifestUrl }: { manifestUrl: string }) => {
  if (manifestUrl.includes('.m3u8')) {
    sessionStorage.setItem(RUNNING_MANIFEST_TYPE, MANIFEST_TYPE.HLS);
    return await parseHlsManifest({ manifestUrl });
  } else if (manifestUrl.includes('.mpd')) {
    sessionStorage.setItem(RUNNING_MANIFEST_TYPE, MANIFEST_TYPE.DASH);
    return await parseDashManifest({ manifestUrl });
  }
};

const generateAudioText = ({
  audioTrack,
  index,
  dataChannel,
  dataMultiAudioEvent,
  playerName,
  streamType,
}: any = {}) => {
  const rawManifest = sessionStorage.getItem(MANUAL_PARSED_MANIFEST);
  const runningManifestType = sessionStorage.getItem(RUNNING_MANIFEST_TYPE);
  const parsedManifest = rawManifest ? JSON.parse(rawManifest) : {};
  const manifestAudios = parsedManifest?.audioTracks || [];

  let languageText = `Âm thanh ${index + 1}`;
  let appendText = '';
  let result = '';
  const audioNameList_: any = [];
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
      dataMultiAudioEvent?.length &&
      dataMultiAudioEvent[index] &&
      dataMultiAudioEvent[index]?.audio_name
    ) {
      result = dataMultiAudioEvent[index]?.audio_name;
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
        (item) => item.dash_codec === codec,
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
        const sameName1 = audioNameList_.find(
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
        const sameName2 = audioNameList_.find(
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
      const sameName3 = audioNameList_.find((item: any, idx: number) => {
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
      audioNameList_.push(text);
      if (playerName === PLAYER_NAME.HLS) {
        if (audioTrack?.label) {
          result = audioTrack?.label;
        }
      } else {
        const audiosAndRoles = window.player?.getAudioLanguagesAndRoles
          ? window.player.getAudioLanguagesAndRoles()
          : [];
        const matchedRole = audiosAndRoles.find(
          (item: any) => item?.language === audioTrack,
        );
        if (matchedRole?.label) {
          result = matchedRole?.label;
        }
      }
    }
    return result;
  } catch (error) {
    console.log('--- ERROR generateAudioText', error);
    return result;
  }
};

const getCodecName = ({ originalCodec }: { originalCodec: string }) => {
  let codecName = '';
  try {
    if (originalCodec === AUDIO_CODEC_URI_NAMES_DASH.AAC) {
      codecName = AUDIO_CODEC_NAMES.AAC;
    } else if (originalCodec === AUDIO_CODEC_URI_NAMES_DASH.AACHE) {
      codecName = AUDIO_CODEC_NAMES.AACHE;
    } else if (originalCodec === AUDIO_CODEC_URI_NAMES_DASH.AACHEV2) {
      codecName = AUDIO_CODEC_NAMES.AACHEV2;
    } else if (originalCodec === AUDIO_CODEC_URI_NAMES_DASH.AC3) {
      codecName = AUDIO_CODEC_NAMES.AC3;
    } else if (originalCodec === AUDIO_CODEC_URI_NAMES_DASH.EC3) {
      codecName = AUDIO_CODEC_NAMES.EC3;
    } else if (originalCodec === AUDIO_CODEC_URI_NAMES_DASH.FLAC) {
      codecName = AUDIO_CODEC_NAMES.FLAC;
    } else if (originalCodec === AUDIO_CODEC_URI_NAMES_DASH.ALAC) {
      codecName = AUDIO_CODEC_NAMES.ALAC;
    }
    return codecName;
  } catch {
  } finally {
    return codecName;
  }
};

function getRemainingBufferedTime() {
  try {
    const video = document.getElementById(VIDEO_ID) as HTMLVideoElement;
    if (!video || !video.buffered || video.buffered.length === 0) {
      return 0;
    }

    const currentTime = video.currentTime;
    let remaining = 0;

    for (let i = 0; i < video.buffered.length; i++) {
      const start = video.buffered.start(i);
      const end = video.buffered.end(i);

      if (currentTime >= start && currentTime <= end) {
        remaining = end - currentTime;
        break;
      }
    }

    return remaining;
  } catch {
    return 0;
  }
}

const checkShakaResponseFilter = ({ response }: { response?: any }) => {
  try {
    if (response?.status === 200 || response?.status === 206) {
      const prev =
        sessionStorage.getItem(trackingStoreKey.TOTAL_CHUNK_SIZE_LOADED) || 0;
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Length
      const size = response?.headers
        ? parseInt(response?.headers['content-length'])
        : 0;
      saveSessionStorage({
        data: [
          {
            key: trackingStoreKey.TOTAL_CHUNK_SIZE_LOADED,
            value: String(parseInt(prev as string) + size),
          },
        ],
      });
    }
  } catch {}
};
export {
  getRemainingBufferedTime,
  supportedVideoCodecs,
  parseHlsManifest,
  parseDashManifest,
  parseManifest,
  generateAudioText,
  getCodecName,
  checkShakaResponseFilter,
};
