import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import {
  ArrowLeft, Loader, Users, Calendar, MapPin,
  Globe, Mail, Heart, Clock, ArrowRight,
  Sparkles, Lock, ChevronRight, Image as ImageIcon,
} from 'lucide-react';
import { ministryApi } from '../api/ministryApi';
import type { EventDto } from '../types';
import { useAuth } from '../context/useAuthContext';

// The slug must match exactly what the admin entered in the dashboard.
// If they ever rename the ministry, update this constant.
const HOUSE_OF_OPERA_SLUG = 'house-of-opera';
const ROYAL_PRIESTHOOD_SLUG = 'royal-priesthood';

// ─── EVENT STATUS HELPERS ──────────────────────────────────────────────────────

const getEventStatus = (event: EventDto): 'upcoming' | 'ongoing' | 'past' => {
  const now   = new Date();
  const start = new Date(event.startDate);
  const end   = new Date(event.endDate);
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'ongoing';
  return 'past';
};

const statusBadge = (status: 'upcoming' | 'ongoing' | 'past') => {
  switch (status) {
    case 'upcoming': return 'bg-blue-100 text-blue-700';
    case 'ongoing':  return 'bg-emerald-100 text-emerald-700';
    case 'past':     return 'bg-slate-100 text-slate-500';
  }
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

// ─── EVENT CARD ────────────────────────────────────────────────────────────────

const EventCard: React.FC<{ event: EventDto }> = ({ event }) => {
  const status = getEventStatus(event);
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden
      hover:shadow-lg transition-all duration-300 group">
      {event.imageUrl && (
        <div className="relative h-44 sm:h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover object-top
              group-hover:scale-105 transition-transform duration-500"
          />
          <span className={`absolute top-3 right-3 text-[10px] font-black uppercase
            tracking-widest px-2.5 py-1 rounded-full ${statusBadge(status)}`}>
            {status}
          </span>
        </div>
      )}
      <div className="p-5 sm:p-6">
        {!event.imageUrl && (
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1
            rounded-full inline-block mb-3 ${statusBadge(status)}`}>
            {status}
          </span>
        )}
        <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-2
          group-hover:text-fuchsia-600 transition-colors">
          {event.title}
        </h4>
        {event.description && (
          <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
            {event.description}
          </p>
        )}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
            {formatDate(event.startDate)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-fuchsia-400 shrink-0" />
            {event.location}
          </div>
        </div>
        {(event.acceptsRegistrations || event.acceptsDonations) && (
          <div className="flex gap-2 mt-4">
            {event.acceptsRegistrations && (
              <Link
                to="/events"
                className="flex-1 text-center py-2 text-[10px] font-black uppercase
                  tracking-widest bg-slate-900 text-white rounded-lg
                  hover:bg-fuchsia-600 transition-colors"
              >
                Register
              </Link>
            )}
            {event.acceptsDonations && (
              <Link
                to="/give"
                className="flex items-center justify-center gap-1 px-3 py-2
                  text-[10px] font-black uppercase tracking-widest
                  border border-fuchsia-200 text-fuchsia-600 rounded-lg
                  hover:bg-fuchsia-50 transition-colors"
              >
                <Heart className="w-3 h-3" /> Give
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── YOUTH COMMUNITY GATEWAY ──────────────────────────────────────────────────

const YouthCommunityGateway: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleEnter = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/youth' } });
    } else {
      navigate('/youth');
    }
  };

  return (
    <div className="mt-12 pt-10 border-t border-slate-100">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-5 h-5 text-fuchsia-500" />
        <h2 className="text-2xl font-serif font-bold text-slate-900">
          Youth Community
        </h2>
        <span className="text-[9px] font-black uppercase tracking-widest
          px-2 py-1 bg-fuchsia-100 text-fuchsia-600 rounded-full">
          Members Only
        </span>
      </div>

      <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-lg">
        The Youth Community is the heartbeat of House Of Opera — a dedicated
        space for young people to connect, grow, and carry the mission forward.
        Dive into exclusive content, events, and community resources.
      </p>

      {isAuthenticated ? (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br
          from-fuchsia-600 via-purple-700 to-slate-900 p-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5
            rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-32 h-32 bg-fuchsia-400/10
            rounded-full translate-y-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start
            sm:items-center justify-between gap-6">
            <div>
              <p className="text-fuchsia-300 text-[10px] font-black uppercase
                tracking-[0.4em] mb-2">
                You're In
              </p>
              <h3 className="text-white font-serif text-2xl font-bold mb-1">
                Welcome to the Youth Community
              </h3>
              <p className="text-white/60 text-sm">
                Your access is ready. Step inside.
              </p>
            </div>
            <button
              onClick={handleEnter}
              className="shrink-0 flex items-center gap-2.5 px-8 py-4
                bg-white text-fuchsia-700 font-black uppercase tracking-widest
                text-[11px] rounded-full hover:bg-fuchsia-50 transition-all
                shadow-xl group"
            >
              Enter Community
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5
                transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-fuchsia-200
          bg-fuchsia-50/40 p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center
            justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-fuchsia-100 rounded-2xl flex items-center
                justify-center shrink-0">
                <Lock className="w-5 h-5 text-fuchsia-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">
                  Members-only space
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                  The Youth Community requires a GFM account. It only takes a
                  minute to register — then you'll have full access.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={handleEnter}
                className="flex items-center justify-center gap-2 px-6 py-3
                  bg-fuchsia-600 text-white font-black uppercase tracking-widest
                  text-[10px] rounded-full hover:bg-fuchsia-700 transition-all
                  shadow-md"
              >
                Login to Enter
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 px-6 py-3
                  border-2 border-fuchsia-300 text-fuchsia-700 font-black
                  uppercase tracking-widest text-[10px] rounded-full
                  hover:bg-fuchsia-100 transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const MinistryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: ministry, isLoading, error } = useQuery({
    queryKey: ['ministry', slug],
    queryFn: async () => {
      const res = await ministryApi.getBySlug(slug!);
      if (!res.data.isSuccess || !res.data.data) throw new Error(res.data.message || 'Ministry not found.');
      return res.data.data;
    },
    enabled: !!slug,
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['ministryEvents', slug],
    queryFn: () => ministryApi.getMinistryEvents(slug!, { pageSize: 50 })
      .then(res => res.data.data?.items ?? []),
    enabled: !!slug,
  });

  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'past'>('upcoming');

  const isHouseOfOpera = slug === HOUSE_OF_OPERA_SLUG;
  const isRoyalPriesthood = slug === ROYAL_PRIESTHOOD_SLUG;

  const upcomingEvents = events.filter(e => getEventStatus(e) === 'upcoming');
  const ongoingEvents  = events.filter(e => getEventStatus(e) === 'ongoing');
  const pastEvents     = events.filter(e => getEventStatus(e) === 'past');

  const tabEvents = {
    upcoming: upcomingEvents,
    ongoing:  ongoingEvents,
    past:     pastEvents,
  }[activeTab];

  // Inline layout builder for Royal Priesthood Gallery
  const renderRoyalPriesthoodGallery = () => {
    // Replace these template strings with your exact filenames located inside public/assets/images/ or src/assets/
    const images = [
      '/assets/images/royal-1.jpg',
      '/assets/images/royal-2.jpg',
      '/assets/images/royal-3.jpg',
      '/assets/images/royal-4.jpg'
    ];

    return (
      <div className="mt-12 pt-10 border-t border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <ImageIcon className="w-5 h-5 text-fuchsia-500" />
          <h2 className="text-2xl font-serif font-bold text-slate-900">
            Ministry Gallery
          </h2>
          <span className="text-[9px] font-black uppercase tracking-widest
            px-2 py-1 bg-fuchsia-100 text-fuchsia-600 rounded-full">
            Highlights
          </span>
        </div>

        <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-lg">
          Catch a glimpse of the Royal Priesthood assignments, dynamic fellowships, and moving worship snapshots.
        </p>

        {/* 4 Image Clean Responsive Matrix Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((src, index) => (
            <div 
              key={index} 
              className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 
                border border-slate-100 shadow-sm group hover:shadow-md transition-all duration-300"
            >
              <img
                src={src}
                alt={`Royal Priesthood Highlight ${index + 1}`}
                className="w-full h-full object-cover object-center 
                  group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // Fallback visual treatment if image path breaks/is empty
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?w=500";
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-fuchsia-600 w-8 h-8" />
      </div>
    );
  }

  if (error || !ministry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center
        text-center px-6">
        <p className="text-slate-500 text-lg mb-4">{error instanceof Error ? error.message : error || 'Ministry not found.'}</p>
        <Link
          to="/ministries"
          className="flex items-center gap-2 text-fuchsia-600 font-bold uppercase
            tracking-widest text-xs hover:text-fuchsia-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Departments
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={ministry.name}
        description={ministry.shortDescription}
        image={ministry.coverImageUrl || undefined}
        url={`https://globalflameministry.org/ministries/${ministry.slug}`}
      />

      {/* ── HERO ── */}
      <div className="relative min-h-[55vh] sm:min-h-[65vh] md:h-[70vh]
        flex items-end overflow-hidden bg-slate-900">

        {ministry.coverImageUrl ? (
          <img
            src={ministry.coverImageUrl}
            alt={ministry.name}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900 to-purple-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t
          from-black/85 via-black/40 to-black/10" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16 w-full">
          <Link
            to="/ministries"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white
              transition-colors text-xs font-bold uppercase tracking-widest mb-6 sm:mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Departments
          </Link>

          <div className="flex items-end justify-between flex-wrap gap-4 sm:gap-6">
            <div>
              <p className="text-fuchsia-400 text-[10px] font-black uppercase
                tracking-[0.4em] mb-2 sm:mb-3">
                Global Flame Ministry
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-white
                font-bold leading-tight mb-3 sm:mb-4">
                {ministry.name}
              </h1>
              <p className="text-white/70 text-base sm:text-lg font-light max-w-xl">
                {ministry.shortDescription}
              </p>
            </div>

            {ministry.leaderName && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm
                border border-white/20 rounded-2xl px-4 sm:px-5 py-3">
                {ministry.leaderImageUrl && (
                  <img
                    src={ministry.leaderImageUrl}
                    alt={ministry.leaderName}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover
                      object-top border-2 border-white/30"
                  />
                )}
                <div>
                  <p className="text-white font-bold text-sm">{ministry.leaderName}</p>
                  {ministry.leaderTitle && (
                    <p className="text-white/60 text-xs">{ministry.leaderTitle}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">

          {/* Left — Description + Events + Dynamic Gateways */}
          <div className="lg:col-span-2 space-y-8">
            {ministry.description && (
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">
                  About This Department
                </h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 text-lg leading-relaxed
                    whitespace-pre-line text-justify">
                    {ministry.description}
                  </p>
                </div>
              </div>
            )}

            {/* ── EVENTS SECTION ── */}
            <div className="pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-slate-900">Events</h2>
                <Link
                  to="/events"
                  className="flex items-center gap-1 text-[10px] font-black uppercase
                    tracking-widest text-fuchsia-600 hover:text-fuchsia-800 transition-colors"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6 sm:mb-8
                overflow-x-auto">
                {(
                  [
                    { key: 'upcoming', label: `Upcoming (${upcomingEvents.length})` },
                    { key: 'ongoing',  label: `Ongoing (${ongoingEvents.length})` },
                    { key: 'past',     label: `Past (${pastEvents.length})` },
                  ] as const
                ).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold uppercase
                      tracking-widest transition-colors whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-white text-fuchsia-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Event Content Conditional */}
              {eventsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin text-fuchsia-600 w-6 h-6" />
                </div>
              ) : tabEvents.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed
                  border-slate-200 rounded-2xl">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-serif italic">
                    No {activeTab} events for this department.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {tabEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>

            {/* ── CONDITIONAL GATEWAYS BY SLUG ── */}
            {isHouseOfOpera && <YouthCommunityGateway />}
            {isRoyalPriesthood && renderRoyalPriesthoodGallery()}
          </div>

          {/* Right — Sidebar */}
          <div className="space-y-5 sm:space-y-6">

            {/* Quick info */}
            <div className="bg-slate-50 rounded-2xl p-5 sm:p-6">
              <h3 className="text-xs font-black uppercase tracking-widest
                text-slate-500 mb-4">Department Info</h3>
              <div className="space-y-4">
                {ministry.leaderName && (
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-fuchsia-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Leader
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {ministry.leaderName}
                      </p>
                      {ministry.leaderTitle && (
                        <p className="text-xs text-slate-400">{ministry.leaderTitle}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-fuchsia-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Events
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {upcomingEvents.length} upcoming · {ongoingEvents.length} ongoing
                    </p>
                  </div>
                </div>
                {ministry.contactEmail && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-fuchsia-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Contact
                      </p>
                      <a
                        href={`mailto:${ministry.contactEmail}`}
                        className="text-sm text-fuchsia-600 hover:text-fuchsia-800
                          transition-colors break-all"
                      >
                        {ministry.contactEmail}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Youth Community sidebar teaser (House of Opera only) */}
            {isHouseOfOpera && (
              <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50
                border border-fuchsia-100 rounded-2xl p-5 sm:p-6">
                <Sparkles className="w-6 h-6 text-fuchsia-400 mb-3" />
                <h3 className="font-serif text-base font-bold text-slate-900 mb-2">
                  Youth Community
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  The members-only hub for young people in House Of Opera.
                  Login to access exclusive content and connect with the community.
                </p>
                <Link
                  to="/youth"
                  className="flex items-center justify-center gap-2 w-full py-2.5
                    bg-fuchsia-600 text-white rounded-xl text-[10px] font-black
                    uppercase tracking-widest hover:bg-fuchsia-700 transition-colors"
                >
                  Go to Youth Hub <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-br from-fuchsia-600 to-purple-700
              rounded-2xl p-5 sm:p-6 text-white">
              <Globe className="w-8 h-8 mb-4 text-fuchsia-200" />
              <h3 className="font-serif text-xl font-bold mb-2">Get Involved</h3>
              <p className="text-fuchsia-100 text-sm leading-relaxed mb-5">
                Become part of something greater. Join this ministry and help
                make a difference in our community.
              </p>
              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 w-full py-3
                  bg-white text-fuchsia-700 rounded-xl text-[10px] font-black
                  uppercase tracking-widest hover:bg-fuchsia-50 transition-colors"
              >
                Contact Us <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Other ministries link */}
            <div className="border border-slate-100 rounded-2xl p-5 sm:p-6">
              <h3 className="text-xs font-black uppercase tracking-widest
                text-slate-500 mb-4">All Departments</h3>
              <Link
                to="/ministries"
                className="flex items-center gap-2 text-sm font-bold text-fuchsia-600
                  hover:text-fuchsia-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                View all departments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinistryDetail;