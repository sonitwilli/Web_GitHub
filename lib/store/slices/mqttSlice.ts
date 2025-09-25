import { MqttConfigType } from '@/lib/api/mqtt';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MqttPublishStatusType = '' | 'start' | 'stop';

interface mqttState {
  mqttConfigs?: MqttConfigType;
  isAlreadyRunConnect: number;
  isGetMqttConfigSuccess: number;
  isConnected?: boolean;
  isSubscribeSuccess: boolean;
  isAlreadyRunSubscribe: boolean;
  mqttPublistStatus?: MqttPublishStatusType;
  isAlreadyGetMqttConfig?: boolean;
}

const initialState: mqttState = {
  mqttConfigs: undefined,
  isAlreadyRunConnect: 0,
  isGetMqttConfigSuccess: 0,
  isConnected: false,
  isSubscribeSuccess: false,
  isAlreadyRunSubscribe: false,
  mqttPublistStatus: '',
  isAlreadyGetMqttConfig: false,
};

const mqttSlice = createSlice({
  name: 'mqtt',
  initialState,
  reducers: {
    changeMqttConfig: (state, action: PayloadAction<MqttConfigType>) => {
      state.mqttConfigs = action.payload;
    },
    changeIsAlreadyRunConnect: (state, action: PayloadAction<number>) => {
      state.isAlreadyRunConnect = action.payload;
    },
    changeIsConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    changeIsGetMqttConfigSuccess: (state, action: PayloadAction<number>) => {
      state.isGetMqttConfigSuccess = action.payload;
    },
    changeIsSubscribeSuccess: (state, action: PayloadAction<boolean>) => {
      state.isSubscribeSuccess = action.payload;
    },
    changeIsAlreadyRunSubscribe: (state, action: PayloadAction<boolean>) => {
      state.isAlreadyRunSubscribe = action.payload;
    },
    changeMqttPublistStatus: (
      state,
      action: PayloadAction<MqttPublishStatusType>,
    ) => {
      state.mqttPublistStatus = action.payload;
    },
    changeIsAlreadyGetMqttConfig: (state, action: PayloadAction<boolean>) => {
      state.isAlreadyGetMqttConfig = action.payload;
    },
  },
});

// Export actions
export const {
  changeMqttConfig,
  changeIsAlreadyRunConnect,
  changeIsConnected,
  changeIsGetMqttConfigSuccess,
  changeIsSubscribeSuccess,
  changeIsAlreadyRunSubscribe,
  changeMqttPublistStatus,
  changeIsAlreadyGetMqttConfig,
} = mqttSlice.actions;

// Export reducer
export default mqttSlice.reducer;
