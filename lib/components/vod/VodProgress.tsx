import { BlockItemType, BlockSlideItemType } from "@/lib/api/blocks";
import { useMemo } from "react";

export interface Props {
  block?: BlockItemType;
  slide?: BlockSlideItemType;
}

export default function VodProgress({ slide }: Props) {
  const progressBarWidth = useMemo(() => {
    if (slide?.time_watched && slide?.detail?.duration_i) {
      return (
        (parseInt(slide.time_watched) / parseInt(slide.detail.duration_i)) *
          100 +
        "%"
      );
    } else {
      return null;
    }
  }, [slide]);
  return (
    <div className="w-full relative bg-white-02 h-[6px]">
      <div
        className="h-[6px] absolute left-0 top-0 bg-gradient-to-r from-portland-orange to-lust"
        style={{ width: progressBarWidth || "" }}
      ></div>
    </div>
  );
}
