import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Phone,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  LogOut,
  Send,
  Bell,
  RefreshCw,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  MessageSquare,
  History,
  FileCheck,
  AlertTriangle,
  Download,
  ExternalLink,
  Star,
  Quote,
} from 'lucide-react';
import { authService } from '../services/auth';
import { supabaseService } from '../services/supabaseService';
import { CustomerDashboardData, LoanStage, DocumentRecord, LoanApplication, ApplicationTimelineItem, ReviewRecord } from '../types';
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
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isServiceNotConnected, setIsServiceNotConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<'stages' | 'timeline' | 'documents' | 'messages' | 'reviews' | 'profile'>('stages');

  // Customer Reviews State
  const [myReviews, setMyReviews] = useState<ReviewRecord[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewResult, setReviewResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  // Document Upload State
  const [uploadDocType, setUploadDocType] = useState('Income Proof (Salary Slip / ITR)');
  const [uploadCategory, setUploadCategory] = useState<'KYC' | 'Income' | 'Property' | 'Business' | 'Financials' | 'Other'>('Income');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ success?: boolean; text: string } | null>(null);

  // Live Message / Chat State
  const [chatInput, setChatInput] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const fetchCustomerReviews = async (custId?: string, custName?: string) => {
    const targetCustId = custId || dashboardData?.customer.customerId;
    const targetCustName = custName || dashboardData?.customer.fullName;
    if (targetCustId || targetCustName) {
      const reviews = await supabaseService.getCustomerReviews(targetCustId, targetCustName);
      setMyReviews(reviews);
    }
  };

  const fetchDashboard = async (targetAppId?: string, isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    setError(null);
    setIsServiceNotConnected(false);

    if (!authService.isAuthenticated()) {
      setIsLoading(false);
      setIsRefreshing(false);
      onNavigate('/login');
      return;
    }

    const res = await authService.getDashboardData(targetAppId || selectedAppId || undefined);
    setIsLoading(false);
    setIsRefreshing(false);

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
    if (res.applications) {
      setApplications(res.applications);
    }
    if (res.data.application?.id) {
      setSelectedAppId(res.data.application.id);
    }

    fetchCustomerReviews(res.data.customer.customerId, res.data.customer.fullName);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Realtime Supabase Sync Subscription for Application and Reviews
  useEffect(() => {
    if (!selectedAppId) return;

    const unsubscribeApp = supabaseService.subscribeToApplication(selectedAppId, (eventType) => {
      console.log(`[Realtime Sync] Event received: ${eventType} for ${selectedAppId}`);
      // Silently refresh data to reflect CRM changes instantly
      fetchDashboard(selectedAppId, true);
    });

    const unsubscribeReviews = supabaseService.subscribeToReviews(() => {
      fetchCustomerReviews();
    });

    return () => {
      unsubscribeApp();
      unsubscribeReviews();
    };
  }, [selectedAppId]);

  const handleSelectApplication = (appId: string) => {
    setSelectedAppId(appId);
    fetchDashboard(appId);
  };

  const handleLogout = async () => {
    await authService.logout();
    onNavigate('/login');
  };

  const handleCustomerReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !dashboardData) return;

    setIsSubmittingReview(true);
    setReviewResult(null);

    const res = await supabaseService.submitReview({
      customerName: dashboardData.customer.fullName,
      rating: reviewRating,
      reviewText: reviewText.trim(),
      loanType: dashboardData.customer.loanType || dashboardData.application.loanType,
      city: dashboardData.application.city || 'Pan-India',
      customerId: dashboardData.customer.customerId,
      applicationId: dashboardData.application.id,
    });

    setIsSubmittingReview(false);

    if (res.error) {
      setReviewResult({ error: res.error });
    } else {
      setReviewResult({
        success: true,
        message: 'Thank you for your rating & feedback! Your review is pending verification by our quality desk and will appear publicly once approved.',
      });
      setReviewText('');
      fetchCustomerReviews();
    }
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
      category: uploadCategory,
      file: uploadFile,
    });

    setIsUploading(false);

    if (res.error) {
      setUploadMessage({ success: false, text: res.error });
    } else {
      setUploadMessage({ success: true, text: `Document "${uploadFile.name}" successfully uploaded.` });
      setUploadFile(null);
      fetchDashboard(selectedAppId || undefined, true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingMsg || !dashboardData) return;

    setIsSendingMsg(true);
    const msgText = chatInput.trim();
    setChatInput('');

    const res = await authService.sendMessage(msgText, dashboardData.application.id);
    setIsSendingMsg(false);

    if (!res.error) {
      fetchDashboard(selectedAppId || undefined, true);
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
        <p className="text-sm font-bold text-[#2D332E]">Connecting to Supabase Customer Portal...</p>
        <p className="text-xs text-[#68716A]">Synchronizing live loan pipeline records with Capitabee CRM.</p>
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
              CRM Synchronized Portal
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
              <span>Direct CRM Database Integration</span>
            </p>
            <p className="text-[11px] text-[#68716A] leading-relaxed">
              Customer accounts are registered by authorized Capitabee Loan Associates after initial loan application review. If you have applied, our loan underwriting desk will verify your file and issue your secure login credentials directly.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('/login')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-[#2D332E] bg-[#F4F1EA] hover:bg-[#E5DFD3] transition-colors border border-[#E5DFD3] cursor-pointer"
            >
              Back to Login
            </button>
            <button
              onClick={onOpenApplyModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-[#C68B59] hover:bg-[#AA7142] transition-colors shadow-xs cursor-pointer"
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

  const { customer, application, documents, messages, notifications, timeline } = dashboardData;
  const currentStageNum = application.currentStage || customer.currentStage || 1;

  // Build 12 stages merged with DB stages
  const dbStages = application.stages || [];
  const mergedStages: LoanStage[] = TWELVE_STAGE_JOURNEY.map((baseStage) => {
    const fromDb = dbStages.find((s) => s.stageNumber === baseStage.stageNumber);
    if (fromDb) {
      return fromDb;
    }
    // Default status according to currentStageNum
    let defaultStatus: any = 'Pending';
    if (baseStage.stageNumber < currentStageNum) defaultStatus = 'Completed';
    else if (baseStage.stageNumber === currentStageNum) defaultStatus = 'In Progress';

    return {
      stageNumber: baseStage.stageNumber,
      name: baseStage.name,
      description: baseStage.description,
      status: defaultStatus,
    };
  });

  return (
    <div className="w-full bg-[#FDFCF8] py-8 sm:py-12 px-4 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header Card */}
        <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 border border-[#E5DFD3] shadow-xs flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold text-[#5D6D5F] uppercase bg-[#EBF0EC] px-2.5 py-0.5 rounded-full">
                Supabase Authenticated Session
              </span>
              <span className="text-[11px] font-bold text-[#2D332E] bg-[#F4F1EA] px-2.5 py-0.5 rounded-full border border-[#E5DFD3]">
                Customer ID: <strong className="font-mono">{customer.customerId}</strong>
              </span>
              {isRefreshing && (
                <span className="text-[11px] font-bold text-[#C68B59] flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Syncing with CRM...</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2D332E]">
              Welcome, {customer.fullName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#68716A]">
              <span>Active File: <strong className="font-mono text-[#2D332E]">{application.id}</strong></span>
              <span>•</span>
              <span>Loan: <strong className="text-[#2D332E]">{application.loanType}</strong></span>
              <span>•</span>
              <span>Sanction Target: <strong className="text-[#C68B59]">{formatINR(application.requiredLoanAmount)}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchDashboard(selectedAppId || undefined, true)}
              title="Refresh CRM Data"
              className="p-2.5 rounded-xl text-xs font-bold text-[#2D332E] bg-[#F4F1EA] border border-[#E5DFD3] hover:bg-[#E5DFD3] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-[#2D332E] ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onOpenAIAdvisor}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#2D332E] bg-[#F4F1EA] border border-[#C68B59] hover:bg-[#E5DFD3] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C68B59]" />
              <span>AI Advisor</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5 border border-red-200 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Multi-Application Selector (if customer has multiple loans) */}
        {applications.length > 1 && (
          <div className="bg-[#F4F1EA] rounded-2xl p-3 border border-[#E5DFD3] flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#2D332E] flex items-center gap-1.5 mr-2">
              <Layers className="w-4 h-4 text-[#C68B59]" />
              <span>Your Loan Applications:</span>
            </span>
            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => handleSelectApplication(app.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  app.id === selectedAppId
                    ? 'bg-[#2D332E] text-white shadow-xs'
                    : 'bg-[#FDFCF8] text-[#2D332E] border border-[#E5DFD3] hover:bg-[#E5DFD3]'
                }`}
              >
                <span className="font-mono">{app.id}</span> ({app.loanType}) • {app.status}
              </button>
            ))}
          </div>
        )}

        {/* System Notifications if any */}
        {notifications && notifications.length > 0 && (
          <div className="bg-[#F4F1EA] rounded-2xl p-4 border border-[#E5DFD3] space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#2D332E]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#C68B59]" />
                <span>Live Underwriting Alerts & Notifications</span>
              </div>
              <span className="text-[10px] text-[#5D6D5F] font-bold bg-[#EBF0EC] px-2 py-0.5 rounded-full">
                {notifications.length} Updates
              </span>
            </div>
            <div className="space-y-1.5">
              {notifications.map((n) => (
                <div key={n.id} className="text-xs text-[#68716A] bg-[#FDFCF8] p-3 rounded-xl border border-[#E5DFD3] flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#C68B59] mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#2D332E] block">{n.title}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <span className="text-xs leading-relaxed">{n.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#E5DFD3] pb-3">
          <button
            onClick={() => setActiveTab('stages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'stages'
                ? 'bg-[#2D332E] text-white shadow-xs'
                : 'bg-[#F4F1EA] text-[#2D332E] hover:bg-[#E5DFD3]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>12-Stage Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-[#2D332E] text-white shadow-xs'
                : 'bg-[#F4F1EA] text-[#2D332E] hover:bg-[#E5DFD3]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Timeline</span>
            {timeline && timeline.length > 0 && (
              <span className="bg-[#5D6D5F] text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {timeline.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-[#2D332E] text-white shadow-xs'
                : 'bg-[#F4F1EA] text-[#2D332E] hover:bg-[#E5DFD3]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Document Checklist</span>
            {documents && documents.length > 0 && (
              <span className="bg-[#C68B59] text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {documents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'messages'
                ? 'bg-[#2D332E] text-white shadow-xs'
                : 'bg-[#F4F1EA] text-[#2D332E] hover:bg-[#E5DFD3]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Loan Desk Chat</span>
            {messages && messages.length > 0 && (
              <span className="bg-[#5D6D5F] text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {messages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-[#2D332E] text-white shadow-xs'
                : 'bg-[#F4F1EA] text-[#2D332E] hover:bg-[#E5DFD3]'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-[#C68B59]" />
            <span>Feedback & Reviews</span>
            {myReviews.length > 0 && (
              <span className="bg-[#C68B59] text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {myReviews.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#2D332E] text-white shadow-xs'
                : 'bg-[#F4F1EA] text-[#2D332E] hover:bg-[#E5DFD3]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Account Details</span>
          </button>
        </div>

        {/* TAB 1: 12-Stage Real Progress Tracker */}
        {activeTab === 'stages' && (
          <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 border border-[#E5DFD3] shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between border-b border-[#E5DFD3] pb-4 gap-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#2D332E]">
                  12-Stage Underwriting Journey (View-Only)
                </h3>
                <p className="text-xs text-[#68716A] mt-0.5">
                  Current Stage:{' '}
                  <strong className="text-[#C68B59]">
                    Stage {currentStageNum}: {mergedStages[currentStageNum - 1]?.name || 'In Progress'}
                  </strong>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5D6D5F] bg-[#EBF0EC] px-3 py-1 rounded-xl border border-[#5D6D5F]/30">
                  Status: {application.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {mergedStages.map((stg) => {
                const isCompleted = stg.status === 'Completed' || (!stg.status && stg.stageNumber < currentStageNum);
                const isCurrent = stg.status === 'In Progress' || (!stg.status && stg.stageNumber === currentStageNum);
                const isActionRequired = stg.status === 'Action Required';
                const isRejected = stg.status === 'Rejected';

                return (
                  <div
                    key={stg.stageNumber}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all ${
                      isActionRequired
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
                        : isRejected
                        ? 'bg-red-50 border-red-300 ring-2 ring-red-400/40 shadow-xs'
                        : isCurrent
                        ? 'bg-[#F4F1EA] border-[#C68B59] ring-2 ring-[#C68B59]/40 shadow-xs'
                        : isCompleted
                        ? 'bg-[#EBF0EC] border-[#5D6D5F]/50 text-[#2D332E]'
                        : 'bg-[#F4F1EA]/40 border-[#E5DFD3] text-gray-400 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          isActionRequired
                            ? 'bg-amber-600 text-white'
                            : isRejected
                            ? 'bg-red-600 text-white'
                            : isCompleted
                            ? 'bg-[#5D6D5F] text-white'
                            : isCurrent
                            ? 'bg-[#C68B59] text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        STAGE {stg.stageNumber.toString().padStart(2, '0')}
                      </span>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-[#5D6D5F]" />}
                      {isCurrent && <Clock className="w-4 h-4 text-[#C68B59] animate-spin" />}
                      {isActionRequired && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                      {isRejected && <AlertCircle className="w-4 h-4 text-red-600" />}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold leading-tight text-[#2D332E]">{stg.name}</h4>
                      <p className="text-[10px] leading-tight line-clamp-2 mt-1 text-gray-500">{stg.description}</p>
                      {stg.remarks && (
                        <div className="mt-1.5 p-1.5 bg-white/70 rounded-lg text-[10px] text-[#2D332E] border border-black/5">
                          <strong>Note:</strong> {stg.remarks}
                        </div>
                      )}
                      {stg.actionRequiredReason && (
                        <div className="mt-1.5 p-1.5 bg-amber-100 rounded-lg text-[10px] text-amber-900 border border-amber-200">
                          <strong>Action:</strong> {stg.actionRequiredReason}
                        </div>
                      )}
                    </div>

                    <div className="pt-1 text-[9px] font-bold uppercase tracking-wider text-right">
                      <span
                        className={
                          isCompleted
                            ? 'text-[#5D6D5F]'
                            : isCurrent
                            ? 'text-[#C68B59]'
                            : isActionRequired
                            ? 'text-amber-700'
                            : isRejected
                            ? 'text-red-700'
                            : 'text-gray-400'
                        }
                      >
                        {stg.status || (isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Audit Timeline */}
        {activeTab === 'timeline' && (
          <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 border border-[#E5DFD3] shadow-xs space-y-6">
            <div className="border-b border-[#E5DFD3] pb-3">
              <h3 className="text-lg font-extrabold text-[#2D332E]">Application Lifecycle Audit Trail</h3>
              <p className="text-xs text-[#68716A]">Real-time milestone updates logged by Capitabee loan processing officers.</p>
            </div>

            {timeline && timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-start gap-3 p-4 rounded-2xl bg-[#F4F1EA] border border-[#E5DFD3]">
                    <div className="w-8 h-8 rounded-xl bg-[#2D332E] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {item.stage}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#2D332E]">{item.stageName || `Stage ${item.stage}`}</h4>
                        <span className="text-[10px] text-[#68716A]">
                          {new Date(item.updatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-xs text-[#2D332E] leading-relaxed">{item.customerMessage}</p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-[#68716A]">
                        <span>Status: <strong className="text-[#5D6D5F]">{item.newStatus}</strong></span>
                        <span>•</span>
                        <span>Logged By: <strong>{item.updatedBy}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 space-y-2">
                <Clock className="w-8 h-8 text-[#C68B59] mx-auto" />
                <p className="text-xs font-bold text-[#2D332E]">Initial Application Ingested</p>
                <p className="text-xs text-[#68716A]">Application file has been registered. Detailed audit updates will appear as underwriting proceeds.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Documents Checklist & Upload */}
        {activeTab === 'documents' && (
          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* Document Upload Form (5 cols) */}
            <div className="md:col-span-5 bg-[#FDFCF8] rounded-3xl p-6 border border-[#E5DFD3] shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-[#E5DFD3] pb-3">
                <Upload className="w-5 h-5 text-[#C68B59]" />
                <h3 className="text-base font-extrabold text-[#2D332E]">Upload Document to CRM</h3>
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
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:outline-none"
                  >
                    <option value="KYC">KYC (PAN / Aadhaar)</option>
                    <option value="Income">Income (Salary Slips / Form 16 / ITR)</option>
                    <option value="Financials">Financials (Bank Statements / GST)</option>
                    <option value="Property">Property Chain / Title Deeds / OC</option>
                    <option value="Business">Business Registration / MOA / Partnership Deed</option>
                    <option value="Other">Other Lending Documents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">
                    Document Name / Description
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Last 6 Months Bank Statement"
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">
                    Select File (PDF / JPG / PNG - Max 25MB)
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
                  className="w-full py-3 px-4 rounded-xl text-xs font-extrabold text-white bg-[#C68B59] hover:bg-[#AA7142] disabled:bg-gray-300 transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading to Supabase CRM...' : 'Upload Document'}</span>
                </button>
              </form>
            </div>

            {/* Uploaded Documents List (7 cols) */}
            <div className="md:col-span-7 bg-[#FDFCF8] rounded-3xl p-6 border border-[#E5DFD3] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#5D6D5F]" />
                  <h3 className="text-base font-extrabold text-[#2D332E]">Document Records & Verification</h3>
                </div>
                <span className="text-xs font-bold text-[#68716A]">
                  {documents ? documents.length : 0} Files
                </span>
              </div>

              {documents && documents.length > 0 ? (
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 rounded-xl bg-[#F4F1EA] border border-[#E5DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#2D332E]">{doc.documentType}</span>
                          <span className="text-[10px] text-gray-500 bg-white/80 px-1.5 py-0.2 rounded border">
                            {doc.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#68716A] block">
                          {doc.fileName || 'Pending File'} {doc.fileSize ? `(${doc.fileSize})` : ''}
                        </span>
                        {doc.rejectionReason && (
                          <div className="p-1.5 bg-red-100 rounded text-[10px] text-red-700 font-medium mt-1">
                            Rejection Reason: {doc.rejectionReason}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
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

                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-white border border-[#E5DFD3] text-[#2D332E] hover:bg-gray-100"
                            title="Download/View File"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[#68716A] space-y-1">
                  <p>No documents uploaded yet for this application.</p>
                  <p className="text-[11px]">Upload KYC, bank statement, or property papers to initiate verification.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Live Messaging with Loan Officer */}
        {activeTab === 'messages' && (
          <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 border border-[#E5DFD3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#2D332E]">Direct Communication with Loan Processing Desk</h3>
                <p className="text-xs text-[#68716A]">Assigned Officer: {customer.assignedLoanOfficer || 'Capitabee Underwriting Team'}</p>
              </div>
              {customer.associateName && (
                <span className="text-xs font-bold text-[#68716A]">
                  Associate: <strong className="text-[#2D332E]">{customer.associateName}</strong>
                </span>
              )}
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto p-4 bg-[#F4F1EA] rounded-2xl border border-[#E5DFD3]">
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
                <p className="text-xs text-center text-[#68716A] py-6">No messages yet. Send a message below to connect with your loan officer.</p>
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
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#C68B59] hover:bg-[#AA7142] disabled:bg-gray-300 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 5: Reviews & Feedback */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Review Submission Card */}
            <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 border border-[#E5DFD3] shadow-xs space-y-6">
              <div className="border-b border-[#E5DFD3] pb-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#C68B59] fill-[#C68B59]" />
                  <h3 className="text-lg font-extrabold text-[#2D332E]">Rate Your Loan Processing Experience</h3>
                </div>
                <p className="text-xs text-[#68716A] mt-1">
                  Your feedback helps us maintain transparency and continually improve our loan underwriting speed.
                </p>
              </div>

              {reviewResult && (
                <div
                  className={`p-4 rounded-2xl text-xs ${
                    reviewResult.success
                      ? 'bg-[#EBF0EC] border border-[#5D6D5F] text-[#2D332E]'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {reviewResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-[#5D6D5F] flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <span className="font-bold text-sm block">
                        {reviewResult.success ? 'Review Submitted' : 'Submission Error'}
                      </span>
                      <p className="leading-relaxed">{reviewResult.message || reviewResult.error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleCustomerReviewSubmit} className="space-y-4">
                {/* Authenticated Identity Summary */}
                <div className="p-4 rounded-2xl bg-[#F4F1EA] border border-[#E5DFD3] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#68716A]">Reviewer Name</span>
                    <p className="text-xs font-extrabold text-[#2D332E]">{customer.fullName}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#68716A]">Loan Availed</span>
                    <p className="text-xs font-extrabold text-[#2D332E]">{customer.loanType || application.loanType}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#68716A]">Application Reference</span>
                    <p className="text-xs font-mono font-extrabold text-[#C68B59]">{application.id}</p>
                  </div>
                </div>

                {/* Rating Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-2">Overall Experience Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 focus:outline-none transition-transform active:scale-95 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= reviewRating ? 'text-[#C68B59] fill-[#C68B59]' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#2D332E] ml-2">{reviewRating} out of 5 Stars</span>
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-bold text-[#2D332E] mb-1">
                    Your Review & Experience Comments <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share how Capitabee assisted you with your loan sanction, documentation, and disbursement..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FDFCF8] border border-[#E5DFD3] rounded-xl text-[#2D332E] focus:ring-2 focus:ring-[#C68B59] focus:outline-none leading-relaxed resize-none"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !reviewText.trim()}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#C68B59] hover:bg-[#AA7142] disabled:bg-gray-300 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmittingReview ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Customer Submitted Reviews History */}
            <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 border border-[#E5DFD3] shadow-xs space-y-4">
              <div className="border-b border-[#E5DFD3] pb-3 flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-[#2D332E]">My Submitted Reviews</h4>
                <span className="text-xs text-[#68716A]">{myReviews.length} records</span>
              </div>

              {myReviews.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Quote className="w-8 h-8 text-[#C68B59]/40 mx-auto" />
                  <p className="text-xs text-[#68716A]">You haven't submitted any reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-[#F4F1EA] border border-[#E5DFD3] space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating ? 'text-[#C68B59] fill-[#C68B59]' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-extrabold text-[#2D332E]">{rev.loanType}</span>
                        </div>

                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            rev.status === 'Approved'
                              ? 'bg-[#EBF0EC] text-[#5D6D5F] border border-[#5D6D5F]/30'
                              : rev.status === 'Rejected'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {rev.status === 'Approved'
                            ? 'Approved & Live on Website'
                            : rev.status === 'Rejected'
                            ? 'Rejected by Moderator'
                            : 'Pending Verification'}
                        </span>
                      </div>

                      <p className="text-xs text-[#2D332E] italic leading-relaxed">"{rev.reviewText}"</p>

                      <div className="flex items-center justify-between text-[11px] text-[#68716A] pt-1">
                        <span>Submitted on {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {rev.applicationId && (
                          <span className="font-mono">Ref: {rev.applicationId}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: Profile & Account Details */}
        {activeTab === 'profile' && (
          <div className="bg-[#FDFCF8] rounded-3xl p-6 sm:p-8 border border-[#E5DFD3] shadow-xs space-y-6">
            <div className="border-b border-[#E5DFD3] pb-3">
              <h3 className="text-lg font-extrabold text-[#2D332E]">Customer Identity & Loan Ownership</h3>
              <p className="text-xs text-[#68716A]">Verified borrower details registered in Capitabee CRM database.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#F4F1EA] border border-[#E5DFD3] space-y-1">
                <span className="text-[11px] text-[#68716A] uppercase font-bold">Customer ID</span>
                <p className="text-sm font-mono font-extrabold text-[#2D332E]">{customer.customerId}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F1EA] border border-[#E5DFD3] space-y-1">
                <span className="text-[11px] text-[#68716A] uppercase font-bold">Full Name</span>
                <p className="text-sm font-extrabold text-[#2D332E]">{customer.fullName}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F1EA] border border-[#E5DFD3] space-y-1">
                <span className="text-[11px] text-[#68716A] uppercase font-bold">Mobile Number</span>
                <p className="text-sm font-extrabold text-[#2D332E]">{customer.mobileNumber || 'Not Specified'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F1EA] border border-[#E5DFD3] space-y-1">
                <span className="text-[11px] text-[#68716A] uppercase font-bold">Email Address</span>
                <p className="text-sm font-extrabold text-[#2D332E]">{customer.email || 'Not Specified'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F1EA] border border-[#E5DFD3] space-y-1">
                <span className="text-[11px] text-[#68716A] uppercase font-bold">Assigned Associate</span>
                <p className="text-sm font-extrabold text-[#2D332E]">{customer.associateName || 'Direct Capitabee Branch'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F4F1EA] border border-[#E5DFD3] space-y-1">
                <span className="text-[11px] text-[#68716A] uppercase font-bold">Assigned Loan Officer</span>
                <p className="text-sm font-extrabold text-[#2D332E]">{customer.assignedLoanOfficer || 'Capitabee Underwriting Team'}</p>
              </div>
            </div>
          </div>
        )}

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
