import { AxiosResponse } from 'axios';
import { axiosInstance } from '@/lib/api/axios'; // Giả định axiosInstance đã được cấu hình

// Định nghĩa interface cho Menu Item
interface MenuItem {
  id?: string;
  title?: string;
  title_en?: string;
  icon?: string;
  hover_icon?: string;
}

// Định nghĩa interface cho Response
interface MenuResponse {
  status?: string;
  error_code?: string;
  msg?: string;
  data?: {
    menu?: MenuItem[];
    unsupported_message?: string;
    unsupported_message_en?: string;
  };
}

// Function gọi API lấy menu
export const getMenu = async (): Promise<AxiosResponse<MenuResponse>> => {
  try {
    return await axiosInstance.get('/common/setting/menu');
  } catch (error) {
    console.error('Error fetching menu:', error);
    return {} as Promise<AxiosResponse<MenuResponse>>;
  }
};