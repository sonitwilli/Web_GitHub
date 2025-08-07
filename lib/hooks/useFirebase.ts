import { useEffect } from 'react';
import {
  initWatchRoomMessagesFromNotiData,
  watchMultiDocuments,
} from '../plugins/firebase';
import { changeNotiData, NotiDataType } from '../store/slices/firebaseSlice';
import { useAppDispatch, useAppSelector } from '../store';

export default function useFirebase() {
  const { info } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const initNotiFireBase = (userId: string) => {
    // get list rooms by Firestore
    if (userId) {
      const subscribePath = `notification/rooms/${userId}`;
      watchMultiDocuments(subscribePath, initFavorites);
    }
  };

  const initFavorites = (notiData: NotiDataType[]) => {    
    try {
      dispatch(changeNotiData(notiData));
      handleNotiData(notiData);
    } catch {}
  };

  const handleNotiData = (notiData: NotiDataType[]) => {
    try {
      dispatch(changeNotiData(notiData));
      initWatchRoomMessagesFromNotiData(notiData, () => {});
    } catch {}
  };

  useEffect(() => {
    if (info?.user_id_str) {
      initNotiFireBase(info?.user_id_str);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info]);
}
