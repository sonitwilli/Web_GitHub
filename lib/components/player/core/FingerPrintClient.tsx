import { useContext, useMemo } from 'react';
import { PlayerWrapperContext } from './PlayerWrapper';
import { useAppSelector } from '@/lib/store';

export default function FingerPrintClient() {
  const playerWrapperCtx = useContext(PlayerWrapperContext);
  const { ip } = playerWrapperCtx;
  const { info } = useAppSelector((s) => s.user);

  const text = useMemo(() => {
    return `${ip} ${info?.user_id_str}`;
  }, [ip, info]);
  return (
    <div className="w-full h-full grid grid-cols-3 grid-rows-3">
      {Array.from({ length: 9 }, (_, index) => (
        <div key={index} className="flex items-center justify-center">
          <div className="bg-black inline text-[12px] opacity-50 rounded-[10px] px-[10px] py-[5px]">
            {text}
          </div>
        </div>
      ))}
    </div>
  );
}
