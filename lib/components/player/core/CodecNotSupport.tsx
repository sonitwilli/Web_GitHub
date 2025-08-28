import { useAppSelector } from '@/lib/store';
import { usePlayerPageContext } from '../context/PlayerPageContext';

export default function CodecNotSupport() {
  const { isExpanded } = usePlayerPageContext();
  const { messageConfigs } = useAppSelector((s) => s.app);
  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-black-086 ${
        isExpanded ? '' : 'rounded-[16px]'
      }`}
    >
      <div className="text-center p-[16px] max-w-[528px]">
        <p className="font-[600] text-[24px] text-white-smoke mb-[16px]">
          {messageConfigs?.unsupport_video_codec?.title ||
            'Không hỗ trợ định dạng video'}
        </p>
        <p className="text-silver-chalice">
          {messageConfigs?.unsupport_video_codec?.description ||
            'Thiết bị của bạn không hỗ trợ định dạng video này. Vui lòng thử chọn một nội dung khác hoặc sử dụng thiết bị khác để tiếp tục xem.'}
        </p>
      </div>
    </div>
  );
}
