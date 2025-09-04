import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import userReducer from './slices/userSlice';
import appReducer from './slices/appSlice';
import loginReducer from './slices/loginSlice';
import loginFlowReducer from './slices/loginFlowSlice';
import firebaseReducer from './slices/firebaseSlice';
import multiProfilesReducer from './slices/multiProfiles';
import accountSlice from './slices/accountSlice';
import channelSlice from './slices/channelSlice';
import broadcastReducer from './slices/broadcastSlice';
import broadcastScheduleReducer from './slices/broadcastScheduleSlice';
import playerReducer from './slices/playerSlice';
import liveChatReducer from './slices/liveChatSlice';
import otpReducer from './slices/otpSlice';
import chatbotReducer from './slices/chatbotSlice';
import blockReducer from './slices/blockSlice';
import vodReducer from './slices/vodSlice';
import sidetagReducer from './slices/sidetagSlice';
import mqttReducer from './slices/mqttSlice';
import trackingReducer from './slices/trackingSlice';
import debugReducer from './slices/debugSlice';
export const store = configureStore({
  reducer: {
    app: appReducer,
    user: userReducer,
    loginSlice: loginReducer,
    loginFlow: loginFlowReducer,
    blockSlice: blockReducer,
    firebase: firebaseReducer,
    multiProfile: multiProfilesReducer,
    accountSlice,
    channelSlice,
    broadcast: broadcastReducer,
    broadcastSchedule: broadcastScheduleReducer,
    player: playerReducer,
    liveChat: liveChatReducer,
    otp: otpReducer,
    chatbot: chatbotReducer,
    vod: vodReducer,
    sidetag: sidetagReducer,
    mqtt: mqttReducer,
    tracking: trackingReducer,
    debug: debugReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Types for state and dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for usage in components
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
