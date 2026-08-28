import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
  User,
  ChevronDown,
  Menu,
  X,
  Instagram,
  ArrowRight,
  ShieldCheck,
  Building,
  Coins,
  Home,
  Briefcase,
  FileText,
  Calculator,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { BRAND_CONFIG, LOAN_PRODUCTS } from '../config';
import { Logo } from './Logo';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenApplyModal?: (loanType?: string) => void;
  onOpenAIAdvisor?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  onOpenApplyModal,
  onOpenAIAdvisor,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [resourcesDropdownOpen, setResourcesDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
    setServicesDropdownOpen(false);
    setResourcesDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="w-full z-50 sticky top-0 bg-[#FDFCF8] shadow-sm transition-all duration-200">
      {/* 1. TOP CONTACT BAR */}
      <div className="bg-[#5D6D5F] text-[#FFFFFF] text-xs py-2 px-4 border-b border-[#48564A]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Direct Clickable Contacts */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <a
              href={`tel:${BRAND_CONFIG.contact.phoneRaw}`}
              className="flex items-center gap-1.5 hover:text-[#F9EFE6] transition-colors"
              id="header-top-phone"
            >
              <Phone className="w-3.5 h-3.5 text-[#C68B59]" />
              <span className="font-semibold">{BRAND_CONFIG.contact.phone}</span>
            </a>

            <a
              href={BRAND_CONFIG.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#EBF0EC] transition-colors"
              id="header-top-whatsapp"
            >
              <span className="w-2 h-2 rounded-full bg-[#C68B59] animate-pulse"></span>
              <span className="font-medium">WhatsApp Assistance</span>
            </a>

            <a
              href={BRAND_CONFIG.contact.mailto}
              className="hidden md:flex items-center gap-1.5 hover:text-[#F9EFE6] transition-colors"
              id="header-top-email"
            >
              <Mail className="w-3.5 h-3.5 text-[#C68B59]" />
              <span>{BRAND_CONFIG.contact.email}</span>
            </a>
          </div>

          {/* Right: Social - Instagram ONLY */}
          <div className="flex items-center gap-3">
            <span className="text-[#ECE7DC]/70 hidden sm:inline text-[11px]">Follow Us:</span>
            <a
              href={BRAND_CONFIG.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[#ECE7DC] hover:text-[#C68B59] transition-colors text-xs font-medium"
              id="header-top-instagram"
              aria-label="Capitabee Financial Services Instagram"
            >
              <Instagram className="w-3.5 h-3.5 text-[#C68B59]" />
              <span className="text-[11px]">Instagram</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION */}
      <div className="bg-[#FDFCF8] px-4 lg:px-8 py-3.5 border-b border-[#E5DFD3]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick('/')}
            className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5D6D5F] rounded-lg"
            id="brand-logo-button"
          >
            <Logo size="md" />
          </button>

          {/* Desktop Center Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-semibold text-[#2D332E]">
            <button
              onClick={() => handleNavClick('/')}
              className={`hover:text-[#C68B59] transition-colors py-1 ${
                currentPath === '/' ? 'text-[#C68B59] font-bold border-b-2 border-[#C68B59]' : ''
              }`}
              id="nav-home"
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('/about')}
              className={`hover:text-[#C68B59] transition-colors py-1 ${
                currentPath === '/about' ? 'text-[#C68B59] font-bold border-b-2 border-[#C68B59]' : ''
              }`}
              id="nav-about"
            >
              About Us
            </button>

            {/* Services Mega Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                onClick={() => handleNavClick('/services')}
                className={`flex items-center gap-1 hover:text-[#C68B59] transition-colors py-1 ${
                  currentPath.startsWith('/services') ? 'text-[#C68B59] font-bold border-b-2 border-[#C68B59]' : ''
                }`}
                id="nav-services"
              >
                <span>Services</span>
                <ChevronDown className="w-4 h-4 text-[#C68B59]" />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-0 w-80 bg-[#FDFCF8] rounded-2xl shadow-xl border border-[#E5DFD3] p-3 grid gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <div className="px-3 py-1.5 border-b border-[#ECE7DC] flex items-center justify-between text-xs font-bold text-[#68716A] uppercase tracking-wider">
                    <span>All Loan Solutions</span>
                    <span className="text-[#C68B59]">17 Services</span>
                  </div>
                  <div className="max-h-96 overflow-y-auto pr-1 space-y-1">
                    {LOAN_PRODUCTS.map((prod, idx) => (
                      <button
                        key={prod.id}
                        onClick={() => handleNavClick(`/services/${prod.slug}`)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-[#F4F1EA] transition-colors ${
                          idx === 0 ? 'bg-[#F4F1EA] font-bold text-[#2D332E]' : 'text-[#2D332E]'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#2D332E]">{prod.name}</span>
                          {prod.startingRate && (
                            <span className="text-[10px] text-[#C68B59] font-medium">
                              From {prod.startingRate}
                            </span>
                          )}
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#68716A] opacity-50" />
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-[#ECE7DC]">
                    <button
                      onClick={() => handleNavClick('/services')}
                      className="w-full text-center py-2 text-xs font-bold text-[#2D332E] hover:text-[#C68B59] bg-[#F4F1EA] rounded-xl transition-colors"
                    >
                      View All 17 Loan Products →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setResourcesDropdownOpen(true)}
              onMouseLeave={() => setResourcesDropdownOpen(false)}
            >
              <button
                onClick={() => handleNavClick('/resources')}
                className={`flex items-center gap-1 hover:text-[#C68B59] transition-colors py-1 ${
                  currentPath.startsWith('/resources') ? 'text-[#C68B59] font-bold border-b-2 border-[#C68B59]' : ''
                }`}
                id="nav-resources"
              >
                <span>Resources</span>
                <ChevronDown className="w-4 h-4 text-[#C68B59]" />
              </button>

              {resourcesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-[#FDFCF8] rounded-2xl shadow-xl border border-[#E5DFD3] p-2 grid gap-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                  <button
                    onClick={() => handleNavClick('/resources/documents')}
                    className="text-left px-3 py-2 rounded-xl text-xs font-medium text-[#2D332E] hover:bg-[#F4F1EA] flex items-center gap-2.5 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-[#C68B59]" />
                    <div>
                      <div className="font-bold">Document Checklist</div>
                      <div className="text-[10px] text-[#68716A]">Salaried & Self-Employed</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('/emi-calculator')}
                    className="text-left px-3 py-2 rounded-xl text-xs font-medium text-[#2D332E] hover:bg-[#F4F1EA] flex items-center gap-2.5 transition-colors"
                  >
                    <Calculator className="w-4 h-4 text-[#5D6D5F]" />
                    <div>
                      <div className="font-bold">EMI Calculator</div>
                      <div className="text-[10px] text-[#68716A]">Principal & Amortization</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick('/about')}
                    className="text-left px-3 py-2 rounded-xl text-xs font-medium text-[#2D332E] hover:bg-[#F4F1EA] flex items-center gap-2.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#5D6D5F]" />
                    <div>
                      <div className="font-bold">12-Stage Journey</div>
                      <div className="text-[10px] text-[#68716A]">Transparent Loan Process</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('/partners')}
              className={`hover:text-[#C68B59] transition-colors py-1 ${
                currentPath === '/partners' ? 'text-[#C68B59] font-bold border-b-2 border-[#C68B59]' : ''
              }`}
              id="nav-partners"
            >
              Partners
            </button>

            <button
              onClick={() => handleNavClick('/about')}
              className="hover:text-[#C68B59] transition-colors py-1"
              id="nav-why-capitabee"
            >
              Why Capitabee
            </button>

            <button
              onClick={() => handleNavClick('/reviews')}
              className={`hover:text-[#C68B59] transition-colors py-1 ${
                currentPath.startsWith('/reviews') ? 'text-[#C68B59] font-bold border-b-2 border-[#C68B59]' : ''
              }`}
              id="nav-reviews"
            >
              Reviews
            </button>

            <button
              onClick={() => handleNavClick('/contact')}
              className={`hover:text-[#C68B59] transition-colors py-1 ${
                currentPath === '/contact' ? 'text-[#C68B59] font-bold border-b-2 border-[#C68B59]' : ''
              }`}
              id="nav-contact"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* AI Advisor Button */}
            <button
              onClick={onOpenAIAdvisor ? onOpenAIAdvisor : () => handleNavClick('/ai-advisor')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#2D332E] bg-[#F4F1EA] border border-[#5D6D5F]/30 hover:bg-[#F9EFE6] hover:border-[#C68B59] flex items-center gap-1.5 transition-all shadow-2xs"
              id="header-ai-advisor-btn"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" />
              <span>AI Advisor</span>
            </button>

            {/* Customer Login Button */}
            <button
              onClick={() => handleNavClick('/login')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#2D332E] bg-[#FDFCF8] border-2 border-[#5D6D5F] hover:bg-[#F4F1EA] flex items-center gap-1.5 transition-all shadow-2xs"
              id="header-customer-login-btn"
            >
              <User className="w-3.5 h-3.5 text-[#5D6D5F]" />
              <span>Customer Login</span>
            </button>

            {/* Apply Now Button */}
            <button
              onClick={onOpenApplyModal ? () => onOpenApplyModal() : () => handleNavClick('/#apply-card')}
              className="px-5 py-2 rounded-xl text-xs font-bold text-[#FFFFFF] bg-[#C68B59] hover:bg-[#AA7142] transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
              id="header-apply-now-btn"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Right Controls: Apply Now + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onOpenApplyModal ? () => onOpenApplyModal() : () => handleNavClick('/#apply-card')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#FFFFFF] bg-[#C68B59] hover:bg-[#AA7142]"
              id="mobile-header-apply-btn"
            >
              Apply Now
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-[#2D332E] hover:bg-[#F4F1EA] focus:outline-none"
              aria-label="Toggle navigation menu"
              id="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FDFCF8] border-b border-[#E5DFD3] px-5 py-6 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleNavClick('/')}
              className="text-left py-2 font-bold text-[#2D332E] border-b border-[#ECE7DC]"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('/about')}
              className="text-left py-2 font-bold text-[#2D332E] border-b border-[#ECE7DC]"
            >
              About Us
            </button>
            <button
              onClick={() => handleNavClick('/services')}
              className="text-left py-2 font-bold text-[#2D332E] border-b border-[#ECE7DC] flex items-center justify-between"
            >
              <span>Loan Services (17 Products)</span>
              <span className="text-xs text-[#C68B59]">Working Capital First →</span>
            </button>
            <button
              onClick={() => handleNavClick('/resources/documents')}
              className="text-left py-2 font-bold text-[#2D332E] border-b border-[#ECE7DC]"
            >
              Document Requirements
            </button>
            <button
              onClick={() => handleNavClick('/emi-calculator')}
              className="text-left py-2 font-bold text-[#2D332E] border-b border-[#ECE7DC]"
            >
              EMI Calculator
            </button>
            <button
              onClick={() => handleNavClick('/partners')}
              className="text-left py-2 font-bold text-[#2D332E] border-b border-[#ECE7DC]"
            >
              {BRAND_CONFIG.metrics.partnerNetwork} Partner Network
            </button>
            <button
              onClick={() => handleNavClick('/reviews')}
              className="text-left py-2 font-bold text-[#2D332E] border-b border-[#ECE7DC]"
            >
              Customer Reviews
            </button>
            <button
              onClick={() => handleNavClick('/contact')}
              className="text-left py-2 font-bold text-[#2D332E] border-b border-[#ECE7DC]"
            >
              Contact Us
            </button>

            {/* Mobile Action Hub */}
            <div className="pt-3 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenAIAdvisor) onOpenAIAdvisor();
                  else handleNavClick('/ai-advisor');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-[#2D332E] bg-[#F4F1EA] border border-[#C68B59] flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#C68B59]" />
                <span>Ask AI Advisor</span>
              </button>

              <button
                onClick={() => handleNavClick('/login')}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-[#2D332E] bg-[#FDFCF8] border-2 border-[#5D6D5F] flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-[#5D6D5F]" />
                <span>Customer Login</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onOpenApplyModal) onOpenApplyModal();
                  else handleNavClick('/#apply-card');
                }}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-[#FFFFFF] bg-[#C68B59] flex items-center justify-center gap-2 shadow-md"
              >
                <span>Check Eligibility & Apply Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
