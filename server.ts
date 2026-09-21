import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { PARTNER_COUNT_LABEL } from './src/config';
import {
  getSupabaseServer,
  customerLogin,
  getAuthenticatedCustomer,
  getCustomerDashboard,
} from './server/supabase';

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

// Fallback in-memory stores for public non-critical widgets when database is initializing
const fallbackReviews: Array<any> = [];
const fallbackCallbacks: Array<any> = [];
const fallbackContacts: Array<any> = [];

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
      partnerNetwork: PARTNER_COUNT_LABEL,
      loanProductsCount: '17 Products',
      transparentJourney: '12-Stage',
      homeLoanStartingRate: '7.20%',
    },
  });
});

// 1. Submit Loan Application (Website -> production API -> Supabase -> CRM)
app.post('/api/applications', async (req, res) => {
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
      associateId,
      notes,
    } = req.body;

    if (!fullName || !mobileNumber || !loanType || !requiredLoanAmount) {
      return res.status(400).json({ error: 'Missing required fields: fullName, mobileNumber, loanType, and requiredLoanAmount are mandatory.' });
    }

    const supabase = getSupabaseServer();
    if (supabase) {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('submit_public_loan_application', {
        p_full_name: String(fullName).trim(),
        p_mobile_number: String(mobileNumber).trim(),
        p_email: email ? String(email).trim() : null,
        p_loan_type: String(loanType).trim(),
        p_required_loan_amount: Number(requiredLoanAmount),
        p_employment_type: employmentType ? String(employmentType).trim() : 'Salaried',
        p_city: city ? String(city).trim() : 'Thane',
        p_state: state ? String(state).trim() : 'Maharashtra',
        p_preferred_contact_method: preferredContactMethod ? String(preferredContactMethod).trim() : 'Phone Call',
        p_associate_name: associateName ? String(associateName).trim() : null,
        p_associate_id: associateId || null,
        p_notes: notes ? String(notes).trim() : null,
      });

      if (!rpcErr && rpcData) {
        const applicationId = rpcData.application_id;
        const customerId = rpcData.customer_id;

        return res.status(201).json({
          success: true,
          applicationId,
          customerId,
          application: rpcData,
          message: `Application ${applicationId} successfully registered with Capitabee Financial Services.`,
          notifications: {
            whatsapp: 'Notification logged with loan processing desk.',
            sms: 'Notification logged with loan processing desk.',
          },
        });
      }
    }

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const applicationId = `CAP-${new Date().getFullYear()}-${randomSuffix}`;
    return res.status(201).json({
      success: true,
      applicationId,
      message: `Application ${applicationId} registered. Our loan advisory team will connect with you shortly.`,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return res.status(500).json({ error: 'Failed to process application.' });
  }
});

// 2. Fetch Application by ID from Supabase
app.get('/api/applications/:id', async (req, res) => {
  const cleanId = String(req.params.id || '').trim();
  const supabase = getSupabaseServer();
  if (supabase) {
    const { data: appData, error: appErr } = await supabase
      .from('applications')
      .select('*')
      .ilike('id', cleanId)
      .maybeSingle();

    if (appData) {
      const { data: stages } = await supabase
        .from('application_stages')
        .select('*')
        .eq('application_id', appData.id)
        .order('stage_number', { ascending: true });

      return res.json({
        success: true,
        application: {
          ...appData,
          stages: stages || [],
        },
      });
    }
  }

  return res.status(404).json({ error: `Application ${cleanId} not found.` });
});

// 3. Customer Authentication Endpoints (Strict Supabase Auth with Customer ID + Password)

// Customer Login
app.post('/api/customer/login', async (req, res) => {
  const { customerId, password } = req.body;

  if (!customerId || !password) {
    return res.status(400).json({ error: 'Customer ID and Password are required.' });
  }

  const cleanId = String(customerId).trim();
  const cleanPass = String(password).trim();

  const result = await customerLogin(cleanId, cleanPass);
  return res.status(result.status).json(result.data);
});

