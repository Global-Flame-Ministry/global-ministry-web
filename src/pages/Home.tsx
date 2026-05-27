import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import SEO from '../components/SEO';
import { Link, useNavigate } from 'react-router-dom';
import { announcementApi } from '../api/announcementApi';
import { Calendar, Play, ArrowRight, Globe, Heart, HandHeart, Star, Library, ShieldCheck, Flame, HeartHandshake } from 'lucide-react';
import { sermonApi } from '../api/sermonApi';
import { eventApi } from '../api/eventApi';
import { bookApi } from '../api/bookApi';
import { blogApi } from '../api/blogApi';
import type { SermonDto, EventDto, AnnouncementDto, BookDto } from '../types';
import type { BlogPostResponseDto } from '../types';
import daddy from '../assets/daddy.jpg';
import dddPreaching from '../assets/ddd-preaching.jpeg';
import daddandmumm from '../assets/dadandmum.jpg';
import { useScrollAnimation } from '../context/hooks/useScrollAnimation';
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

// ─── CORE BELIEFS TEASER DATA (first 4 only) ─────────────────────────────────

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

// ─── INDIVIDUAL BELIEF CARD WITH OWN SCROLL TRIGGER ─────────────────────────

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
  const [latestSermons, setLatestSermons]             = useState<SermonDto[]>([]);
  const [upcomingEvents, setUpcomingEvents]           = useState<EventDto[]>([]);
  const [latestAnnouncements, setLatestAnnouncements] = useState<AnnouncementDto[]>([]);
  const [featuredBooks, setFeaturedBooks]             = useState<BookDto[]>([]);
  const [latestBlogPosts, setLatestBlogPosts]         = useState<BlogPostResponseDto[]>([]);
  const [showTestimonyModal, setShowTestimonyModal]   = useState(false);

  // Visit Modal Hook States (merged from updated version)
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [locationType, setLocationType] = useState<'inside' | 'outside' | null>(null);
  const [needsBus, setNeedsBus] = useState<boolean | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');

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
    // Latest blog posts preview for home
    blogApi.getPublishedPosts({ pageSize: 3, pageNumber: 1 }).then(res => {
      if (res.data.isSuccess && res.data.data) setLatestBlogPosts(res.data.data.items);
    });
  }, []);

  const closeVisitModal = () => {
    setShowVisitModal(false);
    setLocationType(null);
    setNeedsBus(null);
    setPickupLocation('');
  };

  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Actionable metadata block configuration
    console.log({ locationType, needsBus, pickupLocation });
    alert("Thank you! Your visit details have been submitted successfully.");
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
    <div className="bg-white selection:bg-brand-100">
      <SEO
        title="Global Flame Ministry"
        description="Raising a people of power who will manifest the kingdom. Join us for worship, sermons, and community at Global Flame Ministry in Jos, Nigeria."
        url="https://globalflameministry.org"
      />
      <Hero />

      {/* ── Quick Actions Bar ─────────────────────────────────────────── */}
      <AnimatedDiv
        className="relative z-10 -mt-10 max-w-5xl mx-auto px-6"
        direction="up"
        delay={100}
      >
<div className="bg-white shadow-2xl rounded-xl grid grid-cols-6 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-slate-100 border border-slate-100 overflow-hidden">
  <Link
    to="/events"
    className="col-span-2 md:col-span-1 p-5 flex flex-col items-center justify-center gap-3 hover:bg-blue-50 transition-colors group"
  >
    <Calendar className="w-4 h-4 text-fuchsia-700 group-hover:text-fuchsia-700 transition-colors" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-700 group-hover:text-fuchsia-800 transition-colors">Events</span>
  </Link>
  <Link
    to="/give"
    className="col-span-2 md:col-span-1 p-5 flex flex-col items-center justify-center gap-3 hover:bg-emerald-50 transition-colors group"
  >
    <Heart className="w-4 h-4 text-emerald-600 group-hover:text-emerald-600 transition-colors" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 group-hover:text-emerald-700 transition-colors">Give</span>
  </Link>
  <Link
    to="/counselling"
    className="col-span-2 md:col-span-1 p-5 flex flex-col items-center justify-center gap-3 hover:bg-orange-50 transition-colors group"
  >
    <HeartHandshake className="w-4 h-4 text-orange-500 group-hover:text-orange-600 transition-colors" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 group-hover:text-orange-600 transition-colors">Counselling</span>
  </Link>
  <button
    onClick={() => navigate('/prayer-request')}
    className="col-span-3 md:col-span-1 p-5 flex flex-col items-center justify-center gap-3 hover:bg-fuchsia-50 transition-colors group"
  >
    <HandHeart className="w-4 h-4 text-fuchsia-700 group-hover:text-fuchsia-600 transition-colors" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-700 group-hover:text-fuchsia-700 transition-colors">Prayer</span>
  </button>
  <button
    onClick={() => setShowTestimonyModal(true)}
    className="col-span-3 md:col-span-1 p-5 flex flex-col items-center justify-center gap-3 hover:bg-amber-50 transition-colors group"
  >
    <Star className="w-4 h-4 text-amber-500 group-hover:text-amber-600 transition-colors" />
    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 group-hover:text-amber-800 transition-colors">Testimony</span>
  </button>
