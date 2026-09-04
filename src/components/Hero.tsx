import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Phone,
  Calculator,
  Sparkles,
  MapPin,
  CheckCircle,
  Building,
  Coins,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { BRAND_CONFIG, LOAN_PRODUCTS } from '../config';
import { api } from '../services/api';

interface HeroProps {
  onOpenApplyModal?: (loanType?: string) => void;
  onOpenEMICalculator?: () => void;
  onOpenAIAdvisor?: () => void;
  onNavigate?: (path: string) => void;
  preselectedLoan?: string;
}

// Realistic professional Indian financial & business imagery with local static assets and reliable fallbacks
const HERO_SCENES = [
  {
    title: 'Home & Property Finance',
    description: 'Empowering Indian families to own their dream homes with lower rates and doorstep assistance.',
    image: '/images/hero/home-loan.jpg',
    fallback: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80',
    tag: 'Home Loan & LAP',
  },
  {
    title: 'MSME & Working Capital',
    description: 'Fueling business growth with Overdraft, Cash Credit, and Machinery finance for Indian entrepreneurs.',
    image: '/images/hero/msme-business.jpg',
    fallback: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80',
    tag: 'Working Capital & OD/CC',
  },
  {
    title: 'Commercial & Industrial Real Estate',
    description: 'Funding office spaces, industrial sheds, and modern warehousing infrastructure.',
    image: '/images/hero/commercial-property.jpg',
    fallback: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    tag: 'Commercial Purchase',
  },
  {
    title: 'Dedicated Loan Consultation',
    description: 'End-to-end documentation support and transparent multi-bank appraisal with our loan specialists.',
    image: '/images/hero/loan-consultation.jpg',
    fallback: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80',
    tag: 'Pan-India Assistance',
  },
  {
    title: 'Fast & Transparent Appraisal',
    description: 'Streamlined file login, speedy KYC verification, and maximum loan eligibility sanction.',
    image: '/images/hero/finance-documents.jpg',
    fallback: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80',
    tag: `${BRAND_CONFIG.metrics.partnerNetwork} Bank Network`,
  },
];

export const Hero: React.FC<HeroProps> = ({
  onOpenApplyModal,
  onOpenEMICalculator,
  onOpenAIAdvisor,
  onNavigate,
  preselectedLoan,
}) => {
  // Hero Carousel State
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveSceneIndex((prev) => (prev + 1) % HERO_SCENES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleImageError = (index: number, fallbackUrl: string) => {
    setImageErrorMap((prev) => ({ ...prev, [index]: true }));
  };

  // Application Form State
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loanType, setLoanType] = useState(preselectedLoan || 'Working Capital (MSME)');
  const [requiredLoanAmount, setRequiredLoanAmount] = useState('');
  const [employmentType, setEmploymentType] = useState('Salaried');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'Phone Call' | 'WhatsApp' | 'Email'>('Phone Call');
  const [associateName, setAssociateName] = useState('');

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success?: boolean;
    applicationId?: string;
    message?: string;
    notifications?: { whatsapp: string; sms: string };
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (preselectedLoan) {
      setLoanType(preselectedLoan);
    }
  }, [preselectedLoan]);

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNumber.trim() || !loanType || !requiredLoanAmount) {
      setSubmissionResult({
        error: 'Please fill in all mandatory fields (Full Name, Mobile Number, Loan Type, and Loan Amount).',
      });
      return;
    }

    const numericAmount = parseFloat(requiredLoanAmount.replace(/,/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setSubmissionResult({
        error: 'Please enter a valid numeric loan amount.',
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    const res = await api.submitApplication({
      fullName,
      mobileNumber,
      email: email.trim() || undefined,
      loanType,
      requiredLoanAmount: numericAmount,
      employmentType,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      preferredContactMethod,
      associateName: associateName.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.error || !res.success) {
      setSubmissionResult({
        success: false,
        error: res.error || 'Submission failed.',
      });
    } else {
      setSubmissionResult({
        success: true,
        applicationId: res.applicationId,
        message: res.message || 'Application registered successfully.',
        notifications: res.notifications,
      });
      // Reset form
      setFullName('');
      setMobileNumber('');
      setEmail('');
      setRequiredLoanAmount('');
      setAssociateName('');
    }
  };

  return (
    <section className="relative w-full bg-[#F4F1EA] pt-6 pb-14 px-4 lg:px-8 border-b border-[#E5DFD3]">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* ================= LEFT COLUMN ================= */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FDFCF8] border border-[#C68B59]/40 text-[#2D332E] text-xs font-semibold self-start shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#C68B59]" />
            <span>{BRAND_CONFIG.metrics.partnerNetwork} Leading Bank & NBFC Partners</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.15]">
              <span className="text-[#2D332E] block">Smart Financial Solutions.</span>
              <span className="text-[#C68B59] block">Faster Loan Processing.</span>
            </h1>
            <p className="text-[#68716A] text-base sm:text-lg leading-relaxed pt-2 max-w-2xl">
              Flexible loan solutions for individuals, professionals and businesses with end-to-end documentation assistance, transparent processing and Pan-India loan assistance.
            </p>
          </div>

          {/* Automated Image Carousel with Real Indian Context */}
          <div
            className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border border-[#E5DFD3] shadow-sm bg-[#5D6D5F]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {HERO_SCENES.map((scene, idx) => {
              const currentSrc = imageErrorMap[idx] ? scene.fallback : scene.image;
              const isActive = idx === activeSceneIndex;

              return (
                <div
                  key={scene.title}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out motion-reduce:transition-none ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                  }`}
                  aria-hidden={!isActive}
                >
                  <img
                    src={currentSrc}
                    alt={scene.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover brightness-[0.85] contrast-[1.05]"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={() => handleImageError(idx, scene.fallback)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2D332E]/90 via-[#2D332E]/40 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white select-none">
                    <span className="text-[11px] font-bold tracking-wider text-[#C68B59] uppercase bg-[#2D332E]/85 backdrop-blur-xs px-2.5 py-1 rounded-md self-start mb-2 border border-[#C68B59]/30">
                      {scene.tag}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">{scene.title}</h3>
                    <p className="text-xs sm:text-sm text-[#ECE7DC]/90 mt-1 line-clamp-2">{scene.description}</p>
                  </div>
                </div>
              );
            })}

            {/* Carousel Indicators */}
            <div className="absolute bottom-3 right-4 flex items-center gap-1.5 z-10">
              {HERO_SCENES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSceneIndex(i)}
                  className={`h-1.5 rounded-full transition-all motion-reduce:transition-none cursor-pointer ${
                    i === activeSceneIndex ? 'w-6 bg-[#C68B59]' : 'w-2 bg-white/60 hover:bg-white'
                  }`}
                  aria-label={`View hero slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Business Statistics Grid with Dividers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 bg-[#FDFCF8] rounded-2xl p-4 sm:p-5 border border-[#E5DFD3] divide-y sm:divide-y-0 sm:divide-x divide-[#E5DFD3]/80 gap-3 sm:gap-0">
            <div className="px-3 py-1 flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold text-[#2D332E]">
                {BRAND_CONFIG.metrics.homeLoanStartingRate}
              </span>
              <span className="text-xs text-[#68716A] font-medium mt-0.5">Starting Rate (Home Loan)</span>
            </div>

            <div className="px-3 py-1 flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold text-[#2D332E]">
                {BRAND_CONFIG.metrics.partnerNetwork}
              </span>
              <span className="text-xs text-[#68716A] font-medium mt-0.5">Bank & NBFC Network</span>
            </div>

            <div className="px-3 py-1 flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold text-[#2D332E]">
                17
              </span>
              <span className="text-xs text-[#68716A] font-medium mt-0.5">Specialized Loan Products</span>
            </div>

            <div className="px-3 py-1 flex flex-col">
              <span className="text-xl sm:text-2xl font-extrabold text-[#C68B59]">
                {BRAND_CONFIG.metrics.transparentJourney}
              </span>
              <span className="text-xs text-[#68716A] font-medium mt-0.5">Transparent Loan Journey</span>
            </div>
          </div>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('apply-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else if (onOpenApplyModal) onOpenApplyModal();
              }}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#C68B59] hover:bg-[#AA7142] transition-all shadow-md flex items-center gap-2 active:scale-95"
              id="hero-primary-apply-cta"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenEMICalculator ? onOpenEMICalculator : () => onNavigate && onNavigate('/emi-calculator')}
              className="px-5 py-3 rounded-xl font-bold text-sm text-[#2D332E] bg-[#FDFCF8] border border-[#5D6D5F]/30 hover:bg-[#F4F1EA] transition-all shadow-2xs flex items-center gap-2"
              id="hero-emi-calculator-cta"
            >
              <Calculator className="w-4 h-4 text-[#5D6D5F]" />
              <span>EMI Calculator</span>
            </button>

            <button
              onClick={onOpenAIAdvisor ? onOpenAIAdvisor : () => onNavigate && onNavigate('/ai-advisor')}
              className="px-5 py-3 rounded-xl font-bold text-sm text-[#2D332E] bg-[#FDFCF8] border border-[#C68B59] hover:bg-[#F9EFE6] transition-all shadow-2xs flex items-center gap-2"
              id="hero-ai-advisor-cta"
            >
              <Sparkles className="w-4 h-4 text-[#C68B59]" />
              <span>AI Advisor</span>
            </button>
          </div>

          {/* Real Contact & Office Bar */}
          <div className="pt-3 border-t border-[#E5DFD3] flex flex-wrap items-center justify-between gap-4 text-xs text-[#68716A]">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#C68B59]" />
              <div>
                <span className="font-medium">Call Loan Officer: </span>
                <a
                  href={`tel:${BRAND_CONFIG.contact.phoneRaw}`}
                  className="font-bold text-[#2D332E] hover:underline"
                >
                  {BRAND_CONFIG.contact.phone}
                </a>
              </div>
            </div>

            <a
              href={BRAND_CONFIG.office.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#2D332E] hover:text-[#C68B59] transition-colors"
              title="Open Google Maps directions to Capitabee Thane Office"
            >
              <MapPin className="w-4 h-4 text-[#5D6D5F]" />
              <span className="font-semibold underline underline-offset-2">Thane Office (Directions)</span>
            </a>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: APPLICATION CARD ================= */}
        <div className="lg:col-span-5" id="apply-card">
          <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-7 shadow-lg border border-[#E5DFD3] relative">
            {/* Header of Card */}
            <div className="mb-5">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#5D6D5F] bg-[#EBF0EC] px-3 py-1 rounded-full border border-[#5D6D5F]/30 mb-2">
                FREE LOAN CONSULTATION
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2D332E] leading-snug">
                Get Loan Eligibility & Best Rate Options
              </h2>
              <p className="text-xs text-[#68716A] mt-1 leading-relaxed">
                Tell us what you need. Our loan team will review your requirement and contact you.
              </p>
            </div>

            {/* Application Submission Feedback */}
            {submissionResult && (
              <div
                className={`mb-5 p-4 rounded-2xl text-xs ${
                  submissionResult.success
                    ? 'bg-[#EBF0EC] border border-[#5D6D5F] text-[#2D332E]'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {submissionResult.success ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#5D6D5F]">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>Application Successfully Registered</span>
                    </div>
                    <div className="bg-[#FDFCF8] p-3 rounded-xl border border-[#5D6D5F]/30 font-mono text-xs font-bold text-[#2D332E]">
                      Application ID: <span className="text-[#C68B59] text-sm">{submissionResult.applicationId}</span>
                    </div>
                    <p className="text-xs text-[#68716A]">
                      Our loan officer at <strong>CAPITABEE FINANCIAL SERVICES</strong> will review your details and connect with you shortly.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Application Registration Failed</div>
                      <div className="mt-0.5 text-xs text-red-700">{submissionResult.error}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleApplicationSubmit} className="space-y-3.5">
              {/* Full Name */}
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
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] placeholder-[#8C968E] focus:outline-none focus:ring-2 focus:ring-[#C68B59] focus:border-transparent transition-all"
                  id="app-full-name"
                />
              </div>

              {/* Mobile Number & Email */}
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
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] placeholder-[#8C968E] focus:outline-none focus:ring-2 focus:ring-[#C68B59] focus:border-transparent transition-all"
                    id="app-mobile"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] placeholder-[#8C968E] focus:outline-none focus:ring-2 focus:ring-[#C68B59] focus:border-transparent transition-all"
                    id="app-email"
                  />
                </div>
              </div>

              {/* Loan Type (Working Capital First) */}
              <div>
                <label className="block text-xs font-bold text-[#2D332E] mb-1">
                  Loan Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:outline-none focus:ring-2 focus:ring-[#C68B59] focus:border-transparent transition-all font-medium"
                  id="app-loan-type"
                >
                  {LOAN_PRODUCTS.map((prod) => (
                    <option key={prod.id} value={prod.name}>
                      {prod.name} {prod.startingRate ? `(${prod.startingRate})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Required Loan Amount & Employment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">
                    Loan Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter loan amount in ₹"
                    value={requiredLoanAmount}
                    onChange={(e) => setRequiredLoanAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] placeholder-[#8C968E] focus:outline-none focus:ring-2 focus:ring-[#C68B59] focus:border-transparent transition-all font-medium"
                    id="app-amount"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:outline-none focus:ring-2 focus:ring-[#C68B59] focus:border-transparent transition-all"
                    id="app-employment"
                  >
                    <option value="Salaried">Salaried</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Business Owner">Business Owner</option>
                    <option value="Professional">Professional (CA, Doctor, Lawyer)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* City & State (Pan-India) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] placeholder-[#8C968E] focus:outline-none focus:ring-2 focus:ring-[#C68B59] focus:border-transparent transition-all"
                    id="app-city"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">State</label>
                  <input
                    type="text"
                    placeholder="Enter state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] placeholder-[#8C968E] focus:outline-none focus:ring-2 focus:ring-[#C68B59] focus:border-transparent transition-all"
                    id="app-state"
                  />
                </div>
              </div>

              {/* Preferred Contact Method & Referral */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">Preferred Contact</label>
                  <select
                    value={preferredContactMethod}
                    onChange={(e) => setPreferredContactMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:outline-none focus:ring-2 focus:ring-[#C68B59] focus:border-transparent transition-all"
                  >
                    <option value="Phone Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                  </select>
                </div>

                {/* Associate field */}
                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">
                    Associate / Referral Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Associate Name"
                    value={associateName}
                    onChange={(e) => setAssociateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] placeholder-[#8C968E] focus:outline-none focus:ring-2 focus:ring-[#C68B59] focus:border-transparent transition-all"
                    id="app-associate-name"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 rounded-xl text-sm font-extrabold text-white bg-[#C68B59] hover:bg-[#AA7142] disabled:bg-[#8C968E] transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                id="hero-form-submit-btn"
              >
                {isSubmitting ? (
                  <span>Processing Application...</span>
                ) : (
                  <>
                    <span>CHECK ELIGIBILITY & APPLY</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-[10px] text-[#8C968E] text-center mt-3">
              By applying, you authorize Capitabee Financial Services & its lending partners to contact you. Zero spam guarantee.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
