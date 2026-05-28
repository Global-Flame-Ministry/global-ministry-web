import React, { useState, useRef, useEffect } from 'react';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, X, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { eventApi } from '../api/eventApi';
import type { EventDto } from '../types';
import toast from 'react-hot-toast';

const useReveal = (delay = 0) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);
  return ref;
};

const Events: React.FC = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateEvent, setDonateEvent] = useState<EventDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllPast, setShowAllPast] = useState(false);
  const [regForm, setRegForm] = useState({ fullName: '', email: '', phone: '' });
  const [donationForm, setDonationForm] = useState({
    donorName: '', donorEmail: '', amount: '', currency: 'NGN'
  });

  const { data: upcomingEvents = [], isLoading: isLoadingUpcoming } = useQuery({
    queryKey: ['upcomingEvents'],
    queryFn: () => eventApi.getUpcoming({ pageSize: 20 }).then(res => res.data.data?.items ?? []),
  });

  const { data: ongoingEvents = [] } = useQuery({
    queryKey: ['ongoingEvents'],
    queryFn: () => eventApi.getOngoing({ pageSize: 20 }).then(res => res.data.data?.items ?? []),
  });

  const { data: pastEvents = [], isLoading: isLoadingPast } = useQuery({
    queryKey: ['pastEvents'],
    queryFn: () => eventApi.getPast({ pageSize: 20 }).then(res => res.data.data?.items ?? []),
  });

  const isLoading = isLoadingUpcoming || isLoadingPast;

  const rHero = useReveal();
  const rOngoing = useReveal();
  const rUpcoming = useReveal();
  const rPast = useReveal();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

