import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id, tab } = context.params as { id: string; tab: string };

  // Redirect path-style /trang/:id/:tab to canonical query-style /trang/:id?tab=...
  return {
    redirect: {
      destination: `/trang/${encodeURIComponent(id)}?tab=${encodeURIComponent(
        tab,
      )}`,
      permanent: true,
    },
  };
};

export default function PageRedirect() {
  // This page never renders on the client because of server-side redirect.
  return null;
}