</div>
      </AnimatedDiv>

      {/* ── Sermon Section ────────────────────────────────────────────── */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <AnimatedDiv className="flex flex-col md:flex-row justify-between
            items-end mb-16">
            <div className="max-w-xl">
              <p className="text-[10px] font-black text-brand-600 uppercase
                tracking-[0.4em] mb-3">
                Latest Messages
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-medium
                text-slate-900 leading-snug">
                Spiritual insights for a modern world.
              </h2>
            </div>
          </AnimatedDiv>

            {latestSermons.length > 0 && (
              <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {latestSermons.map((sermon, i) => (
                <AnimatedDiv key={sermon.id} delay={i * 120} direction="up">
                  <Link to={`/sermons/${sermon.slug || sermon.id}`} className="group block">
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
                className="flex items-center text-slate-700
                  font-bold border-b-2 border-brand-200 hover:border-brand-600
                  transition-all pb-1 uppercase text-[11px] tracking-[0.2em]"
              >
                Explore Archive <ArrowRight className="w-3 h-3 ml-2" />
              </Link>
            </div>
            </>
          )}

          {/* Announcements */}
          {latestAnnouncements.length > 0 && (
            <div className="py-20 bg-slate-50 -mx-4 sm:-mx-6 lg:-mx-8
              px-4 sm:px-6 lg:px-8 mt-20">
              <AnimatedDiv className="flex flex-col md:flex-row justify-between
                items-end mb-12">
                <div>
                  <p className="text-[10px] font-black text-fuchsia-600 uppercase
                    tracking-[0.4em] mb-3">
                    Latest Updates
                  </p>
                  <h2 className="text-3xl font-serif font-medium text-slate-900">
                    Announcements
                  </h2>
                </div>
                <Link
                  to="/announcements"
                  className="mt-5 md:mt-0 flex items-center text-slate-700
                    font-bold border-b-2 border-fuchsia-200
                    hover:border-fuchsia-600 transition-all pb-1 uppercase
                    text-[11px] tracking-[0.2em]"
                >
                  View All <ArrowRight className="w-3 h-3 ml-2" />
                </Link>
              </AnimatedDiv>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8
                max-w-7xl mx-auto">
                {latestAnnouncements.map((a, i) => (
                  <AnimatedDiv key={a.id} delay={i * 100} direction="up">
                    <Link
                      to="/announcements"
                      className="group bg-white rounded-xl p-6 border
                        border-slate-100 hover:border-fuchsia-200
                        hover:shadow-md transition-all duration-300 block h-full"
                    >
                      <span className="text-[10px] font-black text-fuchsia-600
                        uppercase tracking-[0.3em] block mb-3">
                        {a.category || 'General'}
                      </span>
                      <h3 className="text-base font-serif font-semibold
                        text-slate-900 mb-2.5 group-hover:text-fuchsia-700
                        transition-colors line-clamp-2 leading-snug">
                        {a.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed
                        line-clamp-2 mb-4">
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

      {/* ── Books Section ─────────────────────────────────────────────── */}
      {featuredBooks.length > 0 && (
        <div className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <AnimatedDiv className="flex flex-col md:flex-row justify-between
              items-end mb-10">
              <div className="max-w-xl">
                <p className="text-[10px] font-black text-fuchsia-600 uppercase
                  tracking-[0.4em] mb-3">
                  Kingdom Literature
                </p>
                <h2 className="text-3xl md:text-4xl font-serif font-medium
                  text-slate-900 leading-snug">
                  Transform Your Mind,{' '}
                  <span className="italic text-fuchsia-600">
                    Transform Your Life
                  </span>
                </h2>
                <p className="text-slate-400 italic text-sm border-l-2
                  border-fuchsia-300 pl-4 mt-4 leading-relaxed">
                  "Do not conform to the pattern of this world, but be
                  transformed by the renewing of your mind." —{' '}
                  <span className="text-fuchsia-500 font-semibold not-italic">
                    Romans 12:2
                  </span>
                </p>
              </div>
              <Link
                to="/books"
                className="mt-6 md:mt-0 flex items-center gap-2 px-6 py-3
                  border-2 border-fuchsia-600 text-fuchsia-600 font-bold
                  uppercase tracking-widest text-[11px]
                  hover:bg-fuchsia-600 hover:text-white transition-all
                  rounded-sm shrink-0"
              >
                Explore More <ArrowRight className="w-3 h-3" />
              </Link>
            </AnimatedDiv>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-slate-400 font-bold uppercase
                tracking-widest text-[10px] whitespace-nowrap">
                Recommended Reads
              </span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Book shelf */}
            <div className="flex gap-5 overflow-x-auto pb-6
              scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {featuredBooks.map((book, idx) => (
                <AnimatedDiv
                  key={book.id}
                  delay={idx * 60}
                  direction="up"
                  className="shrink-0"
                >
                  <Link to="/books" className="group block w-32">
                    <div className="relative w-32 h-48 rounded-lg overflow-hidden
                      bg-slate-100 shadow-sm hover:shadow-lg
                      transition-shadow duration-300 mb-2">
                      {book.coverImageUrl ? (
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          className="w-full h-full object-cover
                            group-hover:scale-105 transition-transform
                            duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center
                          justify-center">
                          <Library className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-fuchsia-600/0
                        group-hover:bg-fuchsia-600/20 transition-all duration-300
                        flex items-end justify-center pb-3">
                        <span className="opacity-0 group-hover:opacity-100
                          transition-opacity duration-300 text-[9px] font-black
                          uppercase tracking-widest text-white bg-fuchsia-600
                          px-2 py-1 rounded-full">
                          View
                        </span>
                      </div>
                      {book.isFeatured && (
                        <div className="absolute top-2 left-2 bg-fuchsia-600
                          text-white text-[9px] font-bold uppercase px-1.5
                          py-0.5 rounded-full">
                          Featured
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-800
                      leading-snug line-clamp-2 group-hover:text-fuchsia-600
                      transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {book.author}
                    </p>
                  </Link>
                </AnimatedDiv>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Divine Presence Section ───────────────────────────────────── */}
      <AnimatedSection
        direction="fade"
        className="relative h-[70vh] flex items-center overflow-hidden bg-slate-900"
      >
        <div className="absolute inset-0 z-0">
          <img
            src={dddPreaching}
            className="w-full h-full object-cover opacity-40 scale-110 blur-sm"
            alt="Atmosphere"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900
            via-slate-900/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <AnimatedDiv direction="left" delay={200}>
            <div className="max-w-2xl">
              <p className="text-[10px] font-black text-white uppercase
                tracking-[0.4em] mb-4">
                Every Tuesday
              </p>
              <h2 className="text-white text-3xl md:text-5xl font-serif mb-5
                leading-snug">
                Experience the <br />
                <span className="italic text-brand-300">Divine Presence</span>
              </h2>
              <p className="text-slate-400 text-base mb-8 max-w-md
                leading-relaxed">
                Join us every Tuesday for an atmosphere of worship that
                transcends the ordinary.
              </p>
              <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
                {/* CHANGED FROM LINK TO TRIGGER POPUP FORM (merged from updated version) */}
                <button
                  onClick={() => navigate('/plan-your-visit')}
                  className="px-8 py-4 sm:px-10 sm:py-5 bg-[#7C3AED] text-white font-black
                    uppercase tracking-widest text-[11px] sm:text-[13px]
                    hover:bg-[#6D28D9] hover:scale-105
                    transition-all duration-200 shadow-2xl
                    whitespace-nowrap border-b-4 border-[#5B21B6] active:scale-95
                    active:border-b-2"
                >
                  Plan Your Visit
                </button>
              </div>
            </div>
          </AnimatedDiv>
        </div>
      </AnimatedSection>

      {/* ── Mission & Vision ──────────────────────────────────────────── */}
      <AnimatedSection
        direction="fade"
        className="py-32 bg-slate-50 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <AnimatedDiv
            className="lg:col-span-5 relative"
            direction="left"
            delay={100}
          >
            {/* Main image */}
            <div className="relative z-10 rounded-lg overflow-hidden shadow-2xl 
              h-72 md:h-auto md:aspect-3/4">
              <img
                src={daddandmumm}
                alt="Leadership"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overlay portrait */}
            <div className="absolute -bottom-8 -right-2 md:-bottom-10 md:-right-10
              w-28 h-36 md:w-64 md:h-64 bg-white p-1.5 md:p-4
              shadow-xl z-20 rounded-lg">
              <img
                src={daddy}
                alt="Apostle"
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          </AnimatedDiv>
            <AnimatedDiv
              className="lg:col-span-7 lg:pl-12"
              direction="right"
              delay={200}
            >
              <p className="text-brand-600 font-black tracking-[0.4em] uppercase
                text-[10px] mb-5">
                Our History
              </p>
              <h2 className="text-3xl md:text-5xl font-serif font-medium
                text-slate-900 mb-8 leading-snug">
                Where Faith Meets{' '}
                <span className="italic">Excellence.</span>
              </h2>
              <div className="space-y-6">
                <blockquote className="border-l-4 border-brand-500 pl-6 py-1
                  italic text-xl text-slate-700 font-serif leading-relaxed">
                  "The strength of your victory is tied to the strength of your personal altar. — Apostle Danjuma Musa."
                </blockquote>
                <p className="text-slate-600 text-base leading-relaxed">
                  Inspired by a commitment to spiritual growth and community,
                  Global Flame Ministry provides a sanctuary for those seeking
                  purpose and igniting the passion of Christ in the hearts of
                  men and women worldwide. Like a world-class hotel, we believe
                  in radical hospitality.
                </p>
                <div className="pt-2">
                  <Link
                    to="/our-story"
                    className="px-8 py-3.5 border-2 border-slate-900
                      text-slate-900 font-bold uppercase tracking-widest
                      text-[11px] hover:bg-slate-900 hover:text-white
                      transition-all inline-block"
                  >
                    Discover More
                  </Link>
                </div>
              </div>
            </AnimatedDiv>
          </div>
        </div>
      </AnimatedSection>

      {/* ── Core Beliefs Teaser ───────────────────────────────────────── */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <AnimatedDiv className="mb-14" direction="up">
            <div className="flex flex-col md:flex-row justify-between items-end">
              <div className="max-w-xl">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
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

          {/* 4 belief cards — alternating slide directions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {featuredBeliefs.map((belief, i) => {
              // Left column slides from left, right column from right, bottom row from up
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

          {/* "Explore More" CTA strip */}
          <AnimatedDiv direction="up" delay={400}>
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r
              from-fuchsia-600 to-fuchsia-800 p-8 flex flex-col sm:flex-row
              items-center justify-between gap-6">
              {/* Decorative background text */}
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/5
                font-serif font-black text-8xl select-none pointer-events-none
                hidden lg:block">
                BELIEVE
              </span>
              <div className="relative z-10">
                <p className="text-fuchsia-200 text-[10px] font-black uppercase
                  tracking-[0.4em] mb-1">
                  There's More
                </p>
                <h3 className="text-white font-serif text-xl md:text-2xl font-medium">
                  We hold{' '}
                  <span className="italic">9 core convictions.</span>{' '}
                  Discover all of them.
                </h3>
              </div>
              <Link
                to="/core-beliefs"
                className="relative z-10 shrink-0 flex items-center gap-2.5
                  px-7 py-3.5 bg-white text-fuchsia-700 font-bold uppercase
                  tracking-widest text-[11px] rounded-full hover:bg-fuchsia-50
                  transition-all shadow-lg whitespace-nowrap"
              >
                Explore All Beliefs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </AnimatedDiv>

        </div>
      </section>

      {/* ── Blog Preview (latest 3) ───────────────────────────────────── */}
      {latestBlogPosts.length > 0 && (
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-slate-900">Latest from the Blog</h3>
              <Link to="/blog" className="text-sm font-semibold text-[#a21caf] hover:text-[#7c3aed]">View All →</Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {latestBlogPosts.map((post) => (
                <article key={post.id} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-purple-200 transition-all">
                  <Link to={`/blog/${post.slug}`} className="block">
                    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                      {post.coverImageUrl ? (
                        <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 to-fuchsia-100 flex items-center justify-center">
                          <Flame className="w-10 h-10 text-purple-300" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                      {post.department && (
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-600">
                          {post.department}
                        </span>
                      )}
                      <Link to={`/blog/${post.slug}`} className="block mt-2">
                        <h4 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-700 transition-colors">{post.title}</h4>
                      </Link>
                      {post.excerpt && <p className="mt-2 text-gray-600 text-sm line-clamp-3 leading-relaxed">{post.excerpt}</p>}
                      <div className="mt-4">
                        <Link to={`/blog/${post.slug}`} className="text-sm font-medium text-purple-600 hover:text-purple-800">Read more →</Link>
                      </div>
                    </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Event Section ─────────────────────────────────────────────── */}
      <AnimatedSection
        direction="fade"
        className="py-24 bg-[#0a0c10] text-white"
      >
        <div className="max-w-5xl mx-auto px-4">
          <AnimatedDiv className="text-center mb-14" delay={100}>
            <p className="text-[10px] font-black tracking-[0.5em] uppercase
              text-brand-500 mb-3">
              Itinerary
            </p>
            <h2 className="text-3xl md:text-4xl font-serif">
              Upcoming Events &amp; Gatherings
            </h2>
          </AnimatedDiv>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-px
              bg-slate-800 border border-slate-800">
              {upcomingEvents.map((event, i) => (
                <AnimatedDiv key={event.id} delay={i * 120} direction="up">
                  <div className="bg-[#0a0c10] p-10 hover:bg-slate-900
                    transition-all group h-full">
                    <p className="text-brand-500 text-[10px] font-black
                      uppercase tracking-[0.3em] mb-6">
                      {event.module}
                    </p>
                    <h3 className="text-xl font-serif mb-5
                      group-hover:translate-x-2 transition-transform
                      leading-snug">
                      {event.title}
                    </h3>
                    <div className="text-slate-500 text-xs space-y-2 mb-8
                      uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {formatDateLong(event.startDate)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        {event.location}
                      </div>
                    </div>
                    <Link
                      to="/events"
                      className="inline-flex items-center text-[10px] font-bold
                        uppercase tracking-[0.2em] text-white/70
                        group-hover:text-brand-400 transition-colors"
                    >
                      Reservations <ArrowRight className="ml-2 w-3 h-3" />
                    </Link>
                  </div>
                </AnimatedDiv>
              ))}
            </div>
          ) : (
            <AnimatedDiv
              className="text-center py-16 border border-slate-800 rounded-xl"
              delay={200}
            >
              <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-serif italic">
                No upcoming events. Check back soon.
              </p>
            </AnimatedDiv>
          )}
        </div>
      </AnimatedSection>

      {/* ── EXISTING TESTIMONY MODAL ─────────────────────────────────── */}
      <TestimonyModal
        isOpen={showTestimonyModal}
        onClose={() => setShowTestimonyModal(false)}
      />

      {/* ── NEW MERGED PLAN YOUR VISIT MODAL ─────────────────────────── */}
      {showVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden border border-slate-100 animate-fade-in">
            
            <button 
              onClick={closeVisitModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="text-[10px] font-black text-fuchsia-600 uppercase tracking-widest block mb-1">
                Welcome to Global Flame
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-900">
                Plan Your Visit
              </h3>
            </div>

            {/* Step 1: Location Filter */}
            {locationType === null && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 text-center">
                  To help us organize your logistics layout, where are you currently located?
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setLocationType('inside')}
                    className="w-full py-4 px-4 border border-slate-200 hover:border-fuchsia-400 hover:bg-fuchsia-50/30 text-left font-semibold text-slate-800 text-sm rounded-xl transition-all"
                  >
                    📍 Inside Jos, Plateau State
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationType('outside')}
                    className="w-full py-4 px-4 border border-slate-200 hover:border-fuchsia-400 hover:bg-fuchsia-50/30 text-left font-semibold text-slate-800 text-sm rounded-xl transition-all"
                  >
                    🚗 Outside Jos / Other State
                  </button>
                </div>
              </div>
            )}

            {/* Step 2A: Located Inside Jos */}
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
                <button
                  type="button"
                  onClick={closeVisitModal}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-colors"
                >
                  Got it, see you there!
                </button>
              </div>
            )}

            {/* Step 2B: Located Outside Jos (Questionnaire form for bus) */}
            {locationType === 'outside' && (
              <form onSubmit={handleVisitSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Would you like our ministry bus transport to pick you up?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNeedsBus(true)}
                      className={`py-3 text-center text-sm font-semibold rounded-lg border transition-all ${
                        needsBus === true 
                          ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Yes, please
                    </button>
                    <button
                      type="button"
                      onClick={() => { setNeedsBus(false); setPickupLocation(''); }}
                      className={`py-3 text-center text-sm font-semibold rounded-lg border transition-all ${
                        needsBus === false 
                          ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      No, I'll self drive
                    </button>
                  </div>
                </div>

                {/* Conditional Textarea for pickup location */}
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
                      className="w-full min-h-[90px] bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 text-sm focus:ring-2 focus:ring-fuchsia-400 focus:bg-white outline-none transition-all shadow-sm"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setLocationType(null)}
                    className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs uppercase tracking-widest rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={needsBus === null || (needsBus === true && !pickupLocation.trim())}
                    className="flex-1 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-md transition-colors"
                  >
                    Submit Plan
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Home;