// ── EVENT CARD ────────────────────────────────────────────────────────────────
const EventCard: React.FC<{
  event: EventDto;
  badge: string;
  index: number;
  onRegister: (event: EventDto | null) => void;
  onDonate: (event: EventDto) => void;
  formatDate: (dateString: string) => string;
  isOngoing: boolean;
}> = ({ event, badge, index, onRegister, onDonate, formatDate, isOngoing: _isOngoing }) => {
  const rCard = useReveal(index * 100);
  return (
    <div id={`event-${event.id}`} ref={rCard} style={{
      opacity: 0,
      transform: 'translateY(32px)',
      transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
    }} className="flex flex-col md:flex-row gap-8 pb-16 border-b border-gray-100 last:border-b-0">
      <div className="w-full md:w-1/2 overflow-hidden rounded-xl bg-gray-100">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title}
            className="w-full aspect-video object-cover" />
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-fuchsia-100 to-purple-100
            flex items-center justify-center">
            <Calendar className="w-12 h-12 text-fuchsia-300" />
          </div>
        )}
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center">
        <span className="text-fuchsia-600 text-xs font-bold uppercase tracking-widest mb-3">
          {badge}
        </span>
        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">{event.title}</h3>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <Calendar className="w-4 h-4 text-fuchsia-500" />
          {formatDate(event.startDate)}
        </div>
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
          <MapPin className="w-4 h-4 text-fuchsia-500" />
          {event.location}
        </div>
        <span className="text-fuchsia-600 text-xs font-bold uppercase tracking-widest mb-3">
          {event.module}
        </span>
        {event.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
            {event.description}
          </p>
        )}
        <div className="flex gap-3">
          <button onClick={() => onRegister(event)}
            className="px-6 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest
              rounded-lg hover:bg-fuchsia-600 transition-all">
            Register
          </button>
          {event.acceptsDonations && (
            <button onClick={() => onDonate(event)}
              className="px-6 py-2.5 border-2 border-fuchsia-200 text-fuchsia-600 text-xs font-bold
                uppercase tracking-widest rounded-lg hover:bg-fuchsia-50 transition-all">
              Donate
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!regForm.fullName.trim()) { toast.error('Full name is required'); return; }
    if (!regForm.email.trim())    { toast.error('Email is required');     return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ministry/events/${selectedEvent.id}/register`,
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
        toast.success(`Registered! Check ${regForm.email} for your confirmation.`);
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
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ministry/donations/${method}`,
        {
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
        }
      );
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
      <SEO
        title="Events & Gatherings"
        description="Upcoming events, conferences, and gatherings at Global Flame Ministry. Join us for worship and community."
        url="https://globalflameministry.org/events"
      />

      {/* ── HERO ── */}
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
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/20 text-white/80 font-bold uppercase tracking-widest text-xs hover:border-fuchsia-400 hover:text-fuchsia-400 transition-all duration-200 rounded-lg cursor-pointer bg-black/20 backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      {/* ── ONGOING ── */}
      {!isLoading && ongoingEvents.length > 0 && (
        <div className="bg-green-50 border-b border-green-100">
          <div ref={rOngoing} className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <div className="flex items-center gap-3 mb-10 sm:mb-12">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <h2 className="text-2xl font-serif font-medium text-gray-900">Happening Now</h2>
            </div>
            <div className="flex flex-col gap-12 sm:gap-16">
              {ongoingEvents.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  badge="Happening Now"
                  index={i}
                  onRegister={setSelectedEvent}
                  onDonate={handleDonate}
                  formatDate={formatDate}
                  isOngoing={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── UPCOMING ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div ref={rUpcoming}>
          <h2 className="text-2xl font-serif font-medium text-gray-900 mb-10 sm:mb-12
            flex items-center gap-3">
            <Calendar className="w-6 h-6 text-fuchsia-600" />
            Upcoming Events
          </h2>
        </div>

        {isLoadingUpcoming && (
          <div className="flex flex-col gap-16">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse flex flex-col md:flex-row
                gap-8 pb-16 border-b border-gray-100">
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

        {!isLoadingUpcoming && upcomingEvents.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-2xl">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-serif text-gray-400 mb-2">No Upcoming Events</h3>
            <p className="text-gray-400">Check back soon for new events.</p>
          </div>
        )}

        {!isLoadingUpcoming && upcomingEvents.length > 0 && (
          <div className="flex flex-col gap-12 sm:gap-16">
            {upcomingEvents.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                badge="Upcoming"
                index={i}
                onRegister={setSelectedEvent}
                onDonate={handleDonate}
                formatDate={formatDate}
                isOngoing={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── PAST EVENTS ── */}
      {!isLoadingPast && pastEvents.length > 0 && (
        <div className="bg-slate-50 py-16 sm:py-24">
          <div ref={rPast} className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 sm:mb-16">
              <div>
                <h2 className="text-fuchsia-600 uppercase tracking-[0.3em] text-sm font-bold mb-3">
                  Archive
                </h2>
                <h3 className="text-3xl md:text-4xl font-serif font-medium text-gray-900">
                  Past Events
                </h3>
                <p className="text-gray-500 mt-2">
                  A look back at what God has done through our community.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {(showAllPast ? pastEvents : pastEvents.slice(0, 3)).map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm
                    border border-gray-100 group"
                >
                  <div className="h-52 sm:h-56 overflow-hidden bg-gray-100">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover object-center grayscale
                          group-hover:grayscale-0 transition-all duration-500
                          group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 sm:p-6">
                    <span className="text-fuchsia-600 text-xs font-bold uppercase tracking-widest">
                      {event.module}
                    </span>
                    <h4 className="text-lg sm:text-xl font-serif font-medium text-gray-900 mt-2 mb-2">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(event.startDate)}
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <MapPin className="w-4 h-4" /> {event.location}
                    </div>
                    {event.isCancelled && (
                      <span className="inline-block mt-3 bg-red-100 text-red-600
                        text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        Was Cancelled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {pastEvents.length > 3 && (
              <div className="text-center mt-10 sm:mt-12">
                <button
                  onClick={() => setShowAllPast(!showAllPast)}
                  className="inline-flex items-center gap-2 border-2
                    border-gray-900 text-gray-900 px-8 py-3 text-sm font-bold
                    uppercase tracking-widest hover:bg-gray-900
                    hover:text-white transition-all"
                >
                  {showAllPast
                    ? 'Show Less'
                    : `View All Past Events (${pastEvents.length})`
                  }
                  <ArrowRight className={`w-4 h-4 transition-transform
                    ${showAllPast ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── REGISTRATION MODAL ── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl
            overflow-hidden shadow-2xl">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 sm:p-7">
              <h2 className="text-fuchsia-600 uppercase tracking-widest text-[10px] font-bold mb-1">
                Registration
              </h2>
              <h3 className="text-xl font-serif font-bold mb-1 pr-6">{selectedEvent.title}</h3>
              <p className="text-gray-400 text-xs mb-5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(selectedEvent.startDate)} · {selectedEvent.location}
              </p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider
                    font-bold text-gray-400 mb-1.5">Full Name</label>
                  <input
                    required type="text" value={regForm.fullName}
                    onChange={e => setRegForm({ ...regForm, fullName: e.target.value })}
                    className="w-full border-b border-gray-200 py-2
                      focus:border-fuchsia-600 outline-none transition-colors text-base"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider
                    font-bold text-gray-400 mb-1.5">Email Address</label>
                  <input
                    required type="email" value={regForm.email}
                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full border-b border-gray-200 py-2
                      focus:border-fuchsia-600 outline-none transition-colors text-base"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider
                    font-bold text-gray-400 mb-1.5">Phone (Optional)</label>
                  <input
                    type="tel" value={regForm.phone}
                    onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                    className="w-full border-b border-gray-200 py-2
                      focus:border-fuchsia-600 outline-none transition-colors text-base"
                    placeholder="+234..."
                  />
                </div>
                <button
                  type="submit" disabled={isSubmitting}
                  className="w-full mt-2 bg-gray-900 text-white py-3 font-bold
                    uppercase tracking-widest text-xs hover:bg-fuchsia-600
                    disabled:bg-gray-300 transition-all rounded-xl"
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Registration'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── DONATION MODAL ── */}
      {showDonateModal && donateEvent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowDonateModal(false)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl
            overflow-hidden shadow-2xl">
            <button
              onClick={() => setShowDonateModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-5 sm:p-6">
              <h2 className="text-fuchsia-600 uppercase tracking-widest text-[10px] font-bold mb-1">Give</h2>
              <h3 className="text-lg font-serif font-bold mb-1 pr-6 leading-tight">
                {donateEvent.donationLabel ?? `Give Towards ${donateEvent.title}`}
              </h3>
              <p className="text-gray-400 text-xs mb-4">
                Your generosity makes this possible. Thank you for supporting our mission!
              </p>

              <form
                onSubmit={e => { e.preventDefault(); initiateDonation('paystack'); }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[10px] uppercase tracking-wider
                    font-bold text-gray-400 mb-1">Your Name</label>
                  <input
                    required type="text" value={donationForm.donorName}
                    onChange={e => setDonationForm({ ...donationForm, donorName: e.target.value })}
                    className="w-full border-b border-gray-200 py-1.5
                      focus:border-fuchsia-600 outline-none text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider
                    font-bold text-gray-400 mb-1">Email</label>
                  <input
                    required type="email" value={donationForm.donorEmail}
                    onChange={e => setDonationForm({ ...donationForm, donorEmail: e.target.value })}
                    className="w-full border-b border-gray-200 py-1.5
                      focus:border-fuchsia-600 outline-none text-sm"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="w-2/5">
                    <label className="block text-[10px] uppercase tracking-wider
                      font-bold text-gray-400 mb-1">Currency</label>
                    <select
                      value={donationForm.currency}
                      onChange={e => setDonationForm({ ...donationForm, currency: e.target.value })}
                      className="w-full border-b border-gray-200 py-1.5
                        focus:border-fuchsia-600 outline-none bg-white text-sm"
                    >
                      <option value="NGN">NGN ₦</option>
                      <option value="USD">USD $</option>
                      <option value="GBP">GBP £</option>
                      <option value="EUR">EUR €</option>
                      <option value="CAD">CAD $</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase tracking-wider
                      font-bold text-gray-400 mb-1">Amount</label>
                    <input
                      required type="number" min="100" value={donationForm.amount}
                      onChange={e => setDonationForm({ ...donationForm, amount: e.target.value })}
                      className="w-full border-b border-gray-200 py-1.5
                        focus:border-fuchsia-600 outline-none text-sm"
                      placeholder="5000"
                    />
                  </div>
                </div>
                <div className="pt-3 space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400
                    font-bold text-center mb-2">Payment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="submit" disabled={isSubmitting}
                      className="flex items-center justify-center gap-1.5
                        bg-[#0BA4DB] hover:bg-[#0891C2] text-white py-2.5
                        rounded-xl text-[10px] font-black uppercase tracking-wider
                        disabled:opacity-50 transition-all"
                    >
                      Paystack
                    </button>
                    <button
                      type="button" disabled={isSubmitting}
                      onClick={() => initiateDonation('flutterwave')}
                      className="flex items-center justify-center gap-1.5
                        bg-[#F5A623] hover:bg-[#E09410] text-white py-2.5
                        rounded-xl text-[10px] font-black uppercase tracking-wider
                        disabled:opacity-50 transition-all"
                    >
                      Flutterwave
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-400 text-center">
                    Flutterwave for international payments
                  </p>
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
