import { usePlayerPageContext } from '../context/PlayerPageContext';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import { useAppDispatch } from '@/lib/store';
import styles from './PlayerLogin.module.css';
export default function PlayerLogin() {
  const { setShowModalLogin } = usePlayerPageContext();
  const dispatch = useAppDispatch();
  return (
    <div
      id="player-login-modal"
      className={`fixed w-full h-full top-0 left-0 flex items-center justify-center z-[99] bg-black-06 ${styles.modal}`}
    >
      <div className="w-[400px] max-w-full p-[32px] bg-eerie-black rounded-[16px]">
        <div className="text-center text-white-smoke font-[600] text-[24px] leading-[130%] tracking-[0.48px] mb-[16px]">
          Đăng nhập tài khoản
        </div>
        <div className="text-center text-white-smoke  leading-[130%] tracking-[0.32px] mb-[16px]">
          <span className="text-spanish-gray">
            Bạn cần thực hiện đăng nhập để tiếp tục sử dụng dịch vụ
          </span>
        </div>
        <div className="grid grid-cols-2 gap-[16px] text-white-smoke font-[600]">
          <button
            className="bg-charleston-green flex items-center justify-center h-[48px] hover:cursor-pointer rounded-[40px]"
            onClick={() => {
              if (setShowModalLogin) setShowModalLogin(false);
            }}
          >
            Đóng
          </button>
          <button
            className="fpl-bg flex items-center justify-center h-[48px] hover:cursor-pointer rounded-[40px]"
            onClick={() => {
              dispatch(openLoginModal());
              if (setShowModalLogin) setShowModalLogin(false);
            }}
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
