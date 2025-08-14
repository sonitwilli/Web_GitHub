import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useLogout } from '@/lib/hooks/useLogout';
import { useAppSelector } from '@/lib/store';
import { ALREADY_SHOWN_MODAL_MANAGEMENT_CODE } from '@/lib/constant/texts';

const LogoutPage: React.FC = () => {
  const router = useRouter();
  const { logout } = useLogout();
  const { token, info } = useAppSelector((state) => state.user);
  const hasLoggedOut = useRef(false);

  useEffect(() => {
    // Wrap everything in try-catch to prevent any error from reaching error boundary
    (async () => {
      try {
        const performLogout = async () => {
          // Prevent multiple logout attempts
          if (hasLoggedOut.current) return;
          hasLoggedOut.current = true;
          
          // Check if user is actually logged in before attempting logout
          const isLoggedIn = !!(token || localStorage.getItem('token'));
          
          if (!isLoggedIn) {
            // User is not logged in, just redirect to home
            await router.push('/');
            return;
          }
          
          // Clear page-specific localStorage items first
          localStorage.removeItem('page_home');
          localStorage.removeItem(ALREADY_SHOWN_MODAL_MANAGEMENT_CODE);
          
          // Prepare logout state
          const logoutState = {
            token: token || '',
            user: info || {},
          };
          
          // Try logout but don't let any error propagate
          try {
            await logout(logoutState);
          } catch (error) {
            // Completely suppress the error - don't even log it
            // The useLogout hook will handle cleanup and redirect
          }
        };

        // Execute logout immediately without delay
        await performLogout();
      } catch (error) {
        // Final catch-all to prevent any error from reaching the error boundary
        // If anything fails, just redirect to home
        try {
          await router.push('/');
        } catch {
          // Even if router.push fails, try window.location
          window.location.href = '/';
        }
      }
    })();
  }, [logout, router, token, info]);

  // Return null - don't show any loading UI, just like sidebar behavior
  return null;
};

export default LogoutPage;
