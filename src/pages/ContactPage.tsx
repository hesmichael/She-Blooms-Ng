import React, { useState } from 'react';
import { Mail, MessageCircle, MapPin, Check, AlertCircle, Handshake } from 'lucide-react';

interface ContactPageProps {
  onNavigateToPrivacy: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigateToPrivacy }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isPartnership, setIsPartnership] = useState(false);
  const [consentGranted, setConsentGranted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGranted) {
      setError('Please agree to data handling in accordance with our Privacy Policy.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
          isPartnership,
          consentGranted,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message.');

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending your message.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartPartnership = () => {
    setIsPartnership(true);
    setSubject('Conference / Event Partnership Inquiry');
    const formEl = document.getElementById('contact-form-section');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 md:space-y-20 pb-20">
      {/* HERO */}
      <section className="pt-10 pb-8 border-b border-[#E8A6B2]/30 bg-[#FFF5DE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
            Direct Communication
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#332A28]">
            LET'S TALK.
          </h1>
          <p className="text-base sm:text-lg text-[#332A28]/85 max-w-xl mx-auto leading-relaxed">
            Have a question about SheBlooms, an upcoming activity, the conference, membership or a possible collaboration? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* CONTACT DETAILS & INQUIRY FORM */}
      <section id="contact-form-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Business Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#E8A6B2]/40 space-y-6">
              <h2 className="font-editorial text-2xl font-bold text-[#332A28]">
                SheBlooms Headquarters
              </h2>
              <p className="text-xs sm:text-sm text-[#332A28]/80 leading-relaxed">
                Operated by Bloom and Beyond Ltd, a registered Nigerian enterprise dedicated to enriching experiences for adult women.
              </p>

              <div className="space-y-4 text-xs sm:text-sm pt-2">
                <div className="flex items-start space-x-3 text-[#332A28]">
                  <MapPin className="w-5 h-5 text-[#C97C79] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Location</span>
                    <span className="text-[#332A28]/80">Abuja, Federal Capital Territory, Nigeria</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-[#332A28]">
                  <Mail className="w-5 h-5 text-[#C97C79] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Email Address</span>
                    <a href="mailto:hello@sheblooms.ng" className="text-[#C97C79] hover:underline">
                      hello@sheblooms.ng
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-[#332A28]">
                  <MessageCircle className="w-5 h-5 text-[#C97C79] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">WhatsApp Concierge</span>
                    <a 
                      href="https://wa.me/2348092345667?text=Hello%20SheBlooms%20Abuja" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#C97C79] hover:underline font-mono"
                    >
                      +234 809 234 5667
                    </a>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E8A6B2]/30 pt-4 space-y-1 text-xs text-[#332A28]/70">
                <p><span className="font-medium text-[#332A28]">Instagram:</span> @sheblooms.ng</p>
                <p><span className="font-medium text-[#332A28]">Facebook:</span> SheBlooms Africa</p>
                <p className="pt-2 text-[11px] text-[#7F876B] italic">
                  Note: SheBlooms experiences occur across curated venues in Abuja. No residential address is published to protect community privacy.
                </p>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-[#FFF5DE] p-6 sm:p-8 rounded-sm border border-[#E8A6B2]/40 space-y-6">
              <div>
                <h2 className="font-editorial text-2xl font-bold text-[#332A28]">
                  Send a Direct Message
                </h2>
                <p className="text-xs text-[#332A28]/70">
                  Our coordinator team responds within 24 to 48 business hours.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 bg-white border border-[#7F876B]/40 rounded-sm text-center space-y-3">
                  <Check className="w-8 h-8 text-[#7F876B] mx-auto" />
                  <h3 className="font-editorial text-xl font-bold text-[#332A28]">
                    Message Delivered
                  </h3>
                  <p className="text-xs sm:text-sm text-[#332A28]/80 max-w-md mx-auto">
                    Thank you for reaching out. We have received your inquiry securely and will be in touch with you shortly.
                  </p>
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
                      <label htmlFor="contact-name" className="block text-xs font-medium text-[#332A28] mb-1">
                        Your Name <span className="text-[#C97C79]">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-email" className="block text-xs font-medium text-[#332A28] mb-1">
                        Email Address <span className="text-[#C97C79]">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-phone" className="block text-xs font-medium text-[#332A28] mb-1">
                        WhatsApp / Phone Number
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact-subject" className="block text-xs font-medium text-[#332A28] mb-1">
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Inquiry Topic"
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-xs font-medium text-[#332A28] mb-1">
                      Message <span className="text-[#C97C79]">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we assist you?"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                    ></textarea>
                  </div>

                  {/* Form Consent Checkbox */}
                  <div className="p-3 bg-white rounded-sm border border-[#E8A6B2]/40 flex items-start space-x-2.5">
                    <input
                      id="contact-consent-checkbox"
                      type="checkbox"
                      required
                      checked={consentGranted}
                      onChange={(e) => setConsentGranted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-[#C97C79] focus:ring-[#C97C79] rounded-xs cursor-pointer"
                    />
                    <label htmlFor="contact-consent-checkbox" className="text-[11px] text-[#332A28]/80 leading-snug cursor-pointer">
                      I agree to Bloom and Beyond Ltd collecting my contact details to reply to my message in accordance with the{' '}
                      <button
                        type="button"
                        onClick={onNavigateToPrivacy}
                        className="text-[#C97C79] hover:underline font-medium"
                      >
                        Privacy Policy
                      </button>
                      .
                    </label>
                  </div>

                  <button
                    id="submit-contact-btn"
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] text-xs uppercase tracking-widest font-semibold py-3.5 rounded-sm transition-colors duration-200 shadow-sm disabled:opacity-50"
                  >
                    {submitting ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERSHIP BLOCK ON CONTACT PAGE (From SheBlooms spec) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-[#332A28] text-[#FFF9F2] p-8 sm:p-12 rounded-sm space-y-6">
          <div className="flex items-center space-x-2 text-[#C89A61]">
            <Handshake className="w-6 h-6" />
            <span className="text-xs uppercase tracking-widest font-semibold">
              Collaborations & Sponsorships
            </span>
          </div>

          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#FFF9F2]">
            INTERESTED IN PARTNERING WITH SHEBLOOMS?
          </h2>

          <p className="text-xs sm:text-sm text-[#FFF9F2]/85 leading-relaxed max-w-2xl">
            We work with brands, venues, experts and organisations whose work aligns with the interests and lives of women in our community.
          </p>

          <div className="p-4 bg-[#FFF9F2]/10 rounded-sm border border-[#FFF9F2]/15 text-xs text-[#FFF9F2]/80 space-y-2">
            <span className="font-semibold text-[#C89A61] block">Opportunities include:</span>
            <p>
              Conference partnerships • Event sponsorship • Venue partnerships • Expert conversations • Lifestyle experiences • Product experiences • Hospitality • Other creative collaborations.
            </p>
          </div>

          <div>
            <button
              onClick={handleStartPartnership}
              className="bg-[#C97C79] hover:bg-[#b56b68] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold px-7 py-3 rounded-sm transition-colors"
            >
              Start A Conversation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
