import React from 'react';

export default function ShortVideoContent() {
  return (
    <section 
      className="relative min-h-screen bg-[url('/images/moment/background.png')] bg-cover bg-center bg-no-repeat"
    >
      <div className="relative z-5 mx-auto px-4 py-16 pt-32 lg:py-24">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-9 items-center justify-items-center min-h-[80vh]">
          
          {/* Left side - Phone image */}
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src="/images/moment/left_item.png"
                alt="FPT Play Mobile App"
                className="w-80 h-auto lg:w-96 object-contain"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="text-white space-y-6 md:px-[96px] xl:px-0 xl:pr-[235px]">
            <h1 className="text-3xl lg:text-6xl font-bold mb-6 text-white">
              Short Videos
            </h1>
            
            <div className="text-base lg:text-lg leading-relaxed text-gray-100">
              Nội dung này chưa được hỗ trợ trên thiết bị của bạn, vui lòng sử dụng ứng dụng FPT Play trên thiết bị di động để có những trải nghiệm tốt nhất.
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
