import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, Share2, Quote, ArrowRight, CheckCircle2 } from 'lucide-react';
import { BRAND_CONFIG } from '../config';
import { ReviewRecord } from '../types';
import { api } from '../services/api';
import { supabaseService } from '../services/supabaseService';

interface HappyCustomersProps {
  onOpenWriteReview?: () => void;
  onOpenShareModal?: () => void;
  onNavigate?: (path: string) => void;
}

export const HappyCustomersSection: React.FC<HappyCustomersProps> = ({
  onOpenWriteReview,
  onOpenShareModal,
  onNavigate,
}) => {
  const [approvedReviews, setApprovedReviews] = useState<ReviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = () => {
    api.getApprovedReviews().then((reviews) => {
      setApprovedReviews(reviews);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchReviews();

    // Setup Realtime Sync for Approved Reviews from Supabase
    const unsubscribe = supabaseService.subscribeToReviews((payload) => {
      console.log('[Reviews Realtime Sync] Updated reviews payload:', payload);
      fetchReviews();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <section className="w-full bg-[#FDFCF8] py-12 sm:py-16 px-4 lg:px-8 border-b border-[#E5DFD3]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5DFD3] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4F1EA] border border-[#C68B59]/30 text-[#C68B59] text-xs font-bold uppercase tracking-wider mb-2">
              <Star className="w-3.5 h-3.5 fill-[#C68B59]" />
              <span>Pan-India Client Trust</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2D332E]">
              Customer Reviews & Experiences
            </h2>
            <p className="text-sm sm:text-base text-[#68716A] mt-1 max-w-2xl">
              Customers across India trust Capitabee Financial Services for their loan assistance and financing requirements.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenWriteReview ? onOpenWriteReview : () => onNavigate && onNavigate('/reviews/write')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#2D332E] bg-[#F4F1EA] border border-[#2D332E]/30 hover:bg-[#EAE4D8] transition-all flex items-center gap-2 shadow-2xs"
              id="happy-cust-write-review-btn"
            >
              <MessageSquarePlus className="w-4 h-4 text-[#C68B59]" />
              <span>Write a Review</span>
            </button>

            <button
              onClick={onOpenShareModal ? onOpenShareModal : () => onNavigate && onNavigate('/reviews')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#FFFFFF] bg-[#5D6D5F] hover:bg-[#4E5C50] transition-all flex items-center gap-2 shadow-2xs"
              id="happy-cust-share-btn"
            >
              <Share2 className="w-4 h-4 text-[#FDFCF8]" />
              <span>Share Experience</span>
            </button>
          </div>
        </div>

        {/* Customer Trust Cards / Approved Reviews */}
        {approvedReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {approvedReviews.slice(0, 3).map((review) => (
              <div
                key={review.id}
                className="bg-[#F4F1EA]/60 rounded-2xl p-6 border border-[#E5DFD3] shadow-xs flex flex-col justify-between space-y-4 relative"
              >
                <Quote className="w-8 h-8 text-[#C68B59]/20 absolute top-4 right-4" />
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-[#C68B59] fill-[#C68B59]' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[#2D332E] italic leading-relaxed">
                    "{review.reviewText}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E5DFD3] flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#2D332E]">{review.customerName}</h4>
                    <span className="text-[11px] text-[#68716A] font-medium">
                      {review.loanType} {review.city ? `• ${review.city}` : ''}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#5D6D5F] font-bold bg-[#EBF0EC] px-2 py-0.5 rounded-md border border-[#5D6D5F]/30">
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Clean verified trust cards when awaiting moderation */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F4F1EA]/60 rounded-2xl p-6 border border-[#E5DFD3] shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-2 text-[#5D6D5F]">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-sm text-[#2D332E]">Transparent Multi-Bank Sourcing</span>
              </div>
              <p className="text-xs text-[#68716A] leading-relaxed">
                Direct evaluation across {BRAND_CONFIG.metrics.partnerNetwork} partner banks and NBFCs ensures optimal interest rate options and customized loan structuring.
              </p>
              <div className="text-[11px] font-semibold text-[#C68B59]">Home Loan, LAP & MSME</div>
            </div>

            <div className="bg-[#F4F1EA]/60 rounded-2xl p-6 border border-[#E5DFD3] shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-2 text-[#5D6D5F]">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-sm text-[#2D332E]">End-to-End Documentation Support</span>
              </div>
              <p className="text-xs text-[#68716A] leading-relaxed">
                Dedicated loan processing managers handle property legal vetting, technical valuation coordination, and banker logins.
              </p>
              <div className="text-[11px] font-semibold text-[#C68B59]">Doorstep File Pickup & Verification</div>
            </div>

            <div className="bg-[#F4F1EA]/60 rounded-2xl p-6 border border-[#E5DFD3] shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-2 text-[#5D6D5F]">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold text-sm text-[#2D332E]">Pan-India Processing Network</span>
              </div>
              <p className="text-xs text-[#68716A] leading-relaxed">
                Seamless loan assistance across major industrial hubs, metropolitan areas, and Tier-2/3 cities throughout India.
              </p>
              <div className="text-[11px] font-semibold text-[#C68B59]">National Lending Coverage</div>
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate && onNavigate('/reviews')}
            className="text-xs font-bold text-[#2D332E] hover:text-[#C68B59] inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Explore all customer experiences & reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};
