import React from 'react';

interface PartnerLogoProps {
  name: string;
  className?: string;
}

export const PartnerLogo: React.FC<PartnerLogoProps> = ({ name, className = 'h-7 sm:h-8 w-auto max-w-[130px]' }) => {
  const normalized = name.toLowerCase().trim();

  // Helper wrapper for SVG rendering
  const renderSvg = (svgContent: React.ReactNode, viewBox = '0 0 160 48') => (
    <div
      className={`flex items-center justify-center ${className} transition-transform duration-200 group-hover:scale-105`}
      title={`${name} logo`}
      aria-label={`${name} logo`}
    >
      <svg
        viewBox={viewBox}
        className="w-full h-full max-h-full object-contain overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
      >
        {svgContent}
      </svg>
    </div>
  );

  // =========================================================================
  // 1. HDFC BANK
  // =========================================================================
  if (normalized.includes('hdfc bank') || normalized === 'hdfc') {
    return renderSvg(
      <g>
        {/* Navy Blue Block */}
        <rect x="6" y="8" width="32" height="32" rx="4" fill="#004C8F" />
        {/* White Center Square */}
        <rect x="18" y="20" width="8" height="8" fill="#FFFFFF" />
        {/* 4 Red Bars */}
        <rect x="19.5" y="11" width="5" height="6" fill="#ED232A" />
        <rect x="19.5" y="31" width="5" height="6" fill="#ED232A" />
        <rect x="9" y="21.5" width="6" height="5" fill="#ED232A" />
        <rect x="29" y="21.5" width="6" height="5" fill="#ED232A" />
        {/* Wordmark */}
        <text x="46" y="28" fill="#004C8F" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="17" letterSpacing="0.5">
          HDFC BANK
        </text>
      </g>
    );
  }

  // =========================================================================
  // 2. ICICI HOME FINANCE (Check before ICICI Bank)
  // =========================================================================
  if (normalized.includes('icici home')) {
    return renderSvg(
      <g>
        {/* ICICI Orange/Maroon Bands */}
        <circle cx="20" cy="24" r="15" fill="#F58220" />
        <path d="M12 24 C12 17.4 17.4 12 24 12 C28.5 12 32.4 14.5 34.4 18.2 C31.8 15.6 28.1 14 24 14 C18.5 14 14 18.5 14 24 C14 29.5 18.5 34 24 34 C28.1 34 31.8 32.4 34.4 29.8 C32.4 33.5 28.5 36 24 36 C17.4 36 12 30.6 12 24 Z" fill="#B02A30" />
        <circle cx="20" cy="20" r="2.5" fill="#FFFFFF" />
        <path d="M18.5 25 H21.5 V30 H18.5 Z" fill="#FFFFFF" />
        {/* Wordmark */}
        <text x="42" y="23" fill="#B02A30" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="12" letterSpacing="0.2">
          ICICI Home
        </text>
        <text x="42" y="34" fill="#F58220" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="9.5" letterSpacing="0.5">
          Finance
        </text>
      </g>
    );
  }

  // =========================================================================
  // 3. ICICI BANK
  // =========================================================================
  if (normalized.includes('icici bank') || normalized === 'icici') {
    return renderSvg(
      <g>
        {/* Orange and Maroon circular interlocking arcs */}
        <circle cx="20" cy="24" r="15" fill="#F58220" />
        <path d="M20 12 C26.6 12 32 17.4 32 24 C32 30.6 26.6 36 20 36 C13.4 36 8 30.6 8 24 C8 17.4 13.4 12 20 12 Z" fill="#F58220" />
        <path d="M12 24 C12 17.4 17.4 12 24 12 C28.5 12 32.4 14.5 34.4 18.2 C31.8 15.6 28.1 14 24 14 C18.5 14 14 18.5 14 24 C14 29.5 18.5 34 24 34 C28.1 34 31.8 32.4 34.4 29.8 C32.4 33.5 28.5 36 24 36 C17.4 36 12 30.6 12 24 Z" fill="#B02A30" />
        <circle cx="20" cy="20" r="3" fill="#FFFFFF" />
        <path d="M18.5 25 H21.5 V31 H18.5 Z" fill="#FFFFFF" />
        {/* Wordmark */}
        <text x="42" y="27" fill="#B02A30" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="16" letterSpacing="0.2">
          ICICI <tspan fill="#F58220" fontWeight="700">Bank</tspan>
        </text>
      </g>
    );
  }

  // =========================================================================
  // 4. AXIS FINANCE (Check before Axis Bank)
  // =========================================================================
  if (normalized.includes('axis finance')) {
    return renderSvg(
      <g>
        {/* Axis Maroon Inverted A Triangle */}
        <path d="M8 36 L22 10 L36 36 L27 36 L22 25 L17 36 Z" fill="#97144D" />
        <path d="M22 18 L25.5 26 L18.5 26 Z" fill="#FFFFFF" />
        {/* Wordmark */}
        <text x="44" y="23" fill="#97144D" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" letterSpacing="0.5">
          AXIS
        </text>
        <text x="44" y="34" fill="#2D332E" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="9.5" letterSpacing="0.6">
          FINANCE
        </text>
      </g>
    );
  }

  // =========================================================================
  // 5. AXIS BANK
  // =========================================================================
  if (normalized.includes('axis bank') || normalized === 'axis') {
    return renderSvg(
      <g>
        {/* Inverted Burgundy A Triangle */}
        <path d="M8 36 L22 10 L36 36 L27 36 L22 25 L17 36 Z" fill="#97144D" />
        <path d="M22 18 L25.5 26 L18.5 26 Z" fill="#FFFFFF" />
        {/* Wordmark */}
        <text x="44" y="28" fill="#97144D" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="16.5" letterSpacing="0.8">
          AXIS BANK
        </text>
      </g>
    );
  }

  // =========================================================================
  // 6. STATE BANK OF INDIA (SBI)
  // =========================================================================
  if (normalized.includes('state bank of india') || normalized === 'sbi') {
    return renderSvg(
      <g>
        {/* SBI Blue Circle with keyhole cut-out */}
        <circle cx="20" cy="24" r="16" fill="#00A5DF" />
        <circle cx="20" cy="22" r="5" fill="#FFFFFF" />
        <rect x="18" y="22" width="4" height="18" fill="#FFFFFF" />
        {/* Wordmark */}
        <text x="44" y="23" fill="#280071" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13.5" letterSpacing="0.2">
          State Bank of India
        </text>
        <text x="44" y="34" fill="#00A5DF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="9.5" letterSpacing="1.2">
          THE BANKER TO EVERY INDIAN
        </text>
      </g>
    );
  }

  // =========================================================================
  // 7. CENTRAL BANK OF INDIA
  // =========================================================================
  if (normalized.includes('central bank of india') || normalized === 'cbi') {
    return renderSvg(
      <g>
        {/* Concentric Star / Crest */}
        <circle cx="21" cy="24" r="16" fill="#004B87" />
        <circle cx="21" cy="24" r="13" fill="#FFFFFF" />
        <polygon points="21,14 24,21 31,21 26,26 28,33 21,29 14,33 16,26 11,21 18,21" fill="#E31E24" />
        {/* Wordmark */}
        <text x="44" y="23" fill="#004B87" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="12" letterSpacing="0.2">
          Central Bank of India
        </text>
        <text x="44" y="33" fill="#E31E24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8.5" letterSpacing="0.5">
          1911 से आपके लिए "सेंट्रल"
        </text>
      </g>
    );
  }

  // =========================================================================
  // 8. UNION BANK OF INDIA
  // =========================================================================
  if (normalized.includes('union bank of india') || normalized.includes('union bank')) {
    return renderSvg(
      <g>
        {/* Interlocking Red & Blue U Ribbons */}
        <path d="M12 12 V25 C12 30 16 34 21 34 C24 34 27 32 28 29" stroke="#ED1C24" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M30 12 V25 C30 30 26 34 21 34 C18 34 15 32 14 29" stroke="#0054A6" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Wordmark */}
        <text x="44" y="23" fill="#0054A6" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="12.5" letterSpacing="0.2">
          Union Bank
        </text>
        <text x="44" y="33" fill="#ED1C24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="10" letterSpacing="0.6">
          of India
        </text>
      </g>
    );
  }

  // =========================================================================
  // 9. BANK OF MAHARASHTRA
  // =========================================================================
  if (normalized.includes('bank of maharashtra') || normalized === 'bom') {
    return renderSvg(
      <g>
        {/* Blue Star Diamond with M */}
        <polygon points="21,8 35,24 21,40 7,24" fill="#0054A6" />
        <path d="M13 28 L17 18 L21 24 L25 18 L29 28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Wordmark */}
        <text x="44" y="23" fill="#0054A6" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="12" letterSpacing="0.2">
          Bank of Maharashtra
        </text>
        <text x="44" y="33" fill="#68716A" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.6">
          Ek Parivaar, Ek Bank
        </text>
      </g>
    );
  }

  // =========================================================================
  // 10. BANK OF BARODA
  // =========================================================================
  if (normalized.includes('bank of baroda') || normalized === 'bob') {
    return renderSvg(
      <g>
        {/* Baroda Sun Vermilion Double B Symbol */}
        <rect x="6" y="8" width="32" height="32" rx="6" fill="#F26522" />
        <path d="M13 14 H22 C25 14 27 16 27 18.5 C27 20.5 25.5 22 23.5 22.5 C26 23 28 25 28 27.5 C28 30.5 25.5 33 22 33 H13 V14 Z M18 18 V22 H21 C22 22 23 21 23 20 C23 19 22 18 21 18 H18 Z M18 25 V29 H22 C23 29 24 28 24 27 C24 26 23 25 22 25 H18 Z" fill="#FFFFFF" />
        <path d="M29 12 L34 16 M31 20 L36 22 M31 28 L36 26 M29 34 L34 31" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        {/* Wordmark */}
        <text x="45" y="24" fill="#0B2F64" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="12.5" letterSpacing="0.2">
          Bank of Baroda
        </text>
        <text x="45" y="34" fill="#F26522" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="9" letterSpacing="0.5">
          India's International Bank
        </text>
      </g>
    );
  }

  // =========================================================================
  // 11. BANK OF INDIA (BOI)
  // =========================================================================
  if (normalized.includes('bank of india') || normalized === 'boi') {
    return renderSvg(
      <g>
        {/* BOI Saffron Star of India */}
        <polygon points="21,9 24,19 34,19 26,25 29,35 21,29 13,35 16,25 8,19 18,19" fill="#F37021" />
        <circle cx="21" cy="23" r="3.5" fill="#004B87" />
        {/* Wordmark */}
        <text x="44" y="24" fill="#004B87" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13.5" letterSpacing="0.2">
          Bank of India
        </text>
        <text x="44" y="34" fill="#F37021" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.8">
          Relationship beyond banking
        </text>
      </g>
    );
  }

  // =========================================================================
  // 12. KOTAK BANK
  // =========================================================================
  if (normalized.includes('kotak') || normalized.includes('kotak mahindra')) {
    return renderSvg(
      <g>
        {/* Red Infinite Curve in Navy / Red */}
        <rect x="6" y="8" width="32" height="32" rx="6" fill="#ED1C24" />
        <path d="M14 24 C14 19 18 16 22 20 C26 24 30 21 30 24 C30 27 26 30 22 26 C18 22 14 26 14 24 Z" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Wordmark */}
        <text x="45" y="25" fill="#ED1C24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="17" letterSpacing="0.3">
          kotak
        </text>
        <text x="45" y="35" fill="#0A3A82" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8.5" letterSpacing="0.8">
          Kotak Mahindra Bank
        </text>
      </g>
    );
  }

  // =========================================================================
  // 13. PUNJAB NATIONAL BANK (PNB)
  // =========================================================================
  if (normalized.includes('punjab national') || normalized === 'pnb') {
    return renderSvg(
      <g>
        {/* Maroon Circle with Gold Gurmukhi monogram */}
        <circle cx="21" cy="24" r="16" fill="#A20E3C" />
        <circle cx="21" cy="24" r="14.5" stroke="#FFCB05" strokeWidth="1.2" fill="none" />
        <path d="M15 17 H27 V23 C27 26.5 24 29.5 20.5 29.5 C17 29.5 15 27 15 24 V17 Z" fill="#FFCB05" />
        <circle cx="21" cy="23" r="3" fill="#A20E3C" />
        {/* Wordmark */}
        <text x="44" y="24" fill="#A20E3C" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" letterSpacing="0.3">
          punjab national bank
        </text>
        <text x="44" y="34" fill="#68716A" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.5">
          ...the name you can BANK upon !
        </text>
      </g>
    );
  }

  // =========================================================================
  // 14. IDFC FIRST BANK
  // =========================================================================
  if (normalized.includes('idfc') || normalized.includes('idfc first')) {
    return renderSvg(
      <g>
        {/* Maroon Square Container with Orange Stripe */}
        <rect x="6" y="8" width="32" height="32" rx="4" fill="#9E1B32" />
        <text x="22" y="29" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="15" textAnchor="middle">
          I
        </text>
        <rect x="29" y="8" width="5" height="32" rx="2" fill="#F58220" />
        {/* Wordmark */}
        <text x="44" y="23" fill="#9E1B32" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" letterSpacing="0.2">
          IDFC FIRST
        </text>
        <text x="44" y="34" fill="#2D332E" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="11" letterSpacing="0.5">
          Bank
        </text>
      </g>
    );
  }

  // =========================================================================
  // 15. STANDARD CHARTERED BANK
  // =========================================================================
  if (normalized.includes('standard chartered') || normalized.includes('stanchart')) {
    return renderSvg(
      <g>
        {/* Blue & Green Helix Ribbon */}
        <path d="M12 28 C12 18 20 12 26 12 C30 12 34 16 34 20 C34 26 24 30 18 34" stroke="#007AC3" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M10 20 C10 26 20 36 28 36 C32 36 34 32 34 28" stroke="#00965E" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Wordmark */}
        <text x="44" y="23" fill="#007AC3" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="12" letterSpacing="0.2">
          standard
        </text>
        <text x="44" y="34" fill="#00965E" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="12" letterSpacing="0.2">
          chartered
        </text>
      </g>
    );
  }

  // =========================================================================
  // 16. FEDERAL BANK
  // =========================================================================
  if (normalized.includes('federal bank') || normalized === 'federal') {
    return renderSvg(
      <g>
        {/* Navy Shield with Gold Pillars */}
        <rect x="6" y="8" width="32" height="32" rx="6" fill="#003874" />
        <path d="M12 16 H30 M15 16 V32 M21 16 V32 M27 16 V32 M12 32 H30" stroke="#F58220" strokeWidth="2" strokeLinecap="round" />
        {/* Wordmark */}
        <text x="44" y="24" fill="#003874" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13.5" letterSpacing="0.4">
          FEDERAL BANK
        </text>
        <text x="44" y="34" fill="#F58220" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="8.5" letterSpacing="0.8">
          YOUR PERFECT BANKING PARTNER
        </text>
      </g>
    );
  }

  // =========================================================================
  // 17. IDBI BANK
  // =========================================================================
  if (normalized.includes('idbi')) {
    return renderSvg(
      <g>
        {/* IDBI Green Diamond / Chevron + Sun Dot */}
        <polygon points="12,12 28,12 32,24 20,36 8,24" fill="#006838" />
        <circle cx="20" cy="22" r="4.5" fill="#F37021" />
        {/* Wordmark */}
        <text x="44" y="28" fill="#006838" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="16" letterSpacing="0.8">
          IDBI BANK
        </text>
      </g>
    );
  }

  // =========================================================================
  // 18. BANDHAN BANK
  // =========================================================================
  if (normalized.includes('bandhan')) {
    return renderSvg(
      <g>
        {/* Red Box with Yellow Torch / Knot */}
        <rect x="6" y="8" width="32" height="32" rx="4" fill="#E31E24" />
        <circle cx="22" cy="18" r="4" fill="#FDB813" />
        <path d="M16 28 C16 24 20 22 22 22 C24 22 28 24 28 28 Z" fill="#FDB813" />
        {/* Wordmark */}
        <text x="44" y="24" fill="#2D332E" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13.5" letterSpacing="0.2">
          Bandhan Bank
        </text>
        <text x="44" y="34" fill="#E31E24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="8.5" letterSpacing="0.5">
          Aapka Bhala, Sabki Bhalai
        </text>
      </g>
    );
  }

  // =========================================================================
  // 19. INDUSIND BANK
  // =========================================================================
  if (normalized.includes('indusind')) {
    return renderSvg(
      <g>
        {/* IndusInd Crimson Shield with Zebu Bull Horn Crest */}
        <rect x="6" y="8" width="32" height="32" rx="4" fill="#9B1B1E" />
        <path d="M12 28 C12 20 16 16 22 16 C28 16 32 20 32 28" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="22" cy="22" r="3" fill="#FFC72C" />
        <path d="M18 16 C16 13 14 13 13 14 M26 16 C28 13 30 13 31 14" stroke="#FFC72C" strokeWidth="2" strokeLinecap="round" />
        {/* Wordmark */}
        <text x="44" y="24" fill="#9B1B1E" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="14.5" letterSpacing="0.3">
          IndusInd <tspan fill="#2D332E" fontWeight="700">Bank</tspan>
        </text>
        <text x="44" y="34" fill="#68716A" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.6">
          We Make You Feel Richer
        </text>
      </g>
    );
  }

  // =========================================================================
  // 20. SHAMRAO VITHAL BANK (SVC BANK)
  // =========================================================================
  if (normalized.includes('shamrao vithal') || normalized.includes('svc')) {
    return renderSvg(
      <g>
        {/* SVC Navy & Crimson Crest */}
        <rect x="6" y="8" width="32" height="32" rx="4" fill="#003366" />
        <path d="M12 24 L22 14 L32 24 L22 34 Z" fill="#D62027" />
        <circle cx="22" cy="24" r="4" fill="#FFFFFF" />
        {/* Wordmark */}
        <text x="44" y="24" fill="#003366" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="14" letterSpacing="0.5">
          SVC BANK
        </text>
        <text x="44" y="34" fill="#D62027" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.4">
          EXPERIENCE NEXT-GEN BANKING
        </text>
      </g>
    );
  }

  // =========================================================================
  // 21. TATA CAPITAL
  // =========================================================================
  if (normalized.includes('tata capital') || normalized === 'tata') {
    return renderSvg(
      <g>
        {/* Tata Classic Circle with 'T' Lattice */}
        <circle cx="21" cy="24" r="16" fill="#0067B1" />
        <path d="M13 18 H29 M21 18 V31" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        {/* Wordmark */}
        <text x="45" y="23" fill="#0067B1" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" letterSpacing="0.8">
          TATA CAPITAL
        </text>
        <text x="45" y="34" fill="#2D332E" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8.5" letterSpacing="0.6">
          Count on Us
        </text>
      </g>
    );
  }

  // =========================================================================
  // 22. BAJAJ FINANCE / FINSERV
  // =========================================================================
  if (normalized.includes('bajaj')) {
    return renderSvg(
      <g>
        {/* Bajaj Blue Emblem Circle with Winged B */}
        <circle cx="21" cy="24" r="16" fill="#004B8D" />
        <path d="M16 16 H23 C26 16 28 18 28 20 C28 22 26 23.5 24 24 C27 24.5 29 26.5 29 29 C29 31.5 26.5 33 23 33 H16 V16 Z M20 19 V22 H23 C24 22 25 21 25 20.5 C25 20 24 19 23 19 H20 Z M20 26 V30 H23.5 C24.5 30 25.5 29 25.5 28 C25.5 27 24.5 26 23.5 26 H20 Z" fill="#FFFFFF" />
        {/* Wordmark */}
        <text x="45" y="23" fill="#004B8D" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13.5" letterSpacing="0.5">
          BAJAJ FINSERV
        </text>
        <text x="45" y="34" fill="#68716A" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="9" letterSpacing="0.8">
          BAJAJ FINANCE LIMITED
        </text>
      </g>
    );
  }

  // =========================================================================
  // 23. ADITYA BIRLA CAPITAL
  // =========================================================================
  if (normalized.includes('aditya birla')) {
    return renderSvg(
      <g>
        {/* Rising Sun Rays over Red Arch */}
        <rect x="6" y="8" width="32" height="32" rx="6" fill="#B81E28" />
        <path d="M12 28 C12 20 16 14 22 14 C28 14 32 20 32 28 Z" fill="#FDB813" />
        <circle cx="22" cy="28" r="5" fill="#B81E28" />
        {/* Sunbeams */}
        <line x1="22" y1="10" x2="22" y2="13" stroke="#FDB813" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="13" x2="16" y2="15" stroke="#FDB813" strokeWidth="2" strokeLinecap="round" />
        <line x1="30" y1="13" x2="28" y2="15" stroke="#FDB813" strokeWidth="2" strokeLinecap="round" />
        {/* Wordmark */}
        <text x="45" y="22" fill="#B81E28" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11.5" letterSpacing="0.4">
          ADITYA BIRLA
        </text>
        <text x="45" y="34" fill="#2D332E" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="11" letterSpacing="0.8">
          CAPITAL
        </text>
      </g>
    );
  }

  // =========================================================================
  // 24. L&T FINANCE
  // =========================================================================
  if (normalized.includes('l&t') || normalized.includes('lt finance')) {
    return renderSvg(
      <g>
        {/* L&T Blue Hexagon Monogram */}
        <polygon points="21,8 35,16 35,32 21,40 7,32 7,16" fill="#004B8D" />
        <text x="21" y="28" fill="#FFFFFF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="12" textAnchor="middle">
          L&T
        </text>
        {/* Wordmark */}
        <text x="44" y="24" fill="#004B8D" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="14" letterSpacing="0.5">
          L&T Finance
        </text>
        <text x="44" y="34" fill="#68716A" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8.5" letterSpacing="0.6">
          Financial Services
        </text>
      </g>
    );
  }

  // =========================================================================
  // 25. PIRAMAL FINANCE
  // =========================================================================
  if (normalized.includes('piramal')) {
    return renderSvg(
      <g>
        {/* Interlocking Orange & Green Ribbon */}
        <polygon points="12,12 28,12 22,24 6,24" fill="#F37021" />
        <polygon points="22,24 38,24 32,36 16,36" fill="#00A651" />
        {/* Wordmark */}
        <text x="44" y="24" fill="#F37021" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="14.5" letterSpacing="0.4">
          Piramal
        </text>
        <text x="44" y="34" fill="#00A651" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="9" letterSpacing="0.6">
          FINANCE
        </text>
      </g>
    );
  }

  // =========================================================================
  // 26. POONAWALLA FINCORP
  // =========================================================================
  if (normalized.includes('poonawalla')) {
    return renderSvg(
      <g>
        {/* Multi-Color Butterfly Wing Motif */}
        <path d="M12 14 C12 22 20 24 20 24 C20 24 14 18 12 14 Z" fill="#E31E24" />
        <path d="M22 14 C22 22 14 24 14 24 C14 24 20 18 22 14 Z" fill="#2E3192" />
        <path d="M12 34 C12 26 20 24 20 24 C20 24 14 30 12 34 Z" fill="#00A651" />
        <path d="M22 34 C22 26 14 24 14 24 C14 24 20 30 22 34 Z" fill="#F7941D" />
        <circle cx="17" cy="24" r="3" fill="#2E3192" />
        {/* Wordmark */}
        <text x="36" y="22" fill="#2E3192" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" letterSpacing="0.3">
          POONAWALLA
        </text>
        <text x="36" y="33" fill="#E31E24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="9.5" letterSpacing="0.8">
          FINCORP
        </text>
      </g>
    );
  }

  // =========================================================================
  // 27. SARASWAT CO-OPERATIVE BANK
  // =========================================================================
  if (normalized.includes('saraswat')) {
    return renderSvg(
      <g>
        {/* Saraswat Navy & Saffron Crest */}
        <rect x="6" y="8" width="32" height="32" rx="4" fill="#003366" />
        <circle cx="22" cy="24" r="8" fill="#E65100" />
        <circle cx="22" cy="24" r="4.5" fill="#FFFFFF" />
        <path d="M22 13 V16 M22 32 V35 M11 24 H14 M30 24 H33" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
        {/* Wordmark */}
        <text x="44" y="23" fill="#003366" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="12" letterSpacing="0.4">
          SARASWAT BANK
        </text>
        <text x="44" y="34" fill="#E65100" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.5">
          Co-operative Bank Ltd.
        </text>
      </g>
    );
  }

  // =========================================================================
  // 28. CHOLAMANDALAM (CHOLA)
  // =========================================================================
  if (normalized.includes('cholamandalam') || normalized === 'chola') {
    return renderSvg(
      <g>
        {/* Deep Maroon & Gold Square Emblem */}
        <rect x="6" y="8" width="32" height="32" rx="4" fill="#8C1D40" />
        <path d="M22 14 C16 14 12 18.5 12 24 C12 29.5 16 34 22 34 C26 34 29 31.5 30 28" stroke="#FFB81C" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        {/* Wordmark */}
        <text x="44" y="24" fill="#8C1D40" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13" letterSpacing="0.3">
          Chola
        </text>
        <text x="44" y="34" fill="#2D332E" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.6">
          CHOLAMANDALAM
        </text>
      </g>
    );
  }

  // =========================================================================
  // 29. SUNDARAM HOME FINANCE
  // =========================================================================
  if (normalized.includes('sundaram')) {
    return renderSvg(
      <g>
        {/* Sundaram Royal Blue Spoked Wheel Motif */}
        <circle cx="22" cy="24" r="14" fill="#00488F" />
        <circle cx="22" cy="24" r="10" fill="#FFFFFF" />
        <circle cx="22" cy="24" r="4" fill="#00488F" />
        <path d="M22 14 V34 M12 24 H32 M15 17 L29 31 M15 31 L29 17" stroke="#00488F" strokeWidth="1.5" />
        {/* Wordmark */}
        <text x="44" y="23" fill="#002B49" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="12.5" letterSpacing="0.4">
          SUNDARAM
        </text>
        <text x="44" y="34" fill="#00488F" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="9" letterSpacing="0.5">
          HOME FINANCE
        </text>
      </g>
    );
  }

  // =========================================================================
  // 30. HERO FINCORP
  // =========================================================================
  if (normalized.includes('hero')) {
    return renderSvg(
      <g>
        {/* Hero Red & Black Distinctive 'H' Emblem */}
        <path d="M8 12 H16 V22 H24 V12 H32 V36 H24 V26 H16 V36 H8 Z" fill="#E31E24" />
        <polygon points="24,12 32,12 28,22" fill="#000000" />
        {/* Wordmark */}
        <text x="40" y="24" fill="#E31E24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13.5" letterSpacing="0.4">
          Hero
        </text>
        <text x="73" y="24" fill="#000000" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="13.5" letterSpacing="0.4">
          FinCorp
        </text>
      </g>
    );
  }

  // =========================================================================
  // 31. MAHINDRA FINCORP / FINANCE
  // =========================================================================
  if (normalized.includes('mahindra')) {
    return renderSvg(
      <g>
        {/* Mahindra Signature Red Arcs */}
        <rect x="6" y="8" width="32" height="32" rx="4" fill="#E31E24" />
        <path d="M12 28 L17 16 L22 25 L27 16 L32 28" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Wordmark */}
        <text x="44" y="23" fill="#E31E24" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="12" letterSpacing="0.3">
          Mahindra
        </text>
        <text x="44" y="34" fill="#2D332E" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="10" letterSpacing="0.6">
          FINANCE
        </text>
      </g>
    );
  }

  // =========================================================================
  // 32. HDB FINANCIAL
  // =========================================================================
  if (normalized.includes('hdb')) {
    return renderSvg(
      <g>
        {/* HDB Navy / Cyan Box */}
        <rect x="6" y="8" width="32" height="32" rx="4" fill="#004C8F" />
        <text x="22" y="29" fill="#00A5DF" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="11" textAnchor="middle">
          HDB
        </text>
        {/* Wordmark */}
        <text x="44" y="23" fill="#004C8F" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="12.5" letterSpacing="0.3">
          HDB Financial
        </text>
        <text x="44" y="33" fill="#68716A" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.6">
          Services Ltd.
        </text>
      </g>
    );
  }

  // =========================================================================
  // 33. SMFG INDIA (SMFG INDIA CREDIT)
  // =========================================================================
  if (normalized.includes('smfg')) {
    return renderSvg(
      <g>
        {/* SMFG Dual Arcs (Green & Sunburst Yellow) */}
        <circle cx="22" cy="24" r="14" fill="#00873D" />
        <path d="M12 28 C12 18 18 14 26 14 C20 16 16 20 16 28 Z" fill="#FFC72C" />
        <circle cx="22" cy="24" r="5" fill="#FFFFFF" />
        {/* Wordmark */}
        <text x="44" y="24" fill="#1D2327" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="15" letterSpacing="0.4">
          SMFG <tspan fill="#00873D">India</tspan>
        </text>
        <text x="44" y="34" fill="#00873D" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="8.5" letterSpacing="0.6">
          Credit Co. Ltd.
        </text>
      </g>
    );
  }

  // =========================================================================
  // 34. ANAND RATHI GLOBAL FINANCE
  // =========================================================================
  if (normalized.includes('anand rathi')) {
    return renderSvg(
      <g>
        {/* Maroon & Gold Shield */}
        <rect x="6" y="8" width="32" height="32" rx="4" fill="#6E1022" />
        <circle cx="22" cy="24" r="8" stroke="#D4AF37" strokeWidth="2" fill="none" />
        <path d="M18 24 L22 18 L26 24 M22 18 V30" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
        {/* Wordmark */}
        <text x="44" y="23" fill="#6E1022" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="12" letterSpacing="0.4">
          ANAND RATHI
        </text>
        <text x="44" y="34" fill="#68716A" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.6">
          Financial Services
        </text>
      </g>
    );
  }

  // =========================================================================
  // 35. HSBC BANK
  // =========================================================================
  if (normalized.includes('hsbc')) {
    return renderSvg(
      <g>
        {/* HSBC Iconic Hexagon Emblem */}
        <rect x="6" y="8" width="32" height="32" rx="4" fill="#FFFFFF" stroke="#E5DFD3" strokeWidth="1" />
        <polygon points="8,24 16,16 16,32" fill="#DB0011" />
        <polygon points="36,24 28,16 28,32" fill="#DB0011" />
        <polygon points="22,24 16,16 28,16" fill="#DB0011" />
        <polygon points="22,24 16,32 28,32" fill="#DB0011" />
        {/* Wordmark */}
        <text x="44" y="27" fill="#2D332E" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="17" letterSpacing="1">
          HSBC
        </text>
      </g>
    );
  }

  // =========================================================================
  // 36. DEUTSCHE BANK
  // =========================================================================
  if (normalized.includes('deutsche')) {
    return renderSvg(
      <g>
        {/* Deutsche Bank Iconic Slash in Blue Square */}
        <rect x="6" y="8" width="32" height="32" rx="3" fill="#FFFFFF" stroke="#0018A8" strokeWidth="3" />
        <line x1="12" y1="33" x2="32" y2="15" stroke="#0018A8" strokeWidth="3.5" strokeLinecap="square" />
        {/* Wordmark */}
        <text x="44" y="24" fill="#0018A8" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="13.5" letterSpacing="0.2">
          Deutsche Bank
        </text>
        <text x="44" y="34" fill="#68716A" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="700" fontSize="8" letterSpacing="0.5">
          Corporate & Retail
        </text>
      </g>
    );
  }

  // =========================================================================
  // CLEAN OFFICIAL WORDMARK FALLBACK (If not in mapped list, no fake icons!)
  // =========================================================================
  return (
    <div
      className={`flex items-center justify-center text-center px-2 py-1 font-black text-xs sm:text-sm text-[#2D332E] tracking-wider uppercase ${className}`}
      title={`${name} logo`}
      aria-label={`${name} logo`}
    >
      <span className="border-b-2 border-[#C68B59]/60 pb-0.5">{name}</span>
    </div>
  );
};
