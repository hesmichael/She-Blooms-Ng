import React from 'react';
import { Cookie, CheckCircle2, Sliders, Shield } from 'lucide-react';

interface CookiesPolicyPageProps {
  onOpenCookiePreferences?: () => void;
}

export const CookiesPolicyPage: React.FC<CookiesPolicyPageProps> = ({ onOpenCookiePreferences }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-[#E8A6B2]/40 pb-6 space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FFF5DE] border border-[#C89A61]/30 rounded-sm text-xs font-semibold text-[#7F876B]">
          <Cookie className="w-4 h-4 text-[#C97C79]" />
          <span className="uppercase tracking-wider">Cookie Transparency & Control</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#332A28]">
          Cookies Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#332A28]/70">
          Last Updated: September 2026 • Bloom and Beyond Ltd, Abuja, Nigeria
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-[#332A28]/85 space-y-8 leading-relaxed">
        {/* SECTION 1 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            1. What Are Cookies?
          </h2>
          <p>
            Cookies are small text files placed on your computer, tablet, or mobile device when you visit a website. They are widely used to ensure websites function properly, retain essential session security, remember preferences, and provide aggregated analytics to site operators without identifying individual persons.
          </p>
        </section>

        {/* SECTION 2 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            2. Categories of Cookies We Use
          </h2>
          <p>
            At SheBlooms, we believe in privacy by design. We strictly limit cookie usage to essential functions and do not deploy intrusive cross-site ad-tracking networks.
          </p>

          <div className="space-y-4 pt-2">
            <div className="p-4 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-base font-bold text-[#332A28]">
                  A. Strictly Necessary Cookies
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#7F876B] text-white px-2 py-0.5 rounded-sm">
                  Always Active
                </span>
              </div>
              <p className="text-xs text-[#332A28]/80 leading-relaxed">
                These cookies are strictly required to provide core website functionality, such as secure member login sessions, Two-Factor Authentication (2FA) verification persistence, and remembering whether you have consented to cookie choices. They cannot be deactivated without disrupting essential security services.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-base font-bold text-[#332A28]">
                  B. Functional Preferences Cookies
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#C89A61] text-white px-2 py-0.5 rounded-sm">
                  Configurable
                </span>
              </div>
              <p className="text-xs text-[#332A28]/80 leading-relaxed">
                These cookies allow the site to remember your specific preferences (such as filtering event categories or remembering your regional timezone in Abuja) to enhance your browsing experience.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-base font-bold text-[#332A28]">
                  C. Aggregate Privacy Analytics
                </h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#C97C79] text-white px-2 py-0.5 rounded-sm">
                  Configurable
                </span>
              </div>
              <p className="text-xs text-[#332A28]/80 leading-relaxed">
                Aggregated, anonymized metrics used to understand page popularity, device compatibility, and form submission health. They do not track you across other websites or construct behavioral profiles.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            3. Managing Your Cookie Preferences
          </h2>
          <p>
            You have full control over non-essential cookies. You may update or revoke your preferences at any time using our on-site Cookie Consent banner.
          </p>
          {onOpenCookiePreferences && (
            <div className="pt-2">
              <button
                onClick={onOpenCookiePreferences}
                className="inline-flex items-center space-x-2 bg-[#332A28] hover:bg-[#C97C79] text-[#FFF9F2] text-xs uppercase tracking-widest font-semibold px-5 py-2.5 rounded-sm transition-colors"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Cookie Preferences</span>
              </button>
            </div>
          )}
          <p className="text-xs text-[#332A28]/75 pt-2">
            Alternatively, most modern browsers allow you to manage, block, or delete cookies via your browser settings. Please note that blocking essential cookies may affect your ability to securely log in or RSVP for events.
          </p>
        </section>

        {/* SECTION 4 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            4. Contact Our Team
          </h2>
          <p className="text-xs text-[#332A28]/80">
            For questions regarding our cookies or data handling practices, reach out to Bloom and Beyond Ltd at <a href="mailto:privacy@sheblooms.ng" className="text-[#C97C79] font-medium underline">privacy@sheblooms.ng</a>.
          </p>
        </section>
      </div>
    </div>
  );
};
