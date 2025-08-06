import { AppDispatch } from '@/lib/store'; // Adjust based on your Redux store setup
import { getProfileList } from '@/lib/api/multi-profiles';
import { setProfiles, resetProfiles } from '@/lib/store/slices/multiProfiles';
import { showToast } from '../globalToast';
import axios from 'axios';
import { TOKEN } from '@/lib/constant/texts';
import { TITLE_SERVICE_ERROR } from '@/lib/constant/errors';

export const fetchListProfiles = async (dispatch: AppDispatch) => {
  if (!localStorage.getItem(TOKEN)) {
    dispatch(resetProfiles());
    return;
  }

  try {
    const res = await getProfileList();

    if (res.status === '1' && res.data?.profiles) {
      dispatch(setProfiles(res.data.profiles));
    } else {
      dispatch(resetProfiles());
      showToast({
        title: TITLE_SERVICE_ERROR,
        desc: res?.msg,
      });
    }
  } catch (err) {
    dispatch(resetProfiles());

    if (axios.isAxiosError(err)) {
      const data = err.response?.data;
      const fallback =
        data?.data?.errors || data?.msg || data?.message || data?.detail;

      showToast({
        title: TITLE_SERVICE_ERROR,
        desc: fallback,
      });
    }
  }
};
