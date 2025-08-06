import { onLoginResponse } from '@/lib/api/login';

type NotificationInput = Partial<{
  title?: string;
  msg?: string;
  buttons?: {
    accept?: string;
    cancel?: string;
  };
  action_callback?: boolean;
}>;

export const onLoginSuccess = async (
  data: onLoginResponse,
  handleUserInfo: (token: string) => Promise<void>,
  showNotificationModal: (res?: NotificationInput) => void,
) => {
  const token = data?.data?.access_token;

  if (!token) {
    showNotificationModal(data);
    return;
  }

  // await wait();
  await handleUserInfo(token);
};
