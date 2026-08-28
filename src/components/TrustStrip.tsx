import React from 'react';
import { ShieldCheck, TrendingUp, Globe2, CheckCircle2, Users2 } from 'lucide-react';
import { BRAND_CONFIG } from '../config';

export const TrustStrip: React.FC = () => {
  const items = [
    {
      icon: ShieldCheck,
      value: BRAND_CONFIG.metrics.partnerNetwork,
      label: 'Leading Bank & NBFC Partners',
      color: 'text-[#C68B59]',
    },
    {
      icon: TrendingUp,
      value: BRAND_CONFIG.metrics.loanDisbursed,
      label: 'Loan Disbursed',
      color: 'text-[#5D6D5F]',
    },
    {
      icon: Globe2,
      value: 'Pan-India',
      label: 'Loan Assistance',
      color: 'text-[#5D6D5F]',
    },
    {
      icon: CheckCircle2,
      value: BRAND_CONFIG.metrics.transparentJourney,
      label: 'Transparent Loan Journey',
      color: 'text-[#2D332E]',
    },
    {
      icon: Users2,
      value: BRAND_CONFIG.metrics.happyCustomers,
      label: 'Happy Customers',
      color: 'text-[#C68B59]',
    },
  ];

  return (
    <div className="w-full bg-[#FDFCF8] border-b border-[#E5DFD3] py-5 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F4F1EA]/70 border border-[#E5DFD3]/80 hover:bg-[#F4F1EA] transition-all shadow-2xs"
            >
              <div className="p-2 rounded-lg bg-[#FDFCF8] border border-[#E5DFD3] flex-shrink-0">
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-extrabold text-[#2D332E] leading-tight">
                  {item.value}
                </span>
                <span className="text-[11px] font-medium text-[#68716A] leading-tight mt-0.5">
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
