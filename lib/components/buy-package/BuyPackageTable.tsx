import { BsCheckCircleFill, BsFillXCircleFill } from 'react-icons/bs';
import { FeatureType, Packages } from '@/lib/hooks/usePackageData';

export const getGridStyle = (
  pkgList: (Packages | null)[],
  allPackagesLength: number,
) => {
  return {
    gridTemplateColumns: `35% repeat(${pkgList.length}, ${
      allPackagesLength > 5 ? '180px' : '1fr'
    })`,
  };
};

export const renderHeaderRow = (
  pkgList: (Packages | null)[],
  isMobile = false,
  allPackagesLength: number,
) => (
  <div
    className={`grid items-center text-white font-bold mt-10 ${
      isMobile ? 'xl:hidden' : 'xl:grid hidden'
    }`}
    style={getGridStyle(pkgList, allPackagesLength)}
  >
    <div className="text-2xl flex sm:text-4xl h-full items-end py-3">
      Mua gói
    </div>
    {pkgList.map((pkg, i) => (
      <div key={i} className="flex h-full relative">
        {pkg && (
          <>
            <img
              src={pkg.image_thumbnail || pkg.icon}
              alt={pkg.package_name || ''}
              className="object-fill"
            />
            {/* "Đang sử dụng" label */}
            {pkg.lbl_state && (
              <div className="absolute w-[70%] top-0 left-1/2 -translate-x-1/2 z-1 bg-white text-black text-sm font-[400] px-2 py-1 rounded-b-xl transform text-center shadow-[0_1px_1px_0px_rgba(0,0,0,0.25)]">
                {pkg.lbl_state}
              </div>
            )}
          </>
        )}
      </div>
    ))}
  </div>
);

export const renderFeatureRow = (
  listFeature: FeatureType[],
  pkgList: (Packages | null)[],
  isMobile = false,
  allPackagesLength: number,
) =>
  listFeature.map((feature, index) => {
    const isEven = index % 2 === 0;
    const baseClasses = 'items-center min-h-[55px]';
    const bgClass = isEven ? 'bg-eerie-black text-white' : '';
    const isHidden = isMobile ? 'xl:hidden' : 'hidden xl:grid';

    return (
      <div
        key={index}
        className={`grid ${baseClasses} ${bgClass} ${isHidden} select-none`}
        style={getGridStyle(pkgList, allPackagesLength)}
      >
        <div className="pl-3 text-sm xl:text-base py-5">{feature.name}</div>
        {pkgList.map((pkg, i) => {
          if (!pkg) return <div key={i} />;

          if (index === 0) {
            return (
              <div
                key={i}
                className={`text-center flex flex-col items-center py-2 justify-center h-full ${bgClass}`}
              >
                <span className="text-lg xl:text-xl font-bold">
                  {pkg.price_display}
                </span>
                <span className="mt-[-5px] text-sm">
                  {pkg.term_package_display}
                </span>
              </div>
            );
          }

          if (index === 1) {
            return (
              <div key={i} className={`text-center py-1 ${bgClass}`}>
                {pkg.num_device}
              </div>
            );
          }

          const isEnabled = pkg.features_display?.[index]?.value === 1;
          return (
            <div
              key={i}
              className={`flex justify-center items-center h-full ${bgClass}`}
            >
              {isEnabled ? (
                <BsCheckCircleFill className="w-5 h-5 text-fpl" />
              ) : (
                <BsFillXCircleFill className="w-5 h-5 text-dim-gray" />
              )}
            </div>
          );
        })}
      </div>
    );
  });

export const renderBuyButtons = (
  pkgList: (Packages | null)[],
  isMobile = false,
  handleBuyPackage: (type: string) => void,
  allPackagesLength: number,
) => (
  <div
    className={`grid items-center ${isMobile ? 'xl:hidden' : 'hidden xl:grid'}`}
    style={getGridStyle(pkgList, allPackagesLength)}
  >
    <div className="h-[100px]"></div>
    {pkgList.map((pkg, i) => (
      <div key={i} className="flex justify-center">
        {pkg?.type && (
          <button
            onClick={() => handleBuyPackage(pkg.type!)}
            className="bg-raisin-black text-white font-semibold py-2 px-4 rounded-lg select-none
            hover:bg-[linear-gradient(114.88deg,_rgb(254,89,42),_rgb(233,48,19))] transition-all cursor-pointer"
          >
            {isMobile ? 'Đăng ký' : 'Chọn gói này'}
          </button>
        )}
      </div>
    ))}
  </div>
);
