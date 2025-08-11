import React, { useState, useEffect, useCallback } from 'react';
import ModalWrapper from './ModalWrapper';
import { SubmitReportRequest } from '@/lib/api/report';

interface ReportOption {
  value?: string;
  label?: string;
}

interface ModalContent {
  title?: string;
  buttons?: {
    cancel?: string;
    accept?: string;
  };
}

interface DataPost {
  video_id?: string;
  chapter_id?: string;
  ref_id?: string;
  chapter_ref_id?: string;
  app_id?: string;
  report_ids?: string;
}

interface ReportModalProps {
  open: boolean;
  onHidden: () => void;
  modalContent: ModalContent;
  dataPost?: DataPost;
  options: ReportOption[];
  onSubmit?: (data: SubmitReportRequest) => void;
  onPauseVideo?: () => void;
  onPlayVideo?: () => void;
  portalTarget?: HTMLElement;
}

const ReportModal: React.FC<ReportModalProps> = ({
  open,
  onHidden,
  modalContent,
  dataPost = {
    video_id: '',
    chapter_id: '0',
    ref_id: '',
    chapter_ref_id: '0',
    app_id: '',
    report_ids: '',
  },
  options,
  onSubmit,
  onPauseVideo,
  onPlayVideo,
  portalTarget,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const maxCharacters = 1000;

  const characterCount = text.length;
  const isLimitExceeded = characterCount > maxCharacters;

  const closeModal = useCallback(() => {
    setSelected([]);
    onPlayVideo?.();
    onHidden();
  }, [onHidden, onPlayVideo]);

  const handleCancel = useCallback(() => {
    setSelected([]);
    setText('');
    onPlayVideo?.();
    onHidden();
  }, [onHidden, onPlayVideo]);

  const openModal = useCallback(() => {
    onPauseVideo?.();
  }, [onPauseVideo]);

  const handleCheckboxChange = (value: string, checked: boolean) => {
    if (checked) {
      setSelected((prev) => [...prev, value]);
    } else {
      setSelected((prev) => prev.filter((item) => item !== value));
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const handleTextareaFocus = () => {
    setIsFocused(true);
  };

  const handleTextareaBlur = () => {
    setIsFocused(false);
  };

  const handleSubmit = () => {
    if ((!selected.length && text.length === 0) || text.length > 1000) {
      return;
    }

    const dataReport: SubmitReportRequest = {
      ...dataPost,
      report_ids: selected,
      report_text: text,
    };

    onSubmit?.(dataReport);
    setText('');
    closeModal();
  };

  const isSubmitDisabled =
    (!selected.length && text.length === 0) || text.length > 1000;

  useEffect(() => {
    if (open) {
      openModal();
    }
  }, [open, openModal]);

  useEffect(() => {
    if (!open) {
      setSelected([]);
      setText('');
    }
  }, [open]);

  return (
    <ModalWrapper
      open={open}
      onHidden={onHidden}
      contentClassName="w-full max-w-[576px] bg-eerie-black rounded-2xl p-8 text-white shadow-lg relative"
      overlayClassName="fixed inset-0 bg-black-06 flex justify-center items-center z-[9999]"
      shouldCloseOnOverlayClick={false}
      htmlOpenClassName="overflow-hidden"
      shouldCloseOnEsc={false}
      portalTarget={portalTarget}
    >
      <div data-modal-wrapper>
        <h4 className="text-left mb-6 text-2xl font-bold text-white">
          {modalContent.title}
        </h4>

        <div className="mb-6">
          <div className="flex flex-col gap-4">
            {options.map((option) => (
              <label
                key={option.value}
                className="relative inline-flex items-center gap-2 cursor-pointer text-white-smoke"
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={selected.includes(option.value || '')}
                  onChange={(e) =>
                    handleCheckboxChange(option.value || '', e.target.checked)
                  }
                  className="peer sr-only"
                />

                <div className="h-[18px] w-[18px] shrink-0 rounded-[3px] border border-silver-chalice bg-transparent peer-checked:border-none peer-checked:bg-fpl flex items-center justify-center">
                  {selected.includes(option.value || '') && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                <span className="text-base leading-[19px] font-normal text-white-087">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 relative">
          <h3 className="text-base font-normal leading-[1.3] text-white-smoke mb-2">
            Nội dung chưa phù hợp khác (Không bắt buộc)
          </h3>

          <div
            className={`rounded-xl bg-eerie-black p-3 pb-7 border ${
              isFocused ? 'border-gray' : 'border-black-olive-404040'
            }`}
          >
            <textarea
              name="submit-area"
              className="w-full border-0 placeholder-davys-grey h-[72px] outline-none bg-eerie-black break-words overflow-y-auto resize-none text-light-gray text-base leading-[1.3] font-normal"
              placeholder="Viết báo cáo"
              value={text}
              onChange={handleTextChange}
              onFocus={handleTextareaFocus}
              onBlur={handleTextareaBlur}
            />

            <div className="absolute right-3 bottom-2 flex items-center text-xs font-normal leading-[1.3] text-dim-gray">
              <span className={isLimitExceeded ? 'text-spanish-crimson' : ''}>
                {characterCount}
              </span>
              /<span>1000</span>
            </div>
          </div>
        </div>

        <div className="flex items-center mx-auto w-full pb-0 justify-center gap-3 mt-6">
          {modalContent.buttons?.cancel && (
            <button
              className="flex-1 px-5 py-3 cursor-pointer rounded-[40px] bg-black-olive-404040 text-white-smoke font-medium text-base hover:bg-black-olive transition-colors"
              onClick={handleCancel}
            >
              {modalContent.buttons.cancel}
            </button>
          )}

          {modalContent.buttons?.accept && (
            <button
              className={`flex-1 px-5 py-3 cursor-pointer rounded-[40px] font-medium text-base transition-colors ${
                !isSubmitDisabled
                  ? 'bg-gradient-to-r from-portland-orange to-lust text-white-smoke'
                  : 'bg-black-olive-404040 text-gray cursor-not-allowed'
              }`}
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
            >
              {modalContent.buttons.accept}
            </button>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default ReportModal;
