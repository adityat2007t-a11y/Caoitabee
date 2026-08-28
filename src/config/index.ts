import { LoanProduct, PartnerEntity, LoanStage } from '../types';

export const BRAND_CONFIG = {
  name: 'CAPITABEE FINANCIAL SERVICES',
  shortName: 'Capitabee Financial Services',
  tagline: 'Pan-India Loan Assistance & Financing Solutions',
  positioning: 'Pan-India Loan Assistance',
  subPositioning: 'Loan Solutions Across India',
  heroMainHeadingFirst: 'Smart Financial Solutions.',
  heroMainHeadingSecond: 'Faster Loan Processing.',
  heroSubheading:
    'Flexible loan solutions for individuals, professionals and businesses with end-to-end documentation assistance, transparent processing and Pan-India loan assistance.',
  office: {
    address: '101, Ganesh Tower, Dada Patil Wadi, Thane (W), Maharashtra - 400602',
    line1: '101, Ganesh Tower, Dada Patil Wadi',
    line2: 'Thane (W), Maharashtra - 400602',
    mapsUrl: 'https://maps.google.com/?q=101+Ganesh+Tower+Dada+Patil+Wadi+Thane+West+Maharashtra+400602',
  },
  contact: {
    phone: '+91 8010886625',
    phoneRaw: '+918010886625',
    whatsappUrl: 'https://wa.me/918010886625',
    email: 'info.capitabee@gmail.com',
    mailto: 'mailto:info.capitabee@gmail.com',
  },
  social: {
    instagram: 'https://www.instagram.com/capitabee.fin?igsi=MTAzMm92aTIwdHRtcw==',
  },
  metrics: {
    happyCustomers: '5,000+',
    loanDisbursed: '₹1,000 Cr+',
    get partnerNetwork(): string {
      return `${PARTNER_NETWORK.length}+`;
    },
    transparentJourney: '12-Stage',
    homeLoanStartingRate: '7.20%',
  },
  rateDisclaimer:
    'Rates shown are indicative starting rates and are subject to lender eligibility, applicant profile, credit assessment, property valuation and applicable lender terms.',
  financialDisclaimer:
    'Loan approval, interest rate, tenure, processing fees and other terms are subject to the respective lender’s eligibility criteria, credit assessment, documentation and applicable policies.',
};

export const COLOR_TOKENS = {
  // Natural Tones Core Palette
  sage: '#5D6D5F',
  sageDark: '#48564A',
  sageLight: '#EBF0EC',
  clay: '#C68B59',
  clayDark: '#AA7142',
  clayLight: '#F9EFE6',
  cream: '#FDFCF8',
  sand: '#F4F1EA',
  sandDark: '#E8E3D8',
  ink: '#2D332E',
  inkMuted: '#68716A',
  inkLight: '#8C968E',
  border: '#E5DFD3',
  borderLight: '#ECE7DC',

  // Backward compatibility tokens mapped to Natural Tones
  bgPrimary: '#F4F1EA',
  bgSection: '#FDFCF8',
  white: '#FFFFFF',
  navyPrimary: '#5D6D5F',
  navySecondary: '#48564A',
  goldPrimary: '#C68B59',
  goldDeep: '#AA7142',
  goldLight: '#F9EFE6',
  tealPrimary: '#5D6D5F',
  tealLight: '#EBF0EC',
  textPrimary: '#2D332E',
  textSecondary: '#68716A',
  textMuted: '#8C968E',
  success: '#5D6D5F',
  error: '#C65D59',
  warning: '#C68B59',
};

export const LOAN_RATES = {
  homeLoan: '7.20%',
  lap: '8.50%',
  unsecuredBusinessLoan: '14%',
  workingCapital: '8%',
  commercialPurchase: '8.50%',
  industrialPurchase: '8.50%',
  goldLoan: 'Rate available based on lender and applicant profile.',
};

