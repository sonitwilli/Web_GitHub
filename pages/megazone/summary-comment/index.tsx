import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  submitEvaluation,
  getFeedbackList,
  getReviewSummary,
  EvaluateRequestParams,
  FeedbackItem,
} from '@/lib/api/evaluate';
import Header from '@/lib/components/summary/Header';
import Tabs from '@/lib/components/summary/Tabs';
import FeedbackForm from '@/lib/components/summary/FeedbackForm';
import ErrorState from '@/lib/components/summary/ErrorState';
import SubmitButton from '@/lib/components/summary/SubmitButton';
import { setWithExpiry, getWithExpiry } from '@/utils/common/expired';
import { loadJsScript } from '@/lib/utils/methods';
import SpinnerLoading from '@/lib/components/common/Loading';
import SummaryLayout from '@/lib/layouts/Summary';

type RouteBred = 'default' | 'recommend' | 'error';

interface Message {
  text: string;
  loading: boolean;
}

interface Tab {
  title?: string;
  html?: string;
  overview?: string;
}

declare global {
  interface Window {
    sdk?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      emit: (event: string, data: any) => void;
      getUserInfo: () => Promise<{ profile_id?: string; profileId?: string }>;
      requestLogin: () => void;
      destroy: () => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      openPopup: (type: string, data: any) => void;
    };
    waitForSdk?: () => Promise<void>;
  }
}
export {};

