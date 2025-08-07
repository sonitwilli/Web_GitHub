import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/api/axios';

export type FeatureType = { name?: string; value?: number };
export type PlatForm = { text?: string; icon?: string[] };
export type Packages = {
  features_display?: FeatureType[];
  price_display?: string;
  package_name?: string;
  num_device?: number;
  icon?: string;
  term_package_display?: string;
  type?: string;
  image_thumbnail?: string;
  lbl_state?: string;
};

const usePackageData = () => {
  const [listFeature, setListFeature] = useState<FeatureType[]>([]);
  const [description, setDescription] = useState<string[]>([]);
  const [platformSupport, setPlatformSupport] = useState<PlatForm>();
  const [basicPackages, setBasicPackages] = useState<Packages[]>([]);
  const [expandPackages, setExpandPackages] = useState<Packages[]>([]);
  const [allPackages, setAllPackages] = useState<Packages[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get('payment/get_v2_packages');
        const data = res.data?.msg_data;

        setListFeature(data?.list_features || []);
        setDescription(data?.desc_page_payment || []);
        setPlatformSupport(data?.platform_support);

        const basicPackages = data?.list_packages || [];
        const expandPackages = data?.expansion_package?.package_list || [];
        const allPackages = [...basicPackages, ...expandPackages];

        setBasicPackages(basicPackages);
        setExpandPackages(expandPackages);
        setAllPackages(allPackages);
      } catch {
        return [];
      }
    };

    fetchData();
  }, []);

  return {
    listFeature,
    description,
    platformSupport,
    basicPackages,
    expandPackages,
    allPackages,
  };
};

export default usePackageData;