// 17 Loan Products with Working Capital appearing FIRST
export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'working-capital',
    slug: 'working-capital',
    name: 'Working Capital (MSME)',
    category: 'MSME',
    startingRate: '8% p.a.',
    tagline: 'Fuel everyday business growth with tailored liquidity solutions.',
    description:
      'Comprehensive working capital facilities designed for micro, small, and medium enterprises, traders, manufacturers, and service providers across India. Manage seasonal demand, inventory cycles, and supplier payables smoothly.',
    subProducts: [
      'Overdraft (OD)',
      'Cash Credit (CC)',
      'Bill Discounting',
      'Pre- & Post-Shipment Export Credit (PCFC)',
      'Bank Guarantee (BG)',
      'Channel Financing',
    ],
    keyHighlights: [
      'Starting from 8% p.a.',
      'Flexible OD/CC limits tailored to turnover',
      'Both Secured and Semi-Secured structures',
      'Quick sanction cycles with Pan-India assistance',
    ],
    eligibility: [
      'Minimum business vintage of 2 years',
      'Valid GST registration and clean banking records',
      'Audited financials for limits above standard thresholds',
      'Applicable for Proprietorships, Partnerships, LLPs, and Pvt Ltd Companies',
    ],
    typicalDocuments: {
      salaried: [],
      selfEmployed: [
        'Last 3 years Audited Balance Sheets & Profit/Loss accounts',
        'Last 12 months Bank Statements of all operative accounts',
        'GST 3B Returns for the last 12 months',
        'KYC of Promoters / Partners / Directors',
        'Sanction letters of existing credit facilities',
      ],
      common: ['PAN Card & Aadhaar of Promoters', 'Business Registration Proof (Udyam, GST, COI)'],
    },
    benefits: [
      'Enhance liquidity without liquidating core assets',
      'Pay interest only on the utilized amount in CC/OD',
      'Multiple banking consortium structuring support',
      'End-to-end documentation coordination',
    ],
    iconName: 'Coins',
  },
  {
    id: 'home-loan',
    slug: 'home-loan',
    name: 'Home Loan',
    category: 'Retail',
    startingRate: '7.20% p.a.',
    maxTenure: 'Up to 30 years',
    tagline: 'Own your dream home with low rates and transparent processing.',
    description:
      'Competitive home financing for purchase of ready-to-move, under-construction, resale properties, or self-construction across all major cities and towns in India.',
    keyHighlights: [
      'Starting from 7.20% p.a.',
      'Flexible tenures up to 30 years',
      'Higher eligibility through co-applicant inclusion',
      'Doorstep assistance & legal/technical coordination',
    ],
    eligibility: [
      'Salaried individuals, professionals, and business owners',
      'Age between 21 and 65 years',
      'Stable employment or business vintage',
      'Healthy credit history (assessed by lenders)',
    ],
    typicalDocuments: {
      salaried: [
        'Last 3 months salary slips',
        'Last 6 months salary account bank statements',
        'Form 16 for the last 2 financial years',
        'Job appointment / confirmation letter',
      ],
      selfEmployed: [
        'Last 3 years ITR with computation of income',
        'Last 3 years audited financials (CA certified)',
        'Last 12 months primary bank statements',
        'Business profile and ownership proof',
      ],
      common: [
        'PAN Card, Aadhaar Card, Passport photos',
        'Agreement to Sale / Title deeds / Approved floor plans / OC / CC',
      ],
    },
    benefits: [
      'Tax benefits under Section 80C and Section 24(b)',
      'Minimal processing fees through top banking partners',
      'Customized repayment options (Step-up / Step-down)',
    ],
    iconName: 'Home',
  },
  {
    id: 'lap',
    slug: 'lap',
    name: 'Loan Against Property (LAP)',
    category: 'Commercial',
    startingRate: '8.50% p.a.',
    maxTenure: 'Up to 25 years',
    tagline: 'Unlock the true capital value of your residential or commercial property.',
    description:
      'Leverage your self-occupied, rented, residential, commercial, or industrial property to raise substantial long-term capital for business expansion, debt consolidation, or personal financial requirements.',
    keyHighlights: [
      'Starting from 8.50% p.a.',
      'High loan amounts with tenures up to 25 years',
      'Retain complete ownership while utilizing funds',
      'Transparent legal and technical property evaluation',
    ],
    eligibility: [
      'Clear, marketable property title without legal disputes',
      'Salaried employees, doctors, CAs, traders, manufacturers',
      'Adequate debt servicing capacity as per lender norms',
    ],
    typicalDocuments: {
      salaried: ['Salary slips, Form 16, bank statements, property chain documents'],
      selfEmployed: ['3 years ITR, audited financials, 12 months bank statements, property chain documents'],
      common: ['Title deeds, mother deed, sanctioned plan, tax receipts, encumbrance certificate'],
    },
    benefits: [
      'Significantly lower interest rate compared to unsecured business loans',
      'Longer tenures ensure lower monthly EMI burden',
      'Flexible end-use for business or personal objectives',
    ],
    iconName: 'Building2',
  },
  {
    id: 'business-loan',
    slug: 'business-loan',
    name: 'Unsecured Business Loan',
    category: 'MSME',
    startingRate: '14% p.a.',
    maxTenure: 'Up to 5 years',
    tagline: 'Collateral-free business capital with quick verification and approvals.',
    description:
      'Fast unsecured loans for expanding enterprises, purchase of inventory, hiring workforce, or managing urgent cash flow gaps without pledging any collateral.',
    keyHighlights: [
      'Starting from 14% p.a.',
      'Zero collateral or security required',
      'Loan amounts up to ₹1 Crore+ based on turnover',
      'Speedy digital documentation & lender review',
    ],
    eligibility: [
      'Minimum business turnover of ₹40 Lakhs/year',
      'Continuous operational track record of 2+ years',
      'Positive cash flow and regular GST filing',
    ],
    typicalDocuments: {
      salaried: [],
      selfEmployed: [
        'Last 2 years ITR and Financial Statements',
        'Last 12 months Current Account Statements',
        'GST 3B Returns for last 12 months',
        'Business entity proof (GST, Udyam, MOA/AOA/Partnership Deed)',
      ],
      common: ['KYC of Business Promoters (PAN, Aadhaar)'],
    },
    benefits: [
      'No collateral risk',
      'Fast turnaround for immediate capital requirements',
      'Flexible tenure from 12 to 60 months',
    ],
    iconName: 'Briefcase',
  },
  {
    id: 'commercial-purchase',
    slug: 'commercial-purchase',
    name: 'Commercial Purchase Loan',
    category: 'Commercial',
    startingRate: '8.50% p.a.',
    maxTenure: 'Up to 25 years',
    tagline: 'Acquire office spaces, retail outlets, and commercial real estate.',
    description:
      'Financing solutions for buying ready or under-construction commercial offices, shops, showrooms, and corporate complexes across India with flexible repayment tenures.',
    keyHighlights: [
      'Starting from 8.50% p.a.',
      'Tenures extending up to 25 years',
      'Covers up to 75%–80% of registered property value',
      'Assistance with lender legal diligence',
    ],
    eligibility: [
      'Business entities, self-employed professionals, and commercial investors',
      'Proven repayment ability based on cash flows or rental yields',
    ],
    typicalDocuments: {
      salaried: ['Salary slips, Form 16, property agreement'],
      selfEmployed: ['Audited financials, 12 months bank statements, property chain documents'],
      common: ['Commercial property title deeds, draft sale agreement, NOC from builder/society'],
    },
    benefits: [
      'Convert commercial rent expenses into equity ownership',
      'Long tenure keeps EMIs manageable',
      'Applicable for office expansions and new retail hubs',
    ],
    iconName: 'Landmark',
  },
  {
    id: 'industrial-purchase',
    slug: 'industrial-purchase',
    name: 'Industrial Purchase Loan',
    category: 'Commercial',
    startingRate: '8.50% p.a.',
    maxTenure: 'Up to 25 years',
    tagline: 'Finance industrial plots, manufacturing premises, and factory sheds.',
    description:
      'Specialized property purchase funding for industrial units, manufacturing plants, MIDC/GIDC/RIICO industrial plots, and heavy commercial setups across Indian industrial corridors.',
    keyHighlights: [
      'Starting from 8.50% p.a.',
      'Tenures up to 25 years',
      'Structured for manufacturing companies and industrial groups',
      'End-to-end guidance for government industrial authority approvals',
    ],
    eligibility: [
      'Manufacturing and industrial entities with approved industry permissions',
      'Viable project report and clear industrial zone clearances',
    ],
    typicalDocuments: {
      salaried: [],
      selfEmployed: [
        'Last 3 years Audited Balance Sheets and CMA Data',
        'Industrial authority lease agreements / allotment letters',
        'Pollution and local authority NOCs (where applicable)',
        '12 months banking records',
      ],
      common: ['KYC of Company Directors & Key Promoters'],
    },
    benefits: [
      'Scalable financing for industrial footprint expansion',
      'Competitive rate structures with premier NBFCs & Banks',
      'Seamless multi-stage disbursement assistance',
    ],
    iconName: 'Factory',
  },
  {
    id: 'warehouse-purchase',
    slug: 'warehouse-purchase',
    name: 'Warehouse / Godown Purchase Loan',
    category: 'Commercial',
    startingRate: '8.50% p.a.',
    maxTenure: 'Up to 20 years',
    tagline: 'Invest in logistics hubs, storage facilities, and modern warehouses.',
    description:
      'Customized funding options for logistics companies, distributors, agricultural traders, and 3PL operators acquiring or constructing warehouses and godowns.',
    keyHighlights: [
      'Structured loans for modern grade-A/B warehousing',
      'Tenures up to 20 years',
      'Lease rental discounting (LRD) options on pre-leased assets',
    ],
    eligibility: ['Logistics operators, e-commerce suppliers, distribution firms, investors'],
    typicalDocuments: {
      salaried: [],
      selfEmployed: ['ITR, audited balance sheets, land/warehouse registry documents, lease agreements'],
      common: ['Promoter KYCs, layout maps, structural stability certificates'],
    },
    benefits: ['Scale logistics infrastructure', 'Tax depreciation benefits on commercial structures'],
    iconName: 'Warehouse',
  },
  {
    id: 'loan-on-plot',
    slug: 'loan-on-plot',
    name: 'Loan on Plot',
    category: 'Retail',
    startingRate: '7.50% p.a.',
    maxTenure: 'Up to 20 years',
    tagline: 'Acquire residential or commercial plots in approved layouts.',
    description:
      'Finance the purchase of residential or commercial land parcels in municipal and government-approved development authority layouts across India.',
    keyHighlights: [
      'Attractive plot financing rates',
      'Loans for DTCP / HMDA / BDA / CIDCO / MMRDA approved plots',
      'Option to convert to plot + construction loan later',
    ],
    eligibility: ['Salaried & self-employed individuals with approved layout documentation'],
    typicalDocuments: {
      salaried: ['Salary slips, bank statements, plot layout approval docs'],
      selfEmployed: ['ITRs, audited financials, plot clearance records'],
      common: ['Title deeds, encumbrance certificate, layout approval order'],
    },
    benefits: ['Secure prime land early', 'Transparent title validation'],
    iconName: 'MapPin',
  },
  {
    id: 'plot-construction',
    slug: 'plot-construction',
    name: 'Plot + Construction Loan',
    category: 'Retail',
    startingRate: '7.35% p.a.',
    maxTenure: 'Up to 25 years',
    tagline: 'Purchase the land and construct your customized building simultaneously.',
    description:
      'A combined financing structure that covers both the acquisition cost of the land plot and the staged construction budget for your home or commercial premise.',
    keyHighlights: [
      'Integrated funding for land purchase and construction phases',
      'Disbursements tied to civil engineer stage-completion reports',
      'Lower combined processing fees',
    ],
    eligibility: ['Individuals with sanctioned architect estimates and construction plans'],
    typicalDocuments: {
      salaried: ['Standard income docs, approved building plan, architect cost estimate'],
      selfEmployed: ['Financials, building sanction letter, itemized construction budget'],
      common: ['Clear title documents of plot, local municipal approval letter'],
    },
    benefits: ['Single loan account for both purchase and construction', 'Interest calculated on actual drawn funds'],
    iconName: 'Hammer',
  },
  {
    id: 'balance-transfer',
    slug: 'balance-transfer',
    name: 'Balance Transfer',
    category: 'Specialized',
    startingRate: '7.20% p.a.',
    tagline: 'Switch your existing high-cost loan to lower rates and save lakhs.',
    description:
      'Transfer your existing Home Loan, LAP, or Commercial Loan from your current lender to a leading bank or NBFC with lower interest rates and reduced monthly EMIs.',
    keyHighlights: [
      'Substantial interest rate reduction',
      'Option to avail an additional Top-Up loan concurrently',
      'Hassle-free document takeover assistance from existing lender',
    ],
    eligibility: ['Applicants with regular repayment history on existing loan for 6–12 months'],
    typicalDocuments: {
      salaried: ['Existing loan sanction letter, list of documents (LOD), 12 months loan statement'],
      selfEmployed: ['Foreclosure letter, LOD, 12 months repayment record, updated financials'],
      common: ['KYC, current loan account statement, property papers copy'],
    },
    benefits: ['Lower monthly EMI or reduced remaining tenure', 'Unlock instant Top-Up funding'],
    iconName: 'RefreshCw',
  },
  {
    id: 'top-up',
    slug: 'top-up',
    name: 'Top-Up Loan',
    category: 'Specialized',
    startingRate: '7.75% p.a.',
    maxTenure: 'Matched with primary loan',
    tagline: 'Additional liquidity over and above your existing home or property loan.',
    description:
      'Avail supplementary capital on your running loan at much lower interest rates than personal loans, without the need to arrange additional collateral.',
    keyHighlights: [
      'Low interest rates compared to unsecured personal borrowings',
      'Quick processing based on existing property valuation and track record',
      'Flexible end-use for business, home renovation, or education',
    ],
    eligibility: ['Existing borrowers with prompt repayment records of 6+ months'],
    typicalDocuments: {
      salaried: ['Updated income proof, existing loan account statement'],
      selfEmployed: ['Updated financials, 6 months bank statement'],
      common: ['KYC and Top-Up application'],
    },
    benefits: ['Zero additional mortgage charges in most cases', 'Extended tenure aligned with primary loan'],
    iconName: 'TrendingUp',
  },
  {
    id: 'machinery-loan',
    slug: 'machinery-loan',
    name: 'Machinery Loan',
    category: 'MSME',
    startingRate: '9.00% p.a.',
    maxTenure: 'Up to 7 years',
    tagline: 'Upgrade your manufacturing plant with modern high-capacity machinery.',
    description:
      'Equipment and machinery financing for manufacturing plants, textile mills, printing units, pharma labs, engineering workshops, and packaging companies.',
    keyHighlights: [
      'Funding up to 85% of machinery invoice value',
      'Tenures aligned with machinery economic life',
      'Letters of Credit (LC) and Import financing support',
    ],
    eligibility: ['Industrial and MSME manufacturing entities with confirmed supplier proforma invoices'],
    typicalDocuments: {
      salaried: [],
      selfEmployed: ['Proforma invoices, supplier quotation, 3 years financials, existing plant details'],
      common: ['Company KYC, factory license, pollution NOCs'],
    },
    benefits: ['Direct supplier payment disbursements', 'Preserve working capital reserves'],
    iconName: 'Cog',
  },
  {
    id: 'plant-equipment',
    slug: 'plant-equipment',
    name: 'Plant & Equipment Loan',
    category: 'MSME',
    startingRate: '9.00% p.a.',
    maxTenure: 'Up to 7 years',
    tagline: 'Comprehensive asset financing for modern infrastructure and plants.',
    description:
      'Tailored asset funding for heavy machinery, earthmoving equipment, healthcare diagnostics, and specialized testing equipment.',
    keyHighlights: [
      'Covers domestic purchases and overseas imported equipment',
      'Customized moratorium periods during installation',
      'Tax depreciation benefits on financed capital equipment',
    ],
    eligibility: ['Hospitals, construction contractors, manufacturing units, diagnostic centers'],
    typicalDocuments: {
      salaried: [],
      selfEmployed: ['Equipment quotation, business financials, project viability assessment'],
      common: ['Promoter KYC and entity registration proof'],
    },
    benefits: ['Accelerate plant modernization', 'Structured repayment terms matching production ramp-up'],
    iconName: 'Cpu',
  },
  {
    id: 'inventory-funding',
    slug: 'inventory-funding',
    name: 'Inventory Funding',
    category: 'MSME',
    startingRate: '9.50% p.a.',
    tagline: 'Optimize stock management and meet seasonal surges comfortably.',
    description:
      'Specialized financing against inventory, raw materials, and finished stock for wholesalers, FMCG distributors, retailers, and auto dealers across India.',
    keyHighlights: [
      'Revolving credit limits against verified stock statements',
      'Ideal for seasonal buildup and bulk purchase discounts',
      'Assistance with lender stock audit procedures',
    ],
    eligibility: ['Wholesalers, distributors, authorized dealership networks with audited stock audits'],
    typicalDocuments: {
      salaried: [],
      selfEmployed: ['Stock statements, aged inventory reports, GST returns, audited financials'],
      common: ['Entity KYC and principal dealership agreements'],
    },
    benefits: ['Secure supplier cash discounts', 'Prevent stockouts during festival spikes'],
    iconName: 'Package',
  },
  {
    id: 'construction-finance',
    slug: 'construction-finance',
    name: 'Construction Finance',
    category: 'Commercial',
    startingRate: '10.50% p.a.',
    tagline: 'Project funding for real estate developers and infrastructure builders.',
    description:
      'Institutional and NBFC-backed project funding for residential towers, commercial plazas, and township developers with milestones-based disbursements.',
    keyHighlights: [
      'Structured debt for RERA-registered projects',
      'Escrow account mechanism with sales receivables cashflow monitoring',
      'Flexible moratorium until project completion',
    ],
    eligibility: ['Developers with clean track record, clear title, RERA registration, and all municipal approvals'],
    typicalDocuments: {
      salaried: [],
      selfEmployed: [
        'Detailed Project Report (DPR), cash flow projections, RERA registration',
        'Approved building architectural plans, environmental clearances, title search report',
      ],
      common: ['Developer entity KYC and promoter financial statements'],
    },
    benefits: ['Smooth funding from groundbreaking to handover', 'Customized repayment linked to unit sales'],
    iconName: 'Layers',
  },
  {
    id: 'loan-against-shares',
    slug: 'loan-against-shares',
    name: 'Loan Against Shares (LAS)',
    category: 'Specialized',
    startingRate: '9.50% p.a.',
    tagline: 'Instant liquidity against approved equity shares and mutual funds.',
    description:
      'Monetize your equity portfolio, mutual fund units, and bonds without selling your long-term investments. Retain corporate actions like dividends and bonuses.',
    keyHighlights: [
      'Overdraft limit against approved list of securities',
      'Interest charged only on drawn amount',
      'No prepayment penalties on most limits',
    ],
    eligibility: ['Individuals and entities holding approved demat securities with NSDL/CDSL'],
    typicalDocuments: {
      salaried: ['Demat holding statement, KYC, bank statement'],
      selfEmployed: ['Demat holding statement, entity KYC, bank statement'],
      common: ['PAN Card, Aadhaar Card, Demat CML copy'],
    },
    benefits: ['Zero market timing compromise', 'Retain dividends, bonuses, and voting rights'],
    iconName: 'PieChart',
  },
  {
    id: 'gold-loan',
    slug: 'gold-loan',
    name: 'Gold Loan',
    category: 'Specialized',
    startingRate: 'Rate available based on lender and applicant profile.',
    tagline: 'Leverage physical gold ornaments with secure bank locker storage.',
    description:
      'Instant financial assistance by pledging gold ornaments with leading partner banks and NBFCs. Safe custody in high-security bank vaults with insured valuation.',
    keyHighlights: [
      'Rate available based on lender and applicant profile',
      'Minimal documentation with immediate appraisal',
      'Safe and insured bank locker custody',
      'Flexible bullet repayment and regular EMI options',
    ],
    eligibility: [
      'Indian citizens aged 18+ possessing genuine gold jewelry (18K–24K purity)',
      'Clear ownership of gold ornaments',
    ],
    typicalDocuments: {
      salaried: ['Identity proof (Aadhaar / Passport / Voter ID), PAN Card'],
      selfEmployed: ['Identity proof (Aadhaar / Passport / Voter ID), PAN Card'],
      common: ['Passport size photographs, PAN Card, Aadhaar Card'],
    },
    benefits: [
      'High per-gram valuation as per RBI guidelines',
      'No income proof required for standard limits',
      'Instant liquidity for urgent agricultural, business or personal needs',
    ],
    iconName: 'ShieldCheck',
  },
];

