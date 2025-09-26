// https://wiki.fptplay.net/pages/viewpage.action?spaceKey=BE&title=Docs#Docs-Sequencediagram
// https://wiki.fptplay.net/pages/viewpage.action?spaceKey=BE&title=Meeting+Note

import { useEffect, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import {
  MQTT_CONFIG,
  MQTT_CONNECT_SUCCESS,
  MQTT_PUBLISH_STATUS,
  MQTT_SUBSCRIBE_SUCCESS,
  MQTT_SUBSCRIBE_TOPIC,
} from '../constant/texts';
import { store, useAppDispatch } from '../store';
import { getMqttConfigs, MqttConfigType } from '../api/mqtt';
import {
  changeIsAlreadyRunConnect,
  changeIsConnected,
  changeIsGetMqttConfigSuccess,
  changeIsSubscribeSuccess,
  changeMqttConfig,
} from '../store/slices/mqttSlice';
import { removeSessionStorage, saveSessionStorage } from '../utils/storage';

export const stopMqttManual = () => {
  if (typeof window === 'undefined') {
    return;
  }
  const connected = sessionStorage.getItem(MQTT_CONNECT_SUCCESS);
  const subed = sessionStorage.getItem(MQTT_SUBSCRIBE_SUCCESS);
  const topic = sessionStorage.getItem(MQTT_SUBSCRIBE_TOPIC);
  if (
    !window.mqttClient ||
    connected !== 'true' ||
    subed !== 'true' ||
    !topic
  ) {
    return;
  }
  try {
    console.log('--- MQTT Start UnSubscribe ' + new Date().toISOString(), {
      topic,
    });
    window.mqttClient.unsubscribe(topic, (err, granted) => {
      if (!err) {
        console.log(
          '--- MQTT UnSubscribe success ' + new Date().toISOString(),
          { topic, granted },
        );
        saveSessionStorage({
          data: [
            {
              key: MQTT_SUBSCRIBE_SUCCESS,
              value: 'false',
            },
          ],
        });
        store.dispatch(changeIsSubscribeSuccess(false));
        if (window.mqttClient?.connected) {
          window.mqttClient.end(true, () => {
            saveSessionStorage({
              data: [
                {
                  key: MQTT_CONNECT_SUCCESS,
                  value: 'false',
                },
              ],
            });
            console.log('--- MQTT Client ended ' + new Date().toISOString());
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.mqttClient = null;
            store.dispatch(changeIsConnected(false));
          });
        }
      }
    });
  } catch {}
};

export const useMqtt = () => {
  const retryConfigDelay = useRef(0);
  const retryConfigTimeout = useRef<NodeJS.Timeout>(null);
  const dispatch = useAppDispatch();
  const reconnectDuration = useRef(0);
  const subscribeTimeout = useRef<NodeJS.Timeout>(null);

  const handleGetMqttConfigs = async () => {
    console.log('--- MQTT GET MQTT CONFIG ' + new Date().toISOString());
    const { configs: appConfigs } = store?.getState()?.app;
    if (appConfigs?.mqtt?.enable !== '1') {
      return;
    }
    const { min_retry_interval, max_retry_interval, random } =
      appConfigs?.mqtt?.automatic_retry || {};

    const isValidRetry =
      Number(min_retry_interval) > 0 &&
      Number(max_retry_interval) > 0 &&
      Number(max_retry_interval) > Number(min_retry_interval);

    let timeout = 0;

    if (retryConfigDelay?.current > 0) {
      timeout = retryConfigDelay?.current * 2;
    } else {
      timeout = Number(min_retry_interval);
    }

    if (timeout > Number(max_retry_interval)) {
      timeout = Number(max_retry_interval);
    }
    retryConfigDelay.current = timeout;
    const finalTimeout = timeout + Number(random || 0);

    try {
      const res = await getMqttConfigs();
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(
          MQTT_CONFIG,
          JSON.stringify(res?.data?.data || {}),
        );
      }
      dispatch(changeMqttConfig(res?.data?.data || {}));
      dispatch(changeIsGetMqttConfigSuccess(new Date().getTime()));
      if (retryConfigTimeout?.current) {
        clearTimeout(retryConfigTimeout.current);
      }
    } catch {
      if (isValidRetry) {
        retryConfigTimeout.current = setTimeout(() => {
          handleGetMqttConfigs();
        }, finalTimeout * 1000);
      }
    }
  };

  const getRealConfigs = () => {
    const config = sessionStorage.getItem(MQTT_CONFIG)
      ? sessionStorage.getItem(MQTT_CONFIG)
      : null;
    const mqttConfig: MqttConfigType =
      store?.getState().mqtt.mqttConfigs ||
      (config
        ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          JSON.parse(config)
        : {});

    return mqttConfig;
  };

  const checkExpireTimeConfig = () => {
    try {
      const configData = getRealConfigs();
      const expires = configData?.expires;
      if (!expires) {
        return false;
      }
      const expireAt = Number(expires) * 1000;
      if (expireAt >= new Date().getTime()) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const subscribeUserAndDevice = ({
    action,
    cbSuccess,
    cbFailed,
    cbAll,
  }: {
    action?: 'sub' | 'unsub';
    cbSuccess?: () => void;
    cbFailed?: () => void;
    cbAll?: () => void;
  } = {}) => {
    if (action === 'unsub') {
      const topic = sessionStorage.getItem(MQTT_SUBSCRIBE_TOPIC);
      if (topic && window.mqttClient) {
        console.log('--- MQTT Start UnSubscribe ' + new Date().toISOString(), {
          topic,
          action,
        });
        window.mqttClient.unsubscribe(topic, (err, granted) => {
          if (!err) {
            console.log(
              '--- MQTT UnSubscribe success ' + new Date().toISOString(),
              { topic, granted },
            );
            if (cbSuccess) {
              cbSuccess();
            }
            if (cbAll) {
              cbAll();
            }
            dispatch(changeIsSubscribeSuccess(false));
            saveSessionStorage({
              data: [
                {
                  key: MQTT_SUBSCRIBE_SUCCESS,
                  value: 'false',
                },
              ],
            });
          } else {
            console.log(
              '--- MQTT UnSubscribe failed ' + new Date().toISOString(),
              {
                topic,
                err,
              },
            );
            if (cbFailed) {
              cbFailed();
            }
            if (cbAll) {
              cbAll();
            }
            dispatch(changeIsSubscribeSuccess(false));
          }
        });
      }
      return;
    }
    try {
      const lc = localStorage?.getItem('user');
      const tk = localStorage?.getItem('token');
      const dv = sessionStorage.getItem('tabId');

      if (lc && tk && dv && window.mqttClient) {
        const user = JSON.parse(lc);
        if (user?.user_id_str) {
          const topic = `remote/${user?.user_id_str}/${dv}`;
          saveSessionStorage({
            data: [
              {
                key: MQTT_SUBSCRIBE_TOPIC,
                value: topic,
              },
            ],
          });
          console.log('--- MQTT Start Subscribe ' + new Date().toISOString(), {
            topic,
            action,
          });
          window.mqttClient.subscribe(
            topic,
            {
              qos: (Number(getRealConfigs()?.option?.qos) || 0) as 0 | 1 | 2,
            },
            (err, granted) => {
              if (!err) {
                console.log(
                  '--- MQTT Subscribe success ' + new Date().toISOString(),
                  { topic, granted },
                );
                dispatch(changeIsSubscribeSuccess(true));
                saveSessionStorage({
                  data: [
                    {
                      key: MQTT_SUBSCRIBE_SUCCESS,
                      value: 'true',
                    },
                  ],
                });
                if (cbSuccess) {
                  cbSuccess();
                }
                if (cbAll) {
                  cbAll();
                }
              } else {
                saveSessionStorage({
                  data: [
                    {
                      key: MQTT_SUBSCRIBE_SUCCESS,
                      value: 'false',
                    },
                  ],
                });
                dispatch(changeIsSubscribeSuccess(false));
                console.log(
                  '--- MQTT Subscribe failed ' + new Date().toISOString(),
                  {
                    topic,
                    err,
                  },
                );
                if (cbFailed) {
                  cbFailed();
                }
                if (cbAll) {
                  cbAll();
                }
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
    saveSessionStorage({
      data: [
        {
          key: MQTT_CONNECT_SUCCESS,
          value: 'true',
        },
      ],
    });
    dispatch(changeIsConnected(true));
    const configData = getRealConfigs();
    retryConfigDelay.current = 0;
    const { min_retry_interval } =
      configData?.option?.automatic_reconnect || {};
    reconnectDuration.current = Number(min_retry_interval);
    if (subscribeTimeout.current) {
      clearTimeout(subscribeTimeout.current);
    }
    subscribeTimeout.current = setTimeout(() => {
      subscribeUserAndDevice();
    }, 500);
  };

  const handleStopMqttUser = ({ cb }: { cb?: () => void } = {}) => {
    subscribeUserAndDevice({
      action: 'unsub',
      cbAll: () => {
        disconnectMqtt({ cb });
      },
    });
  };

  const handleExpiredToken = () => {
    disconnectMqtt({
      cb: () => {
        console.log('--- MQTT CB  ' + new Date().toISOString());
        dispatch(changeIsSubscribeSuccess(false));
        dispatch(changeIsGetMqttConfigSuccess(0));
        dispatch(changeIsAlreadyRunConnect(0));
        handleGetMqttConfigs();
        if (retryConfigTimeout?.current) {
          clearTimeout(retryConfigTimeout.current);
        }
      },
    });
  };

  const connectMqtt = async () => {
    try {
      const { configs: appConfigs } = store?.getState()?.app;
      if (appConfigs?.mqtt?.enable !== '1') {
        return;
      }
      const configData = getRealConfigs();

      const { min_retry_interval, max_retry_interval } =
        configData?.option?.automatic_reconnect || {};

      const allowReconnect =
        Number(min_retry_interval) > 0 &&
        Number(max_retry_interval) > 0 &&
        Number(max_retry_interval) > Number(min_retry_interval);

      reconnectDuration.current = Number(min_retry_interval);
      const MQTT_OPTIONS = {
        protocolVersion: 5,
        clientId: `${
          store?.getState().app.configs?.x_agent || 'web'
        }__${sessionStorage.getItem('tabId')}`,
        clean: true,
        // password: configData?.token,
        username: configData?.token,
        keepalive: Number(configData?.option?.keep_alive),
        connectTimeout: Number(configData?.option?.connection_timeout) * 1000,
        // connectTimeout: 0,
        qos: (Number(configData?.option?.qos) || 0) as 0 | 1 | 2,
        reconnectPeriod: allowReconnect ? Number(min_retry_interval) * 1000 : 0, // apply cho lần reconnect đầu tiên
        will: {
          topic: 'will/disconnect',
          payload: '{}',
          qos: Number(configData?.option?.qos),
        },
        reconnectOnConnackError: !!allowReconnect,
      };

      console.log('--- MQTT connectMqtt ', new Date().toISOString(), {
        configData,
        MQTT_OPTIONS,
      });

      if (configData?.url?.ws) {
        console.log('--- MQTT Start Connect ', new Date().toISOString());
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        /*@ts-ignore*/
        window.mqttClient = mqtt.connect(configData?.url?.ws, MQTT_OPTIONS);

        window.mqttClient.on('connect', (ev) => {
          console.log(
            '--- MQTT Connected success ' + new Date().toISOString(),
            ev,
          );
          handleConnected();
          if (window.mqttClient) {
            window.mqttClient.on('message', (topic, payload) => {
              console.log(
                `--- MQTT message for topic ${topic}: ${payload} ` +
                  new Date().toISOString(),
              );
              // Handle message here
            });
          }
        });
        window.mqttClient.on('disconnect', (packet) => {
          saveSessionStorage({
            data: [
              {
                key: MQTT_CONNECT_SUCCESS,
                value: 'false',
              },
            ],
          });
          // khi token expired
          console.log(
            '--- MQTT Disconnect: ' + new Date().toISOString(),
            packet,
          );
          const isExpireTokenError =
            packet?.reasonCode === 135 || checkExpireTimeConfig();
          if (isExpireTokenError) {
            subscribeUserAndDevice({ action: 'unsub' });
            console.log(
              '--- MQTT handle expired token ' + new Date().toISOString(),
            );
            handleExpiredToken();
          }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.mqttClient.on('error', (err: any) => {
          console.log('--- MQTT Error ' + new Date().toISOString(), {
            err,
            code: err?.code,
          });
          // const isExpireTokenError =
          //   err?.code === 134 || checkExpireTimeConfig();
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        /*@ts-ignore*/

        window.mqttClient.on('close', () => {
          console.log(`--- MQTT Connection Closed ` + new Date().toISOString());
        });

        window.mqttClient.on('reconnect', () => {
          let time = 0;
          reconnectDuration.current = reconnectDuration.current * 2;
          time = reconnectDuration.current;
          if (time >= Number(max_retry_interval)) {
            time = Number(max_retry_interval);
            reconnectDuration.current = Number(max_retry_interval);
          }
          console.log(
            '--- MQTT Reconnect ',
            new Date().toISOString(),
            'time: ',
            time,
          );
          if (window.mqttClient) {
            window.mqttClient.options.reconnectPeriod = time * 1000;
          }
        });
      }
    } catch {}
  };

  const disconnectMqtt = ({ cb }: { cb?: () => void } = {}) => {
    if (window.mqttClient) {
      window.mqttClient.end(true, () => {
        console.log('--- MQTT Client ended ' + new Date().toISOString());
        if (cb) {
          cb();
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.mqttClient = null;
      });
    }
  };

  const clearAllTimeoutMqtt = () => {
    try {
      if (retryConfigTimeout?.current) {
        clearTimeout(retryConfigTimeout.current);
      }
    } catch {}
  };

  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      removeSessionStorage({
        data: [
          MQTT_CONNECT_SUCCESS,
          MQTT_SUBSCRIBE_SUCCESS,
          MQTT_PUBLISH_STATUS,
          MQTT_SUBSCRIBE_TOPIC,
          MQTT_CONFIG,
        ],
      });
    });
    return () => {
      clearAllTimeoutMqtt();
    };
  }, []);

  return {
    connectMqtt,
    disconnectMqtt,
    handleGetMqttConfigs,
    subscribeUserAndDevice,
    handleStopMqttUser,
  };
};

// Extend window int = {}erface
declare global {
  interface Window {
    mqttClient: MqttClient | null;
  }
}
