import React, { useContext } from 'react';
import { AppContext } from '@/lib/components/container/AppContainer';
import styles from './DownloadApp.module.css';
import { RiMobileDownloadLine } from 'react-icons/ri';

const DownloadApp = () => {
  const appCtx = useContext(AppContext);

  const { configs } = appCtx;
  const { download_config } = configs || {};
  return (
    <div className={`${styles.downloadApp} relative`}>
      <RiMobileDownloadLine className="fill-white h-[24px] w-[24px] hover:cursor-pointer hover:fill-fpl" />

      {download_config && (
        <div
          className={`${styles.dropdown} 
          hidden border-1 border-charleston-green absolute left-1/2 -translate-x-1/2 top-[calc(100%+28px)] bg-eerie-black rounded-[20px] p-[32px] flex-col w-[284px] items-center opacity-0 z-[-1] shadow-2xs`}
        >
          {download_config?.title && (
            <p className="mb-[8px] font-[600] text-[18px] text-white-smoke text-center">
              {download_config?.title}
            </p>
          )}
          {download_config?.description && (
            <p className="mb-[24px] text-spanish-gray text-[14px] text-center">
              {download_config?.description}
            </p>
          )}
          {download_config?.qr_url && (
            <img
              src={download_config?.qr_url}
              alt={download_config.title || 'download app'}
              width={128}
              className="w-[128px] min-w-[128px"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DownloadApp;
