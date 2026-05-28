import React, { useState, useEffect, useRef } from 'react';
import SEO from '../components/SEO';
import { Link, useNavigate } from 'react-router-dom';
import { announcementApi } from '../api/announcementApi';
import { Calendar, Play, ArrowRight, Globe, Heart, HandHeart, Star, Library, ShieldCheck, Flame, HeartHandshake, Phone, Mail, MapPin, ChevronDown } from 'lucide-react';
import { sermonApi } from '../api/sermonApi';
import { eventApi } from '../api/eventApi';
import { bookApi } from '../api/bookApi';
import { blogApi } from '../api/blogApi';
import { ministryApi } from '../api/ministryApi';
import type { SermonDto, EventDto, AnnouncementDto, BookDto, BlogPostResponseDto, MinistryResponseDto } from '../types';
import dddPreaching from '../assets/ddd-preaching.jpeg';
import daddandmumm from '../assets/dadandmum.jpg';
import auditorium from '../assets/auditorium.jpg';
import { useScrollAnimation } from '../context/hooks/useScrollAnimation';
import { useAuth } from '../context/useAuthContext';
import TestimonyModal from '../components/TestimonyModal';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const getTransformClass = (direction: string) => {
  if (direction === 'left')  return 'translate-x-12';
  if (direction === 'right') return '-translate-x-12';
  if (direction === 'fade')  return '';
  return 'translate-y-10';
};

interface AnimatedProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'fade';
}

// ─── ANIMATED SECTION ────────────────────────────────────────────────────────

