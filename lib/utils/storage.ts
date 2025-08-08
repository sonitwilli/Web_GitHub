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

const removeSessionStorage = ({ data }: { data?: DataType[] } = {}) => {
  if (typeof sessionStorage === 'undefined' || !data?.length) {
    return;
  }
  try {
    for (const item of data) {
      if (item.key) {
        sessionStorage.removeItem(item.key);
      }
    }
  } catch {}
};

export { saveSessionStorage, removeSessionStorage };
