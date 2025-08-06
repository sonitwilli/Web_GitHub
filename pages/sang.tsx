// pages/test-modal.tsx
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import ModalWrapper (nếu bạn đã config nó như dynamic)
const ModalWrapper = dynamic(
  () => import('@/lib/components/modal/ModalWrapper'),
  {
    ssr: false,
  },
);

export default function TestModalPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
      >
        Mở Modal
      </button>

      <ModalWrapper
        open={isOpen}
        onHidden={() => setIsOpen(false)}
        contentClassName="w-[400px] bg-white rounded-lg p-6 shadow-lg"
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        shouldCloseOnOverlayClick={true}
      >
        <h2 className="text-xl font-bold mb-4">Test Modal</h2>
        <p className="mb-4 text-gray-700">Đây là nội dung bên trong modal.</p>
        <button
          onClick={() => setIsOpen(false)}
          className="mt-2 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
        >
          Đóng
        </button>
      </ModalWrapper>
    </div>
  );
}
