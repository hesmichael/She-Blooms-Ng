import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageCircle, ArrowRight } from 'lucide-react';

interface FaqPageProps {
  onNavigate: (page: string) => void;
}

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FaqItem[] = [
  {
    question: "Is it free to join SheBlooms?",
    answer: "Yes, joining costs nothing. Membership simply keeps you in the loop for upcoming gatherings, book circles, and announcements. Some individual experiences are free; others carry a cost, which is always clearly shared when that experience is announced."
  },
  {
    question: "How do I pay for a paid event?",
    answer: "Payment is handled directly, not online through an automated gateway. Once you reserve your place on the website, the SheBlooms team will follow up directly via WhatsApp or email with verified bank payment details."
  },
  {
    question: "I don't know anyone; can I still come?",
    answer: "Yes, absolutely. In fact, many women arrive alone. Our experiences are intentionally designed to make it effortless to arrive by yourself. Hosts welcome you, introductions happen naturally, and the curated activities create easy, unhurried conversation. You won't feel alone for long."
  },
  {
    question: "How do I find out what's happening next?",
    answer: "Join our free mailing list, connect with our official WhatsApp community, follow SheBlooms on Instagram (@sheblooms.ng), or check the What's On page on this website regularly."
  },
  {
    question: "Can I suggest an idea for an event?",
    answer: "Yes, we always welcome thoughtful ideas! Please reach out to us via our Contact form or send a message directly to our WhatsApp concierge."
  },
  {
    question: "What if I need to cancel my place?",
    answer: "Because our hosts reserve catering and intimate venues in advance, please let our team know as early as possible if your plans change. In many cases, reservations can also be transferred to a friend or fellow community member upon advance notice."
  }
];

export const FaqPage: React.FC<FaqPageProps> = ({ onNavigate }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  const handleAskWhatsApp = () => {
    const msg = encodeURIComponent("Hello SheBlooms, I have a question about the community before I join.");
    window.open(`https://wa.me/2348092345667?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-16 md:space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="pt-12 pb-14 border-b border-[#E8A6B2]/30 bg-[#FFF5DE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FFF9F2] border border-[#C89A61]/30 rounded-sm text-xs font-semibold text-[#7F876B]">
            <HelpCircle className="w-3.5 h-3.5 text-[#C97C79]" />
            <span className="uppercase tracking-widest text-[11px]">Help & Clarifications</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-[#332A28] leading-tight">
            QUESTIONS BEFORE YOU JOIN?
          </h1>

          <p className="text-base sm:text-lg text-[#332A28]/85 max-w-2xl mx-auto leading-relaxed">
            Here are answers to common questions about how SheBlooms works, how to attend events, and what to expect.
          </p>
        </div>
      </section>

      {/* ACCORDION FAQ SECTION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="space-y-3.5">
          {FAQ_LIST.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-sm border border-[#E8A6B2]/40 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleIndex(idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:bg-[#FFF5DE]"
                  aria-expanded={isOpen}
                >
                  <span className="font-editorial text-base sm:text-lg font-bold text-[#332A28]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7F876B] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#332A28]/80 leading-relaxed border-t border-[#E8A6B2]/20">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* STILL HAVE QUESTIONS BLOCK */}
        <div className="mt-12 p-6 sm:p-8 bg-[#FFF5DE] rounded-sm border border-[#C89A61]/30 text-center space-y-4">
          <h2 className="font-editorial text-xl font-bold text-[#332A28]">
            Still have a question?
          </h2>
          <p className="text-xs sm:text-sm text-[#332A28]/80 max-w-md mx-auto">
            Our team in Abuja is always happy to help. Reach out directly on WhatsApp or submit a note via our contact page.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              onClick={handleAskWhatsApp}
              className="inline-flex items-center space-x-2 bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] text-xs uppercase tracking-widest font-semibold px-6 py-3 rounded-sm transition-colors shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-[#C89A61]" />
              <span>Ask Us on WhatsApp</span>
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest font-semibold text-[#332A28] hover:text-[#C97C79] px-4 py-3"
            >
              <span>Contact Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
