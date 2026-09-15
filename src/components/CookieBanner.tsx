import React, { useState, useEffect } from 'react';
import { Shield, Settings, Check, X } from 'lucide-react';
import { CookiePreferences } from '../types';

interface CookieBannerProps {
  preferences?: CookiePreferences | null;
  onSavePreferences?: (prefs: CookiePreferences) => void;
  onConsentChange?: (prefs: CookiePreferences) => void;
  isOpen?: boolean;
  onClose?: () => void;
  onNavigateToPolicy?: () => void;
  onNavigateToCookies?: () => void;
  forceOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({
  preferences,
  onSavePreferences,
  onConsentChange,
  isOpen = true,
  onClose,
  onNavigateToPolicy,
  onNavigateToCookies,
  forceOpenModal = false,
  onCloseModal,
}) => {
  const [showModal, setShowModal] = useState<boolean>(forceOpenModal);
  const [functionalEnabled, setFunctionalEnabled] = useState<boolean>(preferences?.functional ?? false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(preferences?.analytics ?? false);

  useEffect(() => {
    if (forceOpenModal) {
      setShowModal(true);
    }
  }, [forceOpenModal]);

  useEffect(() => {
    if (preferences) {
      setFunctionalEnabled(Boolean(preferences.functional));
      setAnalyticsEnabled(Boolean(preferences.analytics));
    }
  }, [preferences]);

  const dispatchPreferences = (prefs: CookiePreferences) => {
    if (onSavePreferences) {
      onSavePreferences(prefs);
    }
    if (onConsentChange) {
      onConsentChange(prefs);
    }
    if (onClose) {
      onClose();
    }
    if (onCloseModal) {
      onCloseModal();
    }
    setShowModal(false);
  };

  const handleAcceptAll = () => {
    dispatchPreferences({
      essential: true,
      functional: true,
      analytics: true,
      hasConsented: true,
    });
  };

  const handleRejectNonEssential = () => {
    dispatchPreferences({
      essential: true,
      functional: false,
      analytics: false,
      hasConsented: true,
    });
  };

  const handleSaveCustom = () => {
    dispatchPreferences({
      essential: true,
      functional: functionalEnabled,
      analytics: analyticsEnabled,
      hasConsented: true,
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (onCloseModal) {
      onCloseModal();
    }
  };

  const handleNavigate = () => {
    if (onNavigateToCookies) {
      onNavigateToCookies();
    } else if (onNavigateToPolicy) {
      onNavigateToPolicy();
    }
  };

  const isBannerVisible = isOpen && !showModal;
  const isModalVisible = showModal;

  if (!isBannerVisible && !isModalVisible) return null;

  return (
    <>
      {/* Non-intrusive Cookie Consent Banner */}
      {isOpen && !showModal && (
        <aside
          role="region"
          aria-label="Cookie Consent"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50 bg-[#332A28] text-[#FFF9F2] p-5 rounded-sm shadow-2xl border border-[#C97C79]/30"
        >
          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-[#FFF9F2]/10 rounded-sm text-[#F6D5C5] shrink-0 mt-0.5">
              <Shield className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-sm font-semibold tracking-wide text-[#FFF9F2]">
                Your Privacy & Cookie Choices
              </h2>
              <p className="text-xs text-[#FFF9F2]/80 leading-relaxed">
                SheBlooms (Bloom and Beyond Ltd) uses strictly necessary cookies to ensure secure two-factor authentication and session integrity. Optional analytics cookies help us curate meaningful community experiences without invasive profiling.
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <button
                  id="cookie-accept-all-btn"
                  onClick={handleAcceptAll}
                  className="bg-[#C97C79] hover:bg-[#b56b68] text-[#FFF9F2] text-xs font-semibold px-4 py-2 rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-white"
                >
                  Accept All
                </button>
                <button
                  id="cookie-reject-optional-btn"
                  onClick={handleRejectNonEssential}
                  className="bg-[#FFF9F2]/10 hover:bg-[#FFF9F2]/20 text-[#FFF9F2] text-xs font-medium px-3.5 py-2 rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-white"
                >
                  Essential Only
                </button>
                <button
                  id="cookie-customize-btn"
                  onClick={() => setShowModal(true)}
                  className="text-xs text-[#F6D5C5] hover:text-[#FFF9F2] underline px-2 py-1 flex items-center space-x-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Customize</span>
                </button>
                <button
                  onClick={handleNavigate}
                  className="text-xs text-[#FFF9F2]/60 hover:text-[#FFF9F2] underline px-1 py-1"
                >
                  Read Policy
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Detailed Granular Preferences Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
        >
          <div className="bg-[#FFF9F2] text-[#332A28] max-w-lg w-full rounded-sm shadow-2xl border border-[#E8A6B2]/40 p-6 space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#E8A6B2]/30 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[#C97C79]" />
                <h3 id="cookie-modal-title" className="font-editorial text-xl font-bold text-[#332A28]">
                  Cookie Preferences
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-sm text-[#332A28]/60 hover:text-[#332A28] focus-visible:ring-2 focus-visible:ring-[#C97C79]"
                aria-label="Close Cookie Preferences Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#332A28]/80 leading-relaxed">
              In accordance with Nigeria Data Protection Regulation (NDPR) principles, you hold sovereign control over what tracking is enabled during your visit.
            </p>

            <div className="space-y-4 text-xs">
              {/* Essential Cookies */}
              <div className="p-3 bg-[#FFF5DE] rounded-sm border border-[#E8A6B2]/30 flex items-start justify-between">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-[#332A28]">Strictly Necessary Cookies</span>
                    <span className="bg-[#7F876B] text-white text-[10px] px-1.5 py-0.5 rounded-sm">Required</span>
                  </div>
                  <p className="text-[#332A28]/70">
                    Required for basic site security, form CSRF verification, and two-factor authentication tokens. Cannot be deactivated.
                  </p>
                </div>
                <div className="pt-1">
                  <span className="text-xs font-semibold text-[#7F876B] flex items-center">
                    <Check className="w-4 h-4 mr-1" /> Active
                  </span>
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="p-3 bg-white rounded-sm border border-[#E8A6B2]/30 flex items-start justify-between">
                <div className="space-y-1 pr-4">
                  <span className="font-semibold text-sm text-[#332A28]">Functional Preferences</span>
                  <p className="text-[#332A28]/70">
                    Remembers your reading font sizing, dismissals, and draft values while completing forms so you don't lose progress.
                  </p>
                </div>
                <div className="pt-1">
                  <input
                    type="checkbox"
                    id="functional-cookie-toggle"
                    checked={functionalEnabled}
                    onChange={(e) => setFunctionalEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#C97C79] focus:ring-[#C97C79] rounded-xs cursor-pointer"
                  />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="p-3 bg-white rounded-sm border border-[#E8A6B2]/30 flex items-start justify-between">
                <div className="space-y-1 pr-4">
                  <span className="font-semibold text-sm text-[#332A28]">Curated Analytics (Anonymous)</span>
                  <p className="text-[#332A28]/70">
                    Measures aggregate page views to help our team understand which activities interest women most. No cross-site profiling or third-party ad networks.
                  </p>
                </div>
                <div className="pt-1">
                  <input
                    type="checkbox"
                    id="analytics-cookie-toggle"
                    checked={analyticsEnabled}
                    onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#C97C79] focus:ring-[#C97C79] rounded-xs cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[#E8A6B2]/30 pt-4 flex items-center justify-between gap-2">
              <button
                onClick={handleRejectNonEssential}
                className="text-xs text-[#332A28]/70 hover:text-[#332A28] underline"
              >
                Reject Non-Essential
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveCustom}
                  className="bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] text-xs font-semibold px-4 py-2 rounded-sm transition-colors"
                >
                  Save My Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="bg-[#C97C79] text-[#FFF9F2] hover:bg-[#b56b68] text-xs font-semibold px-4 py-2 rounded-sm transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
