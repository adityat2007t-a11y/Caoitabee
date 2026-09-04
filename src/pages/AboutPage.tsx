import React from 'react';
import {
  ShieldCheck,
  Building,
  CheckCircle2,
  Users2,
  TrendingUp,
  Globe2,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { BRAND_CONFIG, TWELVE_STAGE_JOURNEY } from '../config';

interface AboutPageProps {
  onOpenApplyModal: () => void;
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenApplyModal, onNavigate }) => {
  return (
    <div className="w-full bg-[#FDFCF8] py-12 sm:py-16 px-4 lg:px-8 space-y-16">
      <div className="max-w-7xl mx-auto space-y-14">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4F1EA] border border-[#C68B59]/30 text-[#C68B59] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#C68B59]" />
            <span>Official Profile</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2D332E]">
            About Capitabee Financial Services
          </h1>
          <p className="text-base sm:text-lg text-[#68716A] leading-relaxed">
            Pan-India Loan Assistance for Home Loans, LAP, Business Loans, Working Capital, Commercial & Industrial Property Loans, Gold Loans, and {BRAND_CONFIG.metrics.partnerNetwork} partner banks & NBFCs.
          </p>
        </div>

        {/* Core Vision & Mission Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#FDFCF8] rounded-2xl p-6 sm:p-7 border border-[#E5DFD3] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#F4F1EA] border border-[#E5DFD3] flex items-center justify-center text-[#C68B59]">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#2D332E]">Our Mission</h3>
            <p className="text-xs sm:text-sm text-[#68716A] leading-relaxed">
              To democratize access to institutional credit for Indian families, MSME entrepreneurs, and commercial enterprises through transparent loan underwriting and multi-lender comparison.
            </p>
          </div>

          <div className="bg-[#FDFCF8] rounded-2xl p-6 sm:p-7 border border-[#E5DFD3] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#F4F1EA] border border-[#E5DFD3] flex items-center justify-center text-[#5D6D5F]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#2D332E]">Our Reach</h3>
            <p className="text-xs sm:text-sm text-[#68716A] leading-relaxed">
              Delivering structured loan facilitation across all Indian states and union territories, bridging Tier-1 metros and emerging industrial corridors.
            </p>
          </div>

          <div className="bg-[#FDFCF8] rounded-2xl p-6 sm:p-7 border border-[#E5DFD3] shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#F4F1EA] border border-[#E5DFD3] flex items-center justify-center text-[#2D332E]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#2D332E]">Zero Friction</h3>
            <p className="text-xs sm:text-sm text-[#68716A] leading-relaxed">
              We eliminate administrative friction with end-to-end file preparation, advocate search reports, technical property inspection coordination, and banker logins.
            </p>
          </div>
        </div>

        {/* 12-Stage Journey Breakdown */}
        <div className="bg-[#F4F1EA] rounded-3xl p-8 sm:p-10 border border-[#E5DFD3] space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2D332E]">
              The 12-Stage Transparent Journey
            </h2>
            <p className="text-xs sm:text-sm text-[#68716A]">
              Every customer file is tracked with complete transparency through each phase.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TWELVE_STAGE_JOURNEY.map((stage) => (
              <div
                key={stage.stageNumber}
                className="bg-[#FDFCF8] rounded-xl p-4 border border-[#E5DFD3] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#C68B59]">
                    STAGE {stage.stageNumber.toString().padStart(2, '0')}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#5D6D5F]" />
                </div>
                <h4 className="font-bold text-sm text-[#2D332E]">{stage.name}</h4>
                <p className="text-xs text-[#68716A] leading-tight">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Office & Operations Card */}
        <div className="bg-[#FDFCF8] rounded-3xl p-8 border border-[#E5DFD3] grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C68B59]">
              Corporate Office
            </span>
            <h3 className="text-2xl font-extrabold text-[#2D332E]">
              Capitabee Financial Services
            </h3>
            <p className="text-xs sm:text-sm text-[#68716A] leading-relaxed">
              Our central loan underwriting and advisory office is located in Thane, Maharashtra, coordinating with bank branch managers and regional credit hubs nationwide.
            </p>

            <div className="space-y-2 text-xs text-[#2D332E] pt-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C68B59] flex-shrink-0 mt-0.5" />
                <a
                  href={BRAND_CONFIG.office.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-[#68716A]"
                >
                  {BRAND_CONFIG.office.address}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C68B59] flex-shrink-0" />
                <a href={`tel:${BRAND_CONFIG.contact.phoneRaw}`} className="font-bold">
                  {BRAND_CONFIG.contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C68B59] flex-shrink-0" />
                <span>{BRAND_CONFIG.contact.email}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenApplyModal}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-colors flex items-center gap-2 shadow-xs"
              >
                <span>Apply for Loan Consultation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-[#F4F1EA] rounded-2xl p-6 border border-[#E5DFD3] space-y-4">
            <h4 className="font-extrabold text-sm text-[#2D332E]">Lending Highlights</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-[#FDFCF8] p-3 rounded-xl border border-[#E5DFD3]">
                <div className="text-xl font-extrabold text-[#2D332E]">{BRAND_CONFIG.metrics.partnerNetwork}</div>
                <div className="text-[10px] text-[#68716A] font-medium">Bank & NBFC Network</div>
              </div>
              <div className="bg-[#FDFCF8] p-3 rounded-xl border border-[#E5DFD3]">
                <div className="text-xl font-extrabold text-[#2D332E]">17</div>
                <div className="text-[10px] text-[#68716A] font-medium">Loan Products</div>
              </div>
              <div className="bg-[#FDFCF8] p-3 rounded-xl border border-[#E5DFD3]">
                <div className="text-xl font-extrabold text-[#2D332E]">12-Stage</div>
                <div className="text-[10px] text-[#68716A] font-medium">Transparent Journey</div>
              </div>
              <div className="bg-[#FDFCF8] p-3 rounded-xl border border-[#E5DFD3]">
                <div className="text-xl font-extrabold text-[#C68B59]">Pan-India</div>
                <div className="text-[10px] text-[#68716A] font-medium">Nationwide Coverage</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
