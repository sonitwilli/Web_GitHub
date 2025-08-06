import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';

export interface MenuResponse {
  msg?: string;
  code?: number;
  data?: MenuItem[];
}

export interface MenuItem {
  background_image?: string;
  is_display_logo?: string;
  name?: string;
  menu_type?: string;
  app_id?: string;
  reload?: string;
  logo?: string;
  logo_focus?: string;
  page_id?: string;
  id?: string;
}

const getMenus = async (): Promise<AxiosResponse<MenuResponse>> => {
  // return axiosInstance.get('/playos/menu');
  return axiosInstance.get('/mainpage/menu');
};

export { getMenus };
