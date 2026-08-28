import React from 'react';
import { MessageCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../config';

export const FloatingWhatsApp: React.FC = () => {
  return (
    <a
      href={BRAND_CONFIG.contact.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#5D6D5F] text-white shadow-xl hover:bg-[#4E5C50] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center border-2 border-[#FDFCF8] group"
      aria-label="Chat on WhatsApp with Capitabee Financial Services loan officer"
      id="floating-whatsapp-button"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="sr-only">Chat on WhatsApp with Capitabee Financial Services</span>

      {/* Tooltip on desktop hover */}
      <span className="hidden md:group-hover:flex absolute right-16 bg-[#2D332E] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-md whitespace-nowrap items-center gap-1.5 border border-[#4E5C50] pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#C68B59] animate-ping"></span>
        Chat on WhatsApp
      </span>
    </a>
  );
};
