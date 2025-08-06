import { useMemo } from 'react';
import { usePlayerPageContext } from '../context/PlayerPageContext';

export default function OverlayLogo() {
  const { dataStream, dataChannel } = usePlayerPageContext();

  const logoUrl = useMemo(() => {
    return dataChannel?.overlay_logo || dataStream?.overlay_logo;
  }, [dataStream, dataChannel]);

  if (!logoUrl) {
    return null;
  }

  return (
    <div
      id="overlay-logo"
      className="absolute left-0 top-0 w-full h-full flex items-center justify-center pointer-events-none"
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="overlay logo"
          className="max-h-full max-w-full"
        />
      ) : (
        ''
      )}
    </div>
  );
}
