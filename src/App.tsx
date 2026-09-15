import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { AuthModal } from './components/AuthModal';
import { EventModal } from './components/EventModal';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { EventsPage } from './pages/EventsPage';
import { ConferencePage } from './pages/ConferencePage';
import { JoinPage } from './pages/JoinPage';
import { BooksPage } from './pages/BooksPage';
import { FaqPage } from './pages/FaqPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { CookiesPolicyPage } from './pages/CookiesPolicyPage';
import { MemberDashboardPage } from './pages/MemberDashboardPage';

import { SheBloomsEvent, UserProfile, CookieSettings } from './types';

export const App: React.FC = () => {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');

  // Events Data
  const [events, setEvents] = useState<SheBloomsEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<SheBloomsEvent | null>(null);

  // Authentication & 2FA State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Cookie Consent
  const [cookieSettings, setCookieSettings] = useState<CookieSettings | null>(null);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState<boolean>(false);

  // Fetch Events from Secure Backend
  const loadEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Restore session & load cookies on mount
  useEffect(() => {
    loadEvents();

    // Check stored user session
    const storedUser = localStorage.getItem('sheblooms_user');
    const storedToken = localStorage.getItem('sheblooms_token');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (storedToken && !parsed.sessionToken) {
          parsed.sessionToken = storedToken;
        }
        setCurrentUser(parsed);
      } catch (e) {
        localStorage.removeItem('sheblooms_user');
        localStorage.removeItem('sheblooms_token');
      }
    }

    // Check stored cookie preferences
    const storedCookies = localStorage.getItem('sheblooms_cookie_consent');
    if (storedCookies) {
      try {
        setCookieSettings(JSON.parse(storedCookies));
      } catch (e) {
        // ignore
      }
    }

    // Handle browser back/forward buttons
    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '') || 'home';
      setCurrentPage(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      window.history.pushState({}, '', `/${page === 'home' ? '' : page}`);
    } catch (e) {
      // safe fallback in iframe environments
    }
  };

  const handleAuthSuccess = (user: UserProfile, token?: string) => {
    const sessionToken = token || localStorage.getItem('sheblooms_token') || '';
    const userWithToken: UserProfile = {
      ...user,
      sessionToken,
    };
    setCurrentUser(userWithToken);
    localStorage.setItem('sheblooms_user', JSON.stringify(userWithToken));
    if (sessionToken) {
      localStorage.setItem('sheblooms_token', sessionToken);
    }
    setIsAuthModalOpen(false);
    if (user.role === 'admin') {
      handleNavigate('dashboard');
    }
  };

  const handleLogout = () => {
    const token = localStorage.getItem('sheblooms_token');
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(() => {});
    }
    setCurrentUser(null);
    localStorage.removeItem('sheblooms_user');
    localStorage.removeItem('sheblooms_token');
    if (currentPage === 'dashboard') {
      handleNavigate('home');
    }
  };

  const handleSaveCookieSettings = (settings: CookieSettings) => {
    setCookieSettings(settings);
    localStorage.setItem('sheblooms_cookie_consent', JSON.stringify(settings));
    setIsCookieModalOpen(false);
  };

  const handleOpenCookiePreferences = () => {
    setIsCookieModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F2] text-[#332A28] font-sans antialiased selection:bg-[#F6D5C5] selection:text-[#332A28]">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[#332A28] text-[#FFF9F2] px-4 py-2 text-xs font-semibold rounded-sm shadow-md"
      >
        Skip to main content
      </a>

      {/* Main Global Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-grow focus:outline-none">
        {currentPage === 'home' && (
          <HomePage
            events={events}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'events' && (
          <EventsPage
            events={events}
            onSelectEvent={(evt) => setSelectedEvent(evt)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'conference' && (
          <ConferencePage
            onNavigate={handleNavigate}
            onNavigateToPrivacy={() => handleNavigate('privacy')}
          />
        )}

        {currentPage === 'join' && (
          <JoinPage
            onNavigateToPrivacy={() => handleNavigate('privacy')}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentPage === 'books' && (
          <BooksPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'faq' && (
          <FaqPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'gallery' && (
          <GalleryPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'contact' && (
          <ContactPage
            onNavigateToPrivacy={() => handleNavigate('privacy')}
          />
        )}

        {currentPage === 'privacy' && (
          <PrivacyPolicyPage />
        )}

        {currentPage === 'terms' && (
          <TermsPage />
        )}

        {currentPage === 'cookies' && (
          <CookiesPolicyPage
            onOpenCookiePreferences={handleOpenCookiePreferences}
          />
        )}

        {currentPage === 'dashboard' && (
          currentUser ? (
            <MemberDashboardPage
              user={currentUser}
              events={events}
              onRefreshEvents={loadEvents}
              onLogout={handleLogout}
              onNavigate={handleNavigate}
            />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white border border-[#E8A6B2]/40 rounded-sm text-center space-y-5 shadow-xs">
              <div className="w-12 h-12 rounded-sm bg-[#FFF5DE] flex items-center justify-center mx-auto text-[#7F876B] border border-[#7F876B]/30">
                <ShieldCheck className="w-6 h-6 text-[#7F876B]" />
              </div>
              <div className="space-y-1">
                <h2 className="font-editorial text-2xl font-bold text-[#332A28]">
                  Restricted Access
                </h2>
                <p className="text-xs text-[#332A28]/75 leading-relaxed">
                  This administrative control suite is restricted to authorized SheBlooms operations personnel.
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleNavigate('home')}
                  className="w-full bg-[#332A28] hover:bg-[#C97C79] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold py-3 rounded-sm transition-colors shadow-xs"
                >
                  Return to Home
                </button>
                <button
                  id="staff-admin-login-prompt-btn"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full text-xs text-[#332A28]/50 hover:text-[#332A28] py-2 transition-colors focus-visible:outline-none"
                >
                  Staff authorization
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Global Footer with business details, navigation, and staff login */}
      <Footer 
        onNavigate={handleNavigate} 
        onOpenCookieSettings={handleOpenCookiePreferences}
        onOpenAuth={() => {
          if (currentUser?.role === 'admin') {
            handleNavigate('dashboard');
          } else {
            setIsAuthModalOpen(true);
          }
        }}
      />

      {/* Persistent WhatsApp Floating Button */}
      <WhatsAppFloatingButton currentPage={currentPage} />

      {/* Event Details and RSVP Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onNavigateToPrivacy={() => {
            setSelectedEvent(null);
            handleNavigate('privacy');
          }}
        />
      )}

      {/* 2FA Authentication Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
          onNavigateToPrivacy={() => {
            setIsAuthModalOpen(false);
            handleNavigate('privacy');
          }}
        />
      )}

      {/* Cookie Consent Banner & Granular Settings Modal */}
      {(!cookieSettings?.hasConsented || isCookieModalOpen) && (
        <CookieBanner
          preferences={cookieSettings}
          isOpen={!cookieSettings?.hasConsented}
          forceOpenModal={isCookieModalOpen}
          onCloseModal={() => setIsCookieModalOpen(false)}
          onSavePreferences={handleSaveCookieSettings}
          onConsentChange={handleSaveCookieSettings}
          onNavigateToCookies={() => handleNavigate('cookies')}
          onNavigateToPolicy={() => handleNavigate('cookies')}
        />
      )}
    </div>
  );
};

export default App;
