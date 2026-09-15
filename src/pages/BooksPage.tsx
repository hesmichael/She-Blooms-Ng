import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, MessageCircle, Video, CheckCircle2, ArrowRight } from 'lucide-react';
import { BookItem } from '../types';

interface BooksPageProps {
  onNavigate: (page: string) => void;
}

export const BooksPage: React.FC<BooksPageProps> = ({ onNavigate }) => {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch('/api/books');
        if (res.ok) {
          const data = await res.json();
          setBooks(data.books || []);
        }
      } catch (err) {
        console.error('Failed to load books:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const currentBook = books.find(b => b.isCurrent) || books[0];
  const previousBooks = books.filter(b => b !== currentBook);

  const handleJoinConversation = (bookTitle: string) => {
    const message = encodeURIComponent(`Hello SheBlooms, I would love to join the monthly book circle conversation for "${bookTitle}".`);
    window.open(`https://wa.me/2348092345667?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-16 md:space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="pt-12 pb-14 border-b border-[#E8A6B2]/30 bg-[#FFF5DE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#FFF9F2] border border-[#C89A61]/30 rounded-sm text-xs font-semibold text-[#7F876B]">
            <BookOpen className="w-3.5 h-3.5 text-[#C97C79]" />
            <span className="uppercase tracking-widest text-[11px]">Monthly Book Circle</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl font-bold text-[#332A28] leading-tight">
            READ SOMETHING. TALK ABOUT IT.
          </h1>

          <p className="text-base sm:text-lg text-[#332A28]/85 max-w-2xl mx-auto leading-relaxed">
            Once a month, SheBlooms women come together online around a book and the ideas it opens up. Sometimes on Zoom. Sometimes through WhatsApp. Always with room for different perspectives.
          </p>
        </div>
      </section>

      {/* CURRENT BOOK SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="border-b border-[#E8A6B2]/30 pb-4">
            <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
              Current Selection
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#332A28]">
              CURRENT BOOK
            </h2>
          </div>

          {currentBook ? (
            <div className="bg-white rounded-sm border border-[#E8A6B2]/40 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
              <div className="md:col-span-4 lg:col-span-3">
                <div className="aspect-[2/3] rounded-sm overflow-hidden bg-[#332A28] border border-[#E8A6B2]/40 shadow-md">
                  <img
                    src={currentBook.coverImage}
                    alt={`Book cover for ${currentBook.title}`}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>

              <div className="md:col-span-8 lg:col-span-9 space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[#C89A61] uppercase tracking-wider">
                    Book of the Month
                  </span>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[#332A28]">
                    {currentBook.title}
                  </h3>
                  <p className="text-sm font-medium text-[#7F876B]">
                    By {currentBook.author}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#332A28]/80 py-2 border-y border-[#E8A6B2]/20">
                  <div className="flex items-center space-x-1.5 font-medium">
                    <Calendar className="w-4 h-4 text-[#C97C79]" />
                    <span>Discussion Date: {currentBook.discussionDate}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 font-medium">
                    <Video className="w-4 h-4 text-[#7F876B]" />
                    <span>Format: {currentBook.format}</span>
                  </div>
                </div>

                <p className="text-sm text-[#332A28]/85 leading-relaxed">
                  {currentBook.introduction}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => handleJoinConversation(currentBook.title)}
                    className="inline-flex items-center justify-center space-x-2 bg-[#332A28] text-[#FFF9F2] hover:bg-[#C97C79] text-xs uppercase tracking-widest font-semibold px-6 py-3.5 rounded-sm transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 text-[#C89A61]" />
                    <span>Join The Conversation</span>
                  </button>
                  <button
                    onClick={() => onNavigate('events')}
                    className="inline-flex items-center justify-center space-x-2 text-xs uppercase tracking-widest font-semibold text-[#332A28] hover:text-[#C97C79] py-3.5 px-4"
                  >
                    <span>View All What's On</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-sm border border-[#E8A6B2]/40 text-center">
              <p className="text-sm text-[#332A28]/80">Loading current book selection...</p>
            </div>
          )}
        </div>
      </section>

      {/* PREVIOUS BOOKS ARCHIVE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-[#E8A6B2]/30 pb-4">
          <span className="text-xs uppercase tracking-widest text-[#7F876B] font-semibold block">
            Reading Archive
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#332A28]">
            WHAT WE'VE BEEN READING
          </h2>
          <p className="text-xs sm:text-sm text-[#332A28]/75">
            A selection of past titles explored during SheBlooms reading circles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {previousBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-sm border border-[#E8A6B2]/40 p-5 space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div className="flex space-x-4">
                <div className="w-20 h-28 shrink-0 rounded-sm overflow-hidden bg-[#332A28] border border-[#E8A6B2]/30">
                  <img
                    src={book.coverImage}
                    alt={`Cover of ${book.title}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-editorial text-base font-bold text-[#332A28] leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-xs font-medium text-[#7F876B]">
                    By {book.author}
                  </p>
                  <p className="text-[11px] text-[#332A28]/65 pt-1">
                    Discussed: {book.discussionDate}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#332A28]/75 line-clamp-3 leading-relaxed">
                {book.introduction}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
