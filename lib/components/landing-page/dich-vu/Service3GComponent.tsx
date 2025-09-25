import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import PackageControl from './PackageControl';
import PoliciesComponent from './Policies';
import { fetchDataPlans } from '../../../../lib/api/landing-page';
import type { DichVuData } from './types';

const Service3GComponent = () => {
  const [selectedTelcos, setSelectedTelcos] = useState<string>('fpt');
  const [data, setData] = useState<DichVuData | null>(null);

  const handleOnClickTelcos = (telco: string) => {
    setSelectedTelcos(telco);
  };

  useEffect(() => {
    let mounted = true;
    
    const getData = async () => {
      try {
        const d = await fetchDataPlans();
        if (mounted && d) {
          // Transform the API response to match the expected structure
          const transformedData = {
            iconData: d.icon_data || [],
            logoBrand: d.logo_brand || [],
            packages: d.packages || {},
            policies: d.policies || { title: '', columns: [] },
            telcos: d.telcos || {}
          };
          setData(transformedData);
        }
      } catch {}
    };
    
    getData();
    
    return () => {
      mounted = false;
    };
  }, []);

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
  {data?.iconData?.map((item, idx: number) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center h-[247px] w-[393px] text-eerie-black relative"
          >
            <img
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
          {data?.logoBrand?.map((logo, idx: number) => (
            <div
              onClick={() => handleOnClickTelcos(logo.alt)}
              key={idx}
              className="w-[90%] lg:w-[232px] h-[75px] relative flex items-center justify-center bg-white 
              rounded-xl px-1 py-4 box-border cursor-pointer hover:shadow-2xl transition-shadow duration-150"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
              />
            </div>
          ))}

          <div className="w-full">
            <PackageControl selectedTelcos={selectedTelcos} data={data} />
          </div>
        </div>
      </div>

      {/* Điều khoản và dịch vụ */}
      <div className="flex items-center justify-center w-full bg-white text-bg-gray mt-[-100px]">
        <PoliciesComponent data={data} />
      </div>
    </div>
  );
};

export default Service3GComponent;