// Current Authenticated Customer Profile
app.get('/api/customer/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : '';
  const session = await getAuthenticatedCustomer(token);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Active session not found.' });
  }

  const customer = session.customer;
  const supabase = getSupabaseServer();

  const { data: apps } = await supabase!
    .from('applications')
    .select('*')
    .eq('customer_id', customer.customer_id)
    .order('created_at', { ascending: false });

  const primaryApp = apps && apps.length > 0 ? apps[0] : null;

  return res.json({
    success: true,
    customer: {
      customerId: customer.customer_id,
      fullName: customer.full_name,
      mobileNumber: customer.mobile_number,
      email: customer.email || '',
      applicationId: primaryApp?.id || '',
      loanType: primaryApp?.loan_type || 'Loan Assistance',
      requestedAmount: primaryApp ? Number(primaryApp.required_loan_amount) : 0,
      associateName: primaryApp?.associate_name,
      assignedLoanOfficer: primaryApp?.assigned_officer || 'Capitabee Loan Processing Desk',
      currentStage: primaryApp?.current_stage || 1,
      applicationStatus: primaryApp?.status || 'Received',
      createdAt: customer.created_at || new Date().toISOString(),
    },
  });
});

// Customer Dashboard Data (Token-Protected, Zero browser ID trust)
app.get(['/api/customer/dashboard', '/api/customer/dashboard/:customerId'], async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : '';
  const session = await getAuthenticatedCustomer(token);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Please log in with your issued credentials.' });
  }

  const customer = session.customer;
  if (req.params.customerId && req.params.customerId.toUpperCase() !== customer.customer_id.toUpperCase()) {
    return res.status(403).json({ error: 'Unauthorized access to customer records.' });
  }

  const selectedAppId = req.query.appId as string | undefined;
  const dashboard = await getCustomerDashboard(customer, selectedAppId);

  if (!dashboard) {
    return res.status(500).json({ error: 'Failed to retrieve dashboard data.' });
  }

  return res.json({
    success: true,
    ...dashboard,
  });
});

// Password Recovery (Controlled by CRM)
app.post('/api/customer/forgot-password', async (req, res) => {
  const { customerId } = req.body;
  if (!customerId) {
    return res.status(400).json({ error: 'Customer ID is required.' });
  }

  const cleanId = String(customerId).trim().toUpperCase();
  const supabase = getSupabaseServer();

  if (supabase) {
    const { data: customer } = await supabase
      .from('customers')
      .select('customer_id, full_name, mobile_number')
      .ilike('customer_id', cleanId)
      .maybeSingle();

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'Customer ID not found in Capitabee database. Please verify your Customer ID or contact your loan associate at +91 8010886625.',
      });
    }
  }

  return res.json({
    success: true,
    message: 'Password reset and credential re-issuance is managed securely by your authorized Capitabee Loan Associate or Loan Desk. Please connect at +91 8010886625 or on WhatsApp.',
  });
});

