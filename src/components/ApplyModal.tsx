import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Phone } from 'lucide-react';
import { LOAN_PRODUCTS, BRAND_CONFIG } from '../config';
import { api } from '../services/api';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLoanType?: string;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  isOpen,
  onClose,
  initialLoanType,
}) => {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loanType, setLoanType] = useState(initialLoanType || 'Working Capital (MSME)');
  const [requiredLoanAmount, setRequiredLoanAmount] = useState('');
  const [employmentType, setEmploymentType] = useState('Salaried');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [associateName, setAssociateName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; applicationId?: string; error?: string } | null>(null);

  useEffect(() => {
    if (initialLoanType) {
      setLoanType(initialLoanType);
    }
  }, [initialLoanType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNumber.trim() || !requiredLoanAmount) {
      setResult({ error: 'Please provide Name, Mobile Number, and Loan Amount.' });
      return;
    }

    const numericAmount = parseFloat(requiredLoanAmount.replace(/,/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setResult({ error: 'Please enter a valid numeric loan amount.' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    const res = await api.submitApplication({
      fullName,
      mobileNumber,
      email: email.trim() || undefined,
      loanType,
      requiredLoanAmount: numericAmount,
      employmentType,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      associateName: associateName.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.error) {
      setResult({ error: res.error });
    } else {
      setResult({
        success: true,
        applicationId: res.applicationId,
      });
      setFullName('');
      setMobileNumber('');
      setEmail('');
      setRequiredLoanAmount('');
      setAssociateName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFCF8] rounded-3xl w-full max-w-lg border border-[#E5DFD3] shadow-2xl p-6 sm:p-7 overflow-y-auto max-h-[90vh] relative space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD3]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5D6D5F] bg-[#EBF0EC] px-2 py-0.5 rounded">
              Pan-India Loan Assistance
            </span>
            <h3 className="font-extrabold text-lg text-[#2D332E] mt-1">
              Apply for Loan Assistance
            </h3>
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
            className={`p-4 rounded-2xl text-xs ${
              result.success
                ? 'bg-[#EBF0EC] border border-[#5D6D5F] text-[#2D332E]'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {result.success ? (
              <div className="space-y-1.5">
                <div className="font-bold text-sm text-[#5D6D5F] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Application Successfully Registered</span>
                </div>
                <div className="font-mono font-bold text-xs">
                  Application ID: <span className="text-[#C68B59] text-sm">{result.applicationId}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Our loan underwriting desk at <strong>CAPITABEE FINANCIAL SERVICES</strong> will review your details and contact you shortly.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{result.error}</span>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#2D332E] mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2D332E] mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="10-digit mobile"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D332E] mb-1">Email</label>
              <input
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D332E] mb-1">
              Loan Product <span className="text-red-500">*</span>
            </label>
            <select
              value={loanType}
              onChange={(e) => setLoanType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none font-medium"
            >
              {LOAN_PRODUCTS.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} {p.startingRate ? `(${p.startingRate})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2D332E] mb-1">
                Loan Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 50,00,000"
                value={requiredLoanAmount}
                onChange={(e) => setRequiredLoanAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D332E] mb-1">Employment</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
              >
                <option value="Salaried">Salaried</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Business Owner">Business Owner</option>
                <option value="Professional">Professional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2D332E] mb-1">City</label>
              <input
                type="text"
                placeholder="e.g. Thane, Mumbai"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D332E] mb-1">
                Associate / Referral Name
              </label>
              <input
                type="text"
                placeholder="Enter Associate Name"
                value={associateName}
                onChange={(e) => setAssociateName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#68716A] hover:bg-[#F4F1EA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
