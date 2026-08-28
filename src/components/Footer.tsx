import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { BRAND_CONFIG, LOAN_PRODUCTS } from '../config';
import { Logo } from './Logo';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (path: string) => {
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full bg-[#F4F1EA] text-[#2D332E] border-t border-[#E5DFD3] pt-14 pb-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Col 1: Brand & Office (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <button onClick={() => handleNav('/')} className="text-left focus:outline-none">
              <Logo size="md" />
            </button>

            <p className="text-xs text-[#68716A] leading-relaxed max-w-sm pt-2">
              <strong>{BRAND_CONFIG.name}</strong> provides Pan-India Loan Assistance across {BRAND_CONFIG.metrics.partnerNetwork} partner banks and NBFCs for MSMEs, self-employed professionals, and individuals.
            </p>

            <div className="pt-2 space-y-2 text-xs text-[#2D332E]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C68B59] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Registered Office:</span>
                  <a
                    href={BRAND_CONFIG.office.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#68716A] hover:text-[#2D332E] hover:underline leading-relaxed block mt-0.5"
                  >
                    {BRAND_CONFIG.office.address}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Phone className="w-4 h-4 text-[#C68B59] flex-shrink-0" />
                <a
                  href={`tel:${BRAND_CONFIG.contact.phoneRaw}`}
                  className="font-bold hover:text-[#C68B59] transition-colors"
                >
                  {BRAND_CONFIG.contact.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C68B59] flex-shrink-0" />
                <a
                  href={BRAND_CONFIG.contact.mailto}
                  className="text-[#68716A] hover:text-[#2D332E] transition-colors"
                >
                  {BRAND_CONFIG.contact.email}
                </a>
              </div>
            </div>

            {/* Social Link - Instagram ONLY */}
            <div className="pt-3">
              <span className="text-[11px] font-bold text-[#68716A] uppercase tracking-wider block mb-2">
                Connect With Us
              </span>
              <a
                href={BRAND_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FDFCF8] border border-[#E5DFD3] hover:border-[#C68B59] text-xs font-bold text-[#2D332E] hover:text-[#C68B59] transition-all shadow-2xs"
                id="footer-instagram"
              >
                <Instagram className="w-4 h-4 text-[#C68B59]" />
                <span>Follow on Instagram</span>
              </a>
            </div>
          </div>

          {/* Col 2: Services (Working Capital First) (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#C68B59]">
              Loan Solutions (17)
            </h4>
            <ul className="space-y-1.5 text-xs text-[#68716A]">
              {LOAN_PRODUCTS.slice(0, 9).map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => handleNav(`/services/${p.slug}`)}
                    className="hover:text-[#2D332E] hover:underline transition-colors text-left"
                  >
                    {p.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNav('/services')}
                  className="font-bold text-[#2D332E] hover:text-[#C68B59] flex items-center gap-1 pt-1"
                >
                  <span>View All 17 Products</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Journey (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#C68B59]">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-[#68716A]">
              <li>
                <button onClick={() => handleNav('/resources/documents')} className="hover:text-[#2D332E] text-left">
                  Document Checklist
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/emi-calculator')} className="hover:text-[#2D332E] text-left">
                  EMI Calculator
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/about')} className="hover:text-[#2D332E] text-left">
                  12-Stage Journey
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/partners')} className="hover:text-[#2D332E] text-left">
                  {BRAND_CONFIG.metrics.partnerNetwork} Partner Network
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/reviews')} className="hover:text-[#2D332E] text-left">
                  Customer Reviews
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/reviews/write')} className="hover:text-[#2D332E] text-left">
                  Write a Review
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/login')} className="hover:text-[#2D332E] text-left font-semibold text-[#2D332E]">
                  Customer Login
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Positioning & Assistance (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#C68B59]">
              National Assistance
            </h4>
            <p className="text-xs text-[#68716A] leading-relaxed">
              We provide loan structuring and multi-bank appraisal services across all Indian states and union territories.
            </p>
            <div className="p-3 bg-[#FDFCF8] rounded-xl border border-[#E5DFD3] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#2D332E]">
                <ShieldCheck className="w-4 h-4 text-[#5D6D5F]" />
                <span>Pan-India Loan Assistance</span>
              </div>
              <p className="text-[11px] text-[#68716A] leading-tight">
                Doorstep document pickup, advocate title clearance & banker coordination.
              </p>
            </div>
          </div>
        </div>

        {/* Financial Legal Disclaimer */}
        <div className="pt-6 border-t border-[#E5DFD3] text-[11px] text-[#8C968E] leading-relaxed space-y-2">
          <p>
            <strong>Financial Disclaimer:</strong> {BRAND_CONFIG.financialDisclaimer}
          </p>
          <p>
            {BRAND_CONFIG.rateDisclaimer}
          </p>
        </div>

        {/* Bottom Bar with Legal Links */}
        <div className="pt-4 border-t border-[#E5DFD3] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#68716A]">
          <div>
            © {new Date().getFullYear()} <strong>{BRAND_CONFIG.name}</strong>. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <button onClick={() => handleNav('/privacy-policy')} className="hover:text-[#2D332E]">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => handleNav('/terms')} className="hover:text-[#2D332E]">
              Terms & Conditions
            </button>
            <span>•</span>
            <button onClick={() => handleNav('/disclaimer')} className="hover:text-[#2D332E]">
              Disclaimer
            </button>
            <span>•</span>
            <button onClick={() => handleNav('/cookie-policy')} className="hover:text-[#2D332E]">
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
