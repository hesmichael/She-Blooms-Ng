import React, { useState } from 'react';
import { Check, AlertCircle, Sparkles, Heart, ShieldCheck, User } from 'lucide-react';

interface JoinPageProps {
  onNavigateToPrivacy: () => void;
  onOpenAuth: () => void;
}

const INTEREST_OPTIONS = [
  'Business',
  'Money',
  'Career',
  'Books',
  'Lifestyle',
  'Social gatherings',
  'Games & recreation',
  'Creative experiences',
  'Outings',
  'Travel when available',
  'Personal development',
  'Other'
];

export const JoinPage: React.FC<JoinPageProps> = ({ onNavigateToPrivacy, onOpenAuth }) => {
  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [ageBand, setAgeBand] = useState('');
  const [occupation, setOccupation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [referralSource, setReferralSource] = useState('');
  const [consentGranted, setConsentGranted] = useState(false);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (item: string) => {
    setInterests(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGranted) {
      setError('Please agree to data handling in accordance with our Privacy Policy.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          surname,
          email,
          whatsapp,
          city,
          ageBand,
          occupation,
          interests,
          referralSource,
          consentGranted,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit registration.');

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while joining.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 md:space-y-20 pb-20">
      {/* HERO */}
      <section className="pt-10 pb-8 border-b border-[#E8A6B2]/30 bg-[#FFF5DE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
            Membership Is Free
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#332A28]">
            DON'T JUST COME. BELONG.
          </h1>
          <p className="text-base sm:text-lg text-[#332A28]/85 max-w-2xl mx-auto leading-relaxed">
            Joining SheBlooms is completely free. It's for women who believe there should still be more to learn, experience, discover and become. If that sounds like you, we'd love to have you.
          </p>
        </div>
      </section>

      {/* SECTION 2: WHAT BELONGING MEANS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-6 sm:p-8 rounded-sm border border-[#E8A6B2]/40 space-y-4">
          <h2 className="font-editorial text-2xl font-bold text-[#332A28]">
            What Belonging Means
          </h2>
          <p className="text-xs sm:text-sm text-[#332A28]/80 leading-relaxed">
            Join SheBlooms at no cost to:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#332A28]/85">
            <li className="flex items-start space-x-2">
              <span className="text-[#C97C79] font-bold">•</span>
              <span>Hear first about upcoming curated activities.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#C97C79] font-bold">•</span>
              <span>Participate in monthly online book conversations.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#C97C79] font-bold">•</span>
              <span>Receive early information about selected experiences.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#C97C79] font-bold">•</span>
              <span>Connect meaningfully with women outside your routine circle.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#C97C79] font-bold">•</span>
              <span>Hear first about the annual women's conference.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-[#C97C79] font-bold">•</span>
              <span>Have more things on your calendar that you actually look forward to.</span>
            </li>
          </ul>
          <p className="text-xs text-[#332A28]/70 italic pt-2 border-t border-[#E8A6B2]/30">
            Some experiences are free, and some carry a cost; pricing for each is shared when it's announced, never as part of joining.
          </p>
        </div>
      </section>

      {/* SECTION 3: JOIN FORM */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FFF5DE] p-6 sm:p-10 rounded-sm border border-[#E8A6B2]/40 space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#332A28]">
              Join the SheBlooms Community
            </h2>
            <p className="text-xs text-[#332A28]/75">
              Only necessary details collected. Stored in encrypted database.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 bg-white border border-[#7F876B]/40 rounded-sm text-center space-y-4 animate-in fade-in">
              <div className="w-12 h-12 rounded-sm bg-[#7F876B] text-white flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-2xl font-bold text-[#332A28]">
                WELCOME TO SHEBLOOMS.
              </h3>
              <p className="text-sm text-[#332A28]/85 max-w-md mx-auto leading-relaxed">
                We're glad you're here. We'll be in touch with what happens next via WhatsApp and email.
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
                  <label htmlFor="join-first-name" className="block text-xs font-medium text-[#332A28] mb-1">
                    First Name <span className="text-[#C97C79]">*</span>
                  </label>
                  <input
                    id="join-first-name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="join-surname" className="block text-xs font-medium text-[#332A28] mb-1">
                    Surname <span className="text-[#C97C79]">*</span>
                  </label>
                  <input
                    id="join-surname"
                    type="text"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    placeholder="Surname"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="join-email" className="block text-xs font-medium text-[#332A28] mb-1">
                    Email Address <span className="text-[#C97C79]">*</span>
                  </label>
                  <input
                    id="join-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="join-whatsapp" className="block text-xs font-medium text-[#332A28] mb-1">
                    WhatsApp Number <span className="text-[#C97C79]">*</span>
                  </label>
                  <input
                    id="join-whatsapp"
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
                  <label htmlFor="join-city" className="block text-xs font-medium text-[#332A28] mb-1">
                    City <span className="text-[#C97C79]">*</span>
                  </label>
                  <input
                    id="join-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Abuja"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="join-age-band" className="block text-xs font-medium text-[#332A28] mb-1">
                    Age Band (Optional)
                  </label>
                  <select
                    id="join-age-band"
                    value={ageBand}
                    onChange={(e) => setAgeBand(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none cursor-pointer"
                  >
                    <option value="">Select (Optional)</option>
                    <option value="30-39">30s (30-39)</option>
                    <option value="40-49">40s (40-49)</option>
                    <option value="50-59">50s (50-59)</option>
                    <option value="60+">60 and beyond</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="join-occupation" className="block text-xs font-medium text-[#332A28] mb-1">
                    Occupation / Field (Optional)
                  </label>
                  <input
                    id="join-occupation"
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Architect, Entrepreneur"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                  />
                </div>
              </div>

              {/* What interests you? Checklist */}
              <div className="space-y-2 pt-2">
                <span className="block text-xs font-medium text-[#332A28]">
                  What interests you? (Select all that apply)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {INTEREST_OPTIONS.map((item) => (
                    <label 
                      key={item} 
                      className={`flex items-center space-x-2 p-2 rounded-sm border cursor-pointer transition-colors ${
                        interests.includes(item)
                          ? 'bg-[#FFF9F2] border-[#C97C79] text-[#332A28] font-semibold'
                          : 'bg-white border-[#E8A6B2]/40 text-[#332A28]/70 hover:bg-[#FFF9F2]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={interests.includes(item)}
                        onChange={() => toggleInterest(item)}
                        className="w-3.5 h-3.5 text-[#C97C79] focus:ring-[#C97C79] rounded-xs"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="join-referral" className="block text-xs font-medium text-[#332A28] mb-1">
                  How did you hear about SheBlooms?
                </label>
                <input
                  id="join-referral"
                  type="text"
                  value={referralSource}
                  onChange={(e) => setReferralSource(e.target.value)}
                  placeholder="e.g. WhatsApp status, a friend, Instagram"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                />
              </div>

              {/* Form Consent Checkbox */}
              <div className="p-3 bg-white rounded-sm border border-[#E8A6B2]/40 flex items-start space-x-2.5">
                <input
                  id="join-consent-checkbox"
                  type="checkbox"
                  required
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#C97C79] focus:ring-[#C97C79] rounded-xs cursor-pointer"
                />
                <label htmlFor="join-consent-checkbox" className="text-[11px] text-[#332A28]/80 leading-snug cursor-pointer">
                  I agree to Bloom and Beyond Ltd processing my details to maintain my free community membership and contact me via WhatsApp or email in accordance with the{' '}
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
                id="submit-join-free-btn"
                type="submit"
                disabled={submitting}
                className="w-full bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] text-xs uppercase tracking-widest font-semibold py-3.5 rounded-sm transition-colors duration-200 shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : "Join SheBlooms - It's Free"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
