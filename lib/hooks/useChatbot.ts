import { AxiosError } from 'axios';
import { getPartnerToken } from '../api/chatbot';
import { changeTimeOpenModalRequireLogin } from '../store/slices/appSlice';
import { useAppDispatch, useAppSelector } from '../store';
import {
  changeChatbotOpen,
  changePartnerToken,
} from '../store/slices/chatbotSlice';

export const useChatbot = () => {
  const dispatch = useAppDispatch();
  const { isAlreadyRender } = useAppSelector((s) => s.chatbot);

  const handleGetChatbotPartnerToken = async () => {
    try {
      const res = await getPartnerToken();
      dispatch(changePartnerToken(res?.data?.data?.token || ''));
      return {
        success: true,
        token: res?.data?.data?.token || '',
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(changePartnerToken(''));
      if (error instanceof AxiosError) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { status } = error as AxiosError<any>;
        if (status === 401) {
          dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
          return {
            success: false,
            require_login: true,
          };
        } else {
          return { success: false };
        }
      } else {
        return { success: false };
      }
    }
  };

  const clickChatbot = async () => {
    if (!isAlreadyRender) {
      const result = await handleGetChatbotPartnerToken();
      if (!result?.require_login) {
        dispatch(changeChatbotOpen(true));
      }
    } else {
      dispatch(changeChatbotOpen(true));
    }
  };

  return { handleGetChatbotPartnerToken, clickChatbot };
};