// Complete Partner & Lending Network (Single Source of Truth)
export const PARTNER_NETWORK: PartnerEntity[] = [
  // Leading Commercial & Co-operative Banks
  { name: 'HDFC Bank', type: 'Bank', category: 'Private Sector Bank', shortName: 'HDFC', featured: true },
  { name: 'ICICI Bank', type: 'Bank', category: 'Private Sector Bank', shortName: 'ICICI', featured: true },
  { name: 'Axis Bank', type: 'Bank', category: 'Private Sector Bank', shortName: 'Axis', featured: true },
  { name: 'State Bank of India', type: 'Bank', category: 'Public Sector Bank', shortName: 'SBI', featured: true },
  { name: 'Bank of India', type: 'Bank', category: 'Public Sector Bank', shortName: 'BOI' },
  { name: 'Bank of Maharashtra', type: 'Bank', category: 'Public Sector Bank', shortName: 'BOM' },
  { name: 'Bank of Baroda', type: 'Bank', category: 'Public Sector Bank', shortName: 'BOB', featured: true },
  { name: 'Union Bank of India', type: 'Bank', category: 'Public Sector Bank', shortName: 'Union' },
  { name: 'IDFC First Bank', type: 'Bank', category: 'Private Sector Bank', shortName: 'IDFC First', featured: true },
  { name: 'IndusInd Bank', type: 'Bank', category: 'Private Sector Bank', shortName: 'IndusInd', featured: true },
  { name: 'Kotak Bank', type: 'Bank', category: 'Private Sector Bank', shortName: 'Kotak', featured: true },
  { name: 'Standard Chartered Bank', type: 'Bank', category: 'Foreign Bank', shortName: 'StanChart' },
  { name: 'HSBC Bank', type: 'Bank', category: 'Foreign Bank', shortName: 'HSBC', featured: true },
  { name: 'Deutsche Bank', type: 'Bank', category: 'Foreign Bank', shortName: 'Deutsche Bank', featured: true },
  { name: 'Punjab National Bank', type: 'Bank', category: 'Public Sector Bank', shortName: 'PNB' },
  { name: 'IDBI Bank', type: 'Bank', category: 'Private Sector Bank', shortName: 'IDBI' },
  { name: 'Bandhan Bank', type: 'Bank', category: 'Private Sector Bank', shortName: 'Bandhan' },
  { name: 'Central Bank of India', type: 'Bank', category: 'Public Sector Bank', shortName: 'CBI' },
  { name: 'Saraswat Co-operative Bank', type: 'Bank', category: 'Cooperative Bank', shortName: 'Saraswat Bank', featured: true },
  { name: 'Shamrao Vithal Bank', type: 'Bank', category: 'Cooperative Bank', shortName: 'SVC Bank' },
  { name: 'Federal Bank', type: 'Bank', category: 'Private Sector Bank', shortName: 'Federal' },

  // Leading NBFCs & Housing Finance Companies
  { name: 'HDB Financial', type: 'NBFC', category: 'Non-Banking Financial Company', shortName: 'HDB', featured: true },
  { name: 'ICICI Home Finance', type: 'NBFC', category: 'Housing Finance Company', shortName: 'ICICI HFC' },
  { name: 'Axis Finance', type: 'NBFC', category: 'Non-Banking Financial Company', shortName: 'Axis Fin' },
  { name: 'Aditya Birla Capital', type: 'NBFC', category: 'Non-Banking Financial Company', shortName: 'Aditya Birla', featured: true },
  { name: 'Tata Capital', type: 'NBFC', category: 'Non-Banking Financial Company', shortName: 'Tata Cap', featured: true },
  { name: 'Bajaj Finance', type: 'NBFC', category: 'Non-Banking Financial Company', shortName: 'Bajaj', featured: true },
  { name: 'L&T Finance', type: 'NBFC', category: 'Non-Banking Financial Company', shortName: 'L&T Fin', featured: true },
  { name: 'Piramal Finance', type: 'NBFC', category: 'Housing & MSME Finance', shortName: 'Piramal' },
  { name: 'Sundaram Home Finance', type: 'NBFC', category: 'Housing Finance Company', shortName: 'Sundaram Home', featured: true },
  { name: 'SMFG India', type: 'NBFC', category: 'Non-Banking Financial Company', shortName: 'SMFG India', featured: true },
  { name: 'Poonawalla Fincorp', type: 'NBFC', category: 'Non-Banking Financial Company', shortName: 'Poonawalla', featured: true },
  { name: 'Cholamandalam', type: 'NBFC', category: 'Investment & Finance', shortName: 'Chola' },
  { name: 'Anand Rathi Global Finance', type: 'NBFC', category: 'Non-Banking Financial Company', shortName: 'Anand Rathi' },
  { name: 'Hero FinCorp', type: 'NBFC', category: 'Non-Banking Financial Company', shortName: 'Hero FinCorp' },
  { name: 'Mahindra Fincorp', type: 'NBFC', category: 'Non-Banking Financial Company', shortName: 'Mahindra' },
];

