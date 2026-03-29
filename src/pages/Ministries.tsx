import React, { useState } from 'react';
import { MINISTRIES } from '../constants';
import { ArrowLeft, ArrowRight, X, CheckCircle2, ChevronRight } from 'lucide-react';
import DaughtersOfHonour from './DaughtersOfHonour';
import GlobalChoir from './GlobalChoir';
import HomeOfLove from './HomeOfLove';
import Youth from './Youths'; // 1. Imported Youth Component

const Ministries: React.FC = () => {
  // 2. Added 'youth' to the currentView state type
  const [currentView, setCurrentView] = useState<'list' | 'doh' | 'choir' | 'hol' | 'youth'>('list');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isDiscoveryModalOpen, setIsDiscoveryModalOpen] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState<any>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // 3. Updated navigation type to include 'youth'
  const navigateTo = (view: 'list' | 'doh' | 'choir' | 'hol' | 'youth') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGetInvolved = (ministry: any) => {
    setSelectedMinistry(ministry);
    setIsJoinModalOpen(true);
  };

  const handleSelectTeam = (ministry: any) => {
    setSelectedMinistry(ministry);
    setIsDiscoveryModalOpen(false);
    setIsJoinModalOpen(true);
  };

  const closeModal = () => {
    setIsJoinModalOpen(false);
    setIsDiscoveryModalOpen(false);
    setSelectedMinistry(null);
    setFormSubmitted(false);
  };

  // --- SUB-PAGE BACK BUTTON COMPONENT ---
  const BackNavbar = () => (
    <section className="pt-32 px-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigateTo('list')}
        className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-brand-600 hover:text-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Ministries
      </button>
    </section>
  );

  // --- VIEW RENDERING ---
  if (currentView === 'doh') {
    return (
      <div className="bg-white animate-in fade-in duration-500">
        <BackNavbar />
        <DaughtersOfHonour />
      </div>
    );
  }

  if (currentView === 'choir') {
    return (
      <div className="bg-white animate-in fade-in duration-500">
        <BackNavbar />
        <GlobalChoir onBack={() => navigateTo('list')} />
      </div>
    );
  }

  if (currentView === 'hol') {
    return (
      <div className="bg-white animate-in fade-in duration-500">
        <HomeOfLove onBack={() => navigateTo('list')} />
      </div>
    );
  }

  // 4. Added Youth View Rendering
  if (currentView === 'youth') {
    return (
      <div className="bg-white animate-in fade-in duration-500">
        <BackNavbar />
        <Youth />
      </div>
    );
  }

  return (
    <div className="bg-white relative animate-in fade-in duration-700">
      {/* --- HERO HEADER --- */}
      <section className="bg-[#0a0a0a] pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto border-l border-white/20 pl-8">
          <span className="text-brand-500 uppercase tracking-[0.4em] text-xs font-bold mb-4 block">
            Impact & Service
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight mb-6">
            Our Ministries
          </h1>
          <p className="text-gray-400 max-w-2xl text-lg font-light leading-relaxed">
            Discover where you belong in the Global Flame family. Every arm is a vital part of our mission.
          </p>
        </div>
      </section>

      {/* --- ALTERNATING LIST --- */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col gap-32">
          {MINISTRIES.map((ministry, index) => {
            const isChoir = ministry.name.toLowerCase().includes('choir');
            const isDOH = ministry.name === "Daughters of Honour";
            const isHOL = ministry.name === "Home of Love";
            const isYouth = ministry.name.toLowerCase().includes('youth'); // 5. Detect Youth

            return (
              <div
                key={ministry.id}
                className={`flex flex-col lg:items-center gap-12 md:gap-20 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                <div className="w-full lg:w-3/5 group overflow-hidden">
                  <div className="relative aspect-16/10 overflow-hidden bg-gray-100 rounded-sm shadow-2xl">
                    <img
                      src={ministry.imageUrl}
                      alt={ministry.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                  </div>
                </div>

                <div className="w-full lg:w-2/5">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-brand-600 mb-6 block">
                    {index < 9 ? `0${index + 1}` : index + 1} — Department
                  </span>
                  <h3 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">
                    {ministry.name}
                  </h3>
                  <div className="h-px w-16 bg-black mb-8"></div>
                  <p className="text-gray-600 text-lg font-light leading-relaxed mb-10">
                    {ministry.description}
                  </p>

                  <button
                    onClick={() => {
                      if (isChoir) navigateTo('choir');
                      else if (isDOH) navigateTo('doh');
                      else if (isHOL) navigateTo('hol');
                      else if (isYouth) navigateTo('youth'); // 6. Route to Youth
                      else handleGetInvolved(ministry);
                    }}
                    className="group/link inline-flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-gray-900 transition-all outline-none"
                  >
                    <span className="border-b-2 border-black pb-1 group-hover/link:border-brand-600 group-hover/link:text-brand-600 transition-all">
                      {isChoir || isDOH || isHOL || isYouth ? 'View Details & Gallery' : 'Get Involved'}
                    </span>
                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover/link:bg-black group-hover/link:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --- MODALS --- */}
      {/* Discovery Modal */}
      {isDiscoveryModalOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-2xl font-serif font-bold">Select a Team</h3>
              <button onClick={closeModal} className="p-2 hover:bg-white rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {MINISTRIES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectTeam(m)}
                  className="w-full flex items-center justify-between p-4 mb-2 rounded-2xl border border-gray-100 hover:border-brand-600 hover:bg-brand-50/30 transition-all group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <img src={m.imageUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                    <span className="font-bold text-gray-900">{m.name}</span>
                  </div>
                  <ChevronRight className="text-gray-300 group-hover:text-brand-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Join Form Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={closeModal}></div>
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            {!formSubmitted ? (
              <div className="p-10">
                <div className="flex justify-between items-start mb-8 text-left">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-600">Expression of Interest</span>
                    <h3 className="text-3xl font-serif font-bold text-gray-900 mt-1">Join {selectedMinistry?.name}</h3>
                  </div>
                  <button onClick={closeModal} className="text-gray-400 hover:text-black"><X size={24}/></button>
                </div>
                <form className="space-y-5 text-left" onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }}>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-tighter text-gray-400 mb-2">Full Name</label>
                    <input type="text" required className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Your full name" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-tighter text-gray-400 mb-2">Why this Ministry?</label>
                    <textarea required rows={3} className="w-full bg-gray-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Tell us why you feel led to join..." />
                  </div>
                  <button type="submit" className="w-full bg-black text-white font-bold uppercase tracking-widest py-5 rounded-xl hover:bg-brand-600 transition-all shadow-lg">
                    Submit Application
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-16 text-center animate-in zoom-in-95">
                <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-brand-600" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-2">Application Received</h3>
                <p className="text-gray-500 mb-8">We have received your request for the {selectedMinistry?.name} arm. Someone will contact you soon.</p>
                <button onClick={closeModal} className="border border-gray-200 px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Ministries;