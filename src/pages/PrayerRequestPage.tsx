import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Loader2, HandHeart, Flame, Shield, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { prayerApi } from '../api/prayerApi';
import { useAuth } from '../context/AuthContext';

type Step = 'form' | 'success';

const PrayerRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [step, setStep]           = useState<Step>('form');
  const [content, setContent]     = useState('');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken]         = useState('');
  const [copied, setCopied]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 5) {
      toast.error('Please enter a valid prayer request.');
      return;
    }
    setIsLoading(true);
    try {
      const dto = {
        content: content.trim(),
        ...(!isAuthenticated && {
          name:  name.trim()  || undefined,
          email: email.trim() || undefined,
        }),
      };
      const res = await prayerApi.create(dto);
      if (res.data.isSuccess && res.data.data) {
        setToken(res.data.data.anonymousToken);
        setStep('success');
      } else {
        toast.error(res.data.message || 'Unable to submit request.');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success('ID copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO BAND ──────────────────────────────────────────────────── */}
      <div className="bg-[#09090b] pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px]
          bg-fuchsia-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80
          bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-fuchsia-400
              transition-colors text-sm font-medium mb-10 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Go back
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-fuchsia-600/20 border border-fuchsia-500/30
              rounded-2xl flex items-center justify-center">
              <HandHeart className="w-6 h-6 text-fuchsia-400" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] text-fuchsia-400">
              Prayer Request
            </p>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4 leading-tight">
            We believe <span className="italic text-fuchsia-400">with you.</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-lg">
            Every request you share is received with care and taken before God
            by our dedicated prayer team. You are not alone in this.
          </p>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center gap-6 mt-8">
            {[
              { icon: <Shield className="w-4 h-4 text-fuchsia-400" />, label: 'Fully confidential' },
              { icon: <Heart className="w-4 h-4 text-fuchsia-400" />,  label: 'Prayed over personally' },
              { icon: <Flame className="w-4 h-4 text-fuchsia-400" />,  label: 'Answered by faith' },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                {t.icon}
                {t.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FORM CARD ──────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-6 -mt-6 pb-24">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

          {step === 'form' && (
            <form onSubmit={handleSubmit}>

              {/* User identity block */}
              <div className="px-8 pt-8 pb-6 border-b border-slate-100">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-4 p-4 bg-fuchsia-50 border
                    border-fuchsia-100 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-fuchsia-600 text-white flex
                      items-center justify-center text-sm font-bold shrink-0">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-[9px] font-black uppercase tracking-widest
                        text-fuchsia-500 bg-fuchsia-100 px-2 py-1 rounded-full">
                        Verified member
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                      Your details — optional
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest
                          text-slate-500 block mb-1.5">Name</label>
                        <input
                          placeholder="Your name"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm
                            text-slate-800 placeholder-slate-300 focus:outline-none
                            focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100
                            transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest
                          text-slate-500 block mb-1.5">Email</label>
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm
                            text-slate-800 placeholder-slate-300 focus:outline-none
                            focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100
                            transition-all"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-fuchsia-400" />
                      You may submit anonymously. Your details will never be shared.
                    </p>
                  </div>
                )}
              </div>

              {/* Prayer content */}
              <div className="px-8 py-6">
                <label className="text-[10px] font-black uppercase tracking-widest
                  text-slate-500 block mb-3">
                  Your Prayer Request
                </label>
                <textarea
                  rows={7}
                  maxLength={2000}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Share what's on your heart. Be as open as you feel comfortable with — this is a safe place..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-4 text-sm
                    text-slate-800 placeholder-slate-300 focus:outline-none
                    focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-100
                    transition-all resize-none leading-relaxed"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>Minimum 5 characters</span>
                  <span className={content.length > 1800 ? 'text-amber-500' : ''}>
                    {content.length}/2000
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 pb-8">
                <button
                  type="submit"
                  disabled={isLoading || content.trim().length < 5}
                  className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-40
                    disabled:cursor-not-allowed text-white py-4 rounded-xl text-[10px] font-black
                    uppercase tracking-widest transition-all flex items-center justify-center gap-2
                    shadow-lg shadow-fuchsia-200"
                >
                  {isLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    : <><HandHeart className="w-4 h-4" /> Submit Prayer Request</>}
                </button>

                <div className="flex items-center gap-3 mt-4 text-center justify-center">
                  <div className="h-px flex-1 bg-slate-100" />
                  <p className="text-xs text-slate-400 shrink-0">
                    Visible only to the prayer team
                  </p>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
              </div>
            </form>
          )}

          {/* ── SUCCESS STATE ────────────────────────────────────────── */}
          {step === 'success' && (
            <div className="px-8 py-14 text-center">

              {/* Animated check */}
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-fuchsia-100 rounded-full animate-ping opacity-30" />
                <div className="relative w-20 h-20 bg-fuchsia-600 rounded-full flex items-center justify-center shadow-lg shadow-fuchsia-200">
                  <Check className="w-9 h-9 text-white" />
                </div>
              </div>

              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-fuchsia-500 mb-3">
                Request Received
              </p>
              <h3 className="font-serif text-3xl text-slate-900 mb-3">
                We are standing with you.
              </h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed mb-10">
                Your prayer request has been received and will be prayed over by our team.
                Save the reference ID below to track your request.
              </p>

              {/* Token */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-8">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3">
                  Reference ID — save this
                </p>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-xs font-mono bg-white border border-slate-200
                    px-4 py-3 rounded-xl truncate text-slate-700 shadow-sm">
                    {token}
                  </code>
                  <button
                    onClick={copyToken}
                    className="p-3 border border-slate-200 rounded-xl hover:bg-slate-100
                      hover:border-fuchsia-200 transition-all group"
                  >
                    {copied
                      ? <Check size={16} className="text-fuchsia-500" />
                      : <Copy size={16} className="text-slate-400 group-hover:text-fuchsia-500 transition-colors" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setStep('form');
                    setContent(''); setName(''); setEmail('');
                    setToken(''); setCopied(false);
                  }}
                  className="flex-1 border-2 border-slate-200 text-slate-700 py-3.5 rounded-xl
                    text-[10px] font-black uppercase tracking-widest hover:border-fuchsia-300
                    hover:text-fuchsia-600 transition-all"
                >
                  Submit Another
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 bg-slate-900 hover:bg-fuchsia-600 text-white py-3.5 rounded-xl
                    text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Return Home
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reassurance strip below card */}
        {step === 'form' && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { icon: <Shield className="w-5 h-5 text-fuchsia-500" />, title: 'Private', body: 'Only the prayer team can see your request' },
              { icon: <Heart className="w-5 h-5 text-fuchsia-500" />,  title: 'Cared for', body: 'Each request is personally prayed over' },
              { icon: <Flame className="w-5 h-5 text-fuchsia-500" />,  title: 'Believed', body: 'We stand in faith with you every time' },
            ].map(card => (
              <div key={card.title} className="bg-white rounded-xl p-4 border border-slate-100 text-center">
                <div className="flex justify-center mb-2">{card.icon}</div>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-1">
                  {card.title}
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerRequestPage;