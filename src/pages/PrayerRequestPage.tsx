import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Loader2, HandHeart, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { prayerApi } from '../api/prayerApi';
import { useAuth } from '../context/AuthContext';

type Step = 'form' | 'success';

const PrayerRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [step, setStep] = useState<Step>('form');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [copied, setCopied] = useState(false);

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
          name: name.trim() || undefined,
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
      toast.error('An unexpected error occurred.');
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
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 pt-32 pb-24">
        
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-fuchsia-600 transition-colors text-xs font-bold uppercase tracking-widest mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {step === 'form' ? (
          <div className="space-y-10">
            {/* Minimal Header */}
            <header>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-50 border border-fuchsia-100 mb-6">
                <HandHeart className="w-3.5 h-3.5 text-fuchsia-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-600">Prayer Request</span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-4 tracking-tight">
                We believe <span className="italic text-fuchsia-600">with you.</span>
              </h1>
              <p className="text-slate-500 text-base leading-relaxed">
                Your request is received with care and taken before God by our prayer team. 
                Everything shared here is fully confidential.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Identity Section */}
              {!isAuthenticated && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Name (Optional)</label>
                    <input
                      placeholder="John Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-50 border-transparent border-b-slate-200 border-b focus:border-b-fuchsia-500 py-3 text-sm transition-all focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border-transparent border-b-slate-200 border-b focus:border-b-fuchsia-500 py-3 text-sm transition-all focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Text Area Section */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Your Prayer Request</label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What can we pray for today?"
                  className="w-full bg-slate-50 border-transparent border-b-slate-200 border-b focus:border-b-fuchsia-500 py-4 text-sm transition-all focus:outline-none resize-none leading-relaxed"
                />
                <div className="flex justify-between text-[10px] uppercase tracking-tighter text-slate-400 font-medium pt-1">
                  <span>{content.length < 5 ? 'Minimum 5 characters' : 'Ready to submit'}</span>
                  <span>{content.length}/2000</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading || content.trim().length < 5}
                  className="w-full bg-slate-900 hover:bg-fuchsia-600 disabled:opacity-20 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Submit Request <ArrowLeft className="w-4 h-4 rotate-180" /></>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-6 flex items-center justify-center gap-2">
                  <Shield className="w-3 h-3" /> Fully confidential and prayed over personally.
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* SUCCESS STATE - Minimal */
          <div className="text-center py-12 space-y-8">
            <div className="w-20 h-20 bg-fuchsia-50 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-fuchsia-600" />
            </div>
            
            <div>
              <h3 className="font-serif text-3xl text-slate-900 mb-2">Request Received.</h3>
              <p className="text-slate-500 text-sm">We are standing in faith with you.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 inline-block w-full max-w-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-3">Reference ID</span>
              <div className="flex items-center gap-2 justify-center">
                <code className="text-xs font-mono text-slate-600 bg-white px-3 py-2 rounded-lg border border-slate-200">{token}</code>
                <button onClick={copyToken} className="p-2 hover:text-fuchsia-600 transition-colors">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6 max-w-xs mx-auto">
              <button
                onClick={() => { setStep('form'); setContent(''); }}
                className="text-[10px] font-black uppercase tracking-widest py-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
              >
                Submit Another
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-[10px] font-black uppercase tracking-widest py-4 bg-slate-900 text-white rounded-xl hover:bg-fuchsia-600 transition-all"
              >
                Return Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerRequestPage;