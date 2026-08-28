import React from 'react';
import {
  Globe2,
  ShieldCheck,
  Layers,
  CheckCircle2,
  FileCheck2,
  Headphones,
  Building2,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config';

interface WhyCapitabeeProps {
  onNavigateToApply?: () => void;
}

export const WhyCapitabeeSection: React.FC<WhyCapitabeeProps> = ({ onNavigateToApply }) => {
  const pillars = [
    {
      icon: Globe2,
      title: 'Pan-India Loan Assistance',
      description: 'Lending assistance across major metropolitan hubs, industrial belts, and Tier-2/3 cities throughout India.',
      tag: 'National Reach',
    },
    {
      icon: ShieldCheck,
      title: `${BRAND_CONFIG.metrics.partnerNetwork} Leading Bank & NBFC Partners`,
      description: 'Wide network of public, private, and housing finance institutions ensuring competitive rates and flexible terms.',
      tag: 'Multi-Lender Network',
    },
    {
      icon: Layers,
      title: 'Multiple Loan Solutions',
      description: '17 specialized products covering Working Capital, Home Loan, LAP, Commercial Real Estate, and Gold Loans.',
      tag: 'Comprehensive Products',
    },
    {
      icon: CheckCircle2,
      title: 'Transparent 12-Stage Journey',
      description: 'Structured step-by-step processing from initial inquiry to final disbursement with zero hidden steps.',
      tag: 'Clear Timeline',
    },
    {
      icon: FileCheck2,
      title: 'Documentation Assistance',
      description: 'End-to-end guidance with KYC, income proofs, property chain documents, and legal/technical diligence.',
      tag: 'Doorstep Coordination',
    },
    {
      icon: Headphones,
      title: 'Dedicated Loan Support',
      description: 'Assigned loan associates to assist your application, clarify queries, and liaise with bank credit officers.',
      tag: 'Personal Advisory',
    },
    {
      icon: Building2,
      title: 'Business & Property Funding',
      description: 'High-ticket specialized credit for MSME expansion, commercial shops, industrial plots, and warehouses.',
      tag: 'MSME & Commercial',
    },
    {
      icon: Smartphone,
      title: 'Digital Application Tracking',
      description: 'Real-time stage updates, document upload requests, and status notifications for registered applicants.',
      tag: 'Secure & Structured',
    },
  ];

  return (
    <section className="w-full bg-[#FDFCF8] py-16 px-4 lg:px-8 border-b border-[#E5DFD3]" id="why-capitabee">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-[#C68B59] bg-[#F4F1EA] px-3.5 py-1 rounded-full border border-[#C68B59]/30">
            Our Key Advantages
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D332E]">
            Why Choose Capitabee Financial Services?
          </h2>
          <p className="text-sm sm:text-base text-[#68716A] leading-relaxed">
            We simplify complex loan underwriting by connecting borrowers with the right lending institutions, structuring the documentation, and accelerating disbursement.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-[#F4F1EA]/60 rounded-2xl p-6 border border-[#E5DFD3] hover:border-[#C68B59] hover:bg-[#F4F1EA] hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#FDFCF8] border border-[#E5DFD3] flex items-center justify-center text-[#2D332E]">
                      <Icon className="w-6 h-6 text-[#C68B59]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#5D6D5F] bg-[#EBF0EC] px-2 py-0.5 rounded border border-[#5D6D5F]/30">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#2D332E] leading-snug">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-[#68716A] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
