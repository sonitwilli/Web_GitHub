import { axiosInstance } from '@/lib/api/axios';
import { BlockItemType } from '../blocks';
import { getCookie } from 'cookies-next';
import { NUMBER_PR } from '@/lib/constant/texts';

export type SuggestKeyword = {
  keyword?: string;
  logo?: string;
  logo_focus?: string;
  is_history?: boolean;
};

export const fetchSuggestKeywords = async (
  value?: string,
): Promise<SuggestKeyword[]> => {
  try {
    const response = await axiosInstance.get(
      'mnemosyne/v3/ott/search-suggest',
      {
        params: { query_str: value?.trim() },
      },
    );
    return response.data?.result ?? [];
  } catch {
    return [];
  }
};

export const removeSearchHistory = async (
  keyword: string,
): Promise<boolean> => {
  try {
    let profileId = (getCookie(NUMBER_PR) as string) || '';
    if (!profileId && typeof window !== 'undefined') {
      profileId = localStorage.getItem(NUMBER_PR) || '';
    }
    
    const response = await axiosInstance.delete(
      'mnemosyne/v3/ott/search-remove',
      {
        params: { query_str: keyword },
        headers: {
          'profileid': profileId
        }
      },
    );
    return response.status === 200;
  } catch (error) {
    console.error('Delete API error:', error);
    return false;
  }
};

export const fetchBlocks = async (title?: string): Promise<BlockItemType[]> => {
  try {
    const res = await axiosInstance.get('mainpage/page/search', {
      params: {
        search_version: 'v2',
        type_search: 'manual_search',
        query_str: title,
      },
    });
    return res.data?.data?.blocks ?? [];
  } catch {
    return [];
  }
};
