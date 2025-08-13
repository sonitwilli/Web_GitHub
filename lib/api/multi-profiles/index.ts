import { axiosInstance } from '@/lib/api/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { DEFAULT_ERROR_MSG, ERROR_CONNECTION, ERROR_DELETE_PROFILE } from '@/lib/constant/texts';
import { showToast } from '@/lib/utils/globalToast';
import { checkError } from '@/lib/utils/profile';
import { Profile } from '@/lib/api/user';

// Define interfaces for profile data and API response
export interface ProfileData {
  profile_id: string;
  name: string;
  avatar_id: string;
  avatar_url: string;
  profile_type: string;
  is_root: string;
  pin_type: string;
  enable_d2g: string;
}

export interface ApiResponse {
  status?: string;
  error_code?: string;
  msg?: string;
  message?: {
    title?: string;
    content?: string;
  };
  data?: Profile;
}

export interface ProfileMetaData {
  title?: string;
  title_update?: string;
  title_manager?: string;
}

export interface ProfileResponse {
  status?: string;
  error_code?: string;
  msg?: string;
  message?: {
    title?: string;
    content?: string;
  };
  data?: {
    profiles: Profile[];
    meta_data: ProfileMetaData;
    current_profile: ProfileCurrent;
  };
}

export interface ProfileCurrent {
  is_deleted?: string;
  redirect_profile?: string;
}

export interface AvatarGroup {
  avatars: Avatar[];
  group_id: string;
  group_name: string;
  group_position: string;
}

export interface Avatar {
  profile_id?: string;
  name?: string;
  avatar_id?: string;
  avatar_url?: string;
  url?: string;
  profile_type?: string;
  id?: string;
  image?: string;
  is_root?: string;
  pin_type?: string;
  enable_d2g?: string;
  created_date?: string;
  allow_edit?: string;
  status_onboarding?: string;
}

export interface AvatarResponse {
  error_code?: string;
  status?: string;
  msg?: string;
  data?: AvatarGroup[];
}

export interface CheckPasswordResponseType {
  message?: string;
  status_code?: number;
  data?: {
    status_code?: number;
  };
}

// Define input parameters type
interface CheckPasswordParams {
  password?: string;
  version?: number;
}

// Define return type for the function
interface CheckPasswordResult {
  success?: boolean;
  error?: string;
}

export const getProfileList = async (): Promise<ProfileResponse> => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  if (!token) {
    return { status: '0', data: { profiles: [], meta_data: {}, current_profile: {} } };
  }

  try {
    const response = await axiosInstance.get<ProfileResponse>('config/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching profiles:', error);

    return { status: error instanceof AxiosError ? error.response?.status.toString() : '0', data: { profiles: [], meta_data: {}, current_profile: {} } };
  }
};

export const getProfilesAvatarList = async (): Promise<{
  success: boolean;
  data?: AvatarGroup[];
  error?: string;
}> => {
  try {
    const response = await axiosInstance.get<AvatarResponse>(
      'config/profile/avatars',
    );
    const data = response.data;

    if (data.status === '1') {
      return { success: true, data: data?.data || [] };
    } else {
      return { success: false, error: data.msg || 'Failed to fetch avatars' };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred';
    // Assuming a toast utility compatible with Tailwind CSS styling
    if (typeof window !== 'undefined') {
      // Replace with your actual toast implementation
      console.error('Error fetching avatars:', errorMessage);
    }
    return { success: false, error: errorMessage };
  }
};

// doFetchRecommendedProfile function
export const doFetchRecommendedProfile = async (): Promise<
  AxiosResponse<ApiResponse>
> => {
  try {
    const response = await axiosInstance.get('/config/profile/recommend');
    return response;
  } catch (error) {
    console.error(
      'Error fetching recommended profile:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};

// doCreateNewProfile function
export const doCreateNewProfile = async (params: {
  name: string;
  avatar_id: string;
  avatar_url: string;
  profile_type: string;
  pin?: string;
}): Promise<AxiosResponse<ApiResponse>> => {
  try {
    const response = await axiosInstance.post('/config/profile', { ...params });
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (
  params: {
    name?: string;
    avatar_id?: string;
    avatar_url?: string;
    profile_type?: string;
    pin?: string;
  },
  selectedProfile: Profile | null,
): Promise<AxiosResponse<ApiResponse>> => {
  try {
    const response = await axiosInstance.post(
      `/config/profile/${selectedProfile?.profile_id}`,
      { ...params },
    );

    if (response.data?.status === '1') {
      showToast({
        title: 'Hồ sơ đã được cập nhật',
        desc: response.data?.msg || '',
      });
    }

    return response;
  } catch (error) {
    showToast({
      title: ERROR_CONNECTION,
      desc: checkError({ error }),
    });
    console.error(
      'Error updating profile:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
};

export const deleteProfile = async (
  profileId: string,
  profileName: string,
): Promise<AxiosResponse<ApiResponse>> => {
  try {
    const response = await axiosInstance.post(
      "/config/profile/delete",
      { profile_id: profileId },
    );

    if (response.data?.status === '1') {
      showToast({
        title: response.data?.message?.title || 'Hồ sơ đã được xóa',
        desc: response.data?.message?.content || `Hồ sơ ${profileName} đã được xóa khỏi danh sách.`,
      });
    }

    return response;
  }
  catch (error) {
    showToast({
      title: ERROR_DELETE_PROFILE,
      desc: checkError({ error }),
    });
    console.error(
      'Error deleting profile:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
}

export const checkPassword = async ({
  password,
  version,
}: CheckPasswordParams = {}): Promise<CheckPasswordResult> => {
  try {
    const data = {
      passcode: password,
      client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
      type: 'profile',
    };

    // Add query params if version is 1
    const config = version === 1 ? { params: { fid: '1' } } : {};

    const response: AxiosResponse<CheckPasswordResponseType> =
      await axiosInstance.post('user/checkpass', data, config);

    if (response?.data?.data?.status_code === 1) {
      return { success: true };
    } else {
      return {
        success: false,
        error: response?.data?.message || DEFAULT_ERROR_MSG,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : DEFAULT_ERROR_MSG,
    };
  }
};
