import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  fetchDataInformationDiscount,
  fetchDataDetailInformationDiscount,
} from '@/lib/api/landing-page';

type InforData = {
  block_html?: {
    html_desktop?: string;
  };
};

type FetchFunc = (
  param1?: string,
  param2?: string,
) => Promise<InforData[] | undefined>;

interface DiscountInformationProps {
  fetchData: FetchFunc;
  params: { param1?: string; param2?: string };
}

const transformHtml = (htmlDesktop: string): { html: string } => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlDesktop, 'text/html');

  doc.querySelectorAll('p').forEach((p) => p.classList.add('py-2'));
  doc
    .querySelectorAll('h1')
    .forEach((h1) =>
      h1.classList.add(
        'sm:text-3xl',
        'text-2xl',
        'font-bold',
        'pt-5',
        'leading-[130%]',
        'tracking-[0.72px]',
      ),
    );
  doc
    .querySelectorAll('h2')
    .forEach((h2) =>
      h2.classList.add(
        'sm:text-3xl',
        'text-2xl',
        'font-bold',
        'pb-10',
        'leading-[130%]',
        'tracking-[0.72px]',
      ),
    );
  doc.querySelectorAll('a').forEach((a) => {
    const text = a.textContent?.trim();
    if (text?.startsWith('Mua')) {
      a.classList.add(
        'text-white',
        'mx-auto',
        'block',
        'mt-10',
        'rounded-lg',
        'w-[230px]',
        'h-[60px]',
        'fpl-bg',
        'flex',
        'items-center',
        'justify-center',
        'transition',
        'duration-100',
        'ease-in-out',
        'hover:brightness-150',
      );
    } else {
      a.classList.add(
        'py-2',
        'mx-auto',
        'block',
        'flex',
        'items-center',
        'justify-center',
        'transition',
        'duration-300',
        'ease-in-out',
        'hover:underline',
        'hover:text-fpl',
        'w-fit',
      );
    }
  });
  doc.querySelectorAll('strong').forEach((strong) => {
    if (strong.textContent?.trim() === '------------------------------------') {
      strong.classList.add('block', 'text-center', 'mt-2');
    }
  });

  return { html: doc.body.innerHTML };
};

const DiscountInformation = ({
  fetchData,
  params,
}: DiscountInformationProps) => {
  const [data, setData] = useState<InforData[]>();

  useEffect(() => {
    const { param1, param2 } = params;

    (async () => {
      const res = param2
        ? await fetchData(param1, param2)
        : await fetchData(param1);

      if (res) {
        const transformed = res.map((item) => ({
          ...item,
          block_html: {
            ...item.block_html,
            html_desktop: transformHtml(item.block_html?.html_desktop || '')
              .html,
          },
        }));
        setData(transformed);
      }
    })();
  }, [params, fetchData]);

  return (
    <div className="h-auto w-full flex flex-col gap-4 items-center justify-center mt-20 border bg-white text-jet text-base sm:text-xl">
      {data?.map((item, i) => (
        <div
          key={i}
          className="w-full px-4 sm:px-20 xl:px-50"
          dangerouslySetInnerHTML={{
            __html: item.block_html?.html_desktop || '',
          }}
        />
      ))}
    </div>
  );
};

export const InformationDiscountComponent = () => {
  const router = useRouter();
  const { mode } = router.query;

  return (
    <DiscountInformation
      fetchData={fetchDataInformationDiscount}
      params={{ param1: mode as string }}
    />
  );
};

export const DetailInformationDiscountComponent = () => {
  const router = useRouter();
  const { day, mode } = router.query;

  return (
    <DiscountInformation
      fetchData={fetchDataDetailInformationDiscount}
      params={{ param1: day as string, param2: mode as string }}
    />
  );
};
