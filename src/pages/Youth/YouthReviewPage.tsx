import { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  Quote, Star, Users, MessageSquare, CheckCircle,
  X, ThumbsUp, Zap,
} from 'lucide-react';
import { testimonyApi } from '../../api/testimonyApi';
import type { TestimonyDto } from '../../types';

// ── STAR DISPLAY ──────────────────────────────────────────────────────────────
const Rating: FC<{ count: number }> = ({ count }) => (
  <div className="flex space-x-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-5 h-5 ${
        i < count ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
      }`} />
    ))}
  </div>
);

// ── STAR INPUT ────────────────────────────────────────────────────────────────
const StarRatingInput: FC<{ value: number; onChange: (n: number) => void }> = ({
  value, onChange,
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex space-x-1 cursor-pointer">
      {[1,2,3,4,5].map(n => (
        <Star key={n} className="w-7 h-7 transition-colors"
          style={{
            color:  n <= (hover || value) ? '#f59e0b' : '#d1d5db',
            fill:   n <= (hover || value) ? '#f59e0b' : 'none',
          }}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)} />
      ))}
    </div>
  );
};

// ── SUBMIT MODAL ──────────────────────────────────────────────────────────────
// FIX 1: Removed the misplaced useEffect that referenced setTestimonies
//         from the parent scope. The modal only submits — it does not fetch.
const ReviewModal: FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen, onClose,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [rating, setRating]       = useState(5);
  const [name, setName]           = useState('');
  const [content, setContent]     = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError]         = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().split(' ').length < 10) {
      setError('Please write at least 10 words.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await testimonyApi.create({
        name: name.trim() || 'Anonymous',
        content: content.trim(),
      });
      setSubmitted(true);
      setTimeout(onClose, 2000);
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-gray-900/80 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl
                      lg:max-w-3xl overflow-hidden relative"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} disabled={submitted}
          className="absolute top-4 right-4 z-10 p-2 text-gray-500
                     hover:text-gray-900 rounded-full hover:bg-gray-100
                     disabled:opacity-50">
          <X className="w-6 h-6" />
        </button>

        {submitted ? (
          <div className="p-12 text-center bg-gradient-to-br
                          from-emerald-500 to-teal-600 text-white rounded-b-2xl">
            <ThumbsUp className="w-20 h-20 text-white mx-auto mb-4 animate-bounce" />
            <h3 className="text-4xl font-extrabold mb-2">Success!</h3>
            <p className="text-lg font-light">
              Thank you for your testimony!
            </p>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-2">
            <div className="hidden lg:flex flex-col justify-center items-center
                            p-10 bg-gradient-to-tr from-fuchsia-700
                            to-purple-800 text-white">
              <Quote className="w-16 h-16 text-fuchsia-300 mb-6" />
              <h4 className="text-3xl font-bold mb-3">Your Story Matters</h4>
              <p className="text-sm text-fuchsia-200 text-center font-light">
                Every word fuels our mission to empower youth globally.
              </p>
            </div>
            <div className="p-8 md:p-10">
              <h3 className="text-3xl font-extrabold text-purple-900 mb-1">
                Share Your Impact
              </h3>
              <p className="text-gray-500 mb-6 text-sm">
                An honest review of your GFM experience.
              </p>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-semibold
                                    text-gray-700 mb-2">
                    1. Rate Your Experience
                  </label>
                  <div className="p-3 bg-fuchsia-50 rounded-lg border
                                  border-fuchsia-100 inline-block">
                    <StarRatingInput value={rating} onChange={setRating} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold
                                    text-gray-700 mb-2">
                    2. Your Name (Optional)
                  </label>
                  <input type="text" value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="E.g., A dedicated member"
                    className="w-full border border-gray-300 p-3 rounded-xl
                               focus:border-fuchsia-500 focus:ring-2
                               focus:ring-fuchsia-200" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="w-full border border-gray-300 p-3 rounded-xl focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value)}
                    placeholder="Your phone number"
                    className="w-full border border-gray-300 p-3 rounded-xl focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold
                                    text-gray-700 mb-2">
                    3. Your Testimony
                  </label>
                  <textarea rows={6} value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Write your testimony here..."
                    required
                    className="w-full border border-gray-300 p-3 rounded-xl
                               resize-none focus:border-fuchsia-500
                               focus:ring-2 focus:ring-fuchsia-200" />
                </div>
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-purple-700 text-white
                             font-extrabold rounded-xl shadow-lg
                             hover:bg-purple-800 transition-colors uppercase
                             tracking-widest disabled:opacity-60">
                  {loading ? 'Submitting...' : 'Submit & Ignite the Flame'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── SKELETON ──────────────────────────────────────────────────────────────────
const TestimonySkeleton = () => (
  <div className="p-8 bg-white rounded-xl shadow-md border-t-4
                  border-gray-200 animate-pulse">
    <div className="w-6 h-6 bg-gray-200 rounded mb-4" />
    <div className="space-y-2 mb-6">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
      <div className="h-4 bg-gray-200 rounded w-4/6" />
    </div>
    <div className="h-4 bg-gray-200 rounded w-1/3 mt-3" />
  </div>
);

// ── IMPACT NUMBERS — hardcoded (marketing copy) ───────────────────────────────
const IMPACT_NUMBERS = [
  { icon: Users,        number: '5,000+', label: 'Youth Empowered Globally',   color: 'text-fuchsia-700' },
  { icon: CheckCircle,  number: '10+',    label: 'Programs & Workshops',        color: 'text-purple-700' },
  { icon: Zap,          number: '4.9/5',  label: 'Average Satisfaction Rating', color: 'text-amber-500' },
];

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const YouthReviewPage: FC = () => {
  const [testimonies, setTestimonies] = useState<TestimonyDto[]>([]);
  const [loading, setLoading]         = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await testimonyApi.getApproved({ pageSize: 6 });
        // FIX 3: ApiResponse<T> wraps payload in .data, not .result
        setTestimonies(res.data.data?.items ?? []);
      } catch {
        // Fail silently — page still renders without testimonies
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

      {/* Hero */}
      <section className="bg-gradient-to-br from-fuchsia-900 to-purple-800
                          text-white py-24 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4
                         leading-tight tracking-tight">
            <span className="block text-fuchsia-300 text-lg uppercase
                             tracking-[0.25em] mb-4 font-semibold">
              HE IS KING, PRAISE THE LORD
            </span>
            THE VOICES OF OUR TESTIFIERS
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-80
                         max-w-3xl mx-auto mt-4">
            We give glory to God for the undeniable transformation in
            the lives of the youths we serve.
          </p>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="py-16 px-6 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-1 md:grid-cols-3
                        gap-8 text-center">
          {IMPACT_NUMBERS.map((item, i) => (
            <div key={i} className="p-6 border border-gray-200 rounded-xl
                                    shadow-sm hover:shadow-lg transition-shadow">
              <item.icon className={`w-8 h-8 mx-auto mb-3 ${item.color}`} />
              <p className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-1">
                {item.number}
              </p>
              <p className="text-base font-medium text-gray-600 uppercase tracking-wider">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonies — DYNAMIC */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold
                           text-gray-900 mb-4">
              Life-Changing Testimonies
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Genuine stories of passion, supportive faith, and tangible
              growth within the Global Flame Youth Community.
            </p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => <TestimonySkeleton key={i} />)}
            </div>
          ) : testimonies.length === 0 ? (
            <div className="text-center py-16">
              <Quote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No testimonies yet. Be the first to share yours!
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-8">
              {testimonies.map((t, i) => (
                <div key={i} className="p-8 bg-white rounded-xl shadow-md
                                        border-t-4 border-fuchsia-600 flex
                                        flex-col justify-between
                                        hover:shadow-xl transition-shadow h-full">
                  <div>
                    <Quote className="w-6 h-6 text-fuchsia-500 mb-4 rotate-180" />
                    <p className="text-lg italic text-gray-700 mb-6 leading-relaxed">
                      "{t.content}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <Rating count={5} />
                    {/* FIX 4: TestimonyDto uses 'name', not 'fullName' */}
                    <p className="text-lg font-bold text-gray-900 mt-3">
                      {t.name || 'Anonymous'}
                    </p>
                    <p className="text-sm text-fuchsia-700 font-medium">
                      GFM Youth Member
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Submit CTA */}
      <section className="bg-purple-800 text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-purple-300" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Make Your Voice Heard
          </h2>
          <p className="text-xl opacity-90 mb-8 font-light">
            Did GFM Youth Community impact you? Share your testimony.
          </p>
          <button onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center px-8 py-3
                       bg-fuchsia-500 text-white rounded-full font-bold
                       text-lg hover:bg-fuchsia-600 transition-colors
                       shadow-xl uppercase tracking-wider
                       transform hover:scale-[1.02]">
            <Zap className="w-5 h-5 mr-2" />
            Share Your Testimony
          </button>
        </div>
      </section>

      <ReviewModal isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default YouthReviewPage;