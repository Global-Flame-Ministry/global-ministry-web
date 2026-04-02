import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, X, Calendar, MapPin, Heart } from 'lucide-react';
import { eventApi } from '../api/eventApi';
import type { EventDto } from '../types';
import toast from 'react-hot-toast';

/* ── Scroll animation hook ─────────────────────────────────────────── */
const useReveal = (delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // ✅ Set initial invisible state INSIDE the hook, not as JSX inline style
    el.style.opacity = '0';
    el.style.transform = 'translateY(32px)';
    el.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
};

/* ── Event Card ────────────────────────────────────────────────────── */
const EventCard: React.FC<{
  event: EventDto;
  badge?: string;
  index?: number;
  onRegister: (e: EventDto) => void;
  onDonate: (e: EventDto) => void;
  formatDate: (d: string) => string;
}> = ({ event, badge, index = 0, onRegister, onDonate, formatDate }) => {
  const ref = useReveal(index * 80);

  return (
    <div
      ref={ref}
      className="group flex flex-col md:flex-row items-center gap-8 md:gap-16 border-b border-gray-100 pb-16 last:border-0"
    >
      <div className="w-full md:w-1/2 aspect-video overflow-hidden bg-gray-100">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <Calendar className="w-16 h-16 text-slate-300" />
          </div>
        )}
      </div>

      <div className="w-full md:w-1/2">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {badge && (
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
              badge === 'Happening Now'
                ? 'bg-green-100 text-green-700'
                : 'bg-fuchsia-100 text-fuchsia-700'
            }`}>
              {badge}
            </span>
          )}
          <span className="text-fuchsia-600 font-bold text-sm uppercase tracking-widest">
            {event.module}
          </span>
          <span className="h-px w-8 bg-gray-300" />
          <span className="text-gray-500 text-sm flex items-center gap-1">
            <Calendar className="w-3 h-3" /> {formatDate(event.startDate)}
          </span>
        </div>

        <h3 className="text-3xl md:text-4xl font-serif font-medium text-gray-900 mb-2">
          {event.title}
        </h3>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4" /> {event.location}
        </div>
        {event.description && (
          <p className="text-gray-600 leading-relaxed mb-8 text-lg font-light text-justify">
            {event.description}
          </p>
        )}

        {!event.isCancelled && (
          <div className="flex flex-wrap gap-3">
            {event.acceptsRegistrations && (
              <button
                onClick={() => onRegister(event)}
                className="group/btn inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-fuchsia-600 transition-all duration-300"
              >
                Register Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            )}
            {event.acceptsDonations && (
              <button
                onClick={() => onDonate(event)}
                className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300"
              >
                <Heart className="w-4 h-4" />
                {event.donationLabel ?? 'Give Towards This Event'}
              </button>
            )}
          </div>
        )}

        {event.isCancelled && (
          <span className="inline-block bg-red-100 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            Cancelled
          </span>
        )}
      </div>
    </div>
  );
};

/* ── Main Events Page ──────────────────────────────────────────────── */
const Events: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<EventDto[]>([]);
  const [ongoingEvents,  setOngoingEvents]  = useState<EventDto[]>([]);
  const [pastEvents,     setPastEvents]     = useState<EventDto[]>([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [selectedEvent,  setSelectedEvent]  = useState<EventDto | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateEvent,    setDonateEvent]    = useState<EventDto | null>(null);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [showAllPast,    setShowAllPast]    = useState(false);

  const rHero     = useReveal(0);
  const rOngoing  = useReveal(0);
  const rUpcoming = useReveal(0);
  const rPast     = useReveal(0);

  const [regForm, setRegForm] = useState({ fullName: '', email: '', phone: '' });
  const [donationForm, setDonationForm] = useState({
    donorName: '', donorEmail: '', amount: '', currency: 'NGN'
  });

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [upRes, onRes, paRes] = await Promise.allSettled([
          eventApi.getUpcoming({ pageSize: 20 }),
          eventApi.getOngoing({ pageSize: 20 }),
          eventApi.getPast({ pageSize: 20 }),
        ]);
        if (upRes.status === 'fulfilled' && upRes.value.data.isSuccess && upRes.value.data.data)
          setUpcomingEvents(upRes.value.data.data.items);
        if (onRes.status === 'fulfilled' && onRes.value.data.isSuccess && onRes.value.data.data)
          setOngoingEvents(onRes.value.data.data.items);
        if (paRes.status === 'fulfilled' && paRes.value.data.isSuccess && paRes.value.data.data)
          setPastEvents(paRes.value.data.data.items);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `http://localhost:5020/api/ministry/events/${selectedEvent.id}/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: regForm.fullName,
            email: regForm.email,
            phoneNumber: regForm.phone || null
          })
        }
      );
      const data = await response.json();
      if (data.isSuccess) {
        toast.success(`Registered! Check ${regForm.email} for your confirmation email. 📧`);
        setSelectedEvent(null);
        setRegForm({ fullName: '', email: '', phone: '' });
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initiateDonation = async (method: 'paystack' | 'flutterwave') => {
    if (!donateEvent) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5020/api/ministry/donations/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: donationForm.donorName,
          donorEmail: donationForm.donorEmail,
          amount: parseFloat(donationForm.amount),
          currency: donationForm.currency,
          paymentMethod: method === 'paystack' ? 'Paystack' : 'Flutterwave',
          donationType: 'Event',
          eventId: donateEvent.id,
          eventTitle: donateEvent.title
        })
      });
      const data = await res.json();
      if (data.isSuccess && data.data?.paymentUrl) {
        window.location.href = data.data.paymentUrl;
      } else {
        toast.error('Failed to initialize payment');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDonate = (event: EventDto) => {
    setDonateEvent(event);
    setShowDonateModal(true);
  };

  return (
    <div className="bg-white relative">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] py-24 md:py-32">
        <div ref={rHero} className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-fuchsia-500 uppercase tracking-[0.3em] text-sm font-bold mb-4">
            Our Community
          </h2>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 tracking-tight">
            Events
          </h1>
          <div className="w-20 h-1 bg-fuchsia-500 mx-auto" />
        </div>
      </div>

      {/* ── ONGOING ──────────────────────────────────────────────────── */}
      {!isLoading && ongoingEvents.length > 0 && (
        <div className="bg-green-50 border-b border-green-100">
          <div ref={rOngoing} className="max-w-6xl mx-auto px-6 py-16">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <h2 className="text-2xl font-serif font-medium text-gray-900">Happening Now</h2>
            </div>
            <div className="flex flex-col gap-16">
              {ongoingEvents.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  badge="Happening Now"
                  index={i}
                  onRegister={setSelectedEvent}
                  onDonate={handleDonate}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── UPCOMING ─────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div ref={rUpcoming}>
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-12 flex items-center gap-3">
            <Calendar className="w-6 h-6 text-fuchsia-600" />
            Upcoming Events
          </h2>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-16">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse flex flex-col md:flex-row gap-8 pb-16 border-b border-gray-100">
                <div className="w-full md:w-1/2 aspect-video bg-gray-200 rounded" />
                <div className="w-full md:w-1/2 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-8 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && upcomingEvents.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-serif text-gray-400 mb-2">No Upcoming Events</h3>
            <p className="text-gray-400">Check back soon for new events.</p>
          </div>
        )}

        {!isLoading && upcomingEvents.length > 0 && (
          <div className="flex flex-col gap-16">
            {upcomingEvents.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                badge="Upcoming"
                index={i}
                onRegister={setSelectedEvent}
                onDonate={handleDonate}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── PAST EVENTS ──────────────────────────────────────────────── */}
      {!isLoading && pastEvents.length > 0 && (
        <div className="bg-slate-50 py-24">
          <div ref={rPast} className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16">
              <div>
                <h2 className="text-fuchsia-600 uppercase tracking-[0.3em] text-sm font-bold mb-3">
                  Archive
                </h2>
                <h3 className="text-3xl md:text-4xl font-serif font-medium text-gray-900">
                  Past Events
                </h3>
                <p className="text-gray-500 mt-2 text-justify">
                  A look back at what God has done through our community.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(showAllPast ? pastEvents : pastEvents.slice(0, 3)).map((event, i) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group animate-fadeUp"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                >
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-fuchsia-600 text-xs font-bold uppercase tracking-widest">
                      {event.module}
                    </span>
                    <h4 className="text-xl font-serif font-medium text-gray-900 mt-2 mb-2">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <Calendar className="w-4 h-4" /> {formatDate(event.startDate)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <MapPin className="w-4 h-4" /> {event.location}
                    </div>
                    {event.isCancelled && (
                      <span className="inline-block mt-3 bg-red-100 text-red-600 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        Was Cancelled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pastEvents.length > 3 && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setShowAllPast(!showAllPast)}
                  className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all"
                >
                  {showAllPast ? 'Show Less' : `View All Past Events (${pastEvents.length})`}
                  <ArrowRight className={`w-4 h-4 transition-transform ${showAllPast ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── REGISTRATION MODAL ───────────────────────────────────────── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-white w-full max-w-lg overflow-hidden shadow-2xl">
            <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <X className="w-6 h-6" />
            </button>
            <div className="p-8 md:p-12">
              <h2 className="text-fuchsia-600 uppercase tracking-widest text-xs font-bold mb-2">Registration</h2>
              <h3 className="text-2xl md:text-3xl font-serif mb-2">{selectedEvent.title}</h3>
              <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(selectedEvent.startDate)} — {selectedEvent.location}
              </p>
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Full Name</label>
                  <input required type="text" value={regForm.fullName}
                    onChange={e => setRegForm({ ...regForm, fullName: e.target.value })}
                    className="w-full border-b border-gray-300 py-2 focus:border-fuchsia-600 outline-none transition-colors font-light text-lg"
                    placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Email Address</label>
                  <input required type="email" value={regForm.email}
                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full border-b border-gray-300 py-2 focus:border-fuchsia-600 outline-none transition-colors font-light text-lg"
                    placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Phone Number (Optional)</label>
                  <input type="tel" value={regForm.phone}
                    onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full border-b border-gray-300 py-2 focus:border-fuchsia-600 outline-none transition-colors font-light text-lg"
                    placeholder="+234..." />
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full mt-8 bg-gray-900 text-white py-4 font-bold uppercase tracking-widest hover:bg-fuchsia-600 disabled:bg-gray-400 transition-all">
                  {isSubmitting ? 'Processing...' : 'Confirm Registration'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── DONATION MODAL ───────────────────────────────────────────── */}
      {showDonateModal && donateEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowDonateModal(false)} />
          <div className="relative bg-white w-full max-w-lg overflow-hidden shadow-2xl">
            <button onClick={() => setShowDonateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <X className="w-6 h-6" />
            </button>
            <div className="p-8 md:p-12">
              <h2 className="text-fuchsia-600 uppercase tracking-widest text-xs font-bold mb-2">Give</h2>
              <h3 className="text-2xl md:text-3xl font-serif mb-2">
                {donateEvent.donationLabel ?? `Give Towards ${donateEvent.title}`}
              </h3>
              <p className="text-gray-500 text-sm mb-6">Your generosity makes this possible. Thank you! 🙏</p>
              <form onSubmit={e => { e.preventDefault(); initiateDonation('paystack'); }} className="space-y-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Your Name</label>
                  <input required type="text" value={donationForm.donorName}
                    onChange={e => setDonationForm({ ...donationForm, donorName: e.target.value })}
                    className="w-full border-b border-gray-300 py-2 focus:border-fuchsia-600 outline-none font-light text-lg"
                    placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Email Address</label>
                  <input required type="email" value={donationForm.donorEmail}
                    onChange={e => setDonationForm({ ...donationForm, donorEmail: e.target.value })}
                    className="w-full border-b border-gray-300 py-2 focus:border-fuchsia-600 outline-none font-light text-lg"
                    placeholder="john@example.com" />
                </div>
                <div className="flex gap-3">
                  <div className="w-1/3">
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Currency</label>
                    <select value={donationForm.currency}
                      onChange={e => setDonationForm({ ...donationForm, currency: e.target.value })}
                      className="w-full border-b border-gray-300 py-2 focus:border-fuchsia-600 outline-none bg-white font-light text-lg">
                      <option value="NGN">NGN ₦</option>
                      <option value="USD">USD $</option>
                      <option value="GBP">GBP £</option>
                      <option value="EUR">EUR €</option>
                      <option value="CAD">CAD $</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Amount</label>
                    <input required type="number" min="100" value={donationForm.amount}
                      onChange={e => setDonationForm({ ...donationForm, amount: e.target.value })}
                      className="w-full border-b border-gray-300 py-2 focus:border-fuchsia-600 outline-none font-light text-lg"
                      placeholder="5000" />
                  </div>
                </div>
                <div className="pt-4 space-y-3">
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold text-center">Choose Payment Method</p>
                  <button type="submit" disabled={isSubmitting}
                    className="w-full bg-[#0BA4DB] text-white py-4 font-bold uppercase tracking-widest hover:bg-[#0891C2] disabled:opacity-50 transition-all">
                    {isSubmitting ? 'Processing...' : '💳 Pay with Paystack'}
                  </button>
                  <button type="button" disabled={isSubmitting} onClick={() => initiateDonation('flutterwave')}
                    className="w-full bg-[#F5A623] text-white py-4 font-bold uppercase tracking-widest hover:bg-[#E09410] disabled:opacity-50 transition-all">
                    🌍 Pay with Flutterwave (International)
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;