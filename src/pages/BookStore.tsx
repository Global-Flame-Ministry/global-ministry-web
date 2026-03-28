import React, { useState, useEffect } from "react";
import {
  Library, Loader, X, ShoppingBag, ExternalLink
} from "lucide-react";
import { bookApi } from "../api/bookApi";
import type { BookDto } from "../types";

/* ================= BOOKS INTRO ================= */

const BooksIntro: React.FC = () => {
  return (
    <section className="w-full bg-white border-b border-slate-100 pt-10 pb-8 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Eyebrow */}
        <p className="text-fuchsia-600 text-xs font-bold uppercase tracking-widest mb-3">
          Global Flame Ministry
        </p>

        {/* Headline */}
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4 max-w-2xl">
          Transform Your Mind,{' '}
          <span className="text-fuchsia-600">Transform Your Life</span>
        </h1>

        {/* Body */}
        <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-2xl mb-5">
          Every book in this collection was handpicked to help you renew your
          thinking, walk purposefully in your calling, and grow into the person
          God has destined you to be. Whether you are just beginning or going
          deeper — there is something here for every season of life.
        </p>

        {/* Scripture */}
        <p className="text-slate-400 italic text-sm border-l-2 border-fuchsia-300 pl-4">
          "Do not conform to the pattern of this world, but be transformed by the
          renewing of your mind." —{' '}
          <span className="text-fuchsia-500 font-semibold not-italic">Romans 12:2</span>
        </p>

      </div>
    </section>
  );
};

/* ================= BUY MODAL ================= */

const BuyModal: React.FC<{
  book: BookDto;
  onClose: () => void;
}> = ({ book, onClose }) => {

  const hasAmazon = !!book.amazonUrl;
  const hasSelar  = !!book.selarUrl;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-slate-100 transition"
        >
          <X size={18} className="text-slate-500" />
        </button>

        <div className="flex gap-4 mb-6">
          {book.coverImageUrl ? (
            <img
              src={book.coverImageUrl}
              alt={book.title}
              className="w-16 h-24 object-cover rounded-xl shadow-md shrink-0"
            />
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
            
              <a href={book.amazonUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-5 py-4 bg-[#FF9900] hover:bg-[#e68a00] text-white rounded-2xl font-bold transition group">
              <span className="flex items-center gap-3">
                <span className="text-xl">📦</span>
                Buy on Amazon
              </span>
              <ExternalLink size={16} className="opacity-70 group-hover:opacity-100 transition" />
            </a>
          )}

          {hasSelar && (
            
              <a href={book.selarUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-5 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-2xl font-bold transition group">
              <span className="flex items-center gap-3">
                <span className="text-xl">🛒</span>
                Buy on Selar
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

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 text-sm text-slate-400 hover:text-slate-600 transition font-medium"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
};

/* ================= BOOK CARD — compact shelf style ================= */

const BookCard: React.FC<{
  book: BookDto;
  onSelect: (book: BookDto) => void;
}> = ({ book, onSelect }) => {

  const displayPrice = book.price
    ? `${book.currency} ${book.price.toLocaleString()}`
    : 'Free';

  return (
    <div className="flex flex-col w-36 shrink-0">

      {/* Cover */}
      <div
        className="relative w-36 h-52 rounded-lg overflow-hidden bg-slate-100 mb-2 cursor-pointer group shadow-sm hover:shadow-md transition-shadow duration-300"
        onClick={() => onSelect(book)}
      >
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Library size={32} className="text-slate-300" />
          </div>
        )}

        {/* Featured badge */}
        {book.isFeatured && (
          <div className="absolute top-2 left-2 bg-fuchsia-600 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">
            Featured
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
          <div className="bg-white rounded-full p-2">
            <ShoppingBag size={16} className="text-fuchsia-600" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1">
        <h3
          className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 mb-0.5 cursor-pointer hover:text-fuchsia-600 transition-colors"
          onClick={() => onSelect(book)}
        >
          {book.title}
        </h3>
        <p className="text-[11px] text-slate-400 mb-2 line-clamp-1">
          {book.author}
        </p>

        {/* Platform badges */}
        {(book.amazonUrl || book.selarUrl) && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {book.amazonUrl && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                Amazon
              </span>
            )}
            {book.selarUrl && (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-fuchsia-100 text-fuchsia-700 rounded-full">
                Selar
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-1">
          <span className="text-xs font-black text-slate-900">{displayPrice}</span>
          <button
            onClick={() => onSelect(book)}
            className="text-[10px] font-bold px-2 py-1 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg transition shrink-0"
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN PAGE ================= */

const Bookstore: React.FC = () => {

  const [books, setBooks]               = useState<BookDto[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookDto | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await bookApi.getPublished({ pageSize: 50, pageNumber: 1 });
        if (res.data.isSuccess && res.data.data) {
          setBooks(res.data.data.items);
        } else {
          setError('Could not load books right now.');
        }
      } catch {
        setError('Could not reach the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">

      {/* ── SPIRITUAL INTRO ───────────────────────────────────────────── */}
      <BooksIntro />

      {/* LOADING */}
      {isLoading && (
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center py-24">
          <Loader size={32} className="animate-spin text-fuchsia-600" />
        </div>
      )}

      {/* ERROR */}
      {error && !isLoading && (
        <div className="max-w-7xl mx-auto px-6 mt-8">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* EMPTY */}
      {!isLoading && !error && books.length === 0 && (
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center py-24 text-center">
          <Library size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg font-medium">No books available yet.</p>
          <p className="text-slate-400 text-sm mt-1">Check back soon.</p>
        </div>
      )}

      {/* ── BOOK SHELF ───────────────────────────────────────────────── */}
      {!isLoading && !error && books.length > 0 && (
        <div className="mt-10">

          {/* Section label */}
          <div className="max-w-7xl mx-auto px-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[11px] whitespace-nowrap">
                Recommended Reads for Transformation
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          </div>

          {/* Horizontal scrollable shelf */}
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {books.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onSelect={setSelectedBook}
                />
              ))}
            </div>
          </div>

        </div>
      )}

      {/* BUY MODAL */}
      {selectedBook && (
        <BuyModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
};

export default Bookstore;