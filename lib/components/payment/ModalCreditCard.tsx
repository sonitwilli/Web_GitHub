import React, { useState, useEffect, useCallback, useRef } from 'react';
import ModalWrapper from '@/lib/components/modal/ModalWrapper';
import { IoCloseCircle } from 'react-icons/io5';
import {
  maskCardNumber,
  validateCardNumber,
  validateCvv,
  validateExpDate,
} from '@/lib/utils/creditCard';

// Stub tracking function (replace with real one if available)
const trackingCancelExtraRegister = () => {};

interface CardType {
  type: string;
  patterns: number[];
  format: RegExp;
  length: number[];
  cvvLength: number[];
  luhn: boolean;
}

interface CardExpiry {
  month: string | number;
  year: string | number;
}

export interface CreditCardData {
  card_number: string;
  card_name: string;
  card_cvv: string;
  card_expiration_month: string | number;
  card_expiration_year: string | number;
}

interface ModalCreditCardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreditCardData) => void;
}

const ModalCreditCard: React.FC<ModalCreditCardProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    cardNumber: '',
    expDate: '',
    cvv: '',
  });

  const [errors, setErrors] = useState({
    cardNumber: false,
    expDate: false,
    cvv: false,
  });

  const [errorMsg, setErrorMsg] = useState({
    cardNumber: '',
    expDate: '',
    cvv: '',
  });

  const [cardType, setCardType] = useState<CardType | null>(null);
  const [cardExp, setCardExp] = useState<CardExpiry | null>(null);
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const expDateRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);

  // State to track which fields are masked
  const [maskedFields, setMaskedFields] = useState({
    cardNumber: false,
    expDate: false,
    cvv: false,
  });

  // State to track previous length for expDate to detect deletion
  const [previousExpDateLength, setPreviousExpDateLength] = useState(0);
  const [isDeletingExpDate, setIsDeletingExpDate] = useState(false);

  const handleClose = useCallback(() => {
    onClose();
    trackingCancelExtraRegister();
  }, [onClose]);

  const validateForm = useCallback(
    (key: string, val: string) => {
      let validate: {
        status: number;
        msg?: string;
        data?: CardType | CardExpiry;
      } | null = null;

      if (key === 'cardNumber') {
        validate = validateCardNumber(val);
        if (validate?.data && 'type' in validate.data) {
          setCardType(validate.data as CardType);
        }
      } else if (key === 'expDate') {
        validate = validateExpDate(val);
        console.log('validate exp date', validate);
        if (validate?.data && 'month' in validate.data) {
          setCardExp(validate.data as CardExpiry);
        }
      } else if (key === 'cvv') {
        validate = validateCvv(val, cardType ? cardType.type : '');
      }

      if (!validate) {
        setErrors((prev) => ({ ...prev, [key]: true }));
        setErrorMsg((prev) => ({ ...prev, [key]: 'Dữ liệu không hợp lệ.' }));
        return;
      }

      if (validate.status === 0) {
        setErrors((prev) => ({ ...prev, [key]: true }));
        setErrorMsg((prev) => ({ ...prev, [key]: validate.msg || '' }));
      } else {
        setErrors((prev) => ({ ...prev, [key]: false }));
        setErrorMsg((prev) => ({ ...prev, [key]: '' }));
      }
    },
    [cardType],
  );

  const resetForm = useCallback(() => {
    setForm({
      cardNumber: '',
      expDate: '',
      cvv: '',
    });
    setErrors({
      cardNumber: false,
      expDate: false,
      cvv: false,
    });
    setErrorMsg({
      cardNumber: '',
      expDate: '',
      cvv: '',
    });
    setMaskedFields({
      cardNumber: false,
      expDate: false,
      cvv: false,
    });
    setCardType(null);
    setCardExp(null);
    setPreviousExpDateLength(0);
    setIsDeletingExpDate(false);
  }, []);

  const handleSubmit = useCallback(() => {
    // Validate tất cả các trường trước khi submit
    const fields = Object.keys(form);
    fields.forEach((field) =>
      validateForm(field, form[field as keyof typeof form]),
    );

    // Sử dụng setTimeout để đảm bảo state errors được cập nhật
    setTimeout(() => {
      // Kiểm tra lại sau khi validate
      const hasAllValues = fields.every(
        (field) =>
          form[field as keyof typeof form] &&
          form[field as keyof typeof form] !== '',
      );

      const hasErrors = Object.values(errors).some((error) => error === true);

      if (hasAllValues && !hasErrors && cardExp && cardType) {
        const data: CreditCardData = {
          card_number: form.cardNumber,
          card_name: '',
          card_cvv: form.cvv,
          card_expiration_month: cardExp.month,
          card_expiration_year: cardExp.year,
        };

        onSubmit(data);
        resetForm();
      }
    }, 0);
  }, [validateForm, form, errors, cardExp, cardType, onSubmit, resetForm]);

  const handleCardNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.replace(/ - /g, '');
      setForm((prev) => ({ ...prev, cardNumber: value }));
    },
    [],
  );

  const handleExpDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      const currentLength = value.length;

      // Check if user is deleting
      const isDeleting = currentLength < previousExpDateLength;

      if (isDeleting) {
        setIsDeletingExpDate(true);
        // When deleting, store the raw value without formatting
        setForm((prev) => ({ ...prev, expDate: value }));
      } else {
        setIsDeletingExpDate(false);
        // When typing, store the raw value
        setForm((prev) => ({ ...prev, expDate: value }));
      }

      setPreviousExpDateLength(currentLength);
    },
    [previousExpDateLength],
  );

  const handleCvvChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, cvv: value }));
    },
    [],
  );

  // Handle blur events to mask the input values
  const handleBlur = useCallback(
    (fieldName: 'cardNumber' | 'expDate' | 'cvv') => {
      setMaskedFields((prev) => ({ ...prev, [fieldName]: true }));
    },
    [],
  );

  // Handle focus events to unmask the input values
  const handleFocus = useCallback(
    (fieldName: 'cardNumber' | 'expDate' | 'cvv') => {
      setMaskedFields((prev) => ({ ...prev, [fieldName]: false }));
    },
    [],
  );

  // Helper function to format expDate without interfering with deletion
  const formatExpDate = useCallback((value: string): string => {
    if (!value) return '';

    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    if (digits.length === 0) return '';
    if (digits.length === 1) {
      // If first digit is 2-9, auto-add 0 prefix
      const firstDigit = parseInt(digits[0]);
      if (firstDigit >= 2 && firstDigit <= 9) {
        return `0${digits[0]}/`;
      }
      return digits;
    }
    if (digits.length === 2) {
      return `${digits.slice(0, 2)}/`;
    }
    if (digits.length === 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    if (digits.length >= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }

    return digits;
  }, []);

  // Helper function to get display value (masked or formatted)
  const getDisplayValue = useCallback(
    (value: string, fieldName: 'cardNumber' | 'expDate' | 'cvv') => {
      if (!value) return '';

      if (maskedFields[fieldName]) {
        // Return masked value
        if (fieldName === 'cardNumber') {
          return maskCardNumber(value).replace(/[0-9]/g, 'X');
        } else if (fieldName === 'expDate') {
          return formatExpDate(value).replace(/[0-9]/g, 'X');
        } else {
          return value.replace(/[0-9]/g, 'X');
        }
      } else {
        // Return formatted value
        if (fieldName === 'cardNumber') {
          return maskCardNumber(value);
        } else if (fieldName === 'expDate') {
          // Don't format when user is deleting
          if (isDeletingExpDate) {
            return value;
          }
          return formatExpDate(value);
        } else {
          return value;
        }
      }
    },
    [maskedFields, formatExpDate, isDeletingExpDate],
  );

  // Auto-focus card number input when modal opens
  useEffect(() => {
    if (open && cardNumberRef.current) {
      setTimeout(() => {
        cardNumberRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Validate form fields when they change
  useEffect(() => {
    if (form.cardNumber) {
      validateForm('cardNumber', form.cardNumber);
    }
  }, [form.cardNumber, validateForm]);

  useEffect(() => {
    if (form.expDate) {
      validateForm('expDate', form.expDate);
    }
  }, [form.expDate, validateForm]);

  useEffect(() => {
    if (form.cvv) {
      validateForm('cvv', form.cvv);
    }
  }, [form.cvv, validateForm]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  return (
    <ModalWrapper
      open={open}
      onHidden={handleClose}
      isCustom={false}
      contentClassName="w-full max-w-[calc(100%-32px)] sm:max-w-[600px] bg-neutral-900 rounded-2xl p-4 sm:p-8 text-white shadow-lg"
      overlayClassName="fixed inset-0 bg-black/60 flex justify-center items-center z-[9999]"
      shouldCloseOnOverlayClick={false}
      shouldCloseOnEsc={false}
      htmlOpenClassName="overflow-hidden"
    >
      {/* Mobile close icon */}
      <button
        className="text-gray-500 float-right block sm:hidden absolute right-2 top-2 z-10"
        onClick={handleClose}
        aria-label="Đóng"
      >
        <IoCloseCircle className="w-6 h-6 text-dim-gray" />
      </button>

      {/* Desktop close icon */}
      <button
        className="text-gray-500 float-right mt-0 hidden sm:block absolute right-3 top-3 z-10 cursor-pointer"
        onClick={handleClose}
        aria-label="Đóng"
      >
        <IoCloseCircle className="w-6 h-6 text-dim-gray" />
      </button>

      <div className="text-center mb-6">
        <p className="text-xl font-semibold text-white mb-4">
          Thanh toán thẻ tín dụng
        </p>
        <img
          src="/images/payments/foxpay_credit/credit-providers.png"
          className="max-w-full mx-auto"
          alt="Credit card providers"
        />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="mb-6">
          <label
            htmlFor="cardNumber"
            className="block text-white font-medium text-sm mb-2 text-left"
          >
            Số thẻ
          </label>
          <input
            ref={cardNumberRef}
            id="cardNumber"
            type="text"
            value={getDisplayValue(form.cardNumber, 'cardNumber')}
            onChange={handleCardNumberChange}
            onBlur={() => handleBlur('cardNumber')}
            onFocus={() => handleFocus('cardNumber')}
            className={`w-full h-[50px] px-6 py-3 text-sm font-normal rounded-lg border-2 transition-colors duration-200 outline-none text-left text-gray-300 bg-gradient-to-b from-black/35 to-black/35 bg-neutral-800 ${
              errors.cardNumber
                ? 'border-red-500 focus:border-red-500'
                : 'border-transparent focus:border-orange-500'
            }`}
            placeholder="0000 - 0000 - 0000 - 0000"
            maxLength={25}
            autoFocus={true}
          />
          {errors.cardNumber && (
            <p className="text-red-500 font-[500] text-sm mt-2 text-left">
              {errorMsg.cardNumber}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-8 mb-6">
          <div className="flex-1">
            <label
              htmlFor="expDate"
              className="block text-white font-medium text-sm mb-2 text-left"
            >
              Tháng/Năm hết hạn
            </label>
            <input
              ref={expDateRef}
              id="expDate"
              type="text"
              value={getDisplayValue(form.expDate, 'expDate')}
              onChange={handleExpDateChange}
              onBlur={() => handleBlur('expDate')}
              onFocus={() => handleFocus('expDate')}
              className={`w-full h-[50px] px-6 py-3 text-sm font-normal rounded-lg border-2 transition-colors duration-200 outline-none text-left text-gray-300 bg-gradient-to-b from-black/35 to-black/35 bg-neutral-800 ${
                errors.expDate
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-transparent focus:border-orange-500'
              }`}
              placeholder="MM/YY"
              maxLength={5}
            />
            {errors.expDate && (
              <p className="text-red-500 font-[500] text-sm mt-2 text-left">
                {errorMsg.expDate}
              </p>
            )}
          </div>

          <div className="flex-1 sm:mt-0 mt-8">
            <label
              htmlFor="cvv"
              className="block text-white font-medium text-sm mb-2 text-left"
            >
              CVV/CSC
            </label>
            <input
              ref={cvvRef}
              id="cvv"
              type="text"
              value={getDisplayValue(form.cvv, 'cvv')}
              onChange={handleCvvChange}
              onBlur={() => handleBlur('cvv')}
              onFocus={() => handleFocus('cvv')}
              className={`w-full h-[50px] px-6 py-3 text-sm font-normal rounded-lg border-2 transition-colors duration-200 outline-none text-left text-gray-300 bg-gradient-to-b from-black/35 to-black/35 bg-neutral-800 ${
                errors.cvv
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-transparent focus:border-orange-500'
              }`}
              placeholder="000"
              maxLength={4}
            />
            {errors.cvv && (
              <p className="text-red-500 font-[500] text-sm mt-2 text-left">
                {errorMsg.cvv}
              </p>
            )}
          </div>
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="px-8 py-3 mt-4 mx-auto bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-lg hover:opacity-90 transition-opacity duration-200"
          >
            Thanh toán
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default ModalCreditCard;
