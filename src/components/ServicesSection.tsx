import React, { useState } from 'react';
import {
  Coins,
  Home,
  Building2,
  Briefcase,
  Landmark,
  Factory,
  Warehouse,
  MapPin,
  Hammer,
  RefreshCw,
  TrendingUp,
  Cog,
  Cpu,
  Package,
  Layers,
  PieChart,
  ShieldCheck,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { LOAN_PRODUCTS, BRAND_CONFIG } from '../config';
import { LoanProduct } from '../types';

interface ServicesSectionProps {
  onSelectLoanForApply?: (loanName: string) => void;
  onNavigateToService?: (slug: string) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Coins,
  Home,
  Building2,
  Briefcase,
  Landmark,
  Factory,
  Warehouse,
  MapPin,
  Hammer,
  RefreshCw,
  TrendingUp,
  Cog,
  Cpu,
  Package,
  Layers,
  PieChart,
  ShieldCheck,
};

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectLoanForApply,
  onNavigateToService,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'MSME' | 'Retail' | 'Commercial' | 'Specialized'>('All');

  const filteredProducts =
    selectedCategory === 'All'
      ? LOAN_PRODUCTS
      : LOAN_PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <section className="w-full bg-[#FDFCF8] py-16 px-4 lg:px-8 border-b border-[#E5DFD3]" id="services">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-[#C68B59] bg-[#F4F1EA] px-3.5 py-1 rounded-full border border-[#C68B59]/30">
            Tailored Financial Products
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D332E]">
            Comprehensive Loan Solutions Across India
          </h2>
          <p className="text-sm sm:text-base text-[#68716A] leading-relaxed">
            From Working Capital (OD/CC) to Home Loans, LAP, and specialized commercial property finance, we deliver structured credit assistance across {BRAND_CONFIG.metrics.partnerNetwork} banking partners.
          </p>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {(['All', 'MSME', 'Retail', 'Commercial', 'Specialized'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#5D6D5F] text-white shadow-xs'
                    : 'bg-[#FDFCF8] text-[#2D332E] border border-[#E5DFD3] hover:bg-[#F4F1EA]'
                }`}
              >
                {cat === 'All' ? 'All 17 Services' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, idx) => {
            const Icon = iconMap[product.iconName] || Coins;
            const isWorkingCapital = product.id === 'working-capital';

            return (
              <div
                key={product.id}
                className={`bg-[#F4F1EA]/60 rounded-2xl p-6 border transition-all duration-200 hover:shadow-md flex flex-col justify-between space-y-5 ${
                  isWorkingCapital
                    ? 'border-[#C68B59] shadow-xs relative ring-1 ring-[#C68B59]/40 bg-[#F4F1EA]'
                    : 'border-[#E5DFD3] hover:bg-[#F4F1EA]'
                }`}
              >
                {isWorkingCapital && (
                  <div className="absolute -top-3 left-6 bg-[#C68B59] text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider shadow-2xs">
                    Priority MSME Solution
                  </div>
                )}

                <div className="space-y-4">
                  {/* Top Icon & Category Tag */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#FDFCF8] border border-[#E5DFD3] flex items-center justify-center text-[#2D332E]">
                      <Icon className="w-6 h-6 text-[#C68B59]" />
                    </div>
                    <span className="text-[11px] font-bold text-[#68716A] uppercase tracking-wider bg-[#FDFCF8] border border-[#E5DFD3] px-2.5 py-1 rounded-md">
                      {product.category}
                    </span>
                  </div>

                  {/* Title & Starting Rate */}
                  <div>
                    <h3 className="text-xl font-extrabold text-[#2D332E] leading-tight">
                      {product.name}
                    </h3>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-xs font-semibold text-[#68716A]">Starting Rate:</span>
                      <span className="text-sm font-extrabold text-[#C68B59]">
                        {product.startingRate || 'Competitive Market Rates'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#68716A] leading-relaxed line-clamp-3">
                    {product.description}
                  </p>

                  {/* Sub-products (for Working Capital) */}
                  {product.subProducts && (
                    <div className="pt-2 border-t border-[#E5DFD3]">
                      <span className="text-[11px] font-bold text-[#2D332E] block mb-1.5">Includes:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.subProducts.map((sub, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] bg-[#FDFCF8] text-[#2D332E] font-medium px-2 py-0.5 rounded border border-[#E5DFD3]"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Highlights */}
                  <div className="space-y-1.5 pt-1">
                    {product.keyHighlights.slice(0, 2).map((h, hIdx) => (
                      <div key={hIdx} className="flex items-start gap-2 text-xs text-[#2D332E]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#5D6D5F] flex-shrink-0 mt-0.5" />
                        <span className="leading-tight">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-[#E5DFD3] grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onNavigateToService && onNavigateToService(product.slug)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-[#2D332E] bg-[#FDFCF8] border border-[#E5DFD3] hover:bg-[#EAE4D8] transition-colors text-center"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => onSelectLoanForApply && onSelectLoanForApply(product.name)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rate & Eligibility Disclaimer */}
        <div className="bg-[#FDFCF8] rounded-xl p-4 border border-[#E5DFD3] text-xs text-[#68716A] text-center max-w-4xl mx-auto">
          <strong>Disclaimer:</strong> {BRAND_CONFIG.rateDisclaimer}
        </div>
      </div>
    </section>
  );
};
