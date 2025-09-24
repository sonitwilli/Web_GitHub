import PackageCarousel from './PackageCarousel';
import { fetchDataPlans } from '../../../../lib/api/landing-page';
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
    
    const getData = async () => {
      try {
        const d = await fetchDataPlans();
        if (mounted && d) {
          // Transform the API response to match the expected structure
          const transformedData = {
            iconData: d.icon_data || [],
            logoBrand: d.logo_brand || [],
            packages: d.packages || {},
            policies: d.policies || { title: '', columns: [] },
            telcos: d.telcos || {}
          };
          setData(transformedData);
        }
      } catch {}
    };
    
    getData();
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
