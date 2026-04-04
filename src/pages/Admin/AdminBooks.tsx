import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, RefreshCw, Search, Pencil,
  X, Library, Filter, Eye, EyeOff, Star
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import type { BookDto, CreateBookDto, UpdateBookDto } from '../../types';
import toast from 'react-hot-toast';
import { useAdminTheme } from '../../context/AdminThemeContext';
import ImageUpload from '../../components/ImageUpload';

const emptyForm = (): CreateBookDto => ({
  title: '', author: '', description: '', coverImageUrl: '',
  amazonUrl: '', selarUrl: '', price: undefined,
  currency: 'NGN', isFeatured: false, isPublished: false,
});

const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR'];

const AdminBooks = () => {
  const { isDark } = useAdminTheme();

  const t = {
    bg:         isDark ? 'bg-[#0d0d0d] text-white'     : 'bg-slate-50 text-slate-900',
    border:     isDark ? 'border-white/5'               : 'border-slate-200',
    subtext:    isDark ? 'text-zinc-400'                : 'text-slate-500',
    mutedtext:  isDark ? 'text-zinc-600'                : 'text-slate-400',
    input:      isDark
      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-fuchsia-500'
      : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-fuchsia-500',
    row:        isDark ? 'bg-white/3 hover:bg-white/5 border-white/5' : 'bg-white hover:bg-slate-50 border-slate-200',
    btnGhost:   isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200',
    modal:      isDark ? 'bg-[#161616] border-white/10 text-white' : 'bg-white border-slate-200 shadow-xl text-slate-900',
    modalInput: isDark
      ? 'bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-fuchsia-500'
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-500',
    label:      isDark ? 'text-zinc-400' : 'text-slate-600',
    toggle:     isDark ? 'bg-white/10'  : 'bg-slate-200',
    skeleton:   isDark ? 'bg-white/3'   : 'bg-slate-200',
  };

  const [books, setBooks]                     = useState<BookDto[]>([]);
  const [totalCount, setTotalCount]           = useState(0);
  const [isLoading, setIsLoading]             = useState(true);
  const [search, setSearch]                   = useState('');
  const [filterPublished, setFilterPublished] = useState('');
  const [filterFeatured, setFilterFeatured]   = useState('');
  const [pageNumber, setPageNumber]           = useState(1);
  const pageSize = 10;
  const [showForm, setShowForm]               = useState(false);
  const [editing, setEditing]                 = useState<BookDto | null>(null);
  const [form, setForm]                       = useState<CreateBookDto>(emptyForm());
  const [isSaving, setIsSaving]               = useState(false);
  const [deleteTarget, setDeleteTarget]       = useState<BookDto | null>(null);
  const [isDeleting, setIsDeleting]           = useState(false);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getBooks({
        title:       search || undefined,
        isPublished: filterPublished === '' ? undefined : filterPublished === 'true',
        isFeatured:  filterFeatured  === '' ? undefined : filterFeatured  === 'true',
        pageNumber, pageSize,
      });
      if (res.data.isSuccess && res.data.data) {
        setBooks(res.data.data.items);
        setTotalCount(res.data.data.totalCount);
      }
    } catch { toast.error('Failed to load books'); }
    finally { setIsLoading(false); }
  }, [search, filterPublished, filterFeatured, pageNumber]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);
  useEffect(() => { setPageNumber(1); }, [search, filterPublished, filterFeatured]);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowForm(true); };
  const openEdit = (b: BookDto) => {
    setEditing(b);
    setForm({
      title: b.title, author: b.author, description: b.description ?? '',
      coverImageUrl: b.coverImageUrl ?? '', amazonUrl: b.amazonUrl ?? '',
      selarUrl: b.selarUrl ?? '', price: b.price ?? undefined,
      currency: b.currency, isFeatured: b.isFeatured, isPublished: b.isPublished,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim())  { toast.error('Title is required');  return; }
    if (!form.author.trim()) { toast.error('Author is required'); return; }
    setIsSaving(true);
    try {
      if (editing) {
        const res = await adminApi.updateBook(editing.id, { ...form } as UpdateBookDto);
        if (res.data.isSuccess) { toast.success('Book updated'); setShowForm(false); fetchBooks(); }
      } else {
        const res = await adminApi.createBook(form);
        if (res.data.isSuccess) { toast.success('Book created'); setShowForm(false); fetchBooks(); }
      }
    } catch { toast.error('Failed to save book'); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await adminApi.deleteBook(deleteTarget.id);
      setBooks(prev => prev.filter(b => b.id !== deleteTarget.id));
      setTotalCount(n => n - 1);
      setDeleteTarget(null);
      toast.success('Book deleted');
    } catch { toast.error('Failed to delete book'); }
    finally { setIsDeleting(false); }
  };

  const togglePublish = async (book: BookDto) => {
    try {
      const res = await adminApi.updateBook(book.id, {
        title: book.title, author: book.author, description: book.description ?? '',
        coverImageUrl: book.coverImageUrl ?? '', amazonUrl: book.amazonUrl ?? '',
        selarUrl: book.selarUrl ?? '', price: book.price ?? undefined,
        currency: book.currency, isFeatured: book.isFeatured, isPublished: !book.isPublished,
      } as UpdateBookDto);
      if (res.data.isSuccess) {
        setBooks(prev => prev.map(b => b.id === book.id ? { ...b, isPublished: !b.isPublished } : b));
        toast.success(book.isPublished ? 'Book unpublished' : 'Book published');
      }
    } catch { toast.error('Failed to update book'); }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatPrice = (price: number | null, currency: string) =>
    price ? `${currency} ${price.toLocaleString()}` : 'Free';

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className={`min-h-screen font-sans ${t.bg}`}>

      <div className={`px-8 pt-8 pb-6 border-b ${t.border} flex items-center justify-between`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-500 mb-1">Admin</p>
          <h1 className="text-2xl font-bold">Books</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm ${t.subtext}`}>{totalCount} total</span>
          <button onClick={fetchBooks} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
            <RefreshCw className={`w-4 h-4 ${t.subtext}`} />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors text-white">
            <Plus className="w-4 h-4" /> New Book
          </button>
        </div>
      </div>

      <div className={`px-8 py-4 border-b ${t.border} flex flex-wrap gap-3`}>
        <div className="relative flex-1 min-w-48">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext}`} />
          <input type="text" placeholder="Search by title or author..." value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-all ${t.input}`} />
        </div>
        <div className="relative">
          <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.subtext} pointer-events-none`} />
          <select value={filterPublished} onChange={e => setFilterPublished(e.target.value)}
            className={`pl-9 pr-8 py-2.5 border rounded-lg text-sm outline-none appearance-none cursor-pointer ${t.input}`}>
            <option value="">All Books</option>
            <option value="true">Published</option>
            <option value="false">Drafts</option>
          </select>
        </div>
        <select value={filterFeatured} onChange={e => setFilterFeatured(e.target.value)}
          className={`px-4 py-2.5 border rounded-lg text-sm outline-none appearance-none cursor-pointer ${t.input}`}>
          <option value="">All</option>
          <option value="true">Featured</option>
          <option value="false">Not Featured</option>
        </select>
      </div>

      <div className="px-8 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className={`animate-pulse h-24 rounded-xl ${t.skeleton}`} />)}
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Library className={`w-10 h-10 mb-4 ${t.mutedtext}`} />
            <p className={t.subtext}>No books found</p>
            <button onClick={openCreate} className="mt-4 text-fuchsia-600 text-sm font-bold uppercase tracking-widest">
              Add your first book
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {books.map(book => (
              <div key={book.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${t.row}`}>
                <div className="w-14 h-20 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                  {book.coverImageUrl ? (
                    <img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Library className={`w-5 h-5 ${t.mutedtext}`} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold text-sm truncate">{book.title}</p>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      book.isPublished ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'
                    }`}>
                      {book.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {book.isFeatured && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-600 flex items-center gap-1">
                        <Star className="w-2.5 h-2.5" /> Featured
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-4 text-xs ${t.subtext} flex-wrap`}>
                    <span>By {book.author}</span>
                    <span className={t.mutedtext}>·</span>
                    <span className="font-semibold">{formatPrice(book.price, book.currency)}</span>
                    <span className={t.mutedtext}>·</span>
                    <span>{formatDate(book.createdOn)}</span>
                  </div>
                  {book.description && (
                    <p className={`text-xs mt-1 truncate max-w-md ${t.mutedtext}`}>{book.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => togglePublish(book)} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
                    {book.isPublished ? <EyeOff className={`w-4 h-4 ${t.subtext}`} /> : <Eye className={`w-4 h-4 ${t.subtext}`} />}
                  </button>
                  <button onClick={() => openEdit(book)} className={`p-2 rounded-lg transition-colors ${t.btnGhost}`}>
                    <Pencil className={`w-4 h-4 ${t.subtext}`} />
                  </button>
                  <button onClick={() => setDeleteTarget(book)} className={`p-2 rounded-lg transition-colors ${t.btnGhost} hover:bg-red-500/20`}>
                    <Trash2 className={`w-4 h-4 ${t.subtext}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className={`text-xs ${t.mutedtext}`}>Page {pageNumber} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber === 1}
                className={`px-3 py-1.5 rounded disabled:opacity-30 text-xs transition-colors ${t.btnGhost}`}>Prev</button>
              <button onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))} disabled={pageNumber === totalPages}
                className={`px-3 py-1.5 rounded disabled:opacity-30 text-xs transition-colors ${t.btnGhost}`}>Next</button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className={`relative rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto border ${t.modal}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${t.border} sticky top-0 z-10`}
              style={{ background: isDark ? '#161616' : 'white' }}>
              <h3 className="font-bold text-lg">{editing ? 'Edit Book' : 'New Book'}</h3>
              <button onClick={() => setShowForm(false)} className={`p-1.5 rounded-lg transition-colors ${t.btnGhost}`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Title *</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. The Purpose Driven Life"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`} />
              </div>
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Author *</label>
                <input type="text" value={form.author} onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                  placeholder="e.g. Rick Warren"
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Price</label>
                  <input type="number" value={form.price ?? ''} min={0}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="0.00"
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`} />
                </div>
                <div>
                  <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Currency</label>
                  <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}
                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none appearance-none ${t.modalInput}`}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of the book..."
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none resize-none ${t.modalInput}`} />
              </div>

              <ImageUpload value={form.coverImageUrl || ''} onChange={url => setForm(p => ({ ...p, coverImageUrl: url ?? undefined }))} label="Cover Image" />

              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Amazon URL</label>
                <input type="url" value={form.amazonUrl} onChange={e => setForm(p => ({ ...p, amazonUrl: e.target.value }))}
                  placeholder="https://amazon.com/dp/..."
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`} />
              </div>
              <div>
                <label className={`text-xs font-bold uppercase tracking-widest mb-1.5 block ${t.label}`}>Selar URL</label>
                <input type="url" value={form.selarUrl} onChange={e => setForm(p => ({ ...p, selarUrl: e.target.value }))}
                  placeholder="https://selar.co/..."
                  className={`w-full px-4 py-3 border rounded-xl text-sm outline-none ${t.modalInput}`} />
              </div>

              <div className="flex items-center gap-3 cursor-pointer"
                onClick={() => setForm(p => ({ ...p, isFeatured: !p.isFeatured }))}>
                <div className={`w-11 h-6 rounded-full transition-colors ${form.isFeatured ? 'bg-fuchsia-600' : t.toggle}`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${form.isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className={`text-sm flex items-center gap-2 ${t.subtext}`}>
                  <Star className="w-4 h-4 text-fuchsia-500" /> Featured book
                </span>
              </div>

              <div className="flex items-center gap-3 cursor-pointer"
                onClick={() => setForm(p => ({ ...p, isPublished: !p.isPublished }))}>
                <div className={`w-11 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-fuchsia-600' : t.toggle}`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${form.isPublished ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className={`text-sm ${t.subtext}`}>
                  {form.isPublished ? 'Published — visible on website' : 'Draft — hidden from website'}
                </span>
              </div>
            </div>

            <div className={`px-6 py-4 border-t ${t.border} flex gap-3 justify-end sticky bottom-0 z-10`}
              style={{ background: isDark ? '#161616' : 'white' }}>
              <button onClick={() => setShowForm(false)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${t.btnGhost}`}>Cancel</button>
              <button onClick={handleSave} disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-sm font-bold text-white flex items-center gap-2">
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {editing ? 'Update Book' : 'Create Book'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className={`relative rounded-2xl p-8 w-full max-w-sm text-center border ${t.modal}`}>
            <Trash2 className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Delete book?</h3>
            <p className={`text-sm mb-6 ${t.subtext}`}>"{deleteTarget.title}" will be permanently deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className={`flex-1 py-2.5 rounded-lg text-sm transition-colors ${t.btnGhost}`}>Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-sm font-bold text-white flex items-center justify-center gap-2">
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBooks;