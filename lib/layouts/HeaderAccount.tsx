/* eslint-disable @next/next/no-html-link-for-pages */
import { useContext } from 'react';
import { AppContext } from '@/lib/components/container/AppContainer';

export default function Header() {
  const appCtx = useContext(AppContext);
  const { configs } = appCtx;

  return (
    <header className="fixed w-full left-0 top-0 py-[14px] min-h-[80px] z-[2] flex flex-col justify-center duration-800 bg-black">
      <div className="f-container self-stretch flex items-center justify-between">
        <div className="flex items-center gap-[24px] 2xl:gap-[96px]">
          <a href="/" aria-label="Home page">
            <img
              src={configs?.image?.logo?.tv || '/images/logo.png'}
              alt="logo"
              width={125}
              height={52}
              style={{ height: 'auto' }}
              className="w-[125px] h-auto min-w-[125px]"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
