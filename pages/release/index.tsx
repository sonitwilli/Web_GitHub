import { GetServerSideProps } from 'next';
import versionData from '@/versions.json';

export const getServerSideProps: GetServerSideProps = async () => {
  const latestVersion = versionData.versions[0].version;
  return {
    redirect: {
      destination: `/release/v${latestVersion}`,
      permanent: false,
    },
  };
};

const ReleasePage = () => {
  return null;
};

export default ReleasePage;
