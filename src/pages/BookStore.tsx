import { useQuery } from '@tanstack/react-query';
import React, { useState, useEffect, useRef } from 'react';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';
import { Library, Loader, X, ExternalLink, ArrowLeft } from 'lucide-react';
import { bookApi } from '../api/bookApi';
import type { BookDto } from '../types';

/* ── Scroll animation hook ─────────────────────────────────────────── */
const useReveal = (delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Set initial state
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
};

const transitionStyle: React.CSSProperties = {
  transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
};

/* ── BooksIntro ────────────────────────────────────────────────────── */
const BooksIntro: React.FC = () => {
  const rLabel    = useReveal(0);
  const rHeading  = useReveal(100);
  const rBody     = useReveal(200);
  const rQuote    = useReveal(300);

  return (
    <section className="w-full bg-white border-b border-slate-100 pt-14 pb-10 px-6">
      <div className="max-w-7xl mx-auto">

        <div ref={rLabel} style={transitionStyle}>
          <p className="text-fuchsia-600 text-xs font-bold uppercase tracking-widest mb-3">
            Global Flame Book Store
          </p>
        </div>

        <div ref={rHeading} style={transitionStyle}>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4 max-w-2xl">
            Transform Your Mind,{' '}
            <span className="text-fuchsia-600">Transform Your Life</span>
          </h1>
        </div>

        <div ref={rBody} style={transitionStyle}>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-2xl mb-5 text-justify">
            Every book in this collection was handpicked to help you renew your
            thinking, walk purposefully in your calling, and grow into the person
            God has destined you to be. Whether you are just beginning or going
            deeper — there is something here for every season of life.
          </p>
        </div>

        <div ref={rQuote} style={transitionStyle}>
          <p className="text-slate-400 italic text-sm border-l-2 border-fuchsia-300 pl-4">
            "Do not conform to the pattern of this world, but be transformed by the
            renewing of your mind." —{' '}
            <span className="text-fuchsia-500 font-semibold not-italic">Romans 12:2</span>
          </p>
        </div>

      </div>
    </section>
  );
};

