import SEO from '../components/SEO';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, MapPin, Clock, Building2, Loader } from 'lucide-react';
import { eventApi } from '../api/eventApi';
import api from '../api/axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function EventDetails() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({ fullName: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: queryData, isLoading, error } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      const response = await eventApi.getBySlug(slug!);
      if (!response.data.isSuccess || !response.data.data)
        throw new Error(response.data.message || 'Event not found');
      return response.data.data;
    },
    enabled: !!slug,
  });

  const event = queryData ?? null;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });

  const getEventStatus = () => {
    if (!event) return '';
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    if (event.isCancelled) return 'Cancelled';
    if (now >= start && now <= end) return 'Happening Now';
    if (now < start) return 'Upcoming';
    return 'Past';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    if (!regForm.fullName.trim()) { toast.error('Full name is required'); return; }
    if (!regForm.email.trim()) { toast.error('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.post(
        `/api/ministry/events/${event.id}/register`,
        {
          fullName: regForm.fullName,
          email: regForm.email,
          phoneNumber: regForm.phone || null,
        }
      );
      if (response.data.isSuccess) {
        toast.success('Registered successfully! We look forward to seeing you.');
        setShowRegModal(false);
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

  if (error) {
    const errorMsg = error instanceof Error ? error.message : 'An error occurred';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-20">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-fuchsia-100 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-fuchsia-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorMsg === 'Event not found' ? 'Event Not Found' : 'Something went wrong'}
          </h1>
          <p className="text-gray-600 mb-6">
            {errorMsg === 'Event not found'
              ? "The event you're looking for doesn't exist or has been removed."
              : errorMsg}
          </p>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-xs hover:border-fuchsia-300 hover:text-fuchsia-600 transition-all duration-200 rounded-lg cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </button>
        </div>
      </div>
    );
  }

  const badgeColor = (status: string) => {
    if (status === 'Happening Now') return 'bg-green-100 text-green-700';
    if (status === 'Upcoming') return 'bg-blue-100 text-blue-700';
    if (status === 'Cancelled') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <SEO
        title={event?.title ?? 'Event Details'}
        description={event?.description || event?.title || 'Event at Global Flame Ministry'}
        image={event?.imageUrl || undefined}
        url={`https://globalflameministry.org/events/${event?.slug || slug}`}
      />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-xs hover:border-fuchsia-300 hover:text-fuchsia-600 transition-all duration-200 rounded-lg cursor-pointer mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-40">
            <Loader className="animate-spin text-fuchsia-600 w-8 h-8" />
          </div>
        ) : event ? (
          <article>
            {event.imageUrl && (
              <div className="w-full overflow-hidden mb-6">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-[300px] sm:h-[450px] object-cover rounded-xl"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${badgeColor(getEventStatus())}`}>
                {getEventStatus()}
              </span>
              <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-fuchsia-100 text-fuchsia-700">
                {event.module}
              </span>
              {event.ministryName && (
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {event.ministryName}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mt-2 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-fuchsia-500" />
                {formatDate(event.startDate)}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-fuchsia-500" />
                {formatTime(event.startDate)} — {formatTime(event.endDate)}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-fuchsia-500" />
                {event.location}
              </div>
            </div>

            {event.description && (
              <div className="prose prose-gray max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap text-justify">
                  {event.description}
                </p>
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-4">
              {event.acceptsRegistrations && getEventStatus() !== 'Past' && event.isCancelled !== true && (
                <button
                  onClick={() => setShowRegModal(true)}
                  className="px-8 py-3 bg-gray-900 text-white font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-fuchsia-600 transition-all"
                >
                  Register for Event
                </button>
              )}
              {event.acceptsDonations && (
                <Link
                  to={`/give?event=${event.id}`}
                  className="px-8 py-3 border-2 border-fuchsia-200 text-fuchsia-600 font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-fuchsia-50 transition-all"
                >
                  {event.donationLabel || 'Donate'}
                </Link>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 text-fuchsia-600 hover:text-fuchsia-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> View all events
              </Link>
            </div>
          </article>
        ) : null}
      </main>

      {showRegModal && event && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowRegModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Register</h3>
                <button onClick={() => setShowRegModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <ArrowLeft className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Sign up for <span className="font-semibold text-gray-900">{event.title}</span>
              </p>
              <form onSubmit={handleRegister} className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={regForm.fullName}
                  onChange={e => setRegForm(p => ({ ...p, fullName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={regForm.email}
                  onChange={e => setRegForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all"
                />
                <input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={regForm.phone}
                  onChange={e => setRegForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gray-900 text-white font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-fuchsia-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
