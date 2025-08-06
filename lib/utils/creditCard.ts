// Types and interfaces
interface Card {
  type: string;
  patterns: number[];
  format: RegExp;
  length: number[];
  cvvLength: number[];
  luhn: boolean;
}

interface CardExpiryResult {
  month: number | string;
  year: number | string;
  plainYear: string | null;
  plainMonth: string | null;
}

interface ValidationResult {
  status: number;
  msg?: string;
  data?:
    | Card
    | CardExpiryResult
    | { month: number | string; year: number | string };
}

// Dateset
const cards: Card[] = [
  // Credit cards
  {
    type: 'visa',
    patterns: [4],
    format: /(\d{1,4})/g,
    length: [13, 16],
    cvvLength: [3],
    luhn: true,
  },
  {
    type: 'mastercard',
    patterns: [51, 52, 53, 54, 55, 22, 23, 24, 25, 26, 27],
    format: /(\d{1,4})/g,
    length: [16],
    cvvLength: [3],
    luhn: true,
  },
  {
    type: 'jcb',
    patterns: [35],
    format: /(\d{1,4})/g,
    length: [16],
    cvvLength: [3],
    luhn: true,
  },
  {
    type: 'amex',
    patterns: [37],
    format: /(\d{1,4})/g,
    length: [15],
    cvvLength: [3],
    luhn: true,
  },
];

// Utils functions
const __guard__ = <T, R>(
  value: T | undefined | null,
  transform: (value: T) => R,
): R | undefined => {
  return typeof value !== 'undefined' && value !== null
    ? transform(value)
    : undefined;
};

const cardFromNumber = (num: string): Card | undefined => {
  num = (num + '').replace(/\D/g, ''); // loại bỏ ký tự không phải số
  for (const i in cards) {
    for (const j in cards[i].patterns) {
      const p = cards[i].patterns[j] + '';
      if (num.substr(0, p.length) === p) {
        // kiểm tra số đầu tiên trong chuỗi có mảng patterns không
        return cards[i];
      }
    }
  }
};

const cardFromType = (type: string): Card | undefined => {
  for (const i in cards) {
    if (cards[i].type === type) {
      return cards[i];
    }
  }
};

const lunhCheck = (num: string | number): boolean => {
  let odd = true;
  let sum = 0;

  const digits = (num + '').split('').reverse(); // đảo ngược chuỗi

  for (const i in digits) {
    let digit = parseInt(digits[i], 10);
    if ((odd = !odd)) {
      digit *= 2; // nếu vị trí là chẵn thì nhân 2
    }
    if (digit > 9) {
      digit -= 9; // nếu kết quả nhân >9 thì -9 (tương đương cộng các chữ số sau khi nhân)
    }
    sum += digit;
  }

  return sum % 10 === 0;
};

const cardExpiryVal = (value: string): CardExpiryResult => {
  const [monthStr, yearStr] = Array.from(value.split(/[\s/]+/, 2));
  let plainYear: string | null = null;
  let plainMonth: string | null = null;
  let finalYearStr = yearStr;

  // Allow for year shortcut
  if (
    (yearStr != null ? yearStr.length : undefined) === 2 &&
    /^\d+$/.test(yearStr)
  ) {
    let prefix: string = new Date().getFullYear().toString();
    prefix = prefix.slice(0, 2);
    plainYear = yearStr;
    plainMonth = monthStr;
    finalYearStr = prefix + yearStr;
  }

  const month = parseInt(monthStr, 10);
  const year = parseInt(finalYearStr, 10);

  return { month, year, plainYear, plainMonth };
};

// Validate functions
export const validateCardNumber = (val: string | number): ValidationResult => {
  const inputValue = (val + '').replace(/\s+|-/g, ''); // convert sang string sau đó loại bỏ khoảng trắng và dấu gạch ngang

  if (!/^\d+$/.test(inputValue)) {
    // check chuỗi chỉ được chứa số
    return {
      status: 0,
      msg: 'Số thẻ không đúng định dạng. Vui lòng thử lại.',
    };
  }

  const card = cardFromNumber(inputValue); // kiểm tra số đầu tiên của chuỗi có thuộc patterns của loại thẻ nào không
  if (!card) {
    return {
      status: 0,
      msg: 'Số thẻ không đúng định dạng. Vui lòng thử lại.',
    };
  }

  const isValid =
    Array.from(card.length).includes(inputValue.length) &&
    (card.luhn === false || lunhCheck(inputValue));
  // kiểm tra mảng card.length có chứa độ dài của chuỗi không, sau đó check lunh nếu card.lunh = true

  if (!isValid) {
    return {
      status: 0,
      msg: 'Số thẻ không đúng định dạng. Vui lòng thử lại.',
    };
  }

  return {
    status: 1,
    data: card,
  };
};

