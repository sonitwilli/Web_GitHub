import { MethodOptions, PAYMENT_METHODS } from '@/lib/constant/paymentMethods';

export const isQRMethod = (method: string): boolean => {
  return (
    PAYMENT_METHODS.findIndex(
      (item) => item.key === method && item.type === 'qr',
    ) !== -1
  );
};

export const getConfig = (method: string) => {
  return (
    PAYMENT_METHODS.find(
      (methodOption: MethodOptions) => methodOption.key === method,
    ) ?? null
  );
};
