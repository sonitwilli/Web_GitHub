import { useState } from 'react';
import { PiUserCircleFill } from 'react-icons/pi';
import { BsClipboardX, BsClipboardCheck } from 'react-icons/bs';
import CaptchaBox from './CaptchaBox';
import { fetchDataVerifyMACAddress } from '@/lib/api/landing-page';
import ConfirmDialog, { ModalContent } from '../../modal/ModalConfirm';
import GuaranteeInformation from './GuaranteeInformation';
import { CONFIRM_BUTTON_TEXT } from '@/lib/constant/texts';
import {
  addOneYear,
  formatDate,
  formatMacAddress,
} from '@/lib/utils/formatString';

type MacData = {
  device_id?: string;
  created_date?: string;
  user_phone?: string;
  device_type?: string;
};

const GuaranteeComponent = () => {
  const [macAddress, setMacAddress] = useState<string>('');
  const [captcha, setCaptcha] = useState<string>('');
  const [inputCaptcha, setInputCaptcha] = useState<string>('');
  const [dataMac, setDataMac] = useState<MacData>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContent>({});
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);

  const isActive = macAddress.trim() !== '' && inputCaptcha.trim() !== '';

  const handleMacChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMacAddress(e.target.value);
    setMacAddress(formatted);
  };

  const showModal = (title: string, content: string) => {
    setModalContent({
      title,
      content,
      buttons: {
        cancel: 'Đóng',
      },
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (isActive && inputCaptcha.trim() === captcha.trim()) {
      try {
        const res = await fetchDataVerifyMACAddress(macAddress);
        if (res && res?.status === 200) {
          if (res.data?.status === 0) {
            showModal('Thông báo', 'Địa chỉ MAC không đúng. Vui lòng thử lại');
            setInputCaptcha('');
            setCaptchaRefreshKey((prev) => prev + 1);
            return;
          }
          setDataMac(res?.data);
        }
      } catch {
        showModal('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } else {
      showModal('Thông báo', 'Mã captcha chưa đúng. Vui lòng thử lại');
      setInputCaptcha('');
      setCaptchaRefreshKey((prev) => prev + 1);
      return;
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col items-center xl:flex-row bg-black-035 w-full md:w-[80%] rounded-3xl mt-25">
          <div className="h-full w-full md:w-[80%] xl:w-[50%] py-11 px-5 lg:pl-10 xl:pr-0">
            <span className="text-2xl font-bold text-light-gray">
              KIỂM TRA THÔNG TIN FPT PLAY BOX
            </span>
            <div className="flex gap-5 items-center px-3 bg-eerie-black w-full h-[55px] rounded-xl mt-10">
              <PiUserCircleFill className=" w-[30px] h-[30px]" />
              <input
                placeholder="Nhập địa chỉ MAC"
                className="w-full outline-none placeholder:normal-case placeholder:font-light border-none bg-transparent text-white uppercase"
                value={macAddress}
                onChange={handleMacChange}
              />
            </div>

            <div className="flex justify-between">
              <div className="flex gap-5 items-center px-15 bg-eerie-black w-[58%] h-[55px] rounded-xl mt-5">
                <input
                  placeholder="Nhập Captcha"
                  className="border-none outline-none placeholder:font-light bg-transparent text-white"
                  value={inputCaptcha}
                  onChange={(e) => setInputCaptcha(e.target.value)}
                />
              </div>

              <CaptchaBox
                onChange={(value) => setCaptcha(value)}
                refreshTrigger={captchaRefreshKey}
              />
            </div>

            <div className="flex justify-center w-full">
              <button
                disabled={!isActive}
                onClick={handleSubmit}
                className={`flex justify-center items-center text-primary-gray px-15 w-[65%] h-[55px] rounded-xl mt-12 select-none
                ${
                  isActive
                    ? 'fpl-bg opacity-100 cursor-pointer text-white'
                    : 'bg-raisin-black opacity-40'
                }
              `}
              >
                {CONFIRM_BUTTON_TEXT}
              </button>
            </div>
          </div>

          <div
            className="h-[4px] w-[80%] xl:h-[300px] xl:w-[3px] my-auto mx-12"
            style={{
              background:
                'linear-gradient(0deg, #202020 0%, #959595 50%, #202020 100%)',
            }}
          ></div>

          <div className="h-full w-full md:w-[80%] xl:w-[50%] py-11 px-5 lg:pr-10 xl:pl-0 text-light-gray">
            <span className="text-2xl font-bold ">THÔNG TIN BẢO HÀNH</span>

            <div className="flex flex-col gap-5 px-5 sm:px-10 py-8 bg-eerie-black w-full rounded-xl mt-10">
              <div className="flex items-center gap-3">
                <PiUserCircleFill className="w-[30px] h-[30px] ml-[-3px]" />
                Địa chỉ MAC:{' '}
                <span className="ml-auto">
                  {dataMac.device_id ? dataMac.device_id : ''}
                </span>
              </div>
              <hr className="text-dim-gray"></hr>
              <div className="flex items-center gap-3">
                <BsClipboardCheck className="w-[26px] h-[26px]" />
                Ngày kích hoạt:{' '}
                <span className="ml-auto">
                  {dataMac.created_date ? formatDate(dataMac.created_date) : ''}
                </span>
              </div>
              <hr className="text-dim-gray"></hr>
              <div className="flex items-center gap-3">
                <BsClipboardX className="w-[26px] h-[26px]" />
                Ngày hết hạn:{' '}
                <span className="ml-auto">
                  {dataMac.created_date ? addOneYear(dataMac.created_date) : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GuaranteeInformation />

      <ConfirmDialog
        open={isModalOpen}
        modalContent={modalContent}
        onCancel={() => setIsModalOpen(false)}
        onHidden={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default GuaranteeComponent;
