import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Coins, 
  Briefcase, 
  Compass, 
  Heart, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Clock, 
  Users, 
  ShieldCheck 
} from 'lucide-react';
import { ConferenceSpeaker, ConferenceAgendaItem } from '../types';

interface ConferencePageProps {
  onNavigate: (page: string) => void;
  onNavigateToPrivacy: () => void;
}

export const ConferencePage: React.FC<ConferencePageProps> = ({
  onNavigate,
  onNavigateToPrivacy,
}) => {
  // Dynamic Speakers & Agenda from CMS
  const [speakers, setSpeakers] = useState<ConferenceSpeaker[]>([]);
  const [agenda, setAgenda] = useState<ConferenceAgendaItem[]>([]);
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/conference/content')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          if (Array.isArray(data.speakers)) setSpeakers(data.speakers);
          if (Array.isArray(data.agenda)) setAgenda(data.agenda);
        }
        setContentLoaded(true);
      })
      .catch(() => setContentLoaded(true));
  }, []);

  // Form State
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [numberAttending, setNumberAttending] = useState(1);
  const [consentGranted, setConsentGranted] = useState(false);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGranted) {
      setError('Please agree to data processing in accordance with our Privacy Policy.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/conference/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          surname,
          email,
          whatsapp,
          city,
          numberAttending,
          consentGranted,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit registration.');

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToRegister = () => {
    const el = document.getElementById('conference-register-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 md:space-y-24 pb-20">
      {/* HERO */}
      <section className="relative pt-12 pb-16 md:py-24 bg-[#332A28] text-[#FFF9F2] overflow-hidden border-b border-[#C89A61]/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-[#FFF9F2]/10 border border-[#C89A61]/40 rounded-sm text-xs font-semibold text-[#C89A61]">
            <Calendar className="w-3.5 h-3.5" />
            <span className="uppercase tracking-widest">December 2026 • Abuja, Nigeria</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#FFF9F2] leading-tight">
            THE SHEBLOOMS CONFERENCE 2026
          </h1>

          <p className="font-editorial text-xl sm:text-2xl text-[#F6D5C5] font-medium max-w-3xl mx-auto">
            A DAY FOR THE WOMAN YOU ARE - AND THE WOMAN YOU'RE BECOMING.
          </p>

          <p className="text-sm sm:text-base text-[#FFF9F2]/80 max-w-2xl mx-auto leading-relaxed">
            The inaugural SheBlooms Conference brings women together for a day of honest conversations, useful ideas, inspiring stories and meaningful connection.
          </p>

          <p className="text-xs sm:text-sm text-[#FFF9F2]/70 max-w-2xl mx-auto leading-relaxed">
            Hear from accomplished women and experts who have built businesses, navigated careers, made difficult financial decisions, reinvented themselves, overcome setbacks and learned important lessons about building a meaningful life.
          </p>

          <div className="pt-4">
            <button
              id="conference-hero-register-btn"
              onClick={scrollToRegister}
              className="bg-[#C97C79] hover:bg-[#b56b68] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold px-8 py-3.5 rounded-sm transition-colors shadow-sm"
            >
              Register Interest
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHAT WE'LL TALK ABOUT */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
            Core Themes
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#332A28]">
            WHAT WE'LL TALK ABOUT
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-3">
            <Coins className="w-6 h-6 text-[#C97C79]" />
            <h3 className="font-editorial text-xl font-bold text-[#332A28]">
              MONEY
            </h3>
            <p className="text-xs sm:text-sm text-[#332A28]/80 leading-relaxed">
              Earning. Saving. Investing. Building wealth. Financial independence. Planning ahead in complex economic times.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-3">
            <Briefcase className="w-6 h-6 text-[#C97C79]" />
            <h3 className="font-editorial text-xl font-bold text-[#332A28]">
              BUSINESS & CAREER
            </h3>
            <p className="text-xs sm:text-sm text-[#332A28]/80 leading-relaxed">
              Starting. Growing. Selling. Leading. Surviving difficult seasons. Executive negotiation, leadership, and deliberate reinvention.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-3">
            <Heart className="w-6 h-6 text-[#C97C79]" />
            <h3 className="font-editorial text-xl font-bold text-[#332A28]">
              LIFESTYLE & WELLBEING
            </h3>
            <p className="text-xs sm:text-sm text-[#332A28]/80 leading-relaxed">
              Living well while navigating the high demands of adulthood. Health, mental replenishment, boundaries, and joyful spaces.
            </p>
          </div>

          <div className="p-6 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-3 md:col-span-2 lg:col-span-3">
            <Compass className="w-6 h-6 text-[#C97C79]" />
            <h3 className="font-editorial text-xl font-bold text-[#332A28]">
              LIFE & PURPOSE
            </h3>
            <p className="text-xs sm:text-sm text-[#332A28]/80 leading-relaxed max-w-2xl">
              What matters now? What are you building? Who are you becoming? Deep questions explored without corporate jargon or shallow motivational platitudes.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE DIFFERENCE */}
      <section className="bg-[#FFF5DE] py-14 sm:py-18 border-y border-[#E8A6B2]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
            The Philosophy
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#332A28]">
            NOT JUST SUCCESS STORIES.
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-[#332A28]/85 leading-relaxed max-w-3xl mx-auto">
            <p>
              We want to get beneath polished biographies. What worked? What didn't? What would she do differently? What did nobody tell her? What decisions changed everything? What can another woman learn from the journey?
            </p>
            <p className="font-editorial text-xl text-[#C97C79] font-bold">
              The SheBlooms Conference is designed around useful honesty, not simply inspiration.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4: SPEAKERS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
            Keynote Voices
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#332A28]">
            WOMEN WORTH LISTENING TO.
          </h2>
          <p className="text-xs sm:text-sm text-[#332A28]/70">
            Accomplished leaders, founders, and practitioners sharing unvarnished truth and actionable knowledge.
          </p>
        </div>

        {speakers.length === 0 && contentLoaded ? (
          <div className="bg-white border border-[#E8A6B2]/40 rounded-sm p-8 text-center max-w-2xl mx-auto space-y-2">
            <Sparkles className="w-6 h-6 text-[#C89A61] mx-auto" />
            <h3 className="font-editorial text-xl font-bold text-[#332A28]">Lineup Announcements Coming Soon</h3>
            <p className="text-xs text-[#332A28]/70 leading-relaxed">
              Our keynote speakers and panel facilitators are being confirmed. Register your interest below to receive the first speaker announcements and agenda unveiling directly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(speakers.length > 0 ? speakers : [
              {
                id: 'spk_1',
                name: 'Dr. Halima Musa',
                role: 'Managing Director, Northgate Asset Management',
                organization: 'Northgate Asset Management',
                location: 'Abuja, Nigeria',
                bio: '25 years in institutional private equity, personal estate management, and wealth preservation across emerging African markets.',
                photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
                isConfirmed: true
              },
              {
                id: 'spk_2',
                name: 'Nneka Okonkwo, SAN',
                role: 'Senior Advocate of Nigeria & Corporate Counsel',
                organization: 'Okonkwo & Associates',
                location: 'Lagos & Abuja',
                bio: 'Pioneering corporate governance, intellectual property rights, and navigating high-stakes commercial disputes with grace and spine.',
                photo: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
                isConfirmed: true
              },
              {
                id: 'spk_3',
                name: 'Folake Adeyemi',
                role: 'Founder & Clinical Director, The Wellness Sanctuary',
                organization: 'The Wellness Sanctuary',
                location: 'Abuja, Nigeria',
                bio: "Specialist in adult women's preventive health, hormonal transitions in 40s and 50s, and somatic stress recovery.",
                photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                isConfirmed: true
              }
            ]).map((spk) => (
              <div key={spk.id} className="bg-white border border-[#E8A6B2]/40 rounded-sm overflow-hidden p-5 space-y-3">
                <div className="h-52 w-full bg-[#332A28] rounded-sm overflow-hidden">
                  <img
                    src={spk.photo}
                    alt={`Portrait of ${spk.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-[#332A28]">
                    {spk.name}
                  </h3>
                  <p className="text-xs font-medium text-[#C97C79]">
                    {spk.role}
                  </p>
                  <p className="text-[11px] text-[#7F876B] font-medium">{spk.location}</p>
                </div>
                <p className="text-xs text-[#332A28]/75 leading-relaxed">
                  {spk.bio}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 5: PROGRAMME */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
            Agenda Breakdown
          </span>
          <h2 className="font-editorial text-3xl font-bold text-[#332A28]">
            THE DAY
          </h2>
        </div>

        <div className="bg-white border border-[#E8A6B2]/40 rounded-sm divide-y divide-[#E8A6B2]/30 text-xs">
          {(agenda.length > 0 ? agenda : [
            {
              id: 'ag_1',
              time: '09:00 AM - 10:00 AM',
              title: 'Arrival, Warm Welcome & Morning Tea',
              description: 'Smooth registrations, coffee, tea, and warm introductions with our hosts.'
            },
            {
              id: 'ag_2',
              time: '10:00 AM - 11:30 AM',
              title: 'Opening Keynote & Wealth Candid Talk',
              description: 'Unvarnished discussion on financial sovereignty, estate allocation, and building tangible assets.'
            },
            {
              id: 'ag_3',
              time: '11:45 AM - 01:15 PM',
              title: 'Breakout Salons: Career Pivots vs. Entrepreneurial Growth',
              description: 'Interactive small-group sessions focused on real dilemmas, negotiation, and strategic resets.'
            },
            {
              id: 'ag_4',
              time: '01:15 PM - 02:45 PM',
              title: 'The Curated Long Lunch',
              description: 'Three-course seasonal dining, shared tables, and structured prompts to make deep new connections.',
              highlight: true
            },
            {
              id: 'ag_5',
              time: '03:00 PM - 04:30 PM',
              title: 'Health, Vitality & The Second Half of Life',
              description: 'Clinical insights on longevity, hormones, emotional stamina, and reclaiming time.'
            },
            {
              id: 'ag_6',
              time: '04:45 PM - 06:00 PM',
              title: 'Closing Synthesis & Evening Garden Reception',
              description: 'Live acoustic music, mocktails, cocktails, and closing fellowship.'
            }
          ]).map((item) => (
            <div 
              key={item.id} 
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                item.highlight ? 'bg-[#FFF5DE]/40' : ''
              }`}
            >
              <div className={`font-mono text-xs font-bold ${item.highlight ? 'text-[#7F876B]' : 'text-[#C97C79]'}`}>
                {item.time}
              </div>
              <div className="sm:w-3/4">
                <span className="font-semibold text-sm text-[#332A28] block">{item.title}</span>
                <p className="text-[#332A28]/70">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: ATTEND (REGISTER INTEREST FORM) */}
      <section id="conference-register-section" className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FFF5DE] p-6 sm:p-10 rounded-sm border border-[#E8A6B2]/40 space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
              Join the Audience
            </span>
            <h2 className="font-editorial text-3xl font-bold text-[#332A28]">
              BE IN THE ROOM.
            </h2>
            <p className="text-xs sm:text-sm text-[#332A28]/80 max-w-lg mx-auto">
              Registration of interest gives you priority access to early ticket tiers. Payment is handled manually once ticket pricing is finalized.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-white border border-[#7F876B]/40 rounded-sm text-center space-y-3">
              <Check className="w-8 h-8 text-[#7F876B] mx-auto" />
              <h3 className="font-editorial text-xl font-bold text-[#332A28]">
                Interest Registered
              </h3>
              <p className="text-xs text-[#332A28]/80 max-w-md mx-auto">
                Thank you for registering. You are on the priority SheBlooms Conference list. Our team in Abuja will reach out via WhatsApp and email once registration opens.
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
                  <label htmlFor="conf-name" className="block text-xs font-medium text-[#332A28] mb-1">
                    First Name <span className="text-[#C97C79]">*</span>
                  </label>
                  <input
                    id="conf-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="First Name"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="conf-surname" className="block text-xs font-medium text-[#332A28] mb-1">
                    Surname <span className="text-[#C97C79]">*</span>
                  </label>
                  <input
                    id="conf-surname"
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
                  <label htmlFor="conf-email" className="block text-xs font-medium text-[#332A28] mb-1">
                    Email Address <span className="text-[#C97C79]">*</span>
                  </label>
                  <input
                    id="conf-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="conf-whatsapp" className="block text-xs font-medium text-[#332A28] mb-1">
                    WhatsApp Number <span className="text-[#C97C79]">*</span>
                  </label>
                  <input
                    id="conf-whatsapp"
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="conf-city" className="block text-xs font-medium text-[#332A28] mb-1">
                    City of Residence <span className="text-[#C97C79]">*</span>
                  </label>
                  <input
                    id="conf-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Abuja, Lagos, Port Harcourt, London"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="conf-attending" className="block text-xs font-medium text-[#332A28] mb-1">
                    Number of Expected Places
                  </label>
                  <select
                    id="conf-attending"
                    value={numberAttending}
                    onChange={(e) => setNumberAttending(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none cursor-pointer"
                  >
                    <option value={1}>1 Place (Individual)</option>
                    <option value={2}>2 Places (Myself & Colleague/Friend)</option>
                    <option value={3}>3 Places</option>
                    <option value={5}>5 Places (Executive Delegation)</option>
                  </select>
                </div>
              </div>

              {/* Form Consent Checkbox */}
              <div className="p-3 bg-white rounded-sm border border-[#E8A6B2]/40 flex items-start space-x-2.5">
                <input
                  id="conf-consent-checkbox"
                  type="checkbox"
                  required
                  checked={consentGranted}
                  onChange={(e) => setConsentGranted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#C97C79] focus:ring-[#C97C79] rounded-xs cursor-pointer"
                />
                <label htmlFor="conf-consent-checkbox" className="text-[11px] text-[#332A28]/80 leading-snug cursor-pointer">
                  I agree to Bloom and Beyond Ltd processing my details to send priority conference updates in accordance with the{' '}
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
                id="conf-register-interest-submit-btn"
                type="submit"
                disabled={submitting}
                className="w-full bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] text-xs uppercase tracking-widest font-semibold py-3.5 rounded-sm transition-colors duration-200 shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting Registration...' : 'Register Interest'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* SECTION 7: PARTNERS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 pt-6 border-t border-[#E8A6B2]/30">
        <h3 className="font-editorial text-2xl font-bold text-[#332A28]">
          PARTNER WITH THE SHEBLOOMS CONFERENCE
        </h3>
        <p className="text-xs sm:text-sm text-[#332A28]/80 max-w-xl mx-auto leading-relaxed">
          We collaborate with brands, hospitality leaders, financial institutions, and organizations committed to the flourishing of adult women.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('contact')}
            className="border border-[#332A28] hover:bg-[#332A28] hover:text-[#FFF9F2] text-[#332A28] text-xs uppercase tracking-widest font-semibold px-7 py-3 rounded-sm transition-colors"
          >
            Talk To Us
          </button>
        </div>
      </section>
    </div>
  );
};
