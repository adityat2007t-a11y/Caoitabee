import React from 'react';
import { CheckCircle2, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { TWELVE_STAGE_JOURNEY } from '../config';

interface TwelveStageJourneyProps {
  onNavigateToApply?: () => void;
}

export const TwelveStageJourneySection: React.FC<TwelveStageJourneyProps> = ({ onNavigateToApply }) => {
  return (
    <section className="w-full bg-[#F4F1EA] py-16 px-4 lg:px-8 border-b border-[#E5DFD3]" id="12-stage-journey">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-[#5D6D5F] bg-[#EBF0EC] px-3.5 py-1 rounded-full border border-[#5D6D5F]/30">
            End-to-End Transparency
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D332E]">
            Our 12-Stage Transparent Loan Journey
          </h2>
          <p className="text-sm sm:text-base text-[#68716A] leading-relaxed">
            From your very first consultation to fund credit and post-disbursal documentation, every loan file is tracked systematically through our structured 12-stage lifecycle.
          </p>
        </div>

        {/* 12-Stage Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {TWELVE_STAGE_JOURNEY.map((stage) => (
            <div
              key={stage.stageNumber}
              className="bg-[#FDFCF8] rounded-2xl p-5 border border-[#E5DFD3] hover:border-[#C68B59] hover:shadow-xs transition-all flex flex-col justify-between space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-[#5D6D5F] text-[#FDFCF8] font-extrabold text-xs flex items-center justify-center shadow-xs">
                  {stage.stageNumber.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] font-bold text-[#68716A] uppercase tracking-wider bg-[#F4F1EA] px-2 py-0.5 rounded border border-[#E5DFD3]">
                  Stage {stage.stageNumber}
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-sm font-extrabold text-[#2D332E] group-hover:text-[#C68B59] transition-colors leading-snug">
                  {stage.name}
                </h3>
                <p className="text-xs text-[#68716A] leading-relaxed">
                  {stage.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E5DFD3] flex items-center gap-1 text-[11px] text-[#5D6D5F] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Milestones</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tracking CTA Banner */}
        <div className="bg-[#FDFCF8] rounded-2xl p-6 border border-[#E5DFD3] text-center max-w-2xl mx-auto space-y-3">
          <h4 className="text-lg font-extrabold text-[#2D332E]">
            Already Applied? Track Your Stages in Customer Dashboard
          </h4>
          <p className="text-xs text-[#68716A]">
            Log in with your associate-generated credentials to view real-time stage progress, upload requested documents, and message your loan desk.
          </p>
        </div>
      </div>
    </section>
  );
};
