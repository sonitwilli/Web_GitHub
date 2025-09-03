import Image from 'next/image';
import React, { useState } from 'react';
import PackageControl from './PackageControl';
import PoliciesComponent from './Policies';

const iconData = [
  {
    src: '/images/landing-page/icon-1.png',
    text: 'Xem hàng ngàn nội dung <br />giải trí đỉnh cao',
  },
  {
    src: '/images/landing-page/icon-2.png',
    text: 'Phim bộ, phim chiếu rạp <br />mới nhất &amp; giải bóng đá đỉnh cao',
  },
  {
    src: '/images/landing-page/icon-3.png',
    text: 'Chất lượng cao',
  },
];
const logoBrand = [
  { src: '/images/landing-page/fpt.png', alt: 'fpt', width: 100, height: 67 },
  // {
  //   src: '/images/landing-page/viettel.png',
  //   alt: 'viettel',
  //   width: 125,
  //   height: 53,
  // },
  // {
  //   src: '/images/landing-page/mobifone.png',
  //   alt: 'mobifone',
  //   width: 169,
  //   height: 28,
  // },
  // {
  //   src: '/images/landing-page/vinaphone2.jpg',
  //   alt: 'vinaphone',
  //   width: 146,
  //   height: 34,
  // },
];

const Service3GComponent = () => {
  const [selectedTelcos, setSelectedTelcos] = useState<string>('fpt');

  const handleOnClickTelcos = (telco: string) => {
    if (telco) {
      setSelectedTelcos(telco);
    }
  };
  return (
    <div className="mt-20 w-full">
      {/* Banner */}
      <Image
        src="/images/landing-page/banner_no_button.jpg"
        className="w-full"
        alt="banner"
        width={1920}
        height={800}
        quality={100}
      />

      {/* Intro */}
      <div className="flex flex-col lg:flex-row items-center justify-center w-full min-h-[343px] bg-white-smoke py-12 box-border font-light">
        {iconData.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center h-[247px] w-[393px] text-eerie-black relative"
          >
            <Image
              src={item.src}
              alt={`icon-${idx + 1}`}
              width={234}
              height={235}
            />
            <span
              className="text-center absolute top-45"
              dangerouslySetInnerHTML={{ __html: item.text }}
            />
          </div>
        ))}
      </div>

      {/* List 3G */}
      <div
        className="bg-cover min-h-[793px] w-full flex flex-col items-center bg-center"
        style={{ backgroundImage: `url('/images/landing-page/bg.jpg')` }}
      >
        <div className="pt-12 pb-3 font-light text-center">
          <div className="text-4xl">
            <span className="font-bold">Đăng ký</span> các gói 3G/4G trực tiếp
            từ nhà mạng
          </div>
          <div className="text-xl pt-4">
            Chọn nhà mạng để đăng ký và đăng nhập để sử dụng gói 3G/4G
          </div>
        </div>

        <div className="flex gap-8 mt-8 flex-wrap justify-center">
          {logoBrand.map((logo, idx) => (
            <div
              onClick={() => handleOnClickTelcos(logo.alt)}
              key={idx}
              className="w-[90%] lg:w-[232px] h-[75px] relative flex items-center justify-center bg-white 
              rounded-xl px-1 py-4 box-border cursor-pointer hover:shadow-2xl transition-shadow duration-150"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                quality={100}
              />
            </div>
          ))}

          <div className="w-full">
            <PackageControl selectedTelcos={selectedTelcos} />
          </div>
        </div>
      </div>

      {/* Điều khoản và dịch vụ */}
      <div className="flex items-center justify-center w-full bg-white text-bg-gray mt-[-100px]">
        <PoliciesComponent />
      </div>
    </div>
  );
};

export default Service3GComponent;
