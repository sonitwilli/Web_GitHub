interface DataInfoTrackingCommon {
  ItemName?: string;
  IssueId?: string;
  ErrCode?: string;
  ErrMessage?: string;
  Url?: string;
}
export const getDataInfoTrackingCommon = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const dataInfoTrackingCommon: DataInfoTrackingCommon = {
    ItemName: user?.user_phone || '',
  };
  return dataInfoTrackingCommon;
};

export const getPlayerInfoTracking = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const dataInfoTrackingCommon: DataInfoTrackingCommon = {
    ItemName: user?.user_phone || '',
  };
  return dataInfoTrackingCommon;
};
