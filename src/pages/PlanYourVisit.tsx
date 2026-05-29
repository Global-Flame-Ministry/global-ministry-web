import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { ArrowLeft, Clock, MapPin, Phone, ChevronDown, CheckCircle2 } from 'lucide-react';
import auditorium from '../assets/auditoruimout.jpg';
import insideAuditorium from '../assets/insideAuditorium.jpg';
import Reuben from '../assets/Reuben.jpg';
import dddPreaching from '../assets/Daddy-dpreaching.jpg';

// ── Service Schedule Data ─────────────────────────────────────────────────────
const services = [
  {
    id: 'tuesday',
    day: 'Tuesday',
    name: 'Power Service',
    time: '3:00 PM',
    description: 'A powerful midweek service filled with worship, the Word, and the tangible presence of God.',
    color: 'from-purple-600 to-fuchsia-600',
    accent: 'text-fuchsia-600',
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
  },
  {
    id: 'saturday-glory',
    day: 'Saturday',
    name: 'Morning Glory',
    time: '6:30 AM – 8:00 AM',
    description: 'Start your Saturday in the presence of God. Worship, intercession, and the fire of the Holy Spirit.',
    color: 'from-amber-500 to-orange-500',
    accent: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  {
    id: 'saturday-discipleship',
    day: 'Saturday',
    name: 'Discipleship Class',
    time: '8:00 AM',
    description: 'Immediately after Morning Glory — a structured teaching session for intentional growth in the Word.',
    color: 'from-sky-500 to-blue-600',
    accent: 'text-sky-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
  },
  {
    id: 'thursday',
    day: 'Thursday',
    name: 'Counselling Session',
    time: '10:00 AM',
    description: 'One-on-one and group counselling sessions with our pastoral team. Come as you are.',
    color: 'from-emerald-500 to-teal-600',
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
];

// ── Gallery Images ────────────────────────────────────────────────────────────
const galleryImages = [
  { src: auditorium, label: 'Main Auditorium' },
  { src: Reuben, label: 'Worship' },
  { src: dddPreaching, label: 'The Word' },
];

// ── Types ─────────────────────────────────────────────────────────────────────
type LocationType = 'inside' | 'outside' | null;

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  serviceId: string;
  needsBus: string;
  message: string;
}

// ── Main Component ────────────────────────────────────────────────────────────
const PlanYourVisit: React.FC = () => {
  const [locationType, setLocationType] = useState<LocationType>(null);
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    location: '',
    serviceId: '',
    needsBus: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ locationType, ...form });
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    setLocationType(null);
    setForm({ fullName: '', phone: '', email: '', location: '', serviceId: '', needsBus: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Plan Your Visit – Global Flame Ministry"
        description="Plan your visit to Global Flame Ministry. Learn about our services, location, and how we can welcome you."
        url="https://globalflameministry.org/plan-your-visit"
      />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="relative min-h-[60vh] md:min-h-[70vh] flex items-end overflow-hidden">
        <img
          src={insideAuditorium}
          alt="Global Flame Ministry Auditorium"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/20" />

        {/* Back nav */}
        <div className="absolute top-28 left-6 z-20">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/20 text-white/80 font-bold uppercase tracking-widest text-xs hover:border-fuchsia-400 hover:text-fuchsia-400 transition-all duration-200 rounded-lg cursor-pointer bg-black/20 backdrop-blur-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>

        {/* Hero text */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-16 w-full">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-fuchsia-400 mb-3">
            We're Expecting You
          </p>
          <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight mb-4">
            Plan Your <span className="italic text-fuchsia-300">Visit</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-lg leading-relaxed">
            Whether you're just around the corner or travelling from afar —
            we want to make your first visit feel like coming home.
          </p>

          {/* Scroll cue */}
          <div className="mt-8 flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest animate-bounce">
            <ChevronDown className="w-4 h-4" /> Scroll to plan
          </div>
        </div>
      </div>

      {/* ── SERVICE SCHEDULE ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
              What's On
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-slate-900">
              Our Weekly <span className="italic text-fuchsia-600">Services</span>
            </h2>
            <p className="text-slate-400 text-sm mt-3 max-w-lg">
              Choose the service you'd like to attend when you submit your visit plan below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s) => (
              <div
                key={s.id}
                className={`rounded-2xl border ${s.border} ${s.bg} p-6 hover:shadow-md transition-all duration-300`}
              >
                <div className={`inline-block text-[9px] font-black uppercase tracking-[0.3em] ${s.accent} mb-4`}>
                  {s.day}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1 leading-snug">
                  {s.name}
                </h3>
                <div className={`flex items-center gap-1.5 ${s.accent} text-xs font-bold mb-3`}>
                  <Clock className="w-3 h-3" />
                  {s.time}
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCATION SELECTOR + FORM ──────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-10 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
              Let's Get You Ready
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-slate-900 mb-3">
              Tell Us Where You're Coming From
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Select your location so we can prepare the best experience for you.
            </p>
          </div>

          {/* Step 1 — Location selector */}
          {!submitted && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setLocationType('inside')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all duration-200
                    ${locationType === 'inside'
                      ? 'border-fuchsia-500 bg-fuchsia-50 shadow-md shadow-fuchsia-100'
                      : 'border-slate-200 bg-white hover:border-fuchsia-300 hover:bg-fuchsia-50/40'
                    }`}
                >
                  <span className="text-2xl mb-3 block">📍</span>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Inside Jos, Plateau State</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    I'm based in Jos and will make my own way to the sanctuary.
                  </p>
                </button>

                <button
                  onClick={() => setLocationType('outside')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all duration-200
                    ${locationType === 'outside'
                      ? 'border-fuchsia-500 bg-fuchsia-50 shadow-md shadow-fuchsia-100'
                      : 'border-slate-200 bg-white hover:border-fuchsia-300 hover:bg-fuchsia-50/40'
                    }`}
                >
                  <span className="text-2xl mb-3 block">🚌</span>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Outside Jos / Another State</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    I'm travelling in.
                  </p>
                </button>
              </div>

              {/* Step 2 — Form (appears after location selected) */}
              {locationType && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8
                  animate-[fadeIn_0.4s_ease-out]">

                  <h3 className="font-serif text-xl text-slate-900 mb-6">
                    {locationType === 'inside'
                      ? 'Great! Fill in your details below.'
                      : "Travelling in? Let us know — we'll help arrange logistics."}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Name + Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                          Full Name *
                        </label>
                        <input
                          name="fullName"
                          required
                          value={form.fullName}
                          onChange={handleChange}
                          placeholder="e.g. Amara Johnson"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                            text-slate-800 text-sm focus:ring-2 focus:ring-fuchsia-400 focus:bg-white outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                          Phone Number *
                        </label>
                        <input
                          name="phone"
                          required
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+234 800 000 0000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                            text-slate-800 text-sm focus:ring-2 focus:ring-fuchsia-400 focus:bg-white outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                        Email Address
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                          text-slate-800 text-sm focus:ring-2 focus:ring-fuchsia-400 focus:bg-white outline-none transition-all"
                      />
                    </div>

                    {/* Location detail */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                        {locationType === 'inside' ? 'Your Area / Neighbourhood *' : 'Your City / State & Pickup Address *'}
                      </label>
                      <input
                        name="location"
                        required
                        value={form.location}
                        onChange={handleChange}
                        placeholder={
                          locationType === 'inside'
                            ? 'e.g. Rayfield, Jos'
                            : 'e.g. Abuja — Area 11. Nearest landmark: Shoprite'
                        }
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                          text-slate-800 text-sm focus:ring-2 focus:ring-fuchsia-400 focus:bg-white outline-none transition-all"
                      />
                    </div>

                    {/* Service selector */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                        Which Service Would You Like to Attend? *
                      </label>
                      <select
                        name="serviceId"
                        required
                        value={form.serviceId}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                          text-slate-800 text-sm focus:ring-2 focus:ring-fuchsia-400 focus:bg-white outline-none transition-all appearance-none"
                      >
                        <option value="">-- Select a service --</option>
                        <option value="tuesday">Tuesday – Atmosphere of Divine Presence (3:00 PM)</option>
                        <option value="saturday-glory">Saturday – Morning Glory (6:30 AM)</option>
                        <option value="saturday-discipleship">Saturday – Discipleship Class (8:00 AM)</option>
                        <option value="thursday">Thursday – Counselling Session (10:00 AM)</option>
                      </select>
                    </div>

                    {/* Bus transport */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                        {locationType === 'outside'
                          ? 'Do You Need Ministry Bus Transport? *'
                          : 'Do You Need a Pickup Within Jos? *'}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {locationType === 'outside'
                          ? ['Yes, please arrange transport', 'No, I will self-drive'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, needsBus: opt }))}
                                className={`py-3 px-4 text-xs font-semibold rounded-xl border transition-all text-left
                                  ${form.needsBus === opt
                                    ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                              >
                                {opt}
                              </button>
                            ))
                          : ['Yes, please pick me up', 'No, I will make my own way'].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, needsBus: opt }))}
                                className={`py-3 px-4 text-xs font-semibold rounded-xl border transition-all text-left
                                  ${form.needsBus === opt
                                    ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                  }`}
                              >
                                {opt}
                              </button>
                            ))}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                        Anything Else We Should Know?
                      </label>
                      <textarea
                        name="message"
                        rows={3}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Special needs, questions, prayer requests..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3
                          text-slate-800 text-sm focus:ring-2 focus:ring-fuchsia-400 focus:bg-white outline-none transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black
                        uppercase tracking-widest text-[11px] rounded-xl shadow-lg shadow-fuchsia-200
                        transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      Submit My Visit Plan
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

          {/* Success State */}
          {submitted && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center
              animate-[fadeIn_0.4s_ease-out]">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-serif text-2xl text-slate-900 mb-2">We're Expecting You!</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                Your visit details have been received. Our team will be in touch shortly
                to confirm and help you prepare for a wonderful experience.
              </p>
              <button
                onClick={resetForm}
                className="text-fuchsia-600 font-bold text-xs uppercase tracking-widest
                  border-b border-fuchsia-300 hover:border-fuchsia-600 transition-all pb-0.5"
              >
                Submit Another Plan
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── LOCATION INFO ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
                Find Us
              </p>
              <h2 className="font-serif text-3xl text-slate-900 mb-6">
                We're Located in <span className="italic text-fuchsia-600">Jos, Nigeria</span>
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-fuchsia-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-fuchsia-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Sanctuary Address</p>
                    <p className="text-slate-500 text-sm">Zarmaganda, Diye, Off Rayfield Road, Jos, Plateau State, Nigeria</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-fuchsia-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-fuchsia-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Contact Us</p>
                    <p className="text-slate-500 text-sm">info@globalflameministry.org</p>
                    <p className="text-slate-500 text-sm mt-1">(+234) 813 816 3685</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-fuchsia-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-fuchsia-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Office Hours</p>
                    <p className="text-slate-500 text-sm">Monday – Friday, 9:00 AM – 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-2 gap-3">
              {galleryImages.map((img, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-xl shadow-sm bg-black
                    ${i === 0 ? 'col-span-2 h-40 sm:h-48' : 'h-28 sm:h-36'}`}
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    className={`w-full h-full object-cover hover:scale-105 transition-transform duration-500${i === 2 ? ' object-top' : ''}`}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">
                      {img.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default PlanYourVisit;