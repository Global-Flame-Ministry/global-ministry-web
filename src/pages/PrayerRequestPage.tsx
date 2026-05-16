import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, Copy, Loader2, HandHeart,
  Shield, Mail, Phone, ChevronDown, Paperclip, X, FileImage
} from 'lucide-react';
import toast from 'react-hot-toast';
import { prayerApi } from '../api/prayerApi';
import { useAuth } from '../context/useAuthContext';

const TOPICS = [
  'Healing & Health',
  'Family & Relationships',
  'Financial Breakthrough',
  'Spiritual Growth',
  'Career & Purpose',
  'Marriage & Fertility',
  'Grief & Loss',
  'Deliverance & Freedom',
  'Salvation of Loved Ones',
  'Other',
];

const CLOUDINARY_CLOUD_NAME = 'dveeb0yop';
const CLOUDINARY_UPLOAD_PRESET = 'gfm_uploads';

type Step = 'form' | 'success';

const PrayerRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep]       = useState<Step>('form');
  const [content, setContent] = useState('');
  const [topic, setTopic]     = useState('');

  const [name, setName] = useState(
    isAuthenticated && user
      ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
      : ''
  );
  const [email, setEmail] = useState(
    isAuthenticated && user ? (user.email ?? '') : ''
  );
  const [phone, setPhone]                       = useState('');
  const [preferredContact, setPreferredContact] = useState<'Email' | 'Phone'>('Email');

  // Attachment state
  const [attachmentUrl, setAttachmentUrl]   = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [isUploading, setIsUploading]       = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken]         = useState('');
  const [copied, setCopied]       = useState(false);

  // ── Cloudinary upload ────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 5 MB guard
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 5 MB.');
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      toast.error('Only JPG, PNG, WEBP, or PDF files are allowed.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setAttachmentUrl(data.secure_url);
      setAttachmentName(file.name);
      toast.success('Attachment uploaded');
    } catch {
      toast.error('Failed to upload attachment. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = () => {
    setAttachmentUrl('');
    setAttachmentName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    if (!content.trim() || content.trim().length < 5) {
      toast.error('Please enter a valid prayer request (at least 5 characters).');
      return;
    }

    setIsLoading(true);
    try {
      const dto = {
        name: name.trim(),
        email: email.trim(),
        phoneNumber: phone.trim() || undefined,
        preferredContact,
        topic: topic || undefined,
        content: content.trim(),
        attachment: attachmentUrl || undefined,
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
    toast.success('Reference ID copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setStep('form');
    setContent('');
    setTopic('');
    setAttachmentUrl('');
    setAttachmentName('');
    if (!isAuthenticated) {
      setName('');
      setEmail('');
      setPhone('');
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14
            bg-fuchsia-500/10 rounded-full mb-6">
            <HandHeart className="w-7 h-7 text-fuchsia-400" />
          </div>
          <h2 className="text-fuchsia-400 text-[20px] font-black uppercase
            tracking-[0.4em] mb-4">
            Prayer Request
          </h2>
          <h1 className="text-5xl md:text-6xl font-serif text-white font-bold
            mb-6 leading-tight">
            We believe{' '}
            <span className="italic text-fuchsia-400">with you.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-xl mx-auto">
            Your request is received with care and taken before God by our
            prayer team. Everything shared here is fully confidential.
          </p>
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-20">

        {step === 'form' ? (
          <>
            {/* Trust signals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {[
                {
                  icon: <Shield className="w-5 h-5 text-fuchsia-500" />,
                  title: 'Confidential',
                  desc: 'Everything shared is kept strictly confidential.'
                },
                {
                  icon: <HandHeart className="w-5 h-5 text-fuchsia-500" />,
                  title: 'Personally Prayed Over',
                  desc: 'Each request is prayed over by a member of our team.'
                },
                {
                  icon: <Mail className="w-5 h-5 text-fuchsia-500" />,
                  title: 'Follow-Up',
                  desc: 'We will reach out to pray with you directly.'
                },
              ].map(item => (
                <div key={item.title}
                  className="text-center p-6 border border-slate-100 rounded-2xl">
                  <div className="w-10 h-10 bg-fuchsia-50 rounded-full flex
                    items-center justify-center mx-auto mb-3">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 text-sm">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

              {/* ── Contact fields ─────────────────────────────── */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-black uppercase
                      tracking-widest text-slate-500 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your full name"
                      disabled={isAuthenticated}
                      className="w-full border-b-2 border-slate-200 py-3
                        text-base font-light text-slate-900 outline-none
                        focus:border-fuchsia-600 transition-colors bg-transparent
                        placeholder:text-slate-300
                        disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-black uppercase
                      tracking-widest text-slate-500 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      disabled={isAuthenticated}
                      className="w-full border-b-2 border-slate-200 py-3
                        text-base font-light text-slate-900 outline-none
                        focus:border-fuchsia-600 transition-colors bg-transparent
                        placeholder:text-slate-300
                        disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-black uppercase
                      tracking-widest text-slate-500 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+234..."
                      className="w-full border-b-2 border-slate-200 py-3
                        text-base font-light text-slate-900 outline-none
                        focus:border-fuchsia-600 transition-colors bg-transparent
                        placeholder:text-slate-300"
                    />
                  </div>

                  {/* Preferred Contact */}
                  <div>
                    <label className="block text-xs font-black uppercase
                      tracking-widest text-slate-500 mb-2">
                      Preferred Follow-Up Method
                    </label>
                    <div className="flex gap-3 mt-1">
                      {(['Email', 'Phone'] as const).map(method => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPreferredContact(method)}
                          className={`flex items-center gap-2 px-5 py-2.5
                            rounded-full border-2 text-xs font-black uppercase
                            tracking-widest transition-all ${
                              preferredContact === method
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
              </div>

              {/* ── Topic ──────────────────────────────────────── */}
              <div>
                <label className="block text-xs font-black uppercase
                  tracking-widest text-slate-500 mb-2">
                  Prayer Topic (Optional)
                </label>
                <div className="relative">
                  <select
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="w-full border-b-2 border-slate-200 py-3
                      text-base font-light text-slate-900 outline-none
                      focus:border-fuchsia-600 transition-colors bg-transparent
                      appearance-none cursor-pointer pr-8"
                  >
                    <option value="">Select a topic (optional)...</option>
                    {TOPICS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2
                    -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* ── Prayer Request ─────────────────────────────── */}
              <div>
                <label className="block text-xs font-black uppercase
                  tracking-widest text-slate-500 mb-2">
                  Your Prayer Request *
                </label>
                <textarea
                  required
                  rows={6}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="What can we pray for today? Share as much or as little as you're comfortable with..."
                  className="w-full border-2 border-slate-200 rounded-2xl
                    px-5 py-4 text-base font-light text-slate-900 outline-none
                    focus:border-fuchsia-600 transition-colors resize-none
                    placeholder:text-slate-300"
                />
                <div className="flex justify-between text-[10px] uppercase
                  tracking-wider text-slate-400 font-bold pt-1.5 px-1">
                  <span>
                    {content.length < 5
                      ? 'Minimum 5 characters'
                      : '✓ Ready to submit'
                    }
                  </span>
                  <span>{content.length} / 5000</span>
                </div>
              </div>

              {/* ── Attachment ─────────────────────────────────── */}
              <div>
                <label className="block text-xs font-black uppercase
                  tracking-widest text-slate-500 mb-2">
                  Attachment (Optional)
                </label>

                {attachmentUrl ? (
                  /* Uploaded — show preview pill */
                  <div className="flex items-center gap-3 p-4 bg-fuchsia-50
                    border border-fuchsia-200 rounded-2xl">
                    <div className="w-9 h-9 bg-fuchsia-100 rounded-xl flex
                      items-center justify-center shrink-0">
                      <FileImage className="w-4 h-4 text-fuchsia-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {attachmentName}
                      </p>
                      <p className="text-[10px] text-fuchsia-500 uppercase
                        tracking-widest font-black mt-0.5">
                        Uploaded successfully
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeAttachment}
                      className="p-1.5 hover:bg-fuchsia-100 rounded-lg
                        transition-colors text-slate-400 hover:text-slate-600
                        shrink-0"
                      title="Remove attachment"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Not uploaded — show upload trigger */
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full border-2 border-dashed border-slate-200
                      rounded-2xl py-8 flex flex-col items-center gap-3
                      hover:border-fuchsia-300 hover:bg-fuchsia-50/50
                      transition-all disabled:opacity-50
                      disabled:cursor-not-allowed group"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-6 h-6 text-fuchsia-500 animate-spin" />
                        <span className="text-xs font-black uppercase
                          tracking-widest text-slate-400">
                          Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-slate-100 rounded-full
                          flex items-center justify-center
                          group-hover:bg-fuchsia-100 transition-colors">
                          <Paperclip className="w-5 h-5 text-slate-400
                            group-hover:text-fuchsia-600 transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-black uppercase
                            tracking-widest text-slate-500">
                            Click to attach a file
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            JPG, PNG, WEBP or PDF &middot; Max 5 MB
                          </p>
                        </div>
                      </>
                    )}
                  </button>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* ── Privacy note ───────────────────────────────── */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">Confidentiality:</strong>{' '}
                  All prayer requests are treated with the utmost care and
                  confidentiality. Your information will only be seen by our
                  pastoral prayer team. We will follow up with you within
                  48 hours.
                </p>
              </div>

              {/* ── Submit ─────────────────────────────────────── */}
              <button
                type="submit"
                disabled={isLoading || isUploading || content.trim().length < 5}
                className="w-full py-5 bg-slate-900 text-white font-black
                  uppercase tracking-widest text-sm hover:bg-fuchsia-600
                  transition-all disabled:opacity-30 flex items-center
                  justify-center gap-3"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Submit Prayer Request
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>

              <p className="text-center text-[10px] text-slate-400 flex
                items-center justify-center gap-2">
                <Shield className="w-3 h-3" />
                Fully confidential and prayed over personally.
              </p>
            </form>
          </>
        ) : (
          /* ── SUCCESS STATE ─────────────────────────────────── */
          <div className="text-center py-12 space-y-8 max-w-md mx-auto">
            <div className="w-20 h-20 bg-fuchsia-50 rounded-full flex
              items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-fuchsia-600" />
            </div>

            <div>
              <h3 className="font-serif text-3xl text-slate-900 mb-3 font-bold">
                Request Received.
              </h3>
              <p className="text-slate-500 leading-relaxed">
                We are standing in faith with you. Our prayer team has received
                your request and will bring it before God.
              </p>
              <p className="text-slate-400 text-sm mt-2">
                We will follow up with you at{' '}
                <strong className="text-slate-600">{email}</strong> within
                48 hours.
              </p>
            </div>

            {/* Reference ID */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <span className="text-[9px] font-black uppercase tracking-widest
                text-slate-400 block mb-3">
                Reference ID
              </span>
              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                Save this ID to track the status of your prayer request.
              </p>
              <div className="flex items-center gap-2 justify-center">
                <code className="text-xs font-mono text-slate-700 bg-white
                  px-4 py-2.5 rounded-xl border border-slate-200 flex-1
                  text-center break-all">
                  {token}
                </code>
                <button
                  onClick={copyToken}
                  className="p-2.5 hover:text-fuchsia-600 transition-colors
                    text-slate-400 border border-slate-200 rounded-xl
                    hover:border-fuchsia-300 hover:bg-fuchsia-50"
                  title="Copy reference ID"
                >
                  {copied
                    ? <Check size={16} className="text-emerald-500" />
                    : <Copy size={16} />
                  }
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={resetForm}
                className="text-[10px] font-black uppercase tracking-widest
                  py-4 border-2 border-slate-200 rounded-2xl
                  hover:bg-slate-50 transition-all text-slate-700"
              >
                Submit Another Request
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-[10px] font-black uppercase tracking-widest
                  py-4 bg-slate-900 text-white rounded-2xl
                  hover:bg-fuchsia-600 transition-all"
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