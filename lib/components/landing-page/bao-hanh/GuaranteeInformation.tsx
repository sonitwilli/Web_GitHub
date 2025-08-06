import { fetchDataGuarantee } from '@/lib/api/landing-page';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type BlockHTML = {
  html_desktop: string;
};

type GuaranteeBlock = {
  block_html: BlockHTML;
};

const GuaranteeInformation = () => {
  const router = useRouter();
  const slug = router.asPath.replace(/^\/+/, '').split('?')[0];

  const [dataGuaranteeBlock1, setDataGuaranteeBlock1] = useState<string>('');
  const [dataGuaranteeBlock2, setDataGuaranteeBlock2] = useState<string>('');

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      const res: GuaranteeBlock[] = await fetchDataGuarantee(slug);
      if (res && res.length >= 2) {
        setDataGuaranteeBlock1(res[0].block_html.html_desktop);
        setDataGuaranteeBlock2(res[1].block_html.html_desktop);
      }
    };

    fetchData();
  }, [slug]);

  return (
    <>
      <div
        className="text-base px-5 md:mx-20 xl:mx-50"
        dangerouslySetInnerHTML={{ __html: dataGuaranteeBlock1 }}
      />

      <div
        className="text-base px-5 md:mx-20 xl:mx-50"
        dangerouslySetInnerHTML={{ __html: dataGuaranteeBlock2 }}
      />
    </>
  );
};

export default GuaranteeInformation;
