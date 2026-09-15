import React from 'react';
import { Calendar, MapPin, Tag, ArrowRight } from 'lucide-react';
import { SheBloomsEvent } from '../types';

interface EventsPageProps {
  events: SheBloomsEvent[];
  onSelectEvent: (event: SheBloomsEvent) => void;
  onNavigate: (page: string) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  events,
  onSelectEvent,
  onNavigate,
}) => {
  // Show upcoming activities chronologically (do not force visitors to choose programme categories first)
  const upcomingEvents = events.filter(e => !e.isPast);
  const pastEvents = events.filter(e => e.isPast);

  return (
    <div className="space-y-16 md:space-y-24 pb-20">
      {/* HERO SECTION (V2 Dev Instructions, Page 29) */}
      <section className="pt-12 pb-14 border-b border-[#E8A6B2]/30 bg-[#FFF5DE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FFF9F2] border border-[#C89A61]/30 rounded-sm text-xs font-semibold text-[#7F876B]">
            <Calendar className="w-3.5 h-3.5 text-[#C97C79]" />
            <span className="uppercase tracking-widest text-[11px]">Curated Calendar • Abuja & Beyond</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-[#332A28] leading-tight">
            WHAT'S ON
          </h1>

          <p className="text-base sm:text-lg text-[#332A28]/85 max-w-2xl mx-auto leading-relaxed">
            Something to learn. Something to enjoy. Something to look forward to.
          </p>

          <p className="text-xs sm:text-sm text-[#332A28]/70 italic max-w-xl mx-auto">
            Every SheBlooms calendar is intentionally different. Some experiences are free; others carry a cost, with details shared when each is announced.
          </p>
        </div>
      </section>

      {/* SECTION 2: COMING UP (Chronological Upcoming Activities) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-[#E8A6B2]/30 pb-4">
          <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
            Upcoming Schedule
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#332A28]">
            COMING UP
          </h2>
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="p-12 bg-white border border-[#E8A6B2]/40 rounded-sm text-center space-y-3">
            <p className="font-editorial text-lg font-bold text-[#332A28]">
              New experiences are being curated right now.
            </p>
            <p className="text-xs sm:text-sm text-[#332A28]/70 max-w-md mx-auto">
              Join SheBlooms for free to be the very first to know when the next activity, dinner or book discussion is announced.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('join')}
                className="bg-[#332A28] hover:bg-[#C97C79] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold px-6 py-3 rounded-sm transition-colors"
              >
                Join SheBlooms (Free)
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-sm border border-[#E8A6B2]/40 overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  <div className="relative h-52 w-full bg-[#332A28] overflow-hidden">
                    <img
                      src={evt.image}
                      alt={`Activity atmosphere for ${evt.title}`}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                      <span className="bg-[#332A28]/90 text-[#FFF9F2] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm">
                        {evt.category}
                      </span>
                      {evt.status && (
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-sm ${
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
                    <div className="absolute bottom-3 right-3 bg-[#FFF9F2]/95 text-[#332A28] text-xs font-semibold px-2.5 py-1 rounded-sm shadow-xs">
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

                    <p className="text-xs text-[#332A28]/75 line-clamp-3 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 mt-3 border-t border-[#E8A6B2]/20">
                  <button
                    onClick={() => onSelectEvent(evt)}
                    className="w-full mt-3 bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] text-xs uppercase tracking-widest font-semibold py-3 rounded-sm transition-colors text-center shadow-xs"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 3: PAST (You Missed These) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8A6B2]/30 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold">
              Previous Activities
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#332A28]">
              YOU MISSED THESE.
            </h2>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-[#C97C79] hover:text-[#332A28]"
          >
            <span>See The Moments</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {pastEvents.length === 0 ? (
          <p className="text-xs text-[#332A28]/70 italic">
            Past activity archives are updated as new gatherings conclude.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pastEvents.map((past) => (
              <div
                key={past.id}
                className="bg-white rounded-sm border border-[#E8A6B2]/40 overflow-hidden flex flex-col justify-between opacity-85 hover:opacity-100 transition-opacity"
              >
                <div>
                  <div className="relative h-40 w-full bg-[#332A28]">
                    <img
                      src={past.image}
                      alt={`Past activity: ${past.title}`}
                      className="w-full h-full object-cover grayscale-[30%]"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-[#332A28]/90 text-[#FFF9F2] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                      {past.category}
                    </div>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <span className="text-[11px] text-[#7F876B] font-medium block">
                      {past.date}
                    </span>
                    <h3 className="font-editorial text-sm font-bold text-[#332A28] line-clamp-2">
                      {past.title}
                    </h3>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button
                    onClick={() => onNavigate('gallery')}
                    className="w-full text-center text-xs font-semibold text-[#C97C79] hover:underline py-1"
                  >
                    See Moments
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-6 text-center">
          <p className="font-editorial text-xl sm:text-2xl font-bold text-[#332A28]">
            # DON'T MISS THE NEXT ONE.
          </p>
          <div className="pt-3">
            <button
              onClick={() => onNavigate('join')}
              className="bg-[#332A28] hover:bg-[#C97C79] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold px-7 py-3 rounded-sm transition-colors"
            >
              Join SheBlooms - It's Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
