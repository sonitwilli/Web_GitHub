import moment from 'moment';

export const convertTimeStandardVN = () => {
  return (time: string | number, format: string = 'dd/MM/yyyy') => {
    let stringDate = format;
    const date = moment(time);

    if (format.includes('DD')) {
      let dayText = 'Thứ ' + (date.day() + 1);
      if (date.day() === 0) dayText = 'Chủ nhật';
      else if (date.day() === 1) dayText = 'Thứ 2';
      stringDate = stringDate.replace('DD', dayText);
    }

    if (format.includes('dd')) {
      const temp = 'ngày ' + date.date().toString().padStart(2, '0');
      stringDate = stringDate.replace('dd', temp);
    }

    if (format.includes('MM')) {
      const temp = 'tháng ' + (date.month() + 1).toString().padStart(2, '0');
      stringDate = stringDate.replace('MM', temp);
    }

    if (format.includes('yyyy')) {
      stringDate = stringDate.replace('yyyy', date.year().toString());
    }

    if (format.includes('hh')) {
      stringDate = stringDate.replace(
        'hh',
        date.hours().toString().padStart(2, '0'),
      );
    }

    if (format.includes('mm')) {
      stringDate = stringDate.replace(
        'mm',
        date.minutes().toString().padStart(2, '0'),
      );
    }

    if (format.includes('ss')) {
      stringDate = stringDate.replace(
        'ss',
        date.seconds().toString().padStart(2, '0'),
      );
    }

    if (format.includes('.sss')) {
      stringDate = stringDate.replace('.sss', '.' + date.milliseconds());
    }

    return stringDate;
  };
};

export const timeUtils = () => {
  const extractTimestamp = (timestamp: number) => {
    const data = new Date(timestamp * 1000);
    return {
      day: data.getDate().toString().padStart(2, '0'),
      month: (data.getMonth() + 1).toString().padStart(2, '0'),
      year: data.getFullYear(),
      hour: data.getHours().toString().padStart(2, '0'),
      minute: data.getMinutes().toString().padStart(2, '0'),
    };
  };

  const getHourMinute = (timestamp: number) => {
    const { hour, minute } = extractTimestamp(timestamp);
    return `${hour}:${minute}`;
  };

  const getDayMonth = (timestamp: number) => {
    const { day, month } = extractTimestamp(timestamp);
    return `${day}/${month}`;
  };

  const getDayMonthYear = (timestamp: number) => {
    const { day, month, year } = extractTimestamp(timestamp);
    return `${day}/${month}/${year}`;
  };

  const getFullTime = (timestamp: number) => {
    const { day, month, year, hour, minute } = extractTimestamp(timestamp);
    return `${day}/${month}/${year} - ${hour}:${minute}`;
  };

  const getFullTimeRevert = (timestamp: number) => {
    const { day, month, year, hour, minute } = extractTimestamp(timestamp);
    return `${hour}:${minute} ${day}/${month}/${year}`;
  };

  return {
    extractTimestamp,
    getHourMinute,
    getDayMonth,
    getDayMonthYear,
    getFullTime,
    getFullTimeRevert,
  };
};

// Định nghĩa interface cho dữ liệu lưu trữ
interface StoredValue<T> {
  value: T;
  expiry: number;
}

// Utility function để quản lý localStorage với thời gian hết hạn
export function localStorageWithExpiry<T>(
  key: string,
  defaultValue: T | null = null,
) {
  // Kiểm tra môi trường trình duyệt
  const isBrowser = typeof window !== 'undefined';

  // Hàm lưu dữ liệu vào localStorage với thời gian hết hạn (tính bằng phút)
  function setItem(value: T, expiryInMinutes: number): void {
    if (!isBrowser) return;

    try {
      const expiryTime = new Date().getTime() + expiryInMinutes * 60 * 1000;
      const item: StoredValue<T> = {
        value,
        expiry: expiryTime,
      };

      window.localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  }

  // Hàm lấy dữ liệu từ localStorage
  function getItem(): T | null {
    if (!isBrowser) return defaultValue;

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return defaultValue;

      const parsedItem: StoredValue<T> = JSON.parse(item);
      const now = new Date().getTime();

      if (now > parsedItem.expiry) {
        window.localStorage.removeItem(key);
        return defaultValue;
      }

      return parsedItem.value;
    } catch (error) {
      console.error('Error getting localStorage:', error);
      return defaultValue;
    }
  }

  // Hàm xóa dữ liệu khỏi localStorage
  function removeItem(): void {
    if (!isBrowser) return;

    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage:', error);
    }
  }

  return {
    setItem,
    getItem,
    removeItem,
  };
}
