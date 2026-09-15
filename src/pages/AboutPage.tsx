import React from 'react';
import { Sparkles, BookOpen, Users, Heart, Compass, Calendar, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* HERO SECTION */}
      <section className="pt-10 pb-8 border-b border-[#E8A6B2]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FFF5DE] border border-[#C89A61]/30 rounded-sm text-xs font-semibold text-[#7F876B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C97C79]"></span>
            <span className="uppercase tracking-widest text-[11px]">About SheBlooms • Abuja, Nigeria</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-[#332A28] leading-tight">
            WE BELIEVE WOMEN SHOULD KEEP BLOOMING.
          </h1>

          <div className="space-y-3 text-base sm:text-lg text-[#332A28]/85 max-w-2xl mx-auto leading-relaxed">
            <p>
              Not only in their careers. Not only in business. Not only in marriage or motherhood. Not only in what they do for everyone else.
            </p>
            <p className="font-editorial text-2xl text-[#C97C79] font-bold">
              As women.
            </p>
            <p className="text-sm sm:text-base text-[#332A28]/80 pt-2">
              SheBlooms creates spaces for women to continue learning, connecting, discovering, enjoying and becoming.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: WHY WE EXIST */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#FFF5DE] p-8 sm:p-12 rounded-sm border border-[#E8A6B2]/40 space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
            The Purpose
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-bold text-[#332A28] leading-snug">
            YOUR WORLD SHOULDN'T GET SMALLER AS YOUR RESPONSIBILITIES GET BIGGER.
          </h2>

          <div className="space-y-4 text-sm sm:text-base text-[#332A28]/85 leading-relaxed">
            <p>
              As women move through adulthood, life often becomes fuller and sometimes narrower. There is more responsibility, more work, more people depending on us, and less time and spontaneity for friends and new experiences. Many of the social spaces around us are also built either for much younger people, or around one specific identity.
            </p>
            <p>
              We wanted to create something broader: a community centred on the woman herself. A place to learn something useful. Meet someone interesting. Read something thought-provoking. Have conversations that matter. Try something different. Go somewhere. Laugh. Grow. And continue discovering who you are becoming.
            </p>
            <p className="font-editorial text-xl font-bold text-[#332A28] pt-2">
              That is SheBlooms.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: OUR MOTTO */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
          Our Guiding Philosophy
        </span>
        <div className="space-y-2">
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#332A28]">
            NOURISH YOURSELF.
          </h2>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#C97C79]">
            FLOURISH IN PURPOSE.
          </h2>
        </div>

        <p className="text-sm sm:text-base text-[#332A28]/85 max-w-2xl mx-auto leading-relaxed">
          We believe flourishing begins with continuing to invest in yourself: your knowledge, your wellbeing, your relationships, your financial life, your career, your business, your interests, your friendships, your curiosity, your enjoyment of life.
        </p>

        <p className="font-editorial text-lg text-[#7F876B] italic">
          SheBlooms creates different opportunities to make that investment.
        </p>
      </section>

      {/* SECTION 4: WHO IT'S FOR */}
      <section className="bg-[#332A28] text-[#FFF9F2] py-16 px-4 sm:px-8 rounded-sm max-w-5xl mx-auto">
        <div className="max-w-3xl mx-auto text-center space-y-5">
          <span className="text-xs uppercase tracking-widest text-[#C89A61] font-semibold block">
            A Welcoming Space
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#FFF9F2]">
            THERE'S ROOM FOR YOU.
          </h2>
          <p className="text-sm sm:text-base text-[#FFF9F2]/85 leading-relaxed">
            SheBlooms doesn't have a single type of member. Whatever season you're in - building, rebuilding, starting again, or simply curious what's next, there's a place for you here.
          </p>
          <p className="font-editorial text-xl text-[#F6D5C5] font-medium">
            You don't need to fit a category to belong here.
          </p>
        </div>
      </section>

      {/* SECTION 5: WHAT WE CREATE */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
            Our Offerings
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#332A28]">
            WHAT WE CREATE
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-5 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-2">
            <Sparkles className="w-5 h-5 text-[#C97C79]" />
            <h3 className="font-editorial text-lg font-bold text-[#332A28]">
              Seminars & Conversations
            </h3>
            <p className="text-xs text-[#332A28]/75 leading-relaxed">
              Business, money, career pivots, and executive leadership seminars with accomplished women.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-2">
            <BookOpen className="w-5 h-5 text-[#C97C79]" />
            <h3 className="font-editorial text-lg font-bold text-[#332A28]">
              Book Discussions
            </h3>
            <p className="text-xs text-[#332A28]/75 leading-relaxed">
              Monthly guided circles on Zoom and WhatsApp exploring deep, thought-provoking texts.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-2">
            <Users className="w-5 h-5 text-[#C97C79]" />
            <h3 className="font-editorial text-lg font-bold text-[#332A28]">
              Social Gatherings
            </h3>
            <p className="text-xs text-[#332A28]/75 leading-relaxed">
              Unhurried lunches, garden brunches, games afternoons, and dinners where arriving alone is completely natural.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-2">
            <Heart className="w-5 h-5 text-[#C97C79]" />
            <h3 className="font-editorial text-lg font-bold text-[#332A28]">
              Curated Experiences
            </h3>
            <p className="text-xs text-[#332A28]/75 leading-relaxed">
              Hands-on pottery, wellness retreats, arts, and creative masterclasses.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-2">
            <Compass className="w-5 h-5 text-[#C97C79]" />
            <h3 className="font-editorial text-lg font-bold text-[#332A28]">
              Outings & Occasional Trips
            </h3>
            <p className="text-xs text-[#332A28]/75 leading-relaxed">
              Day trips, road journeys across West Africa, and weekend getaways planned with care.
            </p>
          </div>

          <div className="p-5 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-2">
            <Calendar className="w-5 h-5 text-[#C97C79]" />
            <h3 className="font-editorial text-lg font-bold text-[#332A28]">
              Annual Conference
            </h3>
            <p className="text-xs text-[#332A28]/75 leading-relaxed">
              Our flagship annual convention in Abuja bringing together hundreds of visionary women.
            </p>
          </div>
        </div>

        <p className="text-center font-editorial text-lg text-[#7F876B] italic">
          The exact calendar changes. The purpose doesn't.
        </p>
      </section>

      {/* SECTION 6: CTA */}
      <section className="bg-[#FFF5DE] py-14 text-center border-t border-[#E8A6B2]/30">
        <div className="max-w-2xl mx-auto px-4 space-y-4">
          <h2 className="font-editorial text-3xl font-bold text-[#332A28]">
            THERE'S MORE LIFE AHEAD.
          </h2>
          <p className="text-xs sm:text-sm text-[#332A28]/80">
            Join the community today for free and stay in the loop for what comes next.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('join')}
              className="bg-[#332A28] hover:bg-[#C97C79] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold px-8 py-3.5 rounded-sm transition-colors shadow-sm"
            >
              Join SheBlooms
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
