import { getDynamicLinks } from '../api/main';

// define các action có gọi API hoặc logic phức tạp khi close/submit modal

export default function useModalActions() {
  const onMobile = async () => {
    try {
      const res = await getDynamicLinks();
      if (res?.data?.data) {
        window.location.href = res?.data?.data;
      }
    } catch {
      //
    }
  };
  return { onMobile };
}