/* ── BuyModal ──────────────────────────────────────────────────────── */
const BuyModal: React.FC<{ book: BookDto; onClose: () => void }> = ({ book, onClose }) => {
  const hasAmazon = !!book.amazonUrl;
  const hasSelar  = !!book.selarUrl;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-slate-100 transition">
          <X size={18} className="text-slate-500" />
        </button>
        <div className="flex gap-4 mb-6">
          {book.coverImageUrl ? (
            <img src={book.coverImageUrl} alt={book.title} loading="lazy" className="w-16 h-24 object-cover rounded-xl shadow-md shrink-0" />
          ) : (
            <div className="w-16 h-24 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <Library size={24} className="text-slate-300" />
            </div>
          )}
          <div className="flex flex-col justify-center">
            <h3 className="font-black text-lg leading-tight">{book.title}</h3>
            <p className="text-sm text-slate-400 mt-1">By {book.author}</p>
            {book.price && (
              <p className="text-fuchsia-600 font-bold mt-2">
                {book.currency} {book.price.toLocaleString()}
              </p>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-4 font-medium text-center">
          Where would you like to purchase this book?
        </p>
        <div className="flex flex-col gap-3">
          {hasAmazon && (
            <a href={book.amazonUrl!} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-5 py-4 bg-[#FF9900] hover:bg-[#e68a00] text-white rounded-2xl font-bold transition group">
              <span className="flex items-center gap-3">
                <span className="text-xl">📦</span>Buy on Amazon
              </span>
              <ExternalLink size={16} className="opacity-70 group-hover:opacity-100 transition" />
            </a>
          )}
          {hasSelar && (
            <a href={book.selarUrl!} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-5 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-2xl font-bold transition group">
              <span className="flex items-center gap-3">
                <span className="text-xl">🛒</span>Buy on Selar
              </span>
              <ExternalLink size={16} className="opacity-70 group-hover:opacity-100 transition" />
            </a>
          )}
          {!hasAmazon && !hasSelar && (
            <div className="text-center py-4 text-slate-400 text-sm">
              No purchase links available yet. Check back soon.
            </div>
          )}
        </div>
        <button onClick={onClose}
          className="mt-4 w-full py-3 text-sm text-slate-400 hover:text-slate-600 transition font-medium">
          Maybe later
        </button>
      </div>
    </div>
  );
};

/* ── BookCard ──────────────────────────────────────────────────────── */
const BookCard: React.FC<{ book: BookDto; onSelect: (book: BookDto) => void }> = ({ book, onSelect }) => {
  const displayPrice = book.price
    ? `${book.currency} ${book.price.toLocaleString()}`
    : 'Free';

  return (
    <div className="animate-fadeUp">
      <div className="group block cursor-pointer" onClick={() => onSelect(book)}>
        <div className="perspective-[1000px]">
          <div className="transition-all duration-500 hover:scale-[1.02] cursor-pointer">
            {book.coverImageUrl ? (
              <img
                src={book.coverImageUrl}
                alt={book.title}
                loading="lazy"
                className="w-full aspect-[2/3] object-cover rounded shadow-2xl"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-slate-200 rounded flex items-center justify-center shadow-2xl">
                <Library className="w-12 h-12 text-slate-400" />
              </div>
            )}
            {book.isFeatured && (
              <div className="absolute top-3 left-3 bg-fuchsia-600 text-white text-[9px] font-bold uppercase px-2 py-1 rounded-full">
                Featured
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 text-center">
          <h4 className="text-sm font-semibold text-slate-900 mb-1 line-clamp-2">{book.title}</h4>
          <p className="text-xs uppercase tracking-widest text-fuchsia-600 mb-1">{book.author}</p>
          <span className="text-xs font-black text-slate-900">{displayPrice}</span>
        </div>
      </div>
    </div>
  );
};

/* ── Main Bookstore Page ───────────────────────────────────────────── */
const Bookstore: React.FC = () => {
  const navigate = useNavigate();
  const { data: booksData, isLoading, error } = useQuery({
    queryKey: ['publishedBooks'],
    queryFn: () => bookApi.getPublished({ pageSize: 50, pageNumber: 1 }).then(res => {
      if (!res.data.isSuccess) throw new Error('Could not load books right now.');
      return res.data.data?.items ?? [];
    }),
  });
  const books = booksData ?? [];
  const [selectedBook, setSelectedBook] = useState<BookDto | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const increment = 10;

  const displayedBooks = books.slice(0, visibleCount);
  const hasMore = visibleCount < books.length;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <SEO
        title="Books & Resources"
        description="Kingdom literature and recommended books from Global Flame Book Store."
        url="https://globalflameministry.org/books"
      />

      <BooksIntro />

      <div className="max-w-[1280px] mx-auto px-6 mb-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-xs hover:border-fuchsia-300 hover:text-fuchsia-600 transition-all duration-200 rounded-lg cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-center py-24">
          <Loader size={32} className="animate-spin text-fuchsia-600" />
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="max-w-[1280px] mx-auto px-6 mt-8">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            ⚠️ {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </div>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && books.length === 0 && (
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col items-center justify-center py-24 text-center">
          <Library size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg font-medium">No books available yet.</p>
          <p className="text-slate-400 text-sm mt-1">Check back soon.</p>
        </div>
      )}

      {/* Book grid */}
      {!isLoading && !error && books.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-[1280px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
              {displayedBooks.map((book, idx) => (
                <div
                  key={book.id}
                  className="animate-fadeUp"
                  style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
                >
                  <BookCard book={book} onSelect={setSelectedBook} />
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex flex-col items-center mt-14 gap-3">
                <button
                  onClick={() => setVisibleCount(prev => prev + increment)}
                  className="px-10 py-3.5 border-2 border-fuchsia-600 text-fuchsia-600 font-bold uppercase tracking-widest text-xs rounded-full hover:bg-fuchsia-600 hover:text-white transition-all"
                >
                  Load More Books
                </button>
                <p className="text-xs text-slate-400">
                  Showing {displayedBooks.length} of {books.length} books
                </p>
              </div>
            )}

            {!hasMore && books.length > increment && (
              <p className="text-xs text-slate-400 text-center mt-14">
                All {books.length} books loaded
              </p>
            )}
          </div>
        </section>
      )}

      {selectedBook && (
        <BuyModal book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
};

export default Bookstore;