export const PARTNER_COUNT = PARTNER_NETWORK.length;
export const PARTNER_COUNT_LABEL = `${PARTNER_NETWORK.length}+`;

// 12-Stage Loan Journey
export const TWELVE_STAGE_JOURNEY: { stageNumber: number; name: string; description: string }[] = [
  { stageNumber: 1, name: 'Inquiry', description: 'Customer expresses interest and submits basic loan requirements.' },
  { stageNumber: 2, name: 'Application', description: 'Formal loan application submitted and assigned unique Application ID.' },
  { stageNumber: 3, name: 'Documentation', description: 'Collection and preliminary check of KYC, income, and property documents.' },
  { stageNumber: 4, name: 'Login / Customer Verification', description: 'File logged with lender system and verification initiated.' },
  { stageNumber: 5, name: 'Credit Assessment', description: 'Lender evaluates cash flows, credit profile, and repayment capacity.' },
  { stageNumber: 6, name: 'In-Principle Sanction', description: 'Preliminary loan approval issued with indicative sanctioned terms.' },
  { stageNumber: 7, name: 'Legal Verification', description: 'Property title search and legal vetting performed by advocate panel.' },
  { stageNumber: 8, name: 'Technical Valuation', description: 'Physical property inspection and fair market valuation conducted.' },
  { stageNumber: 9, name: 'Final Sanction', description: 'Formal sanction letter released specifying final loan amount & rate.' },
  { stageNumber: 10, name: 'OTC (One Time Conditions)', description: 'Signing loan agreement, stamping, and meeting pre-disbursal conditions.' },
  { stageNumber: 11, name: 'Disbursement', description: 'Loan amount transferred directly to builder/seller or customer account.' },
  { stageNumber: 12, name: 'PDD (Post Disbursement Documents)', description: 'Submission of post-disbursal title deeds, OC, and EMI schedule setup.' },
];

