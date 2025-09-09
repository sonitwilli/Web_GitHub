import {
  CSL_WEB,
  CSL_VALUE,
  DebugLog,
  DebugLog_CREATED_TIME,
  SENTRY_LIMIT,
} from '../constant/texts';

export interface DataType {
  key?: string;
  value?: string;
}

const saveSessionStorage = ({ data }: { data?: DataType[] } = {}) => {
  if (typeof sessionStorage === 'undefined' || !data?.length) {
    return;
  }
  try {
    for (const item of data) {
      if (item.key) {
        sessionStorage.setItem(item.key, item.value || '');
      }
    }
  } catch {}
};

const removeSessionStorage = ({ data }: { data?: string[] } = {}) => {
  if (typeof sessionStorage === 'undefined' || !data?.length) {
    return;
  }
  try {
    for (const item of data) {
      if (item) {
        sessionStorage.removeItem(item);
      }
    }
  } catch {}
};

const checkCsl = () => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.addEventListener('storage', (event) => {
      if (event.key === DebugLog) {
        const timestamp = new Date().getTime();
        localStorage.setItem(DebugLog_CREATED_TIME, timestamp.toString());
      }
    });
    const key =
      localStorage.getItem(CSL_WEB) || sessionStorage.getItem(CSL_WEB);
    if (key && key.trim() === CSL_VALUE.trim()) {
      return;
    }
    console.log = () => {};
  } catch {}
};

export const isDebugLogEnabled = (): boolean => {
  try {
    let validDebug = false;
    if (typeof window !== 'undefined') {
      validDebug = localStorage.getItem(DebugLog) === 'true';
      if (validDebug) {
        const createdTime = localStorage.getItem(DebugLog_CREATED_TIME);
        if (!createdTime) {
          localStorage.removeItem(DebugLog);
          localStorage.removeItem(DebugLog_CREATED_TIME);
          validDebug = false;
        } else {
          const currentTime = new Date().getTime();
          const limit =
            sessionStorage.getItem(SENTRY_LIMIT) ||
            process.env.NEXT_PUBLIC_SENTRY_EXPIRATION ||
            '60';
          const elapsed = currentTime - Number(createdTime); // miliseconds
          if (elapsed / 1000 / 60 > Number(limit)) {
            localStorage.removeItem(DebugLog);
            localStorage.removeItem(DebugLog_CREATED_TIME);
            validDebug = false;
          }
        }
      }
    } else {
      validDebug = false;
    }
    return validDebug;
  } catch {
    return false;
  }
};

export { saveSessionStorage, removeSessionStorage, checkCsl };
