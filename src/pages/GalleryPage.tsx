import React from 'react';
import { ArrowRight } from 'lucide-react';

interface GalleryPageProps {
  onNavigate: (page: string) => void;
}

interface GalleryItem {
  image: string;
  caption: string;
  subtitle?: string;
  tag: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80',
    caption: 'This is what community looks like.',
    subtitle: 'Sunday Table garden lunch, Wuse II',
    tag: 'Social'
  },
  {
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80',
    caption: 'Yes. Grown women still play.',
    subtitle: 'Clay & pottery afternoon, Jabi',
    tag: 'Creative'
  },
  {
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=80',
    caption: 'Learning can look like this too.',
    subtitle: 'Book Circle reflection salon',
    tag: 'Books'
  },
  {
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80',
    caption: 'She came alone.',
    subtitle: 'Maitama finance seminar',
    tag: 'Learning'
  },
  {
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1000&q=80',
    caption: 'More life in your life.',
    subtitle: 'Gurara waterfall day walk',
    tag: 'Outing'
  },
  {
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1000&q=80',
    caption: 'Next time, come.',
    subtitle: 'Executive panel & conversation salon',
    tag: 'Learning'
  }
];

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 md:space-y-20 pb-20">
      {/* HERO */}
      <section className="pt-10 pb-8 border-b border-[#E8A6B2]/30 bg-[#FFF5DE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
            Visual Archive
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#332A28]">
            YOU SHOULD HAVE BEEN THERE.
          </h1>
          <p className="text-base sm:text-lg text-[#332A28]/85 max-w-xl mx-auto leading-relaxed">
            Some things are difficult to explain. Fortunately, we took pictures.
          </p>
        </div>
      </section>

      {/* GALLERY MOSAIC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {GALLERY_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-sm border border-[#E8A6B2]/40 overflow-hidden shadow-sm group hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[4/3] bg-[#332A28] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3 bg-[#332A28]/80 text-[#FFF9F2] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                  {item.tag}
                </div>
              </div>

              <div className="p-5 space-y-1">
                <p className="font-editorial text-lg font-bold text-[#332A28]">
                  "{item.caption}"
                </p>
                {item.subtitle && (
                  <p className="text-xs text-[#7F876B] font-medium">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM BANNER (From SheBlooms spec) */}
        <div className="p-8 sm:p-12 bg-[#332A28] text-[#FFF9F2] rounded-sm text-center space-y-4">
          <p className="text-xs uppercase tracking-widest text-[#C89A61] font-semibold">
            The Community Awaits
          </p>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#FFF9F2]">
            DON'T MISS THE NEXT ONE.
          </h2>
          <p className="text-xs sm:text-sm text-[#F6D5C5] max-w-md mx-auto">
            Discover upcoming activities, book discussions, and social dinners across Abuja.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('events')}
              className="inline-flex items-center space-x-2 bg-[#C97C79] hover:bg-[#b56b68] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold px-7 py-3 rounded-sm transition-colors"
            >
              <span>See What's Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
