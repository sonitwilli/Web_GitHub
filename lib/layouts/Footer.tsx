import React from 'react';
import { useInView } from 'react-intersection-observer';
import dynamic from 'next/dynamic';

const FooterWrapper = dynamic(
  () => import('../components/footer/FooterWrapper'),
  { ssr: false },
);

export default function Footer() {
  const { ref, inView } = useInView({});
  return (
    <footer
      ref={ref}
      className="f-container border-t border-charleston-green mt-[40px] tablet:mt-[80px] xl:mt-[104px] bg-black py-[24px] tablet:py-[32px] xl:py-[80px] "
    >
      {inView ? <FooterWrapper /> : <div className="h-[200px]"></div>}
    </footer>
  );
}
