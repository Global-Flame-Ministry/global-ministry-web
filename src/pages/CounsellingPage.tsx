import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Phone, Mail, MessageSquare, ChevronDown, Check, Loader, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { counsellingApi } from '../api/counsellingApi';
import { useAuth } from '../context/useAuthContext';

const TOPICS = [
  'Marriage & Relationships',
  'Grief & Loss',
  'Spiritual Growth',
  'Family Issues',
  'Mental & Emotional Health',
  'Career & Purpose',
  'Financial Challenges',
  'Addiction & Recovery',
  'Other',
];

const CounsellingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [form, setForm] = useState({
    fullName: isAuthenticated && user
      ? `${user.firstName} ${user.lastName}`.trim()
      : '',
    email: isAuthenticated && user ? (user.email ?? '') : '',
    phoneNumber: '',
    topic: '',
    message: '',
    preferredContact: 'Email' as 'Email' | 'Phone',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);

  // FIXED: Added the missing < after React.ChangeEvent
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.fullName.trim()) { toast.error('Full name is required'); return; }
    if (!form.email.trim())    { toast.error('Email is required');     return; }
    if (!form.topic)           { toast.error('Please select a topic'); return; }
    if (form.message.trim().length < 20) {
      toast.error('Please write at least 20 characters in your message');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await counsellingApi.submit({
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber || undefined,
        topic: form.topic,
        message: form.message,
        preferredContact: form.preferredContact,
      });
      if (res.data.isSuccess) {
        setSubmitted(true);
      } else {
        toast.error(res.data.message || 'Submission failed');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
          Request Received
        </h2>
        <p className="text-slate-500 max-w-md leading-relaxed mb-8">
          Thank you for reaching out. A member of our pastoral team will contact
          you within 48 hours. All matters are handled with complete
          confidentiality.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3 bg-slate-900
            text-white text-xs font-black uppercase tracking-widest
            hover:bg-fuchsia-600 transition-all"
        >
          Return Home
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14
            bg-fuchsia-500/10 rounded-full mb-6">
            <Heart className="w-7 h-7 text-fuchsia-400" />
          </div>
          <h2 className="text-fuchsia-400 text-[20px] font-black uppercase
            tracking-[0.4em] mb-4">
            Pastoral Care
          </h2>
          <h1 className="text-5xl md:text-6xl font-serif text-white font-bold
            mb-6 leading-tight">
            Counselling
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
            Your request is received with care and taken before God by our
            prayer team. Everything shared here is fully confidential.
          </p>
          <div className="mt-8">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/20 text-white/80 font-bold uppercase tracking-widest text-xs hover:border-fuchsia-400 hover:text-fuchsia-400 transition-all duration-200 rounded-lg cursor-pointer bg-black/20 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        </div>
      </div>

      {/* ── FORM ─────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-20">

        {/* Trust signals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: <MessageSquare className="w-5 h-5 text-fuchsia-500" />,
              title: 'Confidential',
              desc: 'Everything shared is treated with complete confidentiality.'
            },
            {
              icon: <Heart className="w-5 h-5 text-fuchsia-500" />,
              title: 'Compassionate',
              desc: 'Our pastors approach every situation with grace and care.'
            },
            {
              icon: <Phone className="w-5 h-5 text-fuchsia-500" />,
              title: 'Follow-Up',
              desc: 'We will contact you within 48 hours of your submission.'
            },
          ].map(item => (
            <div key={item.title}
              className="text-center p-6 border border-slate-100 rounded-2xl">
              <div className="w-10 h-10 bg-fuchsia-50 rounded-full flex items-center
                justify-center mx-auto mb-3">
                {item.icon}
              </div>
              <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest
                text-slate-500 mb-2">
                Full Name *
              </label>
              <input
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full border-b-2 border-slate-200 py-3 text-base
                  font-light text-slate-900 outline-none
                  focus:border-fuchsia-600 transition-colors bg-transparent
                  placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest
                text-slate-500 mb-2">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full border-b-2 border-slate-200 py-3 text-base
                  font-light text-slate-900 outline-none
                  focus:border-fuchsia-600 transition-colors bg-transparent
                  placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Phone + Preferred Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest
                text-slate-500 mb-2">
                Phone Number (Optional)
              </label>
              <input
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={handleChange}
                placeholder="+234..."
                className="w-full border-b-2 border-slate-200 py-3 text-base
                  font-light text-slate-900 outline-none
                  focus:border-fuchsia-600 transition-colors bg-transparent
                  placeholder:text-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest
                text-slate-500 mb-2">
                Preferred Contact Method *
              </label>
              <div className="flex gap-4 mt-3">
                {(['Email', 'Phone'] as const).map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setForm(p => ({
                      ...p, preferredContact: method
                    }))}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full
                      border-2 text-xs font-black uppercase tracking-widest
                      transition-all ${
                        form.preferredContact === method
                          ? 'border-fuchsia-600 bg-fuchsia-600 text-white'
                          : 'border-slate-200 text-slate-500 hover:border-fuchsia-300'
                      }`}
                  >
                    {method === 'Email'
                      ? <Mail className="w-3.5 h-3.5" />
                      : <Phone className="w-3.5 h-3.5" />
                    }
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest
              text-slate-500 mb-2">
              Topic *
            </label>
            <div className="relative">
              <select
                name="topic"
                required
                value={form.topic}
                onChange={handleChange}
                className="w-full border-b-2 border-slate-200 py-3 text-base
                  font-light text-slate-900 outline-none
                  focus:border-fuchsia-600 transition-colors bg-transparent
                  appearance-none cursor-pointer pr-8"
              >
                <option value="">Select a topic...</option>
                {TOPICS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2
                w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-black uppercase tracking-widest
              text-slate-500 mb-2">
              Your Message *
            </label>
            <textarea
              name="message"
              required
              rows={6}
              value={form.message}
              onChange={handleChange}
              placeholder="Share what's on your heart. Everything you share will be kept in confidence..."
              className="w-full border-2 border-slate-200 rounded-2xl px-5 py-4
                text-base font-light text-slate-900 outline-none
                focus:border-fuchsia-600 transition-colors resize-none
                placeholder:text-slate-300"
            />
            <p className="text-xs text-slate-400 mt-2">
              {form.message.length} characters (minimum 20)
            </p>
          </div>

          {/* Privacy note */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-700">Confidentiality Notice:</strong>{' '}
              All information shared through this form is strictly confidential
              and will only be accessed by our pastoral counselling team.
              We are committed to your privacy and wellbeing.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-slate-900 text-white font-black uppercase
              tracking-widest text-sm hover:bg-fuchsia-600 transition-all
              disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting
              ? <><Loader className="w-4 h-4 animate-spin" /> Submitting...</>
              : 'Submit Counselling Request'
            }
          </button>
        </form>
      </div>
    </div>
  );
};

export default CounsellingPage;