const SummaryCommentPage: React.FC = () => {
  const router = useRouter();
  const toggleElementRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIconLoaded, setIsIconLoaded] = useState(false);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [listReports, setListReports] = useState<FeedbackItem[]>([]);
  const [isReport, setIsReport] = useState(false);
  const [routeBred, setRouteBred] = useState<RouteBred>('default');
  const [idSelected, setIdSelected] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [idClient, setIdClient] = useState<string | null>(null);
  const [idMovie, setIdMovie] = useState<string | null>(null);
  const [isHint, setIsHint] = useState(false);
  const [isInitSdk, setIsInitSdk] = useState(false);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isElementSmall, setIsElementSmall] = useState(false);
  const [initialHeight, setInitialHeight] = useState(0);
  const [showButtonInitially, setShowButtonInitially] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [isTabletOrDesktop, setIsTabletOrDesktop] = useState(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const keyboardCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTextareaFocusedRef = useRef(isTextareaFocused);
  const showButtonInitiallyRef = useRef(showButtonInitially);

  // Helper function để stop typing effect
  const stopTypingEffect = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    isTypingRef.current = false;
  };

  // Helper function để check và update isActived
  const updateIsActivedIfNeeded = async (tabIndex: number) => {
    const currentIsActived = (await getWithExpiry('isActived')) || [];

    if (currentIsActived.length < 3) {
      const newIsActived = [...currentIsActived, tabIndex];
      setWithExpiry('isActived', newIsActived, 7200 * 1000);
      return true;
    }

    return false;
  };

  // Helper function để determine first-load value
  const getFirstLoadValue = async () => {
    const currentIsActived = (await getWithExpiry('isActived')) || [];
    const firstLoadValue = currentIsActived.length >= 2 ? '0' : '1';

    return firstLoadValue;
  };

  // Update refs when state changes
  useEffect(() => {
    isTextareaFocusedRef.current = isTextareaFocused;
  }, [isTextareaFocused]);

  useEffect(() => {
    showButtonInitiallyRef.current = showButtonInitially;
  }, [showButtonInitially]);

  // Initial screen size check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkScreenSize();
    }
  }, []);

  // Computed values
  const characterCount = text?.length || 0;
  // Show button when in recommend mode and keyboard is not visible
  // Keyboard detection and textarea focus always have highest priority
  // On tablet/desktop, button is always shown in recommend mode
  const isButton =
    routeBred === 'recommend' &&
    !isKeyboardVisible && // Keyboard always takes priority
    !isTextareaFocused && // Hide immediately when textarea is focused
    (showButtonInitially || !isElementSmall);
  const isDisabled =
    (!text?.trim() && !idSelected) ||
    (characterCount > 1000 && idSelected) ||
    (!idSelected && characterCount > 1000) ||
    (!idSelected && characterCount === 0);

  const loadSandboxInit = () => {
    const sdkIntegration = '/js/sandbox/sandbox-init.js';
    loadJsScript({
      id: 'sandbox_init_sdk',
      src: sdkIntegration,
      cb: () => {
        setIsInitSdk(true);
      },
    });
  };

  const loadSandboxSdk = () => {
    const sdkIntegration = '/js/sandbox/sandbox.js';
    loadJsScript({
      id: 'sandbox_sdk',
      src: sdkIntegration,
      cb: () => {
        setIsSdkLoaded(true);
      },
    });
  };

  useEffect(() => {
    loadSandboxInit();
  }, []);

  useEffect(() => {
    if (isInitSdk) {
      loadSandboxSdk();
    }
  }, [isInitSdk]);

  useEffect(() => {
    if (!router.isReady) return;
    const initializePage = async () => {
      const idVod = (router.query['id-vod'] as string) || '';
      setIdMovie(idVod);
      setInitialHeight(window.innerHeight);

      checkElementHeight();
      checkScreenSize(); // Check initial screen size
      window.addEventListener('resize', checkKeyboardAndHeight);
      window.addEventListener('click', handleClickOutside);

      const body = document.querySelector('body');
      if (body) body.classList.add('no-scroll');

      window.addEventListener('resize', () => {
        const el = document.querySelector(
          '.auto-expand',
        ) as HTMLTextAreaElement;
        if (el) adjustHeight(el);
      });
    };

    initializePage();

    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('resize', checkKeyboardAndHeight);
      // Cleanup keyboard check timeout
      if (keyboardCheckTimeoutRef.current) {
        clearTimeout(keyboardCheckTimeoutRef.current);
      }
      // Stop typing effect khi component unmount
      stopTypingEffect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query, router.isReady]);

  useEffect(() => {
    if (!isSdkLoaded) return;
    console.log(11111111111111, idMovie);
    const getUserInfo = async () => {
      if (typeof window !== 'undefined') {
        try {
          await window?.waitForSdk?.();
          setIsIconLoaded(true);
          window?.sdk?.emit('loadSuccess', { success: true });
          const { profile_id, profileId } =
            (await window?.sdk?.getUserInfo?.()) || {};
          const id = profile_id || profileId || '';
          setIdClient(id);
          if (id && idMovie) {
            // Set tab đầu tiên làm active tab mặc định
            setActiveTab(0);
            fetchDataMessage(id);
          } else if (!id) {
            window?.sdk?.requestLogin?.();
          }
        } catch (error) {
          console.error('Lỗi tải dữ liệu:', error);
          window?.sdk?.requestLogin?.();
        }
      }
    };
    getUserInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSdkLoaded, idMovie]);

  useEffect(() => {
    if (!router.isReady || !router.query || !isSdkLoaded) return;
    console.log(22222222222222);
    const handleActiveTabChange = async () => {
      // Stop typing effect khi chuyển tab để bắt đầu typing mới
      console.log('Stopping typing effect when switching to tab:', activeTab);
      const isActivedTab = await getWithExpiry('isActived');
      stopTypingEffect();

      setMessages([]);
      setIsHint(false);

      // Cập nhật isActived với activeTab hiện tại (nếu chưa có và < 3)
      await updateIsActivedIfNeeded(activeTab);

      // Nếu có tabs và có nội dung cho tab này
      if (
        tabs.length > 0 &&
        tabs[activeTab]?.html &&
        isActivedTab &&
        isActivedTab.length < 2
      ) {
        // Luôn sử dụng typing effect cho nội dung của activeTab
        console.log('Using typing effect for active tab:', activeTab);
        typingEffect(tabs[activeTab].html, 1);
        return;
      }

      // Nếu chưa có data, fetch data như cũ
      const isAct = await getWithExpiry('isActived');
      if (!isAct || !isAct.includes(activeTab)) {
        handleDataHistory(activeTab);
      }
      if (activeTab > -1) {
        setTimeout(() => {
          fetchDataMessage(idClient || '');
        }, 0);
      }
    };

    if (activeTab > -1) {
      handleActiveTabChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query, router.isReady, activeTab]);

  const typingEffect = (text: string, speed: number) => {
    // Nếu hiệu ứng typing đang chạy, không bắt đầu hiệu ứng mới
    if (isTypingRef.current) return;

    isTypingRef.current = true;
    const response: Message = { text: '', loading: false };
    setMessages([response]);
    setIsReport(false);

    let i = 0;

    // Hủy interval cũ nếu có
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current as NodeJS.Timeout);
    }

    typingIntervalRef.current = setInterval(() => {
      if (i < text.length) {
        response.text += text[i];
        setMessages([{ ...response }]);
        i++;
      } else {
        clearInterval(typingIntervalRef.current as NodeJS.Timeout);
        typingIntervalRef.current = null;
        isTypingRef.current = false;
        setIsReport(true);
      }
    }, speed);
  };

  const handleBackToDefault = () => {
    // Stop typing effect khi quay về default
    stopTypingEffect();

    setRouteBred('default');
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '80px';
    }
    setIdSelected(null);
    setText('');
    // Reset button initial state
    setShowButtonInitially(false);
    setIsTextareaFocused(false);
  };

  const toggle = () => {
    setIsHint(!isHint);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (hintRef.current && !hintRef.current.contains(event.target as Node)) {
      setIsHint(false);
    }
  };

  const checkKeyboardAndHeight = () => {
    // Clear previous timeout
    if (keyboardCheckTimeoutRef.current) {
      clearTimeout(keyboardCheckTimeoutRef.current);
    }

    // Debounce keyboard detection to avoid flickering
    keyboardCheckTimeoutRef.current = setTimeout(() => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialHeight - currentHeight;

      // More sensitive keyboard detection
      // Check if height decreased by more than 150px or more than 25% of initial height
      const isKeyboardOpen =
        heightDifference > 150 || currentHeight < initialHeight * 0.75;

      // Additional check using visual viewport API if available
      if (typeof window !== 'undefined' && window.visualViewport) {
        const visualViewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        // If visual viewport is significantly smaller than window height, keyboard is open
        const isKeyboardOpenVV = visualViewportHeight < windowHeight * 0.85;
        const finalKeyboardState = isKeyboardOpen || isKeyboardOpenVV;
        setIsKeyboardVisible(finalKeyboardState);

        // Reset showButtonInitially when keyboard appears
        if (finalKeyboardState && showButtonInitiallyRef.current) {
          setShowButtonInitially(false);
        }

        // Set isTextareaFocused to false when keyboard hides
        if (!finalKeyboardState && isTextareaFocusedRef.current) {
          setIsTextareaFocused(false);
        }
      } else {
        setIsKeyboardVisible(isKeyboardOpen);

        // Reset showButtonInitially when keyboard appears
        if (isKeyboardOpen && showButtonInitiallyRef.current) {
          setShowButtonInitially(false);
        }

        // Set isTextareaFocused to false when keyboard hides
        if (!isKeyboardOpen && isTextareaFocusedRef.current) {
          setIsTextareaFocused(false);
        }
      }

      checkElementHeight();
      checkScreenSize(); // Check screen size on resize

      // Debug logging (you can remove this in production)
      // console.log('Keyboard detection:', {
      //   initialHeight,
      //   currentHeight,
      //   heightDifference,
      //   isKeyboardOpen,
      //   visualViewportHeight: window.visualViewport?.height,
      // });
    }, 100); // 100ms debounce
  };

  const checkElementHeight = () => {
    const elementHeight = toggleElementRef.current?.offsetHeight || 0;
    setIsElementSmall(elementHeight < 360);
  };

  const checkScreenSize = () => {
    const isTablet = window.innerWidth >= 768; // 768px is tablet breakpoint
    setIsTabletOrDesktop(isTablet);
  };

  const handleDataHistory = async (val: number) => {
    const queryTemp = router.query;

    // Cập nhật isActived nếu cần thiết
    await updateIsActivedIfNeeded(val);

    // Determine first-load value dựa trên isActived length
    const firstLoadValue = await getFirstLoadValue();

    router.push({
      pathname: '/megazone/summary-comment',
      query: {
        ...queryTemp,
        'first-load': firstLoadValue,
      },
    });
  };

  const sendMsgSdk = () => {
    if (typeof window !== 'undefined' && window.sdk) {
      if (routeBred !== 'error') {
        window.sdk.emit('textUpdate', {
          text: tabs?.[0]?.overview,
        });
      }
      setTimeout(() => {
        window?.sdk?.destroy?.();
      }, 0);
    }
  };

  const adjustHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
    handleScroll();
  };

  const handleReport = () => {
    handleNetworkAwareAction(fetchDataReport);
  };

  const fetchDataReport = async () => {
    try {
      const response = await getFeedbackList(idClient || '04599395');
      if (!response.data?.data && typeof window !== 'undefined' && window.sdk) {
        window?.sdk?.openPopup?.('toast', {
          title: '',
          info: {
            userId: '',
            msgUid: '',
          },
          data: [
            {
              id: 1,
              type: 'toast-fail',
              title: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
              icon: '',
              button: '',
              action: '',
            },
          ],
        });
        return;
      }

      const { data } = response.data;
      setListReports(data || []);
      setRouteBred('recommend');
      // Show button initially when entering recommend mode
      setShowButtonInitially(true);
    } catch (error) {
      if (typeof window !== 'undefined' && window.sdk) {
        window?.sdk?.openPopup?.('toast', {
          title: '',
          info: {
            userId: '',
            msgUid: '',
          },
          data: [
            {
              id: 1,
              type: 'toast-fail',
              title: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
              icon: '',
              button: '',
              action: '',
            },
          ],
        });
      }
      console.error('Lỗi tải dữ liệu:', error);
    }
  };

  const limitText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    adjustHeight(event.target);
    // Hide button initially when user starts typing (let normal keyboard detection take over)
    if (showButtonInitially) {
      setShowButtonInitially(false);
    }
  };

  const handleTextareaFocus = () => {
    setIsTextareaFocused(true);
    // Also hide showButtonInitially when focusing
    if (showButtonInitially) {
      setShowButtonInitially(false);
    }
  };

  const handleTextareaBlur = () => {
    setIsTextareaFocused(false);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      scrollToBottom();
    }
  };

  const handleNetworkAwareAction = (action: () => void) => {
    if (!navigator.onLine) {
      window?.sdk?.openPopup?.('warning', {
        title: 'Thông báo',
        info: {
          userId: '',
          msgUid: '',
        },
        data: [
          {
            id: '',
            type: '',
            title: 'Bạn vui lòng kiểm tra lại tín hiệu mạng',
            icon: '',
            button: 'Đóng',
            action: '',
          },
        ],
      });
      return;
    }
    action();
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  };

  const fetchDataMessage = async (id: string) => {
    try {
      setLoading(true);
      const tabs = await getWithExpiry('tabsSum');
      const isActivedTab = await getWithExpiry('isActived');
      const firstLoad = (router.query['first-load'] as string) || '1';
      const activeTabIndex = (activeTab <= -1) ? 0 : activeTab;

      if ((tabs !== null && firstLoad === '0') || isActivedTab.length >= 2) {
        setTabs(tabs);
        setLoading(false);
        setMessages([
          { text: tabs[activeTabIndex].html || '', loading: false },
        ]);
        return;
      }

      const response = await getReviewSummary(
        idMovie || '66602be641c614baf84c91ba',
        id || idClient || '04599395',
      );

      if (!response.data?.data) {
        setRouteBred('error');
        return;
      }

      const { status, data } = response.data;

      if (status === 'success') {
        const { external, internal } = data;
        let newTabs: Tab[] = [];

        if (internal) {
          newTabs = [internal];
        }
        if (external) {
          newTabs = [external];
        }
        if (internal && external) {
          newTabs = [internal, external];
        }

        setTabs(newTabs);
        setWithExpiry('tabsSum', newTabs, 7200 * 1000);
        setLoading(false);

        // Luôn sử dụng typing effect cho fresh API content

        if (router.query['first-load'] === '1') {
          console.log('first load', router.query['first-load']);
          
          typingEffect(newTabs[activeTabIndex]?.html || '', 1);
        } else {
          console.log('first load 2', router.query['first-load']);

          setMessages([{ text: newTabs[activeTabIndex]?.html || '', loading: false }]);
        }
      } else {
        setLoading(false);
        setRouteBred('error');
        console.error('Lỗi tải dữ liệu:', response);
      }
    } catch (error) {
      setLoading(false);
      setRouteBred('error');
      console.error('Lỗi tải dữ liệu:', error);
    }
  };

  const handleTryAgain = () => {
    setRouteBred('default');
    handleNetworkAwareAction(() => fetchDataMessage(idClient || ''));
  };

  const handleSendReport = () => {
    handleNetworkAwareAction(sendReport);
  };

  const sendReport = async () => {
    try {
      const params: EvaluateRequestParams = {
        vod_id: idMovie || 'abcxyz',
        feedback_id: idSelected || '',
        user_opinion: text?.trim(),
      };

      const response = await submitEvaluation(params, idClient || '04599395');

      if (!response.data?.data) {
        setRouteBred('error');
        return;
      }

      const { status, message } = response.data;

      if (status === 'success') {
        setLoading(false);
        setRouteBred('default');
        if (typeof window !== 'undefined' && window.sdk) {
          window?.sdk?.openPopup?.('toast', {
            title: '',
            info: {
              userId: '',
              msgUid: '',
            },
            data: [
              {
                id: 1,
                type: 'toast-success',
                title: message || 'Cảm ơn bạn đã phản hồi',
                icon: '',
                button: '',
                action: '',
              },
            ],
          });
        }
        setIdSelected(null);
        setText('');
        setShowButtonInitially(false);
        setIsTextareaFocused(false);
        if (textAreaRef.current) {
          textAreaRef.current.style.height = '80px';
        }
      } else {
        setLoading(false);
        setRouteBred('default');
        if (typeof window !== 'undefined' && window.sdk) {
          window?.sdk?.openPopup?.('toast', {
            title: '',
            info: {
              userId: '',
              msgUid: '',
            },
            data: [
              {
                id: 1,
                type: 'toast-fail',
                title: message || 'Đã có lỗi xảy ra, vui lòng thử lại sau',
                icon: '',
                button: '',
                action: '',
              },
            ],
          });
        }
        setIdSelected(null);
        setText('');
        setShowButtonInitially(false);
        setIsTextareaFocused(false);
        if (textAreaRef.current) {
          textAreaRef.current.style.height = '80px';
        }
      }
    } catch (error) {
      setLoading(false);
      setRouteBred('default');
      if (typeof window !== 'undefined' && window.sdk) {
        window?.sdk?.openPopup?.('toast', {
          title: '',
          info: {
            userId: '',
            msgUid: '',
          },
          data: [
            {
              id: 1,
              type: 'toast-fail',
              title: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
              icon: '',
              button: '',
              action: '',
            },
          ],
        });
      }
      setIdSelected(null);
      setText('');
      setShowButtonInitially(false);
      if (textAreaRef.current) {
        textAreaRef.current.style.height = '80px';
      }
      console.error('Lỗi tải dữ liệu:', error);
    }
  };

  if (!isSdkLoaded) {
    return (
      <SummaryLayout>
        <div className="flex justify-center items-center h-screen">
          <SpinnerLoading />
        </div>
      </SummaryLayout>
    );
  }

  return (
    <SummaryLayout
      toggleElementRef={toggleElementRef as React.RefObject<HTMLDivElement>}
    >
      {routeBred === 'default' && (
        <>
          <Header
            isIconLoaded={isIconLoaded}
            isHint={isHint}
            hintRef={hintRef as React.RefObject<HTMLDivElement>}
            onToggle={toggle}
            onClose={sendMsgSdk}
          />
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            loading={loading}
            messages={messages}
            isReport={isReport}
            routeBred={routeBred}
            onReport={handleReport}
          />
        </>
      )}

      {routeBred === 'recommend' && (
        <>
          <Header
            isIconLoaded={isIconLoaded}
            isBack={true}
            onBack={handleBackToDefault}
            onClose={sendMsgSdk}
          />
          <FeedbackForm
            listReports={listReports}
            idSelected={idSelected}
            onIdSelectedChange={setIdSelected}
            text={text}
            onTextChange={limitText}
            textAreaRef={textAreaRef as React.RefObject<HTMLTextAreaElement>}
            characterCount={characterCount}
            scrollContainerRef={
              scrollContainerRef as React.RefObject<HTMLDivElement>
            }
            isButton={isButton}
            onTextareaFocus={handleTextareaFocus}
            onTextareaBlur={handleTextareaBlur}
          />
        </>
      )}

      {routeBred === 'error' && (
        <>
          <Header
            isIconLoaded={isIconLoaded}
            isHint={isHint}
            hintRef={hintRef as React.RefObject<HTMLDivElement>}
            onToggle={toggle}
            onClose={sendMsgSdk}
          />
          <ErrorState onTryAgain={handleTryAgain} />
        </>
      )}

      {(isButton || (isTabletOrDesktop && routeBred === 'recommend')) && (
        <SubmitButton
          isDisabled={isDisabled as boolean}
          onSendReport={handleSendReport}
        />
      )}
    </SummaryLayout>
  );
};

export default SummaryCommentPage;
