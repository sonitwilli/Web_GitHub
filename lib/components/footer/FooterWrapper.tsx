import { PROFILE_TYPES } from '@/lib/constant/texts';
import { useAppSelector } from '@/lib/store';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { FaFacebook, FaYoutube } from 'react-icons/fa';

/* eslint-disable @next/next/no-html-link-for-pages */
export default function FooterWrapper() {
  const { info } = useAppSelector((state) => state.user);
  const links = useMemo(() => {
    let list = [
      {
        label: 'Về FPT Play',
        items: [
          {
            id: 'Giới thiệu',
            type: 'redirect',
            url: '/gioi-thieu#block-1',
            name: 'Giới thiệu',
          },
          {
            id: 'Các gói dịch vụ',
            type: 'redirect',
            url: '/gioi-thieu#block-2',
            name: 'Các gói dịch vụ',
          },
          {
            id: 'trung_tam_ho_tro',
            type: 'redirect',
            url: 'https://hotro.fptplay.vn/hc/vi',
            name: 'Trung tâm hỗ trợ',
          },
          {
            id: 'thong_tin',
            type: 'redirect',
            url: 'https://blog.fptplay.vn/',
            name: 'Thông tin',
          },
        ],
      },
      {
        label: 'Dịch vụ',
        items: [
          {
            id: 'Gói DATA',
            url: '/dich-vu/3g',
            name: 'Gói DATA',
          },
          {
            id: 'quang_cao',
            type: 'redirect',
            url: 'https://itvad.vn/',
            name: 'Quảng cáo',
          },
          {
            id: 'Mua gói',
            type: 'redirect',
            url: '/mua-goi',
            name: 'Mua gói',
          },
          {
            id: 'bao_hanh',
            type: 'redirect',
            url: '/bao-hanh',
            name: 'Bảo hành',
          },
        ],
      },
      {
        label: 'Quy định',
        items: [
          {
            id: 'Điều khoản sử dụng',
            type: 'redirect',
            url: '/dieu-khoan-su-dung',
            name: 'Điều khoản sử dụng',
          },
          {
            id: 'Chính sách thanh toán',
            type: 'redirect',
            url: '/chinh-sach-thanh-toan',
            name: 'Chính sách thanh toán',
          },
          {
            id: 'Chính sách bảo mật thông tin dữ liệu',
            type: 'redirect',
            url: '/chinh-sach-bao-mat',
            name: 'Chính sách bảo mật thông tin dữ liệu',
          },
          {
            id: 'Cam kết của FPT Telecom',
            type: 'redirect',
            url: '/cam-ket-quyen-rieng-tu',
            name: 'Cam kết của FPT Telecom',
          },
        ],
      },
    ];
    if (info?.profile?.profile_type === PROFILE_TYPES.KID_PROFILE) {
      list = list.map((item) => {
        if (item.label !== 'Dịch vụ') {
          return item;
        } else {
          return {
            label: 'Dịch vụ',
            items: [
              {
                id: 'Gói DATA',
                url: '/dich-vu/3g',
                name: 'Gói DATA',
              },
              {
                id: 'quang_cao',
                type: 'redirect',
                url: 'https://itvad.vn/',
                name: 'Quảng cáo',
              },
              {
                id: 'bao_hanh',
                type: 'redirect',
                url: '/bao-hanh',
                name: 'Bảo hành',
              },
            ],
          };
        }
      });
    }
    return list;
  }, [info]);

  // const iconPlatform = [
  //   '/images/box.png',
  //   '/images/pc.png',
  //   '/images/browser.png',
  //   '/images/apple.png',
  //   '/images/android.png',
  // ];
  const texts = [
    {
      value: 'Người đại diện: Ông Hoàng Việt Anh',
    },
    {
      value:
        'Trụ sở: Tầng 8, tòa nhà FPT Tower, số 10 Phạm Văn Bạch, Cầu Giấy, Hà Nội',
    },
    {
      value:
        'Số giấy chứng nhận đăng ký kinh doanh: 0101778163 do Sở Kế Hoạch Đầu Tư Thành Phố Hà Nội cấp vào ngày 28/07/2005',
    },
    {
      value:
        'Giấy phép Cung cấp Dịch vụ Phát thanh, Truyền hình trên mạng Internet số 377/GP-BTTTT cấp ngày 10/10/2023.',
    },
  ];
  return (
    <>
      <div className="flex flex-col gap-[24px] xl:flex-row xl:gap-[60px] xl:justify-between">
        <div className="flex flex-col gap-[12px] tablet:gap-[16px] xl:gap-[24px]">
          <h3 className="text-white tracking-[0.36px] font-[600] text-[18px] leading-[130%]">
            Công ty Cổ phần Viễn Thông FPT
          </h3>
          <a href="/">
            <img
              src="/images/logo_footer.png"
              alt="logo fptplay"
              className="w-[137px] h-[32px] tablet:w-[154px] tablet:h-[36px] xl:w-[200px] xl:h-[47px]"
              width={188}
            />
          </a>

          <div className="flex items-center gap-[27px]">
            <a
              href="//www.dmca.com/Protection/Status.aspx?id=90dbd7fd-a8ad-4f7e-808f-f8b516cd4cc7"
              target="_blank"
            >
              <img
                src="/images/dmca.png"
                alt="dmca"
                className="h-[42px]"
                height={42}
              />
            </a>

            <a
              href="http://online.gov.vn/Home/WebDetails/107830"
              target="_blank"
            >
              <img
                src="/images/logoSaleNoti.png"
                alt="logo sale noti"
                className="h-[42px]"
                height={42}
              />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-[16px] gap-y-[24px] tablet:gap-x-[40px] tablet:gap-y-[40px] xl:gap-[104px]">
          {links.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-[8px] tablet:gap-[12px] xl:gap-[16px] xl:max-w-[214px]"
            >
              <p className="text-white font-[700] tablet:font-[600] leading-[150%] text-[14px] tablet:text-[18px] tablet:mb-[4px] xl:mb-0">
                {item.label}
              </p>
              {item.items.map((link, idx) => (
                <div
                  key={idx}
                  className="text-spanish-gray text-[14px] tablet:text-[16px] leading-[133%]"
                >
                  {link?.url?.includes('https://') ? (
                    <a
                      href={link.url}
                      className="hover:text-fpl duration-200 ease-in-out "
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      prefetch={false}
                      href={link.url}
                      className="hover:text-fpl duration-200 ease-in-out "
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ))}
          <div className="flex flex-col gap-[8px] tablet:gap-[12px] xl:gap-[16px]">
            <p className="text-white font-[700] tablet:font-[600] leading-[150%] text-[14px] tablet:text-[18px] tablet:mb-[4px] xl:mb-0">
              Thông tin
            </p>
            <Link
              prefetch={false}
              href={'/gioi-thieu#block-3'}
              className="text-spanish-gray text-[14px] tablet:text-[16px] leading-[133%]"
            >
              Liên hệ
            </Link>
            <div className="flex items-center gap-[5px] hover:text-fpl duration-200 ease-in-out text-spanish-gray text-[14px] tablet:text-[16px] leading-[133%]">
              <span>Hotline:</span>
              <span>19006600</span>
            </div>
            <div className="flex items-center gap-[5px] hover:text-fpl duration-200 ease-in-out text-spanish-gray text-[14px] tablet:text-[16px] leading-[133%]">
              <span>Email:</span>
              <span>hotrofptplay@fpt.com</span>
            </div>
            <div className="flex items-center gap-[12px] mt-[12px]">
              <a
                href="https://www.facebook.com/fptplay"
                target="_blank"
                aria-label="Facebook"
              >
                <FaFacebook size={24} className="hover:text-fpl" />
              </a>
              <a
                href="https://www.youtube.com/c/FPTPLAYTVOnline"
                target="_blank"
                aria-label="Youtube"
                className="w-[24px] h-[24px] rounded-full bg-white p-[2px] flex items-center justify-center hover:bg-fpl"
              >
                <FaYoutube size={16} className="text-black " />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-eerie-black mt-[24px] xl:mt-[40px] pt-[24px] xl:pt-[40px] flex flex-col gap-[24px] xl:gap-[40px] xl:flex-row xl:items-center xl:justify-between">
        <div className="text-[14px] flex flex-col gap-[6px]">
          {texts.map((item, index) => (
            <p
              className="text-spanish-gray tracking-[0.32px] text-[16px] leading-[130%]"
              key={index}
            >
              {item.value}
            </p>
          ))}
        </div>
        <div>
          <p className="text-spanish-gray tracking-[0.32px] text-[16px] leading-[130%]">
            Tải ứng dụng trên
          </p>
          <div className="flex items-center gap-[8px] mt-[12px]">
            <img
              src="/images/app-store-badge.png"
              alt="app-store-badge"
              className="h-[40px]"
              height={40}
            />
            <img
              src="/images/google-play-badge.png"
              alt="app-store-badge"
              className="h-[40px]"
              height={40}
            />
          </div>
        </div>
      </div>
    </>
  );
}
