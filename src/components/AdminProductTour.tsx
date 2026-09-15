import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Mail, 
  Lock, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface AdminProductTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  adminName?: string;
}

interface TourStep {
  title: string;
  stepLabel: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
}

export const AdminProductTour: React.FC<AdminProductTourProps> = ({
  isOpen,
  onClose,
  onComplete,
  adminName = 'Staff Member',
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      title: 'Welcome to Staff Administration',
      stepLabel: 'Step 1 of 5: System Orientation',
      subtitle: 'Curated community operations in Abuja, Nigeria',
      description: 'This administrative control suite empowers Bloom and Beyond Ltd staff to oversee community activities, verify attendee RSVPs, and coordinate memberships in strict compliance with the Nigeria Data Protection Regulation (NDPR).',
      icon: <ShieldCheck className="w-8 h-8 text-[#7F876B]" />,
      highlights: [
        'Accurate real-time records synchronized directly from the secure database.',
        'Strict role-based segregation with two-factor authentication safeguards.',
        'Privacy-first architecture with zero third-party telemetry.',
      ],
    },
    {
      title: 'Real-Time Overview and Verified Metrics',
      stepLabel: 'Step 2 of 5: Live Activity Tracking',
      subtitle: 'Accurate engagement metrics without simulated counters',
      description: 'The Overview tab displays verified metric cards calculated directly from active database records. Monitor upcoming events in Abuja, total registered attendees, verified membership applications, and 2026 conference inquiries.',
      icon: <Users className="w-8 h-8 text-[#C97C79]" />,
      highlights: [
        'Live tallies for RSVPs, applications, and partnership inquiries.',
        'System security and cryptographic compliance status overview.',
        'One-click data refresh to pull the latest member submissions.',
      ],
    },
    {
      title: 'Event RSVPs and Attendee Coordination',
      stepLabel: 'Step 3 of 5: Guest Directory & Check-in',
      subtitle: 'Encrypted attendee registers with direct WhatsApp outreach',
      description: 'Access decrypted contact details for upcoming circles, masterclasses, and gatherings. Filter attendees in real time, launch direct WhatsApp communications for logistics, or export clean CSV files for on-site registration desks.',
      icon: <Users className="w-8 h-8 text-[#7F876B]" />,
      highlights: [
        'Full name, email, phone number, and location for every RSVP.',
        'Direct WhatsApp link formatted for Nigerian mobile numbers (+234).',
        'Standard CSV export matching on-site check-in requirements.',
      ],
    },
    {
      title: 'Event CMS & Capacity Management',
      stepLabel: 'Step 4 of 5: Community Calendar',
      subtitle: 'Publish gatherings and toggle real-time availability',
      description: 'Publish new community activities with rich scheduling details, venue locations, and registration deadlines. Manage real-time ticket availability badges between Available, Limited Spaces, Sold Out, and Past Archive.',
      icon: <Calendar className="w-8 h-8 text-[#C97C79]" />,
      highlights: [
        'Categorized listings across Learning, Books, Social, and Outings.',
        'Four-stage ticket availability control for high-demand sessions.',
        'Permanent deletion and status updating with administrative audit checks.',
      ],
    },
    {
      title: 'Security Standards & Data Privacy',
      stepLabel: 'Step 5 of 5: Cryptographic Protection',
      subtitle: 'AES-256-GCM encryption and two-factor authentication',
      description: 'All member identifiables and contact records are protected using AES-256-GCM encryption at rest. Administrative sessions require RFC 6238 TOTP two-factor codes and enforce automatic brute-force lockout safeguards.',
      icon: <Lock className="w-8 h-8 text-[#7F876B]" />,
      highlights: [
        'Mandatory 2FA protection for all staff administrative sessions.',
        '15-minute brute-force lockout after five consecutive bad attempts.',
        'Full compliance with NDPR data retention and privacy standards.',
      ],
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowRight') {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      }
    }
  }, [isOpen, currentStep, steps.length, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  const current = steps[currentStep];

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-step-title"
    >
      <div className="bg-[#FFF9F2] text-[#332A28] max-w-xl w-full rounded-sm shadow-2xl border border-[#E8A6B2]/50 p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-[#E8A6B2]/30 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-sm bg-[#FFF5DE] border border-[#7F876B]/30 flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#7F876B] tracking-wider uppercase">
                {current.stepLabel}
              </span>
              <h3 id="tour-step-title" className="font-editorial text-xl font-bold text-[#332A28]">
                {current.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#332A28]/60 hover:text-[#332A28] rounded-sm transition-colors focus-visible:ring-1 focus-visible:ring-[#C97C79]"
            title="Close onboarding tour"
            aria-label="Close onboarding tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators (Rectangular, strictly no pills) */}
        <div className="flex items-center space-x-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 flex-1 rounded-xs transition-colors ${
                idx === currentStep
                  ? 'bg-[#C97C79]'
                  : idx < currentStep
                  ? 'bg-[#7F876B]'
                  : 'bg-[#E8A6B2]/30'
              }`}
              title={`Jump to step ${idx + 1}`}
              aria-label={`Jump to step ${idx + 1}`}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-[#C97C79] uppercase tracking-wider mb-1">
              {current.subtitle}
            </p>
            <p className="text-xs text-[#332A28]/80 leading-relaxed">
              {current.description}
            </p>
          </div>

          {/* Highlights List */}
          <div className="bg-white p-4 rounded-sm border border-[#E8A6B2]/30 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#332A28]/70 block">
              Key Capabilities:
            </span>
            <ul className="space-y-2">
              {current.highlights.map((h, i) => (
                <li key={i} className="flex items-start space-x-2 text-xs text-[#332A28]/85">
                  <CheckCircle2 className="w-4 h-4 text-[#7F876B] shrink-0 mt-0.5" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Controls (Strictly rounded-sm, 2x horizontal padding) */}
        <div className="pt-2 border-t border-[#E8A6B2]/30 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-medium text-[#332A28]/60 hover:text-[#332A28] transition-colors focus-visible:outline-none focus-visible:underline"
          >
            Skip Onboarding
          </button>

          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="inline-flex items-center space-x-1 px-4 py-2 bg-[#FFF5DE] hover:bg-[#F6D5C5] text-[#332A28] text-xs font-semibold rounded-sm border border-[#7F876B]/30 transition-colors focus-visible:ring-1 focus-visible:ring-[#C97C79]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="inline-flex items-center space-x-1 px-5 py-2 bg-[#332A28] hover:bg-[#C97C79] text-[#FFF9F2] text-xs uppercase tracking-wider font-semibold rounded-sm transition-colors shadow-xs focus-visible:ring-1 focus-visible:ring-[#C97C79]"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              {currentStep < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
