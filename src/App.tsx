import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ApplyModal } from './components/ApplyModal';
import { AIAdvisorModal } from './components/AIAdvisorModal';
import { ReviewModal } from './components/ReviewModal';
import { ShareReviewModal } from './components/ShareReviewModal';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { PartnersPage } from './pages/PartnersPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { LegalPage } from './pages/LegalPage';
import { EMICalculatorSection } from './components/EMICalculatorSection';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname || '/'
  );

  // Modal States
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedLoanForApply, setSelectedLoanForApply] = useState<string | undefined>(undefined);
  const [aiAdvisorOpen, setAIAdvisorOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Handle browser popstate for back/forward buttons
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (path: string) => {
    if (path === '/ai-advisor') {
      setAIAdvisorOpen(true);
      return;
    }
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenApply = (loanType?: string) => {
    setSelectedLoanForApply(loanType);
    setApplyModalOpen(true);
  };

  // Render Page Content based on path
  const renderContent = () => {
    if (currentPath === '/' || currentPath === '') {
      return (
        <HomePage
          onOpenApplyModal={handleOpenApply}
          onOpenEMICalculator={() => navigate('/emi-calculator')}
          onOpenAIAdvisor={() => setAIAdvisorOpen(true)}
          onOpenWriteReview={() => setReviewModalOpen(true)}
          onOpenShareModal={() => setShareModalOpen(true)}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/about') {
      return <AboutPage onOpenApplyModal={() => handleOpenApply()} onNavigate={navigate} />;
    }

    if (currentPath === '/services') {
      return (
        <ServicesPage
          onSelectLoanForApply={(l) => handleOpenApply(l)}
          onNavigateToDetail={(slug) => navigate(`/services/${slug}`)}
        />
      );
    }

    if (currentPath.startsWith('/services/')) {
      const slug = currentPath.replace('/services/', '');
      return (
        <ServiceDetailPage
          slug={slug}
          onOpenAIAdvisor={() => setAIAdvisorOpen(true)}
          onNavigateToAllServices={() => navigate('/services')}
        />
      );
    }

    if (currentPath === '/resources/documents' || currentPath === '/resources') {
      return <DocumentsPage onOpenApplyModal={() => handleOpenApply()} />;
    }

    if (currentPath === '/emi-calculator') {
      return (
        <div className="w-full bg-[#FDFCF8] py-8">
          <EMICalculatorSection onNavigateToApply={(l) => handleOpenApply(l)} />
        </div>
      );
    }

    if (currentPath === '/partners') {
      return <PartnersPage onOpenApplyModal={() => handleOpenApply()} />;
    }

    if (currentPath === '/reviews') {
      return (
        <ReviewsPage
          onOpenWriteModal={() => setReviewModalOpen(true)}
          onOpenShareModal={() => setShareModalOpen(true)}
        />
      );
    }

    if (currentPath === '/reviews/write') {
      return (
        <ReviewsPage
          onOpenWriteModal={() => setReviewModalOpen(true)}
          onOpenShareModal={() => setShareModalOpen(true)}
          isWriteView={true}
        />
      );
    }

    if (currentPath === '/contact') {
      return <ContactPage />;
    }

    if (currentPath === '/login') {
      return (
        <LoginPage
          onOpenApplyModal={() => handleOpenApply()}
          onOpenAIAdvisor={() => setAIAdvisorOpen(true)}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/customer/dashboard' || currentPath === '/customer') {
      return (
        <CustomerDashboardPage
          onNavigate={navigate}
          onOpenAIAdvisor={() => setAIAdvisorOpen(true)}
          onOpenApplyModal={() => handleOpenApply()}
        />
      );
    }

    if (currentPath === '/privacy-policy') {
      return <LegalPage type="privacy" />;
    }

    if (currentPath === '/terms') {
      return <LegalPage type="terms" />;
    }

    if (currentPath === '/disclaimer') {
      return <LegalPage type="disclaimer" />;
    }

    if (currentPath === '/cookie-policy') {
      return <LegalPage type="cookie" />;
    }

    // Default Fallback
    return (
      <HomePage
        onOpenApplyModal={handleOpenApply}
        onOpenEMICalculator={() => navigate('/emi-calculator')}
        onOpenAIAdvisor={() => setAIAdvisorOpen(true)}
        onOpenWriteReview={() => setReviewModalOpen(true)}
        onOpenShareModal={() => setShareModalOpen(true)}
        onNavigate={navigate}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF8] text-[#2D332E] antialiased">
      {/* 1. STICKY HEADER */}
      <Header
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenApplyModal={handleOpenApply}
        onOpenAIAdvisor={() => setAIAdvisorOpen(true)}
      />

      {/* 2. MAIN BODY */}
      <main className="flex-1 w-full">{renderContent()}</main>

      {/* 3. FOOTER */}
      <Footer onNavigate={navigate} />

      {/* 4. FLOATING WHATSAPP BUTTON */}
      <FloatingWhatsApp />

      {/* 5. MODALS */}
      <ApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        initialLoanType={selectedLoanForApply}
      />

      <AIAdvisorModal
        isOpen={aiAdvisorOpen}
        onClose={() => setAIAdvisorOpen(false)}
        onNavigateToApply={handleOpenApply}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />

      <ShareReviewModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  );
}

export default App;
