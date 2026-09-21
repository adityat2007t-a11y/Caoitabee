import React, { useEffect } from 'react';
import { LOAN_PRODUCTS, BRAND_CONFIG } from '../config';

interface SEOHeadProps {
  currentPath: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ currentPath }) => {
  useEffect(() => {
    let title = `${BRAND_CONFIG.shortName} | Pan-India Loan Assistance & Financing`;
    let description =
      'Pan-India Loan Assistance for Home Loans, LAP, Business Loans, Working Capital, Commercial & Industrial Property Loans, Gold Loans, and 35+ partner banks & NBFCs.';
    let canonical = 'https://capitabee.com/';
    let robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    // Route matching
    if (currentPath === '/' || currentPath === '') {
      title = `${BRAND_CONFIG.shortName} | Pan-India Loan Assistance & Financing`;
      description =
        'Pan-India Loan Assistance for Home Loans, LAP, Business Loans, Working Capital, Commercial & Industrial Property Loans, Gold Loans, and 35+ partner banks & NBFCs.';
      canonical = 'https://capitabee.com/';
    } else if (
      currentPath === '/about' ||
      currentPath === '/leadership' ||
      currentPath === '/team' ||
      currentPath === '/our-team'
    ) {
      title = `About Us & Leadership Team | ${BRAND_CONFIG.shortName}`;
      description =
        'Learn about Capitabee Financial Services, our mission, 12-stage transparent loan journey, and executive leadership team based in Thane, Maharashtra.';
      canonical = 'https://capitabee.com/about';
    } else if (currentPath === '/services') {
      title = `Loan Services & Financing Solutions | ${BRAND_CONFIG.shortName}`;
      description =
        'Explore 17 structured loan products across India including Working Capital, Home Loans, LAP, Business Loans, Commercial & Industrial Financing, and Gold Loans.';
      canonical = 'https://capitabee.com/services';
    } else if (currentPath.startsWith('/services/')) {
      const slug = currentPath.replace('/services/', '').toLowerCase();
      const product = LOAN_PRODUCTS.find((p) => p.slug.toLowerCase() === slug);
      if (product) {
        title = `${product.name} Assistance in India | ${BRAND_CONFIG.shortName}`;
        description = product.description.length > 155
          ? `${product.description.slice(0, 152)}...`
          : product.description;
        canonical = `https://capitabee.com/services/${product.slug}`;
      } else {
        title = `Loan Products | ${BRAND_CONFIG.shortName}`;
        canonical = 'https://capitabee.com/services';
      }
    } else if (currentPath === '/emi-calculator') {
      title = `Loan EMI Calculator | ${BRAND_CONFIG.shortName}`;
      description =
        'Calculate monthly installments, total interest payable, and amortization breakdown for Home Loans, Business Loans, and LAP with our accurate EMI calculator.';
      canonical = 'https://capitabee.com/emi-calculator';
    } else if (currentPath === '/partners') {
      title = `Partner Banks & Lending Network | ${BRAND_CONFIG.shortName}`;
      description =
        'Connect with our network of 35+ leading commercial banks, housing finance companies, and NBFCs across India for optimal loan terms.';
      canonical = 'https://capitabee.com/partners';
    } else if (currentPath === '/resources/documents' || currentPath === '/resources') {
      title = `Loan Documentation Checklist & Required Documents | ${BRAND_CONFIG.shortName}`;
      description =
        'Comprehensive checklist of KYC, income, business, and property documents required for faster loan appraisal and sanction across India.';
      canonical = 'https://capitabee.com/resources/documents';
    } else if (currentPath === '/reviews' || currentPath === '/reviews/write') {
      title = `Customer Reviews & Client Experiences | ${BRAND_CONFIG.shortName}`;
      description =
        'Read verified feedback and testimonials from business owners, home buyers, and entrepreneurs who secured loans with Capitabee Financial Services.';
      canonical = 'https://capitabee.com/reviews';
    } else if (currentPath === '/contact') {
      title = `Contact Us & Advisory Office | ${BRAND_CONFIG.shortName}`;
      description =
        'Get in touch with Capitabee Financial Services in Thane (W), Maharashtra. Call +91 8010886625 or connect on WhatsApp for personalized loan assistance.';
      canonical = 'https://capitabee.com/contact';
    } else if (currentPath === '/privacy-policy') {
      title = `Privacy Policy | ${BRAND_CONFIG.shortName}`;
      description =
        'Capitabee Financial Services Privacy Policy. How we collect, safeguard, and process your personal and financial documentation with banking-grade security.';
      canonical = 'https://capitabee.com/privacy-policy';
    } else if (currentPath === '/terms') {
      title = `Terms of Service | ${BRAND_CONFIG.shortName}`;
      description =
        'Terms and conditions governing loan advisory, documentation assistance, and digital services provided by Capitabee Financial Services.';
      canonical = 'https://capitabee.com/terms';
    } else if (currentPath === '/disclaimer') {
      title = `Financial & Loan Disclaimer | ${BRAND_CONFIG.shortName}`;
      description =
        'Important loan disclaimers regarding credit evaluation, indicative interest rates, and regulatory compliance under applicable financial guidelines.';
      canonical = 'https://capitabee.com/disclaimer';
    } else if (currentPath === '/cookie-policy') {
      title = `Cookie Policy | ${BRAND_CONFIG.shortName}`;
      description =
        'Information on how Capitabee Financial Services uses cookies and essential web technologies to maintain portal sessions and website security.';
      canonical = 'https://capitabee.com/cookie-policy';
    } else if (currentPath === '/login') {
      title = `Customer Portal Login | ${BRAND_CONFIG.shortName}`;
      description =
        'Secure customer login for Capitabee Financial Services loan applicants to track sanction stages and upload required documents.';
      canonical = 'https://capitabee.com/login';
      robots = 'noindex, nofollow'; // Private portal should not be indexed in Google
    } else if (
      currentPath === '/customer/dashboard' ||
      currentPath === '/customer' ||
      currentPath === '/dashboard'
    ) {
      title = `Customer Dashboard | ${BRAND_CONFIG.shortName}`;
      description =
        'Track your 12-stage loan progress, view verified documents, and communicate with your assigned loan officer.';
      canonical = 'https://capitabee.com/customer/dashboard';
      robots = 'noindex, nofollow'; // Private authenticated area
    }

    // Apply document title
    document.title = title;

    // Helper to safely set meta tag content
    const setMetaTag = (selector: string, attr: string, value: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        if (selector.includes('property=')) {
          const propName = selector.match(/property="([^"]+)"/)?.[1];
          if (propName) element.setAttribute('property', propName);
        } else if (selector.includes('name=')) {
          const nameValue = selector.match(/name="([^"]+)"/)?.[1];
          if (nameValue) element.setAttribute('name', nameValue);
        }
        document.head.appendChild(element);
      }
      element.setAttribute(attr, value);
    };

    // Helper to set link tags
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!element) {
        element = document.createElement('link');
        element.rel = rel;
        document.head.appendChild(element);
      }
      element.href = href;
    };

    // Update Meta Description
    setMetaTag('meta[name="description"]', 'content', description);

    // Update Robots
    setMetaTag('meta[name="robots"]', 'content', robots);

    // Update Canonical
    setLinkTag('canonical', canonical);

    // Update OpenGraph
    setMetaTag('meta[property="og:title"]', 'content', title);
    setMetaTag('meta[property="og:description"]', 'content', description);
    setMetaTag('meta[property="og:url"]', 'content', canonical);

    // Update Twitter
    setMetaTag('meta[name="twitter:title"]', 'content', title);
    setMetaTag('meta[name="twitter:description"]', 'content', description);
    setMetaTag('meta[name="twitter:url"]', 'content', canonical);
  }, [currentPath]);

  return null;
};
