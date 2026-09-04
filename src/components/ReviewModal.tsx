import React, { useState, useEffect } from 'react';
import { Star, X, CheckCircle2, AlertCircle, MessageSquarePlus, ArrowRight } from 'lucide-react';
import { LOAN_PRODUCTS } from '../config';
import { api } from '../services/api';
import { authService } from '../services/auth';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [loanType, setLoanType] = useState('Home Loan');
  const [city, setCity] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      if (user.fullName) setCustomerName(user.fullName);
      if (user.loanType) setLoanType(user.loanType);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !reviewText.trim() || !loanType) {
      setResult({ error: 'Please enter your Name, Loan Type, and Review comments.' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    const user = authService.getCurrentUser();

    const res = await api.submitReview({
      customerName: customerName.trim(),
      rating,
      loanType,
      city: city.trim() || undefined,
      reviewText: reviewText.trim(),
      customerId: user?.customerId || undefined,
      applicationId: user?.applicationId || undefined,
    } as any);

    setIsSubmitting(false);

    if (res.error) {
      setResult({ error: res.error });
    } else {
      setResult({
        success: true,
        message:
          'Thank you for submitting your feedback! Your review is in PENDING status and will appear publicly once verified by our quality desk.',
      });
      if (!user) setCustomerName('');
      setCity('');
      setReviewText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFCF8] rounded-3xl w-full max-w-lg border border-[#E5DFD3] shadow-2xl p-6 sm:p-7 overflow-hidden relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD3]">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-[#C68B59]" />
            <h3 className="font-extrabold text-lg text-[#2D332E]">Write a Customer Review</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#68716A] hover:text-[#2D332E] hover:bg-[#F4F1EA] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {result && (
          <div
            className={`mt-4 p-4 rounded-2xl text-xs ${
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
              <div className="space-y-1">
                <span className="font-bold text-sm block">
                  {result.success ? 'Review Submitted Successfully' : 'Submission Failed'}
                </span>
                <p className="leading-relaxed">{result.message || result.error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold text-[#2D332E] mb-1.5">
              Your Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform active:scale-95"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-[#C68B59] fill-[#C68B59]' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-[#2D332E] ml-2">{rating} out of 5</span>
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-[#2D332E] mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Enter full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
            />
          </div>

          {/* Loan Type & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2D332E] mb-1">
                Loan Availed <span className="text-red-500">*</span>
              </label>
              <select
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none font-medium"
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
                placeholder="Enter city / location"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
              />
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-bold text-[#2D332E] mb-1">
              Your Review / Experience <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Tell other applicants about your experience with Capitabee Financial Services..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none leading-relaxed"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#68716A] hover:bg-[#F4F1EA] transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit for Moderation'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
