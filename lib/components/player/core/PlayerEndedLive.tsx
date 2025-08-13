import { usePlayerPageContext } from '@/lib/components/player/context/PlayerPageContext';
import useScreenSize, { VIEWPORT_TYPE } from '@/lib/hooks/useScreenSize';

export default function PlayerEndedLive() {
  const { isExpanded, videoHeight } = usePlayerPageContext();
  const { viewportType } = useScreenSize();

  const handlePreventFullscreen = (e: React.SyntheticEvent | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <div
      className={`${
        isExpanded
          ? ''
          : viewportType === VIEWPORT_TYPE.DESKTOP
          ? 'f-container'
          : ''
      }`}
    >
      <div
        className={`h-full ${
          isExpanded ? '' : 'xl:grid xl:grid-cols-[1fr_432px]'
        }`}
      >
        <div
          className="w-full col-span-full relative"
          style={{
            height:
              viewportType === VIEWPORT_TYPE.DESKTOP
                ? `${videoHeight && videoHeight > 0 ? videoHeight : ''}px`
                : '',
          }}
        >
          <video
            poster="/images/poster-ended-event.png"
            className="w-fit h-full outline-none pointer-events-auto mx-auto"
            tabIndex={-1} // Ngăn focus bằng phím
            controls={false} // Không cho hiện UI control
            onDoubleClick={handlePreventFullscreen}
            onContextMenu={(e) => e.preventDefault()} // Ngăn chuột phải
            onKeyDown={handlePreventFullscreen}
          />
        </div>
      </div>
    </div>
  );
}
