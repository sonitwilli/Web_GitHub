import { MqttConfigType } from '@/lib/api/mqtt';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface mqttState {
  mqttConfigs?: MqttConfigType;
  isAlreadyRunConnect?: boolean;
  isConnected?: boolean;
}

const initialState: mqttState = {
  mqttConfigs: undefined,
  isAlreadyRunConnect: false,
  isConnected: false,
};

const mqttSlice = createSlice({
  name: 'mqtt',
  initialState,
  reducers: {
    changeMqttConfig: (state, action: PayloadAction<MqttConfigType>) => {
      state.mqttConfigs = action.payload;
    },
    changeIsAlreadyRunConnect: (state, action: PayloadAction<boolean>) => {
      state.isAlreadyRunConnect = action.payload;
    },
    changeIsConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
  },
});

// Export actions
export const {
  changeMqttConfig,
  changeIsAlreadyRunConnect,
  changeIsConnected,
} = mqttSlice.actions;

// Export reducer
export default mqttSlice.reducer;
