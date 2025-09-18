import { useRouter } from 'next/router';
import Image from 'next/image';
import usePackageData from '@/lib/hooks/usePackageData';
import { useHorizontalScrollDrag } from '@/lib/hooks/useHorizontalScrollDrag';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { openLoginModal } from '@/lib/store/slices/loginSlice';
import styles from './BuyPackage.module.css';
import {
  renderHeaderRow,
  renderFeatureRow,
  renderBuyButtons,
} from './BuyPackageTable';
import { getPackagePlans, GetPackagePlansResponse } from '@/lib/api/payment';
import ModalConfirm from '@/lib/components/modal/ModalConfirm';
import { useState } from 'react';

const BuyPackageComponent = () => {
  const {
    listFeature,
    description,
    platformSupport,
    basicPackages,
    expandPackages,
    allPackages,
  } = usePackageData();
  const router = useRouter();
  const { containerRef, eventHandlers } = useHorizontalScrollDrag();
  const dispatch = useAppDispatch();
  const { isLogged } = useAppSelector((state) => state.user);
  const [modalContent, setModalContent] = useState({
    title: 'Thông báo',
    content: '',
    buttons: {
      accept: 'Đã hiểu',
    },
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBuyPackage = async (type = '') => {
    // Check if user is logged in
    if (!isLogged) {
      // Open login modal if not logged in
      dispatch(openLoginModal());
      return;
    }

    // check login sub account

    // Check package plans for errors before proceeding
    try {
      const res = await getPackagePlans({
        from_source: (router.query.from_source as string) || 'main',
        package_type: type,
      });

      const packageData = res.data as GetPackagePlansResponse;
      if (packageData.msg_code && packageData.msg_code === 'error') {
        let noticeContent = packageData.msg_content;
        if (
          packageData.msg_data_error &&
          packageData.msg_data_error.from_date &&
          packageData.msg_data_error.next_date
        ) {
          noticeContent += `<br><br>Ngày bắt đầu tính cước: ${packageData.msg_data_error.from_date}`;
          noticeContent += `<br>Chu kỳ cước tiếp theo: ${packageData.msg_data_error.next_date}`;
        }
        // show modal notice
        setModalContent({
          title: 'Thông báo',
          content: noticeContent || '',
          buttons: {
            accept: 'Đã hiểu',
          },
        });
        setIsModalOpen(true);
        return;
      }

      // Proceed with purchase flow if no errors
      router.push(`/mua-goi/dich-vu/${type}`);
    } catch (err) {
      console.log('getPackagePlans error', err);
      // Proceed with purchase flow even if API call fails
      router.push(`/mua-goi/dich-vu/${type}`);
    }
  };

  return (
    <div className="w-full h-auto flex flex-col mt-20 px-5 sm:px-15 xl:px-26">
      <div
        className={`overflow-x-auto ${styles.hideScrollbar}`}
        ref={containerRef}
        {...eventHandlers}
      >
        {renderHeaderRow(allPackages, false, allPackages.length)}
        {renderFeatureRow(listFeature, allPackages, false, allPackages.length)}
        {renderBuyButtons(
          allPackages,
          false,
          handleBuyPackage,
          allPackages.length,
        )}

        {renderHeaderRow(basicPackages, true, allPackages.length)}
        {renderFeatureRow(listFeature, basicPackages, true, allPackages.length)}
        {renderBuyButtons(
          basicPackages,
          true,
          handleBuyPackage,
          allPackages.length,
        )}
      </div>

      <div className="mt-5 xl:hidden">
        <span className="text-xl font-bold">Gói mở rộng</span>
        <div className="grid grid-rows-3 items-center text-white font-bold mt-5 gap-4">
          {expandPackages.map((pkg, i) => (
            <div key={i} className="flex">
              {pkg && (
                <img
                  src={pkg.icon}
                  alt={pkg.package_name || ''}
                  className="object-fill rounded-lg cursor-pointer w-[350px] h-[200px]"
                  onClick={() => handleBuyPackage(pkg.type)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <hr className="mt-5 text-dim-gray" />

      <div className="mt-5">
        {description.map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>

      <div className="mt-4 flex gap-2.5 items-center">
        <div className="mr-2">{platformSupport?.text}</div>
        {platformSupport?.icon?.map((src, i) => (
          <img key={i} src={src} alt={`logo-device ${i}`} className="w-6 h-6" />
        ))}
      </div>

      <a
        href="https://fpt.vn/internet-ca-nhan?utm_campaign=Internet&utm_medium=FPTPlayMuaGoi&utm_source=Seo"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 block"
      >
        <Image
          src="/images/package_desktop.webp"
          alt="muagoi"
          width={1920}
          height={200}
          quality={100}
          className="rounded-lg cursor-pointer hidden xl:block"
        />
        <Image
          src="/images/package_mobile.webp"
          alt="muagoi"
          width={1920}
          height={200}
          quality={100}
          className="rounded-lg cursor-pointer xl:hidden"
        />
      </a>
      <ModalConfirm
        open={isModalOpen}
        modalContent={modalContent}
        bodyContentClassName="!text-[16px] !text-spanish-gray !leading-[130%] tracking-[0.32px]"
        onSubmit={() => {
          setIsModalOpen(false);
        }}
        onHidden={() => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default BuyPackageComponent;
