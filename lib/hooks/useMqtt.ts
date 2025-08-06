// https://wiki.fptplay.net/pages/viewpage.action?spaceKey=BE&title=Docs#Docs-Sequencediagram
// https://wiki.fptplay.net/pages/viewpage.action?spaceKey=BE&title=Meeting+Note

import { useRef, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { MQTT_CONFIG } from '../constant/texts';
import { store, useAppDispatch } from '../store';
import { MqttConfigType } from '../api/mqtt';
import {
  changeIsAlreadyRunConnect,
  changeIsConnected,
} from '../store/slices/mqttSlice';

export const useMqtt = () => {
  const [connectStatus, setConnectStatus] = useState('');
  const dispatch = useAppDispatch();
  const reconnectDuration = useRef(0);
  const reconnectCount = useRef(0);
  const getRealConfigs = () => {
    const config = localStorage.getItem(MQTT_CONFIG);
    const mqttConfig: MqttConfigType =
      store?.getState().mqtt.mqttConfigs || (config
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          JSON.parse(config)
        : {});

    return mqttConfig;
  };

  const subscribeUserAndDevice = () => {
    try {
      const lc = localStorage?.getItem('user');
      const tk = localStorage?.getItem('token');
      const dv = sessionStorage.getItem('tabId');

      if (lc && tk && dv) {
        const user = JSON.parse(lc);
        if (user?.user_id_str) {
          const topic = `remote/${user?.user_id_str}/${dv}`;
          window.mqttClient.subscribe(
            topic,
            { qos: (Number(getRealConfigs()?.option?.qos) || 0) as 0 | 1 | 2 },
            (err) => {
              if (!err) {
                console.log('--- MQTT Subscribed success', topic);
              } else {
                console.error('--- MQTT Subscribed failed', {
                  topic,
                  err,
                });
              }
            },
          );
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log('error subscribeUserAndDevice', error);
    }
  };

  const handleConnected = () => {
    dispatch(changeIsConnected(true));
    subscribeUserAndDevice();
  };

  const connectMqtt = async () => {
    const { configs: appConfigs } = store?.getState()?.app;
    if (appConfigs?.mqtt?.enable !== '1') {
      return;
    }
    const { isAlreadyRunConnect } = store?.getState()?.mqtt;
    if (isAlreadyRunConnect) {
      return;
    }
    dispatch(changeIsAlreadyRunConnect(true));
    const configData = getRealConfigs();

    reconnectDuration.current =
      Number(configData?.option?.automatic_reconnect?.min_retry_interval) *
      1000;

    const MQTT_OPTIONS = {
      clientId: `${
        store?.getState().app.configs?.x_agent || 'web'
      }__${sessionStorage.getItem('tabId')}`,
      clean: true,
      password: configData?.token,
      username: configData?.token,
      keepalive: Number(configData?.option?.keep_alive),
      connectTimeout: Number(configData?.option?.connection_timeout) * 1000,
      qos: (Number(configData?.option?.qos) || 0) as 0 | 1 | 2,
      reconnectPeriod:
        configData?.option?.automatic_reconnect?.enable === '1' &&
        configData?.option?.automatic_reconnect?.min_retry_interval
          ? Number(
              configData?.option?.automatic_reconnect?.min_retry_interval,
            ) * 1000
          : 0,
    };

    if (configData?.url?.ws) {
      console.log('--- MQTT Start Connect: ', new Date().toISOString());

      window.mqttClient = mqtt.connect(configData?.url?.ws, MQTT_OPTIONS);

      window.mqttClient.on('connect', (ev) => {
        console.log('--- MQTT Connected success:', ev);
        handleConnected();
        window.mqttClient.on('message', (topic, payload) => {
          console.log(`--- MQTT message for topic ${topic}: ${payload}`);
          // Handle message here
        });
      });

      window.mqttClient.on('error', (err) => {
        console.log('--- MQTT error:', err, ' ', new Date().toISOString());
        setConnectStatus('Failed');
      });

      window.mqttClient.on('close', () => {
        console.log(`--- MQTT Connection Closed: `, new Date().toISOString());
      });

      window.mqttClient.on('reconnect', () => {
        let time =
          reconnectCount.current < 1
            ? reconnectDuration.current
            : reconnectDuration.current * 2 +
              Number(appConfigs?.mqtt?.automatic_retry?.random || 0) * 1000;
        const max =
          Number(configData?.option?.automatic_reconnect?.max_retry_interval) *
          1000;
        if (time >= max) {
          time = max;
        }
        console.log(
          '--- MQTT Reconnect at: ',
          new Date().toISOString(),
          'time: ',
          time,
        );

        reconnectDuration.current = time;
        window.mqttClient.options.reconnectPeriod = time;
        reconnectCount.current += 1;
      });
    }
  };

  const disconnectMqtt = () => {
    if (window.mqttClient) {
      window.mqttClient.end();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.mqttClient = null;
    }
  };

  return {
    connectStatus,
    connectMqtt,
    disconnectMqtt,
  };
};

// Extend window interface
declare global {
  interface Window {
    mqttClient: MqttClient;
  }
}
