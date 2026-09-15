import React, { useState } from 'react';
import { 
  Sparkles, 
  Users, 
  Heart, 
  Smile, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { SheBloomsEvent } from '../types';

interface HomePageProps {
  events: SheBloomsEvent[];
  onSelectEvent: (event: SheBloomsEvent) => void;
  onNavigate: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  events,
  onSelectEvent,
  onNavigate,
}) => {
  // Newsletter Form State
  const [newsName, setNewsName] = useState('');
  const [newsEmail, setNewsEmail] = useState('');
  const [newsWhatsapp, setNewsWhatsapp] = useState('');
  const [newsConsent, setNewsConsent] = useState(false);
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [newsSuccess, setNewsSuccess] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsConsent) {
      setNewsError('Please agree to data processing in accordance with our Privacy Policy.');
      return;
    }

    setNewsSubmitting(true);
    setNewsError(null);

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsEmail,
          whatsapp: newsWhatsapp,
          consentGranted: newsConsent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to subscribe.');

      setNewsSuccess(true);
    } catch (err: any) {
      setNewsError(err.message || 'An error occurred. Please try again.');
    } finally {
      setNewsSubmitting(false);
    }
  };

  // Show strictly the next 3 upcoming activities chronologically (V2 Dev Instructions, Page 27)
  const upcomingEvents = events.filter(e => !e.isPast).slice(0, 3);

  return (
    <div className="space-y-20 md:space-y-28">
      {/* 01: HERO (V2 Dev Instructions, Pages 24-25) */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[#E8A6B2]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Copy Column with Generous Whitespace */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FFF5DE] border border-[#C89A61]/30 rounded-sm text-xs font-semibold text-[#7F876B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C97C79]"></span>
                <span className="uppercase tracking-widest text-[11px]">Abuja, Nigeria • Founded for Women 30+</span>
              </div>

              <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-[#332A28] leading-[1.1] tracking-tight">
                THERE'S MORE LIFE AHEAD.
              </h1>

              <p className="text-base sm:text-lg text-[#332A28]/85 leading-relaxed max-w-2xl">
                SheBlooms is a community for women who want to keep learning, connecting, discovering, experiencing and becoming.
              </p>

              <p className="text-sm sm:text-base text-[#332A28]/75 leading-relaxed max-w-2xl">
                From conversations about money, business, careers and life to books, lunches, games, new experiences and the occasional adventure, we create more reasons for women to invest in themselves and more things to look forward to.
              </p>

              <div className="pt-2">
                <p className="font-editorial text-xl italic text-[#C97C79] font-medium">
                  Nourish Yourself. Flourish in Purpose.
                </p>
              </div>

              {/* Conversational Action Buttons (No pill buttons, clean rounded-sm) */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  id="hero-see-whats-on-btn"
                  onClick={() => onNavigate('events')}
                  className="bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] text-xs uppercase tracking-widest font-semibold px-7 py-3.5 rounded-sm transition-colors duration-200 shadow-sm text-center"
                >
                  See What's On
                </button>
                <button
                  id="hero-join-sheblooms-btn"
                  onClick={() => onNavigate('join')}
                  className="bg-transparent text-[#332A28] hover:bg-[#FFF5DE] border border-[#332A28] text-xs uppercase tracking-widest font-semibold px-7 py-3.5 rounded-sm transition-colors duration-200 text-center"
                >
                  Join SheBlooms
                </button>
              </div>
            </div>

            {/* Single Full-Width Lifestyle Photography (No collage, clean restrained frame) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-sm overflow-hidden border border-[#E8A6B2]/40 shadow-md aspect-[4/5] bg-[#332A28]">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80"
                  alt="Adult women sharing laughter and warm conversation in an unhurried social gathering in Abuja"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#332A28]/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-[#FFF9F2]/90 backdrop-blur-xs rounded-sm border border-[#E8A6B2]/40">
                  <p className="font-editorial text-sm font-semibold text-[#332A28]">
                    "SheBlooms creates spaces for women to invest in themselves and enjoy more of life."
                  </p>
                  <span className="text-[11px] text-[#7F876B] font-medium block mt-1">
                    Bloom and Beyond Ltd • Abuja
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02: LIFE GETS FULL (Short emotional introduction) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold">
          The Insight Behind SheBlooms
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#332A28]">
          LIFE GETS FULL.
        </h2>
        <div className="space-y-4 text-base sm:text-lg text-[#332A28]/85 leading-relaxed text-left sm:text-center">
          <p>
            Work. Business. Marriage. Children. Family. Deadlines. Responsibilities. People who need you. Things that must get done.
          </p>
          <p>
            And somewhere in the middle of building a life, it becomes surprisingly easy to stop making enough room for yourself, the books you meant to read, the friendships you meant to nurture, the places you wanted to visit, the things you wanted to learn, the hobbies you abandoned, the conversations you needed, the afternoons you wanted to enjoy simply because they were yours.
          </p>
          <p className="font-editorial text-xl text-[#C97C79] font-medium pt-2">
            SheBlooms creates room for more of that.
          </p>
        </div>
      </section>

      {/* 03: WHAT SHEBLOOMS BRINGS INTO YOUR LIFE (4 concepts only: LEARN, CONNECT, EXPERIENCE, ENJOY) */}
      <section className="bg-[#FFF5DE] py-16 sm:py-20 border-y border-[#E8A6B2]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold">
              Curated Experiences
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#332A28]">
              GROW. CONNECT. EXPERIENCE. ENJOY.
            </h2>
            <p className="text-sm sm:text-base text-[#332A28]/80">
              There is no single SheBlooms activity. We deliberately create different ways for women to nourish themselves and experience more of life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* LEARN */}
            <div className="bg-[#FFF9F2] p-6 rounded-sm border border-[#E8A6B2]/40 space-y-3">
              <div className="w-9 h-9 rounded-sm bg-[#332A28] text-[#FFF9F2] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#C89A61]" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-[#332A28]">
                LEARN
              </h3>
              <p className="text-xs sm:text-sm text-[#332A28]/80 leading-relaxed">
                Practical conversations for real life. Money. Business. Careers. Leadership. Lifestyle. Wellbeing. Personal development and the questions that matter as women's lives evolve.
              </p>
            </div>

            {/* CONNECT */}
            <div className="bg-[#FFF9F2] p-6 rounded-sm border border-[#E8A6B2]/40 space-y-3">
              <div className="w-9 h-9 rounded-sm bg-[#332A28] text-[#FFF9F2] flex items-center justify-center">
                <Users className="w-5 h-5 text-[#C89A61]" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-[#332A28]">
                CONNECT
              </h3>
              <p className="text-xs sm:text-sm text-[#332A28]/80 leading-relaxed">
                Meet women outside your usual circle. Not forced networking. Not collecting business cards. Just thoughtful spaces where conversations can happen and relationships can grow.
              </p>
            </div>

            {/* EXPERIENCE */}
            <div className="bg-[#FFF9F2] p-6 rounded-sm border border-[#E8A6B2]/40 space-y-3">
              <div className="w-9 h-9 rounded-sm bg-[#332A28] text-[#FFF9F2] flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#C89A61]" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-[#332A28]">
                EXPERIENCE
              </h3>
              <p className="text-xs sm:text-sm text-[#332A28]/80 leading-relaxed">
                Do something different. Games. Lunches. Dinners. Creative afternoons. Outings. Culture. Music. New places. New skills. Unexpected experiences that make leaving the house worthwhile.
              </p>
            </div>

            {/* ENJOY */}
            <div className="bg-[#FFF9F2] p-6 rounded-sm border border-[#E8A6B2]/40 space-y-3">
              <div className="w-9 h-9 rounded-sm bg-[#332A28] text-[#FFF9F2] flex items-center justify-center">
                <Smile className="w-5 h-5 text-[#C89A61]" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-[#332A28]">
                ENJOY
              </h3>
              <p className="text-xs sm:text-sm text-[#332A28]/80 leading-relaxed">
                Sometimes the point is growth. Sometimes the point is simply having a wonderful afternoon, unhurried laughter, good food, and good company. Both matter equally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 04: WHAT'S ON (Show only the next 3 activities) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8A6B2]/30 pb-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold">
              Live Calendar
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#332A28]">
              WHAT'S ON
            </h2>
            <p className="text-sm text-[#332A28]/80">
              Every month can look different. Here is what we're doing next.
            </p>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-[#C97C79] hover:text-[#332A28] transition-colors"
          >
            <span>View All What's On</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Next 3 Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-sm border border-[#E8A6B2]/40 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                <div className="relative h-48 w-full bg-[#332A28] overflow-hidden">
                  <img
                    src={evt.image}
                    alt={`Activity atmosphere for ${evt.title}`}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                    <span className="bg-[#332A28]/90 text-[#FFF9F2] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                      {evt.category}
                    </span>
                    {evt.status && (
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                        evt.status === 'Sold Out' 
                          ? 'bg-[#332A28] text-[#FFF9F2]' 
                          : evt.status === 'Limited Spaces' 
                          ? 'bg-[#C97C79] text-[#FFF9F2]' 
                          : 'bg-[#7F876B] text-[#FFF9F2]'
                      }`}>
                        {evt.status}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-[#FFF9F2]/90 text-[#332A28] text-xs font-semibold px-2 py-0.5 rounded-sm">
                    {evt.price}
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center space-x-1.5 text-xs text-[#7F876B] font-medium">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{evt.date}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-[#332A28]/70">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                  <h3 className="font-editorial text-lg font-bold text-[#332A28] line-clamp-2 pt-1">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-[#332A28]/75 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-[#E8A6B2]/20 mt-3">
                <button
                  onClick={() => onSelectEvent(evt)}
                  className="w-full mt-3 bg-[#FFF5DE] hover:bg-[#C97C79] text-[#332A28] hover:text-[#FFF9F2] text-xs uppercase tracking-wider font-semibold py-2.5 rounded-sm transition-colors"
                >
                  {evt.status === 'Sold Out' ? 'Join Waitlist' : 'Reserve My Place'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#332A28]/70 text-center italic pt-2">
          Some experiences are free; others carry a cost. Details, including price, are shared when each one is announced.
        </p>
      </section>

      {/* 05: WHO CREATES SPACE FOR WOMEN AFTER 30? (Oversized statement with breathing room) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8 py-6">
        <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold">
          Intentional Spaces
        </span>
        <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-bold text-[#332A28] leading-tight">
          WHO CREATES SPACE FOR WOMEN AFTER 30?
        </h2>
        <div className="space-y-4 text-base sm:text-lg text-[#332A28]/85 leading-relaxed text-left sm:text-center max-w-3xl mx-auto">
          <p>
            There are endless communities, activities and experiences designed around youth. But life doesn't stop becoming interesting at 35, 42, or 51.
          </p>
          <p>
            Women still want to learn, to meet new people, to laugh, to try things, to travel, to discover new interests, to talk about money, business, careers and life, to make new friends and to occasionally do something simply because it sounds fun.
          </p>
          <p className="font-medium text-[#332A28]">
            SheBlooms intentionally creates more of those spaces for adult women.
          </p>
        </div>

        <div className="py-4">
          <p className="font-editorial text-2xl sm:text-3xl md:text-4xl text-[#C97C79] font-bold tracking-tight">
            YOU HAVEN'T AGED OUT OF INTERESTING EXPERIENCES.
          </p>
        </div>
      </section>

      {/* 06: ANNUAL CONFERENCE */}
      <section className="bg-[#332A28] text-[#FFF9F2] py-16 sm:py-20 rounded-sm mx-4 sm:mx-6 lg:mx-8 px-6 sm:px-12">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <span className="text-xs uppercase tracking-widest text-[#C89A61] font-semibold block">
            Our Annual Gathering
          </span>
          <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-[#FFF9F2] leading-tight">
            THE SHEBLOOMS CONFERENCE 2026
          </h2>
          <p className="text-sm sm:text-base text-[#F6D5C5] font-medium">
            December 2026 • Abuja, Nigeria
          </p>
          <p className="text-sm sm:text-base text-[#FFF9F2]/85 leading-relaxed max-w-2xl mx-auto">
            Once a year, we bring the wider SheBlooms community together for a day of powerful conversations, useful ideas, honest stories and meaningful connection.
          </p>
          <p className="text-xs sm:text-sm text-[#FFF9F2]/75 leading-relaxed max-w-2xl mx-auto">
            Our inaugural conference takes place in Abuja in December 2026, bringing women together to learn from accomplished women and experts across money, business, careers, lifestyle and life.
          </p>
          <div className="pt-4">
            <button
              id="home-conference-teaser-btn"
              onClick={() => onNavigate('conference')}
              className="bg-[#C97C79] hover:bg-[#b56b68] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold px-8 py-3.5 rounded-sm transition-colors shadow-sm"
            >
              Discover The Conference
            </button>
          </div>
        </div>
      </section>

      {/* 07: YOU SHOULD HAVE BEEN THERE (Visual Mosaic with required short copy) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8A6B2]/30 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold">
              Moments & Memories
            </span>
            <h2 className="font-editorial text-3xl font-bold text-[#332A28]">
              YOU SHOULD HAVE BEEN THERE.
            </h2>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-[#C97C79] hover:text-[#332A28]"
          >
            <span>See More Moments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Gallery Mosaic with Authentic Overlays */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-[#332A28] group">
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80"
              alt="Women in laughter around dinner table in Abuja"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <span className="absolute bottom-3.5 left-4 text-xs font-semibold text-white">
              We did tell you.
            </span>
          </div>

          <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-[#332A28] group">
            <img
              src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80"
              alt="Creative hands sculpting ceramic pottery"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <span className="absolute bottom-3.5 left-4 text-xs font-semibold text-white">
              Yes. Grown women still play.
            </span>
          </div>

          <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-[#332A28] group">
            <img
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
              alt="Book discussion and reflections among women"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <span className="absolute bottom-3.5 left-4 text-xs font-semibold text-white">
              She came alone.
            </span>
          </div>

          <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-[#332A28] group">
            <img
              src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80"
              alt="Intimate seminar conversation and note-taking"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <span className="absolute bottom-3.5 left-4 text-xs font-semibold text-white">
              Learning can look like this too.
            </span>
          </div>

          <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-[#332A28] group">
            <img
              src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80"
              alt="Relaxed weekend garden stroll in Abuja"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <span className="absolute bottom-3.5 left-4 text-xs font-semibold text-white">
              This happened on a Saturday in Abuja.
            </span>
          </div>

          <div className="relative aspect-[4/3] rounded-sm overflow-hidden bg-[#332A28] group">
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"
              alt="Community gathering celebration and fellowship"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <span className="absolute bottom-3.5 left-4 text-xs font-semibold text-white">
              Next time, come.
            </span>
          </div>
        </div>
      </section>

      {/* 08: DON'T JUST COME. BELONG. (Membership CTA) */}
      <section className="bg-[#F6D5C5]/40 py-16 sm:py-20 border-y border-[#C97C79]/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold">
            Membership Is Completely Free
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#332A28]">
            DON'T JUST ATTEND. BELONG.
          </h2>
          <p className="text-sm sm:text-base text-[#332A28]/85 leading-relaxed">
            Joining SheBlooms is free; it simply keeps you in the loop. You don't have to attend everything to belong here.
          </p>
          <p className="text-sm sm:text-base text-[#332A28]/80 leading-relaxed">
            Join the community to hear about upcoming conversations, book discussions, gatherings, experiences, conference announcements and whatever we decide to do next. Details for each experience, including cost where applicable, are shared when announced.
          </p>
          <div className="pt-3">
            <button
              id="home-join-free-btn"
              onClick={() => onNavigate('join')}
              className="bg-[#332A28] hover:bg-[#C97C79] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold px-8 py-3.5 rounded-sm transition-colors shadow-sm"
            >
              Join SheBlooms - It's Free
            </button>
          </div>
        </div>
      </section>

      {/* 09: KEEP IN TOUCH (Newsletter with NDPR consent) */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold">
            Stay Connected
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#332A28]">
            DON'T MISS THE GOOD STUFF.
          </h2>
          <p className="text-xs sm:text-sm text-[#332A28]/80">
            New events. New conversations. The next book. Conference announcements. Occasional surprises. Straight to you.
          </p>
        </div>

        {newsSuccess ? (
          <div className="p-4 bg-[#FFF5DE] border border-[#7F876B]/40 rounded-sm text-center space-y-2">
            <Check className="w-6 h-6 text-[#7F876B] mx-auto" />
            <p className="font-editorial text-base font-bold text-[#332A28]">
              You're in the loop.
            </p>
            <p className="text-xs text-[#332A28]/80">
              Thank you for subscribing. We respect your privacy and never spam.
            </p>
          </div>
        ) : (
          <form onSubmit={handleNewsletterSubmit} className="space-y-3">
            {newsError && (
              <div className="p-2.5 bg-[#F6D5C5] border border-[#C97C79] rounded-sm text-xs text-[#332A28] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#C97C79] shrink-0" />
                <span>{newsError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="news-name" className="sr-only">First Name</label>
                <input
                  id="news-name"
                  type="text"
                  value={newsName}
                  onChange={(e) => setNewsName(e.target.value)}
                  placeholder="First Name"
                  className="w-full px-3 py-2.5 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                />
              </div>
              <div>
                <label htmlFor="news-email" className="sr-only">Email Address</label>
                <input
                  id="news-email"
                  type="email"
                  required
                  value={newsEmail}
                  onChange={(e) => setNewsEmail(e.target.value)}
                  placeholder="Email Address *"
                  className="w-full px-3 py-2.5 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                />
              </div>
              <div>
                <label htmlFor="news-whatsapp" className="sr-only">WhatsApp Number</label>
                <input
                  id="news-whatsapp"
                  type="tel"
                  value={newsWhatsapp}
                  onChange={(e) => setNewsWhatsapp(e.target.value)}
                  placeholder="WhatsApp Number"
                  className="w-full px-3 py-2.5 text-xs bg-white border border-[#E8A6B2]/60 rounded-sm focus:border-[#C97C79] focus:ring-1 focus:ring-[#C97C79] outline-none"
                />
              </div>
            </div>

            {/* Form Consent Checkbox */}
            <div className="flex items-start space-x-2 pt-1 text-[11px] text-[#332A28]/80">
              <input
                id="news-consent"
                type="checkbox"
                required
                checked={newsConsent}
                onChange={(e) => setNewsConsent(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 text-[#C97C79] focus:ring-[#C97C79] rounded-xs cursor-pointer"
              />
              <label htmlFor="news-consent" className="cursor-pointer leading-snug">
                I agree to Bloom and Beyond Ltd storing my contact details to send community announcements in accordance with the Privacy Policy.
              </label>
            </div>

            <button
              id="newsletter-submit-btn"
              type="submit"
              disabled={newsSubmitting}
              className="w-full bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] text-xs uppercase tracking-widest font-semibold py-3 rounded-sm transition-colors duration-200 shadow-sm disabled:opacity-50"
            >
              {newsSubmitting ? 'Subscribing...' : 'Keep Me In The Loop'}
            </button>
          </form>
        )}
      </section>

      {/* 10: FINAL HOMEPAGE CLOSING (Full-width photograph atmosphere) */}
      <section className="relative overflow-hidden bg-[#332A28] text-[#FFF9F2] py-20 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <p className="font-editorial text-2xl sm:text-4xl font-bold leading-snug text-[#FFF9F2]">
            YOU SPEND A LOT OF LIFE SHOWING UP FOR EVERYTHING ELSE.
          </p>
          <p className="font-editorial text-2xl sm:text-4xl font-bold leading-snug text-[#C89A61]">
            KEEP SHOWING UP FOR YOURSELF.
          </p>
          <p className="text-sm sm:text-base text-[#FFF9F2]/80 leading-relaxed max-w-xl mx-auto">
            Learn something. Read something. Meet someone. Try something. Go somewhere. Laugh. Grow. Start again. Do something simply because it sounds wonderful.
          </p>
          <div className="pt-2">
            <p className="font-editorial text-xl italic text-[#F6D5C5]">
              Nourish Yourself. Flourish in Purpose.
            </p>
          </div>
          <div className="pt-4">
            <button
              onClick={() => onNavigate('join')}
              className="bg-[#C97C79] hover:bg-[#b56b68] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold px-8 py-3.5 rounded-sm transition-colors shadow-sm"
            >
              Join SheBlooms
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
