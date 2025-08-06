import Image from 'next/image';

const InstallIntroductionCastComponent = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
      <Image
        src={'/images/logo_footer.png'}
        alt="logo"
        width={414}
        height={100}
        quality={100}
        className="mb-20 mt-[-30px] px-5"
      />
      <div className="text-center text-lg sm:text-2xl font-medium text-spanish-gray px-5">
        <span>Để chia sẻ nội dung trên thiết bị này,</span> <br />
        <span>Quý khách vui lòng tải ứng dụng FPT Play để tiếp tục.</span>
      </div>

      <div className="absolute bottom-5 sm:bottom-14 sm:right-21">
        <span className="text-base sm:text-2xl font-medium flex items-center whitespace-nowrap">
          Nhấn phím{' '}
          <span className="bg-jet rounded-4xl px-4 py-2 mx-2 text-[14px] select-none">
            BACK
          </span>{' '}
          trên remote để thoát
        </span>
      </div>
    </div>
  );
};

export default InstallIntroductionCastComponent;
