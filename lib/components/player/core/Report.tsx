/* eslint-disable jsx-a11y/alt-text */

import { useState } from 'react';
import { usePlayerPageContext } from '@/lib/components/player/context/PlayerPageContext';
import { useReportModal } from '@/lib/hooks/useReportModal';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '@/lib/store';
import ReportModal from '@/lib/components/modal/ReportModal';
import { SubmitReportRequest } from '@/lib/api/report';
import { changeTimeOpenModalRequireLogin } from '@/lib/store/slices/appSlice';

export default function Report() {
  const { dataChannel, portalTarget } = usePlayerPageContext();
  const [showModal, setShowModal] = useState(false);
  const dispatch = useAppDispatch();
  // Get current user from Redux store
  const userInfo = useSelector((state: RootState) => state.user.info);

  // Map user info to expected interface
  const currentUser = userInfo
    ? {
        id: userInfo.user_id_str || userInfo.user_id?.toString(),
        name: userInfo.user_full_name,
      }
    : null;

  // Get video element if available
  const videoElement = document.getElementById(
    'video-player',
  ) as HTMLVideoElement | null;

  const {
    options,
    handleSubmitReport,
    showToastReport,
    handleReportButtonClick,
  } = useReportModal({
    dataChannel,
    currentEpi: '0', // Use default value since ChannelDetailType doesn't have current_episode_id
    currentUser,
    videoElement,
    onRequireLogin: () => {
      dispatch(changeTimeOpenModalRequireLogin(new Date().getTime()));
    },
  });

  const handleClick = async () => {
    // Use the hook's method to handle report button click
    await handleReportButtonClick();

    if (currentUser?.id && currentUser?.name) {
      // Then show our modal
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (data: SubmitReportRequest) => {
    try {
      await handleSubmitReport(data);
      setShowModal(false);
      showToastReport();
    } catch (err) {
      console.error('Error submitting report:', err);
    }
  };

  return (
    <>
      <div className="c-control-button c-control-button-report">
        <div onClick={handleClick} className="c-control-button-icon">
          <img
            src="/images/player/report.png"
            className="w-[24px] h-[24px] tablet:w-[32px] tablet:h-[32px]"
          />
        </div>
        <div className="c-control-hover-text">Báo cáo sự cố</div>
      </div>

      {showModal && (
        <ReportModal
          open={showModal}
          onHidden={handleCloseModal}
          modalContent={{
            title: 'Bạn gặp vấn đề gì?',
            buttons: {
              cancel: 'Hủy',
              accept: 'Gửi',
            },
          }}
          dataPost={{
            video_id: dataChannel?._id || dataChannel?.id || '',
            chapter_id: '0',
            ref_id: dataChannel?.ref_id || '',
            chapter_ref_id: '0',
            app_id: dataChannel?.app_id || '',
            report_ids: '',
          }}
          options={options.map((opt) => ({
            value: opt.value,
            label: opt.text,
          }))}
          onSubmit={handleSubmit}
          portalTarget={portalTarget}
        />
      )}
    </>
  );
}
