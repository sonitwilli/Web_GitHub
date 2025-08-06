export type ControlPopupType = 'default' | 'fullcreen';

interface Props {
  onClose?: () => void;
  children?: React.ReactNode;
}

export default function MobilePopup({ onClose, children }: Props) {
  return (
    <div className="z-[9999] fixed w-full h-full bg-black-09 flex items-center justify-center translate-[unset] left-0 top-0">
      <div>{children}</div>
      <img
        src="/images/close_mobile_popup.png"
        alt="close"
        width={48}
        height={48}
        className="absolute bottom-[40px] left-1/2 -translate-x-1/2"
        onClick={() => {
          if (onClose) onClose();
        }}
      />
    </div>
  );
}