export const validateExpDate = (
  month: string | number | { month: string | number; year: string | number },
  year?: string | number,
): ValidationResult => {
  if (!month) {
    return {
      status: 0,
      msg: 'Vui lòng nhập ngày hết hạn.',
    };
  }

  let plainYear: string | null = null;
  let plainMonth: string | null = null;
  let monthStr: string;
  let yearStr: string;

  if (!year) {
    const result = cardExpiryVal(month.toString());
    monthStr = result.month.toString();
    yearStr = result.year.toString();
    plainYear = result.plainYear;
    plainMonth = result.plainMonth;
  } else {
    // Allow passing an object
    if (typeof month === 'object' && 'month' in month) {
      monthStr = month.month.toString();
      yearStr = month.year.toString();
    } else {
      monthStr = month.toString();
      yearStr = year.toString();
    }
  }

  monthStr = monthStr.trim();
  yearStr = yearStr.trim();
  console.log('month year', monthStr, yearStr);
  if (
    !Number.isInteger(Number(monthStr)) ||
    !Number.isInteger(Number(yearStr))
  ) {
    return {
      status: 0,
      msg: 'Ngày hết hạn không đúng định dạng. Vui lòng thử lại.',
    };
  }
  if (!/^\d+$/.test(monthStr)) {
    return {
      status: 0,
      msg: 'Tháng không hợp lệ',
    };
  }
  if (!/^\d+$/.test(yearStr)) {
    return {
      status: 0,
      msg: 'Tháng không hợp lệ',
    };
  }
  if (!(parseInt(monthStr) >= 1 && parseInt(monthStr) <= 12)) {
    return {
      status: 0,
      msg: 'Tháng không hợp lệ',
    };
  }

  if (yearStr.length === 2) {
    if (parseInt(yearStr) < 70) {
      yearStr = `20${yearStr}`;
    } else {
      yearStr = `19${yearStr}`;
    }
  }

  if (yearStr.length !== 4) {
    return {
      status: 0,
      msg: 'Thẻ đã hết hạn.',
    };
  }

  const expiry = new Date(parseInt(yearStr), parseInt(monthStr));
  const currentTime = new Date();

  // Months start from 0 in JavaScript
  expiry.setMonth(expiry.getMonth() - 1);

  // The cc expires at the end of the month,
  // so we need to make the expiry the first day
  // of the month after
  expiry.setMonth(expiry.getMonth() + 1, 1);

  if (expiry > currentTime) {
    return {
      status: 1,
      data: {
        month: plainMonth || '',
        year: plainYear || '',
      },
    };
  }

  return {
    status: 0,
    msg: 'Thẻ đã hết hạn',
  };
};

export const validateCvv = (
  cvv: string | number,
  type: string,
): ValidationResult => {
  if (!cvv) {
    return {
      status: 0,
      msg: 'Vui lòng nhập mã CVV/CSC',
    };
  }
  cvv = cvv.toString().trim();
  if (!/^\d+$/.test(cvv)) {
    return {
      status: 0,
      msg: 'Mã CVV/CSC không hợp lệ',
    };
  }

  const card = cardFromType(type);
  if (card) {
    // Check against a explicit card type
    const checkLengthByType = Array.from(card.cvvLength).includes(cvv.length);

    if (!checkLengthByType) {
      return {
        status: 0,
        msg: 'Mã CVV/CSC không hợp lệ',
      };
    }
  } else {
    // Check against all types
    const checkLength = cvv.length >= 3 && cvv.length <= 4;

    if (!checkLength) {
      return {
        status: 0,
        msg: 'Mã CVV/CSC không hợp lệ',
      };
    }
  }

  return {
    status: 1,
  };
};

// Masks
export const maskCardNumber = (value: string | number): string => {
  let num = value.toString().replace(/\D/g, '');
  const card = cardFromNumber(num);
  if (!card) {
    return num ? num.match(/.{1,4}/g)?.join(' - ') || '' : '';
  }

  const upperLength = card.length[card.length.length - 1];
  num = num.slice(0, upperLength);

  if (card.format.global) {
    return (
      __guard__(num.match(card.format), (x: RegExpMatchArray) =>
        x.join(' - '),
      ) || ''
    );
  } else {
    const groups = card.format.exec(num);
    if (groups == null) {
      return '';
    }
    groups.shift();
    // @TODO: Change to native filter()
    // groups = grep(groups, n => n); // Filter empty groups
    return groups.join(' - ');
  }
};

export const maskExpDate = (value: string | number): string => {
  const parts = value.toString().match(/^\D*(\d{1,2})(\D+)?(\d{1,4})?/);
  if (!parts) {
    return '';
  }

  let mon = parts[1] || '';
  let sep = parts[2] || '';
  const year = parts[3] || '';

  if (year.length > 0) {
    sep = '/';
  } else if (sep === ' /') {
    mon = mon.substring(0, 1);
    sep = '';
  } else if (mon.length === 2 || sep.length > 0) {
    sep = '/';
  } else if (mon.length === 1 && !['0', '1'].includes(mon)) {
    mon = `0${mon}`;
    sep = '/';
  }

  return mon + sep + year;
};
