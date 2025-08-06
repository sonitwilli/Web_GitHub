import { FC } from 'react';
import { ChannelDetailType } from '@/lib/api/channel';
import { useBroadcastSchedule } from '@/lib/hooks/useBroadcastSchedule';
import BroadcastSchedule from './BroadcastSchedule';

type Props = {
  channelId: string;
  dataChannel?: ChannelDetailType;
  onScheduleSelect?: (src: string) => void;
  isFullscreen?: boolean;
  onClose?: () => void;
  visible?: boolean;
};

const BroadcastScheduleWrapper: FC<Props> = ({
  channelId,
  dataChannel,
  onScheduleSelect,
  isFullscreen,
  onClose,
  visible,
}) => {
  // Sử dụng hook để lấy tất cả state và logic
  const {
    scheduleList,
    currentTime,
    selectedDate,
    setSelectedDate,
    stateErrorBroadcastSchedule,
    handleTimeShiftSelect,
    activeScheduleId,
    dataChannel: scheduleDataChannel,
  } = useBroadcastSchedule(channelId, dataChannel, onScheduleSelect);

  return (
    <BroadcastSchedule
      scheduleList={scheduleList}
      currentTime={currentTime}
      selectedDate={selectedDate}
      stateErrorBroadcastSchedule={stateErrorBroadcastSchedule}
      onDateChange={setSelectedDate}
      dataChannel={scheduleDataChannel || ({} as ChannelDetailType)}
      isFullscreen={isFullscreen}
      onTimeShiftSelect={handleTimeShiftSelect}
      activeScheduleId={activeScheduleId}
      onClose={onClose}
      visible={visible}
    />
  );
};

export default BroadcastScheduleWrapper;
