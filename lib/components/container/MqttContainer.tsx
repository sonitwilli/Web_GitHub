import { useMqtt } from '@/lib/hooks/useMqtt';
import { store, useAppDispatch, useAppSelector } from '@/lib/store';
import {
  changeIsAlreadyGetMqttConfig,
  changeIsAlreadyRunConnect,
} from '@/lib/store/slices/mqttSlice';
import { useEffect } from 'react';

export default function MqttContainer() {
  const { configs: appConfigs } = useAppSelector((state) => state.app);
  const { handleGetMqttConfigs, connectMqtt } = useMqtt();
  const dispatch = useAppDispatch();
  const { isGetMqttConfigSuccess, isAlreadyRunConnect } = useAppSelector(
    (s) => s.mqtt,
  );
  const handleCheckConfigs = async () => {
    if (appConfigs) {
      const keys = Object.keys(appConfigs);
      if (keys.length > 0) {
        const { isAlreadyGetMqttConfig } = store.getState().mqtt;
        if (isAlreadyGetMqttConfig) {
          return;
        }
        dispatch(changeIsAlreadyGetMqttConfig(true));
        await handleGetMqttConfigs();
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleConnectMqtt = () => {
    try {
      connectMqtt();
    } catch {}
  };

  useEffect(() => {
    if (isGetMqttConfigSuccess && !isAlreadyRunConnect) {
      dispatch(changeIsAlreadyRunConnect(new Date().getTime()));
      handleConnectMqtt();
    }
  }, [
    isGetMqttConfigSuccess,
    isAlreadyRunConnect,
    dispatch,
    handleConnectMqtt,
  ]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      handleCheckConfigs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appConfigs]);
  return <div className="MqttContainer NVM"></div>;
}
