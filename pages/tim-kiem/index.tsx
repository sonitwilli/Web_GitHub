import SearchingPage from '@/lib/components/searching/SearchingPage';
import DefaultLayout from '@/lib/layouts/Default';
import { GetServerSideProps } from 'next';
import { createSeoPropsFromMeta } from '@/lib/utils/seo';
import type { SeoProps } from '@/lib/components/seo/SeoHead';

const SearchingLayout = () => {
  return (
    <>
      <DefaultLayout>
        <div className="mt-24 md:mt-26 lg:mt-32 px-4 lg:px-8">
          <SearchingPage />
        </div>
      </DefaultLayout>
    </>
  );
};

export const getServerSideProps = (async () => {
  const seoProps = await createSeoPropsFromMeta({
    pageId: 'search',
    fallbackTitle: 'FPT Play - Tìm Kiếm | Phim, Show, Anime, TV, Thể Thao',
    fallbackDescription: 'Tìm kiếm nội dung yêu thích trên FPT Play - Hàng ngàn bộ phim, show TV, anime, thể thao và chương trình truyền hình chất lượng cao.',
    pathPrefix: '/tim-kiem',
  });

  return { props: { seoProps, key: new Date().getTime() } };
}) satisfies GetServerSideProps<{ seoProps: SeoProps; key: number }>;

export default SearchingLayout;
