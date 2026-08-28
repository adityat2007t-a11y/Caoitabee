import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Lock,
  Phone,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  LogOut,
  Send,
  Bell,
  RefreshCw,
  Info,
} from 'lucide-react';
import { authService } from '../services/auth';
import { CustomerDashboardData, LoanStage, DocumentRecord } from '../types';
import { BRAND_CONFIG, TWELVE_STAGE_JOURNEY } from '../config';

interface CustomerDashboardPageProps {
  onNavigate: (path: string) => void;
  onOpenAIAdvisor: () => void;
  onOpenApplyModal: () => void;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  onNavigate,
  onOpenAIAdvisor,
  onOpenApplyModal,
}) => {
  const [dashboardData, setDashboardData] = useState<CustomerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isServiceNotConnected, setIsServiceNotConnected] = useState(false);

  // Document Upload State
  const [uploadDocType, setUploadDocType] = useState('Income Proof');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ success?: boolean; text: string } | null>(null);

  // Live Message / Chat State
  const [chatInput, setChatInput] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError(null);
    setIsServiceNotConnected(false);

    if (!authService.isAuthenticated()) {
      setIsLoading(false);
      onNavigate('/login');
      return;
    }

    const res = await authService.getDashboardData();
    setIsLoading(false);

    if (res.isNotConnected) {
      setIsServiceNotConnected(true);
      setError(res.error || 'Customer authentication service is not connected yet.');
      return;
    }

    if (!res.success || !res.data) {
      if (res.error?.includes('session has expired') || res.error?.includes('Not authenticated')) {
        onNavigate('/login');
        return;
      }
      setError(res.error || 'Customer record could not be loaded.');
      return;
    }

    setDashboardData(res.data);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    onNavigate('/login');
  };

  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !dashboardData) return;

    setIsUploading(true);
    setUploadMessage(null);

    const res = await authService.uploadDocument({
      applicationId: dashboardData.application.id,
      documentType: uploadDocType,
      fileName: uploadFile.name,
      category: 'Income',
    });

    setIsUploading(false);

    if (res.error) {
      setUploadMessage({ success: false, text: res.error });
    } else {
      setUploadMessage({ success: true, text: `Document "${uploadFile.name}" successfully uploaded.` });
      setUploadFile(null);
      // Refresh real dashboard records
      fetchDashboard();
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingMsg) return;

    setIsSendingMsg(true);
    const msgText = chatInput.trim();
    setChatInput('');

    const res = await authService.sendMessage(msgText);
    setIsSendingMsg(false);

    if (!res.error) {
      fetchDashboard();
    }
  };

  const formatINR = (val?: number) => {
    if (!val) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-[#FDFCF8] p-8 space-y-4">
        <RefreshCw className="w-8 h-8 text-[#C68B59] animate-spin" />
        <p className="text-sm font-bold text-[#2D332E]">Verifying Customer Session...</p>
        <p className="text-xs text-[#68716A]">Connecting securely to Capitabee underwriting backend.</p>
      </div>
    );
  }

  // Not Connected or Error State
  if (isServiceNotConnected || (!dashboardData && error)) {
    return (
      <div className="w-full bg-[#FDFCF8] py-16 px-4 lg:px-8">
        <div className="max-w-xl mx-auto bg-[#FDFCF8] rounded-3xl p-8 border border-[#E5DFD3] shadow-md text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F4F1EA] border border-[#E5DFD3] flex items-center justify-center text-[#C68B59]">
            <Info className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5D6D5F] bg-[#EBF0EC] px-2.5 py-1 rounded-full">
              System Integration Notice
            </span>
            <h2 className="text-xl font-extrabold text-[#2D332E]">
              {isServiceNotConnected ? 'Customer Authentication Service Not Connected' : 'Unable to Access Customer Dashboard'}
            </h2>
            <p className="text-xs text-[#68716A] leading-relaxed">
              {error || 'Customer authentication service is not connected yet.'}
            </p>
          </div>

          <div className="bg-[#F4F1EA] rounded-2xl p-4 text-left border border-[#E5DFD3] space-y-2 text-xs text-[#2D332E]">
            <p className="font-bold flex items-center gap-1.5 text-[#5D6D5F]">
              <ShieldCheck className="w-4 h-4" />
              <span>Real Customer Portal Integration</span>
            </p>
            <p className="text-[11px] text-[#68716A] leading-relaxed">
              Customer accounts are registered by authorized Capitabee Loan Associates after initial loan application review. If you have already applied, our loan underwriting desk will verify your file and issue your secure login credentials directly.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('/login')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-[#2D332E] bg-[#F4F1EA] hover:bg-[#E5DFD3] transition-colors border border-[#E5DFD3]"
            >
              Back to Login
            </button>
            <button
              onClick={onOpenApplyModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-colors shadow-xs"
            >
              Submit New Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { customer, application, documents, messages, notifications } = dashboardData;
  const currentStageNum = customer.currentStage || application.currentStage || 1;

  return (
    <div className="w-full bg-[#FDFCF8] py-10 sm:py-14 px-4 lg:px-8 space-y-10">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
        
        {/* Top Header Card */}
        <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 border border-[#E5DFD3] shadow-xs flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold text-[#5D6D5F] uppercase bg-[#EBF0EC] px-2.5 py-0.5 rounded-full">
                Authenticated Customer Session
              </span>
              <span className="text-[11px] font-bold text-[#2D332E] bg-[#F4F1EA] px-2.5 py-0.5 rounded-full border border-[#E5DFD3]">
                Customer ID: <strong className="font-mono">{customer.customerId}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D332E]">
              Welcome, {customer.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#68716A]">
              <span>Application ID: <strong className="font-mono text-[#2D332E]">{customer.applicationId || application.id}</strong></span>
              <span>•</span>
              <span>Loan: <strong className="text-[#2D332E]">{customer.loanType || application.loanType}</strong></span>
              <span>•</span>
              <span>Requested Amount: <strong className="text-[#C68B59]">{formatINR(customer.requestedAmount || application.requiredLoanAmount)}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenAIAdvisor}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#2D332E] bg-[#F4F1EA] border border-[#C68B59] hover:bg-[#E5DFD3] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" />
              <span>AI Advisor</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5 border border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* System Notifications if any */}
        {notifications && notifications.length > 0 && (
          <div className="bg-[#F4F1EA] rounded-2xl p-4 border border-[#E5DFD3] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2D332E]">
              <Bell className="w-4 h-4 text-[#C68B59]" />
              <span>Application Updates & Notifications</span>
            </div>
            <div className="space-y-1.5">
              {notifications.map((n) => (
                <div key={n.id} className="text-xs text-[#68716A] bg-[#FDFCF8] p-2.5 rounded-xl border border-[#E5DFD3] flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C68B59] mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-[#2D332E] block">{n.title}</span>
                    <span>{n.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 12-Stage Real Progress Tracker */}
        <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 border border-[#E5DFD3] shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-[#E5DFD3] pb-4 gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-[#2D332E]">
                12-Stage Loan Lifecycle Journey
              </h3>
              <p className="text-xs text-[#68716A] mt-0.5">
                Current Active Stage:{' '}
                <strong className="text-[#C68B59]">
                  Stage {currentStageNum}: {TWELVE_STAGE_JOURNEY[currentStageNum - 1]?.name || 'In Progress'}
                </strong>
              </p>
            </div>
            <span className="text-xs font-bold text-[#5D6D5F] bg-[#EBF0EC] px-3 py-1 rounded-xl border border-[#5D6D5F]/30">
              Status: {customer.applicationStatus || application.status || 'Under Review'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {TWELVE_STAGE_JOURNEY.map((stg) => {
              const isCompleted = stg.stageNumber < currentStageNum;
              const isCurrent = stg.stageNumber === currentStageNum;

              return (
                <div
                  key={stg.stageNumber}
                  className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2 transition-all ${
                    isCurrent
                      ? 'bg-[#F4F1EA] border-[#C68B59] ring-2 ring-[#C68B59]/40 shadow-xs'
                      : isCompleted
                      ? 'bg-[#EBF0EC] border-[#5D6D5F]/50 text-[#2D332E]'
                      : 'bg-[#F4F1EA]/40 border-[#E5DFD3] text-gray-400 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-[#5D6D5F] text-white'
                          : isCurrent
                          ? 'bg-[#C68B59] text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {stg.stageNumber.toString().padStart(2, '0')}
                    </span>
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-[#5D6D5F]" />}
                    {isCurrent && <Clock className="w-3.5 h-3.5 text-[#C68B59] animate-spin" />}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold leading-tight">{stg.name}</h4>
                    <p className="text-[10px] leading-tight line-clamp-2 mt-0.5 text-gray-500">{stg.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Documents & File Records */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Document Upload Form (6 cols) */}
          <div className="md:col-span-6 bg-[#FDFCF8] rounded-3xl p-6 border border-[#E5DFD3] shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E5DFD3] pb-3">
              <Upload className="w-5 h-5 text-[#C68B59]" />
              <h3 className="text-base font-extrabold text-[#2D332E]">Upload Required Documents</h3>
            </div>

            {uploadMessage && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  uploadMessage.success
                    ? 'bg-[#EBF0EC] border border-[#5D6D5F] text-[#2D332E]'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {uploadMessage.success ? (
                  <CheckCircle2 className="w-4 h-4 text-[#5D6D5F] flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{uploadMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleDocUpload} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#2D332E] mb-1">
                  Document Category
                </label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:outline-none"
                >
                  <option value="KYC (PAN & Aadhaar)">KYC (PAN & Aadhaar)</option>
                  <option value="Salary Slips (Last 3-6 Months)">Salary Slips (Last 3-6 Months)</option>
                  <option value="Bank Statements (6-12 Months)">Bank Statements (6-12 Months)</option>
                  <option value="ITR & Computation (2-3 Years)">ITR & Computation (2-3 Years)</option>
                  <option value="Property Chain / Title Deeds">Property Chain / Title Deeds</option>
                  <option value="GST 3B Returns">GST 3B Returns</option>
                  <option value="Sanction Letters of Existing Loans">Sanction Letters of Existing Loans</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D332E] mb-1">
                  Select File (PDF / Image)
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-[#68716A] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2D332E] file:text-white hover:file:bg-[#3D453E] cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={!uploadFile || isUploading}
                className="w-full py-3 px-4 rounded-xl text-xs font-extrabold text-white bg-[#C68B59] hover:bg-[#AA7142] disabled:bg-gray-300 transition-colors shadow-2xs flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Uploading to Application...' : 'Upload Document'}</span>
              </button>
            </form>
          </div>

          {/* Uploaded Documents List (6 cols) */}
          <div className="md:col-span-6 bg-[#FDFCF8] rounded-3xl p-6 border border-[#E5DFD3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#5D6D5F]" />
                <h3 className="text-base font-extrabold text-[#2D332E]">Document Records</h3>
              </div>
              <span className="text-xs font-bold text-[#68716A]">
                {documents ? documents.length : 0} Files
              </span>
            </div>

            {documents && documents.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-[#F4F1EA] border border-[#E5DFD3] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#2D332E] block">{doc.documentType}</span>
                      <span className="text-[11px] text-[#68716A]">{doc.fileName || 'Pending upload'}</span>
                      {doc.rejectionReason && (
                        <span className="text-[10px] text-red-600 block mt-0.5">{doc.rejectionReason}</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        doc.status === 'Verified'
                          ? 'text-[#5D6D5F] bg-[#EBF0EC] border-[#5D6D5F]/30'
                          : doc.status === 'Uploaded'
                          ? 'text-blue-700 bg-blue-50 border-blue-200'
                          : doc.status === 'Rejected'
                          ? 'text-red-700 bg-red-50 border-red-200'
                          : 'text-amber-800 bg-amber-50 border-amber-200'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-[#68716A] space-y-1">
                <p>No documents uploaded yet.</p>
                <p className="text-[11px]">Upload KYC, bank statement, or property papers to initiate verification.</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Messaging with Loan Officer */}
        <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 border border-[#E5DFD3] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
            <div>
              <h3 className="text-base font-extrabold text-[#2D332E]">Direct Communication with Loan Desk</h3>
              <p className="text-xs text-[#68716A]">Assigned Officer: {customer.assignedLoanOfficer || 'Capitabee Underwriting Team'}</p>
            </div>
            {customer.associateName && (
              <span className="text-xs font-bold text-[#68716A]">
                Associate: <strong className="text-[#2D332E]">{customer.associateName}</strong>
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto p-3 bg-[#F4F1EA] rounded-2xl border border-[#E5DFD3]">
            {messages && messages.length > 0 ? (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl max-w-lg text-xs ${
                    m.sender === 'customer'
                      ? 'ml-auto bg-[#2D332E] text-white'
                      : 'mr-auto bg-[#FDFCF8] text-[#2D332E] border border-[#E5DFD3]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1">
                    <span className="font-bold">{m.senderName}</span>
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="leading-relaxed">{m.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-center text-[#68716A] py-4">No messages yet. Send a message below to connect with your loan officer.</p>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Type your question or update for the loan officer..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSendingMsg || !chatInput.trim()}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#C68B59] hover:bg-[#AA7142] disabled:bg-gray-300 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Assigned Loan Officer Contact Card */}
        <div className="bg-[#F4F1EA] rounded-3xl p-6 border border-[#E5DFD3] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold text-[#C68B59] uppercase">Direct Loan Assistance</span>
            <h4 className="font-extrabold text-sm text-[#2D332E]">Capitabee Financial Services Desk</h4>
            <p className="text-xs text-[#68716A]">Call or WhatsApp for immediate sanction condition guidance.</p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${BRAND_CONFIG.contact.phoneRaw}`}
              className="px-4 py-2.5 rounded-xl bg-[#2D332E] text-white text-xs font-bold hover:bg-[#3D453E] transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#C68B59]" />
              <span>{BRAND_CONFIG.contact.phone}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
