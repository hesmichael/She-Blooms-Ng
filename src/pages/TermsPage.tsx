import React from 'react';
import { Scale, FileText, CheckCircle2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-[#E8A6B2]/40 pb-6 space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FFF5DE] border border-[#C89A61]/30 rounded-sm text-xs font-semibold text-[#7F876B]">
          <Scale className="w-4 h-4 text-[#C97C79]" />
          <span className="uppercase tracking-wider">Community Standards & Service Agreement</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#332A28]">
          Terms and Conditions
        </h1>
        <p className="text-xs sm:text-sm text-[#332A28]/70">
          Last Updated: September 2026 • Bloom and Beyond Ltd, Abuja, Nigeria
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-[#332A28]/85 space-y-8 leading-relaxed">
        {/* SECTION 1 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            1. Acceptance of Terms
          </h2>
          <p>
            Welcome to SheBlooms. These Terms and Conditions constitute a legally binding agreement between you and Bloom and Beyond Ltd ("SheBlooms", "we", "us", or "our"), governing your access to and participation in our website, digital platforms, community gatherings, online seminars, book circles, and annual conferences.
          </p>
          <p>
            By joining our community, registering for an experience, or accessing this site, you acknowledge that you have read, understood, and agreed to be bound by these terms.
          </p>
        </section>

        {/* SECTION 2 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            2. Community Membership & Free Access
          </h2>
          <p>
            Joining the SheBlooms community is completely free of charge. Free membership grants you access to general community announcements, newsletters, and eligibility to register for scheduled events.
          </p>
          <p>
            Membership does not obligate you to attend every gathering. SheBlooms reserves the right, acting reasonably and in good faith, to revoke or suspend membership if a member engages in conduct detrimental to the safety, dignity, or harmony of the community.
          </p>
        </section>

        {/* SECTION 3 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            3. Event Registrations, Ticketing & Pricing
          </h2>
          <p>
            SheBlooms curates a diverse spectrum of gatherings. Some events are free of charge, while others (such as masterclasses, curated multi-course lunches, creative workshops, travel outings, or the Annual Conference) carry a registration fee.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>
              <strong>Transparency:</strong> Transparent pricing is clearly specified upon the formal announcement of each experience. No hidden fees are assessed.
            </li>
            <li>
              <strong>Cancellations & Transfers:</strong> Because our hosts reserve catering and venues in advance, event cancellations must be made within the notice window specified per event. In many instances, registrations may be transferred to a fellow community member upon prior notice to our team.
            </li>
            <li>
              <strong>Modifications:</strong> In the unlikely event that a venue or date must be rescheduled due to circumstances beyond our control, registered attendees will be offered either attendance at the rescheduled date or a full refund.
            </li>
          </ul>
        </section>

        {/* SECTION 4 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            4. Safe Space, Mutual Respect & Non-Solicitation
          </h2>
          <p>
            SheBlooms is dedicated to providing an inspiring, warm, and authentic atmosphere where adult women can flourish.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>
              <strong>Harassment-Free Policy:</strong> We enforce zero tolerance for harassment, discrimination, hate speech, defamation, or intimidating behavior of any kind.
            </li>
            <li>
              <strong>Organic Relationships over Unsolicited Solicitation:</strong> While we celebrate women entrepreneurs and professionals, SheBlooms gatherings are curated for genuine connection rather than predatory multi-level marketing or aggressive unsolicited sales pitches.
            </li>
          </ul>
        </section>

        {/* SECTION 5 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            5. Intellectual Property & Photography
          </h2>
          <p>
            All editorial copy, design assets, brand identifiers, and educational course materials created by SheBlooms are the intellectual property of Bloom and Beyond Ltd.
          </p>
          <p>
            Photographs and documentary video may be captured during live events to memorialize moments for our visual archive. Attendees will always be notified at the onset of an event, and any member wishing to decline photography may notify the event host on-site without hesitation.
          </p>
        </section>

        {/* SECTION 6 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            6. Limitation of Liability & Governing Law
          </h2>
          <p>
            While Bloom and Beyond Ltd takes every prudent precaution in venue selection and experience curation, attendees participate in social and recreational activities at their own discretion. To the maximum extent permitted by law, Bloom and Beyond Ltd disclaims liability for indirect, incidental, or consequential damages.
          </p>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, and any dispute shall be submitted to the competent courts of the Federal Capital Territory, Abuja.
          </p>
        </section>

        {/* SECTION 7 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            7. Inquiries & Contact
          </h2>
          <p className="text-xs text-[#332A28]/80">
            For questions or legal correspondence regarding these terms, please contact:
          </p>
          <p className="text-xs bg-[#FFF5DE] p-3 border border-[#E8A6B2]/40 rounded-sm">
            <strong>Bloom and Beyond Ltd</strong><br />
            Abuja, Federal Capital Territory, Nigeria<br />
            Email: legal@sheblooms.ng
          </p>
        </section>
      </div>
    </div>
  );
};
