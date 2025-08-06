import { useContext, useEffect, useMemo } from 'react';
import { PlayerWrapperContext } from './PlayerWrapper';
import { useAppSelector } from '@/lib/store';
import { useRatioElement } from '@/lib/hooks/useRatioElement';

export default function FingerPrintAPI() {
  const playerWrapperCtx = useContext(PlayerWrapperContext);
  const { ip, fingerPrintData } = playerWrapperCtx;
  const { info } = useAppSelector((s) => s.user);

  const text = useMemo(() => {
    return `${ip} ${info?.user_id_str}`;
  }, [ip, info]);

  const position = useMemo(() => {
    if (!fingerPrintData) {
      return {};
    }
    const top = fingerPrintData.y || 10;
    const left = fingerPrintData.x
      ? fingerPrintData.x * 0.75
      : fingerPrintData.x || 20;

    return { top, left };
  }, [fingerPrintData]);

  const { checkRatio, observeElement } = useRatioElement();

  useEffect(() => {
    checkRatio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observeElement, fingerPrintData]);

  if (!fingerPrintData) {
    return null;
  }

  return (
    <div className="FingerPrintAPI w-full h-full absolute top-0 left-0 flex items-center justify-center pointer-events-none">
      <div ref={observeElement} className="h-full relative">
        <div
          className="inline bg-black-02 text-white text-[11px] leading-[130%] px-[4px] py-[1px] rounded-[5px] absolute"
          style={{
            top: `${position.top}%`,
            left: `${position.left}%`,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
