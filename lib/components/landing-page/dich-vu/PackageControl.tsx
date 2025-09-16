import PackageCarousel from './PackageCarousel';

const fptPackages = [
  {
    name: 'FTV119',
    description:
      'Xem truyền hình (trừ các kênh K+, HBO Go), các giải thể thao quốc tế và trong nước, kho phim bộ, phim lẻ khổng lồ và hàng ngàn nội dung giải trí khác trong 30 ngày (Lưu ý: Đăng nhập và xem cùng lúc trên 2 thiết bị mobile (bao gồm Phone và Tablet).',      
    details:
      'Miễn phí Data tốc độ cao truy cập ứng dụng FPT Play. Cộng 2GB/ngày truy cập Internet',
    syntax: 'Soạn DK FTV119 gửi 789 hoặc FTV119 gửi 789 (Miễn phí SMS)',
    syntax2:
      'Soạn HUY FTV119 gửi 789 (Miễn phí SMS). Để kiểm tra dung lượng data của gói cước soạn: Soạn KT ALL gửi 999 (200đ/SMS) hoặc nhấn gọi *090*5# (miễn phí)',
    
    fee: {
      text: 'Đăng ký với mức cước',
      details: '119.000 ĐỒNG',
    },
  }
];

const viettelPackages = [
  {
    name: 'Ngày (F1)',
    description:
      'Xem tất cả nội dung cơ bản của dịch vụ nhưng không bao gồm các nội dung cao cấp trong 01 ngày',
    details: 'Miễn phí không giới hạn dung lượng khi xem nội dung của gói.',
    syntax: 'Soạn XN1F gửi 5282',
    syntax2: 'Soạn HUY F1 gửi 5282',
    fee: {
      text: 'Đăng ký với mức cước',
      details: '3.000 ĐỒNG',
    },
  },
  {
    name: 'Tuần (F7)',
    description:
      'Xem tất cả nội dung cơ bản của dịch vụ nhưng không bao gồm các nội dung cao cấp trong 07 ngày',
    details: 'Miễn phí không giới hạn dung lượng khi xem nội dung của gói',
    syntax: 'Soạn F7 gửi 5282',
    syntax2: 'Soạn HUY F7 gửi 5282',
    fee: {
      text: 'Đăng ký với mức cước',
      details: '10.000 ĐỒNG',
    },
  },
  {
    name: 'Tháng (F30)',
    description:
      'Xem tất cả nội dung cơ bản của dịch vụ nhưng không bao gồm các nội dung cao cấp trong 30 ngày',
    details: 'Miễn phí không giới hạn dung lượng khi xem nội dung của gói',
    syntax: 'Soạn F30 gửi 5282',
    syntax2: 'Soạn HUY F30 gửi 5282',
    fee: {
      text: 'Đăng ký với mức cước',
      details: '30.000 ĐỒNG',
    },
  },
];

