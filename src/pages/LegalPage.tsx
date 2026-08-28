import React from 'react';
import { ShieldCheck, FileText, Lock, AlertCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../config';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'disclaimer' | 'cookie';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const getTitle = () => {
    switch (type) {
      case 'privacy':
        return 'Privacy Policy';
      case 'terms':
        return 'Terms & Conditions';
      case 'disclaimer':
        return 'Financial & Legal Disclaimer';
      case 'cookie':
        return 'Cookie Policy';
    }
  };

  return (
    <div className="w-full bg-[#FDFCF8] py-12 sm:py-16 px-4 lg:px-8 space-y-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C68B59]">
            Official Compliance
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D332E]">{getTitle()}</h1>
          <p className="text-xs text-[#68716A]">
            Last updated: {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} • {BRAND_CONFIG.name}
          </p>
        </div>

        <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-10 border border-[#E5DFD3] shadow-xs text-xs sm:text-sm text-[#68716A] leading-relaxed space-y-6">
          {type === 'privacy' && (
            <>
              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#2D332E]">1. Introduction & Data Controller</h3>
                <p>
                  <strong>{BRAND_CONFIG.name}</strong> ("we", "us", "our") is dedicated to safeguarding the personal and financial information of our applicants, borrowers, and partners. This Privacy Policy details how we collect, store, process, and transmit your data when you submit loan inquiries or utilize our platform.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#2D332E]">2. Information We Collect</h3>
                <p>
                  When you submit loan applications or request eligibility assessments, we collect personal information including your full name, contact numbers, email address, residential address, income proof (salary slips, bank statements, ITR), and property collateral paperwork.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#2D332E]">3. Purpose of Processing</h3>
                <p>
                  Your information is utilized solely for assessing credit eligibility, processing multi-bank loan file logins across our {BRAND_CONFIG.metrics.partnerNetwork} partner institutions, coordinating legal/technical property evaluations, and providing application stage updates.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#2D332E]">4. Data Protection & Zero Spam</h3>
                <p>
                  We implement robust technical encryption to safeguard your uploaded documents. We do not sell or rent customer contact data to unauthorized third-party marketing entities.
                </p>
              </section>
            </>
          )}

          {type === 'terms' && (
            <>
              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#2D332E]">1. Scope of Services</h3>
                <p>
                  <strong>{BRAND_CONFIG.name}</strong> operates as a loan advisory and facilitation partner connecting prospective borrowers with licensed commercial banks, housing finance companies, and NBFCs across India.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#2D332E]">2. Lender Discretion & Terms</h3>
                <p>
                  {BRAND_CONFIG.financialDisclaimer} Final sanction limits, processing fees, interest rates, and loan tenure remain at the exclusive discretion of the respective lending institution.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#2D332E]">3. Accuracy of Information</h3>
                <p>
                  Applicants warrant that all financial, identity, and property documents provided are genuine and accurate. Submission of falsified records may lead to immediate rejection by partner banks.
                </p>
              </section>
            </>
          )}

          {type === 'disclaimer' && (
            <>
              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#2D332E]">1. Financial Disclaimer</h3>
                <p>
                  {BRAND_CONFIG.financialDisclaimer}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#2D332E]">2. Interest Rates & Eligibility</h3>
                <p>
                  {BRAND_CONFIG.rateDisclaimer}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#2D332E]">3. No Guaranteed Sanction</h3>
                <p>
                  Capitabee Financial Services assists in file structuring, document compilation, and institution placement; however, loan approval is subject to statutory verification, credit bureau scoring (CIBIL/Experian), and underwriting policies of partner lenders.
                </p>
              </section>
            </>
          )}

          {type === 'cookie' && (
            <>
              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#2D332E]">1. Use of Cookies</h3>
                <p>
                  Our website uses standard essential cookies to remember your session preferences, maintain customer portal logins, and evaluate site performance.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-base font-bold text-[#2D332E]">2. Managing Preferences</h3>
                <p>
                  You may configure your browser settings to restrict or block cookies; however, certain portal functions such as document uploads may experience limitations.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
