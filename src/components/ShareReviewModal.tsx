import React, { useState } from 'react';
import { Share2, X, Copy, Check, MessageSquare } from 'lucide-react';
import { BRAND_CONFIG } from '../config';

interface ShareReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareReviewModal: React.FC<ShareReviewModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/reviews/write` : 'https://capitabee.in/reviews/write';
  const shareMessage = `Rate your experience with CAPITABEE FINANCIAL SERVICES: ${shareUrl}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Review Capitabee Financial Services',
          text: 'Share your loan assistance experience with Capitabee Financial Services',
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFCF8] rounded-3xl w-full max-w-md border border-[#E5DFD3] shadow-2xl p-6 sm:p-7 overflow-hidden relative space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD3]">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#C68B59]" />
            <h3 className="font-extrabold text-lg text-[#2D332E]">Share Review Link</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#68716A] hover:text-[#2D332E] hover:bg-[#F4F1EA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#68716A] leading-relaxed">
          Share this direct link with customers so they can rate and review their experience with <strong>CAPITABEE FINANCIAL SERVICES</strong>.
        </p>

        {/* Shareable Link Box */}
        <div className="flex items-center gap-2 bg-[#F4F1EA] p-3 rounded-2xl border border-[#E5DFD3]">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="bg-transparent text-xs font-mono text-[#2D332E] flex-1 outline-none select-all"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-xl bg-[#5D6D5F] text-white text-xs font-bold hover:bg-[#4E5C50] transition-colors flex items-center gap-1 flex-shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#C68B59]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-3 rounded-xl bg-[#5D6D5F] text-white text-xs font-bold hover:bg-[#4E5C50] transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 px-3 rounded-xl bg-[#F4F1EA] border border-[#C68B59] text-[#2D332E] text-xs font-bold hover:bg-[#E5DFD3] transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4 text-[#C68B59]" />
            <span>Share More</span>
          </button>
        </div>
      </div>
    </div>
  );
};
