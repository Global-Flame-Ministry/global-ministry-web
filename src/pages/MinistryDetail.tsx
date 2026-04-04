import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Loader, Users, Calendar, MapPin,
  Globe, Mail, Heart, Clock, ArrowRight
} from 'lucide-react';
import { ministryApi } from '../api/ministryApi';
import type { MinistryResponseDto, EventDto } from '../types';

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
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className={`absolute top-3 right-3 text-[10px] font-black uppercase
            tracking-widest px-2.5 py-1 rounded-full ${statusBadge(status)}`}>
            {status}
          </span>
        </div>
      )}
      <div className="p-6">
        {!event.imageUrl && (
          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1
            rounded-full inline-block mb-3 ${statusBadge(status)}`}>
            {status}
          </span>
        )}
        <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-fuchsia-600
          transition-colors">
          {event.title}
        </h4>
        {event.description && (
          <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
            {event.description}
          </p>
        )}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-fuchsia-400" />
            {formatDate(event.startDate)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-fuchsia-400" />
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
                className="flex items-center justify-center gap-1 px-3 py-2 text-[10px]
                  font-black uppercase tracking-widest border border-fuchsia-200
                  text-fuchsia-600 rounded-lg hover:bg-fuchsia-50 transition-colors"
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

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const MinistryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [ministry, setMinistry]       = useState<MinistryResponseDto | null>(null);
  const [events, setEvents]           = useState<EventDto[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [activeTab, setActiveTab]     = useState<'upcoming' | 'ongoing' | 'past'>('upcoming');

  useEffect(() => {
    if (!slug) return;

    const fetchMinistry = async () => {
      try {
        setIsLoading(true);
        const res = await ministryApi.getBySlug(slug);
        if (res.data.isSuccess && res.data.data) {
          setMinistry(res.data.data);
        } else {
          setError('Ministry not found.');
        }
      } catch {
        setError('Could not load this ministry.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const res = await ministryApi.getMinistryEvents(slug, { pageSize: 50 });
        if (res.data.isSuccess && res.data.data) {
          setEvents(res.data.data.items);
        }
      } catch {
        // silent — events are supplementary
      } finally {
        setEventsLoading(false);
      }
    };

    fetchMinistry();
    fetchEvents();
  }, [slug]);

  // Split events by status
  const upcomingEvents = events.filter(e => getEventStatus(e) === 'upcoming');
  const ongoingEvents  = events.filter(e => getEventStatus(e) === 'ongoing');
  const pastEvents     = events.filter(e => getEventStatus(e) === 'past');

  const tabEvents = {
    upcoming: upcomingEvents,
    ongoing:  ongoingEvents,
    past:     pastEvents,
  }[activeTab];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-fuchsia-600 w-8 h-8" />
      </div>
    );
  }

  if (error || !ministry) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <p className="text-slate-500 text-lg mb-4">{error || 'Ministry not found.'}</p>
        <Link
          to="/ministries"
          className="flex items-center gap-2 text-fuchsia-600 font-bold uppercase
            tracking-widest text-xs hover:text-fuchsia-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Ministries
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div className="relative h-[65vh] flex items-end overflow-hidden bg-slate-900">
        {ministry.coverImageUrl ? (
          <img
            src={ministry.coverImageUrl}
            alt={ministry.name}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900 to-purple-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 w-full">
          <Link
            to="/ministries"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white
              transition-colors text-xs font-bold uppercase tracking-widest mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Ministries
          </Link>

          <div className="flex items-end justify-between flex-wrap gap-6">
            <div>
              <p className="text-fuchsia-400 text-[10px] font-black uppercase
                tracking-[0.4em] mb-3">
                Global Flame Ministry
              </p>
              <h1 className="text-5xl md:text-7xl font-serif text-white font-bold
                leading-tight mb-4">
                {ministry.name}
              </h1>
              <p className="text-white/70 text-lg font-light max-w-xl">
                {ministry.shortDescription}
              </p>
            </div>

            {/* Leader badge */}
            {ministry.leaderName && (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm
                border border-white/20 rounded-2xl px-5 py-3">
                {ministry.leaderImageUrl && (
                  <img
                    src={ministry.leaderImageUrl}
                    alt={ministry.leaderName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
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

      {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left — Description */}
          <div className="lg:col-span-2 space-y-8">
            {ministry.description && (
              <div>
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">
                  About This Ministry
                </h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line text-justify">
                    {ministry.description}
                  </p>
                </div>
              </div>
            )}

            {/* ── EVENTS SECTION ──────────────────────────────────── */}
            <div className="pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                  Events
                </h2>
                <Link
                  to="/events"
                  className="flex items-center gap-1 text-[10px] font-black uppercase
                    tracking-widest text-fuchsia-600 hover:text-fuchsia-800 transition-colors"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-8">
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
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest
                      transition-colors ${
                      activeTab === tab.key
                        ? 'bg-white text-fuchsia-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {eventsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin text-fuchsia-600 w-6 h-6" />
                </div>
              ) : tabEvents.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200
                  rounded-2xl">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-serif italic">
                    No {activeTab} events for this ministry.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tabEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Sidebar info */}
          <div className="space-y-6">

            {/* Quick stats */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
                Ministry Info
              </h3>
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

            {/* CTA */}
            <div className="bg-gradient-to-br from-fuchsia-600 to-purple-700 rounded-2xl p-6 text-white">
              <Globe className="w-8 h-8 mb-4 text-fuchsia-200" />
              <h3 className="font-serif text-xl font-bold mb-2">
                Get Involved
              </h3>
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

            {/* Other ministries */}
            <div className="border border-slate-100 rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
                All Ministries
              </h3>
              <Link
                to="/ministries"
                className="flex items-center gap-2 text-sm font-bold text-fuchsia-600
                  hover:text-fuchsia-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                View all ministries
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinistryDetail;