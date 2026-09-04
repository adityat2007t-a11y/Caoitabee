import React from 'react';
import { Hero } from '../components/Hero';
import { TrustStrip } from '../components/TrustStrip';
import { HappyCustomersSection } from '../components/HappyCustomersSection';
import { ServicesSection } from '../components/ServicesSection';
import { PartnerNetworkSection } from '../components/PartnerNetworkSection';
import { WhyCapitabeeSection } from '../components/WhyCapitabeeSection';
import { TwelveStageJourneySection } from '../components/TwelveStageJourneySection';
import { EMICalculatorSection } from '../components/EMICalculatorSection';
import { BRAND_CONFIG, LOAN_PRODUCTS } from '../config';
import { HelpCircle, ChevronDown, Phone, Mail, ArrowRight } from 'lucide-react';

interface HomePageProps {
  onOpenApplyModal: (loanType?: string) => void;
  onOpenEMICalculator: () => void;
  onOpenAIAdvisor: () => void;
  onOpenWriteReview: () => void;
  onOpenShareModal: () => void;
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenApplyModal,
  onOpenEMICalculator,
  onOpenAIAdvisor,
  onOpenWriteReview,
  onOpenShareModal,
  onNavigate,
}) => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  const faqs = [
    {
      q: 'What loan products does Capitabee Financial Services assist with?',
      a: 'We provide structured assistance for 17 loan products including Working Capital (OD, CC, Bill Discounting, PCFC, Bank Guarantee, Channel Financing), Home Loans, Loan Against Property (LAP), Unsecured Business Loans, Commercial & Industrial Purchase, Machinery Loans, Construction Finance, Loan Against Shares, and Gold Loans.',
    },
    {
      q: 'How does Capitabee compare multiple bank options?',
      a: `We evaluate your profile, financial statements, and property paperwork across our network of ${BRAND_CONFIG.metrics.partnerNetwork} partner banks and NBFCs to identify the best eligible sanction limits, lower interest rates, and minimal processing charges.`,
    },
    {
      q: 'What is the starting interest rate for Home Loans?',
      a: 'Home Loan interest rates start from 7.20% p.a., subject to lender policy, CIBIL score, applicant profile, and property legal clearance.',
    },
    {
      q: 'How does the 12-Stage Loan Journey work?',
      a: 'Our transparent 12-stage journey takes you systematically through Inquiry, Application, Documentation, Bank Login, Credit Assessment, In-Principle Sanction, Legal Title Vetting, Technical Valuation, Final Sanction, OTC Compliance, Disbursement, and PDD verification.',
    },
    {
      q: 'Where is Capitabee Financial Services located?',
      a: 'Our registered office is at 101, Ganesh Tower, Dada Patil Wadi, Thane (W), Maharashtra - 400602. We provide Pan-India Loan Assistance across all major states.',
    },
  ];

  return (
    <div className="w-full flex flex-col">
      {/* 1. HERO SECTION */}
      <Hero
        onOpenApplyModal={onOpenApplyModal}
        onOpenEMICalculator={onOpenEMICalculator}
        onOpenAIAdvisor={onOpenAIAdvisor}
        onNavigate={onNavigate}
      />

      {/* 2. TRUST NUMBERS STRIP */}
      <TrustStrip />

      {/* 3. CUSTOMER EXPERIENCES & REVIEWS SECTION */}
      <HappyCustomersSection
        onOpenWriteReview={onOpenWriteReview}
        onOpenShareModal={onOpenShareModal}
        onNavigate={onNavigate}
      />

      {/* 4. SERVICES SECTION (17 products with Working Capital FIRST) */}
      <ServicesSection
        onSelectLoanForApply={(loanName) => {
          onOpenApplyModal(loanName);
          const el = document.getElementById('apply-card');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onNavigateToService={(slug) => onNavigate(`/services/${slug}`)}
      />

      {/* 5. PARTNER NETWORK SECTION */}
      <PartnerNetworkSection onNavigateToApply={() => onOpenApplyModal()} />

      {/* 6. WHY CAPITABEE SECTION */}
      <WhyCapitabeeSection onNavigateToApply={() => onOpenApplyModal()} />

      {/* 7. 12-STAGE TRANSPARENT LOAN JOURNEY */}
      <TwelveStageJourneySection onNavigateToApply={() => onOpenApplyModal()} />

      {/* 8. EMI CALCULATOR SECTION */}
      <EMICalculatorSection onNavigateToApply={(l) => onOpenApplyModal(l)} />

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section className="w-full bg-[#FDFCF8] py-16 px-4 lg:px-8 border-b border-[#E5DFD3]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#C68B59]">
              Clear Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D332E]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#F4F1EA]/60 rounded-2xl border border-[#E5DFD3] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left font-bold text-sm text-[#2D332E] flex items-center justify-between gap-4 hover:bg-[#F4F1EA] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#C68B59] flex-shrink-0 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-[#68716A] leading-relaxed border-t border-[#E5DFD3] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Contact Box */}
          <div className="bg-[#F4F1EA] rounded-2xl p-6 border border-[#E5DFD3] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h4 className="font-extrabold text-sm text-[#2D332E]">Have a specific loan query?</h4>
              <p className="text-xs text-[#68716A] mt-0.5">
                Our loan officers at Capitabee Financial Services are ready to guide you.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${BRAND_CONFIG.contact.phoneRaw}`}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#5D6D5F] hover:bg-[#4E5C50] transition-colors"
              >
                Call +91 8010886625
              </a>
              <button
                onClick={onOpenAIAdvisor}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-colors"
              >
                Ask AI Advisor
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
