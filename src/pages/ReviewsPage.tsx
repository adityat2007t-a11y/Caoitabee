import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquarePlus,
  Share2,
  Quote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { ReviewRecord } from '../types';
import { api } from '../services/api';
import { BRAND_CONFIG, LOAN_PRODUCTS } from '../config';

interface ReviewsPageProps {
  onOpenWriteModal: () => void;
  onOpenShareModal: () => void;
  isWriteView?: boolean;
}

export const ReviewsPage: React.FC<ReviewsPageProps> = ({
  onOpenWriteModal,
  onOpenShareModal,
  isWriteView,
}) => {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for direct write view
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [loanType, setLoanType] = useState('Home Loan');
  const [city, setCity] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.getApprovedReviews().then((data) => {
      if (isMounted) {
        setReviews(data);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !reviewText.trim() || !loanType) {
      setResult({ error: 'Please enter Name, Loan Type, and Review comments.' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    const res = await api.submitReview({
      customerName,
      rating,
      loanType,
      city: city.trim() || undefined,
      reviewText,
    });

    setIsSubmitting(false);

    if (res.error) {
      setResult({ error: res.error });
    } else {
      setResult({
        success: true,
        message:
          'Thank you for submitting your review! It has been recorded in PENDING status and will appear once approved by Capitabee moderation.',
      });
      setCustomerName('');
      setCity('');
      setReviewText('');
    }
  };

  return (
    <div className="w-full bg-[#FDFCF8] py-12 sm:py-16 px-4 lg:px-8 space-y-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4F1EA] border border-[#C68B59]/30 text-[#C68B59] text-xs font-bold uppercase tracking-wider">
            <Star className="w-4 h-4 fill-[#C68B59]" />
            <span>Customer Experiences</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2D332E]">
            {BRAND_CONFIG.metrics.happyCustomers} Happy Customers
          </h1>
          <p className="text-base text-[#68716A] leading-relaxed">
            Customers across India trust Capitabee Financial Services for their loan assistance and financing requirements.
          </p>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={onOpenWriteModal}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-colors flex items-center gap-2 shadow-xs"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Write a Review</span>
            </button>

            <button
              onClick={onOpenShareModal}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#2D332E] bg-[#F4F1EA] border border-[#2D332E]/30 hover:bg-[#E5DFD3] transition-colors flex items-center gap-2"
            >
              <Share2 className="w-4 h-4 text-[#C68B59]" />
              <span>Share Review Link</span>
            </button>
          </div>
        </div>

        {/* Direct Write View Form (if user navigated to /reviews/write) */}
        {isWriteView && (
          <div className="max-w-2xl mx-auto bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 border border-[#C68B59] shadow-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD3]">
              <h2 className="text-lg font-extrabold text-[#2D332E] flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-[#C68B59]" />
                <span>Submit Your Loan Experience</span>
              </h2>
              <span className="text-[11px] font-bold text-[#5D6D5F] bg-[#EBF0EC] px-2.5 py-0.5 rounded-full">
                Moderated Quality
              </span>
            </div>

            {result && (
              <div
                className={`p-4 rounded-2xl text-xs ${
                  result.success
                    ? 'bg-[#EBF0EC] border border-[#5D6D5F] text-[#2D332E]'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle2 className="w-5 h-5 text-[#5D6D5F] flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block text-sm">
                      {result.success ? 'Review Successfully Received' : 'Submission Error'}
                    </span>
                    <p className="mt-0.5 leading-relaxed">{result.message || result.error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D332E] mb-1">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating ? 'text-[#C68B59] fill-[#C68B59]' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#2D332E] ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D332E] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Kulkarni"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">
                    Loan Availed <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                  >
                    {LOAN_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Thane, Pune"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D332E] mb-1">
                  Review Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details about the rate offered, documentation support, loan turnaround time..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-extrabold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Submitting Review...' : 'Submit Review for Quality Verification'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#FDFCF8] rounded-2xl p-6 border border-[#E5DFD3] shadow-xs flex flex-col justify-between space-y-4 relative"
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
                  <p className="text-xs sm:text-sm text-[#2D332E] italic leading-relaxed">
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
          <div className="bg-[#FDFCF8] rounded-3xl p-8 border border-[#E5DFD3] text-center max-w-xl mx-auto space-y-3">
            <ShieldCheck className="w-10 h-10 text-[#C68B59] mx-auto" />
            <h3 className="text-base font-extrabold text-[#2D332E]">Customer Testimonials Moderation</h3>
            <p className="text-xs text-[#68716A] leading-relaxed">
              We strictly publish authentic client feedback verified by our loan desk. Click "Write a Review" above to submit your rating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
