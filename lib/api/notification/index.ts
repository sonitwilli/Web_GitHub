import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';

export interface CategoryItem {
  id?: string;
  name?: string;
  icon?: string;
  label_color?: string;
  total_unread?: string;
  last_message?: string;
}

export interface onFetchCategoryListResponse {
  status?: number;
  error_code?: number;
  msg?: string;
  message?: {
    title?: string;
    body?: string;
  };
  data?: CategoryItem[];
}

export interface InboxDetailItem {
  id?: string;
  title?: string;
  body?: string;
  url?: string;
  image?: string;
  category_icon?: string;
  created_at?: string;
}

export interface onFetchInboxDetailResponse {
  status?: number;
  error_code?: number;
  msg?: string;
  message?: {
    title?: string;
    body?: string;
  };
  data?: InboxDetailItem;
}

export interface InboxListItem {
  id?: string;
  status?: string;
  created_at?: string;
  category_id?: string;
  category_icon?: string;
  category_name?: string;
  type?: string;
  type_id?: string;
  title?: string;
  body?: string;
  url?: string;
  image?: string;
}

export interface InboxPaging {
  page?: number;
  limit?: number;
  total?: number;
  total_page?: number;
}

export interface onFetchInboxListResponse {
  status?: number;
  error_code?: number;
  msg?: string;
  message?: {
    title?: string;
    body?: string;
  };
  paging?: InboxPaging;
  data?: InboxListItem[];
}

export interface TopInboxItem {
  id?: string;
  status?: string;
  created_at?: string;
  category_id?: string;
  category_icon?: string;
  category_name?: string;
  type?: string;
  type_id?: string;
  title?: string;
  body?: string;
  url?: string;
  image?: string;
}

export interface onFetchTopInboxResponse {
  status?: number;
  error_code?: number;
  msg?: string;
  message?: {
    title?: string;
    body?: string;
  };
  data?: TopInboxItem[];
}

export interface onMarkReadInboxResponse {
  status?: number;
  error_code?: number;
  msg?: string;
  message?: {
    title?: string;
    body?: string;
  };
  data?: { success?: boolean };
}

export interface onMarkReadCategoryInboxResponse {
  status?: number;
  error_code?: number;
  msg?: string;
  message?: {
    title?: string;
    body?: string;
  };
  data?: { success?: boolean };
}

const onFetchCategoryList = async (): Promise<
  AxiosResponse<onFetchCategoryListResponse>
> => {
  try {
    return axiosInstance.get('/noti/inbox/categories');
  } catch {
    return {} as Promise<AxiosResponse<onFetchCategoryListResponse>>;
  }
};

const onFetchInboxDetail = async ({
  category_id,
  inbox_id,
}: {
  category_id: string;
  inbox_id: string;
}): Promise<AxiosResponse<onFetchInboxDetailResponse>> => {
  try {
    const url = `/noti/inbox/${category_id}/${inbox_id}`;
    return axiosInstance.get(url);
  } catch {
    return {} as Promise<AxiosResponse<onFetchInboxDetailResponse>>;
  }
};

const onFetchInboxList = async ({
  page,
  limit,
  category_id,
  status,
}: {
  page?: number;
  limit?: number;
  category_id?: string;
  status?: string;
}): Promise<AxiosResponse<onFetchInboxListResponse>> => {
  try {
    return axiosInstance.get('/noti/inbox/list', {
      params: {
        page,
        limit,
        category_id,
        status,
      },
    });
  } catch {
    return {} as Promise<AxiosResponse<onFetchInboxListResponse>>;
  }
};

const onFetchTopInbox = async (): Promise<
  AxiosResponse<onFetchTopInboxResponse>
> => {
  try {
    return axiosInstance.get('/noti/inbox/top');
  } catch {
    return {} as Promise<AxiosResponse<onFetchTopInboxResponse>>;
  }
};

const onMarkReadInbox = async (payload: {
  inbox_ids: string[]; // danh sách inbox ID cần mark read
}): Promise<AxiosResponse<onMarkReadInboxResponse>> => {
  try {
    return axiosInstance.post('/noti/inbox/mark-read', payload);
  } catch {
    return {} as Promise<AxiosResponse<onMarkReadInboxResponse>>;
  }
};

const onMarkReadCategoryInbox = async ({
  category_id,
}: {
  category_id: string;
}): Promise<AxiosResponse<onMarkReadCategoryInboxResponse>> => {
  try {
    const url = `/noti/inbox/mark-read/${category_id}`;
    return axiosInstance.post(url);
  } catch {
    return {} as Promise<AxiosResponse<onMarkReadCategoryInboxResponse>>;
  }
};

export {
  onFetchCategoryList,
  onFetchInboxDetail,
  onFetchInboxList,
  onFetchTopInbox,
  onMarkReadInbox,
  onMarkReadCategoryInbox,
};
