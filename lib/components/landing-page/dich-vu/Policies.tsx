export default function PoliciesComponent() {
  return (
    <div className="py-20 flex justify-center">
      <div className="w-full sm:w-[90%] mt-10">
        <p className="text-4xl font-bold text-center">Điều khoản và dịch vụ</p>
        <div className="pt-12 px-10 grid grid-cols-1 md:grid-cols-3 gap-10 text-[18px] font-light">
          <div>
            <p className="py-4">
              Dịch vụ 3G/4G chỉ áp dụng cho thuê bao di động truy cập FPT Play
              phiên bản App bằng 3G/4G
            </p>          
          </div>
          <div>
            <p className="py-4">
              Các gói cước được tự động gia hạn theo chu kỳ cước.
            </p>           
          </div>
          <div>
            <p className="py-4">
              Để sử dụng dịch vụ 3G/4G, bạn vui lòng đăng nhập ứng dụng FPT Play bằng số điện thoại đã đăng ký
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
