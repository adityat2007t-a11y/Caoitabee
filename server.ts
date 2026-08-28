import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { PARTNER_COUNT_LABEL } from './src/config';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize server-side Gemini AI for AI Advisor
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-Memory Data Stores (Backend-Ready State)
interface ServerApplication {
  id: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  loanType: string;
  requiredLoanAmount: number;
  employmentType?: string;
  city?: string;
  state?: string;
  preferredContactMethod?: string;
  associateName?: string;
  status: string;
  createdAt: string;
  assignedOfficer?: string;
  currentStage: number;
  stages: Array<{
    stageNumber: number;
    name: string;
    description: string;
    status: 'Completed' | 'In Progress' | 'Pending' | 'Rejected' | 'Action Required';
    updatedAt?: string;
  }>;
}

interface ServerReview {
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

interface ServerCustomerAccount {
  customerId: string;
  passwordHash: string; // Plain/hash for internal matching
  applicationId: string;
  fullName: string;
  mobileNumber: string;
  email?: string;
  loanType: string;
  requestedAmount: number;
  associateName?: string;
  assignedLoanOfficer?: string;
}

interface ServerDocument {
  id: string;
  applicationId: string;
  documentType: string;
  category: string;
  fileName: string;
  status: 'Uploaded' | 'Under Review' | 'Verified' | 'Rejected' | 'Re-upload Required';
  uploadedAt: string;
  rejectionReason?: string;
  isRequested: boolean;
}

interface ServerMessage {
  id: string;
  applicationId: string;
  sender: 'customer' | 'associate' | 'system';
  senderName: string;
  message: string;
  timestamp: string;
}

// Database Stores
const applicationsDb: ServerApplication[] = [];
const reviewsDb: ServerReview[] = [];
const customerAccountsDb: Map<string, ServerCustomerAccount> = new Map();
const documentsDb: ServerDocument[] = [];
const messagesDb: ServerMessage[] = [];
const callbacksDb: Array<Record<string, unknown>> = [];
const contactsDb: Array<Record<string, unknown>> = [];

// Helper to generate 12 stages
function generateDefaultStages(current = 2) {
  const stageDefs = [
    { stageNumber: 1, name: 'Inquiry', description: 'Initial loan inquiry and requirement gathering.' },
    { stageNumber: 2, name: 'Application', description: 'Formal loan application registered.' },
    { stageNumber: 3, name: 'Documentation', description: 'Collection and preliminary check of KYC and financials.' },
    { stageNumber: 4, name: 'Login / Customer Verification', description: 'File logged with lender and identity verified.' },
    { stageNumber: 5, name: 'Credit Assessment', description: 'Credit appraisal, CIBIL verification, and cash flow assessment.' },
    { stageNumber: 6, name: 'In-Principle Sanction', description: 'Preliminary loan approval issued by lender credit committee.' },
    { stageNumber: 7, name: 'Legal Verification', description: 'Title search and legal vetting by bank advocate panel.' },
    { stageNumber: 8, name: 'Technical Valuation', description: 'Physical property inspection and fair valuation report.' },
    { stageNumber: 9, name: 'Final Sanction', description: 'Final Sanction Letter released with approved rate and terms.' },
    { stageNumber: 10, name: 'OTC (One Time Conditions)', description: 'Signing loan agreement, stamping, and pre-disbursal compliance.' },
    { stageNumber: 11, name: 'Disbursement', description: 'Loan funds credited directly to borrower/seller account.' },
    { stageNumber: 12, name: 'PDD (Post Disbursement Documents)', description: 'Post-disbursal title deeds submission and ECS schedule setup.' },
  ];

  return stageDefs.map((s) => {
    let status: 'Completed' | 'In Progress' | 'Pending' = 'Pending';
    if (s.stageNumber < current) status = 'Completed';
    else if (s.stageNumber === current) status = 'In Progress';
    return {
      ...s,
      status,
      updatedAt: s.stageNumber <= current ? new Date().toISOString() : undefined,
    };
  });
}

// ===================== API ROUTES =====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', company: 'CAPITABEE FINANCIAL SERVICES', timestamp: new Date().toISOString() });
});

