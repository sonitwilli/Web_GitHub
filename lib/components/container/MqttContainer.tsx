import { getMqttConfigs } from '@/lib/api/mqtt';
import { MQTT_CONFIG } from '@/lib/constant/texts';
import { useMqtt } from '@/lib/hooks/useMqtt';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { changeMqttConfig } from '@/lib/store/slices/mqttSlice';
import { useEffect, useRef } from 'react';

export default function MqttContainer() {
  const { configs: appConfigs } = useAppSelector((state) => state.app);
  const { connectMqtt } = useMqtt();
  const dispatch = useAppDispatch();
  const isCheck = useRef(false);
  const handleGetMqttConfigs = async () => {
    try {
      const res = await getMqttConfigs();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          MQTT_CONFIG,
          JSON.stringify(res?.data?.data || {}),
        );
      }
      dispatch(changeMqttConfig(res?.data?.data || {}));
    } catch {}
  };
  const handleCheckConfigs = async () => {
    if (appConfigs) {
      if (isCheck?.current) {
        return;
      }
      const keys = Object.keys(appConfigs);
      if (keys.length > 0) {
        isCheck.current = true;
        await handleGetMqttConfigs();
        connectMqtt();
      }
    }
  };
  useEffect(() => {
    handleCheckConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appConfigs]);
  return <div className="MqttContainer NVM"></div>;
}
