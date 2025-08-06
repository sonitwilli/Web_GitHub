export default function PlayerEndedLive() {
  const handlePreventFullscreen = (e: React.SyntheticEvent | KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <video
      poster="/images/poster-ended-event.png"
      className="w-full h-full block outline-none pointer-events-auto"
      tabIndex={-1} // Ngăn focus bằng phím
      controls={false} // Không cho hiện UI control
      onDoubleClick={handlePreventFullscreen}
      onContextMenu={(e) => e.preventDefault()} // Ngăn chuột phải
      onKeyDown={handlePreventFullscreen}
    />
  );
}
