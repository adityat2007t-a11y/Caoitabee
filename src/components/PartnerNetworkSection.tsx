import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { PARTNER_NETWORK, BRAND_CONFIG } from '../config';
import { PartnerLogo } from './PartnerLogo';

interface PartnerNetworkProps {
  onNavigateToApply?: () => void;
}

export const PartnerNetworkSection: React.FC<PartnerNetworkProps> = ({ onNavigateToApply }) => {
  const [filter, setFilter] = useState<'All' | 'Bank' | 'NBFC'>('All');

  const banks = PARTNER_NETWORK.filter((p) => p.type === 'Bank');
  const nbfcs = PARTNER_NETWORK.filter((p) => p.type === 'NBFC');

  const displayList =
    filter === 'All' ? PARTNER_NETWORK : PARTNER_NETWORK.filter((p) => p.type === filter);

  return (
    <section className="w-full bg-[#FDFCF8] py-16 px-4 lg:px-8 border-b border-[#E5DFD3]" id="partners">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4F1EA] border border-[#C68B59]/30 text-[#C68B59] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C68B59]" />
            <span>National Lending Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D332E]">
            {PARTNER_NETWORK.length}+ Leading Bank & NBFC Partners
          </h2>
          <p className="text-sm sm:text-base text-[#68716A] leading-relaxed">
            We collaborate across premier public and private sector banks, housing finance corporations, and specialized NBFCs to ensure your loan file receives the most competitive interest rates and terms.
          </p>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2 pt-3">
            <button
              onClick={() => setFilter('All')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === 'All'
                  ? 'bg-[#5D6D5F] text-white shadow-xs'
                  : 'bg-[#F4F1EA] text-[#2D332E] border border-[#E5DFD3]'
              }`}
            >
              All {PARTNER_NETWORK.length}+ Lending Partners
            </button>
            <button
              onClick={() => setFilter('Bank')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === 'Bank'
                  ? 'bg-[#5D6D5F] text-white shadow-xs'
                  : 'bg-[#F4F1EA] text-[#2D332E] border border-[#E5DFD3]'
              }`}
            >
              Banks ({banks.length})
            </button>
            <button
              onClick={() => setFilter('NBFC')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === 'NBFC'
                  ? 'bg-[#5D6D5F] text-white shadow-xs'
                  : 'bg-[#F4F1EA] text-[#2D332E] border border-[#E5DFD3]'
              }`}
            >
              NBFCs & HFCs ({nbfcs.length})
            </button>
          </div>
        </div>

        {/* Partner Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {displayList.map((partner) => (
            <div
              key={partner.name}
              className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-4.5 border border-[#E5DFD3] hover:border-[#C68B59] hover:shadow-md transition-all duration-200 flex flex-col items-center justify-between text-center group min-h-[135px]"
            >
              {/* Official Brand Logo */}
              <div className="w-full h-11 flex items-center justify-center py-1">
                <PartnerLogo name={partner.name} className="h-8 w-auto max-w-[125px]" />
              </div>

              {/* Exact Partner Name & Category */}
              <div className="w-full pt-2 border-t border-[#F4F1EA] mt-1">
                <span className="text-xs font-extrabold text-[#2D332E] group-hover:text-[#C68B59] transition-colors line-clamp-1 leading-snug block">
                  {partner.name}
                </span>
                <span className="inline-block text-[10px] font-bold text-[#68716A] uppercase tracking-wider mt-0.5">
                  {partner.type === 'Bank' ? 'Bank' : 'NBFC'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pan-India Banner */}
        <div className="bg-[#F4F1EA] rounded-2xl p-6 sm:p-8 border border-[#E5DFD3] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-extrabold text-[#2D332E]">
              Looking for Multiple Bank Quotes on Your Loan?
            </h3>
            <p className="text-xs sm:text-sm text-[#68716A] max-w-2xl">
              One application connects you with our loan advisory desk to evaluate eligible sanction terms across our partner network.
            </p>
          </div>

          <button
            onClick={() => {
              const el = document.getElementById('apply-card');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else if (onNavigateToApply) onNavigateToApply();
            }}
            className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-all shadow-sm flex items-center gap-2 flex-shrink-0"
          >
            <span>Compare Rates & Apply</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
