import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config';
import { api } from '../services/api';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToApply?: (loanType?: string) => void;
}

const QUICK_QUESTIONS = [
  'Which loan is best for me?',
  'What documents do I need as a salaried person?',
  'What documents do I need as a businessman?',
  'What is the Home Loan starting rate?',
  'What is Loan Against Property (LAP)?',
  'What is Working Capital (OD / CC)?',
  'What is Bill Discounting & PCFC?',
  'What is Bank Guarantee?',
  'What is Gold Loan assistance?',
  'How does the 12-stage process work?',
  'Can I do a Balance Transfer with Top-Up?',
];

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  isOpen,
  onClose,
  onNavigateToApply,
}) => {
  const [messages, setMessages] = useState<
    Array<{ sender: 'ai' | 'user'; text: string; time: string }>
  >([
    {
      sender: 'ai',
      text: `Namaste! I am the official AI Loan Advisor for CAPITABEE FINANCIAL SERVICES. How can I assist with your loan requirements across our ${BRAND_CONFIG.metrics.partnerNetwork} partner bank and NBFC network today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    const res = await api.askAIAdvisor(query);

    setIsLoading(false);
    setMessages((prev) => [
      ...prev,
      {
        sender: 'ai',
        text: res.reply || 'Our loan advisor is reviewing your request. Please connect with our desk directly at +91 8010886625.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FDFCF8] rounded-3xl w-full max-w-2xl h-[90vh] max-h-[700px] border border-[#E5DFD3] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#5D6D5F] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#4E5C50]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C68B59] flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base leading-tight text-white">Capitabee AI Advisor</h3>
                <span className="text-[10px] bg-[#C68B59] text-white px-2 py-0.5 rounded-full font-bold">
                  Pan-India Sourcing
                </span>
              </div>
              <p className="text-xs text-[#F4F1EA]/80 mt-0.5">
                Official Advisory Desk • {BRAND_CONFIG.metrics.partnerNetwork} Partner Network
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close AI Advisor modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-[#F4F1EA] p-3 border-b border-[#E5DFD3] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#FDFCF8] text-[#2D332E] border border-[#E5DFD3] hover:border-[#C68B59] hover:bg-[#F4F1EA] transition-all flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#FDFCF8]">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-[#5D6D5F] text-[#FDFCF8] flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1">
                  CB
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#C68B59] text-white rounded-tr-xs shadow-2xs'
                    : 'bg-[#F4F1EA]/70 text-[#2D332E] border border-[#E5DFD3] rounded-tl-xs shadow-2xs'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                <span
                  className={`text-[10px] block mt-1.5 text-right ${
                    m.sender === 'user' ? 'text-white/80' : 'text-[#8C968E]'
                  }`}
                >
                  {m.time}
                </span>
              </div>

              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-[#F4F1EA] text-[#2D332E] border border-[#E5DFD3] flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-[#68716A] italic">
              <span className="w-2 h-2 rounded-full bg-[#C68B59] animate-ping"></span>
              <span>Capitabee AI is consulting policy rates...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Human Handoff Bar */}
        <div className="bg-[#F4F1EA] px-4 py-2.5 border-t border-[#E5DFD3] flex flex-wrap items-center justify-between gap-2 text-xs text-[#2D332E]">
          <span className="font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5D6D5F]" />
            Need human loan officer?
          </span>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${BRAND_CONFIG.contact.phoneRaw}`}
              className="px-2.5 py-1 rounded-lg bg-[#FDFCF8] border border-[#E5DFD3] hover:border-[#C68B59] text-[11px] font-bold text-[#2D332E] flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-[#C68B59]" />
              <span>Call +91 8010886625</span>
            </a>

            <a
              href={BRAND_CONFIG.contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-[#5D6D5F] text-white text-[11px] font-bold flex items-center gap-1"
            >
              <MessageSquare className="w-3 h-3" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-[#FDFCF8] border-t border-[#E5DFD3]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about Home Loan, LAP, Working Capital, Documents..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C68B59] text-[#2D332E]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="p-2.5 rounded-xl bg-[#C68B59] text-white hover:bg-[#AA7142] disabled:bg-gray-300 transition-colors shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
