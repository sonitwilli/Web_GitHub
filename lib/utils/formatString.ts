const formatMacAddress = (value: string) => {
  const cleanValue = value.replace(/:/g, '');
  const pairs = cleanValue.match(/.{1,2}/g);
  if (!pairs) return '';
  return pairs.join(':');
};

const formatDate = (input: string) => {
  const [datePart] = input.split(' ');
  const [year, month, day] = datePart.split('-');
  return `${day}/${month}/${year}`;
};

const addOneYear = (input: string) => {
  const date = new Date(input);
  date.setFullYear(date.getFullYear() + 1);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const toTitleCase = (input: string) => {
  return input
    .replace(/\b(fpt)\b/gi, 'FPT')
    .split(' ')
    .map((word) =>
      word === 'FPT'
        ? 'FPT'
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(' ');
};

const currencyFormat = (
  value: number,
  sign: string = 'đ',
  sup: number = 1000,
) => {
  value = value * sup;
  return value
    ?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    .replace(/\s?(VND|₫)/, ` ${sign}`);
};

const convertToNumber = (text: string) => {
  const num = text.match(/\d/g)?.join('');
  if (!num) return 0;
  return num;
};
export {
  formatMacAddress,
  formatDate,
  addOneYear,
  toTitleCase,
  currencyFormat,
  convertToNumber,
};
