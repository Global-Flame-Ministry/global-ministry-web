import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Calendar, Heart, HandHeart, Camera,
  Edit3, Check, X, Loader, ArrowRight,
  MapPin, CheckCircle2, Clock, AlertCircle,
  ShieldCheck, Mail, KeyRound, Upload
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { accountApi } from '../api/accountApi';
import type {
  MyProfileDto, MyRegistrationDto,
  MyDonationDto, MyPrayerRequestDto
} from '../types';

type Tab = 'profile' | 'registrations' | 'givings' | 'prayers';

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

const formatDateTime = (d: string) =>
  new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'bg-emerald-100 text-emerald-700';
    case 'pending':   return 'bg-amber-100 text-amber-700';
    case 'failed':    return 'bg-red-100 text-red-600';
    default:          return 'bg-slate-100 text-slate-500';
  }
};

const Section: React.FC<{
  title: string;
  count?: number;
  children: React.ReactNode;
}> = ({ title, count, children }) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-serif font-bold text-slate-900">{title}</h2>
      {count !== undefined && (
        <span className="text-xs font-bold uppercase tracking-widest
          text-fuchsia-600 bg-fuchsia-50 px-3 py-1 rounded-full">
          {count} total
        </span>
      )}
    </div>
    {children}
  </div>
);

const Empty: React.FC<{
  icon: React.ReactNode;
  message: string;
  action?: React.ReactNode;
}> = ({ icon, message, action }) => (
  <div className="text-center py-16 border-2 border-dashed border-slate-200
    rounded-2xl">
    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center
      justify-center mx-auto mb-4 text-slate-400">
      {icon}
    </div>
    <p className="text-slate-500 font-serif italic mb-4">{message}</p>
    {action}
  </div>
);

