import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { BRAND_CONFIG, LOAN_PRODUCTS } from '../config';
import { api } from '../services/api';

export const ContactPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loanType, setLoanType] = useState('Home Loan');
  const [loanAmount, setLoanAmount] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; applicationId?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobileNumber.trim()) {
      setResult({ error: 'Please provide Name and Mobile Number.' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    const numericAmount = parseFloat(loanAmount.replace(/,/g, '')) || 1000000;

    const res = await api.submitApplication({
      fullName,
      mobileNumber,
      email: email.trim() || undefined,
      loanType,
      requiredLoanAmount: numericAmount,
      city: city.trim() || undefined,
      preferredContactMethod: 'Phone Call',
    });

    setIsSubmitting(false);

    if (res.error) {
      setResult({ error: res.error });
    } else {
      setResult({
        success: true,
        applicationId: res.applicationId,
      });
      setFullName('');
      setMobileNumber('');
      setEmail('');
      setLoanAmount('');
      setMessage('');
    }
  };

  return (
    <div className="w-full bg-[#FDFCF8] py-12 sm:py-16 px-4 lg:px-8 space-y-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F4F1EA] border border-[#C68B59]/30 text-[#C68B59] text-xs font-bold uppercase tracking-wider">
            <Phone className="w-4 h-4 text-[#C68B59]" />
            <span>Direct Sourcing Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2D332E]">
            Contact Capitabee Financial Services
          </h1>
          <p className="text-base text-[#68716A] leading-relaxed">
            Speak directly with our loan officers in Thane or request Pan-India loan assistance for your property and business finance requirements.
          </p>
        </div>

        {/* Contact Information & Form Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Office & Contacts (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-7 border border-[#E5DFD3] shadow-xs space-y-5">
              <h3 className="text-lg font-extrabold text-[#2D332E] border-b border-[#E5DFD3] pb-3">
                Corporate Office
              </h3>

              <div className="space-y-4 text-xs text-[#2D332E]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#F4F1EA] border border-[#E5DFD3] text-[#C68B59] flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold block text-sm">Thane Central Desk</span>
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

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#F4F1EA] border border-[#E5DFD3] text-[#C68B59] flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold block text-sm">Loan Officer Helpline</span>
                    <a
                      href={`tel:${BRAND_CONFIG.contact.phoneRaw}`}
                      className="text-[#2D332E] font-extrabold text-sm hover:underline block mt-0.5"
                    >
                      {BRAND_CONFIG.contact.phone}
                    </a>
                    <span className="text-[11px] text-[#68716A]">Mon - Sat: 9:30 AM - 7:00 PM</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#F4F1EA] border border-[#E5DFD3] text-[#C68B59] flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold block text-sm">Official Email</span>
                    <a
                      href={BRAND_CONFIG.contact.mailto}
                      className="text-[#68716A] hover:text-[#2D332E] block mt-0.5"
                    >
                      {BRAND_CONFIG.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#EBF0EC] border border-[#5D6D5F]/30 text-[#5D6D5F] flex-shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold block text-sm">WhatsApp Assistance</span>
                    <a
                      href={BRAND_CONFIG.contact.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#5D6D5F] font-bold hover:underline block mt-0.5"
                    >
                      Chat with Loan Advisor
                    </a>
                  </div>
                </div>
              </div>

              {/* Instagram link */}
              <div className="pt-3 border-t border-[#E5DFD3]">
                <a
                  href={BRAND_CONFIG.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F4F1EA] border border-[#E5DFD3] hover:border-[#C68B59] text-xs font-bold text-[#2D332E] hover:text-[#C68B59] transition-all flex items-center justify-center gap-2"
                >
                  <Instagram className="w-4 h-4 text-[#C68B59]" />
                  <span>Follow us on Instagram</span>
                </a>
              </div>
            </div>

            {/* Google Map Directions Box */}
            <div className="bg-[#F4F1EA] rounded-3xl p-6 border border-[#E5DFD3] space-y-3">
              <h4 className="font-extrabold text-sm text-[#2D332E] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#5D6D5F]" />
                <span>Visit Our Office</span>
              </h4>
              <p className="text-xs text-[#68716A] leading-relaxed">
                Located near Thane Station in Ganesh Tower, Dada Patil Wadi, Thane West. Conveniently accessible from Central and Western railway corridors.
              </p>
              <a
                href={BRAND_CONFIG.office.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D332E] hover:text-[#C68B59] underline underline-offset-2"
              >
                <span>Get Google Maps Directions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Direct Message / Consultation Request Form (7 cols) */}
          <div className="lg:col-span-7 bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 border border-[#E5DFD3] shadow-lg space-y-5">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#C68B59] bg-[#F4F1EA] px-2.5 py-0.5 rounded-full">
                Consultation Request
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#2D332E] mt-2">
                Send a Message to our Loan Desk
              </h3>
              <p className="text-xs text-[#68716A] mt-1">
                Tell us about your financing requirement and our loan team will reach out with policy details.
              </p>
            </div>

            {result && (
              <div
                className={`p-4 rounded-2xl text-xs ${
                  result.success
                    ? 'bg-[#EBF0EC] border border-[#5D6D5F] text-[#2D332E]'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {result.success ? (
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-[#5D6D5F] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Inquiry Received Successfully</span>
                    </div>
                    <p>
                      Your Application ID is <strong className="font-mono">{result.applicationId}</strong>. A loan officer will call you shortly.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span>{result.error}</span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Enter 10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">Loan Product</label>
                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                  >
                    {LOAN_PRODUCTS.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">Required Amount (₹)</label>
                  <input
                    type="text"
                    placeholder="Enter loan amount in ₹"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">City / State</label>
                  <input
                    type="text"
                    placeholder="Enter city / location"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D332E] mb-1">Your Requirements / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Share details about property type, existing loans, or specific bank preference..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-extrabold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Sending Request...' : 'Send Loan Inquiry'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
