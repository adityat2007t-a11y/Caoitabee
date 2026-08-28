export interface LoanProduct {
  id: string;
  slug: string;
  name: string;
  category: 'Retail' | 'Commercial' | 'MSME' | 'Specialized';
  startingRate?: string;
  maxTenure?: string;
  tagline: string;
  description: string;
  keyHighlights: string[];
  subProducts?: string[];
  eligibility: string[];
  typicalDocuments: {
    salaried?: string[];
    selfEmployed?: string[];
    common: string[];
  };
  benefits: string[];
  iconName: string;
}

export interface PartnerEntity {
  name: string;
  type: 'Bank' | 'NBFC';
  category: string;
  shortName?: string;
  featured?: boolean;
}

export type LoanStageStatus = 'Completed' | 'In Progress' | 'Pending' | 'Rejected' | 'Action Required';

export type ApplicationStatus =
  | 'Inquiry'
  | 'Application'
  | 'Application Submitted'
  | 'Documentation Pending'
  | 'Documents Under Review'
  | 'Credit Assessment'
  | 'In-Principle Sanction'
  | 'Legal'
  | 'Technical'
  | 'Final Sanction'
  | 'OTC'
  | 'Disbursement'
  | 'PDD'
  | 'Completed'
  | 'Rejected'
  | 'Action Required'
  | 'Received'
  | 'In Progress'
  | 'Sanctioned'
  | 'Disbursed';

export interface LoanStage {
  stageNumber: number;
  name: string;
  description: string;
  status: LoanStageStatus;
  updatedAt?: string;
  remarks?: string;
  actionRequiredReason?: string;
}

export interface ApplicationTimelineItem {
  id: string;
  applicationId: string;
  stage: number | string;
  stageName?: string;
  previousStatus?: string;
  newStatus: string;
  updatedBy: string;
  updatedAt: string;
  customerMessage: string;
  internalNote?: string; // STRICTLY EXCLUDED in customer-facing endpoints
}

export interface LoanApplication {
  id: string; // Unique backend-generated Application ID e.g. CAP-2026-XXXXX
  customerId?: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  loanType: string;
  requiredLoanAmount: number;
  employmentType?: 'Salaried' | 'Self-Employed' | 'Business Owner' | 'Professional' | 'Other';
  city?: string;
  state?: string;
  preferredContactMethod?: 'Phone Call' | 'WhatsApp' | 'Email';
  associateId?: string;
  associateName?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  assignedAt?: string;
  assignedBy?: string;
  status: ApplicationStatus;
  currentStage: number;
  createdAt: string;
  updatedAt?: string;
  assignedOfficer?: string;
  stages: LoanStage[];
  notes?: string;
}

export interface CustomerUser {
  customerId: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  applicationId: string;
  loanType: string;
  requestedAmount: number;
  associateName?: string;
  associateId?: string;
  assignedEmployeeId?: string;
  assignedEmployeeName?: string;
  assignedAt?: string;
  assignedLoanOfficer?: string;
  currentStage: number;
  applicationStatus: ApplicationStatus;
  createdAt: string;
}

export interface AuthCredentials {
  customerId: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  customer?: CustomerUser;
  error?: string;
  message?: string;
}

export interface CustomerDashboardData {
  customer: CustomerUser;
  application: LoanApplication;
  documents: DocumentRecord[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  timeline?: ApplicationTimelineItem[];
  unreadNotificationsCount?: number;
  unreadMessagesCount?: number;
}

export type DocumentStatus =
  | 'Requested'
  | 'Pending Upload'
  | 'Uploaded'
  | 'Under Review'
  | 'Verified'
  | 'Rejected'
  | 'Re-upload Required';

export interface DocumentRecord {
  id: string;
  applicationId: string;
  documentType: string;
  category: 'KYC' | 'Income' | 'Property' | 'Business' | 'Financials' | 'Other';
  fileName: string;
  fileSize?: string;
  fileUrl?: string;
  status: DocumentStatus;
  uploadedAt?: string;
  requestedAt?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  isRequested: boolean;
  instructions?: string;
}

export interface ReviewRecord {
  id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  loanType: string;
  city?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  photoUrl?: string;
}

export interface AppNotification {
  id: string;
  customerId?: string;
  applicationId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export interface ChatMessage {
  id: string;
  applicationId?: string;
  sender: 'customer' | 'associate' | 'system';
  senderName: string;
  message: string;
  read?: boolean;
  timestamp: string;
}

export interface CallbackRequest {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  loanType: string;
  amount?: string;
  city?: string;
  state?: string;
  associateName?: string;
  message?: string;
  createdAt: string;
  status: 'New' | 'Contacted' | 'Closed';
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
}

export type ApplicationEventType =
  | 'APPLICATION_STAGE_UPDATED'
  | 'DOCUMENT_REQUESTED'
  | 'DOCUMENT_REJECTED'
  | 'APPLICATION_STATUS_UPDATED';

export interface ApplicationEvent {
  type: ApplicationEventType;
  applicationId: string;
  customerId?: string;
  customerMobile: string;
  customerName: string;
  details: {
    stageNumber?: number;
    stageName?: string;
    documentType?: string;
    documentCategory?: string;
    rejectionReason?: string;
    previousStatus?: string;
    newStatus?: string;
    message?: string;
    actionRequired?: string;
  };
  timestamp: string;
}

export interface AssociateStageUpdatePayload {
  stageNumber: number;
  stageStatus: LoanStageStatus;
  applicationStatus?: ApplicationStatus;
  customerMessage: string;
  internalNote?: string;
  updatedBy: string;
}

export interface AssociateDocumentRequestPayload {
  documentType: string;
  category: 'KYC' | 'Income' | 'Property' | 'Business' | 'Financials' | 'Other';
  instructions?: string;
  requestedBy: string;
}

export interface AssociateDocumentStatusPayload {
  status: 'Verified' | 'Rejected';
  rejectionReason?: string;
  updatedBy: string;
}

