import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Calendar, Heart, HandHeart, Camera,
  Edit3, Check, X, Loader, ArrowRight,
  MapPin, CheckCircle2, Clock, AlertCircle,
  ShieldCheck, Upload, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { accountApi } from '../api/accountApi';
import type {
  MyProfileDto, MyRegistrationDto,
  MyDonationDto, MyPrayerRequestDto
} from '../types';

// ─── CLOUDINARY CONFIG ────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = 'dveeb0yop';
const CLOUDINARY_UPLOAD_PRESET = 'gfm_uploads';

// ─── TAB TYPE ─────────────────────────────────────────────────────────────────
type Tab = 'profile' | 'registrations' | 'givings' | 'prayers';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
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

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; count?: number; children: React.ReactNode }> = ({
  title, count, children
}) => (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-serif font-bold text-slate-900">{title}</h2>
      {count !== undefined && (
        <span className="text-xs font-bold uppercase tracking-widest text-fuchsia-600 bg-fuchsia-50 px-3 py-1 rounded-full">
          {count} total
        </span>
      )}
    </div>
    {children}
  </div>
);

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
const Empty: React.FC<{ icon: React.ReactNode; message: string; action?: React.ReactNode }> = ({
  icon, message, action
}) => (
  <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
      {icon}
    </div>
    <p className="text-slate-500 font-serif italic mb-4">{message}</p>
    {action}
  </div>
);

// ─── PROFILE PICTURE UPLOAD MODAL ─────────────────────────────────────────────
interface PicUploadModalProps {
  onClose: () => void;
  onSave: (url: string) => Promise<void>;
  isSaving: boolean;
}

