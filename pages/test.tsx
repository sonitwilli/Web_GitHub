'use client';

import EmblaTopSlider from '@/lib/components/slider/embla/top-slider/EmblaTopSlider';
import DefaultLayout from '@/lib/layouts/Default';
const DynamicChildren: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="f-container pt-[100px]">
        <EmblaTopSlider />
      </div>
    </DefaultLayout>
  );
};

export default DynamicChildren;
