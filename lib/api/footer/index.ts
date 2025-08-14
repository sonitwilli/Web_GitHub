import { axiosInstance } from '../axios';

export interface FooterCertification {
  id: string;
  type: 'redirect';
  url: string;
  image: string;
}

export interface FooterCompany {
  title: string;
  image: string;
  certifications: FooterCertification[];
}

export interface FooterMenuItem {
  id: string;
  type: 'inapp' | 'redirect' | 'text' | 'social';
  url: string;
  title: string;
  icon?: string;
  links?: Array<{
    id: string;
    type: 'redirect';
    title: string;
    url: string;
    icon: string;
  }>;
}

export interface FooterMenu {
  title: string;
  data: FooterMenuItem[];
}

export interface FooterTexts {
  company_info: {
    html: string;
  };
  app_download: {
    title: string;
    data: Array<{
      id: string;
      image: string;
    }>;
  };
}

export interface FooterData {
  company: FooterCompany;
  menu: FooterMenu[];
  texts: FooterTexts;
}

export interface FooterResponse {
  status: string;
  error_code: string;
  msg: string;
  data: FooterData;
}

export const getFooterData = async (): Promise<FooterData | null> => {
  try {
    const response = await axiosInstance.get<FooterResponse>('/common/layout/footer');
    if (response.data.status === '1' && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching footer data:', error);
    return null;
  }
};
