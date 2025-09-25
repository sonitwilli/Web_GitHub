/* eslint-disable @next/next/no-html-link-for-pages */
import { useContext } from 'react';
import { AppContext } from '@/lib/components/container/AppContainer';

export default function Header() {
  const appCtx = useContext(AppContext);
  const { configs } = appCtx;

  return (
    <header className="fixed w-full left-0 top-0 py-[14px] min-h-[80px] z-[2] flex flex-col justify-center duration-800 bg-smoky-black">
      <div className="f-container self-stretch flex items-center justify-between">
        <div className="flex items-center gap-[24px] 2xl:gap-[96px]">
          <a href="/" aria-label="Home page">
            <img
              src={configs?.image?.logo?.tv || '/images/logo.png'}
              alt="logo"
              style={{ height: 'auto' }}
              className="w-[94px] h-auto min-w-[94px] tablet:w-[102px] tablet:min-w-[102px] xl:w-[120px] xl:min-w-[144px]"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
