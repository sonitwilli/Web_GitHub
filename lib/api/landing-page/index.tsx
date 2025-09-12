import axios from 'axios';
import { axiosInstance } from '../axios';

export const fetchDataLandingPage = async (slug: string, mode?: string) => {
  try {
    const url = `${
      process.env.NEXT_PUBLIC_API_LANDING_PAGE
    }/page/${slug}-izios/block${mode ? `?mode=${mode}` : ''}`;
    const res = await axios.get(url);
    return res?.data?.data;
  } catch {
    return [];
  }
};

export const fetchDataPolicy = async (slug: string, mode?: string) => {
  try {
    const url = `${
      process.env.NEXT_PUBLIC_API_LANDING_PAGE
    }/page/${slug}/block${mode ? `?mode=${mode}` : ''}`;
    const res = await axios.get(url);
    return res?.data?.data;
  } catch {
    return [];
  }
};

export const fetchDataGuarantee = async (routeName: string) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_LANDING_PAGE}/page/${routeName}/block`;
    const res = await axios.get(url);
    return res?.data?.data;
  } catch {
    return [];
  }
};

export const fetchDataVerifyMACAddress = async (macAddress: string) => {
  try {
    const res = await axiosInstance.post('user/get_user_login_history', {
      params: {
        device_id: macAddress,
      },
    });
    return res;
  } catch {
    return null;
  }
};

export const fetchDataInformationDiscount = async (mode?: string) => {
  try {
    const url = `${
      process.env.NEXT_PUBLIC_API_LANDING_PAGE
    }/page/khuyenmai/block${mode ? `?mode=${mode}` : ''}`;
    const res = await axios.get(url);
    return res?.data?.data;
  } catch {
    return [];
  }
};

export const fetchDataDetailInformationDiscount = async (
  day?: string,
  mode?: string,
) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_LANDING_PAGE}/page/${day}/block${
      mode ? `?mode=${mode}` : ''
    }`;
    const res = await axios.get(url);
    return res?.data?.data;
  } catch {
    return [];
  }
};

// dich-vu helpers: try remote endpoint then fallback to local data.json
import localDichVu from '../../components/landing-page/dich-vu/data.json';

export const fetchDataDichVu = async (remoteUrl?: string) => {
  try {
    const url = remoteUrl || `${process.env.NEXT_PUBLIC_API_LANDING_PAGE}/dich-vu`;
    const res = await axios.get(url);
    return res?.data?.data ?? localDichVu;
  } catch {
    return localDichVu;
  }
};

export const fetchDichVuPackages = async (
  telco: keyof typeof localDichVu.packages,
  remoteUrl?: string,
) => {
  const localPackages = (localDichVu.packages && localDichVu.packages[telco]) || [];
  try {
    const url = remoteUrl || `${process.env.NEXT_PUBLIC_API_LANDING_PAGE}/dich-vu/packages/${telco}`;
    const res = await axios.get(url);
    const remoteData = res?.data?.data;
    return remoteData !== undefined ? remoteData : localPackages;
  } catch {
    return localPackages;
  }
};
