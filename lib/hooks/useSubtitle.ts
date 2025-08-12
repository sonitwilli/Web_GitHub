/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useCallback, useEffect, useState } from 'react';
import {
  KEY_LANGUAGES_AUDIO_CODECS,
  SELECTED_SUBTITLE,
} from '@/lib/constant/texts';
import useClickOutside from '@/lib/hooks/useClickOutside';
import { usePlayerPageContext } from '../components/player/context/PlayerPageContext';
import { saveSessionStorage } from '../utils/storage';

export interface SubtitleItemType {
  language?: string;
  shortLanguage?: string;
  id?: string | number;
  name?: string;
  codec?: string;
  default?: boolean;
  label?: string;
  autoselect?: boolean;
}

const OFF_SUB = 'Off-Sub';

const defaultSub: SubtitleItemType = {
  label: 'Tắt',
  id: OFF_SUB,
  language: OFF_SUB,
};

export default function useSubtitle() {
  const [subs, setSubs] = useState<SubtitleItemType[]>([]);
  const { playerName, isMetaDataLoaded } = usePlayerPageContext();
  const [selected, setSelected] = useState<SubtitleItemType>();
  const [open, setOpen] = useState(false);

  const getSubs = useCallback(() => {
    if (playerName === 'hls' && window.hlsPlayer) {
      const tracks = window.hlsPlayer.subtitleTracks || [];
      const checks: SubtitleItemType[] = tracks?.map((x) => ({
        language: x.lang,
        autoselect: x.autoselect,
        default: x.default,
        shortLanguage: x.lang?.substring(0, 2),
        /*@ts-ignore*/
        label: x.lang ? KEY_LANGUAGES_AUDIO_CODECS[x.lang] : '',
        id: x.lang,
      }));
      setSubs([defaultSub, ...checks]);
    }
    if (playerName === 'shaka' && window.shakaPlayer) {
      setTimeout(() => {
        const tracks = window.shakaPlayer.getTextLanguages() || [];
        const validTracks = tracks.filter(
          /*@ts-ignore*/
          (x) => !!KEY_LANGUAGES_AUDIO_CODECS[x],
        );
        const checks: SubtitleItemType[] = validTracks?.map((x: string) => ({
          language: x,
          /*@ts-ignore*/
          label: x ? KEY_LANGUAGES_AUDIO_CODECS[x] : '',
          id: x,
        }));
        setSubs([defaultSub, ...checks]);
      }, 500);
    }
  }, [playerName]);

  useEffect(() => {
    // check selected on load
    if (subs?.length >= 2) {
      const saved = localStorage.getItem(SELECTED_SUBTITLE);
      // có lưu trước đó
      if (saved) {
        // đang tắt
        if (saved === OFF_SUB) {
          setSelected(subs[0]);
          if (playerName === 'hls' && window.hlsPlayer) {
            window.hlsPlayer.subtitleDisplay = false;
          }
          if (playerName === 'shaka' && window.shakaPlayer) {
            window.shakaPlayer.setTextTrackVisibility(false);
          }
          return;
        }
        let index: number = 0;
        const found = subs.find((x, idx) => {
          if (x.language === saved) {
            index = idx;
            return true;
          } else {
            return false;
          }
        });
        // cái lưu trước đó có nằm trong list hay không
        // có
        if (found) {
          setSelected(found);
          if (playerName === 'hls' && window.hlsPlayer) {
            window.hlsPlayer.subtitleDisplay = true;
            window.hlsPlayer.subtitleTrack = index - 1;
          }
          if (playerName === 'shaka' && window.shakaPlayer) {
            window.shakaPlayer.setTextTrackVisibility(true);
            window.shakaPlayer.selectTextLanguage(saved);
          }
        }
        // không có thì lấy cái đầu tiên
        else {
          setSelected(subs[1]);
          if (playerName === 'hls' && window.hlsPlayer) {
            window.hlsPlayer.subtitleDisplay = true;
            window.hlsPlayer.subtitleTrack = 0;
          }
          if (playerName === 'shaka' && window.shakaPlayer) {
            window.shakaPlayer.setTextTrackVisibility(true);
            window.shakaPlayer.selectTextLanguage(subs[1].language);
          }
        }
      } else {
        // nếu chưa có local thì show sub đầu tiên
        setSelected(subs[1]);
        if (playerName === 'hls' && window.hlsPlayer) {
          window.hlsPlayer.subtitleDisplay = true;
          window.hlsPlayer.subtitleTrack = 0;
        }
        if (playerName === 'shaka' && window.shakaPlayer) {
          window.shakaPlayer.setTextTrackVisibility(true);
          window.shakaPlayer.selectTextLanguage(subs[1].language);
        }
      }
    }
  }, [subs, playerName]);

  useEffect(() => {
    if (isMetaDataLoaded) {
      getSubs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMetaDataLoaded]);

  const clickSub = useCallback(
    (s: SubtitleItemType) => {
      if (!subs?.length) {
        return;
      }
      localStorage.setItem(SELECTED_SUBTITLE, s.language || '');
      saveSessionStorage({
        data: [
          {
            key: SELECTED_SUBTITLE,
            value: s.language,
          },
        ],
      });
      if (s.id === OFF_SUB) {
        setSelected(subs[0]);
        if (playerName === 'hls' && window.hlsPlayer) {
          window.hlsPlayer.subtitleDisplay = false;
        }
        if (playerName === 'shaka' && window.shakaPlayer) {
          window.shakaPlayer.setTextTrackVisibility(false);
        }
        return;
      } else {
        let index: number = 0;
        const found = subs.find((x, idx) => {
          if (x.id === s.id) {
            index = idx;
            return true;
          } else {
            return false;
          }
        });
        setSelected(found);
        if (playerName === 'hls' && window.hlsPlayer) {
          window.hlsPlayer.subtitleDisplay = true;
          window.hlsPlayer.subtitleTrack = index - 1;
        }
        if (playerName === 'shaka' && window.shakaPlayer) {
          window.shakaPlayer.setTextTrackVisibility(true);
          window.shakaPlayer.selectTextLanguage(s.language);
        }
      }
    },
    [subs, playerName],
  );

  const containerRef = useClickOutside<HTMLDivElement>(() => {
    setOpen(false);
  });

  return {
    subs,
    selected,
    setSelected,
    open,
    setOpen,
    clickSub,
    containerRef,
  };
}
