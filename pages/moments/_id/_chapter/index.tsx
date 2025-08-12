import { useEffect } from 'react';
import { useRouter } from 'next/router';

const ShortVideoPage = () => {
const router = useRouter();

  useEffect(() => {
  if (router.asPath.includes('moments')) {
    router.push(router.asPath.replace('moments', 'short-videos')); // client-side redirect
  }}, [router]);
};
export default ShortVideoPage;
