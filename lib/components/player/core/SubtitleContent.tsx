import useSubtitle from '@/lib/hooks/useSubtitle';
import { ControlPopupType } from './MobilePopup';

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

interface Props {
  onClick?: () => void;
  type?: ControlPopupType;
}

export default function SubtitleContent({ type = 'default', onClick }: Props) {
  const { subs, selected, clickSub } = useSubtitle({ type });

  const handleClick = (ad: SubtitleItemType) => {
    clickSub(ad);
    if (onClick) onClick();
  };

  if (!subs?.length || subs.length < 2) {
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
        Phụ đề
      </div>
      <div className="pt-[8px]">
        {subs?.map((ad, index) => (
          <div
            key={index}
            className={`${
              type === 'default'
                ? 'flex items-center gap-[8px] py-[8px] px-[16px] hover:bg-white-01'
                : 'relative flex items-center justify-center'
            }`}
            onClick={() => handleClick(ad)}
          >
            {type === 'default' ? (
              <>
                {ad.id === selected?.id ? (
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
              {type === 'fullcreen' && ad.id === selected?.id ? (
                <img
                  src="/images/player/check.svg"
                  alt="checked"
                  className="w-[24px] h-[24px] absolute top-1/2 -translate-y-1/2 right-full -translate-x-[9px]"
                />
              ) : (
                ''
              )}
              {ad?.label || ad?.name}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
