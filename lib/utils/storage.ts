import { CSL_WEB, CSL_VALUE } from "../constant/texts";

export interface DataType {
  key?: string;
  value?: string;
}

const saveSessionStorage = ({ data }: { data?: DataType[] } = {}) => {
  if (typeof sessionStorage === "undefined" || !data?.length) {
    return;
  }
  try {
    for (const item of data) {
      if (item.key) {
        sessionStorage.setItem(item.key, item.value || "");
      }
    }
  } catch {}
};

const removeSessionStorage = ({ data }: { data?: string[] } = {}) => {
  if (typeof sessionStorage === "undefined" || !data?.length) {
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
  if (typeof window === "undefined") {
    return;
  }
  try {
    const key =
      localStorage.getItem(CSL_WEB) || sessionStorage.getItem(CSL_WEB);
    if (key === CSL_VALUE) {
      return;
    }
    console.log = () => {};
  } catch {}
};

export { saveSessionStorage, removeSessionStorage, checkCsl };
