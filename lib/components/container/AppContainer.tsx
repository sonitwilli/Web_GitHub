import { createContext, useEffect, useState } from 'react';
import { ConfigDataType, getConfigs } from '@/lib/api/main';
import { getMenus, MenuItem } from '@/lib/api/menu';
import { setCookie } from 'cookies-next';
import {
  BLOCK_PAGE_SIZE,
  MOUSE_CLIENT_X,
  MOUSE_CLIENT_Y,
  TOKEN,
} from '@/lib/constant/texts';
import { RootState, useAppDispatch, useAppSelector } from '@/lib/store';
import { changeIsLogged } from '@/lib/store/slices/userSlice';
import {
  changeConfigs,
  changeInteracted,
  changeMessageConfigs,
  changeTimeOpenModalRequireLogin,
} from '@/lib/store/slices/appSlice';
import { closeLoginModal } from '@/lib/store/slices/loginSlice';
import { resetBroadcastSchedule } from '@/lib/store/slices/broadcastScheduleSlice';
import useMenu from '@/lib/hooks/useMenu';
import { useCheckUserInfo } from '@/lib/hooks/useCheckUserInfo';
import { useFullscreenListener } from '@/lib/hooks/useFullscreenListener';
import { BlockItemType, BlockSlideItemType } from '@/lib/api/blocks';
import { useRouter } from 'next/router';
import { trackingStoreKey } from '@/lib/constant/tracking';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { trackingErrorLog17 } from '@/lib/tracking/trackingCommon';
import { handleDeepLink } from '@/lib/utils/deepLinkHandler';
import { getMessageConfigs } from '@/lib/api/app';
import { handleClearStrorage } from '@/utils/common/handleClearStrorage';
import useTabActivity from '@/lib/hooks/useTabActivity';
const Chatbot = dynamic(() => import('@/lib/components/chatbot/Chatbot'), {
  ssr: false,
});
const MqttContainer = dynamic(
  () => import('@/lib/components/container/MqttContainer'),
  {
    ssr: false,
  },
);
interface AppContextType {
  name?: string;
  configs?: ConfigDataType;
  checkLoginComplete?: boolean;
  menus?: MenuItem[];
  hoveredBlock?: BlockItemType;
  hoveredSlide?: BlockSlideItemType;
  setHoveredBlock?: (block: BlockItemType) => void;
  setHoveredSlide?: (sl: BlockSlideItemType) => void;
}
export const AppContext = createContext<AppContextType>({ name: '' });
interface Props {
  children: React.ReactNode;
}
export default function AppContainer({ children }: Props) {
  useTabActivity();
  useFullscreenListener();
  const { timeOpenModalRequireLogin } = useAppSelector((s) => s.app);
  const router = useRouter();
  const [hoveredBlock, setHoveredBlock] = useState<BlockItemType>();
  const [hoveredSlide, setHoveredSlide] = useState<BlockSlideItemType>();
  const { checkSelectedMenuOnRefresh } = useMenu();
  const [configs, setConfigs] = useState<ConfigDataType>({});
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const dispatch = useAppDispatch();
  const { interacted } = useAppSelector((state) => state.app);
  const { info } = useAppSelector((s) => s.user);
  const { errorCodeResult } = useSelector(
    (state: RootState) => state.loginFlow,
  );
  const { checkUserInfo, checkLoginComplete } = useCheckUserInfo();

  const checkLogin = () => {
    if (localStorage && localStorage?.getItem(TOKEN)) {
      dispatch(changeIsLogged(true));
    }
  };
  const handleGetMsgConfigs = async () => {
    try {
      const res = await getMessageConfigs();
      dispatch(changeMessageConfigs(res?.data?.data || {}));
    } catch {}
  };

  const handleGetConfigs = async () => {
    try {
      const res = await getConfigs();
      setConfigs(res?.data?.data || {});
      dispatch(changeConfigs(res?.data?.data || {}));
      setCookie(BLOCK_PAGE_SIZE, res?.data?.data?.number_item_of_page || '31');
      if (res?.data && res?.data?.data && res.data.data.expire_welcome) {
        setCookie('expire_welcome', res.data.data.expire_welcome, {
          path: '/',
          maxAge: 3600 * 24 * 7,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      trackingErrorLog17({
        Event: 'Error',
        ErrCode: error?.code,
        ErrMessage: error?.message,
        Url: error?.config?.url || '',
      });
    }
  };
  const handleGetMenus = async () => {
    try {
      const res = await getMenus();
      setMenus(res?.data?.data || []);
      const menusJsonString = JSON.stringify(res?.data?.data || []);
      localStorage.setItem(trackingStoreKey.NAVBAR_LIST, menusJsonString);
    } catch {}
  };

  const setUserInteraction = () => {
    if (!interacted) {
      dispatch(changeInteracted(true));
    }
  };

  const checkUserInteraction = () => {
    try {
      document.addEventListener('mousedown', setUserInteraction);
      document.addEventListener('touchstart', setUserInteraction);
      document.addEventListener('keyup', setUserInteraction);
    } catch {}
  };

  const removeUserInteraction = () => {
    try {
      document.removeEventListener('mousedown', setUserInteraction);
      document.removeEventListener('touchstart', setUserInteraction);
      document.removeEventListener('keyup', setUserInteraction);
    } catch {}
  };

  useEffect(() => {
    if (router) {
      if (timeOpenModalRequireLogin) {
        dispatch(changeTimeOpenModalRequireLogin(0));
      }

      // handle deepLink with router info for better accuracy
      handleDeepLink({ router });
      // handle clear storage
      handleClearStrorage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (router.isReady) {
      checkSelectedMenuOnRefresh({ menus: menus });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, menus]);

  useEffect(() => {
    checkUserInfo();
    checkLogin();
    handleGetConfigs();
    handleGetMsgConfigs();
    handleGetMenus();
    checkUserInteraction();

    document.addEventListener('mousemove', (event: MouseEvent) => {
      const { clientX, clientY } = event;
      localStorage.setItem(MOUSE_CLIENT_X, clientX.toString());
      localStorage.setItem(MOUSE_CLIENT_Y, clientY.toString());
    });

    return () => {
      removeUserInteraction();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log('--- APP: ', '19:20-15:08');
    const handleRouteChange = (url: string) => {
      if (!errorCodeResult) {
        dispatch(closeLoginModal());
      }

      // Clear broadcast schedule store
      if (
        router.pathname.includes('xem-truyen-hinh') &&
        !url.includes('xem-truyen-hinh')
      ) {
        dispatch(resetBroadcastSchedule());
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider
      value={{
        configs,
        name: 'NVM',
        checkLoginComplete,
        menus,
        hoveredBlock,
        setHoveredBlock,
        hoveredSlide,
        setHoveredSlide,
      }}
    >
      <MqttContainer />
      {children}
      {info?.chatbot === '1' ? <Chatbot /> : ''}
    </AppContext.Provider>
  );
}
