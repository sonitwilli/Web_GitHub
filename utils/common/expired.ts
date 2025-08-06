export const setWithExpiry = (key: string, value: unknown, ttl: number) => {
  const item = {
    value,
    expiry: Date.now() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getWithExpiry = async (key: string) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = Date.now();

  if (now > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
};
