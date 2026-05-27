import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlayCircle, ArrowRight } from 'lucide-react';
import auditorium from '../assets/auditorium.png';
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
      <div className="relative min-h-[100dvh] sm:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={auditorium}
            alt="Worship Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
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
        <section className="bg-slate-700 py-12 px-4 border-t border-slate-600">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif text-white mb-2">
              Sign up to receive life changing hope and encouragement!
            </h2>
            <p className="text-white/70 text-sm mb-8">
              Join our community today — it only takes a minute.
            </p>
            <form
              onSubmit={handleSignUp}
              className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-5xl mx-auto"
            >
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full md:flex-1 bg-white rounded-sm py-3 px-4 text-slate-900 focus:ring-2 focus:ring-fuchsia-400 outline-none transition-all shadow-sm"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full md:flex-1 bg-white rounded-sm py-3 px-4 text-slate-900 focus:ring-2 focus:ring-fuchsia-400 outline-none transition-all shadow-sm"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full md:flex-1 bg-white rounded-sm py-3 px-4 text-slate-900 focus:ring-2 focus:ring-fuchsia-400 outline-none transition-all shadow-sm"
              />
              <button
                type="submit"
                className="w-full md:w-auto bg-[#0071bc] hover:bg-[#005a96] text-white font-bold uppercase tracking-widest px-10 py-3 rounded-sm shadow-lg transition-colors"
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