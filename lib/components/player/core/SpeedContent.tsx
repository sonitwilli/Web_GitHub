import usePlaybackSpeed from '@/lib/hooks/usePlaybackSpeed';

const SPEED_OPTIONS = [
  { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '1.0x' },
  { value: 1.25, label: '1.25x' },
  { value: 1.5, label: '1.5x' },
  { value: 2.0, label: '2.0x' },
];

interface SpeedContentProps {
  onClick?: () => void;
  type?: string;
}

export default function SpeedContent({
  onClick,
  type = 'default',
}: SpeedContentProps) {
  const { speed, updateSpeed } = usePlaybackSpeed();

  const handleSelect = (val: number) => {
    updateSpeed(val, onClick);
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
        Tốc độ phát
      </div>
      <div className="pt-[8px]">
        {SPEED_OPTIONS.map((opt) => (
          <div
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className={`${
              type === 'default'
                ? 'flex items-center gap-[8px] py-[8px] px-[16px] hover:bg-white-01 cursor-pointer'
                : 'relative flex items-center justify-center cursor-pointer'
            }`}
          >
            {type === 'default' ? (
              <>
                {speed === opt.value ? (
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
              {type === 'fullcreen' && speed === opt.value ? (
                <img
                  src="/images/player/check.svg"
                  alt="checked"
                  className="w-[24px] h-[24px] absolute top-1/2 -translate-y-1/2 right-full -translate-x-[9px]"
                />
              ) : (
                ''
              )}
              {opt.label}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
