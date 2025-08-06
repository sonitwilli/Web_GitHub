/* eslint-disable jsx-a11y/alt-text */
import { useVodPageContext } from '../context/VodPageContext';
import { useAppSelector } from '@/lib/store';

export default function EpisodeListButton() {
  const { setOpenEpisodesFullscreen, openEpisodesFullscreen } =
    useVodPageContext();
  const { isFullscreen } = useAppSelector((s) => s.player);
  const click = () => {
    if (isFullscreen && setOpenEpisodesFullscreen) {
      setOpenEpisodesFullscreen(!openEpisodesFullscreen);
    }
  };
  return (
    <div className="c-control-button c-control-button-episode-list">
      <div onClick={click} className="c-control-button-icon">
        <img
          src="/images/player/espisode_list.png"
          className="w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px]"
        />
      </div>
      <div className="c-control-hover-text">Danh sách phát</div>
    </div>
  );
}