const PicUploadModal: React.FC<PicUploadModalProps> = ({ onClose, onSave, isSaving }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image must be under 10MB.');
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'gfm');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setUploadedUrl(data.secure_url);
    } catch {
      setUploadError('Upload failed. Please try again.');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!uploadedUrl) return;
    await onSave(uploadedUrl);
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <p className="text-sm font-black uppercase tracking-widest text-white">
            Update Profile Picture
          </p>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {/* Preview or upload zone */}
          {previewUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-white/10">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-52 object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col
                  items-center justify-center gap-3">
                  <Loader className="w-6 h-6 text-fuchsia-400 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white">
                    Uploading...
                  </span>
                </div>
              )}
              {!isUploading && uploadedUrl && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white
                  text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg
                  flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready
                </div>
              )}
              {/* Re-select button */}
              {!isUploading && (
                <button
                  onClick={() => {
                    setPreviewUrl(null);
                    setUploadedUrl(null);
                    setUploadError(null);
                  }}
                  className="absolute top-3 left-3 p-1.5 bg-black/60
                    hover:bg-black/80 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-4
                py-10 border-2 border-dashed border-white/20 rounded-xl
                hover:border-fuchsia-500/60 hover:bg-fuchsia-500/5
                transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center
                justify-center group-hover:bg-fuchsia-500/20 transition-colors">
                <ImageIcon className="w-6 h-6 text-white/40 group-hover:text-fuchsia-400
                  transition-colors" />
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-white/70 block mb-1">
                  Click to select a photo
                </span>
                <span className="text-xs text-white/30">
                  JPG, PNG, WEBP — max 10MB
                </span>
              </div>
              <div className="flex items-center gap-2 px-5 py-2.5 bg-fuchsia-600
                hover:bg-fuchsia-500 text-white rounded-xl transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">
                  Choose File
                </span>
              </div>
            </button>
          )}

          {/* Error */}
          {uploadError && (
            <p className="text-xs text-red-400 font-medium">{uploadError}</p>
          )}

          {/* Hidden file input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-xs font-black uppercase tracking-widest
              text-white/60 border border-white/10 rounded-xl hover:bg-white/5
              transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!uploadedUrl || isSaving || isUploading}
            className="flex-1 py-3 text-xs font-black uppercase tracking-widest
              text-white bg-fuchsia-600 hover:bg-fuchsia-500 rounded-xl
              transition-colors disabled:opacity-40 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {isSaving
              ? <><Loader className="w-3.5 h-3.5 animate-spin" /> Saving...</>
              : 'Save Picture'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const UserDashboard: React.FC = () => {
  const { user: isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [profile, setProfile]     = useState<MyProfileDto | null>(null);
  const [registrations, setRegistrations] = useState<MyRegistrationDto[]>([]);
  const [donations, setDonations] = useState<MyDonationDto[]>([]);
  const [prayers, setPrayers]     = useState<MyPrayerRequestDto[]>([]);

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingTab, setIsLoadingTab]         = useState(false);

  // Edit profile state
  const [isEditing, setIsEditing]   = useState(false);
  const [isSaving, setIsSaving]     = useState(false);
  const [editForm, setEditForm]     = useState({
    firstName: '', lastName: '', userName: ''
  });

  // Profile picture modal state
  const [showPicModal, setShowPicModal] = useState(false);
  const [isSavingPic, setIsSavingPic]  = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard' } });
    }
  }, [isAuthenticated, navigate]);

  // Load profile on mount
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

  // Load tab data on tab change
  useEffect(() => {
    const load = async () => {
      setIsLoadingTab(true);
      try {
        if (activeTab === 'registrations' && registrations.length === 0) {
          const res = await accountApi.getMyRegistrations();
          if (res.data.isSuccess && res.data.data) setRegistrations(res.data.data);
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
        toast.success('Profile updated successfully');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Called from modal after Cloudinary upload succeeds
  const handleSavePicture = async (cloudinaryUrl: string) => {
    setIsSavingPic(true);
    try {
      const res = await accountApi.updateProfilePicture(cloudinaryUrl);
      if (res.data.isSuccess && res.data.data) {
        setProfile(p =>
          p ? { ...p, profilePictureUrl: res.data.data!.profilePictureUrl } : p
        );
        setShowPicModal(false);
        toast.success('Profile picture updated');
      }
    } catch {
      toast.error('Failed to update picture');
    } finally {
      setIsSavingPic(false);
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

      {/* ── PROFILE PICTURE UPLOAD MODAL ─────────────────────────────── */}
      {showPicModal && (
        <PicUploadModal
          onClose={() => setShowPicModal(false)}
          onSave={handleSavePicture}
          isSaving={isSavingPic}
        />
      )}

      {/* ── HERO BANNER ──────────────────────────────────────────────── */}
      <div className="bg-[#0a0a0a] pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center
          md:items-end gap-6">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4
              border-white/20 bg-fuchsia-900">
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
            {/* Camera button — opens the upload modal */}
            <button
              onClick={() => setShowPicModal(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-fuchsia-600
                rounded-full flex items-center justify-center hover:bg-fuchsia-500
                transition-colors border-2 border-[#0a0a0a]"
              title="Change profile picture"
            >
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Name + role */}
          <div className="text-center md:text-left">
            <p className="text-fuchsia-400 text-[10px] font-black uppercase
              tracking-[0.4em] mb-2">My Account</p>
            <h1 className="text-4xl font-serif text-white font-bold mb-2">
              {profile?.fullName}
            </h1>
            <div className="flex items-center justify-center md:justify-start
              gap-2 flex-wrap">
              {profile?.roles.map(r => (
                <span key={r}
                  className="text-[10px] font-black uppercase tracking-widest
                    px-3 py-1 bg-white/10 text-white/70 rounded-full">
                  {r}
                </span>
              ))}
              {profile?.emailConfirmed && (
                <span className="text-[10px] font-black uppercase tracking-widest
                  px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full
                  flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-black
                  uppercase tracking-widest whitespace-nowrap border-b-2
                  transition-all ${
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

      {/* ── TAB CONTENT ──────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* LOADING SPINNER FOR TABS */}
        {isLoadingTab && activeTab !== 'profile' && (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-6 h-6 text-fuchsia-600 animate-spin" />
          </div>
        )}

        {/* ── PROFILE TAB ─────────────────────────────────────────── */}
        {activeTab === 'profile' && profile && (
          <Section title="Personal Information">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

              {/* Header row */}
              <div className="flex items-center justify-between px-6 py-4
                border-b border-slate-100">
                <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                  Account Details
                </p>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 text-xs font-black uppercase
                      tracking-widest text-fuchsia-600 hover:text-fuchsia-800
                      transition-colors"
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

              {/* Fields */}
              <div className="divide-y divide-slate-100">
                {/* First Name */}
                <div className="flex items-center px-6 py-4">
                  <span className="w-32 text-xs font-bold uppercase tracking-widest
                    text-slate-400 shrink-0">
                    First Name
                  </span>
                  {isEditing ? (
                    <input
                      value={editForm.firstName}
                      onChange={e => setEditForm(p => ({
                        ...p, firstName: e.target.value
                      }))}
                      className="flex-1 border-b border-slate-300 py-1 text-sm
                        font-medium text-slate-900 outline-none
                        focus:border-fuchsia-500 transition-colors bg-transparent"
                    />
                  ) : (
                    <span className="text-sm font-medium text-slate-900">
                      {profile.firstName}
                    </span>
                  )}
                </div>

                {/* Last Name */}
                <div className="flex items-center px-6 py-4">
                  <span className="w-32 text-xs font-bold uppercase tracking-widest
                    text-slate-400 shrink-0">
                    Last Name
                  </span>
                  {isEditing ? (
                    <input
                      value={editForm.lastName}
                      onChange={e => setEditForm(p => ({
                        ...p, lastName: e.target.value
                      }))}
                      className="flex-1 border-b border-slate-300 py-1 text-sm
                        font-medium text-slate-900 outline-none
                        focus:border-fuchsia-500 transition-colors bg-transparent"
                    />
                  ) : (
                    <span className="text-sm font-medium text-slate-900">
                      {profile.lastName}
                    </span>
                  )}
                </div>

                {/* Username */}
                <div className="flex items-center px-6 py-4">
                  <span className="w-32 text-xs font-bold uppercase tracking-widest
                    text-slate-400 shrink-0">
                    Username
                  </span>
                  {isEditing ? (
                    <input
                      value={editForm.userName}
                      onChange={e => setEditForm(p => ({
                        ...p, userName: e.target.value
                      }))}
                      className="flex-1 border-b border-slate-300 py-1 text-sm
                        font-medium text-slate-900 outline-none
                        focus:border-fuchsia-500 transition-colors bg-transparent"
                    />
                  ) : (
                    <span className="text-sm font-medium text-slate-900">
                      @{profile.userName}
                    </span>
                  )}
                </div>

                {/* Email — read only */}
                <div className="flex items-center px-6 py-4">
                  <span className="w-32 text-xs font-bold uppercase tracking-widest
                    text-slate-400 shrink-0">
                    Email
                  </span>
                  <span className="text-sm text-slate-600">{profile.email}</span>
                  <span className="ml-3 text-[10px] font-bold uppercase
                    tracking-widest text-slate-400">
                    (cannot change)
                  </span>
                </div>

                {/* Module */}
                {profile.module && (
                  <div className="flex items-center px-6 py-4">
                    <span className="w-32 text-xs font-bold uppercase tracking-widest
                      text-slate-400 shrink-0">
                      Module
                    </span>
                    <span className="text-sm font-medium text-slate-900">
                      {profile.module}
                    </span>
                  </div>
                )}

                {/* Member Since */}
                <div className="flex items-center px-6 py-4">
                  <span className="w-32 text-xs font-bold uppercase tracking-widest
                    text-slate-400 shrink-0">
                    Member Since
                  </span>
                  <span className="text-sm text-slate-600">
                    {formatDate(profile.createdOn)}
                  </span>
                </div>
              </div>
            </div>

            {/* Admin dashboard link */}
            {profile.roles.includes('Admin') && (
              <div className="mt-6 p-6 bg-fuchsia-50 border border-fuchsia-200
                rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-fuchsia-800 text-sm">
                    Admin Access
                  </p>
                  <p className="text-fuchsia-600 text-xs mt-0.5">
                    You have admin privileges on this platform.
                  </p>
                </div>
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-xs font-black uppercase
                    tracking-widest text-fuchsia-700 hover:text-fuchsia-900
                    transition-colors"
                >
                  Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </Section>
        )}

        {/* ── REGISTRATIONS TAB ─────────────────────────────────── */}
        {activeTab === 'registrations' && !isLoadingTab && (
          <Section title="My Event Registrations" count={registrations.length}>
            {registrations.length === 0 ? (
              <Empty
                icon={<Calendar className="w-6 h-6" />}
                message="You haven't registered for any events yet."
                action={
                  <Link
                    to="/events"
                    className="inline-flex items-center gap-2 text-xs font-black
                      uppercase tracking-widest text-fuchsia-600
                      hover:text-fuchsia-800 transition-colors"
                  >
                    Browse Events <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {registrations.map(reg => (
                  <div
                    key={reg.id}
                    className="bg-white border border-slate-200 rounded-2xl
                      overflow-hidden flex flex-col md:flex-row"
                  >
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
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
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

        {/* ── GIVINGS TAB ────────────────────────────────────────── */}
        {activeTab === 'givings' && !isLoadingTab && (
          <Section title="My Giving History" count={donations.length}>
            {donations.length === 0 ? (
              <Empty
                icon={<Heart className="w-6 h-6" />}
                message="You haven't made any donations yet."
                action={
                  <Link
                    to="/give"
                    className="inline-flex items-center gap-2 text-xs font-black
                      uppercase tracking-widest text-fuchsia-600
                      hover:text-fuchsia-800 transition-colors"
                  >
                    Give Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <p className="text-xs font-bold uppercase tracking-widest
                      text-slate-400 mb-2">Total Donated</p>
                    <p className="text-2xl font-black text-slate-900">
                      {donations.filter(d => d.status === 'Completed' && d.currency === 'NGN').length > 0
                        ? `₦${donations
                            .filter(d => d.status === 'Completed' && d.currency === 'NGN')
                            .reduce((sum, d) => sum + d.amount, 0)
                            .toLocaleString()}`
                        : '—'
                      }
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <p className="text-xs font-bold uppercase tracking-widest
                      text-slate-400 mb-2">Completed</p>
                    <p className="text-2xl font-black text-emerald-600">
                      {donations.filter(d => d.status === 'Completed').length}
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-5">
                    <p className="text-xs font-bold uppercase tracking-widest
                      text-slate-400 mb-2">Total Gifts</p>
                    <p className="text-2xl font-black text-slate-900">
                      {donations.length}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {donations.map(d => (
                    <div
                      key={d.id}
                      className="bg-white border border-slate-200 rounded-2xl
                        p-5 flex items-center gap-5"
                    >
                      <div className="w-12 h-12 rounded-full bg-fuchsia-100
                        text-fuchsia-700 flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-900 mb-0.5">
                          {d.donationType}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
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
                        <p className="text-[10px] font-mono text-slate-300 mt-1
                          truncate max-w-xs">
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

        {/* ── PRAYERS TAB ────────────────────────────────────────── */}
        {activeTab === 'prayers' && !isLoadingTab && (
          <Section title="My Prayer Requests" count={prayers.length}>
            {prayers.length === 0 ? (
              <Empty
                icon={<HandHeart className="w-6 h-6" />}
                message="You haven't submitted any prayer requests yet."
                action={
                  <Link
                    to="/prayer-request"
                    className="inline-flex items-center gap-2 text-xs font-black
                      uppercase tracking-widest text-fuchsia-600
                      hover:text-fuchsia-800 transition-colors"
                  >
                    Submit a Request <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {prayers.map(p => (
                  <div
                    key={p.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
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