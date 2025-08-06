import React, { useState } from 'react';
import ModalCreditCard from './ModalCreditCard';

// Example usage of ModalCreditCard component
const ModalCreditCardExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (data: {
    card_number: string;
    card_name: string;
    card_cvv: string;
    card_expiration_month: string | number;
    card_expiration_year: string | number;
  }) => {
    console.log('Credit card data submitted:', data);
    // Here you would typically send the data to your payment API
    // Example: await processPayment(data);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <button
        onClick={handleOpenModal}
        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        Open Credit Card Payment Modal
      </button>

      <ModalCreditCard
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default ModalCreditCardExample;
