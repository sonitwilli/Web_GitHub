// Định nghĩa offset cho múi giờ Việt Nam (UTC+7) tính bằng mili giây
export const VIETNAM_TIMEZONE_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Lấy đối tượng Date hiện tại đã được điều chỉnh theo múi giờ Việt Nam (UTC+7).
 * Hàm này tính toán độ lệch múi giờ cục bộ của trình duyệt và bù đắp để ra giờ Việt Nam.
 * @returns {Date} Đối tượng Date đã được điều chỉnh theo giờ Việt Nam.
 */
export const getVietnamTime = (): Date => {
  const now = new Date();
  // now.getTimezoneOffset() trả về độ lệch múi giờ cục bộ tính bằng phút so với UTC.
  // Ví dụ: Nếu múi giờ cục bộ là UTC+7, nó sẽ trả về -420 phút.
  // Chúng ta cần thêm offset của Việt Nam và bù lại cho offset cục bộ để ra giờ Việt Nam.
  return new Date(
    now.getTime() +
      VIETNAM_TIMEZONE_OFFSET_MS +
      now.getTimezoneOffset() * 60 * 1000,
  );
};

/**
 * Định dạng đối tượng Date thành chuỗi ngày YYYY-MM-DD theo múi giờ của đối tượng Date đó.
 * Quan trọng: Đối tượng Date đầu vào PHẢI ĐƯỢC điều chỉnh múi giờ trước đó (ví dụ: bằng getVietnamTime()).
 * @param {Date} date - Đối tượng Date cần định dạng.
 * @returns {string} Chuỗi ngày ở định dạng YYYY-MM-DD.
 */
export const formatVietnamDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Định dạng thời gian Unix timestamp thành chuỗi giờ phút (HH:MM) theo múi giờ Việt Nam.
 * @param {number} unixTimestamp - Thời gian Unix timestamp (tính bằng mili giây).
 * @returns {string} Chuỗi thời gian ở định dạng HH:MM.
 */
export const formatVietnamTimeHHMM = (unixTimestamp: number): string => {
  return new Date(unixTimestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Để đảm bảo định dạng 24 giờ
    timeZone: 'Asia/Ho_Chi_Minh', // Quan trọng: Đảm bảo đúng múi giờ cho toLocaleTimeString
  });
};

/**
 * Định dạng chuỗi ngày YYYY-MM-DD thành chuỗi ngày/tháng (DD/MM) theo múi giờ Việt Nam.
 * @param {string} dateStr - Chuỗi ngày ở định dạng YYYY-MM-DD.
 * @returns {string} Chuỗi ngày/tháng ở định dạng DD/MM.
 */
export const formatVietnamDayMonth = (dateStr: string): string => {
  // Khi tạo Date từ chuỗi YYYY-MM-DD, nó sẽ được hiểu là UTC.
  // toLocaleDateString với timeZone 'Asia/Ho_Chi_Minh' sẽ chuyển đổi chính xác.
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh', // Quan trọng: Đảm bảo đúng múi giờ
  });
};

/**
 * Định dạng chuỗi ngày YYYY-MM-DD thành chuỗi ngày đầy đủ (Thứ, DD/MM) theo múi giờ Việt Nam.
 * @param {string} dateStr - Chuỗi ngày ở định dạng YYYY-MM-DD.
 * @returns {string} Chuỗi ngày ở định dạng "Thứ Ba, 28/05".
 */
export const formatVietnamFullDay = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh', // Quan trọng: Đảm bảo đúng múi giờ
  });
};

export const formatVietnamDayTimeLabel = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const now = new Date();

  const vnDate = new Date(
    date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
  );
  const vnNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
  );

  const dateOnly = new Date(
    vnDate.getFullYear(),
    vnDate.getMonth(),
    vnDate.getDate(),
  );
  const nowOnly = new Date(
    vnNow.getFullYear(),
    vnNow.getMonth(),
    vnNow.getDate(),
  );

  const diffTime = dateOnly.getTime() - nowOnly.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let dayLabel: string;

  if (diffDays === 0) {
    dayLabel = 'Hôm nay';
  } else if (diffDays === -1) {
    dayLabel = 'Hôm qua';
  } else if (diffDays === 1) {
    dayLabel = 'Ngày mai';
  } else if (Math.abs(diffDays) < 7) {
    dayLabel = vnDate.toLocaleDateString('vi-VN', {
      weekday: 'long',
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  } else {
    const dd = String(vnDate.getDate()).padStart(2, '0');
    const mm = String(vnDate.getMonth() + 1).padStart(2, '0');
    dayLabel = `${dd}/${mm}`;
  }

  const time = vnDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  return `${dayLabel} lúc ${time}`;
};

export const formatVietnamDayTimeLabelLowerCase = (
  timestamp: number,
): string => {
  const date = new Date(timestamp * 1000);
  const now = new Date();

  const vnDate = new Date(
    date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
  );
  const vnNow = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
  );

  const dateOnly = new Date(
    vnDate.getFullYear(),
    vnDate.getMonth(),
    vnDate.getDate(),
  );
  const nowOnly = new Date(
    vnNow.getFullYear(),
    vnNow.getMonth(),
    vnNow.getDate(),
  );

  const diffTime = dateOnly.getTime() - nowOnly.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let dayLabel: string;

  if (diffDays === 0) {
    dayLabel = 'hôm nay';
  } else if (diffDays === -1) {
    dayLabel = 'hôm qua';
  } else if (diffDays === 1) {
    dayLabel = 'ngày mai';
  } else if (Math.abs(diffDays) < 7) {
    // lấy thứ viết thường
    const weekday = vnDate.toLocaleDateString('vi-VN', {
      weekday: 'long',
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    dayLabel = weekday.charAt(0).toLowerCase() + weekday.slice(1);
  } else {
    const dd = String(vnDate.getDate()).padStart(2, '0');
    const mm = String(vnDate.getMonth() + 1).padStart(2, '0');
    dayLabel = `${dd}/${mm}`;
  }

  const time = vnDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  return `${dayLabel} lúc ${time}`;
};
