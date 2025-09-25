import { axiosInstance } from '@/lib/api/axios';
import { AxiosResponse } from 'axios';
import { SSO_ACCESS_TOKEN, SSO_PROVIDER_ID } from '@/lib/constant/texts';

// Interface for transaction
export interface Transaction {
  detail?: string;
  timestamp?: string;
  description?: string;
  id?: number;
  image_v2?: string;
  payment_gateway?: string;
  payment_gateway_name?: string;
  price_display?: string;
  purchase_date?: string;
  trans_id?: string;
  type?: number;
}

// Interface for API response
export interface TransactionHistoryResponse {
  page?: number;
  per_page?: number;
  total_page?: number;
  transactions?: Transaction[];
}

// Interface for get transaction history params
export interface TransactionHistoryParams {
  client_id?: string;
  provider_id?: string | null;
  provider_token?: string | null;
  page?: number;
  per_page?: number;
}

// doGetTransactionHistory
export const doGetTransactionHistory = async ({
  page = 1,
  per_page = 10,
  sso = false,
}: {
  page?: number;
  per_page?: number;
  sso?: boolean;
} = {}): Promise<AxiosResponse<TransactionHistoryResponse>> => {
  try {
    const params: TransactionHistoryParams = {
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      page,
      per_page,
    };

    if (sso) {
      params.provider_id = localStorage.getItem(SSO_PROVIDER_ID);
      params.provider_token = `Bearer ${localStorage.getItem(
        SSO_ACCESS_TOKEN,
      )}`;
    }

    const response = await axiosInstance.get(
      '/payment/get_transaction_history',
      {
        params,
      },
    );

    return response;
  } catch (error) {
    console.error(
      'Error fetching transaction history:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};

// Interface for Button Info in Popup
interface PopupButton {
  id?: string;
  title?: string;
}

// Interface for Popup Info
interface PopupInfo {
  data?: PopupButton[];
  type?: string;
  description?: string;
  title?: string;
}

// Interface for Button Info
interface ButtonInfo {
  action?: string;
  popup_info?: PopupInfo;
  icon?: string;
  title?: string;
}

// Interface for Meta
export interface Meta {
  short_description?: string;
  type?: string;
  name?: string;
  block_style?: string;
  btn_info?: ButtonInfo;
}

// Interface for Image
interface Image {
  portrait?: string;
  landscape_title?: string;
  portrait_mobile?: string;
  landscape?: string;
  title?: string;
}

// Interface for Label
interface Label {
  url?: string;
  position?: string;
}

// Interface for Detail
interface Detail {
  description?: string;
  people?: string[];
  short_description?: string;
  meta_data?: string[];
  app_upgrade_file?: string;
  parental_code?: string;
  priority_tag?: string;
  category?: string;
  country?: string;
  duration_i?: number;
  duration_s?: string;
  release?: string;
  age_rating?: string;
}

// Interface for History Item
export interface HistoryItem {
  episode_total_chapter?: number;
  structure_id?: string[];
  episode_latest_index?: number;
  is_play?: string;
  title?: string;
  is_new?: string;
  txt_new?: string;
  image?: Image;
  labels?: Label[];
  time_watched?: number;
  detail?: Detail;
  lastchapter_id?: string;
  drm?: string;
  content_type?: string;
  date?: string;
  parental_code?: string;
  is_kid?: string;
  type?: string;
  id?: string;
  playlist_total?: string;
}

// Interface for API Response
interface HistoryViewResponse {
  msg?: string;
  meta?: Meta;
  data?: HistoryItem[];
  code?: number;
  status?: string;
}

// Function to fetch history view data
export const getHistoryView = async (
  profileId: string,
  pageIndex: number = 1,
  pageSize: number = 100,
  drm: number = 1,
): Promise<AxiosResponse<HistoryViewResponse>> => {
  try {
    return await axiosInstance.get('/playos/block/history_view/0', {
      params: {
        page_index: pageIndex,
        page_size: pageSize,
        drm,
        target_profile_id: profileId,
      },
    });
  } catch (error) {
    console.error('Error fetching history view:', error);
    return {} as AxiosResponse<HistoryViewResponse>;
  }
};

interface DeleteProfileHistoryResponse {
  status: string;
  message: {
    title?: string;
    content?: string;
  };
}

// Function to delete profile history
export const deleteProfileHistory = async (
  profileId: string,
): Promise<AxiosResponse<DeleteProfileHistoryResponse>> => {
  try {
    return await axiosInstance.post(
      'config/personal_content/remove/history_view',
      {
        profile_id: profileId,
      },
    );
  } catch (error) {
    console.error('Error deleting profile history:', error);
    return {} as AxiosResponse<DeleteProfileHistoryResponse>;
  }
};
