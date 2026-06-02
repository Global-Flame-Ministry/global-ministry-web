import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Globe, Mail,
  Clock, ArrowRight, Loader, Bell
} from 'lucide-react';
import { eventApi } from '../../api/eventApi';
import { announcementApi } from '../../api/announcementApi';
import type { EventDto, AnnouncementDto } from '../../types';
import { useAuth } from '../../context/useAuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import SEO from '../../components/SEO';

// ─── EVENT STATUS HELPERS ─────────────────────────────────────────────────────
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

const formatShort = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

// ─── YOUTH EVENT CARD ─────────────────────────────────────────────────────────
const YouthEventCard: React.FC<{
  event: EventDto;
  onRegister: (e: EventDto) => void;
}> = ({ event, onRegister }) => {
  const status = getEventStatus(event);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden
      hover:shadow-lg transition-all duration-300 group">
      {event.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105
              transition-transform duration-500"
          />
          <span className={`absolute top-3 right-3 text-[10px] font-black
            uppercase tracking-widest px-2.5 py-1 rounded-full
            ${statusBadge(status)}`}>
            {status}
          </span>
        </div>
      )}
      <div className="p-6">
        {!event.imageUrl && (
          <span className={`text-[10px] font-black uppercase tracking-widest
            px-2.5 py-1 rounded-full inline-block mb-3 ${statusBadge(status)}`}>
            {status}
          </span>
        )}
        <h4 className="text-lg font-bold text-slate-900 mb-2
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
            <Calendar className="w-3.5 h-3.5 text-fuchsia-400" />
            {formatDate(event.startDate)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-fuchsia-400" />
            {event.location}
          </div>
        </div>
        {event.acceptsRegistrations && !event.isCancelled && (
          <button
            onClick={() => onRegister(event)}
            className="mt-4 w-full py-2.5 text-[10px] font-black uppercase
              tracking-widest bg-slate-900 text-white rounded-xl
              hover:bg-fuchsia-600 transition-colors"
          >
            Register
          </button>
        )}
        {event.isCancelled && (
          <span className="mt-4 inline-block text-[10px] font-black uppercase
            tracking-widest px-3 py-1 bg-red-100 text-red-600 rounded-full">
            Cancelled
          </span>
        )}
      </div>
    </div>
  );
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
const YouthPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents]             = useState<EventDto[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
  const [isLoadingEvents, setIsLoadingEvents]       = useState(true);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [activeTab, setActiveTab]       = useState<'upcoming' | 'ongoing' | 'past'>('upcoming');
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
  const [regForm, setRegForm]           = useState({ fullName: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guard — redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/youth' } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const res = await eventApi.getAll({ module: 'Youth', pageSize: 50 });
        if (res.data.isSuccess && res.data.data) {
          setEvents(res.data.data.items);
        }
      } catch {
        if (import.meta.env.DEV) console.error('Failed to fetch youth events');
      } finally {
        setIsLoadingEvents(false);
      }
    };

    const fetchAnnouncements = async () => {
      setIsLoadingAnnouncements(true);
      try {
        const res = await announcementApi.getYouthAll({ pageSize: 3 });
        if (res.data.isSuccess && res.data.data) {
          setAnnouncements(res.data.data.items);
        }
      } catch {
        if (import.meta.env.DEV) console.error('Failed to fetch youth announcements');
      } finally {
        setIsLoadingAnnouncements(false);
      }
    };

    fetchEvents();
    fetchAnnouncements();
  }, []);

  const upcomingEvents = events.filter(e => getEventStatus(e) === 'upcoming');
  const ongoingEvents  = events.filter(e => getEventStatus(e) === 'ongoing');
  const pastEvents     = events.filter(e => getEventStatus(e) === 'past');

  const tabEvents = {
    upcoming: upcomingEvents,
    ongoing:  ongoingEvents,
    past:     pastEvents,
  }[activeTab];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setIsSubmitting(true);
    try {
      const response = await api.post(
        `/api/ministry/events/${selectedEvent.id}/register`,
        {
          fullName: regForm.fullName,
          email: regForm.email,
          phoneNumber: regForm.phone || null,
        }
      );
      if (response.data.isSuccess) {
        toast.success(`Registered! Check ${regForm.email} for your confirmation.`);
        setSelectedEvent(null);
        setRegForm({ fullName: '', email: '', phone: '' });
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO title="GFM Youth" description="Global Flame Ministry Youth — events, announcements, and community for young believers." url="https://globalflameministry.org/youth" />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="relative h-[65vh] flex items-end overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900
          to-purple-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80
          via-black/30 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 w-full">
          <Link
            to="/ministries"
            className="inline-flex items-center gap-2 text-white/70
              hover:text-white transition-colors text-xs font-bold uppercase
              tracking-widest mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1
              transition-transform" />
            All Ministries
          </Link>

          <div>
            <p className="text-fuchsia-400 text-[10px] font-black uppercase
              tracking-[0.4em] mb-3">
              Global Flame Ministry
            </p>
            <h1 className="text-5xl md:text-7xl font-serif text-white font-bold
              leading-tight mb-4">
              Youth Community
            </h1>
            <p className="text-white/70 text-lg font-light max-w-xl">
              House of Opera — A community of young people on fire for God.
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* ── LEFT — Events ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">

            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                About This Ministry
              </h2>
              <p className="text-slate-600 leading-relaxed">
                House of Opera is the youth community of Global Flame Ministries,
                raising a generation of young people who are passionate about
                God's kingdom, excellence in their calling, and transformation
                in their communities.
              </p>
            </div>

            {/* Events section */}
            <div className="pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif font-bold text-slate-900">
                  Events
                </h2>
                <Link
                  to="/events"
                  className="flex items-center gap-1 text-[10px] font-black
                    uppercase tracking-widest text-fuchsia-600
                    hover:text-fuchsia-800 transition-colors"
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
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase
                      tracking-widest transition-colors ${
                        activeTab === tab.key
                          ? 'bg-white text-fuchsia-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {isLoadingEvents ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="animate-spin text-fuchsia-600 w-6 h-6" />
                </div>
              ) : tabEvents.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed
                  border-slate-200 rounded-2xl">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400 font-serif italic">
                    No {activeTab} youth events right now.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tabEvents.map(event => (
                    <YouthEventCard
                      key={event.id}
                      event={event}
                      onRegister={setSelectedEvent}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ─────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Ministry info */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest
                text-slate-500 mb-4">
                Ministry Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-fuchsia-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase
                      tracking-wider">
                      Events
                    </p>
                    <p className="text-sm font-semibold text-slate-900">
                      {upcomingEvents.length} upcoming ·{' '}
                      {ongoingEvents.length} ongoing
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-fuchsia-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase
                      tracking-wider">
                      Contact
                    </p>
                    
                      <a href="mailto:globalflameministries@gmail.com"
                      className="text-sm text-fuchsia-600 hover:text-fuchsia-800
                        transition-colors"
                    >
                      globalflameyouthcommunity@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Announcements preview */}
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-widest
                  text-slate-500">
                  Announcements
                </h3>
                <Link
                  to="/youth/announcements"
                  className="text-[10px] font-black uppercase tracking-widest
                    text-fuchsia-600 hover:text-fuchsia-800 transition-colors
                    flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {isLoadingAnnouncements ? (
                <div className="flex items-center justify-center py-6">
                  <Loader className="animate-spin text-fuchsia-600 w-5 h-5" />
                </div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-6">
                  <Bell className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs font-serif italic">
                    No announcements yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map(a => (
                    <div key={a.id}
                      className="border-b border-slate-200 pb-4 last:border-0
                        last:pb-0">
                      <span className="text-[10px] font-black uppercase
                        tracking-widest text-fuchsia-600 block mb-1">
                        {a.category || 'General'}
                      </span>
                      <p className="text-sm font-bold text-slate-900 mb-1
                        line-clamp-1">
                        {a.title}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {formatShort(a.createdOn)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Get Involved CTA */}
            <div className="bg-gradient-to-br from-fuchsia-600 to-purple-700
              rounded-2xl p-6 text-white">
              <Globe className="w-8 h-8 mb-4 text-fuchsia-200" />
              <h3 className="font-serif text-xl font-bold mb-2">Get Involved</h3>
              <p className="text-fuchsia-100 text-sm leading-relaxed mb-5">
                Join the Youth Community and be part of something greater.
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

            {/* All Ministries link */}
            <div className="border border-slate-100 rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest
                text-slate-500 mb-4">
                All Ministries
              </h3>
              <Link
                to="/ministries"
                className="flex items-center gap-2 text-sm font-bold
                  text-fuchsia-600 hover:text-fuchsia-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                View all ministries
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── REGISTRATION MODAL ───────────────────────────────────── */}
      
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="relative bg-white w-full max-w-lg overflow-hidden
            shadow-2xl">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <ArrowRight className="w-6 h-6 rotate-45" />
            </button>
            <div className="p-8 md:p-12">
              <h2 className="text-fuchsia-600 uppercase tracking-widest text-xs
                font-bold mb-2">
                Registration
              </h2>
              <h3 className="text-2xl md:text-3xl font-serif mb-2">
                {selectedEvent.title}
              </h3>
              <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(selectedEvent.startDate)} — {selectedEvent.location}
              </p>
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider
                    font-bold text-gray-500 mb-2">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={regForm.fullName}
                    onChange={e => setRegForm({ ...regForm, fullName: e.target.value })}
                    className="w-full border-b border-gray-300 py-2
                      focus:border-fuchsia-600 outline-none transition-colors
                      font-light text-lg"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider
                    font-bold text-gray-500 mb-2">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    value={regForm.email}
                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full border-b border-gray-300 py-2
                      focus:border-fuchsia-600 outline-none transition-colors
                      font-light text-lg"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider
                    font-bold text-gray-500 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={regForm.phone}
                    onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full border-b border-gray-300 py-2
                      focus:border-fuchsia-600 outline-none transition-colors
                      font-light text-lg"
                    placeholder="+234..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-8 bg-gray-900 text-white py-4 font-bold
                    uppercase tracking-widest hover:bg-fuchsia-600
                    disabled:bg-gray-400 transition-all"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Registration'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouthPage;