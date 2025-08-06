/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  collection,
  onSnapshot,
  query,
  doc,
  DocumentData,
  initializeFirestore,
  memoryLocalCache,
} from 'firebase/firestore';
import { EVENT_COLLECTION_NAME } from '../constant/texts';

const firebaseConfigEvent = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_EVENT,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN_EVENT,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID_EVENT,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET_EVENT,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID_EVENT,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID_EVENT,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID_EVENT,
};

// const appEvent = initializeApp(firebaseConfigEvent);

const app =
  getApps().length === 0 ? initializeApp(firebaseConfigEvent) : getApp();

// const dbEvent = getFirestore(app);
const dbEvent = initializeFirestore(app, {
  localCache: memoryLocalCache(),
});
const watchMultiDocuments = (
  collectionName: string,
  onSuccess: (arg0: any[]) => void,
  onFail?: () => void,
) => {
  if (dbEvent) {
    try {
      onSnapshot(
        query(collection(dbEvent, collectionName)),
        (querySnapshot: any) => {
          const data: any[] = [];
          querySnapshot.forEach((doc: any) => {
            data.push({ id: doc.id, data: doc?.data() });
          });
          if (onSuccess && typeof onSuccess === 'function') {
            onSuccess(data);
          }
        },
      );
    } catch (error) {
      console.log('error watchMultiDocument', error);
      if (onFail && typeof onFail === 'function') {
        onFail();
      }
    }
  }
};

const watchSingleDocument = (
  collectionName: string,
  documentId: string,
  onSuccess: (arg0: DocumentData | undefined) => void,
  onFail: () => void,
) => {
  if (dbEvent) {
    try {
      onSnapshot(doc(dbEvent, collectionName, documentId), (doc: any) => {
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(doc.data());
        }
      });
    } catch (error) {
      console.log('error watchSingleDocument', error);
      if (onFail && typeof onFail === 'function') {
        onFail();
      }
    }
  }
};

const watchSingleDocumentNoti = (
  collectionPath: string[], // ['notification', 'vod', 'roomId']
  onSuccess: (data: DocumentData | undefined) => void,
  onFail?: () => void,
) => {
  if (!dbEvent) return;

  try {
    const path = collectionPath.join('/'); // ✅ cách tốt nhất
    const docRef = doc(dbEvent, path);

    onSnapshot(docRef, (snapshot) => {
      if (typeof onSuccess === 'function') {
        onSuccess(snapshot.data());
      }
    });
  } catch (error) {
    console.error('error watchSingleDocument', error);
    if (typeof onFail === 'function') {
      onFail();
    }
  }
};

export interface NotiDataType {
  id?: string;
  data?: {
    data?: RoomItem[];
  };
}

export interface RoomItem {
  room_type?: string;
  room_id?: string;
}

export interface DetailData {
  messages?: MessageItem[];
  detail_messages?: DetailMessageItem[];
}

export interface MessageItem {
  message_id?: string;
}

export interface DetailMessageItem {
  body?: string;
  category_id?: string;
  image?: string;
  message_id?: string;
  meta_data?: {
    [key: string]: any;
  };
  preview_info?: {
    category_name?: string;
    preview_title?: string;
    preview_body?: string;
    preview_description?: string;
  };
  priority_tag?: string;
  ribbon_payment?: string;
  title?: string;
  type?: string;
  type_id?: string;
  url?: string;
}

const initWatchRoomMessagesFromNotiData = (
  notiData: NotiDataType[],
  onSuccess: (roomId: string, data: DetailData | undefined) => void,
  onFail?: (roomId: string) => void,
) => {
  if (!Array.isArray(notiData)) return;

  for (const doc of notiData) {
    const roomList: RoomItem[] | undefined = doc?.data?.data;

    if (!Array.isArray(roomList)) continue;

    for (const room of roomList) {
      const { room_type, room_id } = room || {};

      if (typeof room_type !== 'string' || typeof room_id !== 'string')
        continue;

      const pathSegments = ['notification', room_type, room_id, room_id];

      watchSingleDocumentNoti(
        pathSegments,
        (data: DetailData | undefined) => {
          onSuccess(room_id, data);
        },
        () => {
          if (onFail) {
            onFail(room_id);
          }
        },
      );
    }
  }
};

const watchEventDocument = (
  eventId: string,
  onSuccess: (data: DocumentData | undefined) => void,
  onFail?: () => void,
) => {
  if (!dbEvent || !eventId) return;

  try {
    const eventDocRef = doc(dbEvent, EVENT_COLLECTION_NAME, eventId); // Replace 'fteluv-events' with your actual collection name if needed

    const unsubscribe = onSnapshot(
      eventDocRef,
      (snapshot) => {
        if (typeof onSuccess === 'function') {
          onSuccess(snapshot.data());
        }
      },
      () => {
        if (typeof onFail === 'function') {
          onFail();
        }
      },
    );

    return unsubscribe;
  } catch {
    if (typeof onFail === 'function') {
      onFail();
    }
  }
};

export {
  dbEvent,
  watchMultiDocuments,
  watchSingleDocument,
  initWatchRoomMessagesFromNotiData,
  watchEventDocument,
};
