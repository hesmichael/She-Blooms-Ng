import React from 'react';
import { ShieldCheck, MessageCircle, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
  onOpenCookieSettings: () => void;
  onOpenAuth?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenCookieSettings, onOpenAuth }) => {
  return (
    <footer className="bg-[#332A28] text-[#FFF9F2] pt-16 pb-12 border-t border-[#7F876B]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#FFF9F2]/15">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="SheBlooms Africa Logo" 
                className="w-10 h-10 object-contain rounded-full bg-[#FFF9F2] p-0.5 shadow-xs" 
                referrerPolicy="no-referrer"
              />
              <span className="font-editorial text-2xl font-bold tracking-tight text-[#FFF9F2]">
                SheBlooms
              </span>
            </div>

            <p className="font-editorial text-lg text-[#F6D5C5] italic">
              Nourish Yourself. Flourish in Purpose.
            </p>

            <p className="text-sm text-[#FFF9F2]/80 max-w-md leading-relaxed">
              A curated community for women in their 30s, 40s, 50s and beyond who want to keep learning, connecting, discovering, experiencing and becoming.
            </p>

            <div className="text-xs text-[#FFF9F2]/70 pt-2 space-y-1">
              <p className="font-medium text-[#FFF9F2]">Legal Entity: Bloom and Beyond Ltd</p>
              <p>Registered in Abuja, Nigeria</p>
              <p>Official Domain: sheblooms.ng</p>
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-[#C89A61] font-semibold">
              Explore SheBlooms
            </h3>
            <div className="grid grid-cols-2 gap-y-2.5 text-sm">
              <button 
                onClick={() => onNavigate('home')} 
                className="text-left text-[#FFF9F2]/85 hover:text-[#C97C79] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Home
              </button>
              <button 
                onClick={() => onNavigate('about')} 
                className="text-left text-[#FFF9F2]/85 hover:text-[#C97C79] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                About
              </button>
              <button 
                onClick={() => onNavigate('events')} 
                className="text-left text-[#FFF9F2]/85 hover:text-[#C97C79] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                What's On
              </button>
              <button 
                onClick={() => onNavigate('conference')} 
                className="text-left text-[#FFF9F2]/85 hover:text-[#C97C79] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Conference 2026
              </button>
              <button 
                onClick={() => onNavigate('books')} 
                className="text-left text-[#FFF9F2]/85 hover:text-[#C97C79] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Book Circle
              </button>
              <button 
                onClick={() => onNavigate('gallery')} 
                className="text-left text-[#FFF9F2]/85 hover:text-[#C97C79] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Community Gallery
              </button>
              <button 
                onClick={() => onNavigate('faq')} 
                className="text-left text-[#FFF9F2]/85 hover:text-[#C97C79] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Questions (FAQ)
              </button>
              <button 
                onClick={() => onNavigate('contact')} 
                className="text-left text-[#FFF9F2]/85 hover:text-[#C97C79] transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Contact
              </button>
              <button 
                onClick={() => onNavigate('join')} 
                className="text-left text-[#C89A61] hover:text-[#FFF9F2] font-medium transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Join (Free)
              </button>
            </div>
          </div>

          {/* Socials & Compliance Column */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-[#C89A61] font-semibold">
              Connect & Reach Out
            </h3>
            
            <div className="space-y-2.5 text-sm text-[#FFF9F2]/85">
              <a 
                href="https://wa.me/2348092345667?text=Hello%20SheBlooms%20Abuja" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-[#F6D5C5] hover:text-[#FFF9F2] transition-colors"
                aria-label="Contact SheBlooms on WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-[#7F876B]" />
                <span>WhatsApp Community</span>
              </a>

              <p className="text-xs text-[#FFF9F2]/75">
                Email: <a href="mailto:hello@sheblooms.ng" className="hover:underline">hello@sheblooms.ng</a>
              </p>
              <p className="text-xs text-[#FFF9F2]/75">
                Instagram: <span className="text-[#FFF9F2]">@sheblooms.ng</span>
              </p>
              <p className="text-xs text-[#FFF9F2]/75">
                Facebook: <span className="text-[#FFF9F2]">SheBlooms Africa</span>
              </p>
            </div>

            <div className="pt-2">
              <div className="flex items-center space-x-2 text-xs text-[#7F876B] bg-[#FFF9F2]/5 px-3 py-2 rounded-sm border border-[#7F876B]/30">
                <ShieldCheck className="w-4 h-4 text-[#C89A61] shrink-0" />
                <span>Encrypted Storage & 2FA Enforced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Compliance Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FFF9F2]/70 gap-4">
          <div className="text-center sm:text-left">
            <p className="flex items-center justify-center sm:justify-start">
              <span>SheBlooms is operated by Bloom and Beyond Ltd. © 2026 Bloom and Beyond Ltd. All rights reserved.</span>
              {onOpenAuth && (
                <button 
                  onClick={onOpenAuth}
                  className="ml-1.5 opacity-25 hover:opacity-80 transition-opacity text-[#FFF9F2] focus-visible:opacity-100 focus-visible:outline-none p-0.5 rounded-xs"
                  title="Administrative Authorization"
                  aria-label="Administrative Authorization"
                >
                  <Lock className="w-3 h-3" />
                </button>
              )}
            </p>
            <p className="text-[11px] text-[#FFF9F2]/50 mt-0.5">
              Compliant with the Nigeria Data Protection Regulation (NDPR). Data is strictly encrypted.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <button 
              onClick={() => onNavigate('privacy')}
              className="hover:text-[#FFF9F2] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C97C79]"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button 
              onClick={() => onNavigate('terms')}
              className="hover:text-[#FFF9F2] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C97C79]"
            >
              Terms & Conditions
            </button>
            <span>•</span>
            <button 
              onClick={() => onNavigate('cookies')}
              className="hover:text-[#FFF9F2] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C97C79]"
            >
              Cookies Policy
            </button>
            <span>•</span>
            <button 
              onClick={onOpenCookieSettings}
              className="text-[#C89A61] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C97C79]"
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
