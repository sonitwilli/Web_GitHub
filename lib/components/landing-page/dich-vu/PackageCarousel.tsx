import React, { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';
import type { PackageItem } from './types';

type Props = {
  id?: string;
  title: string;
  packages: PackageItem[];
  showControls?: boolean;
};

export default function PackageCarousel({
  id,
  title,
  packages,
  showControls = false,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    skipSnaps: false,
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 992px)': { slidesToScroll: 1 },
    },
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      if (!emblaApi) return;
      setPrevBtnEnabled(emblaApi.canScrollPrev());
      setNextBtnEnabled(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <section id={id} className="py-8 flex justify-center ">
      <div
        className="w-[350px] sm:w-[630px] md:w-[700px] lg:w-[900px] xl:w-[90%] mx-auto max-w-screen-xl 
      bg-white rounded-xl text-bg-gray shadow-2xl"
      >
        <div className="bg-pastel-orange text-4xl font-bold py-8 rounded-t-xl text-center">
          {title}
        </div>
        <div className="relative py-6">
          <div className="overflow-hidden px-4" ref={emblaRef}>
            <div className="flex gap-6">
              {packages.map((_package, index) => (
                <div
                  key={index}
                  className="flex flex-col min-w-full lg:min-w-[48%] xl:min-w-[32%] text-lg font-light p-4 select-none"
                >
                  <span className="text-2xl font-bold text-center mb-4">
                    {_package.name}
                  </span>
                  <div 
                    className="my-3 [&_b]:font-bold leading-8"
                    dangerouslySetInnerHTML={{ __html: _package.content }}
                  />

                  <div className="text-center mt-auto">
                    <button className="bg-dim-gray hover:bg-bg-gray text-white px-10 py-2 rounded-xl text-sm w-fit">
                      <span className="block mb-1">{_package.fee.text}</span>
                      <span className="block text-2xl font-bold">
                        {_package.fee.details}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showControls && (
            <>
              {prevBtnEnabled && (
                <button
                  onClick={scrollPrev}
                  className="absolute left-8 top-1/2 -translate-y-1/2 bg-white shadow-[0_0_10px_rgba(0,0,0,0.55)] rounded-full p-3 text-black z-10 hover:scale-105 transition cursor-pointer"
                >
                  <BsChevronLeft size={35} />
                </button>
              )}
              {nextBtnEnabled && (
                <button
                  onClick={scrollNext}
                  className="absolute right-8 top-1/2 -translate-y-1/2 bg-white shadow-[0_0_10px_rgba(0,0,0,0.55)] rounded-full p-3 text-black z-10 hover:scale-105 transition cursor-pointer"
                >
                  <BsChevronRight size={35} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
