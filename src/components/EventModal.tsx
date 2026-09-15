import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  Check, 
  AlertCircle, 
  MessageCircle, 
  X, 
  ShieldCheck, 
  HelpCircle,
  Sparkles,
  Plane
} from 'lucide-react';
import { SheBloomsEvent } from '../types';

interface EventModalProps {
  event: SheBloomsEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPrivacy: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onNavigateToPrivacy,
}) => {
  // Form State
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [attendeesCount, setAttendeesCount] = useState(1);
  const [message, setMessage] = useState('');
  const [consentGranted, setConsentGranted] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<{ message: string; paymentNote: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGranted) {
      setError('Please agree to data processing in accordance with our Privacy Policy.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          firstName,
          surname,
          email,
          whatsapp,
          attendeesCount,
          message,
          consentGranted,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit registration.');

      setSubmitted(true);
      setSubmissionFeedback({
        message: data.message,
        paymentNote: data.paymentNote,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving your reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetModal = () => {
    setFirstName('');
    setSurname('');
    setEmail('');
    setWhatsapp('');
    setAttendeesCount(1);
    setMessage('');
    setConsentGranted(false);
    setSubmitted(false);
    setSubmissionFeedback(null);
    setError(null);
    onClose();
  };

  const whatsappMessage = encodeURIComponent(
    `Hello SheBlooms Abuja, I would like to ask a question regarding the experience: "${event.title}".`
  );

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
    >
      <div className="bg-[#FFF9F2] text-[#332A28] max-w-3xl w-full rounded-sm shadow-2xl border border-[#E8A6B2]/40 overflow-hidden my-6 animate-in fade-in">
        {/* Top Header Banner */}
        <div className="relative h-56 sm:h-72 w-full bg-[#332A28] overflow-hidden">
          <img
            src={event.image}
            alt={`Atmosphere photo for ${event.title}`}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#332A28] via-[#332A28]/40 to-transparent"></div>

          {/* Close button */}
          <button
            onClick={resetModal}
            className="absolute top-4 right-4 bg-[#332A28]/80 text-[#FFF9F2] hover:bg-[#332A28] p-2 rounded-sm focus-visible:ring-2 focus-visible:ring-[#C97C79]"
            aria-label="Close activity details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category & Status Badges */}
          <div className="absolute bottom-4 left-4 sm:left-8 right-4 text-[#FFF9F2]">
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-[#C97C79] text-[#FFF9F2] text-xs font-semibold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                {event.category}
              </span>
              <span className="bg-[#FFF9F2]/20 backdrop-blur-xs text-[#FFF9F2] text-xs font-medium px-2.5 py-1 rounded-sm">
                Price: {event.price}
              </span>
              {event.status && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-sm uppercase tracking-wider ${
                  event.status === 'Sold Out' 
                    ? 'bg-[#332A28] text-[#FFF9F2]' 
                    : event.status === 'Limited Spaces' 
                    ? 'bg-[#C97C79] text-[#FFF9F2]' 
                    : 'bg-[#7F876B] text-[#FFF9F2]'
                }`}>
                  {event.status}
                </span>
              )}
              {event.isPast && (
                <span className="bg-[#7F876B] text-[#FFF9F2] text-xs font-semibold px-2 py-1 rounded-sm">
                  Past Event
                </span>
              )}
            </div>
            <h1 id="event-modal-title" className="font-editorial text-2xl sm:text-3xl font-bold text-[#FFF9F2] leading-tight">
              {event.title}
            </h1>
            {event.registrationDeadline && (
              <p className="text-xs text-[#FFF9F2]/90 mt-1">
                Registration Deadline: <span className="font-semibold">{event.registrationDeadline}</span>
              </p>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Key Quick Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#FFF5DE] rounded-sm border border-[#E8A6B2]/40 text-xs">
            <div className="flex items-start space-x-2.5">
              <Calendar className="w-4 h-4 text-[#C97C79] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#332A28] block">Date</span>
                <span className="text-[#332A28]/80">{event.date}</span>
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <Clock className="w-4 h-4 text-[#C97C79] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#332A28] block">Time</span>
                <span className="text-[#332A28]/80">{event.time}</span>
              </div>
            </div>
            <div className="flex items-start space-x-2.5">
              <MapPin className="w-4 h-4 text-[#C97C79] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#332A28] block">Location</span>
                <span className="text-[#332A28]/80">{event.location}</span>
              </div>
            </div>
          </div>

          {/* Section: About this Experience */}
          <div className="space-y-2">
            <h2 className="font-editorial text-xl font-bold text-[#332A28]">
              About This Experience
            </h2>
            <p className="text-sm text-[#332A28]/85 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Section: What to Expect */}
          <div className="space-y-2">
            <h2 className="font-editorial text-lg font-bold text-[#332A28]">
              What to Expect
            </h2>
            <p className="text-sm text-[#332A28]/85 leading-relaxed bg-white p-4 rounded-sm border border-[#E8A6B2]/30">
              {event.whatToExpect}
            </p>
          </div>

          {/* Section: Practical Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {event.dressCode && (
              <div className="p-3 bg-white rounded-sm border border-[#E8A6B2]/30">
                <span className="text-xs uppercase tracking-wider text-[#7F876B] font-semibold block mb-1">
                  Dress Code
                </span>
                <span className="text-xs text-[#332A28]">{event.dressCode}</span>
              </div>
            )}
            {event.whatIsIncluded && (
              <div className="p-3 bg-white rounded-sm border border-[#E8A6B2]/30">
                <span className="text-xs uppercase tracking-wider text-[#7F876B] font-semibold block mb-1">
                  What is Included
                </span>
                <span className="text-xs text-[#332A28]">{event.whatIsIncluded}</span>
              </div>
            )}
            {event.whatToBring && (
              <div className="p-3 bg-white rounded-sm border border-[#E8A6B2]/30">
                <span className="text-xs uppercase tracking-wider text-[#7F876B] font-semibold block mb-1">
                  What to Bring
                </span>
                <span className="text-xs text-[#332A28]">{event.whatToBring}</span>
              </div>
            )}
          </div>

          {/* Section: Coming Alone? (Brand Promise from SheBlooms Spec) */}
          <div className="p-4 bg-[#F6D5C5]/40 rounded-sm border border-[#C97C79]/40 space-y-1">
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#332A28]">
              Coming Alone?
            </h3>
            <p className="text-xs text-[#332A28]/85 leading-relaxed">
              Absolutely fine. SheBlooms experiences are intentionally designed to make it effortless to arrive by yourself. Our hosts welcome you warmly at the entrance, introductions occur naturally, and you will not be alone for long.
            </p>
          </div>

          {/* Special Travel Case (Optional fields) */}
          {event.isTravel && event.travelDetails && (
            <div className="p-5 bg-white rounded-sm border border-[#E8A6B2]/50 space-y-4">
              <div className="flex items-center space-x-2 text-[#C97C79]">
                <Plane className="w-5 h-5" />
                <h3 className="font-editorial text-lg font-bold text-[#332A28]">
                  Travel & Journey Details
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-semibold text-[#332A28]">Route:</span> {event.travelDetails.route}
                </div>
                <div>
                  <span className="font-semibold text-[#332A28]">Accommodation:</span> {event.travelDetails.accommodation}
                </div>
                <div>
                  <span className="font-semibold text-[#332A28]">Included:</span> {event.travelDetails.whatsIncluded}
                </div>
                <div>
                  <span className="font-semibold text-[#332A28]">Not Included:</span> {event.travelDetails.whatsNotIncluded}
                </div>
                <div>
                  <span className="font-semibold text-[#332A28]">Deposit:</span> {event.travelDetails.deposit}
                </div>
                <div>
                  <span className="font-semibold text-[#332A28]">Payment Schedule:</span> {event.travelDetails.paymentSchedule}
                </div>
                <div className="sm:col-span-2">
                  <span className="font-semibold text-[#332A28]">Cancellation Terms:</span> {event.travelDetails.cancellationTerms}
                </div>
              </div>
            </div>
          )}

          {/* Section: Registration Form (Or Submitted Confirmation) */}
          {!event.isPast ? (
            <div className="border-t border-[#E8A6B2]/40 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#332A28]">
                    Reserve Your Place
                  </h3>
                  <p className="text-xs text-[#332A28]/70">
                    No online payment needed. Direct offline verification upon reservation.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-[#FFF5DE] border border-[#E8A6B2]/40 rounded-sm text-[#332A28]">
                  {event.price === 'Free' ? 'Free Event' : `Fee: ${event.price}`}
                </span>
              </div>

              {submitted ? (
                <div className="p-6 bg-[#FFF5DE] border border-[#7F876B]/40 rounded-sm space-y-3 animate-in fade-in">
                  <div className="flex items-center space-x-2 text-[#7F876B]">
                    <Check className="w-6 h-6 text-[#7F876B]" />
                    <h4 className="font-editorial text-lg font-bold text-[#332A28]">
                      YOU’RE ON THE LIST.
                    </h4>
                  </div>
                  <p className="text-xs text-[#332A28]/85 leading-relaxed">
                    We've received your details. The SheBlooms team will contact you with the next steps and payment information where applicable.
                  </p>
                  {submissionFeedback?.paymentNote && (
                    <div className="p-3 bg-white rounded-sm border border-[#E8A6B2]/30 text-xs text-[#332A28]">
                      <span className="font-semibold block mb-0.5">Payment Details:</span>
                      {submissionFeedback.paymentNote}
                    </div>
                  )}
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={resetModal}
                      className="bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] text-xs uppercase tracking-wider font-semibold px-4 py-2.5 rounded-sm transition-colors"
                    >
                      Back to What's On
                    </button>
                    <a
                      href={`https://wa.me/2348092345667?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 border border-[#332A28]/30 hover:bg-white text-[#332A28] text-xs font-semibold px-4 py-2.5 rounded-sm transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#7F876B]" />
                      <span>Ask Us on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-[#F6D5C5] border border-[#C97C79] rounded-sm text-xs text-[#332A28] flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-[#C97C79] shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reg-first-name" className="block text-xs font-medium text-[#332A28] mb-1">
                        First Name <span className="text-[#C97C79]" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="reg-first-name"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Zainab"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="reg-surname" className="block text-xs font-medium text-[#332A28] mb-1">
                        Surname <span className="text-[#C97C79]" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="reg-surname"
                        type="text"
                        required
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        placeholder="e.g. Ibrahim"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reg-email" className="block text-xs font-medium text-[#332A28] mb-1">
                        Email Address <span className="text-[#C97C79]" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="reg-whatsapp" className="block text-xs font-medium text-[#332A28] mb-1">
                        WhatsApp Number <span className="text-[#C97C79]" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="reg-whatsapp"
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="reg-attendees" className="block text-xs font-medium text-[#332A28] mb-1">
                        Number Attending
                      </label>
                      <select
                        id="reg-attendees"
                        value={attendeesCount}
                        onChange={(e) => setAttendeesCount(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none cursor-pointer"
                      >
                        <option value={1}>1 (Just Me)</option>
                        <option value={2}>2 (Bringing a Friend)</option>
                        <option value={3}>3 (Group of 3)</option>
                        <option value={4}>4 (Group of 4)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="reg-message" className="block text-xs font-medium text-[#332A28] mb-1">
                        Optional Message or Dietary Note
                      </label>
                      <input
                        id="reg-message"
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Any question or note for the host team"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                      />
                    </div>
                  </div>

                  {/* Explicit NDPR Form Consent Checkbox (Guideline 6) */}
                  <div className="p-3 bg-white rounded-sm border border-[#E8A6B2]/40 flex items-start space-x-2.5">
                    <input
                      id="reg-consent-checkbox"
                      type="checkbox"
                      required
                      checked={consentGranted}
                      onChange={(e) => setConsentGranted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-[#C97C79] focus:ring-[#C97C79] rounded-xs cursor-pointer"
                    />
                    <label htmlFor="reg-consent-checkbox" className="text-[11px] text-[#332A28]/80 leading-snug cursor-pointer">
                      I consent to Bloom and Beyond Ltd processing my details to manage my reservation and contact me via WhatsApp or email in accordance with the{' '}
                      <button
                        type="button"
                        onClick={onNavigateToPrivacy}
                        className="text-[#C97C79] hover:underline font-medium"
                      >
                        Privacy Policy
                      </button>
                      . All personal records are encrypted with AES-256.
                    </label>
                  </div>

                  {/* Submit & WhatsApp Contact */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      id="submit-reserve-place-btn"
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] text-xs uppercase tracking-widest font-semibold px-6 py-3 rounded-sm transition-colors duration-200 shadow-sm disabled:opacity-50"
                    >
                      {submitting 
                        ? 'Submitting...' 
                        : event.status === 'Sold Out' 
                        ? 'Join Waitlist' 
                        : 'Reserve My Place'}
                    </button>

                    <a
                      href={`https://wa.me/2348092345667?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 border border-[#332A28]/30 hover:bg-[#FFF5DE] text-xs font-semibold px-4 py-3 rounded-sm text-[#332A28] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#7F876B]" />
                      <span>Ask Us on WhatsApp</span>
                    </a>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="border-t border-[#E8A6B2]/40 pt-6 text-center space-y-2">
              <p className="font-editorial text-lg text-[#332A28]">
                This activity has concluded.
              </p>
              <p className="text-xs text-[#332A28]/70">
                Check our upcoming events or join the free community to hear about the next one first.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
