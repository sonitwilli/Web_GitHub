import { useVodPageContext } from '../player/context/VodPageContext';
import Top10Item from './Top10Item';

export default function Top10() {
  const { top10Data } = useVodPageContext();
  return (
    <div className="">
      <div className="">
        <h2 className="text-white-smoke font-[600] text-[24px] leading-[130%] tracking-[0.48px] mb-[16px]">
          {top10Data?.meta?.name}
        </h2>

        <div className="flex flex-col gap-[33px] xl:gap-[24px]">
          {top10Data?.data?.map((movie, index) => (
            <Top10Item key={index} movie={movie} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
