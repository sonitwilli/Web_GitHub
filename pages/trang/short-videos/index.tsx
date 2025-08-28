import ShortVideoPlayer from '@/lib/components/short-video/ShortVideoPlayer';
import DefaultLayout from '@/lib/layouts/Default';
// import { createSeoPropsFromMeta } from '@/lib/utils/seo';
// import { SeoProps } from '@/lib/components/seo/SeoHead';
// import { GetServerSideProps } from 'next';

// export const getServerSideProps = (async () => {
//   // const seoProps = await createSeoPropsFromMeta({
//   //   pageId: 'home',
//   //   fallbackTitle:
//   //     'FPT Play - Trang Chủ | Xem Phim, Show, Anime, TV, Thể Thao Miễn Phí',
//   //   fallbackDescription:
//   //     'Trang chủ FPT Play - Nền tảng giải trí trực tuyến hàng đầu Việt Nam. Xem miễn phí hàng ngàn bộ phim, show TV, anime, thể thao trực tiếp và chương trình truyền hình chất lượng cao.',
//   //   pathPrefix: '',
//   // });

//   // return { props: { seoProps } };
// }) satisfies GetServerSideProps<{ seoProps: SeoProps }>;

export default function PageShortVideo() {
  return (
    <DefaultLayout>
        <ShortVideoPlayer />
    </DefaultLayout>
  );
}

