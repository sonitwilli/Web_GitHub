import Hls from 'hls.js';

export function switchHlsMonitorQuality(
  hls: Hls | null,
  height: string | number,
  firstTime?: boolean,
) {
  if (!hls) return;
  const n = Number(height);
  if (Number.isNaN(n)) {
    if (firstTime) {
      hls.loadLevel = -1;
    } else {
      hls.currentLevel = -1;
    }
    return;
  }
  const qualityList = hls.levels || [];
  if (!qualityList?.length) return;
  const matched = qualityList.filter((x) => Number(x.height) === Number(n));
  if (!matched?.length) return;
  const best = matched.reduce((acc, cur) =>
    cur.bitrate > (acc?.bitrate || 0) ? cur : acc,
  );
  const index = qualityList.findIndex((l) => l.bitrate === best?.bitrate);
  if (index >= 0) {
    if (firstTime) {
      hls.loadLevel = index;
    } else {
      hls.currentLevel = index;
    }
  }
}

// Minimal Shaka variant selection for Monitor
// player: a shaka.Player instance
export function switchShakaMonitorQuality(
  player: {
    getVariantTracks?: () => Array<{
      height?: number;
      bandwidth?: number;
    }>;
    configure?: (cfg: unknown) => void;
    selectVariantTrack?: (track: unknown, clearBuffer?: boolean) => void;
  } | null,
  height: string | number,
) {
  if (!player) return;
  const playlist = player.getVariantTracks?.() || [];
  const h = Number(height);
  if (Number.isNaN(h)) {
    player.configure?.({
      abr: {
        enabled: true,
        restrictions: { maxBandwidth: Infinity, minBandwidth: 0 },
      },
    });
    return;
  }
  const founds: Array<{ height?: number; bandwidth?: number }> =
    playlist.filter((item) => item?.height === h) || [];
  if (founds?.length) {
    founds.sort((a, b) => (b.bandwidth || 0) - (a.bandwidth || 0));
    player.configure?.({ abr: { enabled: false } });
    player.selectVariantTrack?.(founds[0], false);
  } else {
    player.configure?.({
      abr: {
        enabled: true,
        restrictions: { maxBandwidth: Infinity, minBandwidth: 0 },
      },
    });
  }
}
