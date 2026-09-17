import React from 'react';
import { Users2, ShieldCheck, Briefcase, Award } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  description: string;
  monogram: string;
  badge?: string;
  isPrimary?: boolean;
}

const PRIMARY_LEADER: TeamMember = {
  id: 'rajpat-upadhyay',
  name: 'Rajpat Shivram Upadhyay',
  title: 'Founder & Managing CEO',
  description:
    "Leading CAPITABEE FINANCIAL SERVICES with a clear focus on responsible financial solutions, strategic growth and long-term client relationships. As Founder & Managing CEO, Rajpat provides overall leadership and drives the company's vision, business strategy and commitment to professional loan assistance.",
  monogram: 'RSU',
  badge: 'Executive Leadership',
  isPrimary: true,
};

const ADVISORY_TEAM: TeamMember[] = [
  {
    id: 'jyoti-tiwari',
    name: 'Jyoti Tiwari',
    title: 'Co-Founder & CFO',
    description:
      'Overseeing the financial direction and fiscal discipline of CAPITABEE FINANCIAL SERVICES. As Co-Founder & CFO, Jyoti focuses on financial planning, internal financial management and supporting sustainable business growth.',
    monogram: 'JT',
    badge: 'Co-Founder & Finance',
  },
  {
    id: 'neeraj-singh',
    name: 'Neeraj Singh',
    title: 'Operating Partner',
    description:
      "Supporting the company's operational strategy and execution across key business functions. Neeraj works closely with the leadership team to strengthen processes, coordination and day-to-day operational efficiency.",
    monogram: 'NS',
    badge: 'Operations & Strategy',
  },
  {
    id: 'jitendrachand-thakur',
    name: 'CA Jitendrachand Thakur',
    title: 'Tax Advisor',
    description:
      "Providing professional tax and financial guidance to support sound decision-making and effective financial planning. The role focuses on helping ensure that relevant tax considerations are appropriately evaluated within the company's advisory process.",
    monogram: 'CJT',
    badge: 'Tax Advisory',
  },
  {
    id: 'bhavesh-aniket',
    name: 'Bhavesh Sethiya & Aniket Pawar',
    title: 'Investment Advisors',
    description:
      'Supporting clients and the organisation with thoughtful investment-oriented perspectives and financial planning considerations. Bhavesh and Aniket contribute to informed decision-making with a focus on understanding financial objectives and available opportunities.',
    monogram: 'BS · AP',
    badge: 'Investment Advisory',
  },
  {
    id: 'siddesh-surve',
    name: 'Siddesh Surve',
    title: 'HR Head',
    description:
      "Leading human-resource initiatives and supporting a professional, accountable and collaborative work environment. Siddesh focuses on people coordination, internal HR processes and strengthening the organisation's team culture.",
    monogram: 'SS',
    badge: 'Human Resources',
  },
  {
    id: 'aditya-tiwari',
    name: 'Aditya Tiwari',
    title: 'Operations Head & IT Head',
    description:
      'Overseeing operational coordination while driving technology and digital initiatives across the organisation. Aditya focuses on improving internal workflows, technology-enabled processes, digital systems and operational efficiency.',
    monogram: 'AT',
    badge: 'Operations & Technology',
  },
];

export const LeadershipTeamSection: React.FC = () => {
  return (
    <section id="leadership" className="w-full space-y-10 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4F1EA] border border-[#C68B59]/30 text-[#C68B59] text-xs font-bold uppercase tracking-wider">
          <Users2 className="w-3.5 h-3.5 text-[#C68B59]" />
          <span>Governance & Guidance</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2D332E]">
          Leadership &amp; Advisory Team
        </h2>
        <p className="text-xs sm:text-sm lg:text-base text-[#68716A] leading-relaxed">
          Experienced leadership and specialist advisors working together to support a professional, transparent and client-focused financial services experience.
        </p>
      </div>

      {/* Primary Leadership Card: Founder & Managing CEO */}
      <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 lg:p-10 border-2 border-[#E5DFD3] hover:border-[#C68B59]/40 transition-all shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 lg:gap-8">
          {/* Executive Monogram Badge */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F4F1EA] border border-[#C68B59]/30 flex flex-col items-center justify-center text-center shadow-2xs">
              <span className="font-serif font-bold text-xl sm:text-2xl text-[#C68B59] tracking-wider">
                {PRIMARY_LEADER.monogram}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#5D6D5F] font-semibold mt-0.5">
                Principal
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F4F1EA] border border-[#E5DFD3] text-[#C68B59] text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-[#C68B59]" />
                {PRIMARY_LEADER.badge}
              </span>
            </div>

            {/* Name displayed FIRST */}
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#2D332E] tracking-tight">
              {PRIMARY_LEADER.name}
            </h3>

            {/* Designation displayed SECOND */}
            <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#C68B59]">
              {PRIMARY_LEADER.title}
            </div>

            {/* Description displayed THIRD */}
            <p className="text-xs sm:text-sm lg:text-base text-[#68716A] leading-relaxed pt-1 max-w-4xl">
              {PRIMARY_LEADER.description}
            </p>
          </div>
        </div>
      </div>

      {/* Balanced Grid for the Remaining Leadership & Advisory Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADVISORY_TEAM.map((member) => (
          <div
            key={member.id}
            className="bg-[#FDFCF8] rounded-2xl p-6 sm:p-7 border border-[#E5DFD3] hover:border-[#C68B59]/40 transition-all flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-3.5">
              {/* Monogram and Badge row */}
              <div className="flex items-center justify-between gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#F4F1EA] border border-[#E5DFD3] flex items-center justify-center text-center">
                  <span className="font-serif font-bold text-sm text-[#5D6D5F] tracking-wide">
                    {member.monogram}
                  </span>
                </div>
                {member.badge && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F4F1EA] border border-[#E5DFD3] text-[#5D6D5F] text-[10px] font-bold uppercase tracking-wider">
                    {member.badge}
                  </span>
                )}
              </div>

              {/* Name displayed FIRST */}
              <div className="space-y-1">
                <h4 className="text-base sm:text-lg font-extrabold text-[#2D332E] tracking-tight">
                  {member.name}
                </h4>

                {/* Designation displayed SECOND */}
                <div className="text-xs font-bold uppercase tracking-wider text-[#C68B59]">
                  {member.title}
                </div>
              </div>

              {/* Description displayed THIRD */}
              <p className="text-xs sm:text-sm text-[#68716A] leading-relaxed pt-1">
                {member.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
