import { PROFILE_TYPES } from '@/lib/constant/texts';
import { useAppSelector } from '@/lib/store';
import Link from 'next/link';
import React, { useMemo, useEffect, useState } from 'react';
import { FaFacebook, FaYoutube } from 'react-icons/fa';
import { getFooterData, FooterData, FooterMenuItem } from '@/lib/api/footer';

/* eslint-disable @next/next/no-html-link-for-pages */
export default function FooterWrapper() {
  const { info } = useAppSelector((state) => state.user);
  const [footerData, setFooterData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const data = await getFooterData();
        setFooterData(data);
      } catch (err) {
        console.error('Footer API failed:', err);
        // Could optionally set fallback data here
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);
  const links = useMemo(() => {
    if (!footerData?.menu) {
      return [];
    }

    let menuData = footerData.menu;

    // Filter menu items for kid profile
    if (info?.profile?.profile_type === PROFILE_TYPES.KID_PROFILE) {
      menuData = menuData.map((section) => {
        if (section.title !== 'Dịch vụ') {
          return section;
        } else {
          return {
            ...section,
            data: section.data.filter((item) => 
              ['goi-data', 'quang-cao', 'bao-hanh'].includes(item.id)
            ),
          };
        }
      });
    }

    return menuData;
  }, [footerData?.menu, info]);

  // Show loading state or fallback content if still loading or no data
  if (loading || !footerData) {
    return <div className="text-white">Loading footer...</div>;
  }

  return (
    <>
      <div className="flex flex-col gap-[24px] xl:flex-row xl:gap-[60px] xl:justify-between">
        <div className="flex flex-col gap-[12px] tablet:gap-[16px] xl:gap-[24px]">
          <h3 className="text-white tracking-[0.36px] font-[600] text-[18px] leading-[130%]">
            {footerData?.company?.title}
          </h3>
          <a href="/">
            <img
              src={footerData?.company?.image}
              alt="logo fptplay"
              className="w-[137px] h-[32px] tablet:w-[154px] tablet:h-[36px] xl:w-[200px] xl:h-[47px]"
              width={188}
            />
          </a>

          <div className="flex items-center gap-[27px]">
            {footerData?.company?.certifications?.map((cert) => (
              <a
                key={cert.id}
                href={cert.url}
                target="_blank"
              >
                <img
                  src={cert.image}
                  alt={cert.id}
                  className="h-[42px]"
                  height={42}
                />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-[16px] gap-y-[24px] tablet:gap-x-[40px] tablet:gap-y-[40px] xl:gap-[104px]">
          {links.map((item, index) => (
            <div
              key={index}
              className="flex flex-col gap-[8px] tablet:gap-[12px] xl:gap-[16px] xl:max-w-[214px]"
            >
              <p className="text-white font-[700] tablet:font-[600] leading-[150%] text-[14px] tablet:text-[18px] tablet:mb-[4px] xl:mb-0">
                {item.title}
              </p>
              {item.data.map((link: FooterMenuItem, idx: number) => (
                <div
                  key={idx}
                  className="text-spanish-gray text-[14px] tablet:text-[16px] leading-[133%]"
                >
                  {link.type === 'text' ? (
                    <div className="flex items-center gap-[5px] hover:text-fpl duration-200 ease-in-out">
                      <span>{link.title}</span>
                    </div>
                  ) : link.type === 'social' && link.links ? (
                    <div className="flex items-center gap-[12px] mt-[12px]">
                      {link.links.map((socialLink) => (
                        <a
                          key={socialLink.id}
                          href={socialLink.url}
                          target="_blank"
                          aria-label={socialLink.title}
                          className={
                            socialLink.icon === 'youtube'
                              ? 'w-[24px] h-[24px] rounded-full bg-white p-[2px] flex items-center justify-center hover:bg-fpl'
                              : ''
                          }
                        >
                          {socialLink.icon === 'facebook' && (
                            <FaFacebook size={24} className="hover:text-fpl" />
                          )}
                          {socialLink.icon === 'youtube' && (
                            <FaYoutube size={16} className="text-black" />
                          )}
                        </a>
                      ))}
                    </div>
                  ) : link?.type === 'redirect' ? (
                    <a
                      href={link.url}
                      className="hover:text-fpl duration-200 ease-in-out "
                      target={link.url.startsWith('http') ? '_blank' : '_self'}
                    >
                      {link.title}
                    </a>
                  ) : link.url ? (
                    <Link
                      prefetch={false}
                      href={link.url}
                      className="hover:text-fpl duration-200 ease-in-out "
                    >
                      {link.title}
                    </Link>
                  ) : (
                    <span>{link.title}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-eerie-black mt-[24px] xl:mt-[40px] pt-[24px] xl:pt-[40px] flex flex-col gap-[24px] xl:gap-[40px] xl:flex-row xl:items-center xl:justify-between">
        <div className="text-[14px] flex flex-col gap-[6px]">
            <div
              className="text-spanish-gray tracking-[0.32px] text-[16px] leading-[130%] space-y-2"
              dangerouslySetInnerHTML={{
                __html: footerData.texts.company_info.html
              }}
            />
        </div>
        <div>
          <p className="text-spanish-gray tracking-[0.32px] text-[16px] leading-[130%]">
            {footerData?.texts?.app_download?.title}
          </p>
          <div className="flex items-center gap-[8px] mt-[12px]">
            {footerData?.texts?.app_download?.data?.map((app) => (
              <img
                key={app.id}
                src={app.image}
                alt={app.id}
                className="h-[40px]"
                height={40}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}