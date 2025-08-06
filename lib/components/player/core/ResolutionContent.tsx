import useResolution from '@/lib/hooks/useResolution';
import { ControlPopupType } from './MobilePopup';
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

interface Props {
  onClick?: () => void;
  type?: ControlPopupType;
}

export default function ResolutionContent({
  onClick,
  type = 'default',
}: Props) {
  const { qualitiesToShow, click, selectedQuality } = useResolution();

  const clickQuality = (q: ResolutionItemType) => {
    click(q);
    if (onClick) onClick();
  };
  return (
    <>
      <div
        className={`p-[16px] text-[16px] leading-[130%] tracking-[0.32px] ${
          type === 'default'
            ? 'border-b border-black-olive text-white-smoke'
            : 'font-[500] text-spanish-gray'
        }`}
      >
        Chất lượng
      </div>
      <div className="pt-[8px]">
        {qualitiesToShow?.map((q, index) => (
          <div
            key={index}
            className={`${
              type === 'default'
                ? 'flex items-center gap-[8px] py-[8px] px-[16px] hover:bg-white-01'
                : 'relative flex items-center justify-center'
            }`}
            onClick={() => clickQuality(q)}
          >
            {type === 'default' ? (
              <>
                {q.height === selectedQuality?.height ? (
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
              {type === 'fullcreen' && q.height === selectedQuality?.height ? (
                <img
                  src="/images/player/check.svg"
                  alt="checked"
                  className="w-[24px] h-[24px] absolute top-1/2 -translate-y-1/2 right-full -translate-x-[9px]"
                />
              ) : (
                ''
              )}
              {q.name || q.height}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
