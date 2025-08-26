import useAudio from '@/lib/hooks/useAudio';
import { ControlPopupType } from './MobilePopup';
import { AudioItemType } from './AudioButton';
interface Props {
  onClick?: () => void;
  type?: ControlPopupType;
}
export default function AudioContent({ onClick, type }: Props) {
  const { selectedAudio, clickAudio, filterdAudios } = useAudio();

  const click = (q: AudioItemType) => {
    clickAudio(q);
    if (onClick) onClick();
  };

  if (!filterdAudios?.length || filterdAudios?.length < 2) {
    return;
  }
  return (
    <>
      <div
        className={`p-[16px] text-[16px] leading-[130%] tracking-[0.32px] ${
          type === 'default'
            ? 'border-b border-black-olive text-white-smoke'
            : 'font-[500] text-spanish-gray'
        }`}
      >
        Âm thanh
      </div>
      <div className="pt-[8px]">
        {filterdAudios?.map((ad, index) => (
          <div
            key={index}
            className={`${
              type === 'default'
                ? 'flex items-center gap-[8px] py-[8px] px-[16px] hover:bg-white-01'
                : 'relative flex items-center justify-center'
            }`}
            onClick={() => click(ad)}
          >
            {type === 'default' ? (
              <>
                {ad.X_ID === selectedAudio?.X_ID ? (
                  <img
                    src="/images/player/check.svg"
                    alt="checked"
                    className="w-[24px] h-[24px]"
                  />
                ) : (
                  <div className="w-[24px] h-[24px] text-[16px] leading-[130%] tracking-[0.32px] font-[500] text-white-smoke"></div>
                )}
              </>
            ) : (
              ''
            )}

            <div
              className={`${
                type === 'fullcreen' ? 'text-center py-[14px] relative' : ''
              }`}
            >
              {type === 'fullcreen' && ad.X_ID === selectedAudio?.X_ID ? (
                <img
                  src="/images/player/check.svg"
                  alt="checked"
                  className="w-[24px] h-[24px] absolute top-1/2 -translate-y-1/2 right-full -translate-x-[9px]"
                />
              ) : (
                ''
              )}
              {ad?.X_LABEL || ad?.X_NAME}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
