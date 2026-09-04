import React, { useState } from 'react';
import { LOAN_PRODUCTS, BRAND_CONFIG } from '../config';
import {
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Coins,
  Sparkles,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';

interface ServiceDetailPageProps {
  slug: string;
  onOpenAIAdvisor: () => void;
  onNavigateToAllServices: () => void;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({
  slug,
  onOpenAIAdvisor,
  onNavigateToAllServices,
}) => {
  const product =
    LOAN_PRODUCTS.find((p) => p.slug === slug) || LOAN_PRODUCTS[0]; // fallback to Working Capital

  // Form State
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [employmentType, setEmploymentType] = useState('Salaried');
  const [city, setCity] = useState('');
  const [associateName, setAssociateName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success?: boolean;
    applicationId?: string;
    message?: string;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNumber.trim() || !loanAmount) {
      setSubmissionResult({ error: 'Please enter Name, Mobile Number, and Loan Amount.' });
      return;
    }

    const numericAmount = parseFloat(loanAmount.replace(/,/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setSubmissionResult({ error: 'Please enter a valid numeric loan amount.' });
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    const res = await api.submitApplication({
      fullName,
      mobileNumber,
      email: email.trim() || undefined,
      loanType: product.name,
      requiredLoanAmount: numericAmount,
      employmentType,
      city: city.trim() || undefined,
      associateName: associateName.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.error) {
      setSubmissionResult({ error: res.error });
    } else {
      setSubmissionResult({
        success: true,
        applicationId: res.applicationId,
        message: 'Your application has been registered with our loan desk.',
      });
      setFullName('');
      setMobileNumber('');
      setEmail('');
      setLoanAmount('');
      setAssociateName('');
    }
  };

  const documentList = [
    ...(product.typicalDocuments?.common || []),
    ...(product.typicalDocuments?.salaried || []),
    ...(product.typicalDocuments?.selfEmployed || []),
  ];

  return (
    <div className="w-full bg-[#FDFCF8] py-12 sm:py-16 px-4 lg:px-8 space-y-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#68716A]">
          <button onClick={onNavigateToAllServices} className="hover:text-[#2D332E]">
            Services
          </button>
          <span>/</span>
          <span className="text-[#C68B59] font-bold">{product.name}</span>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F1EA] border border-[#C68B59]/30 text-[#C68B59] text-xs font-bold uppercase tracking-wider">
              <span>{product.category} Finance</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2D332E]">
              {product.name}
            </h1>

            <div className="bg-[#F4F1EA] p-4 rounded-2xl border border-[#E5DFD3] inline-flex items-center gap-3">
              <div>
                <span className="text-[11px] text-[#68716A] font-semibold block">Indicative Rate</span>
                <span className="text-xl font-extrabold text-[#C68B59]">
                  {product.startingRate || 'Competitive Multi-Bank Rates'}
                </span>
              </div>
              <span className="text-[10px] text-[#68716A] italic border-l border-[#E5DFD3] pl-3">
                Subject to lender credit policy and risk scoring.
              </span>
            </div>

            <p className="text-sm sm:text-base text-[#68716A] leading-relaxed">
              {product.description}
            </p>

            {/* Sub-products (e.g. for Working Capital) */}
            {product.subProducts && (
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-extrabold text-[#2D332E]">Available Facilities & Products:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.subProducts.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-xl bg-[#FDFCF8] border border-[#E5DFD3] text-xs font-semibold text-[#2D332E] flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#5D6D5F] flex-shrink-0" />
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-extrabold text-[#2D332E]">Key Highlights & Features:</h3>
              <div className="space-y-2">
                {product.keyHighlights.map((hl, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#2D332E]">
                    <CheckCircle2 className="w-4 h-4 text-[#C68B59] flex-shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents Checklist */}
            <div className="bg-[#FDFCF8] rounded-2xl p-6 border border-[#E5DFD3] space-y-3">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#2D332E]">
                <FileText className="w-4 h-4 text-[#C68B59]" />
                <span>Typical Document Requirements:</span>
              </div>
              <ul className="grid sm:grid-cols-2 gap-2 text-xs text-[#68716A]">
                {documentList.slice(0, 8).map((doc, dIdx) => (
                  <li key={dIdx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2D332E]"></span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Advisor Button */}
            <div className="pt-2">
              <button
                onClick={onOpenAIAdvisor}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#2D332E] bg-[#F4F1EA] border border-[#C68B59] hover:bg-[#E5DFD3] transition-all flex items-center gap-2 shadow-2xs"
              >
                <Sparkles className="w-4 h-4 text-[#C68B59]" />
                <span>Ask AI Advisor about {product.name} Requirements</span>
              </button>
            </div>
          </div>

          {/* Right Column: Direct Apply Card */}
          <div className="lg:col-span-5 bg-[#FDFCF8] rounded-3xl p-6 sm:p-7 border border-[#E5DFD3] shadow-lg space-y-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#5D6D5F] bg-[#EBF0EC] px-2.5 py-0.5 rounded-full">
                Direct Sourcing
              </span>
              <h3 className="text-xl font-extrabold text-[#2D332E] mt-2">
                Apply for {product.name}
              </h3>
              <p className="text-xs text-[#68716A] mt-1">
                Fill the details below. Our loan underwriting team will evaluate your file across our {BRAND_CONFIG.metrics.partnerNetwork} partner network.
              </p>
            </div>

            {submissionResult && (
              <div
                className={`p-4 rounded-2xl text-xs ${
                  submissionResult.success
                    ? 'bg-[#EBF0EC] border border-[#5D6D5F] text-[#2D332E]'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {submissionResult.success ? (
                  <div className="space-y-1.5">
                    <div className="font-bold text-sm text-[#5D6D5F] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Application Registered</span>
                    </div>
                    <div className="font-mono text-xs font-bold text-[#2D332E]">
                      App ID: <span className="text-[#C68B59]">{submissionResult.applicationId}</span>
                    </div>
                    <p className="text-[11px]">{submissionResult.message}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>{submissionResult.error}</span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2D332E] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
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
                    placeholder="Enter 10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">
                    Loan Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter loan amount in ₹"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
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
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="Enter city / location"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">Associate Name</label>
                  <input
                    type="text"
                    placeholder="Enter Associate Name"
                    value={associateName}
                    onChange={(e) => setAssociateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 rounded-xl text-xs font-extrabold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Submitting...' : `Apply for ${product.name}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center">
              <a
                href={`tel:${BRAND_CONFIG.contact.phoneRaw}`}
                className="text-xs text-[#2D332E] font-semibold hover:underline inline-flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#C68B59]" />
                <span>Call Loan Officer: +91 8010886625</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
