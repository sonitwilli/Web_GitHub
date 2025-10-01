import { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '@/lib/store';
import { PosterOverlayItem } from '@/lib/utils/posterOverlays/types';

interface AccountGroupCache {
  group_account: string[];
}

const CACHE_KEY = 'user_account_group_cache';

/*
 * Hook for managing user account group caching for poster overlays
 *
 * Logic từ API account/user/info:
 * - group_account: ["sa", "sub"] hoặc [] hoặc null
 * - Nếu group_account.length == 0 → user được coi là "anonymous"
 *
 * Logic cho poster overlays:
 * - Nếu poster group_account = null/empty → show tất cả users
 * - Nếu poster group_account = ["x", "y"] → chỉ show cho users có group trùng khớp
 *
 * Logout/Device Kick handling:
 * - Khi user logout hoặc bị đá thiết bị → force reset về "anonymous"
 * - Dù group_account trước đó có item cũng sẽ bị gắn về "anonymous"
 * - Chờ được gọi userInfo mới thì gắn đè lên
 */

export const useAccountGroupCache = () => {
  const { info: userInfo } = useAppSelector((state) => state.user);
  const [cachedGroupAccount, setCachedGroupAccount] = useState<string[]>([
    'anonymous',
  ]);

  // Get user groups from cache or API data
  const getUserAccountGroups = useCallback((): string[] => {
    try {
      if (!userInfo) {
        // Force reset cache to anonymous on logout/device kick
        const anonymousCache: AccountGroupCache = {
          group_account: ['anonymous'],
        };

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(anonymousCache));
        } catch (error) {
          console.warn('Failed to cache anonymous state:', error);
        }

        return ['anonymous'];
      }

      // Get groups from user API data (fresh userInfo call)
      const apiGroups = userInfo.group_account || [];

      // Try to get from cache first and compare with current API data
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsedCache: AccountGroupCache = JSON.parse(cached);
          if (
            parsedCache.group_account &&
            Array.isArray(parsedCache.group_account)
          ) {
            // Compare cached data with current API data
            const cachedGroups = parsedCache.group_account;
            const currentGroups =
              apiGroups.length === 0 ? ['anonymous'] : apiGroups;

            // If cache matches current data, return cached version
            if (
              JSON.stringify(cachedGroups) === JSON.stringify(currentGroups)
            ) {
              return cachedGroups;
            }
          }
        }
      } catch (error) {
        console.warn('Failed to parse account group cache:', error);
      }

      // Always update cache with fresh API data
      const group_account = apiGroups.length === 0 ? ['anonymous'] : apiGroups;

      // Cache the result from fresh API call
      const cacheData: AccountGroupCache = {
        group_account,
      };

      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.warn('Failed to cache account group:', error);
      }

      return group_account;
    } catch (error) {
      // Fallback to anonymous if any error occurs
      console.warn('Error in getUserAccountGroups:', error);
      return ['anonymous'];
    }
  }, [userInfo]);

  // Filter poster overlays based on user group access
  const filterPosterOverlaysByGroup = useCallback(
    (overlays: PosterOverlayItem[]): PosterOverlayItem[] => {
      // Use cached value instead of calling function every time
      const userGroupAccount = cachedGroupAccount;

      return overlays.filter((overlay) => {
        const posterGroupAccount = overlay.group_account;

        // Nếu poster không có group_account → show tất cả
        if (!posterGroupAccount || posterGroupAccount.length === 0) {
          return true;
        }

        // Check user group_account includes poster group_account
        return posterGroupAccount.some((posterGroup) =>
          userGroupAccount.includes(posterGroup),
        );
      });
    },
    [cachedGroupAccount],
  );

  // Clear cache (useful for logout)
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
      setCachedGroupAccount(['anonymous']);
    } catch (error) {
      console.warn('Failed to clear account group cache:', error);
    }
  }, []);

  // Force reset to anonymous (for logout/device kick scenarios)
  const forceResetToAnonymous = useCallback(() => {
    const anonymousCache: AccountGroupCache = {
      group_account: ['anonymous'],
    };

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(anonymousCache));
      setCachedGroupAccount(['anonymous']);
    } catch (error) {
      console.warn('Failed to force reset to anonymous:', error);
    }
  }, []);

  // Update cached groups when user info changes
  useEffect(() => {
    const currentGroupAccount = getUserAccountGroups();
    setCachedGroupAccount(currentGroupAccount);
  }, [userInfo, getUserAccountGroups]); // Include both dependencies

  return {
    cachedGroupAccount,
    getUserAccountGroups,
    filterPosterOverlaysByGroup,
    clearCache,
    forceResetToAnonymous,
  };
};
