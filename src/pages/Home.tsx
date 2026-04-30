import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import { Link, useNavigate } from 'react-router-dom';
import { announcementApi } from '../api/announcementApi';
import { Calendar, Play, ArrowRight, Globe, MapPin, Heart, HandHeart, Star, Library, ShieldCheck } from 'lucide-react';
import { sermonApi } from '../api/sermonApi';
import { eventApi } from '../api/eventApi';
import { bookApi } from '../api/bookApi';
import type { SermonDto, EventDto, AnnouncementDto, BookDto } from '../types';
import daddy from '../assets/daddy.jpg';
import dadandmum from '../assets/dadandmum.jpg';
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
    body: 'We believe that for the salvation of lost and sinful people, regeneration by the Holy Spirit is absolutely essential. Salvation is by grace alone, through faith alone, in Christ alone.',
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
  const [showTestimonyModal, setShowTestimonyModal]   = useState(false);

  useEffect(() => {
    sermonApi.getAll({ pageSize: 3 }).then(res => {
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
  }, []);

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
      <Hero />

      {/* ── Quick Actions Bar ─────────────────────────────────────────── */}
      <AnimatedDiv
        className="relative z-10 -mt-10 max-w-4xl mx-auto px-6"
        direction="up"
        delay={100}
      >
        <div className="bg-white shadow-2xl rounded-xl grid grid-cols-3 md:grid-cols-6
          divide-x divide-slate-100 border border-slate-100 overflow-hidden">
          {[
            { icon: <Play className="w-4 h-4 text-brand-500" />,     label: 'Watch Live', link: '/sermons' },
            { icon: <Calendar className="w-4 h-4 text-brand-500" />, label: 'Events',     link: '/events' },
            { icon: <MapPin className="w-4 h-4 text-brand-500" />,   label: 'Find Us',    link: '/contact' },
            { icon: <Heart className="w-4 h-4 text-brand-500" />,    label: 'Give',       link: '/give' },
          ].map((item, i) => (
            <Link
              key={i}
              to={item.link}
              className="p-5 flex flex-col items-center justify-center gap-3
                hover:bg-slate-50 transition-colors group"
            >
              {item.icon}
              <span className="text-[10px] font-bold uppercase tracking-widest
                text-slate-600 group-hover:text-brand-600">
                {item.label}
              </span>
            </Link>
          ))}
          <button
            onClick={() => navigate('/prayer-request')}
            className="p-5 flex flex-col items-center justify-center gap-3
              hover:bg-fuchsia-50 transition-colors group"
          >
            <HandHeart className="w-4 h-4 text-fuchsia-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest
              text-slate-600 group-hover:text-fuchsia-600">
              Prayer
            </span>
          </button>
          <button
            onClick={() => setShowTestimonyModal(true)}
            className="p-5 flex flex-col items-center justify-center gap-3
              hover:bg-amber-50 transition-colors group"
          >
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest
              text-slate-600 group-hover:text-amber-600">
              Testimony
            </span>
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
            <Link
              to="/sermons"
              className="mt-5 md:mt-0 flex items-center text-slate-700
                font-bold border-b-2 border-brand-200 hover:border-brand-600
                transition-all pb-1 uppercase text-[11px] tracking-[0.2em]"
            >
              Explore Archive <ArrowRight className="w-3 h-3 ml-2" />
            </Link>
          </AnimatedDiv>

          {latestSermons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {latestSermons.map((sermon, i) => (
                <AnimatedDiv key={sermon.id} delay={i * 120} direction="up">
                  <Link to={`/sermons/${sermon.id}`} className="group block">
                    <div className="relative aspect-4/5 overflow-hidden
                      rounded-sm mb-5">
                      {sermon.imageUrl ? (
                        <img
                          src={sermon.imageUrl}
                          alt={sermon.title}
                          className="w-full h-full object-cover grayscale-30
                            group-hover:grayscale-0 transition-all duration-700
                            group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex
                          items-center justify-center">
                          <Play className="w-10 h-10 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t
                        from-slate-900/60 via-transparent to-transparent" />
                      <div className="absolute bottom-5 left-5">
                        <span className="px-2.5 py-1 bg-white/10 backdrop-blur-md
                          border border-white/20 text-white text-[10px] uppercase
                          tracking-widest rounded-full">
                          {formatDate(sermon.sermonDate)}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-serif font-semibold text-slate-900
                      mb-1.5 group-hover:text-brand-600 transition-colors
                      leading-snug">
                      {sermon.title}
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed uppercase
                      tracking-wider italic">
                      {sermon.series}
                    </p>
                  </Link>
                </AnimatedDiv>
              ))}
            </div>
          ) : (
            <AnimatedDiv className="text-center py-16 border-2 border-dashed
              border-slate-200 rounded-2xl">
              <Play className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-serif italic">
                Messages coming soon. Check back later.
              </p>
            </AnimatedDiv>
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
            src={dadandmum}
            className="w-full h-full object-cover opacity-40 scale-110 blur-sm"
            alt="Atmosphere"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900
            via-slate-900/40 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <AnimatedDiv direction="left" delay={200}>
            <div className="max-w-2xl">
              <p className="text-[10px] font-black text-brand-400 uppercase
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
                <Link
                  to="/sermons"
                  className="px-6 py-3.5 bg-white text-slate-900 font-bold
                    uppercase tracking-widest text-[11px]
                    hover:bg-brand-600 hover:text-white transition-all
                    shadow-xl whitespace-nowrap"
                >
                  Watch Our Story
                </Link>
                <button
                  onClick={() => navigate('/prayer-request')}
                  className="px-6 py-3.5 bg-fuchsia-600 text-white font-bold
                    uppercase tracking-widest text-[11px]
                    hover:bg-fuchsia-500 transition-all shadow-xl
                    flex items-center gap-2 whitespace-nowrap"
                >
                  <HandHeart className="w-3.5 h-3.5" />
                  Prayer Request
                </button>
                <button
                  onClick={() => setShowTestimonyModal(true)}
                  className="px-6 py-3.5 bg-amber-500 text-white font-bold
                    uppercase tracking-widest text-[11px]
                    hover:bg-amber-400 transition-all shadow-xl
                    flex items-center gap-2 whitespace-nowrap"
                >
                  <Star className="w-3.5 h-3.5" />
                  Share Testimony
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
              <div className="relative z-10 rounded-lg overflow-hidden
                shadow-2xl aspect-3/4">
                <img
                  src={dadandmum}
                  alt="Leadership"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white
                p-4 shadow-xl hidden md:block z-20 rounded-lg">
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
                  "Faith activates God — Fear activates the Enemy."
                </blockquote>
                <p className="text-slate-600 text-base leading-relaxed">
                  Inspired by a commitment to spiritual growth and community,
                  Global Flame Ministries provides a sanctuary for those seeking
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
                  Global Flame Ministries was founded and continues to stand.
                </p>
              </div>
              <Link
                to="/core-beliefs"
                className="mt-6 md:mt-0 flex items-center gap-2 text-slate-700
                  font-bold border-b-2 border-fuchsia-200 hover:border-fuchsia-600
                  transition-all pb-1 uppercase text-[11px] tracking-[0.2em] shrink-0"
              >
                View All Beliefs <ArrowRight className="w-3 h-3" />
              </Link>
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
              Join Our Global Community
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

      <TestimonyModal
        isOpen={showTestimonyModal}
        onClose={() => setShowTestimonyModal(false)}
      />
    </div>
  );
};

export default Home;