import { TITLE_LOGIN_FAILED } from '@/lib/constant/errors';
import {
  LOGIN_ERROR_MESSAGE,
  RETRY_BUTTON_TEXT,
  EXIT_BUTTON_TEXT,
} from '@/lib/constant/texts';

type Props = {
  isOpen: boolean;
  contentObject: {
    title?: string;
    content?: string;
    buttons?: {
      accept?: string;
    };
    action_callback?: boolean;
  };
  onClose: () => void;
  onCallBack: () => void;
};

export default function NotificationModal({
  isOpen,
  contentObject,
  onClose,
  onCallBack,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-1/2 left-1/2 z-[1002] w-[320px] tablet:w-[400px] -translate-x-1/2 -translate-y-1/2 transform rounded-[16px] shadow-lg bg-eerie-black">
      <div className="p-[24px] tablet:p-[32px]">
        <h1
          className={`text-[20px] mb-4 tablet:text-2xl text-center font-semibold text-smoke-white`}
        >
          {contentObject.title || TITLE_LOGIN_FAILED}
        </h1>

        <p className="mb-8 text-center text-[16px] text-spanish-gray font-normal leading-[130%]">
          {contentObject.content || LOGIN_ERROR_MESSAGE}
        </p>

        <button
          onClick={contentObject?.action_callback ? onCallBack : onClose}
          className="w-full rounded-[52px] fpl-bg py-3 text-[16px] font-medium text-white-smoke hover:opacity-90 transition-opacity cursor-pointer"
        >
          {contentObject?.buttons?.accept ||
            (contentObject?.action_callback
              ? RETRY_BUTTON_TEXT
              : EXIT_BUTTON_TEXT)}
        </button>
      </div>
    </div>
  );
}
