import * as Sentry from '@sentry/nextjs';
interface Data {
  message?: string;
  level?: Sentry.SeverityLevel;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraData?: any;
}
const sendMsgSentry = ({ message, level, extraData }: Data = {}) => {
  if (!message) {
    return;
  }
  try {
    Sentry.captureMessage(message || 'Sentry message', {
      level: level || 'info',
      extra: {
        ...extraData,
      },
    });
  } catch {}
};

export { sendMsgSentry };
