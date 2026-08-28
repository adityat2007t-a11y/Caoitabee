import React, { useState, useMemo } from 'react';
import { Calculator, RotateCcw, ArrowRight, PieChart, ChevronDown, ChevronUp } from 'lucide-react';

interface EMICalculatorProps {
  onNavigateToApply?: (loanType?: string) => void;
}

export const EMICalculatorSection: React.FC<EMICalculatorProps> = ({ onNavigateToApply }) => {
  const [loanAmount, setLoanAmount] = useState<number>(5000000); // 50 Lakhs
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5%
  const [tenureYears, setTenureYears] = useState<number>(20); // 20 years
  const [showAmortization, setShowAmortization] = useState(false);

  // EMI Math Calculation
  const { monthlyEMI, totalInterest, totalPayment, principalPercent, interestPercent, amortizationSchedule } =
    useMemo(() => {
      const p = Math.max(10000, loanAmount || 0);
      const annualRate = Math.max(1, interestRate || 1);
      const r = annualRate / 12 / 100;
      const n = Math.max(1, tenureYears * 12);

      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPay = emi * n;
      const totalInt = totalPay - p;

      const pPercent = Math.round((p / totalPay) * 100);
      const iPercent = 100 - pPercent;

      // Generate Year-wise Amortization
      const schedule = [];
      let balance = p;
      for (let y = 1; y <= tenureYears; y++) {
        let yearlyInterest = 0;
        let yearlyPrincipal = 0;

        for (let m = 1; m <= 12; m++) {
          const interestForMonth = balance * r;
          const principalForMonth = emi - interestForMonth;
          yearlyInterest += interestForMonth;
          yearlyPrincipal += principalForMonth;
          balance -= principalForMonth;
          if (balance < 0) balance = 0;
        }

        schedule.push({
          year: y,
          principalPaid: Math.round(yearlyPrincipal),
          interestPaid: Math.round(yearlyInterest),
          totalPaid: Math.round(yearlyPrincipal + yearlyInterest),
          remainingBalance: Math.round(balance),
        });
      }

      return {
        monthlyEMI: Math.round(emi),
        totalInterest: Math.round(totalInt),
        totalPayment: Math.round(totalPay),
        principalPercent: pPercent,
        interestPercent: iPercent,
        amortizationSchedule: schedule,
      };
    }, [loanAmount, interestRate, tenureYears]);

  const handleReset = () => {
    setLoanAmount(5000000);
    setInterestRate(8.5);
    setTenureYears(20);
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section className="w-full bg-[#F4F1EA] py-16 px-4 lg:px-8 border-b border-[#E5DFD3]" id="emi-calculator">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-[#5D6D5F] bg-[#EBF0EC] px-3.5 py-1 rounded-full border border-[#5D6D5F]/30">
            Financial Planning Tool
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D332E]">
            Interactive Loan EMI Calculator
          </h2>
          <p className="text-sm sm:text-base text-[#68716A] leading-relaxed">
            Estimate your monthly loan installments, total interest outgo, and complete year-wise repayment schedule with precise mathematical accuracy.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 lg:p-10 border border-[#E5DFD3] shadow-sm grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Loan Amount Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2D332E] uppercase tracking-wider">
                  Loan Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#68716A]">₹</span>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    min={100000}
                    max={200000000}
                    step={50000}
                    className="w-44 pl-7 pr-3 py-1.5 text-right font-extrabold text-sm text-[#2D332E] bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C68B59]"
                  />
                </div>
              </div>
              <input
                type="range"
                min={500000}
                max={50000000}
                step={100000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 bg-[#E5DFD3] rounded-lg appearance-none cursor-pointer accent-[#C68B59]"
              />
              <div className="flex justify-between text-[11px] text-[#8C968E] font-medium">
                <span>₹5 Lakh</span>
                <span>₹2.5 Cr</span>
                <span>₹5 Cr+</span>
              </div>
            </div>

            {/* Interest Rate Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2D332E] uppercase tracking-wider">
                  Interest Rate (% p.a.)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    min={5}
                    max={24}
                    step={0.05}
                    className="w-28 px-3 py-1.5 text-right font-extrabold text-sm text-[#2D332E] bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C68B59]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#68716A] pointer-events-none">%</span>
                </div>
              </div>
              <input
                type="range"
                min={7.0}
                max={18.0}
                step={0.1}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-[#E5DFD3] rounded-lg appearance-none cursor-pointer accent-[#C68B59]"
              />
              <div className="flex justify-between text-[11px] text-[#8C968E] font-medium">
                <span>7.20% (Home Loan)</span>
                <span>8.50% (LAP)</span>
                <span>14.0% (Business)</span>
              </div>
            </div>

            {/* Loan Tenure Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2D332E] uppercase tracking-wider">
                  Loan Tenure (Years)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Number(e.target.value))}
                    min={1}
                    max={30}
                    step={1}
                    className="w-20 px-3 py-1.5 text-center font-extrabold text-sm text-[#2D332E] bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C68B59]"
                  />
                  <span className="text-xs font-semibold text-[#68716A]">Years ({tenureYears * 12} Mos)</span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full h-2 bg-[#E5DFD3] rounded-lg appearance-none cursor-pointer accent-[#C68B59]"
              />
              <div className="flex justify-between text-[11px] text-[#8C968E] font-medium">
                <span>1 Year</span>
                <span>15 Years</span>
                <span>30 Years</span>
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-[#68716A] hover:text-[#2D332E] flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <span className="text-[11px] text-[#8C968E] italic">
                Mathematical Amortization Method
              </span>
            </div>
          </div>

          {/* Results Column (5 cols) */}
          <div className="lg:col-span-5 bg-[#F4F1EA] rounded-2xl p-6 border border-[#E5DFD3] flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#68716A] block mb-1">
                Calculated Monthly Payment
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#2D332E]">
                {formatINR(monthlyEMI)}
                <span className="text-xs font-semibold text-[#68716A] ml-1">/ month</span>
              </div>
            </div>

            {/* Breakdown Bars */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-xs font-bold text-[#2D332E]">
                <span>Principal Amount</span>
                <span>{formatINR(loanAmount)}</span>
              </div>

              <div className="flex justify-between text-xs font-bold text-[#C68B59]">
                <span>Total Interest Payable</span>
                <span>{formatINR(totalInterest)}</span>
              </div>

              <div className="pt-2 border-t border-[#E5DFD3] flex justify-between text-sm font-extrabold text-[#2D332E]">
                <span>Total Payable (P + I)</span>
                <span>{formatINR(totalPayment)}</span>
              </div>

              {/* Visual Proportion Bar */}
              <div className="w-full h-3 rounded-full bg-[#E5DFD3] overflow-hidden flex mt-2">
                <div
                  style={{ width: `${principalPercent}%` }}
                  className="bg-[#5D6D5F] h-full"
                  title={`Principal: ${principalPercent}%`}
                />
                <div
                  style={{ width: `${interestPercent}%` }}
                  className="bg-[#C68B59] h-full"
                  title={`Interest: ${interestPercent}%`}
                />
              </div>

              <div className="flex justify-between text-[10px] text-[#68716A] font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#5D6D5F]"></span>
                  Principal ({principalPercent}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#C68B59]"></span>
                  Interest ({interestPercent}%)
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('apply-card');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else if (onNavigateToApply) onNavigateToApply();
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Apply for this Loan Amount</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#2D332E] bg-[#FDFCF8] border border-[#E5DFD3] hover:bg-[#F4F1EA] transition-all flex items-center justify-center gap-1.5"
              >
                <span>{showAmortization ? 'Hide Year-wise Schedule' : 'View Year-wise Schedule'}</span>
                {showAmortization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Amortization Table Accordion */}
        {showAmortization && (
          <div className="bg-[#FDFCF8] rounded-2xl p-6 border border-[#E5DFD3] shadow-xs overflow-x-auto animate-in fade-in duration-200">
            <h3 className="text-base font-extrabold text-[#2D332E] mb-4">
              Year-wise Amortization Breakdown ({tenureYears} Years)
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F1EA] border-b border-[#E5DFD3] text-[#2D332E] font-bold">
                  <th className="py-2.5 px-3">Year</th>
                  <th className="py-2.5 px-3">Principal (₹)</th>
                  <th className="py-2.5 px-3">Interest (₹)</th>
                  <th className="py-2.5 px-3">Total Payment (₹)</th>
                  <th className="py-2.5 px-3">Ending Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD3] text-[#68716A]">
                {amortizationSchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-[#F4F1EA]/50">
                    <td className="py-2 px-3 font-bold text-[#2D332E]">Year {row.year}</td>
                    <td className="py-2 px-3">{formatINR(row.principalPaid)}</td>
                    <td className="py-2 px-3 text-[#C68B59] font-semibold">{formatINR(row.interestPaid)}</td>
                    <td className="py-2 px-3 font-bold text-[#2D332E]">{formatINR(row.totalPaid)}</td>
                    <td className="py-2 px-3">{formatINR(row.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
