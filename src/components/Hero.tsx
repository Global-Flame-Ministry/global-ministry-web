import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, ArrowRight } from 'lucide-react';
import auditorium from '../assets/auditorium.jpg';
import { useAuth } from '../context/useAuthContext';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (firstName) params.set('firstName', firstName);
    if (lastName)  params.set('lastName', lastName);
    if (email)     params.set('email', email);
    navigate(`/register?${params.toString()}`);
  };

  return (
    <>
      <div className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            src={auditorium}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30"
          />
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-1000"
            onCanPlay={(e) => {
              (e.target as HTMLVideoElement).classList.remove('opacity-0');
              (e.target as HTMLVideoElement).classList.add('opacity-60');
            }}
          >
            <source src="/assets/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <span className="inline-block py-1 px-3 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300 text-sm font-semibold tracking-wider uppercase backdrop-blur-sm">
              Welcome Home
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-snug max-w-4xl mx-auto">
              Raising a people of{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">power</span>
              {' '}who will{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">manifest</span>
              {' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">the kingdom</span>
              {' '}and the realities of the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">fullness</span>
              {' '}of Christ through the Spirit.
            </h1>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/sermons"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-full text-brand-900 bg-white hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                <PlayCircle className="w-5 h-5 mr-2 text-brand-600" />
                Watch Latest Service
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 border border-white/30 text-base font-semibold rounded-full text-white hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Contact Us
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {!user && (
<section className="bg-[#2d2d3a] py-12 px-6 border-t border-white/10">
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8">
    <div className="md:w-64 shrink-0 text-left">
      <h2 className="text-xl md:text-2xl font-serif text-white font-bold leading-snug">
        Sign up to receive life changing hope and encouragement
      </h2>
    </div>
    <form onSubmit={handleSignUp} className="flex-1 w-full flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="flex-1 bg-white/10 border border-white/20 rounded-xl py-4 px-5 text-white placeholder:text-white/40 focus:ring-2 focus:ring-fuchsia-400 outline-none transition-all"
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        className="flex-1 bg-white/10 border border-white/20 rounded-xl py-4 px-5 text-white placeholder:text-white/40 focus:ring-2 focus:ring-fuchsia-400 outline-none transition-all"
      />
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 bg-white/10 border border-white/20 rounded-xl py-4 px-5 text-white placeholder:text-white/40 focus:ring-2 focus:ring-fuchsia-400 outline-none transition-all"
      />
      <button
        type="submit"
        className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg transition-all whitespace-nowrap"
      >
        Sign Up
      </button>
    </form>
            <p className="mt-6 text-xs text-white/70 max-w-3xl mx-auto leading-relaxed">
              *By submitting this form you will be taken to our registration page to complete your account setup.
              We respect your privacy and will never share your information.
            </p>
          </div>
        </section>
      )}
    </>
  );
};

export default Hero;