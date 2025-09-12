import PackageCarousel from './PackageCarousel';
import { fetchDataDichVu } from '../../../../lib/api/landing-page';
import React, { useEffect, useState } from 'react';
import type { DichVuData, PackageItem } from './types';

type selectedProps = {
  selectedTelcos: string;
};

export default function PackageControl(props: selectedProps) {
  const { selectedTelcos } = props;
  const [data, setData] = useState<DichVuData | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchDataDichVu()
      .then((d) => {
        if (mounted) setData(d);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

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
  labels={(data?.packages?.labels as import('./types').Labels) ?? null}
      />
    </>
  );
}
