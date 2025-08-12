import React from 'react';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';

// Dynamic imports for performance
const SingleMonitorPlayer = dynamic(
  () => import('@/lib/components/player/monitor/SingleMonitorPlayer'),
  { ssr: false },
);

interface MonitorPageProps {
  platformQuery?: string;
}

const Monitor: React.FC<MonitorPageProps> = ({ platformQuery }) => {
  return <SingleMonitorPlayer platformQuery={platformQuery} />;
};

// Server-side props to get platform query
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { platform } = context.query;

  return {
    props: {
      platformQuery: (platform as string) || null,
    },
  };
};

export default Monitor;