// FAQ Data
export const FAQ_ITEMS = [
  {
    category: 'General & Overview',
    question: 'What is Capitabee Financial Services?',
    answer:
      `Capitabee Financial Services is a Pan-India financial services and loan assistance platform. We help individuals, self-employed professionals, and business owners navigate and secure Home Loans, LAP, Business Loans, Working Capital, Commercial/Industrial Property Loans, and Gold Loans through our network of ${PARTNER_COUNT_LABEL} leading banks and NBFCs.`,
  },
  {
    category: 'Working Capital',
    question: 'What working capital facilities does Capitabee Financial Services assist with?',
    answer:
      'We assist MSMEs and businesses across India with Cash Credit (CC), Overdraft (OD), Bill Discounting, Pre- & Post-Shipment Export Credit (PCFC), Bank Guarantees (BG), and Channel Financing, starting from 8% p.a. depending on lender criteria.',
  },
  {
    category: 'Home Loan & LAP',
    question: 'What is the starting interest rate for Home Loans and LAP?',
    answer:
      'Home Loans start from 7.20% p.a. and Loan Against Property (LAP) starts from 8.50% p.a. with tenures up to 25–30 years, subject to lender credit evaluation and applicant eligibility.',
  },
  {
    category: 'Gold Loan',
    question: 'How does Gold Loan assistance work at Capitabee Financial Services?',
    answer:
      'Gold Loan assistance is available through our partner bank and NBFC network. Rates are determined based on lender guidelines and applicant profile. Your pledged gold ornaments are appraised transparently and stored in insured, high-security bank lockers.',
  },
  {
    category: 'Balance Transfer',
    question: 'Can I transfer my existing high-interest loan and get a Top-Up?',
    answer:
      'Yes, our Balance Transfer assistance allows you to switch existing home or property loans to lower starting rates, and simultaneously apply for an additional Top-Up loan for business or personal liquidity.',
  },
  {
    category: 'Process & Tracking',
    question: 'How does the 12-Stage Loan Journey work?',
    answer:
      'Every application goes through a structured 12-stage transparent lifecycle from initial Inquiry, Documentation, Credit Assessment, Legal/Technical Vetting to Final Sanction and Disbursement. Authenticated customers can track real-time stage updates.',
  },
  {
    category: 'Customer Access',
    question: 'How do customers get login credentials for the Customer Dashboard?',
    answer:
      'To maintain strict data security and prevent unauthorized access, customer login credentials (Customer ID & Password) are issued directly by your authorized loan associate after your loan application has been registered and verified.',
  },
  {
    category: 'Pan-India Coverage',
    question: 'Does Capitabee Financial Services operate outside Maharashtra?',
    answer:
      'Yes! Capitabee Financial Services provides Pan-India Loan Assistance across all major states and union territories in India through our nationwide banking and NBFC network.',
  },
];
