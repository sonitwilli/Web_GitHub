import React, { useState } from 'react';

const FPTPlayBox650 = () => {
  const [activeTab, setActiveTab] = useState('current');

  return (
    <div className="w-full bg-white">
      {/* Main Content */}
      <main className="w-full text-center">
        {/* Section 1 - Hero Banner */}
          <div className="text-center">
            <img src="/images/HDSD/banner-section-1.png" alt="section-1" className="w-full shadow-lg" />
          </div>

        {/* Section 2 - Product Info */}
        <section className="md:py-[20px] xl:py-[40px]">
          <div className="gap-8 items-center">
            <div className="pt-[40px] xl:px-[310px] xl:pt-[96px]">
              <h2 className="text-[22px] xl:text-[32px] font-bold mb-[8px] text-[#333333]">Bộ giải mã FPT Play 650</h2>
              <h2 className="text-[22px] xl:text-[32px] font-semibold mb-[8px] text-[#333333]">
                Thăng hoa cảm xúc trong không gian của chính bạn.
              </h2>
              <p className="text-[16px] leading-relaxed mb-[64px] mt-[32px] text-[#333333]">
                Dẫn đầu xu hướng điều khiển giọng nói trong hệ sinh thái nhà thông minh với &quot;Google Assistant&quot;, 
                giờ đây bạn đã có thể trải nghiệm bằng tiếng Việt theo cách mà không đâu khác có được, 
                hiện đại mang đến sự tự hào công nghệ Việt. Hãy cùng đắm chìm vào kho giải trí với hơn 100 
                kênh truyền hình miễn phí và các gói dịch vụ đặc sắc cùng nhiều quyền lợi ưu đãi hấp dẫn.
              </p>
            </div>
            <div>
              <img src="/images/HDSD/banner-section-2.png" alt="section-2" className="w-full rounded-lg shadow-md" />
            </div>
          </div>
        </section>

        {/* Section 3 - Package Contents */}
        <section className="rounded-lg">
          <div className="">
            <div className="relative overflow-hidden flex">
              {/* base banner */}
              <img src="/images/HDSD/banner-section-3.png" alt="Package base banner" className="w-full h-[377px] md:h-[620px] xl:h-[704px] block" />

              {/* overlay: content near top of the banner (not vertically centered) */}
              <div className="absolute inset-0 flex items-start justify-center pt-8 md:pt-12">
                {/* subtle dark layer to improve contrast */}
                <div className="absolute inset-0 bg-black/30" aria-hidden />

                <div className="relative z-10 px-4 md:px-8 text-center">
                  <h2 className="text-[22px] md:text-[22px] xl:text-[32px] font-bold text-white mb-[8px]">Hộp sản phẩm bao gồm</h2>
                  <p className="text-sm md:text-base text-white/90 max-w-2xl mx-auto mt-[30px] mb-[16px]">
                    Lưu ý: Thông tin có thể thay đổi theo các phiên bản khác nhau của sản phẩm.
                  </p>

                  <div className="flex flex-col items-center justify-start xl:gap-4 mt-6">
                    <img
                      src="/images/HDSD/sub-1-banner-section-3.png"
                      alt="sub 1"
                      className="xl:px-[230px] rounded-md shadow-lg object-contain"
                    />

                    <img
                      src="/images/HDSD/sub-2-banner-section-3.png"
                      alt="sub 2"
                      className="xl:px-[30px] rounded-md shadow-lg object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 - Remote Control Guide */}
        <section className="px-[20px] xl:px-[124px] bg-[#F5F5F7]">
          <h2 className="text-[22px] xl:text-[32px] font-bold mb-6 text-[#333333] mt-[40px]">Hướng dẫn sử dụng điều khiển</h2>
          
          {/* Tabs */}
          <div className="mb-2">
            <div className="flex border-b items-center justify-center gap-[32px] mb-[32px] xl:mb-[40px]">
              <button
                className={`text-[14px] xl:text-[22px] text-[#333333] font-medium border-b-2 transition-colors ${
                  activeTab === 'current' 
                    ? 'border-orange-600' 
                    : 'border-transparent hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('current')}
              >
                Mẫu hiện tại (RHS12X)
              </button>
              <button
                className={`text-[14px] xl:text-[22px] text-[#333333] font-medium border-b-2 transition-colors ${
                  activeTab === 'old' 
                    ? 'border-orange-600' 
                    : 'border-transparent hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('old')}
              >
                Mẫu cũ (RHS02X)
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'current' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center">
                <img src="/images/HDSD/sub-1-section-4.png" alt="Remote Control RHS12X" className="mx-auto rounded-lg shadow-md" />
              </div>
              <div className="space-y-6 text-left">
                <div>
                  <h3 className="text-[24px] text-[#333333] font-semibold mb-2">Google Assistant - khẩu lệnh Tiếng Việt</h3>
                  <p className="text-gray-600">
                    Người Việt - khẩu lệnh Việt, FPT luôn cố gắng thông qua những tiện ích thông minh để chạm đến trái tim bạn.
                  </p>
                </div>
                <div>
                  <h3 className="text-[24px] text-[#333333] font-semibold mb-2">Giúp bạn dễ dàng nắm bắt mọi xu hướng.</h3>
                  <p className="text-gray-600">
                    Những tin tức kinh tế - xã hội, thể thao, thời tiết và bất kỳ thông tin nào bạn quan tâm, 
                    luôn dễ dàng tiếp cận qua khẩu lệnh &quot;Ok, Google&quot;.
                  </p>
                </div>
                <div>
                  <h3 className="text-[24px] text-[#333333] font-semibold mb-2">Người bạn đồng hành thông minh.</h3>
                  <p className="text-gray-600">
                    Hỗ trợ kết nối và điều khiển các thiết bị trong nhà, giúp cho ngôi nhà thông minh lắng nghe 
                    và hiểu mong muốn của bạn trong từng khoảnh khắc.
                  </p>
                </div>
              </div>
            </div>
          )}

        {activeTab === 'old' && (
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center">
                <img src="/images/HDSD/sub-1.1-section-4.png" alt="Remote Control RHS12X" className="mx-auto rounded-lg shadow-md" />
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-[24px] text-[#333333] font-semibold mb-2">Google Assistant - khẩu lệnh Tiếng Việt</h3>
                  <p className="text-gray-600">
                    Người Việt - khẩu lệnh Việt, FPT luôn cố gắng thông qua những tiện ích thông minh để chạm đến trái tim bạn.
                  </p>
                </div>
                <div>
                  <h3 className="text-[24px] text-[#333333] font-semibold mb-2">Giúp bạn dễ dàng nắm bắt mọi xu hướng.</h3>
                  <p className="text-gray-600">
                    Những tin tức kinh tế - xã hội, thể thao, thời tiết và bất kỳ thông tin nào bạn quan tâm, 
                    luôn dễ dàng tiếp cận qua khẩu lệnh &quot;Ok, Google&quot;.
                  </p>
                </div>
                <div>
                  <h3 className="text-[24px] text-[#333333] font-semibold mb-2">Người bạn đồng hành thông minh.</h3>
                  <p className="text-gray-600">
                    Hỗ trợ kết nối và điều khiển các thiết bị trong nhà, giúp cho ngôi nhà thông minh lắng nghe 
                    và hiểu mong muốn của bạn trong từng khoảnh khắc.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Connection Ports */}
          <div className="pt-[32px] xl:pt-[80px]">
            <h2 className="text-[22px] xl:text-[32px] font-bold mb-[32px] xl:mb-[40px] text-[#333333]">Các cổng kết nối</h2>
            <div className="bg-white rounded-lg shadow-md text-center">
              <img src="/images/HDSD/sub-2-section-4.png" alt="Connection Ports" className="mx-auto" />
            </div>
          </div>
        </section>

        {/* TV Connection Guide */}
        <section className="px-[20px] xl:px-[124px] bg-[#F5F5F7]">
          <h2 className="text-[22px] xl:text-[32px] pt-[32px] xl:pt-[80px] mb-[32px] xl:mb-[40px] text-[#333333] font-bold ">Kết nối với TV</h2>
          <div className="bg-white rounded-lg shadow-md space-y-8">
            <div className ="text-left px-[40px] py-[80px]">
              <h3 className="text-[24px] text-[#333333] font-semibold mb-4">Sử dụng cáp HDMI để kết nối với TV (Khuyên dùng)</h3>
              <div className="text-[16px] text-[#333333] space-y-4 mb-4">
                <p>1. Kết nối TV và Box bằng dây HDMI qua cổng HDMI.</p>
                <p>2. Chuyển nguồn tín hiệu TV sang nguồn HDMI tương ứng.</p>
                <p>3. Cắm dây nguồn để bật Box.</p>
              </div>
              <img src="/images/HDSD/sub-3-section-4.png" alt="HDMI Connection" className="mx-auto rounded-lg" />
            </div>
            
            <div className="text-left px-[40px] py-[80px]">
              <h3 className="text-[24px] text-[#333333] font-semibold mb-4">Sử dụng cáp AV để kết nối với TV</h3>
              <div className="text-[16px] text-[#333333] space-y-4 mb-4">
                <p>1. Kết nối cáp AV (đỏ, trắng, vàng) với cổng AV tương ứng của TV, kết nối đầu còn lại của cáp AV với Box.</p>
                <p>2. Chuyển nguồn tín hiệu TV sang AV.</p>
                <p>3. Cắm dây nguồn để bật Box.</p>
              </div>
              <img src="/images/HDSD/sub-4-section-4.png" alt="AV Connection" className="mx-auto rounded-lg" />
            </div>
          </div>
        </section>

        {/* Internet Connection (styled like TV Connection Guide) */}
        <section className="px-[20px] xl:px-[124px] bg-[#F5F5F7]">
          <h2 className="text-[22px] xl:text-[32px] pt-[32px] xl:pt-[80px] mb-[32px] xl:mb-[40px] text-[#333333] font-bold">Kết nối với Internet</h2>
            <div className="bg-white rounded-lg shadow-md space-y-8 py-[80px] px-[40px]">
                <div className="text-left">
                <h3 className="text-[19px] text-[#333333] font-semibold mb-4">Kết nối mạng Internet qua cổng Ethernet</h3>
                <div className="text-[16px] text-[#333333] space-y-4 mb-4">
                    <p>Khi kết nối cáp mạng với cổng Ethernet, Box sẽ tự động kết nối Internet</p>
                </div>
                <img src="/images/HDSD/sub-5-section-4.png" alt="Ethernet Connection" className="mx-auto rounded-lg" />
                </div>

                <div className="text-left">
                <h3 className="text-[19px] text-[#333333] font-semibold mb-4">Kết nối mạng Internet không dây</h3>
                <div className="text-[16px] text-[#333333] space-y-4 mb-4">
                    <p>Khi kết nối cáp mạng với cổng Ethernet, Box sẽ tự động kết nối Internet</p>
                </div>
                <img src="/images/HDSD/sub-6-section-4.png" alt="WiFi Connection" className="mx-auto rounded-lg" />
                <p className="text-[16px] text-[#333333]">
                    *Lưu ý: Kết nối cáp với cổng Ethernet sẽ không có tác dụng nếu quý khách đã kết nối Wi-Fi.
                </p>
                </div>
            </div>
        </section>

        {/* Remote Learning Feature */}
        <section className="px-[20px] xl:px-[124px] bg-[#F5F5F7]">
          <h2 className="text-[22px] xl:text-[32px] pt-[32px] xl:pt-[80px] mb-[32px] xl:mb-[40px] text-[#333333] font-bold">Tính năng sao chép điều khiển TV</h2>
            <div className="bg-white rounded-lg shadow-md space-y-8 py-[80px] px-[40px]">
                <div className="text-center">
                    <p className="text-[16px] text-[#333333] mb-4">
                        1. Nhấn giữ phím <strong>SET</strong> cho đến khi đèn sáng đỏ.
                    </p>
                    <img src="/images/HDSD/sub-7-section-4.png" alt="sub-7" className="mx-auto rounded-lg" />

                    <p className="text-[16px] text-[#333333] mb-4">
                        2. Đặt điều khiển TV đối diện điều khiển Box.
                    </p>
                    <img src="/images/HDSD/sub-8-section-4.png" alt="sub-8" className="mx-auto rounded-lg" />

                    <p className="text-[16px] text-[#333333] mb-4">
                        3. Nhấn thả phím TV trên điều khiển Box, sau đó nhấn thả phím nguồn trên điều khiển TV, đèn sẽ chớp đỏ và chuyển về màu đỏ khi thành công.
                    </p>
                    <img src="/images/HDSD/sub-9-section-4.png" alt="sub-9" className="mx-auto rounded-lg" />

                    <p className="text-[16px] text-[#333333] mb-4">
                        4. Nhấn phím <strong>SET</strong> để kết thúc quá trình học.
                    </p>
                    <img src="/images/HDSD/sub-10-section-4.png" alt="sub-10" className="mx-auto rounded-lg" />
                </div>
            </div>
        </section>

        {/* Device Configuration */}
        <section className="px-[20px] xl:px-[124px] bg-[#F5F5F7]">
          <h2 className="text-[22px] xl:text-[32px] pt-[32px] xl:pt-[80px] mb-[32px] xl:mb-[40px] text-[#333333] font-bold">Cấu hình thiết bị</h2>
            <div className="bg-white rounded-lg shadow-md space-y-8 py-[80px] px-[40px]">
                <div className="text-center">
                    <img src="/images/HDSD/sub-11-section-4.png" alt="sub-11" className="mx-auto rounded-lg" />
                    <h3 className="text-[42px] text-[#FF6500] font-semibold mb-4">FPT Play Box T650</h3>
                    <div className="flex flex-col xl:flex-row gap-[15px]">
                        <img src="/images/HDSD/sub-12-section-4.png" alt="sub-12" className="mx-auto rounded-lg" />
                        <img src="/images/HDSD/sub-13-section-4.png" alt="sub-13" className="mx-auto rounded-lg" />
                    </div>
                        <img src="/images/HDSD/sub-14-section-4.png" alt="sub-14" className="mx-auto rounded-lg mt-4" />
                </div>
            </div>
        </section>

        {/* Warranty Policy */}
        <section className="px-[20px] xl:px-[124px] py-[80px] bg-[#F5F5F7] text-left">
          <h2 className="text-[22px] xl:text-[32px] pt-[32px] xl:pt-[80px] mb-[32px] xl:mb-[40px] text-[#333333] font-bold text-center">Chế độ bảo hành</h2>
          <div className="bg-white px-[40px] py-[80px] rounded-lg shadow-md space-y-4">
            <div>
              <h4 className="text-[19px] text-[#333333] font-semibold mb-2">Kính gửi quý khách hàng:</h4>
                <p className="text-[16px] text-[#333333]">
                    Cám ơn quý khách hàng đã mua sản phẩm.
                </p>
              <p className="text-[16px] text-[#333333] mb-4">
                Để bảo vệ quyền lợi chính đáng của quý khách, vui lòng đọc kỹ hướng dẫn sau khi mua sản phẩm.
              </p>
            </div>

            <div>
              <h4 className="text-[19px] text-[#333333] font-semibold mb-2">Chính sách đổi trả/ bảo hành:</h4>
              <p className="text-[16px] text-[#333333] mb-4">Thời hạn bảo hành: 1 năm kể từ ngày mua hàng.</p>
            </div>

            <div>
              <h4 className="text-[19px] text-[#333333] font-semibold mb-2">Những trường hợp sau không được bảo hành miễn phí:</h4>
              <div className="text-[#333333]">
                <p>1. Hết hạn bảo hành.</p>
                <p>2. Sản phẩm lỗi, hỏng trong quá trình cài đặt, sử dụng do người dùng không đọc/ làm theo hướng dẫn sử dụng.</p>
                <p>3. Sản phẩm lỗi, hỏng do có sự can thiệp của người khác mà không được sự chấp thuận từ FPT Telecom.</p>
                <p>4. Sản phẩm lỗi, hỏng do tại nạn bất ngờ trong quá trình sử dụng như thấm nước, điện áp đầu vào, ăn mòn…</p>
                <p>5. Các sản phẩm giả mạo thiết kế, phần mềm với thương hiệu FPT Play.</p>
                <p>6. Làm rách, xé, sửa số thẻ bảo hành, số sê-ri sản phẩm.</p>
                <p>7. Sản phẩm bị hư hỏng, nứt vỡ trong quá trình vận chuyển về công ty để sửa chữa.</p>
                <p>8. Sản phẩm bị hư hỏng bởi lũ lụt, giật sét, động đất và các thiên tai khác.</p>
                <p>9. Sản phẩm bị lỗi, hỏng từ các nguyên nhân khác, không phải các nguyên nhân từ phía nhà sản xuất.</p>
              </div>
              <p className="mt-4 text-[#333333]">Đọc kỹ hướng dẫn này trước khi sử dụng.</p>
              <p className="text-[#333333] text-[16px] italic mt-4">
                *Lưu ý: Thiết bị trả lại phải còn nguyên điều kiện ban đầu, bao gồm các bộ phận, phụ kiện trong bao bì gốc.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default FPTPlayBox650;