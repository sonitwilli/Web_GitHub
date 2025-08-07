import {
  Commands,
  LivechatMethods,
} from '@/lib/utils/sdkMethodHandlers/livechatMethods';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/store';
import {
  setLiveChatHeight,
  resetDeleteConfirmationResult,
  closeReportModal,
} from '@/lib/store/slices/liveChatSlice';
import LiveChatConfirmModal from './LiveChatConfirmModal';
import LiveChatWarningModal from './LiveChatWarningModal';
import ModalReportChat from '@/lib/components/modal/ModalReportChat';
import { usePlayerPageContext } from '../player/context/PlayerPageContext';
import { useDownloadBarControl } from '@/lib/hooks/useDownloadBarControl';

// interface ReportDataItem {
//   id: number
//   title: string
//   action?: string
//   selected?: string
// }

// interface ReportData {
//   title?: string
//   data?: ReportDataItem[]
// }

interface RealtimeChatMegaProps {
  roomId: string;
  open?: boolean;
  isMobileChat?: boolean;
  isRequiredLogin?: boolean;
  type?: 'event' | 'vod';
}

interface postMessageProps {
  type?: number;
  id?: string;
  result?: unknown;
  args?: unknown[];
  error?: {
    code?: number;
    message?: string;
    detail?: string;
  };
}

const RealtimeChatMega: React.FC<RealtimeChatMegaProps> = ({
  roomId,
  type = 'event',
  open = false,
  isRequiredLogin = false,
}) => {
  const { portalTarget } = usePlayerPageContext();
  const { hideBar, showBar } = useDownloadBarControl();
  // Track initial render to avoid hiding download bar on first mount
  const isFirstRender = useRef(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [linkIframe, setLinkIframe] = useState<string | undefined>(undefined);
  // const [reportData, setReportData] = useState<ReportData>({})
  // const [reportType, setReportType] = useState<string>('')
  // const [modalOpen, setModalOpen] = useState<boolean>(false)

  // Example: Replace with your actual user logic
  const currentUserDirectly =
    typeof window !== 'undefined' ? localStorage.getItem('user') : null;

  const { height, deleteConfirmationResult, reportModal } = useAppSelector(
    (state) => state.liveChat,
  );
  const dispatch = useAppDispatch();

  // Post message to iframe
  const postMessage = useCallback((msg: postMessageProps) => {
    const iframe = iframeRef.current;
    iframe?.contentWindow?.postMessage(msg, '*');
  }, []);

  useEffect(() => {
    if (deleteConfirmationResult?.metadata) {
      const metadata = deleteConfirmationResult.metadata;
      const action = metadata?.data?.[0]?.action;

      if (action) {
        postMessage({
          type: 3, // Event
          id: 'action',
          args: [metadata],
        });
      }
      dispatch(resetDeleteConfirmationResult());
    }
  }, [deleteConfirmationResult, dispatch, postMessage]);

  // Handle messages from iframe
  const handleMessage = useCallback(
    async (event: MessageEvent) => {
      const { data } = event;
      switch (data.type) {
        case 1: // Request (Plugin gọi method)
          if (
            typeof data.command === 'string' &&
            Object.prototype.hasOwnProperty.call(Commands, data.command)
          ) {
            try {
              const commandFn = Commands[
                data.command as keyof LivechatMethods
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ] as any;
              const args = data.args ?? [];
              const result = await commandFn(...args);

              postMessage({
                type: 2,
                id: data.id,
                result,
              });
            } catch (msg) {
              postMessage({
                type: 2,
                id: data.id,
                result: null,
                error: {
                  code: 0,
                  message: msg as string,
                  detail: msg as string,
                },
              });
            }
          } else {
            postMessage({
              type: 2,
              id: data.id,
              result: null,
              error: {
                code: 0,
                message: 'has no command data',
                detail: 'has no command data',
              },
            });
          }
          break;

        case 2: // Response (Plugin trả về response)
          break;
        case 3: // Event (Plugin bắn sự kiện)
          break;
        default:
          break;
      }
    },
    [postMessage],
  );

  // Report modal state/handlers
  const [selectedReportOption, setSelectedReportOption] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (reportModal.isOpen) {
      setSelectedReportOption(undefined);
    }
  }, [reportModal.isOpen]);

  const handleReportSubmit = () => {
    if (!selectedReportOption || !reportModal.metadata) return;
    // Gửi report về backend hoặc postMessage tới iframe
    const selected = reportModal.metadata.data?.find(
      (item) => String(item.id) === selectedReportOption,
    );
    if (selected) {
      // Ví dụ: gửi action về iframe
      postMessage({
        type: 3,
        id: 'action',
        args: [
          { ...reportModal.metadata, data: [{ ...selected, selected: '1' }] },
        ],
      });
    }
    dispatch(closeReportModal());
  };

  useEffect(() => {
    if (!currentUserDirectly) {
      if (isRequiredLogin) return;
    }
    const liveChatIFrameUrl = `${process.env.NEXT_LIVE_CHAT_URL}?roomId=${roomId}&type=${type}&theme=dark`;
    // const liveChatIFrameUrl = `http://localhost:5173?roomId=${
    //   roomId || '6818908a505feb6b88a033e6'
    // }&type=${type}&theme=dark`;
    setLinkIframe(liveChatIFrameUrl);
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      dispatch(setLiveChatHeight(0));
    };
  }, [
    currentUserDirectly,
    roomId,
    handleMessage,
    isRequiredLogin,
    type,
    dispatch,
  ]);
  const { isFullscreen } = useAppSelector((s) => s.player);

  // Hide download bar when live chat is visible
  useEffect(() => {
    if (isFirstRender.current) {
      // Skip initial mount
      isFirstRender.current = false;
      return;
    }
    if (!open) {
      hideBar();
    } else {
      showBar();
    }
    return () => {
      showBar();
    };
  }, [open, hideBar, showBar]);

  // Render
  return (
    <div
      id="realtime-chat"
      className={`relative w-full bg-smoky-black overflow-hidden${
        open ? ' hidden' : ''
      }${type === 'vod' ? ` h-[${height}px]` : ' h-full'}${
        isFullscreen || type === 'vod'
          ? ' border-none'
          : ' border-1 rounded-none sm:rounded-[16px] border-charleston-green'
      }`}
      style={height && type === 'vod' ? { height: `${height}px` } : undefined}
    >
      <div className="h-full w-full">
        <iframe
          ref={iframeRef}
          className="iframe"
          src={linkIframe}
          width="100%"
          height="100%"
        />
      </div>
      <LiveChatConfirmModal portalTarget={portalTarget} />
      <LiveChatWarningModal portalTarget={portalTarget} />
      <ModalReportChat
        open={reportModal.isOpen}
        onHidden={() => dispatch(closeReportModal())}
        onCancel={() => dispatch(closeReportModal())}
        onSubmit={handleReportSubmit}
        title={reportModal.metadata?.title}
        options={
          reportModal.metadata?.data?.map((item) => ({
            value: String(item.id),
            label: item.title || '',
          })) || []
        }
        selectedOption={selectedReportOption}
        onSelectOption={setSelectedReportOption}
        portalTarget={portalTarget}
      />
    </div>
  );
};

export default RealtimeChatMega;
