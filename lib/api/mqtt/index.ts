import { AxiosResponse } from 'axios';
import { axiosInstance } from '../axios';

export interface MqttConfigType {
  token?: string;
  expires?: string;
  jwt_from?: string;
  url?: {
    mqtt?: string;
    tcp?: string;
    ws?: string;
  };
  option?: {
    enable_tls?: string;
    connection_timeout?: string;
    keep_alive?: string;
    qos?: string;
    automatic_reconnect?: {
      enable?: string;
      min_retry_interval?: string;
      max_retry_interval?: string;
    };
  };
}

export interface MqttConfigResponse {
  msg?: string;
  code?: number;
  data?: MqttConfigType;
  error_code?: string;
}
const getMqttConfigs = async (): Promise<AxiosResponse<MqttConfigResponse>> => {
  return axiosInstance.get('/config/message_broker/mqtt');
};

export { getMqttConfigs };
