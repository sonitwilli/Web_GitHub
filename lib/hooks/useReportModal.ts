import { useState, useEffect, useCallback } from 'react';
import {
  getReportOptions,
  submitReport,
  SubmitReportRequest,
} from '@/lib/api/report';
import { showToast } from '@/lib/utils/globalToast';

interface ReportOption {
  text: string;
  value: string;
}

interface ReportMsg {
  title: string;
  desc: string;
}

interface UseReportModalProps {
  dataChannel?: {
    _id?: string;
    enable_report?: string;
    tracking?: {
      content_type?: string;
    };
  };
  currentEpi?: string;
  currentUser?: { id?: string; name?: string } | null;
  videoElement?: HTMLVideoElement | null;
  onRequireLogin?: () => void;
}

interface UseReportModalReturn {
  options: ReportOption[];
  reportMsg: ReportMsg | null;
  loading: boolean;
  error: string | null;
  handleSubmitReport: (data: SubmitReportRequest) => Promise<void>;
  handlePlayVideo: () => void;
  handlePauseVideo: () => void;
  getListReport: () => Promise<
    | {
        data: Array<{ id?: string; msg?: string }>;
        msg: string;
        status: string;
        error_code: string;
      }
    | undefined
  >;
  showToastReport: () => void;
  handleReportButtonClick: () => Promise<void>;
}

export const useReportModal = ({
  dataChannel,
  currentEpi,
  currentUser,
  videoElement,
  onRequireLogin,
}: UseReportModalProps = {}): UseReportModalReturn => {
  const [options, setOptions] = useState<ReportOption[]>([]);
  const [reportMsg, setReportMsg] = useState<ReportMsg | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show toast report
  const showToastReport = useCallback(() => {
    showToast({
      title: reportMsg?.title || '',
      desc: reportMsg?.desc || '',
    });
  }, [reportMsg]);

  // Get list of report options
  const getListReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getReportOptions({
        item_id: dataChannel?._id || '',
        chapter_id: currentEpi || '0',
        type_content: dataChannel?.tracking?.content_type || '',
      });

      const {
        data,
        msg = 'Đã có lỗi xảy ra, vui lòng thử lại sau.',
        status,
        error_code,
      } = response.data || {};

      if (
        (status === '0' && error_code === '1') ||
        !data ||
        data.length === 0
      ) {
        setReportMsg({ title: 'Thông báo', desc: msg });
        showToastReport();
        return {
          data: [],
          msg,
          status: status || '0',
          error_code: error_code || '1',
        };
      }

      return {
        data: data || [],
        msg,
        status: status || '1',
        error_code: error_code || '0',
      };
    } catch (error: unknown) {
      const errorMsg =
        (error as { response?: { data?: { msg?: string } } })?.response?.data
          ?.msg || 'Đã có lỗi xảy ra, vui lòng thử lại sau.';
      setReportMsg({
        title: 'Thông báo',
        desc: errorMsg,
      });
      setError(errorMsg);
      showToastReport();
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [dataChannel, currentEpi, showToastReport]);

  // Handle submit report
  const handleSubmitReport = useCallback(
    async (data: SubmitReportRequest) => {
      try {
        setLoading(true);
        setError(null);

        const response = await submitReport(data);
        const {
          msg = 'Đã có lỗi xảy ra, vui lòng thử lại sau.',
          status,
          error_code,
        } = response.data || {};

        if (status === '0' && error_code === '1') {
          setReportMsg({ title: 'Thông báo', desc: msg });
          showToastReport();
          return;
        }

        setReportMsg({ title: 'Báo cáo đã được gửi', desc: msg });
        showToastReport();
      } catch (error: unknown) {
        const errorMsg =
          (error as { response?: { data?: { msg?: string } } })?.response?.data
            ?.msg || 'Đã có lỗi xảy ra, vui lòng thử lại sau.';
        setReportMsg({
          title: 'Thông báo',
          desc: errorMsg,
        });
        setError(errorMsg);
        showToastReport();
      } finally {
        setLoading(false);
      }
    },
    [showToastReport],
  );

  // Handle video play
  const handlePlayVideo = useCallback(() => {
    if (videoElement) {
      videoElement.play();
    }
  }, [videoElement]);

  // Handle video pause
  const handlePauseVideo = useCallback(() => {
    if (videoElement) {
      videoElement.pause();
    }
  }, [videoElement]);

  // Handle report button click - to be called from existing button
  const handleReportButtonClick = useCallback(async () => {
    if (!currentUser?.id || !currentUser?.name) {
      onRequireLogin?.();
      return;
    }

    const result = await getListReport();
    if (result?.data) {
      const reportOptions = result.data.map(
        (item: { id?: string; msg?: string }) => ({
          text: item?.msg || '',
          value: item?.id || '',
        }),
      );
      setOptions(reportOptions);
    }
  }, [currentUser, getListReport, onRequireLogin]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const toastContainer = document.querySelector('#toast-container');
      if (toastContainer) toastContainer.remove();
    };
  }, []);

  useEffect(() => {
    if (reportMsg) {
      showToastReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportMsg]);

  return {
    options,
    reportMsg,
    loading,
    error,
    handleSubmitReport,
    handlePlayVideo,
    handlePauseVideo,
    getListReport,
    showToastReport,
    handleReportButtonClick,
  };
};

export default useReportModal;
