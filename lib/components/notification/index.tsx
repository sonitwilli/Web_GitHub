import { useEffect, useState } from 'react';
import { FaRegBell } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';
import { trackingEnterFuncLog16 } from '@/lib/tracking/trackingCommon';
import { trackingStoreKey } from '@/lib/constant/tracking';
import { useNetwork } from '../contexts/NetworkProvider';
import { ERROR_CONNECTION } from '@/lib/constant/texts';
import { DEFAULT_ERROR_MSG } from '@/lib/constant/texts';
import { showToast } from '@/lib/utils/globalToast';

const DropdownNoti = dynamic(() => import('./DropdownNoti'), {
  ssr: false,
  loading: () => null,
});

export default function Notification() {
  const [open, setOpen] = useState(false);
  const [allRead, setAllRead] = useState(false);

  const { isLogged } = useAppSelector((state) => state.user);
  const { isOffline } = useNetwork();
  const dispatch = useAppDispatch();

  const handleClick = () => {
    if (isOffline) {
      showToast({
        title: ERROR_CONNECTION,
        desc: DEFAULT_ERROR_MSG,
      });
      return;
    }
    if (isLogged) {
      setOpen(!open);
      trackingEnterFuncLog16('EnterNotification');
    } else {
      sessionStorage.setItem(trackingStoreKey.OPEN_NOTIFICATION_BELL, 'true');
      dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
    }
  };

  useEffect(() => {
    if (isOffline && open) {
      setOpen(false);
      setAllRead(true); // Reset notification state when offline
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOffline]);

  useEffect(() => {
    if (isLogged) {
      const isOpenBefore = sessionStorage.getItem(
        trackingStoreKey.OPEN_NOTIFICATION_BELL,
      );
      if (isOpenBefore) {
        setOpen(true);
        sessionStorage.removeItem(trackingStoreKey.OPEN_NOTIFICATION_BELL);
      }
    }
  }, [isLogged]);

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        className="cursor-pointer"
        id="notification-bell-button"
      >
        <div className="relative cursor-pointer w-fit">
          <FaRegBell
            className={`h-[24px] w-[24px] transition-colors duration-200 ${
              open ? 'fill-fpl' : 'fill-white'
            } hover:fill-fpl`}
          />
          {!allRead && (
            <div className="absolute w-[6px] h-[6px] bg-scarlet rounded-full top-[5px] left-[58.33%]" />
          )}
        </div>
      </div>

      {open && isLogged && (
        <DropdownNoti
          onClose={() => setOpen(false)}
          onAllRead={(isAllRead) => setAllRead(isAllRead)}
        />
      )}
    </div>
  );
}
