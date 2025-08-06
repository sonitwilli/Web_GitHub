import { getShortVideoDetail, getMomentDetail, ShortVideoDetail } from '@/lib/api/short-video';
import ShortVideoPlayer from '@/lib/components/short-video/ShortVideoPlayer';
import { SOURCE_PROVIDER } from '@/lib/constant/texts';
import DefaultLayout from '@/lib/layouts/Default';
import { createSeoPropsFromVodData } from '@/lib/utils/seo';
import { SeoProps } from '@/lib/components/seo/SeoHead';
import { GetServerSideProps } from 'next';

export default function ShortVideoPage({ 
  shortVideoData 
}: { 
  shortVideoData?: ShortVideoDetail | null;
  seoProps?: SeoProps;
  key?: number;
}) {
  return (
    <DefaultLayout>
        <ShortVideoPlayer shortVideoData={shortVideoData} />
    </DefaultLayout>
  );
}

const createFallbackSeoProps = (slug?: string) => {
  return createSeoPropsFromVodData(
    null,
    slug || 'short-videos',
    'Short Videos - FPT Play',
    'Xem Short Videos chất lượng cao trên FPT Play. Nội dung ngắn, giải trí không giới hạn.',
  );
};

export const getServerSideProps = (async ({ params, resolvedUrl }) => {
  let detailMoment: ShortVideoDetail | null = null;
  const slugs = params?.slug || [];
  
  let idMoment = '';
  let idChapter = '';

  if (slugs && slugs?.length >= 2) {
    // URL format: /short-videos/momentId/chapterId
    idMoment = Array.isArray(slugs) ? slugs[0] : slugs;
    idChapter = Array.isArray(slugs) ? slugs[1] : '';
  } else if (slugs && slugs?.length === 1) {
    // URL format: /short-videos/chapterId
    idChapter = Array.isArray(slugs) ? slugs[0] : slugs;
  }

  const isGlPage = resolvedUrl?.includes(SOURCE_PROVIDER.GALAXY_PLAY);
  if (isGlPage) {
    return { props: { key: new Date().getTime() } };
  }

  // Fetch short video data based on URL structure
  if (idChapter && idMoment) {
    try {
      const resp = await getShortVideoDetail(idMoment, idChapter);
      if (resp && resp?.data && resp.data.length > 0) {
        detailMoment = resp.data[0] || null;
      }
    } catch (error) {
      console.error('Error fetching short video detail:', error);
    }
  } else if (idChapter) {
    try {
      const resp = await getMomentDetail(idChapter);
      if (resp && resp?.data && resp.data.length > 0) {
        detailMoment = resp.data[0] || null;
      }
    } catch (error) {
      console.error('Error fetching moment detail:', error);
    }
  }

  // Create SEO props based on the fetched data
  let seoProps: SeoProps;

  if (detailMoment?.content) {
    const title = detailMoment.content.title || detailMoment.content.caption || 'Short Videos';
    const description = detailMoment.content.caption || 'Short Videos';
    const image = detailMoment.content.thumb || '/images/moment/left_item.png';

    seoProps = createSeoPropsFromVodData(
      {
        title,
        description,
        index: 1,
        follow: 1,
      },
      `short-videos/${idMoment || idChapter}`,
      `${title} - Short Videos FPT Play`,
      description,
      image,
    );
  } else {
    // Use fallback SEO when no data is available
    seoProps = createFallbackSeoProps(idMoment || idChapter);
  }

  return { 
    props: { 
      key: new Date().getTime(), 
      seoProps, 
      shortVideoData: detailMoment 
    } 
  };
}) satisfies GetServerSideProps<{ 
  key: number; 
  seoProps?: SeoProps; 
  shortVideoData?: ShortVideoDetail | null; 
}>;