const UserDashboard: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab]         = useState<Tab>('profile');
  const [profile, setProfile]             = useState<MyProfileDto | null>(null);
  const [registrations, setRegistrations] = useState<MyRegistrationDto[]>([]);
  const [donations, setDonations]         = useState<MyDonationDto[]>([]);
  const [prayers, setPrayers]             = useState<MyPrayerRequestDto[]>([]);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingTab, setIsLoadingTab]         = useState(false);

  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving]   = useState(false);
  const [editForm, setEditForm]   = useState({
    firstName: '', lastName: '', userName: ''
  });

  // Profile picture state
  const [showPicInput, setShowPicInput] = useState(false);
  const [isSavingPic, setIsSavingPic]   = useState(false);
  const [isDragging, setIsDragging]     = useState(false);
  const picInputRef                      = useRef<HTMLInputElement>(null);

  // Email change state
  const [showEmailChange, setShowEmailChange]     = useState(false);
  const [newEmail, setNewEmail]                   = useState('');
  const [isRequestingEmail, setIsRequestingEmail] = useState(false);
  const [emailChangeSent, setEmailChangeSent]     = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard' } });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingProfile(true);
        const res = await accountApi.getProfile();
        if (res.data.isSuccess && res.data.data) {
          setProfile(res.data.data);
          setEditForm({
            firstName: res.data.data.firstName,
            lastName: res.data.data.lastName,
            userName: res.data.data.userName,
          });
        }
      } catch {
        toast.error('Could not load profile');
      } finally {
        setIsLoadingProfile(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoadingTab(true);
      try {
        if (activeTab === 'registrations' && registrations.length === 0) {
          const res = await accountApi.getMyRegistrations();
          if (res.data.isSuccess && res.data.data)
            setRegistrations(res.data.data);
        }
        if (activeTab === 'givings' && donations.length === 0) {
          const res = await accountApi.getMyDonations();
          if (res.data.isSuccess && res.data.data) setDonations(res.data.data);
        }
        if (activeTab === 'prayers' && prayers.length === 0) {
          const res = await accountApi.getMyPrayerRequests();
          if (res.data.isSuccess && res.data.data) setPrayers(res.data.data);
        }
      } catch {
        toast.error('Could not load data');
      } finally {
        setIsLoadingTab(false);
      }
    };
    if (activeTab !== 'profile') load();
  }, [activeTab]);

  const handleSaveProfile = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      toast.error('First and last name are required');
      return;
    }
    setIsSaving(true);
    try {
      const res = await accountApi.updateProfile(editForm);
      if (res.data.isSuccess && res.data.data) {
        setProfile(res.data.data);
        setIsEditing(false);
        toast.success('Profile updated');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePicture = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB.');
      return;
    }

    setIsSavingPic(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'gfm_uploads');
      formData.append('folder', 'gfm');

      const uploadRes = await fetch(
        'https://api.cloudinary.com/v1_1/dveeb0yop/image/upload',
        { method: 'POST', body: formData }
      );

      if (!uploadRes.ok) throw new Error('Upload failed');

      const uploadData = await uploadRes.json();
      const cloudinaryUrl: string = uploadData.secure_url;

      const res = await accountApi.updateProfilePicture(cloudinaryUrl);
      if (res.data.isSuccess && res.data.data) {
        setProfile(p => p
          ? { ...p, profilePictureUrl: res.data.data!.profilePictureUrl }
          : p);
        setShowPicInput(false);
        toast.success('Profile picture updated');
      }
    } catch {
      toast.error('Failed to update picture');
    } finally {
      setIsSavingPic(false);
      if (picInputRef.current) picInputRef.current.value = '';
    }
  };

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsRequestingEmail(true);
    try {
      const res = await accountApi.requestEmailChange(newEmail.trim());
      if (res.data.isSuccess) {
        setEmailChangeSent(true);
        toast.success('Confirmation email sent!');
      } else {
        toast.error(res.data.message || 'Failed to send confirmation email');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsRequestingEmail(false);
    }
  };

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile',       label: 'Profile',       icon: <User className="w-4 h-4" /> },
    { key: 'registrations', label: 'Registrations', icon: <Calendar className="w-4 h-4" /> },
    { key: 'givings',       label: 'Givings',        icon: <Heart className="w-4 h-4" /> },
    { key: 'prayers',       label: 'Prayers',        icon: <HandHeart className="w-4 h-4" /> },
  ];

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-fuchsia-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── HERO BANNER ──────────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row
          items-center md:items-end gap-6">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden
              border-4 border-white/20 bg-fuchsia-900">
              {profile?.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt={profile.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center
                  text-3xl font-bold text-fuchsia-200">
                  {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowPicInput(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-fuchsia-600
                rounded-full flex items-center justify-center
                hover:bg-fuchsia-500 transition-colors border-2
                border-[#0a0a0a]"
              title="Change profile picture"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Name + role */}
          <div className="text-center md:text-left">
            <p className="text-fuchsia-400 text-[10px] font-black uppercase
              tracking-[0.4em] mb-2">
              My Account
            </p>
            <h1 className="text-4xl font-serif text-white font-bold mb-2">
              {profile?.fullName}
            </h1>
            <div className="flex items-center justify-center md:justify-start
              gap-2 flex-wrap">
              {profile?.roles.map(r => (
                <span key={r} className="text-[10px] font-black uppercase
                  tracking-widest px-3 py-1 bg-white/10 text-white/70
                  rounded-full">
                  {r}
                </span>
              ))}
              {profile?.emailConfirmed && (
                <span className="text-[10px] font-black uppercase
                  tracking-widest px-3 py-1 bg-emerald-500/20
                  text-emerald-400 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── PROFILE PICTURE UPLOAD MODAL ─────────────────────────── */}
      {showPicInput && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center
            bg-black/60 backdrop-blur-sm px-4"
          onClick={() => !isSavingPic && setShowPicInput(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl
              relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowPicInput(false)}
              disabled={isSavingPic}
              className="absolute top-4 right-4 p-1.5 text-slate-400
                hover:text-slate-700 transition-colors disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>

            <p className="text-[10px] font-black uppercase tracking-widest
              text-fuchsia-600 mb-1">
              Profile Picture
            </p>
            <h3 className="text-lg font-bold text-slate-900 mb-6">
              Update Your Photo
            </h3>

            {/* Drag & drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleSavePicture(file);
              }}
              onClick={() => !isSavingPic && picInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center
                transition-all mb-5 select-none ${
                  isSavingPic
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer'
                } ${
                  isDragging
                    ? 'border-fuchsia-500 bg-fuchsia-50'
                    : 'border-slate-200 hover:border-fuchsia-400 hover:bg-slate-50'
                }`}
            >
              {isSavingPic ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader className="w-8 h-8 text-fuchsia-600 animate-spin" />
                  <p className="text-sm font-bold text-slate-600">Uploading...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex
                    items-center justify-center text-slate-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm">
                      {isDragging
                        ? 'Drop it here!'
                        : 'Click to select image'
                      }
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      or drag and drop your photo here
                    </p>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest
                    text-slate-300">
                    JPG, PNG, WEBP — max 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Choose file button */}
            <button
              onClick={() => picInputRef.current?.click()}
              disabled={isSavingPic}
              className="w-full flex items-center justify-center gap-2 px-5 py-3
                bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-black
                uppercase tracking-widest rounded-xl disabled:opacity-50
                transition-colors"
            >
              {isSavingPic
                ? <><Loader className="w-4 h-4 animate-spin" /> Uploading...</>
                : <><Upload className="w-4 h-4" /> Choose File</>
              }
            </button>

            <input
              ref={picInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleSavePicture(file);
              }}
            />
          </div>
        </div>
      )}

      {/* ── TABS ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-4 text-xs
                  font-black uppercase tracking-widest whitespace-nowrap
                  border-b-2 transition-all ${
                    activeTab === tab.key
                      ? 'border-fuchsia-600 text-fuchsia-600'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── TAB CONTENT ──────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        {isLoadingTab && activeTab !== 'profile' && (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-6 h-6 text-fuchsia-600 animate-spin" />
          </div>
        )}

        {/* ── PROFILE TAB ──────────────────────────────────────── */}
        {activeTab === 'profile' && profile && (
          <div className="space-y-6">
            <Section title="Personal Information">
              <div className="bg-white border border-slate-200 rounded-2xl
                overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4
                  border-b border-slate-100">
                  <p className="text-xs font-black uppercase tracking-widest
                    text-slate-500">
                    Account Details
                  </p>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 text-xs font-black
                        uppercase tracking-widest text-fuchsia-600
                        hover:text-fuchsia-800 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            firstName: profile.firstName,
                            lastName: profile.lastName,
                            userName: profile.userName,
                          });
                        }}
                        className="flex items-center gap-1.5 text-xs font-black
                          uppercase tracking-widest text-slate-500
                          hover:text-slate-700 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 text-xs font-black
                          uppercase tracking-widest text-emerald-600
                          hover:text-emerald-800 transition-colors
                          disabled:opacity-50"
                      >
                        {isSaving
                          ? <Loader className="w-3.5 h-3.5 animate-spin" />
                          : <Check className="w-3.5 h-3.5" />
                        }
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="divide-y divide-slate-100">

                  {/* First Name */}
                  <div className="flex items-center px-6 py-4">
                    <span className="w-36 text-xs font-bold uppercase
                      tracking-widest text-slate-400 shrink-0">
                      First Name
                    </span>
                    {isEditing ? (
                      <input
                        value={editForm.firstName}
                        onChange={e => setEditForm(p => ({
                          ...p, firstName: e.target.value
                        }))}
                        className="flex-1 border-b border-slate-300 py-1
                          text-sm font-medium text-slate-900 outline-none
                          focus:border-fuchsia-500 transition-colors
                          bg-transparent"
                      />
                    ) : (
                      <span className="text-sm font-medium text-slate-900">
                        {profile.firstName}
                      </span>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="flex items-center px-6 py-4">
                    <span className="w-36 text-xs font-bold uppercase
                      tracking-widest text-slate-400 shrink-0">
                      Last Name
                    </span>
                    {isEditing ? (
                      <input
                        value={editForm.lastName}
                        onChange={e => setEditForm(p => ({
                          ...p, lastName: e.target.value
                        }))}
                        className="flex-1 border-b border-slate-300 py-1
                          text-sm font-medium text-slate-900 outline-none
                          focus:border-fuchsia-500 transition-colors
                          bg-transparent"
                      />
                    ) : (
                      <span className="text-sm font-medium text-slate-900">
                        {profile.lastName}
                      </span>
                    )}
                  </div>

                  {/* Username */}
                  <div className="flex items-center px-6 py-4">
                    <span className="w-36 text-xs font-bold uppercase
                      tracking-widest text-slate-400 shrink-0">
                      Username
                    </span>
                    {isEditing ? (
                      <input
                        value={editForm.userName}
                        onChange={e => setEditForm(p => ({
                          ...p, userName: e.target.value
                        }))}
                        className="flex-1 border-b border-slate-300 py-1
                          text-sm font-medium text-slate-900 outline-none
                          focus:border-fuchsia-500 transition-colors
                          bg-transparent"
                      />
                    ) : (
                      <span className="text-sm font-medium text-slate-900">
                        @{profile.userName}
                      </span>
                    )}
                  </div>

                  {/* Email — with change option */}
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between
                      flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <span className="w-36 text-xs font-bold uppercase
                          tracking-widest text-slate-400 shrink-0">
                          Email
                        </span>
                        <div>
                          <span className="text-sm text-slate-900 font-medium
                            flex items-center gap-2">
                            {profile.email}
                            {profile.emailConfirmed && (
                              <span className="text-[9px] font-black uppercase
                                tracking-widest text-emerald-600
                                bg-emerald-50 px-2 py-0.5 rounded-full">
                                ✓ Verified
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowEmailChange(v => !v);
                          setEmailChangeSent(false);
                          setNewEmail('');
                        }}
                        className="flex items-center gap-1.5 text-[10px]
                          font-black uppercase tracking-widest text-fuchsia-600
                          hover:text-fuchsia-800 transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        Change Email
                      </button>
                    </div>

                    {/* Email change panel */}
                    {showEmailChange && (
                      <div className="mt-4 p-5 bg-slate-50 rounded-xl
                        border border-slate-200">
                        {emailChangeSent ? (
                          <div className="text-center py-4">
                            <div className="w-10 h-10 bg-emerald-100
                              rounded-full flex items-center justify-center
                              mx-auto mb-3">
                              <Mail className="w-5 h-5 text-emerald-600" />
                            </div>
                            <p className="font-bold text-slate-900 text-sm mb-1">
                              Confirmation email sent!
                            </p>
                            <p className="text-slate-500 text-xs leading-relaxed">
                              We sent a confirmation link to{' '}
                              <strong>{newEmail}</strong>. Click the link in
                              that email to complete the change.
                            </p>
                            <p className="text-slate-400 text-[10px] mt-3">
                              Didn't receive it? Check your spam folder or{' '}
                              <button
                                onClick={() => setEmailChangeSent(false)}
                                className="text-fuchsia-600 underline
                                  hover:no-underline"
                              >
                                try again
                              </button>
                              .
                            </p>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-bold text-slate-700
                              uppercase tracking-widest mb-1">
                              New Email Address
                            </p>
                            <p className="text-xs text-slate-400 mb-4
                              leading-relaxed">
                              A confirmation link will be sent to your new
                              address. Your email won't change until you
                              click that link.
                            </p>
                            <form
                              onSubmit={handleRequestEmailChange}
                              className="flex gap-3"
                            >
                              <input
                                type="email"
                                required
                                value={newEmail}
                                onChange={e => setNewEmail(e.target.value)}
                                placeholder="new@email.com"
                                className="flex-1 px-4 py-2.5 border
                                  border-slate-200 rounded-xl text-sm
                                  outline-none focus:border-fuchsia-500
                                  transition-colors bg-white"
                              />
                              <button
                                type="submit"
                                disabled={isRequestingEmail ||
                                  !newEmail.trim() ||
                                  newEmail === profile.email}
                                className="px-5 py-2.5 bg-fuchsia-600
                                  hover:bg-fuchsia-500 text-white text-xs
                                  font-black uppercase tracking-widest
                                  rounded-xl transition-colors
                                  disabled:opacity-40 flex items-center gap-2"
                              >
                                {isRequestingEmail
                                  ? <Loader className="w-3.5 h-3.5 animate-spin" />
                                  : 'Send Link'
                                }
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowEmailChange(false)}
                                className="p-2.5 text-slate-400
                                  hover:text-slate-600 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </form>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Module */}
                  {profile.module && (
                    <div className="flex items-center px-6 py-4">
                      <span className="w-36 text-xs font-bold uppercase
                        tracking-widest text-slate-400 shrink-0">
                        Module
                      </span>
                      <span className="text-sm font-medium text-slate-900">
                        {profile.module}
                      </span>
                    </div>
                  )}

                  {/* Member Since */}
                  <div className="flex items-center px-6 py-4">
                    <span className="w-36 text-xs font-bold uppercase
                      tracking-widest text-slate-400 shrink-0">
                      Member Since
                    </span>
                    <span className="text-sm text-slate-600">
                      {formatDate(profile.createdOn)}
                    </span>
                  </div>
                </div>
              </div>
            </Section>

            {/* Admin link */}
            {profile.roles.includes('Admin') && (
              <div className="p-6 bg-fuchsia-50 border border-fuchsia-200
                rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-fuchsia-800 text-sm">
                    Admin Access
                  </p>
                  <p className="text-fuchsia-600 text-xs mt-0.5">
                    You have admin privileges on this platform.
                  </p>
                </div>
                <Link to="/admin"
                  className="flex items-center gap-2 text-xs font-black
                    uppercase tracking-widest text-fuchsia-700
                    hover:text-fuchsia-900 transition-colors">
                  Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── REGISTRATIONS TAB ────────────────────────────────── */}
        {activeTab === 'registrations' && !isLoadingTab && (
          <Section
            title="My Event Registrations"
            count={registrations.length}
          >
            {registrations.length === 0 ? (
              <Empty
                icon={<Calendar className="w-6 h-6" />}
                message="You haven't registered for any events yet."
                action={
                  <Link to="/events"
                    className="inline-flex items-center gap-2 text-xs
                      font-black uppercase tracking-widest text-fuchsia-600
                      hover:text-fuchsia-800 transition-colors">
                    Browse Events <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {registrations.map(reg => (
                  <div key={reg.id} className="bg-white border border-slate-200
                    rounded-2xl overflow-hidden flex flex-col md:flex-row">
                    {reg.eventImageUrl && (
                      <div className="md:w-48 h-32 md:h-auto overflow-hidden
                        bg-slate-100 shrink-0">
                        <img
                          src={reg.eventImageUrl}
                          alt={reg.eventTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between gap-4
                        flex-wrap mb-3">
                        <div>
                          <span className="text-[10px] font-black uppercase
                            tracking-widest text-fuchsia-600 block mb-1">
                            {reg.eventModule}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900">
                            {reg.eventTitle}
                          </h3>
                        </div>
                        {reg.eventIsCancelled ? (
                          <span className="text-[10px] font-black uppercase
                            tracking-widest px-3 py-1 bg-red-100 text-red-600
                            rounded-full flex items-center gap-1 shrink-0">
                            <AlertCircle className="w-3 h-3" /> Cancelled
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase
                            tracking-widest px-3 py-1 bg-emerald-100
                            text-emerald-700 rounded-full flex items-center
                            gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3" /> Registered
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs
                        text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-fuchsia-400" />
                          {formatDate(reg.eventStartDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-fuchsia-400" />
                          {reg.eventLocation}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-300" />
                          Registered {formatDate(reg.registeredAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* ── GIVINGS TAB ──────────────────────────────────────── */}
        {activeTab === 'givings' && !isLoadingTab && (
          <Section title="My Giving History" count={donations.length}>
            {donations.length === 0 ? (
              <Empty
                icon={<Heart className="w-6 h-6" />}
                message="You haven't made any donations yet."
                action={
                  <Link to="/give"
                    className="inline-flex items-center gap-2 text-xs
                      font-black uppercase tracking-widest text-fuchsia-600
                      hover:text-fuchsia-800 transition-colors">
                    Give Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-slate-200
                    rounded-2xl p-5">
                    <p className="text-xs font-bold uppercase tracking-widest
                      text-slate-400 mb-2">
                      Total Donated (NGN)
                    </p>
                    <p className="text-2xl font-black text-slate-900">
                      {donations
                        .filter(d => d.status === 'Completed' &&
                          d.currency === 'NGN').length > 0
                        ? `₦${donations
                            .filter(d => d.status === 'Completed' &&
                              d.currency === 'NGN')
                            .reduce((sum, d) => sum + d.amount, 0)
                            .toLocaleString()}`
                        : '—'
                      }
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200
                    rounded-2xl p-5">
                    <p className="text-xs font-bold uppercase tracking-widest
                      text-slate-400 mb-2">
                      Completed
                    </p>
                    <p className="text-2xl font-black text-emerald-600">
                      {donations.filter(d =>
                        d.status === 'Completed').length}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200
                    rounded-2xl p-5">
                    <p className="text-xs font-bold uppercase tracking-widest
                      text-slate-400 mb-2">
                      Total Gifts
                    </p>
                    <p className="text-2xl font-black text-slate-900">
                      {donations.length}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {donations.map(d => (
                    <div key={d.id} className="bg-white border border-slate-200
                      rounded-2xl p-5 flex items-center gap-5">
                      <div className="w-12 h-12 rounded-full bg-fuchsia-100
                        text-fuchsia-700 flex items-center justify-center
                        shrink-0">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 mb-0.5">
                          {d.donationType}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs
                          text-slate-400">
                          <span>{d.paymentMethod}</span>
                          <span>·</span>
                          <span>{formatDateTime(d.createdAt)}</span>
                          {d.eventTitle && (
                            <>
                              <span>·</span>
                              <span>For: {d.eventTitle}</span>
                            </>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-300
                          mt-1 truncate max-w-xs">
                          {d.transactionReference}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-lg text-slate-900">
                          {d.currency} {d.amount.toLocaleString()}
                        </p>
                        <span className={`text-[10px] font-black uppercase
                          tracking-widest px-2 py-0.5 rounded-full
                          ${statusColor(d.status)}`}>
                          {d.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Section>
        )}

        {/* ── PRAYERS TAB ──────────────────────────────────────── */}
        {activeTab === 'prayers' && !isLoadingTab && (
          <Section title="My Prayer Requests" count={prayers.length}>
            {prayers.length === 0 ? (
              <Empty
                icon={<HandHeart className="w-6 h-6" />}
                message="You haven't submitted any prayer requests yet."
                action={
                  <Link to="/prayer-request"
                    className="inline-flex items-center gap-2 text-xs
                      font-black uppercase tracking-widest text-fuchsia-600
                      hover:text-fuchsia-800 transition-colors">
                    Submit a Request <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {prayers.map(p => (
                  <div key={p.id} className="bg-white border border-slate-200
                    rounded-2xl p-6">
                    <div className="flex items-start justify-between
                      gap-4 mb-4">
                      <span className="text-xs text-slate-400 flex
                        items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(p.createdAt)}
                      </span>
                      <span className={`text-[10px] font-black uppercase
                        tracking-widest px-3 py-1 rounded-full shrink-0 ${
                          p.isAttendedTo
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                        {p.isAttendedTo ? '✓ Attended To' : '⏳ Pending'}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-sm
                      whitespace-pre-wrap">
                      {p.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;