import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Sparkles, ArrowRight, Users, X } from 'lucide-react';
import { eventApi } from '../../api/eventApi';
import type { EventDto } from '../../types';
import SEO from '../../components/SEO';

// ── MODAL ────────────────────────────────────────────────────────────────────
const EventModal = ({
  event, onClose,
}: { event: EventDto; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center
                  bg-gray-700/50 p-4"
    onClick={onClose}>
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl
                    max-h-[90vh] overflow-y-auto"
      onClick={e => e.stopPropagation()}>
      <div className="sticky top-0 bg-fuchsia-700 text-white p-5
                      flex justify-between items-center rounded-t-xl">
        <h2 className="text-xl font-bold">{event.title}</h2>
        <button onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 transition">
          <X className="w-6 h-6" />
        </button>
      </div>

      {event.imageUrl && (
        <img src={event.imageUrl} alt={event.title} loading="lazy"
          className="w-full h-64 object-cover" />
      )}

      <div className="p-6 space-y-5">
        {event.description && (
          <p className="text-gray-700 text-lg leading-relaxed">
            {event.description}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4 border-t border-b
                        border-gray-200 py-4">
          <div className="flex items-start">
            <Calendar className="w-5 h-5 mr-3 mt-1 text-fuchsia-600 shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900">Start</h4>
              <p className="text-gray-600">
                {new Date(event.startDate).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <Clock className="w-5 h-5 mr-3 mt-1 text-purple-600 shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900">End</h4>
              <p className="text-gray-600">
                {new Date(event.endDate).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-start col-span-2">
            <MapPin className="w-5 h-5 mr-3 mt-1 text-indigo-600 shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900">Location</h4>
              <p className="text-gray-600">{event.location}</p>
            </div>
          </div>
        </div>
        {event.isCancelled && (
          <p className="text-red-600 font-semibold text-center">
            ⚠️ This event has been cancelled.
          </p>
        )}
      </div>
    </div>
  </div>
);

// ── EVENT CARD ───────────────────────────────────────────────────────────────
const EventCard = ({
  event, onViewDetails,
}: { event: EventDto; onViewDetails: (e: EventDto) => void }) => {
  const isNew =
    new Date(event.createdOn).getTime() >
    Date.now() - 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col
                    hover:shadow-xl transition-shadow duration-300
                    transform hover:-translate-y-1 relative">
      {event.imageUrl ? (
        <img src={event.imageUrl} alt={event.title} loading="lazy"
          className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-fuchsia-100 flex items-center
                        justify-center">
          <Calendar className="w-12 h-12 text-fuchsia-400" />
        </div>
      )}

      {isNew && (
        <span className="absolute top-3 left-3 bg-fuchsia-600 text-white
                         text-xs font-bold px-3 py-1 rounded-full
                         flex items-center shadow-md">
          <Sparkles className="w-3 h-3 mr-1" /> New
        </span>
      )}
      {event.isCancelled && (
        <span className="absolute top-3 right-3 bg-red-500 text-white
                         text-xs font-bold px-3 py-1 rounded-full">
          Cancelled
        </span>
      )}

      <div className="p-6 flex flex-col grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
        {event.description && (
          <p className="text-gray-600 text-sm mb-4 grow line-clamp-2">
            {event.description}
          </p>
        )}
        <div className="space-y-2 text-gray-700 text-sm mb-4
                        border-t border-fuchsia-100 pt-4">
          <p className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-fuchsia-500" />
            {new Date(event.startDate).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </p>
          <p className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
            {event.location}
          </p>
        </div>
        <button onClick={() => onViewDetails(event)}
          className="inline-flex items-center justify-center mt-auto px-6 py-2
                     bg-fuchsia-700 text-white font-semibold rounded-lg
                     hover:bg-purple-800 transition-colors">
          View Details <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

// ── PAST EVENT CARD ──────────────────────────────────────────────────────────
const PastEventCard = ({ event }: { event: EventDto }) => (
  <div className="relative group overflow-hidden rounded-xl shadow-md
                  hover:shadow-xl transition-shadow duration-300">
    {event.imageUrl ? (
      <img src={event.imageUrl} alt={event.title} loading="lazy"
        className="w-full h-56 object-cover transform
                   group-hover:scale-105 transition-transform duration-300" />
    ) : (
      <div className="w-full h-56 bg-fuchsia-100 flex items-center justify-center">
        <Calendar className="w-10 h-10 text-fuchsia-400" />
      </div>
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-gray-900
                    via-gray-900/40 to-transparent opacity-0
                    group-hover:opacity-100 transition-opacity duration-300
                    flex items-end p-4">
      <div className="text-white">
        <h3 className="text-xl font-bold">{event.title}</h3>
        <p className="text-sm opacity-80">
          {new Date(event.startDate).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
      </div>
    </div>
  </div>
);

// ── SKELETON ─────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-200" />
    <div className="p-6 space-y-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

// ── MAIN PAGE ────────────────────────────────────────────────────────────────
const YouthEventsPage = () => {
  const [upcoming, setUpcoming] = useState<EventDto[]>([]);
  const [past, setPast] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Both calls in parallel
        const [upcomingRes, pastRes] = await Promise.all([
          eventApi.getAll({ module: 'Youth', upcomingOnly: true,
                            isCancelled: false, pageSize: 20 }),
          eventApi.getAll({ module: 'Youth', pageSize: 20 }),
        ]);
        setUpcoming(upcomingRes.data.data?.items ?? []);
        // Past = all events that are not upcoming
        const allEvents = pastRes.data.data?.items ?? [];
        const now = new Date();
        setPast(
          allEvents.filter(e => new Date(e.endDate) < now)
                   .slice(0, 6)
        );
      } catch {
        setError('Failed to load events. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <SEO title="Youth Events" description="Upcoming events and activities for the Global Flame Ministry Youth Community." url="https://globalflameministry.org/youth/events" />

      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-800 to-fuchsia-900
                          text-white py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            <span className="block text-fuchsia-300 text-lg uppercase
                             tracking-widest mb-2">
              Engage & Grow
            </span>
            Activities & Events
          </h1>
          <p className="text-lg md:text-xl font-light opacity-90 max-w-2xl mx-auto">
            From powerful retreats to impactful community service — there's
            always something happening to help you connect, learn, and lead.
          </p>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Calendar className="w-12 h-12 text-fuchsia-600 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Mark your calendars! Join us for these exciting upcoming gatherings.
            </p>
          </div>

          {error && (
            <p className="text-center text-red-500 mb-8">{error}</p>
          )}

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                No upcoming events at the moment. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {upcoming.map(event => (
                <EventCard key={event.id} event={event}
                  onViewDetails={setSelectedEvent} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Past Events */}
      {past.length > 0 && (
        <section className="py-20 px-6 bg-purple-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <Users className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-extrabold
                             text-gray-900 mb-4">
                Memories from Past Events
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                A glimpse into the joy, learning, and fellowship from our
                previous gatherings.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {past.map(event => (
                <PastEventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-fuchsia-800 text-white py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-white" />
          <h2 className="text-3xl font-bold mb-3">
            Be Part of the Next Big Thing!
          </h2>
          <p className="text-lg opacity-80 mb-6">
            Your presence makes a difference. Join us in our upcoming
            activities and experience growth and fellowship.
          </p>
          <a href="/youth/contact"
            className="inline-flex items-center justify-center px-8 py-3
                       bg-white text-fuchsia-700 rounded-full font-bold text-xl
                       hover:bg-fuchsia-100 transition-colors shadow-lg
                       transform hover:scale-105">
            Join Us
          </a>
        </div>
      </section>

      {/* Modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent}
          onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default YouthEventsPage;