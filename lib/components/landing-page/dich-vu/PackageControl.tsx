import PackageCarousel from './PackageCarousel';
import React from 'react';
import type { DichVuData, PackageItem } from './types';

type selectedProps = {
  selectedTelcos: string;
  data: DichVuData | null;
};

export default function PackageControl(props: selectedProps) {
  const { selectedTelcos, data } = props;

  if (!data) return null;

  const telcoConfig = data?.telcos?.[selectedTelcos];
  if (!telcoConfig) return null;

  const packages = (data?.packages?.[selectedTelcos] as PackageItem[]);
  const count = packages.length;
  const titleWithCount = `${telcoConfig.title} (${count} gói)`;

  return (
    <>
      <PackageCarousel
        id={telcoConfig.id}
        title={titleWithCount}
        packages={packages}
        showControls={telcoConfig.showControls}
      />
    </>
  );
}