const mobifonePackages = [
  {
    name: 'Ngày (F1)',
    description:
      'Xem tất cả nội dung cơ bản của dịch vụ nhưng không bao gồm các nội dung cao cấp trong 01 ngày',
    details: {
      head: 'Miễn phí không giới hạn dung lượng khi xem nội dung của gói và được cộng thêm',
      data: '100MB',
      tail: 'dung lượng tốc độ cao cộng vào tài khoản Data quản lý trên PRCF để thuê bao có thể truy cập các dịch vụ internet khác và để tránh phát sinh cước ngoài gói.',
    },
    syntax: 'Soạn DK F1 gửi 1584',
    syntax2: 'Soạn HUY F1 gửi 1584',
    fee: {
      text: 'Đăng ký với mức cước',
      details: '3.000 ĐỒNG',
    },
  },
  {
    name: 'Ngày (TT1)',
    description: 'Xem nội dung thể thao, giái trí hấp dẫn trong 01 ngày.',
    details: {
      head: 'Miễn phí không giới hạn dung lượng khi xem nội dung của gói và được cộng thêm',
      data: '100MB',
      tail: 'dung lượng tốc độ cao cộng vào tài khoản Data quản lý trên PRCF để thuê bao có thể truy cập các dịch vụ internet khác và để tránh phát sinh cước ngoài gói.',
    },
    syntax: 'Soạn DK TT1 gửi 1584',
    syntax2: 'Soạn HUY TT1 gửi 1584',
    fee: {
      text: 'Đăng ký với mức cước',
      details: '10.000 ĐỒNG',
    },
  },
  {
    name: 'Tuần (TT7)',
    description: 'Xem nội dung thể thao, giái trí hấp dẫn trong 07 ngày.',
    details: {
      head: 'Miễn phí không giới hạn dung lượng khi xem nội dung của gói và được cộng thêm',
      data: '200MB',
      tail: 'dung lượng tốc độ cao cộng vào tài khoản Data quản lý trên PRCF để thuê bao có thể truy cập các dịch vụ internet khác và để tránh phát sinh cước ngoài gói.',
    },
    syntax: 'Soạn DK TT7 gửi 1584',
    syntax2: 'Soạn HUY TT7 gửi 1584',
    fee: {
      text: 'Đăng ký với mức cước',
      details: '30.000 ĐỒNG',
    },
  },
];

const vinaphonePackages = [
  {
    name: 'Ngày (F1)',
    description:
      'Xem tất cả nội dung cơ bản của dịch vụ nhưng không bao gồm các nội dung cao cấp trong 01 ngày',
    details: 'Miễn phí không giới hạn dung lượng khi xem nội dung của gói',
    syntax: 'Soạn DK F1 gửi 9113',
    syntax2: 'Soạn HUY F1 gửi 9113',
    fee: {
      text: 'Đăng ký với mức cước',
      details: '3.000 ĐỒNG',
    },
  },
  {
    name: 'Tuần (F7)',
    description:
      'Xem tất cả nội dung cơ bản của dịch vụ nhưng không bao gồm các nội dung cao cấp trong 07 ngày',
    details: 'Miễn phí không giới hạn dung lượng khi xem nội dung của gói',
    syntax: 'Soạn DK F7 gửi 9113',
    syntax2: 'Soạn HUY F7 gửi 9113',
    fee: {
      text: 'Đăng ký với mức cước',
      details: '15.000 ĐỒNG',
    },
  },
  {
    name: 'VIP',
    description: 'Xem nội dung thể thao, giái trí hấp dẫn trong 01 ngày.',
    details: 'Miễn phí không giới hạn dung lượng khi xem nội dung của gói',
    syntax: 'Soạn DK VIP gửi 9113',
    syntax2: 'Soạn HUY VIP gửi 9113',
    fee: {
      text: 'Đăng ký với mức cước',
      details: '5.000 ĐỒNG',
    },
  },
];

type selectedProps = {
  selectedTelcos: string;
};

export default function PackageControl(props: selectedProps) {
  const { selectedTelcos } = props;
  return (
    <>
      {selectedTelcos === 'fpt' && (
        <PackageCarousel
          id="fpt"
          title="GÓI 3G/4G FPT"
          packages={fptPackages}
          showControls={false}
        />
      )}

      {selectedTelcos === 'viettel' && (
        <PackageCarousel
          id="viettel"
          title="GÓI 3G/4G VIETTEL"
          packages={viettelPackages}
          showControls={true}
        />
      )}

      {selectedTelcos === 'mobifone' && (
        <PackageCarousel
          id="mobifone"
          title="GÓI 3G/4G MOBIFONE"
          packages={mobifonePackages}
          showControls={true}
        />
      )}

      {selectedTelcos === 'vinaphone' && (
        <PackageCarousel
          id="vinaphpne"
          title="GÓI 3G/4G VINAPHONE"
          packages={vinaphonePackages}
          showControls={true}
        />
      )}
    </>
  );
}