// Customer Logout
app.post('/api/customer/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// Customer Document Upload (Token-Protected)
app.post('/api/customer/documents/upload', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : '';
  const session = await getAuthenticatedCustomer(token);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const { applicationId, documentType, fileName, category, fileUrl } = req.body;
  if (!documentType || !fileName) {
    return res.status(400).json({ error: 'Document Type and File Name are required.' });
  }

  const customer = session.customer;
  const supabase = getSupabaseServer();
  if (!supabase) {
    return res.status(503).json({ error: 'Database service unavailable.' });
  }

  // Verify application belongs to this customer (applications.customer_id = customers.customer_id)
  let targetAppId = applicationId;
  if (!targetAppId) {
    const { data: firstApp } = await supabase
      .from('applications')
      .select('id')
      .eq('customer_id', customer.customer_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    targetAppId = firstApp?.id;
  }

  if (!targetAppId) {
    return res.status(400).json({ error: 'Application ID is required.' });
  }

  const { data: verifiedApp } = await supabase
    .from('applications')
    .select('id')
    .eq('id', targetAppId)
    .eq('customer_id', customer.customer_id)
    .maybeSingle();

  if (!verifiedApp) {
    return res.status(403).json({ error: 'Unauthorized. Application does not belong to your account.' });
  }

  const { data: docRecord, error: docErr } = await supabase
    .from('documents')
    .insert({
      application_id: targetAppId,
      document_type: documentType,
      category: category || 'Income',
      file_name: fileName,
      file_url: fileUrl || null,
      status: 'Uploaded',
      uploaded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (docErr) {
    return res.status(500).json({ error: 'Failed to record document upload in database.' });
  }

  return res.status(201).json({ success: true, document: docRecord, message: 'Document uploaded successfully.' });
});

// Customer Live Messaging (Token-Protected)
app.post('/api/customer/messages', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '').trim() : '';
  const session = await getAuthenticatedCustomer(token);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const { applicationId, message } = req.body;
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const customer = session.customer;
  const supabase = getSupabaseServer();
  if (!supabase) {
    return res.status(503).json({ error: 'Database service unavailable.' });
  }

  let targetAppId = applicationId;
  if (!targetAppId) {
    const { data: firstApp } = await supabase
      .from('applications')
      .select('id')
      .eq('customer_id', customer.customer_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    targetAppId = firstApp?.id;
  }

  if (!targetAppId) {
    return res.status(400).json({ error: 'Application ID is required.' });
  }

  const { data: verifiedApp } = await supabase
    .from('applications')
    .select('id')
    .eq('id', targetAppId)
    .eq('customer_id', customer.customer_id)
    .maybeSingle();

  if (!verifiedApp) {
    return res.status(403).json({ error: 'Unauthorized. Application does not belong to your account.' });
  }

  const { data: newMsg, error: msgErr } = await supabase
    .from('messages')
    .insert({
      application_id: targetAppId,
      sender: 'customer',
      sender_name: customer.full_name,
      message: String(message).trim(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (msgErr) {
    return res.status(500).json({ error: 'Failed to send message.' });
  }

  return res.status(201).json({ success: true, message: newMsg });
});

// 6. Application Messages
app.get('/api/applications/:id/messages', async (req, res) => {
  const cleanId = String(req.params.id || '').trim();
  const supabase = getSupabaseServer();
  if (supabase) {
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('application_id', cleanId)
      .order('created_at', { ascending: true });
    return res.json({ success: true, messages: msgs || [] });
  }
  return res.json({ success: true, messages: [] });
});

app.post('/api/applications/:id/messages', async (req, res) => {
  const { sender, senderName, message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  const cleanId = String(req.params.id || '').trim();
  const supabase = getSupabaseServer();
  if (supabase) {
    const { data: newMsg, error } = await supabase
      .from('messages')
      .insert({
        application_id: cleanId,
        sender: sender || 'customer',
        sender_name: senderName || 'Applicant',
        message: String(message).trim(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && newMsg) {
      return res.status(201).json({ success: true, message: newMsg });
    }
  }

  return res.status(201).json({
    success: true,
    message: {
      id: `msg-${Date.now()}`,
      applicationId: cleanId,
      sender: sender || 'customer',
      senderName: senderName || 'Applicant',
      message: String(message).trim(),
      timestamp: new Date().toISOString(),
    },
  });
});

// 7. Reviews System (Supabase Backend with Pending/Approved Workflow)
app.post('/api/reviews', async (req, res) => {
  const { customerName, rating, reviewText, loanType, city, photoUrl } = req.body;

  if (!customerName || !rating || !reviewText || !loanType) {
    return res.status(400).json({ error: 'Customer Name, Rating, Review Text, and Loan Type are required.' });
  }

  const numRating = Number(rating);
  if (numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  const supabase = getSupabaseServer();
  if (supabase) {
    const { data: rev, error } = await supabase
      .from('reviews')
      .insert({
        customer_name: String(customerName).trim(),
        rating: numRating,
        review_text: String(reviewText).trim(),
        loan_type: String(loanType).trim(),
        city: city ? String(city).trim() : null,
        photo_url: photoUrl ? String(photoUrl).trim() : null,
        status: 'Pending',
      })
      .select()
      .single();

    if (!error && rev) {
      return res.status(201).json({
        success: true,
        review: rev,
        message: 'Thank you for your review! Your feedback has been submitted and will appear publicly once verified by our team.',
      });
    }
  }

  const fallback = {
    id: `rev-${Date.now()}`,
    customerName: String(customerName).trim(),
    rating: numRating,
    reviewText: String(reviewText).trim(),
    loanType: String(loanType).trim(),
    city: city ? String(city).trim() : undefined,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  fallbackReviews.push(fallback);

  return res.status(201).json({
    success: true,
    review: fallback,
    message: 'Thank you for your review! Your feedback has been submitted and will appear publicly once verified by our team.',
  });
});

// Get all reviews
app.get('/api/reviews', async (req, res) => {
  const supabase = getSupabaseServer();
  if (supabase) {
    const { data: revs } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    return res.json({ success: true, count: revs?.length || 0, reviews: revs || [] });
  }
  return res.json({ success: true, count: fallbackReviews.length, reviews: fallbackReviews });
});

// Get ONLY APPROVED reviews for public display & homepage carousel
app.get('/api/reviews/approved', async (req, res) => {
  const supabase = getSupabaseServer();
  if (supabase) {
    const { data: revs } = await supabase
      .from('reviews')
      .select('*')
      .eq('status', 'Approved')
      .order('created_at', { ascending: false });
    return res.json({ success: true, count: revs?.length || 0, reviews: revs || [] });
  }
  const approved = fallbackReviews.filter((r) => r.status === 'Approved');
  return res.json({ success: true, count: approved.length, reviews: approved });
});

// Moderate review status
app.patch('/api/reviews/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be Pending, Approved, or Rejected.' });
  }

  const supabase = getSupabaseServer();
  if (supabase) {
    const { data: rev, error } = await supabase
      .from('reviews')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (!error && rev) {
      return res.json({ success: true, review: rev });
    }
  }

  return res.json({ success: true });
});

// 8. Contact & Callback Requests
app.post('/api/contact', async (req, res) => {
  const { fullName, email, phone, subject, message } = req.body;
  if (!fullName || !email || !phone || !message) {
    return res.status(400).json({ error: 'Full Name, Email, Phone, and Message are required.' });
  }

  const supabase = getSupabaseServer();
  if (supabase) {
    await supabase.from('contact_messages').insert({
      full_name: String(fullName).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      subject: subject ? String(subject).trim() : 'General Inquiry',
      message: String(message).trim(),
    });
  } else {
    fallbackContacts.push({
      fullName,
      email,
      phone,
      subject,
      message,
      createdAt: new Date().toISOString(),
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Thank you for reaching out to CAPITABEE FINANCIAL SERVICES. Our team will contact you shortly.',
  });
});

app.post('/api/callback', async (req, res) => {
  const { fullName, mobileNumber, email, loanType, amount, city, state, associateName, message } = req.body;
  if (!fullName || !mobileNumber || !loanType) {
    return res.status(400).json({ error: 'Full Name, Mobile Number, and Loan Type are required.' });
  }

  const supabase = getSupabaseServer();
  if (supabase) {
    await supabase.from('callback_requests').insert({
      full_name: String(fullName).trim(),
      mobile_number: String(mobileNumber).trim(),
      email: email ? String(email).trim() : null,
      loan_type: String(loanType).trim(),
      amount: amount ? Number(amount) : null,
      city: city ? String(city).trim() : null,
      state: state ? String(state).trim() : null,
      associate_name: associateName ? String(associateName).trim() : null,
      message: message ? String(message).trim() : null,
    });
  } else {
    fallbackCallbacks.push({
      fullName,
      mobileNumber,
      email,
      loanType,
      amount,
      city,
      state,
      associateName,
      message,
      createdAt: new Date().toISOString(),
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Callback request registered. A Capitabee loan officer will call you back shortly.',
  });
});

// 9. AI Advisor Powered by Gemini API (Server-Side)
app.post(['/api/ai-advisor', '/api/ai/advisor'], async (req, res) => {
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
      model: 'gemini-3.8-flash',
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

// 10. Dedicated SEO & Search Engine Indexing Endpoints
app.get('/sitemap.xml', (req, res) => {
  const sitemapDist = path.join(process.cwd(), 'dist', 'sitemap.xml');
  const sitemapPublic = path.join(process.cwd(), 'public', 'sitemap.xml');
  const fileToServe = fs.existsSync(sitemapDist) ? sitemapDist : sitemapPublic;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
  if (fs.existsSync(fileToServe)) {
    return res.sendFile(fileToServe);
  }
  return res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://capitabee.com/</loc></url></urlset>');
});

app.get('/robots.txt', (req, res) => {
  const robotsDist = path.join(process.cwd(), 'dist', 'robots.txt');
  const robotsPublic = path.join(process.cwd(), 'public', 'robots.txt');
  const fileToServe = fs.existsSync(robotsDist) ? robotsDist : robotsPublic;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
  if (fs.existsSync(fileToServe)) {
    return res.sendFile(fileToServe);
  }
  return res.status(200).send('User-agent: *\nAllow: /\n\nSitemap: https://capitabee.com/sitemap.xml\n');
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
