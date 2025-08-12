export interface MonitorPlayerError {
  content?: string;
  code?: string;
  category?: string;
}

export interface MonitorChannelType {
  _id?: string;
  id?: string;
  name?: string;
  verimatrix?: boolean | string;
  source_provider?: string;
  auto_profile?: string;
}

export interface MonitorQualityType {
  _id?: string;
  id?: string;
  name?: string;
  label?: string;
  manifest_id?: string;
  is_auto_profile?: boolean;
  resolvedUri?: string;
}

export interface MonitorStreamDetail {
  src?: string;
  url?: string;
}

export interface MonitorEventType {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  name?: string;
  is_event?: boolean;
}

export interface MonitorDeviceType {
  name: string;
  val: string;
}

export interface MonitorQualityOption {
  name: string;
  val: string;
}

export interface MonitorPlayerQuantityOption {
  name: string;
  val: number;
}

export interface MonitorPlayerProps {
  listChannel: MonitorChannelType[];
  deviceMonitor?: string;
  index?: number;
  qualityAll?: {
    val?: string;
  };
}

export interface MonitorPlayerEventProps {
  listChannel: MonitorChannelType[];
  deviceMonitor?: string;
  index?: number;
  qualityAll?: {
    val?: string;
  };
  dataEvent: MonitorEventType;
}

export interface MonitorPageProps {
  listChannel: MonitorChannelType[];
  dataChannel: MonitorChannelType;
}

export interface MonitorChannelPageProps {
  initialListChannel?: MonitorChannelType[];
  initialListEvent?: MonitorEventType[];
  platformQuery?: string;
}

export interface MonitorPlayerErrorProps {
  errors: MonitorPlayerError[];
}

export interface MonitorApiResponse<T = unknown> {
  data?: T;
  Channel?: MonitorChannelType;
  Channels?: MonitorChannelType[];
  status?: number;
}
