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
            <p className="py-4">
              Để biết giá các gói cước, soạn KTX gửi 5282 (đối với Viettel),
              soạn GIA gửi 1584 (đối với Mobifone)
            </p>
            <p className="py-4">
              Các gói cước được tự động gia hạn theo chu kỳ cước.
            </p>
            <p className="py-4">
              Để xem hướng dẫn sử dụng, soạn HDF gửi 5282 (đối với thuê bao
              Viettel), soạn HD gửi 1584 (đối với thuê bao Mobifone), soạn TG F
              gửi 9113 (đối với thuê bao Vinaphone)
            </p>            
          </div>
          <div>
            <p className="py-4">
              Để khôi phục gói, soạn KPF gửi 5282 (đối với thuê bao Viettel)
            </p>
            <p className="py-4">
              Để sử dụng dịch vụ 3G/4G, bạn vui lòng đăng nhập ứng dụng FPT Play
              bằng số điện thoại đã đăng ký
            </p>
            <p className="py-4">
              Đối với các thuê bao Viettel, trường hợp tài khoản của khách hàng
              tại thời điểm đăng ký mới không đủ cước theo giá gói, trừ cước 50%
              giá cước. Trường hợp tài khoản của khách hàng tại thời điểm trừ
              cước gia hạn không đủ cước theo giá gói, trừ cước 2 lần trong chu
              kì (mỗi lần 50% giá cước).
            </p>
          </div>
          <div>
            <p className="py-4">
              Đối với các thuê bao Vinaphone, chỉ áp dụng cho thuê bao trả trước
              (có bao gồm cả thuê bao EZCOM) hoạt động 2 chiều trên mạng
              VinaPhone (không nợ đọng, huỷ, tạm ngưng, khoá 1 chiều/2 chiều)
            </p>
            <p className="py-4">
              Đối với các thuê bao MobiFone, khi trừ cước gia hạn, nếu tài khoản
              chính nhỏ hơn mức cước thì dịch vụ sẽ trừ mức cước thấp hơn theo
              từng gói cước như sau: <br />
              1. Gói F1: Trừ cước 2.000đ và 1.000đ <br />
              2. Gói F7: Trừ cước 6.000đ và 4.000đ <br />
              3. Gói F30: Trừ cước 20.000đ và 10.000đ              
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
