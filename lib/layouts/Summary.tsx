import React, { ReactNode } from 'react';
import Head from 'next/head';

interface SummaryLayoutProps {
  children: ReactNode;
  toggleElementRef?: React.RefObject<HTMLDivElement>;
}

const SummaryLayout: React.FC<SummaryLayoutProps> = ({
  children,
  toggleElementRef,
}) => {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />
        <style jsx global>{`
          body {
            scrollbar-width: none;
            -ms-overflow-style: none;
            user-select: none;
            font-family: unset !important;
          }
          body::-webkit-scrollbar {
            display: none;
          }
          html {
            scrollbar-width: none;
            -ms-overflow-style: none;
            user-select: none;
          }
          html::-webkit-scrollbar {
            display: none;
          }
          .loading-page-fptplay {
            visibility: hidden !important;
            opacity: 0 !important;
          }
        `}</style>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/css/summary.css" />
      </Head>

      <div
        ref={toggleElementRef}
        className="min-h-screen min-w-screen overflow-hidden bg-rich-black relative"
      >
        {children}
      </div>
    </>
  );
};

export default SummaryLayout;
