import { useEffect, useState } from 'react';
import { LuRefreshCcw } from 'react-icons/lu';

const generateCaptcha = () => {
  return btoa((Math.random() * 1e9).toString()).substring(0, 4);
};

const getRotate = () => -20 + Math.floor(Math.random() * 30);

const CaptchaBox = ({
  onChange,
  refreshTrigger,
}: {
  onChange?: (captcha: string) => void;
  refreshTrigger?: number;
}) => {
  const [captcha, setCaptcha] = useState<string[]>([]);
  const [rotateValues, setRotateValues] = useState<number[]>([]);

  const handleGenerate = () => {
    const newCaptcha = generateCaptcha();
    const chars = newCaptcha.split('');
    const rotations = chars.map(() => getRotate());

    setCaptcha(chars);
    setRotateValues(rotations);

    if (onChange) onChange(newCaptcha);
  };

  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  return (
    <div className="font-light flex gap-3 items-center px-3 bg-eerie-black w-[38%] h-[55px] mt-5 rounded-xl relative">
      <div className="w-[80%] flex items-center justify-center gap-1 z-1">
        {captcha.length > 0 ? (
          captcha.map((char, idx) => (
            <span
              key={idx}
              style={{ transform: `rotate(${rotateValues[idx]}deg)` }}
              className="text-white select-none text-lg"
            >
              {char}
            </span>
          ))
        ) : (
          <span className="text-white text-sm opacity-50">Tạo mã Captcha</span>
        )}
      </div>

      <div className="absolute top-[11px] left-[13px] w-[70%] h-[32px] pointer-events-none bg-black-05 z-0 overflow-hidden">
        <div className="absolute top-[15px] left-0 w-[120px] h-[32px] border-t-[3.5px] border-raisin-black rounded-t-[9999px]"></div>
        <div className="absolute -top-[18px] -left-[9px] w-[120px] h-[32px] border-t-[3.5px] border-raisin-black rounded-t-[9999px] rotate-[167deg]"></div>
        <div className="absolute top-[15px] left-0 w-[120px] h-[32px] border-t-[3.5px] border-raisin-black rounded-t-[9999px] rotate-[-25deg]"></div>
      </div>

      <LuRefreshCcw
        className="w-[20px] h-[20px] cursor-pointer hover:text-fpl"
        onClick={handleGenerate}
      />
    </div>
  );
};

export default CaptchaBox;
