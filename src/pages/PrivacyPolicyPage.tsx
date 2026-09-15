import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-[#E8A6B2]/40 pb-6 space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FFF5DE] border border-[#C89A61]/30 rounded-sm text-xs font-semibold text-[#7F876B]">
          <ShieldCheck className="w-4 h-4 text-[#C97C79]" />
          <span className="uppercase tracking-wider">NDPR & Global Data Protection Compliance</span>
        </div>
        <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#332A28]">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#332A28]/70">
          Last Updated: September 2026 • Published by Bloom and Beyond Ltd, Abuja, Nigeria
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-[#332A28]/85 space-y-8 leading-relaxed">
        {/* SECTION 1 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            1. Introduction and Data Controller
          </h2>
          <p>
            Bloom and Beyond Ltd ("SheBlooms", "we", "us", or "our") is a registered enterprise in the Federal Republic of Nigeria operating community initiatives, educational seminars, social gatherings, and conferences tailored for adult women.
          </p>
          <p>
            We take your privacy seriously. This Privacy Policy details how we collect, use, store, and protect your personal data in full compliance with the <strong>Nigeria Data Protection Act (NDPA)</strong>, the <strong>Nigeria Data Protection Regulation (NDPR)</strong>, and applicable international privacy standards.
          </p>
          <p className="text-xs bg-[#FFF5DE] p-3 border border-[#E8A6B2]/40 rounded-sm">
            <strong>Data Controller:</strong> Bloom and Beyond Ltd, Abuja, FCT, Nigeria.<br />
            <strong>Contact:</strong> privacy@sheblooms.ng
          </p>
        </section>

        {/* SECTION 2 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            2. Data Minimization & Information We Collect
          </h2>
          <p>
            In accordance with the principle of data minimization, we strictly collect only the information necessary to provide our community services, manage event attendance, verify your account security, and keep you informed.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>
              <strong>Account & Identification Data:</strong> Full name, email address, WhatsApp/phone number, and city of residence.
            </li>
            <li>
              <strong>Security Credentials:</strong> Passwords (salted and hashed using PBKDF2-SHA512) and Two-Factor Authentication (2FA) TOTP secret keys.
            </li>
            <li>
              <strong>Event & Community Preferences:</strong> Activities registered for, dietary or accessibility notes submitted during event RSVPs, optional age bracket (e.g. 30s, 40s, 50s+), and topical interests (e.g. business, books, wellbeing).
            </li>
            <li>
              <strong>Communications:</strong> Records of messages and inquiries sent via our contact forms or customer concierge.
            </li>
          </ul>
          <p className="text-xs italic text-[#7F876B]">
            We do not collect sensitive biometrics, government identification numbers, or unauthorized third-party tracking profiles.
          </p>
        </section>

        {/* SECTION 3 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            3. Encryption and Database Security
          </h2>
          <p>
            We deploy strict cryptographic safeguards to protect all user data stored within our systems:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-1">
              <span className="font-bold text-[#332A28] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#C97C79]" /> AES-256-GCM Encryption
              </span>
              <p className="text-[#332A28]/75">
                All sensitive user identifiers (names, emails, WhatsApp contact data) are encrypted at rest with industry-standard 256-bit Galois/Counter Mode authenticated encryption.
              </p>
            </div>
            <div className="p-3 bg-white border border-[#E8A6B2]/40 rounded-sm space-y-1">
              <span className="font-bold text-[#332A28] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C97C79]" /> Mandatory Two-Factor Authentication
              </span>
              <p className="text-[#332A28]/75">
                Every registered member account requires RFC 6238 Time-based One-Time Passwords (TOTP) to guarantee account isolation against unauthorized access.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            4. Purpose & Lawful Basis of Processing
          </h2>
          <p>We process your personal data under the following lawful bases:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
            <li><strong>Consent:</strong> When you actively opt-in to newsletter updates, submit an event registration, or apply for free membership.</li>
            <li><strong>Contractual Necessity:</strong> To coordinate your ticket reservations, process event entrance confirmations, and provide community support.</li>
            <li><strong>Legal Obligation:</strong> To maintain compliant accounting, safety compliance, and corporate documentation under Nigerian law.</li>
          </ul>
        </section>

        {/* SECTION 5 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            5. Third-Party Sharing & Tracking Policy
          </h2>
          <p>
            <strong>We do not sell, rent, lease, or monetize your personal data.</strong> We do not include predatory cross-site tracking pixels or invasive advertising networks. Data is only shared with verified infrastructure providers (such as secure hosting providers and payment processors for paid ticket tiers) solely for executing requested services under strict confidentiality agreements.
          </p>
        </section>

        {/* SECTION 6 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            6. Your Rights Under NDPR and Privacy Law
          </h2>
          <p>As a data subject, you hold clear statutory rights:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Right to Access:</strong> You may request a copy of the personal information we hold about you.</li>
            <li><strong>Right to Rectification:</strong> You may update inaccurate or incomplete information.</li>
            <li><strong>Right to Erasure ("Right to Be Forgotten"):</strong> You may request the permanent deletion of your account and encrypted contact records.</li>
            <li><strong>Right to Withdraw Consent:</strong> You may revoke consent at any time without penalty.</li>
          </ul>
          <p className="text-xs text-[#332A28]/80">
            To exercise any of these rights, contact our Data Protection Officer directly at <a href="mailto:privacy@sheblooms.ng" className="text-[#C97C79] font-medium underline">privacy@sheblooms.ng</a>.
          </p>
        </section>

        {/* SECTION 7 */}
        <section className="space-y-3">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            7. Updates to This Policy
          </h2>
          <p>
            We may update this policy periodically to reflect evolving regulatory standards or service enhancements. Material changes will be prominently announced on our platform and sent to registered community members.
          </p>
        </section>
      </div>
    </div>
  );
};
