import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppFloatingButtonProps {
  currentPage: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({ currentPage }) => {
  const getContextualData = () => {
    switch (currentPage) {
      case 'conference':
        return {
          label: 'Ask about the conference',
          message: 'Hello SheBlooms, I would like to inquire about The SheBlooms Conference 2026 in Abuja.'
        };
      case 'events':
        return {
          label: 'Ask about an event',
          message: 'Hello SheBlooms, I would like to ask a question about your upcoming events.'
        };
      case 'join':
        return {
          label: 'Ask about membership',
          message: 'Hello SheBlooms, I would like to know more about joining the SheBlooms community.'
        };
      case 'books':
        return {
          label: 'Ask about the book circle',
          message: 'Hello SheBlooms, I would like to ask about the monthly reading circle.'
        };
      default:
        return {
          label: 'Chat on WhatsApp',
          message: 'Hello SheBlooms, I am visiting the website and would love to connect with your team.'
        };
    }
  };

  const { label, message } = getContextualData();

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/2348092345667?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 print:hidden">
      <button
        onClick={handleOpenWhatsApp}
        className="group flex items-center space-x-2 bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] p-3 sm:px-4 sm:py-2.5 rounded-sm shadow-lg border border-[#E8A6B2]/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89A61]"
        aria-label={label}
        title={label}
      >
        <MessageCircle className="w-5 h-5 text-[#25D366] shrink-0 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </button>
    </div>
  );
};
