import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { logout } from '@/lib/api/logout'; // Import the logout function
import { setUser, setToken } from '@/lib/store/slices/userSlice'; // Adjust based on your Redux setup
import { NUMBER_PR, TOKEN, TYPE_PR, USER } from '../constant/texts';
import { deleteCookie } from 'cookies-next';
import { AxiosError } from 'axios';

interface User {
  user_id_str?: string;
}

interface LogoutState {
  token: string;
  user: User;
}

export const useLogout = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = useCallback(
    async (state: LogoutState) => {
      try {
        // Call the logout function
        await logout({
          state,
          setUser: (user) => dispatch(setUser(user || {})),
          setToken: (token) => dispatch(setToken(token || '')),
        });

        localStorage.removeItem(TOKEN);
        localStorage.removeItem(NUMBER_PR);
        localStorage.removeItem(TYPE_PR);
        localStorage.removeItem(USER);
        deleteCookie(NUMBER_PR);
        deleteCookie(TYPE_PR);

        // Redirect to home page
        await router.push('/');
        router.reload();
      } catch (error) {
        if(error instanceof AxiosError && error.response?.status === 401) {
          await router.push('/');
        router.reload();
        }
        console.error('Logout failed:', error);
        // Optionally handle error (e.g., show toast notification)
      }
    },
    [dispatch, router],
  );

  return { logout: handleLogout };
};