const AnimatedSection: React.FC<AnimatedProps> = ({
  children, className = '', delay = 0, direction = 'up'
}) => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`transition-all duration-700 ease-out
        ${isVisible
          ? 'opacity-100 translate-y-0 translate-x-0'
          : `opacity-0 ${getTransformClass(direction)}`}
        ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
};

// ─── ANIMATED DIV ────────────────────────────────────────────────────────────

const AnimatedDiv: React.FC<AnimatedProps> = ({
  children, className = '', delay = 0, direction = 'up'
}) => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-700 ease-out
        ${isVisible
          ? 'opacity-100 translate-y-0 translate-x-0'
          : `opacity-0 ${getTransformClass(direction)}`}
        ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─── PARTICLE CANVAS ────────────────────────────────────────────────────────

const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: { x: number; y: number; vx: number; vy: number; size: number }[] = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(217, 70, 239, 0.3)';
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />;
};

// ─── CORE BELIEFS TEASER DATA ─────────────────────────────────────────────────

const featuredBeliefs = [
  {
    title: 'The Holy Scripture',
    body: 'We believe the Bible is the inspired, infallible, and authoritative Word of God — the supreme standard by which all human conduct, creeds, and opinions shall be tried.',
  },
  {
    title: 'The Trinity',
    body: 'We believe in one God, eternally existent in three persons — Father, Son, and Holy Spirit. Each person is fully God, yet there is one God.',
  },
  {
    title: 'The Person of Jesus Christ',
    body: 'We believe in the deity of our Lord Jesus Christ — His virgin birth, sinless life, miracles, atoning death, bodily resurrection, and His personal return to power and glory.',
  },
  {
    title: 'Salvation by Grace',
    body: 'We believe that for the salvation of lost and sinful people, regeneration by the Holy Spirit is absolutely essential. Salvation by grace alone, through faith alone, in Christ alone.',
  },
];

// ─── INDIVIDUAL BELIEF CARD ───────────────────────────────────────────────────

interface BeliefCardProps {
  title: string;
  body: string;
  delay: number;
  direction: 'up' | 'left' | 'right';
}

const BeliefCard: React.FC<BeliefCardProps> = ({ title, body, delay, direction }) => {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  const getSlide = () => {
    if (direction === 'left')  return isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0';
    if (direction === 'right') return isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0';
    return isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0';
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-700 ease-out ${getSlide()}
        p-6 border border-slate-100 rounded-2xl hover:border-fuchsia-200
        hover:shadow-md bg-white group`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 bg-fuchsia-50 rounded-xl flex items-center justify-center
          shrink-0 mt-0.5 group-hover:bg-fuchsia-100 transition-colors">
          <ShieldCheck className="w-4 h-4 text-fuchsia-500" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-2">
            {title}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
};

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ── Data state ───────────────────────────────────────────────────────────
  const [latestSermons, setLatestSermons]             = useState<SermonDto[]>([]);
  const [upcomingEvents, setUpcomingEvents]           = useState<EventDto[]>([]);
  const [latestAnnouncements, setLatestAnnouncements] = useState<AnnouncementDto[]>([]);
  const [featuredBooks, setFeaturedBooks]             = useState<BookDto[]>([]);
  const [latestBlogPosts, setLatestBlogPosts]         = useState<BlogPostResponseDto[]>([]);
  const [ministries, setMinistries]                   = useState<MinistryResponseDto[]>([]);
  const [showTestimonyModal, setShowTestimonyModal]   = useState(false);

  // ── Sign-up bar state ─────────────────────────────────────────────────────
  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName]   = useState('');
  const [signUpEmail, setSignUpEmail]         = useState('');

  // ── Visit modal state ─────────────────────────────────────────────────────
  const [showVisitModal, setShowVisitModal]   = useState(false);
  const [locationType, setLocationType]       = useState<'inside' | 'outside' | null>(null);
  const [needsBus, setNeedsBus]               = useState<boolean | null>(null);
  const [pickupLocation, setPickupLocation]   = useState('');

  // ── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    sermonApi.getAll({ pageSize: 3, isFeatured: true }).then(res => {
      if (res.data.isSuccess && res.data.data) setLatestSermons(res.data.data.items);
    });
    eventApi.getUpcoming({ pageSize: 3 }).then(res => {
      if (res.data.isSuccess && res.data.data) setUpcomingEvents(res.data.data.items);
    });
    announcementApi.getAll({ pageSize: 3, module: 'Ministry' }).then(res => {
      if (res.data.isSuccess && res.data.data) setLatestAnnouncements(res.data.data.items);
    });
    bookApi.getPublished({ pageSize: 10, pageNumber: 1 }).then(res => {
      if (res.data.isSuccess && res.data.data) setFeaturedBooks(res.data.data.items);
    });
    blogApi.getPublishedPosts({ pageSize: 3, pageNumber: 1 }).then(res => {
      if (res.data.isSuccess && res.data.data) setLatestBlogPosts(res.data.data.items);
    });
    ministryApi.getAll({ pageSize: 10 }).then(res => {
      if (res.data.isSuccess && res.data.data) setMinistries(res.data.data.items);
    });
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (signUpFirstName) params.set('firstName', signUpFirstName);
    if (signUpLastName)  params.set('lastName',  signUpLastName);
    if (signUpEmail)     params.set('email',     signUpEmail);
    navigate(`/register?${params.toString()}`);
  };

  const closeVisitModal = () => {
    setShowVisitModal(false);
    setLocationType(null);
    setNeedsBus(null);
    setPickupLocation('');
  };

  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ locationType, needsBus, pickupLocation });
    alert('Thank you! Your visit details have been submitted successfully.');
    closeVisitModal();
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

  const formatDateLong = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

  return (
    <div className="bg-white selection:bg-fuchsia-100 font-['Inter'] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans  { font-family: 'Inter', sans-serif; }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #111827 0%, #a21caf 50%, #111827 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 4s infinite linear;
        }
      `}</style>

      <SEO
        title="Global Flame Ministry"
        description="Raising a people of power who will manifest the kingdom. Join us for worship, sermons, and community at Global Flame Ministry in Jos, Nigeria."
        url="https://globalflameministry.org"
      />

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        <video
          autoPlay muted loop playsInline
          poster={auditorium}
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        >
          <source src="/assets/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 z-0" />

        <ParticleCanvas />

        <div className="relative z-20 text-center px-6 max-w-5xl">
          <AnimatedDiv direction="up" delay={200}>
            <span className="inline-block py-1 px-4 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 text-[10px] font-black uppercase tracking-[0.4em] mb-8 backdrop-blur-md">
              Welcome Home
            </span>
            <h1 className="text-5xl md:text-8xl font-serif text-white tracking-tight mb-8 leading-[0.95]">
              Raising a People <br />
              <span className="italic text-fuchsia-400 font-light">of Power.</span>
            </h1>
            <p className="text-white/70 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto mb-10">
              Who will manifest the Kingdom and the realities of the fullness of Christ through the Spirit
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/sermons" className="w-full sm:w-auto flex items-center justify-center px-10 py-4 bg-white text-slate-900 text-sm font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 uppercase tracking-widest">
                Watch Latest Service
              </Link>
              <Link to="/contact" className="w-full sm:w-auto flex items-center justify-center px-10 py-4 border-2 border-white/30 text-white text-sm font-bold rounded-full hover:bg-white/10 transition-all backdrop-blur-sm uppercase tracking-widest">
                Contact Us
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </AnimatedDiv>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <ChevronDown className="text-white/40 w-6 h-6" />
        </div>
      </section>

      {/* ── SIGN-UP BAR (hidden once user is logged in) ──────────────── */}
      {!user && (
        <section className="bg-[#2d2d3a] py-10 border-t border-white/10 overflow-hidden">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-5">

    {/* Heading */}
    <h2 className="text-lg sm:text-xl md:text-2xl font-serif text-white font-bold leading-snug max-w-xs sm:max-w-sm md:max-w-none">
      Sign up to receive life changing hope and encouragement
    </h2>

    {/* Form — stacks on mobile, 2-col on sm, row on md+ */}
    <form
      onSubmit={handleSignUp}
      className="w-full grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-3"
    >
      <input
        type="text"
        placeholder="First Name"
        value={signUpFirstName}
        onChange={(e) => setSignUpFirstName(e.target.value)}
        className="w-full min-w-0 bg-white/10 border border-white/20 rounded-xl py-3.5 px-4
          text-white placeholder:text-white/40 focus:ring-2 focus:ring-fuchsia-400
          outline-none transition-all text-sm"
      />
      <input
        type="text"
        placeholder="Last Name"
        value={signUpLastName}
        onChange={(e) => setSignUpLastName(e.target.value)}
        className="w-full min-w-0 bg-white/10 border border-white/20 rounded-xl py-3.5 px-4
          text-white placeholder:text-white/40 focus:ring-2 focus:ring-fuchsia-400
          outline-none transition-all text-sm"
      />
      <input
        type="email"
        placeholder="Email Address"
        value={signUpEmail}
        onChange={(e) => setSignUpEmail(e.target.value)}
        className="w-full min-w-0 sm:col-span-2 md:col-auto bg-white/10 border border-white/20
          rounded-xl py-3.5 px-4 text-white placeholder:text-white/40
          focus:ring-2 focus:ring-fuchsia-400 outline-none transition-all text-sm"
      />
      <button
        type="submit"
        className="w-full sm:col-span-2 md:w-auto md:col-auto bg-[#7c3aed]
          hover:bg-[#6d28d9] text-white font-bold uppercase tracking-widest
          px-8 py-3.5 rounded-xl shadow-lg transition-all text-sm"
      >
        Sign Up
      </button>
    </form>

    {/* Disclaimer */}
    <p className="text-[11px] text-white/50 leading-relaxed">
      * By submitting this form you will be taken to our registration page to complete
      your account setup. We respect your privacy and will never share your information.
    </p>
  </div>
</section>      
)}

      {/* ── QUICK ACTIONS BAR ────────────────────────────────────────── */}
      <div className="bg-[#f5f3ff] py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <Link to="/events" className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group min-h-[120px]">
            <Calendar className="w-7 h-7 text-[#7c3aed]" />
            <span className="text-sm font-semibold text-slate-700">Events</span>
          </Link>
          <Link to="/give" className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group min-h-[120px]">
            <Heart className="w-7 h-7 text-[#7c3aed]" />
            <span className="text-sm font-semibold text-slate-700">Give</span>
          </Link>
          <Link to="/counselling" className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group min-h-[120px]">
            <HeartHandshake className="w-7 h-7 text-[#7c3aed]" />
            <span className="text-sm font-semibold text-slate-700">Counselling</span>
          </Link>
          <button onClick={() => navigate('/prayer-request')} className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group min-h-[120px]">
            <HandHeart className="w-7 h-7 text-[#7c3aed]" />
            <span className="text-sm font-semibold text-slate-700">Prayer</span>
          </button>
          <button onClick={() => setShowTestimonyModal(true)} className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all group min-h-[120px] col-span-2 sm:col-span-1">
            <Star className="w-7 h-7 text-[#7c3aed]" />
            <span className="text-sm font-semibold text-slate-700">Testimony</span>
          </button>
        </div>
      </div>

      {/* ── SERMONS ──────────────────────────────────────────────────── */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedDiv className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-xl">
              <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.4em] mb-3">
                Latest Messages
              </p>
              <h2 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 leading-snug">
                Spiritual Nourishment
              </h2>
            </div>
          </AnimatedDiv>

          {latestSermons.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {latestSermons.map((sermon, i) => (
                  <AnimatedDiv key={sermon.id} delay={i * 120} direction="up">
                    <Link to={`/sermons/${sermon.slug || sermon.id}`} className="group block bg-white p-4 rounded-2xl shadow-sm hover:shadow-xl transition-all">
                      <div className="relative aspect-video overflow-hidden rounded-lg mb-3">
                        {sermon.imageUrl ? (
                          <img
                            src={sermon.imageUrl}
                            alt={sermon.title}
                            className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                            <Play className="w-10 h-10 text-slate-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-fuchsia-600 shadow-lg">
                            <Play className="w-5 h-5 fill-current" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600">
                          {formatDate(sermon.sermonDate)}
                        </p>
                        <h3 className="text-base font-serif font-semibold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                          {sermon.title}
                        </h3>
                        <p className="text-slate-400 text-xs leading-relaxed uppercase tracking-wider italic">
                          {sermon.series}
                        </p>
                      </div>
                    </Link>
                  </AnimatedDiv>
                ))}
              </div>
              <div className="mt-12 flex justify-end">
                <Link
                  to="/sermons"
                  className="flex items-center text-slate-700 font-bold border-b-2 border-brand-200
                    hover:border-fuchsia-600 transition-all pb-1 uppercase text-[11px] tracking-[0.2em]"
                >
                  Browse Series <ArrowRight className="w-3 h-3 ml-2" />
                </Link>
              </div>
            </>
          ) : (
            <AnimatedDiv className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl" delay={200}>
              <Play className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg font-serif italic">No sermons available yet.</p>
            </AnimatedDiv>
          )}

          {/* ── ANNOUNCEMENTS ─────────────────────────────────────────── */}
          {latestAnnouncements.length > 0 && (
            <div className="mt-32 pt-24 border-t border-slate-200">
              <AnimatedDiv className="flex flex-col md:flex-row justify-between items-end mb-12">
                <div>
                  <p className="text-[10px] font-black text-fuchsia-600 uppercase tracking-[0.4em] mb-3">
                    Ministry News
                  </p>
                  <h2 className="text-4xl font-serif font-medium text-slate-900">
                    Announcements
                  </h2>
                </div>
                <Link
                  to="/announcements"
                  className="mt-5 md:mt-0 flex items-center text-fuchsia-600 font-bold
                    border-b-2 border-fuchsia-100 hover:border-fuchsia-600 transition-all
                    pb-1 uppercase text-[11px] tracking-[0.2em]"
                >
                  View All <ArrowRight className="w-3 h-3 ml-2" />
                </Link>
              </AnimatedDiv>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {latestAnnouncements.map((a, i) => (
                  <AnimatedDiv key={a.id} delay={i * 100} direction="up">
                    <Link
                      to="/announcements"
                      className="group bg-white rounded-xl p-6 border border-slate-100
                        hover:border-fuchsia-200 hover:shadow-md transition-all duration-300 block h-full"
                    >
                      <span className="text-[10px] font-black text-fuchsia-600 uppercase tracking-[0.3em] block mb-3">
                        {a.category || 'General'}
                      </span>
                      <h3 className="text-base font-serif font-semibold text-slate-900 mb-2.5
                        group-hover:text-fuchsia-700 transition-colors line-clamp-2 leading-snug">
                        {a.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4">
                        {a.content}
                      </p>
                      <span className="text-xs text-slate-400">
                        {new Date(a.createdOn).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </span>
                    </Link>
                  </AnimatedDiv>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── BOOKS ────────────────────────────────────────────────────── */}
      {featuredBooks.length > 0 && (
        <section className="py-24 md:py-40 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedDiv className="flex flex-col md:flex-row justify-between items-end mb-10">
              <div className="max-w-xl">
                <p className="text-[10px] font-black text-fuchsia-600 uppercase tracking-[0.4em] mb-3">
                  Kingdom Literature
                </p>
                <h2 className="text-4xl md:text-5xl font-serif font-medium text-slate-900 leading-snug">
                  Transform Your Mind,{' '}
                  <span className="italic text-fuchsia-600">Transform Your Life</span>
                </h2>
                <p className="text-slate-400 italic text-sm border-l-2 border-fuchsia-300 pl-4 mt-4 leading-relaxed">
                  "Do not conform to the pattern of this world, but be transformed by the renewing of your mind." —{' '}
                  <span className="text-fuchsia-500 font-semibold not-italic">Romans 12:2</span>
                </p>
              </div>
              <Link
                to="/books"
                className="mt-6 md:mt-0 flex items-center gap-2 px-6 py-3 border-2 border-fuchsia-600
                  text-fuchsia-600 font-bold uppercase tracking-widest text-[11px]
                  hover:bg-fuchsia-600 hover:text-white transition-all rounded-full shrink-0"
              >
                Explore More <ArrowRight className="w-3 h-3" />
              </Link>
            </AnimatedDiv>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap">
                Recommended Reads
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="flex gap-8 overflow-x-auto pb-8 snap-x scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {featuredBooks.map((book, idx) => (
                <AnimatedDiv key={book.id} delay={idx * 60} direction="up" className="snap-start min-w-[280px] shrink-0">
                  <Link to="/books" className="group block cursor-pointer">
                    <div className="aspect-[3/4] bg-slate-800 rounded-xl overflow-hidden mb-6 shadow-xl relative">
                      {book.coverImageUrl ? (
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Library className="w-10 h-10 text-slate-400" />
                        </div>
                      )}
                      {book.isFeatured && (
                        <div className="absolute top-3 left-3 bg-fuchsia-600 text-white text-[9px] font-bold uppercase px-2 py-1 rounded-full">
                          Featured
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-lg text-slate-900 mb-1 leading-snug group-hover:text-fuchsia-600 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-slate-400 text-sm">By {book.author}</p>
                  </Link>
                </AnimatedDiv>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── DIVINE PRESENCE ──────────────────────────────────────────── */}
      <AnimatedSection direction="fade" className="relative h-[80vh] flex items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <video autoPlay muted loop playsInline poster={dddPreaching}
            className="w-full h-full object-cover opacity-50 scale-110">
            <source src="/assets/presence-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <AnimatedDiv direction="left" delay={200}>
            <div className="max-w-2xl">
              <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-4">
                Every Tuesday
              </p>
              <h2 className="text-white text-4xl md:text-6xl font-serif mb-6 leading-snug">
                Experience the <br />
                <span className="italic text-brand-300">Divine Presence</span>
              </h2>
              <p className="text-slate-400 text-base mb-8 max-w-md leading-relaxed">
                Join us every Tuesday for an atmosphere of worship that transcends the ordinary.
              </p>
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
                <button
                  onClick={() => navigate('/plan-your-visit')}
                  className="px-8 py-4 sm:px-10 sm:py-5 bg-[#7C3AED] text-white font-black
                    uppercase tracking-widest text-[11px] sm:text-[13px] hover:bg-[#6D28D9]
                    hover:scale-105 rounded-full transition-all duration-200 shadow-2xl
                    whitespace-nowrap active:scale-95"
                >
                  Plan Your Visit
                </button>
                <Link
                  to="/events"
                  className="px-8 py-4 sm:px-10 sm:py-5 bg-white/10 text-white font-black
                    uppercase tracking-widest text-[11px] sm:text-[13px] hover:bg-white/20
                    transition-all duration-200 backdrop-blur-md rounded-full border border-white/20"
                >
                  View All Events
                </Link>
              </div>
            </div>
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      {/* ── MISSION & VISION ─────────────────────────────────────────── */}
      <AnimatedSection direction="fade" className="py-24 md:py-40 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
<AnimatedDiv
  className="lg:col-span-5"
  direction="left"
  delay={100}
>
  <div className="rounded-2xl overflow-hidden shadow-2xl h-72 md:h-auto md:aspect-[3/4]">
    <img
      src={daddandmumm}
      alt="Leadership"
      className="w-full h-full object-cover transition-all duration-700"
    />
  </div>
</AnimatedDiv>
            <AnimatedDiv className="lg:col-span-7 lg:pl-12" direction="right" delay={200}>
              <p className="text-brand-600 font-black tracking-[0.4em] uppercase text-[10px] mb-5">
                Our History
              </p>
              <h2 className="text-4xl md:text-6xl font-serif font-medium text-slate-900 mb-8 leading-snug">
                Where Faith Meets{' '}<span className="italic">Excellence.</span>
              </h2>
              <div className="space-y-6">
                <blockquote className="border-l-4 border-brand-500 pl-6 py-1 italic text-xl text-slate-700 font-serif leading-relaxed">
                  "The strength of your victory is tied to the strength of your personal altar. — Apostle Danjuma Musa."
                </blockquote>
                <p className="text-slate-600 text-base leading-relaxed">
                  Inspired by a commitment to spiritual growth and community, Global Flame Ministry provides
                  a sanctuary for those seeking purpose and igniting the passion of Christ in the hearts of
                  men and women worldwide. Like a world-class hotel, we believe in radical hospitality.
                </p>
                <div className="pt-2">
                  <Link
                    to="/our-story"
                    className="px-8 py-3.5 border-2 border-slate-900 text-slate-900 font-black
                      uppercase tracking-widest text-[11px] hover:bg-slate-900 hover:text-white
                      transition-all inline-block rounded-full"
                  >
                    Explore Heritage
                  </Link>
                </div>
              </div>
            </AnimatedDiv>
          </div>
        </div>
      </AnimatedSection>

      {/* ── CORE BELIEFS ─────────────────────────────────────────────── */}
      <section className="py-20 md:py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedDiv className="mb-14" direction="up">
            <div className="flex flex-col md:flex-row justify-between items-end">
              <div className="max-w-xl">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-4">
                  What We Believe
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-slate-900 leading-tight mb-3">
                  BUILT ON AN{' '}
                  <span className="italic text-fuchsia-600">UNSHAKEABLE</span>{' '}
                  FOUNDATION.
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                  These are not opinions — they are the bedrock convictions on which
                  Global Flame Ministry was founded and continues to stand.
                </p>
              </div>
            </div>
          </AnimatedDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {featuredBeliefs.map((belief, i) => {
              const directions: Array<'left' | 'right' | 'up'> = ['left', 'right', 'left', 'right'];
              return (
                <BeliefCard
                  key={i}
                  title={belief.title}
                  body={belief.body}
                  delay={i * 100}
                  direction={directions[i]}
                />
              );
            })}
          </div>

          <AnimatedDiv className="text-center" delay={400}>
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r
              from-fuchsia-600 to-fuchsia-800 p-8 flex flex-col sm:flex-row
              items-center justify-between gap-6">
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/5
                font-serif font-black text-8xl select-none pointer-events-none hidden lg:block">
                BELIEVE
              </span>
              <div className="relative z-10">
                <p className="text-fuchsia-200 text-[10px] font-black uppercase tracking-[0.4em] mb-1">
                  There's More
                </p>
                <h3 className="text-white font-serif text-xl md:text-2xl font-medium">
                  We hold <span className="italic">9 core convictions.</span>{' '}Discover all of them.
                </h3>
              </div>
              <Link
                to="/core-beliefs"
                className="relative z-10 shrink-0 flex items-center gap-2.5 px-7 py-3.5
                  bg-white text-fuchsia-700 font-bold uppercase tracking-widest text-[11px]
                  rounded-full hover:bg-fuchsia-50 transition-all shadow-lg whitespace-nowrap"
              >
                Explore All Beliefs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </AnimatedDiv>
        </div>
      </section>

      {/* ── BLOG PREVIEW ─────────────────────────────────────────────── */}
      {latestBlogPosts.length > 0 && (
        <section className="py-24 md:py-40 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-slate-900">Latest from the Blog</h3>
              <Link to="/blog" className="text-sm font-semibold text-[#a21caf] hover:text-[#7c3aed]">View All →</Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {latestBlogPosts.map((post) => (
                <article key={post.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100
                  overflow-hidden hover:shadow-xl hover:border-purple-200 transition-all">
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                      {post.coverImageUrl ? (
                        <img src={post.coverImageUrl} alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-fuchsia-100
                          flex items-center justify-center">
                          <Flame className="w-10 h-10 text-purple-300" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-6">
                    {post.department && (
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-600">
                        {post.department}
                      </span>
                    )}
                    <Link to={`/blog/${post.slug}`} className="block mt-2">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-700 transition-colors">
                        {post.title}
                      </h4>
                    </Link>
                    {post.excerpt && (
                      <p className="mt-2 text-gray-600 text-sm line-clamp-3 leading-relaxed">{post.excerpt}</p>
                    )}
                    <div className="mt-4">
                      <Link to={`/blog/${post.slug}`} className="text-sm font-medium text-purple-600 hover:text-purple-800">
                        Read more →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── EVENTS ───────────────────────────────────────────────────── */}
      <section className="py-24 md:py-40 bg-[#0a0c10] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <AnimatedDiv className="text-center mb-14" delay={100}>
            <p className="text-[10px] font-black tracking-[0.5em] uppercase text-brand-500 mb-3">Itinerary</p>
            <h2 className="text-3xl md:text-4xl font-serif">Upcoming Events &amp; Gatherings</h2>
          </AnimatedDiv>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event, i) => (
                <AnimatedDiv key={event.id} delay={i * 120} direction="up">
                  <div className="bg-white/5 border border-white/10 p-10 hover:bg-white/10
                    transition-all group h-full rounded-2xl backdrop-blur-sm">
                    <p className="text-brand-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                      {event.module}
                    </p>
                    <h3 className="text-xl font-serif mb-5 group-hover:translate-x-2 transition-transform leading-snug">
                      {event.title}
                    </h3>
                    <div className="text-slate-500 text-xs space-y-2 mb-8 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {formatDateLong(event.startDate)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        {event.location}
                      </div>
                    </div>
                    <Link to="/events" className="inline-flex items-center text-[10px] font-bold
                      uppercase tracking-[0.2em] text-white/70 group-hover:text-brand-400 transition-colors">
                      Reservations <ArrowRight className="ml-2 w-3 h-3" />
                    </Link>
                  </div>
                </AnimatedDiv>
              ))}
            </div>
          ) : (
            <AnimatedDiv className="text-center py-16 border border-slate-800 rounded-xl" delay={200}>
              <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-serif italic">No upcoming events. Check back soon.</p>
            </AnimatedDiv>
          )}
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────────── */}
      <section className="py-24 md:py-40 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <AnimatedDiv direction="left">
              <p className="text-[10px] font-black text-fuchsia-600 uppercase tracking-[0.4em] mb-4">Contact Us</p>
              <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-10 leading-tight">
                We are here to <br /><span className="italic text-fuchsia-600">Connect.</span>
              </h2>
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-fuchsia-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-1">Visit Us</h4>
                    <p className="text-slate-500">Zarmaganda, Diye, Off Rayfield Road, Jos, Nigeria.</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-fuchsia-600 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-1">Email Us</h4>
                    <p className="text-slate-500">info@globalflameministry.org</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-fuchsia-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm uppercase tracking-widest mb-1">Call Us</h4>
                    <p className="text-slate-500">+234 813 816 3685</p>
                  </div>
                </div>
              </div>
            </AnimatedDiv>
            <AnimatedDiv direction="right" delay={200} className="bg-slate-900 rounded-3xl p-10 md:p-14 text-white shadow-2xl">
              <h3 className="text-3xl font-serif mb-6">Send a Message</h3>
              <p className="text-white/60 mb-8 font-light">Have a question or need prayer? Reach out to us directly.</p>
              <button onClick={() => navigate('/contact')} className="w-full py-5 bg-white text-slate-900 font-black
                uppercase tracking-widest text-[11px] rounded-full hover:bg-fuchsia-50 transition-all
                flex items-center justify-center gap-3">
                Go to Contact Form <ArrowRight className="w-4 h-4" />
              </button>
            </AnimatedDiv>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="lg:col-span-1">
              <Link to="/" className="inline-block mb-6">
                <h2 className="text-2xl font-serif font-black shimmer-text uppercase tracking-tighter">Global Flame</h2>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Raising leaders who will manifest the kingdom. Transforming lives through the fire of the Holy Spirit.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 mb-8">Our Departments</h4>
              <ul className="space-y-4">
                {ministries.map(m => (
                  <li key={m.id}>
                    <Link to={`/ministries/${m.slug}`} className="text-slate-500 hover:text-fuchsia-600 text-sm transition-colors">
                      {m.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 mb-8">Resources</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><Link to="/sermons" className="hover:text-fuchsia-600 transition-colors">Sermon Archive</Link></li>
                <li><Link to="/blog"    className="hover:text-fuchsia-600 transition-colors">Ministry Blog</Link></li>
                <li><Link to="/books"   className="hover:text-fuchsia-600 transition-colors">Kingdom Books</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 mb-8">Connect</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><Link to="/events"          className="hover:text-fuchsia-600 transition-colors">Upcoming Events</Link></li>
                <li><Link to="/prayer-request"  className="hover:text-fuchsia-600 transition-colors">Prayer Request</Link></li>
                <li><Link to="/give"            className="hover:text-fuchsia-600 transition-colors">Giving & Partnership</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">
              © {new Date().getFullYear()} Global Flame Ministry. Jos, Nigeria.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest">Privacy Policy</Link>
              <Link to="/terms"   className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── TESTIMONY MODAL ──────────────────────────────────────────── */}
      <TestimonyModal
        isOpen={showTestimonyModal}
        onClose={() => setShowTestimonyModal(false)}
      />

      {/* ── PLAN YOUR VISIT MODAL ────────────────────────────────────── */}
      {showVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden border border-slate-100 animate-fade-in">
            <button onClick={closeVisitModal} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg">
              ✕
            </button>
            <div className="text-center mb-6">
              <span className="text-[10px] font-black text-fuchsia-600 uppercase tracking-widest block mb-1">
                Welcome to Global Flame
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-900">Plan Your Visit</h3>
            </div>

            {locationType === null && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 text-center">
                  To help us organise your logistics, where are you currently located?
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <button type="button" onClick={() => setLocationType('inside')}
                    className="w-full py-4 px-4 border border-slate-200 hover:border-fuchsia-400
                      hover:bg-fuchsia-50/30 text-left font-semibold text-slate-800 text-sm
                      rounded-xl transition-all">
                    📍 Inside Jos, Plateau State
                  </button>
                  <button type="button" onClick={() => setLocationType('outside')}
                    className="w-full py-4 px-4 border border-slate-200 hover:border-fuchsia-400
                      hover:bg-fuchsia-50/30 text-left font-semibold text-slate-800 text-sm
                      rounded-xl transition-all">
                    🚗 Outside Jos / Other State
                  </button>
                </div>
              </div>
            )}

            {locationType === 'inside' && (
              <div className="text-center space-y-4">
                <p className="text-slate-600 text-sm leading-relaxed">
                  Wonderful! We look forward to meeting you at our main sanctuary in Jos this coming Tuesday.
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left text-xs space-y-1">
                  <p className="font-bold text-slate-700">📍 Church Location:</p>
                  <p className="text-slate-500">Global Flame Ministry Sanctuary, Jos, Plateau State, Nigeria.</p>
                  <p className="font-bold text-slate-700 pt-2">⏰ Service Time:</p>
                  <p className="text-slate-500">Atmosphere of Divine Presence — Every Tuesday at 5:00 PM</p>
                </div>
                <button type="button" onClick={closeVisitModal}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold
                    text-xs uppercase tracking-widest rounded-lg transition-colors">
                  Got it, see you there!
                </button>
              </div>
            )}

            {locationType === 'outside' && (
              <form onSubmit={handleVisitSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Would you like our ministry bus transport to pick you up?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setNeedsBus(true)}
                      className={`py-3 text-center text-sm font-semibold rounded-lg border transition-all
                        ${needsBus === true ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      Yes, please
                    </button>
                    <button type="button" onClick={() => { setNeedsBus(false); setPickupLocation(''); }}
                      className={`py-3 text-center text-sm font-semibold rounded-lg border transition-all
                        ${needsBus === false ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      No, I'll self drive
                    </button>
                  </div>
                </div>
                {needsBus === true && (
                  <div className="transition-all animate-fade-in">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Current Location / Pickup Address
                    </label>
                    <textarea
                      required
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="Please specify your precise pickup point address, nearest landmarks, and city/state..."
                      className="w-full min-h-[90px] bg-slate-50 border border-slate-200 rounded-lg p-3
                        text-slate-800 text-sm focus:ring-2 focus:ring-fuchsia-400 focus:bg-white
                        outline-none transition-all shadow-sm"
                    />
                  </div>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setLocationType(null)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600
                      font-bold text-xs uppercase tracking-widest rounded-lg transition-colors">
                    Back
                  </button>
                  <button type="submit"
                    disabled={needsBus === null || (needsBus === true && !pickupLocation.trim())}
                    className="flex-1 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-slate-200
                      disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs
                      uppercase tracking-widest rounded-lg shadow-md transition-colors">
                    Submit Plan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ScrollToTopButton />
    </div>
  );
};

// ─── SCROLL TO TOP ────────────────────────────────────────────────────────────

const ScrollToTopButton: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#a21caf] hover:bg-[#7c3aed]
        text-white rounded-full shadow-lg flex items-center justify-center
        transition-all hover:scale-110"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
};

export default Home;