import React, { useState } from 'react';
import { Menu, X, ShieldCheck, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFF9F2]/95 backdrop-blur-xs border-b border-[#E8A6B2]/30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Location */}
          <button
            id="brand-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C97C79]"
            aria-label="SheBlooms Home"
          >
            <img 
              src="/logo.png" 
              alt="SheBlooms Africa Logo" 
              className="h-11 w-11 object-contain rounded-full shadow-xs shrink-0 group-hover:opacity-90 transition-opacity"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-[#332A28] block leading-tight">
                SheBlooms
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#7F876B] font-medium block">
                Abuja, Nigeria
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links: Home | About | What's On | Conference | Join */}
          <nav className="hidden lg:flex items-center space-x-8" aria-label="Main Navigation">
            <button
              id="nav-home-btn"
              onClick={() => handleNavClick('home')}
              className={`text-xs uppercase tracking-wider font-semibold transition-colors hover:text-[#C97C79] py-1 border-b-2 ${
                currentPage === 'home'
                  ? 'text-[#332A28] border-[#C97C79]'
                  : 'text-[#332A28]/80 border-transparent'
              }`}
            >
              Home
            </button>

            <button
              id="nav-about-btn"
              onClick={() => handleNavClick('about')}
              className={`text-xs uppercase tracking-wider font-semibold transition-colors hover:text-[#C97C79] py-1 border-b-2 ${
                currentPage === 'about'
                  ? 'text-[#332A28] border-[#C97C79]'
                  : 'text-[#332A28]/80 border-transparent'
              }`}
            >
              About
            </button>

            <button
              id="nav-events-btn"
              onClick={() => handleNavClick('events')}
              className={`text-xs uppercase tracking-wider font-semibold transition-colors hover:text-[#C97C79] py-1 border-b-2 ${
                currentPage === 'events'
                  ? 'text-[#332A28] border-[#C97C79]'
                  : 'text-[#332A28]/80 border-transparent'
              }`}
            >
              What's On
            </button>

            <button
              id="nav-conference-btn"
              onClick={() => handleNavClick('conference')}
              className={`text-xs uppercase tracking-wider font-semibold transition-colors hover:text-[#C97C79] py-1 border-b-2 ${
                currentPage === 'conference'
                  ? 'text-[#332A28] border-[#C97C79]'
                  : 'text-[#332A28]/80 border-transparent'
              }`}
            >
              Conference
            </button>

            <button
              id="nav-join-link-btn"
              onClick={() => handleNavClick('join')}
              className={`text-xs uppercase tracking-wider font-semibold transition-colors hover:text-[#C97C79] py-1 border-b-2 ${
                currentPage === 'join'
                  ? 'text-[#332A28] border-[#C97C79]'
                  : 'text-[#332A28]/80 border-transparent'
              }`}
            >
              Join
            </button>

            {/* Staff Admin / Member Quick Navigation */}
            {currentUser?.role === 'admin' ? (
              <div className="flex items-center space-x-2">
                <button
                  id="nav-staff-admin-btn"
                  onClick={() => handleNavClick('dashboard')}
                  className={`inline-flex items-center space-x-1.5 text-xs uppercase tracking-wider font-semibold px-3 py-2 rounded-sm border transition-colors ${
                    currentPage === 'dashboard'
                      ? 'bg-[#332A28] text-[#FFF9F2] border-[#332A28]'
                      : 'bg-[#FFF5DE] text-[#332A28] border-[#7F876B]/40 hover:bg-[#F6D5C5]'
                  }`}
                  title="Administrative CMS & Event Management"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7F876B]" />
                  <span>Staff Admin</span>
                </button>
                {onLogout && (
                  <button
                    id="nav-logout-btn"
                    onClick={onLogout}
                    className="p-1.5 text-[#332A28]/60 hover:text-[#332A28] transition-colors rounded-sm"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  id="nav-member-profile-btn"
                  onClick={() => handleNavClick('dashboard')}
                  className={`text-xs uppercase tracking-wider font-semibold py-1 border-b-2 transition-colors ${
                    currentPage === 'dashboard'
                      ? 'text-[#332A28] border-[#C97C79]'
                      : 'text-[#332A28]/80 border-transparent hover:text-[#C97C79]'
                  }`}
                >
                  My Account
                </button>
                {onLogout && (
                  <button
                    id="nav-logout-btn"
                    onClick={onLogout}
                    className="p-1.5 text-[#332A28]/60 hover:text-[#332A28] transition-colors rounded-sm"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              /* Visually Distinct Primary CTA Button */
              <button
                id="nav-join-cta-btn"
                onClick={() => handleNavClick('join')}
                className="bg-[#332A28] hover:bg-[#C97C79] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold px-5 py-2.5 rounded-sm transition-colors shadow-xs"
              >
                Join SheBlooms
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            {currentUser?.role === 'admin' ? (
              <button
                id="mobile-staff-admin-btn"
                onClick={() => handleNavClick('dashboard')}
                className="bg-[#332A28] text-[#FFF9F2] text-[11px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-sm transition-colors flex items-center space-x-1"
              >
                <ShieldCheck className="w-3 h-3 text-[#FFF9F2]" />
                <span>Admin</span>
              </button>
            ) : (
              <button
                id="mobile-join-btn"
                onClick={() => handleNavClick('join')}
                className="bg-[#332A28] hover:bg-[#C97C79] text-[#FFF9F2] text-[11px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-sm transition-colors"
              >
                Join Free
              </button>
            )}

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-sm text-[#332A28] hover:bg-[#FFF5DE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C97C79]"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFF9F2] border-b border-[#E8A6B2]/40 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`text-left px-3 py-2 text-sm font-semibold rounded-sm ${
                currentPage === 'home' ? 'bg-[#FFF5DE] text-[#C97C79]' : 'text-[#332A28]'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`text-left px-3 py-2 text-sm font-semibold rounded-sm ${
                currentPage === 'about' ? 'bg-[#FFF5DE] text-[#C97C79]' : 'text-[#332A28]'
              }`}
            >
              About
            </button>

            <button
              onClick={() => handleNavClick('events')}
              className={`text-left px-3 py-2 text-sm font-semibold rounded-sm ${
                currentPage === 'events' ? 'bg-[#FFF5DE] text-[#C97C79]' : 'text-[#332A28]'
              }`}
            >
              What's On
            </button>

            <button
              onClick={() => handleNavClick('conference')}
              className={`text-left px-3 py-2 text-sm font-semibold rounded-sm ${
                currentPage === 'conference' ? 'bg-[#FFF5DE] text-[#C97C79]' : 'text-[#332A28]'
              }`}
            >
              Conference
            </button>

            <button
              onClick={() => handleNavClick('join')}
              className={`text-left px-3 py-2 text-sm font-semibold rounded-sm ${
                currentPage === 'join' ? 'bg-[#FFF5DE] text-[#C97C79]' : 'text-[#332A28]'
              }`}
            >
              Join
            </button>
          </div>

          <div className="pt-2 border-t border-[#E8A6B2]/20 space-y-2">
            {currentUser?.role === 'admin' ? (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="w-full bg-[#332A28] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold py-3 rounded-sm flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FFF9F2]" />
                  <span>Staff Admin Portal</span>
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-center text-xs text-[#332A28]/70 py-1 hover:text-[#332A28]"
                  >
                    Sign Out ({currentUser.name})
                  </button>
                )}
              </>
            ) : currentUser ? (
              <>
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="w-full bg-[#FFF5DE] border border-[#E8A6B2]/60 text-[#332A28] text-xs uppercase tracking-wider font-semibold py-2.5 rounded-sm text-center"
                >
                  My Account Dashboard
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-center text-xs text-[#332A28]/70 py-1 hover:text-[#332A28]"
                  >
                    Sign Out
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={() => handleNavClick('join')}
                className="w-full bg-[#332A28] hover:bg-[#C97C79] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold py-3 rounded-sm transition-colors text-center shadow-xs"
              >
                Join SheBlooms (Free)
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
