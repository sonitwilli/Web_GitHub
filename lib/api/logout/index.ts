import { axiosInstance } from '@/lib/api/axios';
import { TOKEN } from '@/lib/constant/texts';
import { deleteCookie } from 'cookies-next';
import { store } from '@/lib/store';
import { logout as dispatchLogout } from '@/lib/utils/auth';

// Constants for localStorage and tracking keys
const ALREADY_SHOWN_MODAL_MANAGEMENT_CODE =
  'already_shown_modal_management_code';
const trackingStoreKey = {
  UTM_IN_APP: 'utm_in_app',
  UTM_SESSION: 'utm_session',
  UTM_LINK: 'utm_link',
};

interface User {
  user_id_str?: string;
}

interface LogoutState {
  token: string | null;
  user: User | null;
}

const removeProfile = () => {
  deleteCookie('profile'); // Adjust based on your profile removal logic
};

export const logout = async ({
  state,
  setUser,
  setToken,
}: {
  state: LogoutState;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}): Promise<void> => {
  try {
    // Make API call to logout
    await axiosInstance.post(
      '/user/otp/logout',
      {},
      {
        params: {
          push_reg_id: state.token,
        },
      },
    );

    // Remove cookies
    deleteCookie(TOKEN);
    deleteCookie('user');

    // Remove profile
    removeProfile();

    // Clear localStorage and sessionStorage
    localStorage.removeItem('user');
    localStorage.removeItem(TOKEN);
    sessionStorage.removeItem(TOKEN);
    localStorage.removeItem(ALREADY_SHOWN_MODAL_MANAGEMENT_CODE);
    localStorage.removeItem(trackingStoreKey.UTM_IN_APP);
    localStorage.removeItem(trackingStoreKey.UTM_SESSION);
    localStorage.removeItem(trackingStoreKey.UTM_LINK);
    localStorage.removeItem('is_exist_tab');
    // Update Redux state
    setUser(null);
    setToken(null);
    dispatchLogout(store.dispatch);
  } catch (error) {
    console.error(
      'Error during logout:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error; // Throw error to be handled by the caller
  }
};
