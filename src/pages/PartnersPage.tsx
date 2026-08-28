import React, { useState } from 'react';
import { PARTNER_NETWORK, BRAND_CONFIG } from '../config';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PartnerLogo } from '../components/PartnerLogo';

interface PartnersPageProps {
  onOpenApplyModal: () => void;
}

export const PartnersPage: React.FC<PartnersPageProps> = ({ onOpenApplyModal }) => {
  const [filter, setFilter] = useState<'All' | 'Bank' | 'NBFC'>('All');

  const banks = PARTNER_NETWORK.filter((p) => p.type === 'Bank');
  const nbfcs = PARTNER_NETWORK.filter((p) => p.type === 'NBFC');

  const displayList =
    filter === 'All' ? PARTNER_NETWORK : PARTNER_NETWORK.filter((p) => p.type === filter);

  return (
    <div className="w-full bg-[#FDFCF8] py-12 sm:py-16 px-4 lg:px-8 space-y-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4F1EA] border border-[#C68B59]/30 text-[#C68B59] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#C68B59]" />
            <span>{PARTNER_NETWORK.length}+ Partner Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2D332E]">
            Our Lending Partner Ecosystem
          </h1>
          <p className="text-base text-[#68716A] leading-relaxed">
            Direct collaboration with leading Public Sector Banks, Private Banks, Housing Finance Companies, and specialized MSME NBFCs across India.
          </p>

          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setFilter('All')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === 'All'
                  ? 'bg-[#2D332E] text-white shadow-xs'
                  : 'bg-[#F4F1EA] text-[#2D332E] border border-[#E5DFD3]'
              }`}
            >
              All {PARTNER_NETWORK.length}+ Institutions
            </button>
            <button
              onClick={() => setFilter('Bank')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === 'Bank'
                  ? 'bg-[#2D332E] text-white shadow-xs'
                  : 'bg-[#F4F1EA] text-[#2D332E] border border-[#E5DFD3]'
              }`}
            >
              Commercial Banks ({banks.length})
            </button>
            <button
              onClick={() => setFilter('NBFC')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filter === 'NBFC'
                  ? 'bg-[#2D332E] text-white shadow-xs'
                  : 'bg-[#F4F1EA] text-[#2D332E] border border-[#E5DFD3]'
              }`}
            >
              NBFCs & HFCs ({nbfcs.length})
            </button>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayList.map((partner) => (
            <div
              key={partner.name}
              className="bg-[#FFFFFF] rounded-2xl p-4.5 border border-[#E5DFD3] hover:border-[#C68B59] hover:shadow-md transition-all duration-200 flex flex-col items-center justify-between text-center group min-h-[140px]"
            >
              {/* Official Brand Logo */}
              <div className="w-full h-12 flex items-center justify-center py-1">
                <PartnerLogo name={partner.name} className="h-8 sm:h-9 w-auto max-w-[130px]" />
              </div>

              {/* Exact Partner Name & Category */}
              <div className="w-full pt-2.5 border-t border-[#F4F1EA] mt-1">
                <span className="text-xs font-extrabold text-[#2D332E] group-hover:text-[#C68B59] transition-colors line-clamp-1 leading-snug block">
                  {partner.name}
                </span>
                <span className="inline-block text-[10px] font-bold text-[#68716A] uppercase tracking-wider mt-0.5">
                  {partner.type === 'Bank' ? 'Commercial Bank' : 'Registered NBFC/HFC'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Multi-bank appraisal note */}
        <div className="bg-[#F4F1EA] rounded-3xl p-8 border border-[#E5DFD3] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-extrabold text-[#2D332E]">
              Why Apply Through Capitabee Multi-Bank Network?
            </h3>
            <p className="text-xs sm:text-sm text-[#68716A] max-w-2xl">
              Applying individually to multiple banks triggers multiple hard bureau inquiries. Capitabee evaluates your file internally before placing it with the most receptive institution.
            </p>
          </div>

          <button
            onClick={onOpenApplyModal}
            className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-all shadow-sm flex items-center gap-2 flex-shrink-0"
          >
            <span>Get Multi-Bank Loan Quotes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