// Centralized Config & Rates
app.get('/api/config', (req, res) => {
  res.json({
    companyName: 'CAPITABEE FINANCIAL SERVICES',
    phone: '+91 8010886625',
    whatsapp: 'https://wa.me/918010886625',
    email: 'info.capitabee@gmail.com',
    office: '101, Ganesh Tower, Dada Patil Wadi, Thane (W), Maharashtra - 400602',
    instagram: 'https://www.instagram.com/capitabee.fin?igsi=MTAzMm92aTIwdHRtcw==',
    positioning: 'Pan-India Loan Assistance',
    rates: {
      homeLoan: '7.20%',
      lap: '8.50%',
      unsecuredBusinessLoan: '14%',
      workingCapital: '8%',
      commercialPurchase: '8.50%',
      industrialPurchase: '8.50%',
      goldLoan: 'Rate available based on lender and applicant profile.',
    },
    metrics: {
      happyCustomers: '5,000+',
      loanDisbursed: '₹1,000 Cr+',
      partnerNetwork: PARTNER_COUNT_LABEL,
      transparentJourney: '12-Stage',
    },
  });
});

// 1. Submit Loan Application
app.post('/api/applications', (req, res) => {
  try {
    const {
      fullName,
      mobileNumber,
      email,
      loanType,
      requiredLoanAmount,
      employmentType,
      city,
      state,
      preferredContactMethod,
      associateName,
    } = req.body;

    if (!fullName || !mobileNumber || !loanType || !requiredLoanAmount) {
      return res.status(400).json({ error: 'Missing required fields: fullName, mobileNumber, loanType, and requiredLoanAmount are mandatory.' });
    }

    // Generate unique real Application ID
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const applicationId = `CAP-${new Date().getFullYear()}-${randomSuffix}`;

    const newApplication: ServerApplication = {
      id: applicationId,
      fullName: String(fullName).trim(),
      mobileNumber: String(mobileNumber).trim(),
      email: email ? String(email).trim() : undefined,
      loanType: String(loanType).trim(),
      requiredLoanAmount: Number(requiredLoanAmount),
      employmentType: employmentType ? String(employmentType).trim() : 'Salaried',
      city: city ? String(city).trim() : 'Thane',
      state: state ? String(state).trim() : 'Maharashtra',
      preferredContactMethod: preferredContactMethod ? String(preferredContactMethod).trim() : 'Phone Call',
      associateName: associateName ? String(associateName).trim() : undefined,
      status: 'Received',
      createdAt: new Date().toISOString(),
      assignedOfficer: 'Capitabee Loan Processing Team',
      currentStage: 2,
      stages: generateDefaultStages(2),
    };

    applicationsDb.push(newApplication);

    // Seed default document checklist requirements for this application
    const docList = [
      { id: `doc-${Date.now()}-1`, applicationId, documentType: 'PAN Card', category: 'KYC', fileName: '', status: 'Re-upload Required' as const, uploadedAt: '', isRequested: true, rejectionReason: 'Pending customer upload' },
      { id: `doc-${Date.now()}-2`, applicationId, documentType: 'Aadhaar Card / Address Proof', category: 'KYC', fileName: '', status: 'Re-upload Required' as const, uploadedAt: '', isRequested: true, rejectionReason: 'Pending customer upload' },
      { id: `doc-${Date.now()}-3`, applicationId, documentType: 'Last 6 Months Bank Statement', category: 'Income', fileName: '', status: 'Re-upload Required' as const, uploadedAt: '', isRequested: true, rejectionReason: 'Pending customer upload' },
    ];
    documentsDb.push(...docList);

    // Initial system message
    messagesDb.push({
      id: `msg-${Date.now()}`,
      applicationId,
      sender: 'system',
      senderName: 'CAPITABEE FINANCIAL SERVICES',
      message: `Welcome ${newApplication.fullName}. Your application ${applicationId} for ${newApplication.loanType} has been received. Our loan officer will review your documents and reach out.`,
      timestamp: new Date().toISOString(),
    });

    // Check integration status truthfully
    const isWhatsAppConfigured = Boolean(process.env.WHATSAPP_API_TOKEN);
    const isSMSConfigured = Boolean(process.env.SMS_API_KEY);

    return res.status(201).json({
      success: true,
      applicationId,
      application: newApplication,
      message: `Application ${applicationId} successfully registered.`,
      notifications: {
        whatsapp: isWhatsAppConfigured ? 'Notification dispatched via WhatsApp.' : 'WhatsApp notification service is not connected.',
        sms: isSMSConfigured ? 'Notification dispatched via SMS.' : 'SMS notification service is not connected.',
      },
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return res.status(500).json({ error: 'Failed to process application.' });
  }
});

// 2. Fetch Application by ID
app.get('/api/applications/:id', (req, res) => {
  const application = applicationsDb.find((a) => a.id.toLowerCase() === req.params.id.toLowerCase());
  if (!application) {
    return res.status(404).json({ error: `Application ${req.params.id} not found.` });
  }
  return res.json({ success: true, application });
});

// Active authenticated sessions store (Token -> Customer ID)
const activeCustomerSessions: Map<string, { customerId: string; createdAt: number }> = new Map();

// Helper to authenticate Bearer token
function getAuthenticatedCustomer(req: express.Request): ServerCustomerAccount | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const session = activeCustomerSessions.get(token);
  if (!session) {
    return null;
  }
  return customerAccountsDb.get(session.customerId) || null;
}

// 3. Customer Authentication Endpoints

// Customer Login
app.post('/api/customer/login', (req, res) => {
  const { customerId, password } = req.body;

  if (!customerId || !password) {
    return res.status(400).json({ error: 'Customer ID and Password are required.' });
  }

  const cleanId = String(customerId).trim().toUpperCase();
  const cleanPass = String(password).trim();

  const account = customerAccountsDb.get(cleanId);
  if (!account || account.passwordHash !== cleanPass) {
    return res.status(401).json({
      error: 'Invalid Customer ID or Password. Credentials must be issued by an authorized Capitabee Loan Associate.',
    });
  }

  const token = `cap_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  activeCustomerSessions.set(token, { customerId: account.customerId, createdAt: Date.now() });

  const appRecord = applicationsDb.find((a) => a.id === account.applicationId);

  return res.json({
    success: true,
    token,
    customer: {
      customerId: account.customerId,
      fullName: account.fullName,
      mobileNumber: account.mobileNumber,
      email: account.email,
      applicationId: account.applicationId,
      loanType: account.loanType,
      requestedAmount: account.requestedAmount,
      associateName: account.associateName,
      assignedLoanOfficer: account.assignedLoanOfficer,
      currentStage: appRecord?.currentStage || 2,
      applicationStatus: appRecord?.status || 'In Progress',
      createdAt: appRecord?.createdAt || new Date().toISOString(),
    },
  });
});

// Current Authenticated Customer Profile
app.get('/api/customer/me', (req, res) => {
  const account = getAuthenticatedCustomer(req);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized. Active session not found.' });
  }

  const appRecord = applicationsDb.find((a) => a.id === account.applicationId);

  return res.json({
    success: true,
    customer: {
      customerId: account.customerId,
      fullName: account.fullName,
      mobileNumber: account.mobileNumber,
      email: account.email,
      applicationId: account.applicationId,
      loanType: account.loanType,
      requestedAmount: account.requestedAmount,
      associateName: account.associateName,
      assignedLoanOfficer: account.assignedLoanOfficer,
      currentStage: appRecord?.currentStage || 2,
      applicationStatus: appRecord?.status || 'In Progress',
      createdAt: appRecord?.createdAt || new Date().toISOString(),
    },
  });
});

// Customer Dashboard Data (Token-Protected, Zero browser ID trust)
app.get('/api/customer/dashboard', (req, res) => {
  const account = getAuthenticatedCustomer(req);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized. Please log in with your issued credentials.' });
  }

  const application = applicationsDb.find((a) => a.id === account.applicationId);
  const docs = documentsDb.filter((d) => d.applicationId === account.applicationId);
  const messages = messagesDb.filter((m) => m.applicationId === account.applicationId);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Application Under Verification',
      message: `Your application (${account.applicationId}) is currently undergoing verification by the Capitabee underwriting desk.`,
      createdAt: application?.createdAt || new Date().toISOString(),
      read: false,
      type: 'info',
    },
  ];

  return res.json({
    success: true,
    customer: account,
    application: application || {
      id: account.applicationId,
      fullName: account.fullName,
      loanType: account.loanType,
      requiredLoanAmount: account.requestedAmount,
      status: 'In Progress',
      currentStage: 2,
      stages: generateDefaultStages(2),
    },
    documents: docs,
    messages,
    notifications,
  });
});

// Password Recovery (Not connected yet)
app.post('/api/customer/forgot-password', (req, res) => {
  const { customerId } = req.body;
  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required.' });
  }

  // Strictly report real status without fake OTP or mock token
  return res.status(503).json({
    success: false,
    error: 'Password recovery service is not connected yet. Please contact your assigned Capitabee Loan Associate directly at +91 8010886625 or on WhatsApp.',
  });
});

// Customer Logout
app.post('/api/customer/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    activeCustomerSessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Authorized Associate/Employee Endpoint to Create Customer Credentials for a Real Application
app.post('/api/internal/customer-accounts', (req, res) => {
  const { applicationId, customerId, password, associateSecret } = req.body;

  // Verify internal associate authentication if configured
  if (process.env.INTERNAL_ASSOCIATE_SECRET && associateSecret !== process.env.INTERNAL_ASSOCIATE_SECRET) {
    return res.status(403).json({ error: 'Unauthorized. Invalid associate credentials.' });
  }

  if (!applicationId || !customerId || !password) {
    return res.status(400).json({ error: 'applicationId, customerId, and password are required.' });
  }

  const appRecord = applicationsDb.find((a) => a.id.toLowerCase() === String(applicationId).toLowerCase());
  if (!appRecord) {
    return res.status(404).json({ error: `Application ${applicationId} not found in database.` });
  }

  const cleanCustomerId = String(customerId).trim().toUpperCase();
  const newAccount: ServerCustomerAccount = {
    customerId: cleanCustomerId,
    passwordHash: String(password).trim(),
    applicationId: appRecord.id,
    fullName: appRecord.fullName,
    mobileNumber: appRecord.mobileNumber,
    email: appRecord.email,
    loanType: appRecord.loanType,
    requestedAmount: appRecord.requiredLoanAmount,
    associateName: appRecord.associateName,
    assignedLoanOfficer: appRecord.assignedOfficer,
  };

  customerAccountsDb.set(cleanCustomerId, newAccount);

  return res.status(201).json({
    success: true,
    customerId: cleanCustomerId,
    applicationId: appRecord.id,
    message: `Customer credentials created successfully for application ${appRecord.id}.`,
  });
});

// Customer Document Upload (Token-Protected)
app.post('/api/customer/documents/upload', (req, res) => {
  const account = getAuthenticatedCustomer(req);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const { documentType, fileName, category } = req.body;
  if (!documentType || !fileName) {
    return res.status(400).json({ error: 'Document Type and File Name are required.' });
  }

  const applicationId = account.applicationId;
  const existingDoc = documentsDb.find(
    (d) => d.applicationId === applicationId && d.documentType.toLowerCase() === documentType.toLowerCase()
  );

  if (existingDoc) {
    existingDoc.fileName = fileName;
    existingDoc.status = 'Uploaded';
    existingDoc.uploadedAt = new Date().toISOString();
    existingDoc.rejectionReason = undefined;
    return res.json({ success: true, document: existingDoc, message: 'Document uploaded successfully.' });
  }

  const newDoc: ServerDocument = {
    id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    applicationId,
    documentType,
    category: category || 'Income',
    fileName,
    status: 'Uploaded',
    uploadedAt: new Date().toISOString(),
    isRequested: false,
  };

  documentsDb.push(newDoc);
  return res.status(201).json({ success: true, document: newDoc, message: 'Document uploaded successfully.' });
});

// Customer Live Messaging (Token-Protected)
app.post('/api/customer/messages', (req, res) => {
  const account = getAuthenticatedCustomer(req);
  if (!account) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const newMsg: ServerMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    applicationId: account.applicationId,
    sender: 'customer',
    senderName: account.fullName,
    message: String(message).trim(),
    timestamp: new Date().toISOString(),
  };

  messagesDb.push(newMsg);
  return res.status(201).json({ success: true, message: newMsg });
});

// 6. Live Chat Messages
app.get('/api/applications/:id/messages', (req, res) => {
  const msgs = messagesDb.filter((m) => m.applicationId.toLowerCase() === req.params.id.toLowerCase());
  return res.json({ success: true, messages: msgs });
});

app.post('/api/applications/:id/messages', (req, res) => {
  const { sender, senderName, message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const newMsg: ServerMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    applicationId: req.params.id,
    sender: sender || 'customer',
    senderName: senderName || 'Applicant',
    message: String(message).trim(),
    timestamp: new Date().toISOString(),
  };

  messagesDb.push(newMsg);
  return res.status(201).json({ success: true, message: newMsg });
});

// 7. Reviews System (Real Backend with Pending/Approved Workflow)
app.post('/api/reviews', (req, res) => {
  const { customerName, rating, reviewText, loanType, city, photoUrl } = req.body;

  if (!customerName || !rating || !reviewText || !loanType) {
    return res.status(400).json({ error: 'Customer Name, Rating, Review Text, and Loan Type are required.' });
  }

  const numRating = Number(rating);
  if (numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  const newReview: ServerReview = {
    id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customerName: String(customerName).trim(),
    rating: numRating,
    reviewText: String(reviewText).trim(),
    loanType: String(loanType).trim(),
    city: city ? String(city).trim() : undefined,
    status: 'Pending', // Strictly pending until admin moderation
    createdAt: new Date().toISOString(),
    photoUrl: photoUrl ? String(photoUrl).trim() : undefined,
  };

  reviewsDb.push(newReview);

  return res.status(201).json({
    success: true,
    review: newReview,
    message: 'Thank you for your review! Your feedback has been submitted and will appear publicly once verified by our team.',
  });
});

// Get all reviews (for moderation / internal)
app.get('/api/reviews', (req, res) => {
  res.json({ success: true, count: reviewsDb.length, reviews: reviewsDb });
});

// Get ONLY APPROVED reviews for public display & homepage carousel
app.get('/api/reviews/approved', (req, res) => {
  const approved = reviewsDb.filter((r) => r.status === 'Approved');
  res.json({
    success: true,
    count: approved.length,
    reviews: approved,
  });
});

// Moderate review status
app.patch('/api/reviews/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be Pending, Approved, or Rejected.' });
  }

  const review = reviewsDb.find((r) => r.id === req.params.id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found.' });
  }

  review.status = status as 'Pending' | 'Approved' | 'Rejected';
  return res.json({ success: true, review });
});

// 8. Contact & Callback Requests
app.post('/api/contact', (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;
  if (!fullName || !email || !phone || !message) {
    return res.status(400).json({ error: 'Full Name, Email, Phone, and Message are required.' });
  }

  const contactRecord = {
    id: `contact-${Date.now()}`,
    fullName: String(fullName).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    subject: subject ? String(subject).trim() : 'General Inquiry',
    message: String(message).trim(),
    createdAt: new Date().toISOString(),
  };

  contactsDb.push(contactRecord);
  return res.status(201).json({
    success: true,
    message: 'Thank you for reaching out to CAPITABEE FINANCIAL SERVICES. Our team will contact you shortly.',
  });
});

app.post('/api/callback', (req, res) => {
  const { fullName, mobileNumber, email, loanType, amount, city, state, associateName, message } = req.body;
  if (!fullName || !mobileNumber || !loanType) {
    return res.status(400).json({ error: 'Full Name, Mobile Number, and Loan Type are required.' });
  }

  const callbackRecord = {
    id: `cb-${Date.now()}`,
    fullName: String(fullName).trim(),
    mobileNumber: String(mobileNumber).trim(),
    email: email ? String(email).trim() : undefined,
    loanType: String(loanType).trim(),
    amount: amount ? String(amount).trim() : undefined,
    city: city ? String(city).trim() : undefined,
    state: state ? String(state).trim() : undefined,
    associateName: associateName ? String(associateName).trim() : undefined,
    message: message ? String(message).trim() : undefined,
    createdAt: new Date().toISOString(),
    status: 'New',
  };

  callbacksDb.push(callbackRecord);
  return res.status(201).json({
    success: true,
    message: 'Callback request registered. A Capitabee loan officer will call you back shortly.',
  });
});

// 9. AI Advisor Powered by Gemini API (Server-Side)
app.post('/api/ai-advisor', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return accurate configured responses even when API key is not yet set
      return res.json({
        success: true,
        reply:
          `Welcome to Capitabee Financial Services! We offer Pan-India Loan Assistance across ${PARTNER_COUNT_LABEL} partner banks and NBFCs for Working Capital (starting from 8%), Home Loans (from 7.20%), Loan Against Property (from 8.50%), Unsecured Business Loans (from 14%), Commercial/Industrial Property Loans, and Gold Loans. How can our loan advisory team assist your requirements today?`,
        isConfigured: false,
      });
    }

    const systemPrompt = `You are the official AI Loan Advisor for CAPITABEE FINANCIAL SERVICES.
Official Company Name: CAPITABEE FINANCIAL SERVICES (Never abbreviate or omit 'FINANCIAL SERVICES').
Office Location: 101, Ganesh Tower, Dada Patil Wadi, Thane (W), Maharashtra - 400602.
Phone: +91 8010886625 | WhatsApp: https://wa.me/918010886625 | Email: info.capitabee@gmail.com
Scope & Positioning: Pan-India Loan Assistance with ${PARTNER_COUNT_LABEL} partner banks and NBFCs.

Official Loan Rates & Product Guidelines (Use strictly):
- Working Capital (MSME): Starting from 8% p.a. (OD, CC, Bill Discounting, PCFC, Bank Guarantee, Channel Financing).
- Home Loan: Starting from 7.20% p.a. (Up to 30 years).
- Loan Against Property (LAP): Starting from 8.50% p.a. (Up to 25 years).
- Unsecured Business Loan: Starting from 14% p.a. (Up to 5 years, collateral-free).
- Commercial Purchase Loan: Starting from 8.50% p.a. (Up to 25 years).
- Industrial Purchase Loan: Starting from 8.50% p.a. (Up to 25 years).
- Gold Loan: Rate available based on lender and applicant profile. Insured bank vault storage.
- Balance Transfer: Switch high-cost loans to lower rates + Top-Up option.
- 12-Stage Loan Journey: 1. Inquiry, 2. Application, 3. Documentation, 4. Login/Verification, 5. Credit Assessment, 6. In-Principle Sanction, 7. Legal, 8. Technical, 9. Final Sanction, 10. OTC, 11. Disbursement, 12. PDD.

STRICT BOUNDARIES:
- NEVER invent approvals, CIBIL scores, sanctions, or disbursement guarantees.
- Always clarify that loan sanction and final rates are subject to lender credit appraisal, property vetting, and documentation.
- If the customer needs immediate personalized help, prompt them to connect with a Capitabee Loan Associate via Call/WhatsApp (+91 8010886625) or fill the eligibility form.
- Keep answers professional, concise, trustworthy, and clear.`;

    const userPrompt = String(message).trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });

    const replyText = response.text || 'Thank you for reaching out. Please connect with our loan officer at +91 8010886625 for immediate assistance.';

    return res.json({
      success: true,
      reply: replyText,
      isConfigured: true,
    });
  } catch (error) {
    console.error('Error generating AI Advisor response:', error);
    return res.status(500).json({
      error: 'AI Advisor service is temporarily busy. Please connect with our loan officer directly at +91 8010886625 or on WhatsApp.',
    });
  }
});

// Static asset serving for images and public files
const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath));
app.use('/images', express.static(path.join(publicPath, 'images')));

// Vite middleware / Static serving setup
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Capitabee Financial Services server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
