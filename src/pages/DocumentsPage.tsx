import React, { useState } from 'react';
import {
  FileText,
  CheckSquare,
  Square,
  Copy,
  Check,
  Download,
  UserCheck,
  Briefcase,
  Building,
  Coins,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config';

interface DocumentsPageProps {
  onOpenApplyModal: () => void;
}

interface DocCategory {
  title: string;
  badge: string;
  icon: React.ElementType;
  items: string[];
}

const DOCUMENT_CATEGORIES: DocCategory[] = [
  {
    title: 'Salaried Individuals',
    badge: 'Salaried',
    icon: UserCheck,
    items: [
      'PAN Card & Aadhaar Card (KYC)',
      'Latest 3 to 6 months salary slips',
      'Latest 6 months salary bank account statement (showing salary credits)',
      'Latest 2 years Form 16 / Income Tax Returns',
      'Appointment / Confirmation Letter or Company ID Card',
      'Current Residence Proof (Electricity Bill, Rent Agreement, or Voter ID)',
      'Existing loan sanction letters and repayment track (if any)',
    ],
  },
  {
    title: 'Self-Employed / Proprietorships',
    badge: 'Business',
    icon: Briefcase,
    items: [
      'PAN Card & Aadhaar Card of Proprietor',
      'Business Registration Proof (GST Certificate, Udyam / MSME Certificate, Shop & Establishment License)',
      'Latest 2 to 3 years Income Tax Returns with Computation of Income',
      'Audited Balance Sheet & Profit & Loss statements with all schedules',
      'Latest 12 months primary current bank account statement',
      'Latest 12 months savings bank account statement of proprietor',
      'GST 3B Returns for last 12 months',
      'List of existing loans with latest sanction letters and repayment track',
    ],
  },
  {
    title: 'Partnership / LLP / Private Limited',
    badge: 'Corporate',
    icon: Building,
    items: [
      'Company PAN Card & Certificate of Incorporation / Partnership Deed',
      'MOA, AOA, and Board Resolution for borrowing',
      'KYC (PAN & Aadhaar) of all Directors / Partners',
      'Latest 3 years Audited Financials with Tax Audit Report and Schedules',
      'Latest 12 months Bank Statements of all operating bank accounts',
      'Latest 12 months GST returns matching with turnover',
      'Shareholding pattern and Director details',
      'Sanction letters of all existing credit lines, OD/CC, and term loans',
    ],
  },
  {
    title: 'Property & Collateral Documents (Home Loan, LAP, Commercial)',
    badge: 'Property',
    icon: FileText,
    items: [
      'Title Deed / Sale Deed / Conveyance Deed (Complete Chain)',
      'Sanctioned Building Plan and Commencement Certificate (CC)',
      'Occupancy Certificate (OC) or Completion Certificate',
      'Latest Property Tax Receipt & Electricity Bill',
      'Share Certificate & Maintenance Bill (in case of registered Housing Society)',
      'Non-Encumbrance Certificate (13 to 30 years)',
      'Allotment Letter and Builder Buyer Agreement (for under-construction units)',
    ],
  },
  {
    title: 'Gold Loan Quick Documentation',
    badge: 'Instant',
    icon: Coins,
    items: [
      'Original PAN Card & Aadhaar Card',
      'Passport size photograph',
      'Current Residence Proof',
      'Original Gold Jewellery / Ornaments for on-spot karat appraisal',
      'Bank Account details (Cancelled Cheque or Passbook) for direct NEFT/RTGS credit',
    ],
  },
];

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onOpenApplyModal }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleCheck = (item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const handleCopyChecklist = () => {
    const text = DOCUMENT_CATEGORIES.map(
      (cat) =>
        `=== ${cat.title} ===\n` +
        cat.items.map((it) => `• ${it}`).join('\n')
    ).join('\n\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full bg-[#FDFCF8] py-12 sm:py-16 px-4 lg:px-8 space-y-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4F1EA] border border-[#C68B59]/30 text-[#C68B59] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#C68B59]" />
            <span>Underwriting Checklist</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2D332E]">
            Comprehensive Loan Document Requirements
          </h1>
          <p className="text-base text-[#68716A] leading-relaxed">
            Ensure faster file login and quick in-principle sanction by keeping these standard KYC, financial, and property records ready.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={handleCopyChecklist}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#2D332E] bg-[#FDFCF8] border border-[#E5DFD3] hover:bg-[#F4F1EA] transition-all flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-[#5D6D5F]" /> : <Copy className="w-4 h-4 text-[#C68B59]" />}
              <span>{copied ? 'Checklist Copied to Clipboard!' : 'Copy Complete Checklist'}</span>
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DOCUMENT_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                className="bg-[#FDFCF8] rounded-2xl p-6 border border-[#E5DFD3] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F4F1EA] border border-[#E5DFD3] flex items-center justify-center text-[#2D332E]">
                        <Icon className="w-5 h-5 text-[#C68B59]" />
                      </div>
                      <h3 className="text-base font-extrabold text-[#2D332E]">{cat.title}</h3>
                    </div>
                    <span className="text-[10px] font-bold text-[#68716A] bg-[#F4F1EA] px-2 py-0.5 rounded border border-[#E5DFD3]">
                      {cat.badge}
                    </span>
                  </div>

                  <ul className="space-y-2 pt-2 text-xs text-[#68716A]">
                    {cat.items.map((item, idx) => {
                      const isChecked = !!checkedItems[item];
                      return (
                        <li
                          key={idx}
                          onClick={() => toggleCheck(item)}
                          className="flex items-start gap-2.5 cursor-pointer hover:text-[#2D332E] select-none group"
                        >
                          <button
                            type="button"
                            className="mt-0.5 flex-shrink-0 text-[#2D332E] group-hover:text-[#C68B59]"
                            aria-label={`Toggle ${item}`}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-[#5D6D5F]" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                            )}
                          </button>
                          <span className={isChecked ? 'line-through text-gray-400' : 'leading-relaxed'}>
                            {item}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="pt-3 border-t border-[#E5DFD3] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#68716A]">Click checkboxes to track your prepared docs</span>
                  <button
                    onClick={onOpenApplyModal}
                    className="text-xs font-bold text-[#C68B59] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Submit Documents</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assistance Card */}
        <div className="bg-[#F4F1EA] rounded-3xl p-8 border border-[#E5DFD3] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-extrabold text-[#2D332E]">
              Need Doorstep Document Pickup or Verification?
            </h3>
            <p className="text-xs sm:text-sm text-[#68716A] max-w-2xl">
              Our assigned loan officer can guide you on missing property chain links, CA certification, and digital bank statement generation.
            </p>
          </div>

          <button
            onClick={onOpenApplyModal}
            className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-all shadow-sm flex items-center gap-2 flex-shrink-0"
          >
            <span>Request Documentation Assistance</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
