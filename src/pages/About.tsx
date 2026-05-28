import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';
import { CHURCH_NAME } from '../constants';
import { Globe, Anchor, Compass, ShieldCheck, ArrowLeft } from 'lucide-react';

// Assets
import preach from '../assets/preach.jpg';
import mummy from '../assets/mummy.jpg';
import dad from '../assets/dad.jpg';
import dadandmum from '../assets/dadandmum.jpg';
import auditorium from '../assets/auditorium.jpg';
import cong from '../assets/cong.jpg';

const About: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('danjuma');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tabs = [
    { id: 'danjuma', label: 'The Senior Pastor', icon: <Compass className="w-3 h-3" /> },
    { id: 'faith', label: 'The Co-Pastor', icon: <Anchor className="w-3 h-3" /> },
    { id: 'story', label: 'Our Heritage', icon: <Globe className="w-3 h-3" /> },
    { id: 'beliefs', label: 'The Foundation', icon: <ShieldCheck className="w-3 h-3" /> },
  ];

  return (
    <div className="bg-[#fcfcfc] selection:bg-brand-100">
      <SEO
        title="About Global Flame Ministry"
        description="Learn about Global Flame Ministry, our story, leadership, and core beliefs."
        url="https://globalflameministry.org/about"
      />
      
      {/* 1. CINEMATIC CRUISE-STYLE HERO */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={auditorium} 
            alt="Auditorium" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom" 
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/20 to-black/70"></div>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <div className="flex items-center justify-center gap-4 mb-6 opacity-80">
            <div className="h-px w-12 bg-white/50"></div>
            <span className="text-white text-[10px] uppercase tracking-[0.5em] font-medium">Est. 1999</span>
            <div className="h-px w-10 bg-white/50"></div>
          </div>
          <h1 className="text-5xl md:text-8xl font-serif text-white tracking-tight mb-4 italic">
            Apostolic & Prophetic
          </h1>
          <p className="text-white/70 text-sm md:text-base uppercase tracking-[0.3em] font-light">
            Global Flame Ministries
          </p>
        </div>

        {/* Floating Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <div className="w-px h-16 bg-linear-to-b from-white to-transparent"></div>
        </div>

        <div className="absolute top-32 left-6 z-20">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/20 text-white/80 font-bold uppercase tracking-widest text-xs hover:border-fuchsia-400 hover:text-fuchsia-400 transition-all duration-200 rounded-lg cursor-pointer bg-black/20 backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </section>

      {/* 2. JEWELRY STORE SUB-NAV (STRIKING & MINIMAL) */}
      <div className={`sticky top-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white shadow-xl py-2' : 'bg-white py-4'} border-b border-slate-100`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center space-x-8 md:space-x-20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex items-center gap-2 py-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] transition-all relative ${
                  activeTab === tab.id ? 'text-brand-600' : 'text-slate-400 hover:text-slate-900'
                }`}
              >
                <span className={`transition-transform duration-500 ${activeTab === tab.id ? 'rotate-12 scale-125' : 'group-hover:rotate-12'}`}>
                    {tab.icon}
                </span>
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 transition-all"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. EDITORIAL CONTENT AREAS */}
      <main className="max-w-7xl mx-auto px-6 py-32">
        
        {/* THE SENIOR PASTOR */}
        {activeTab === 'danjuma' && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
              <div className="lg:col-span-5 order-2 lg:order-1">
                <div className="relative group">
                    <div className="absolute -inset-4 border border-brand-200 translate-x-4 translate-y-4 -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-all duration-700"></div>
                    <img src={preach} alt="Apostle Preaching" className="w-full shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 aspect-4/5 object-cover" />
                </div>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2">
                <span className="text-brand-600 font-bold uppercase tracking-[0.4em] text-[10px] mb-6 block">The Visionary</span>
                <h2 className="text-5xl md:text-7xl font-serif text-slate-900 mb-8 leading-[1.1]">
                  Apostle <br /> <span className="italic">Danjuma Musa</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <p className="text-slate-600 text-lg font-light leading-relaxed">
                        Raised in a family dedicated to ministry, Danjuma Musa Gasuk never imagined he would lead a global movement. He bridges the gap between ancient scripture and modern life.
                    </p>
                    <p className="text-slate-500 font-light leading-relaxed border-l border-slate-200 pl-6 italic">
                        "There’s no greater feeling than being able to help people rise higher and overcome something."
                        "The journey so far has been through the guidance of the Holy Spirit."
                    </p>
                </div>
                
                <div className="mt-16 grid grid-cols-2 gap-6 opacity-80">
                    <img src={dad} className="h-64 w-full object-cover rounded-sm shadow-lg hover:opacity-100 transition-opacity" alt="Portrait" />
                    <img src={cong} className="h-64 w-full object-cover rounded-sm shadow-lg hover:opacity-100 transition-opacity" alt="Work" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CO-PASTOR (JEWELRY SHOWCASE STYLE) */}
        {activeTab === 'faith' && (
          <div className="animate-in fade-in duration-1000 flex flex-col items-center">
            <div className="max-w-2xl text-center mb-20">
                <span className="text-brand-600 font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">Grace & Leadership</span>
                <h2 className="text-5xl md:text-7xl font-serif text-slate-900 italic mb-8">Apostle Faith Musa</h2>
                <div className="h-px w-24 bg-brand-200 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
                <div className="relative px-12">
                     <div className="absolute top-0 right-0 w-full h-full border border-slate-100 -translate-y-8 translate-x-8 -z-10"></div>
                     <img src={mummy} alt="Apostle Faith" className="w-full shadow-2xl" />
                </div>
                <div className="space-y-8 text-slate-600 font-light leading-relaxed text-xl">
                    <p className="first-letter:text-5xl first-letter:font-serif first-letter:mr-3 first-letter:float-left first-letter:text-brand-600">
                        As co-pastor of {CHURCH_NAME}, Faith Musa is a voice of encouragement and love. She is passionate about women's ministry, worship, and seeing families restored.
                    </p>
                    <p className="bg-slate-50 p-8 border-l-2 border-brand-400 text-lg italic font-serif">
                        Faith founded the "Home of Love and Daughters of Honour" initiative, a global community dedicated to empowering women and young women to walk in their God-given identity.
                    </p>
                </div>
            </div>
          </div>
        )}

        {/* HERITAGE SECTION (CRUISE LINE HISTORY STYLE) */}
        {activeTab === 'story' && (
          <div className="animate-in fade-in duration-1000">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-32">
                <div>
                   <h2 className="text-6xl font-serif text-slate-900 leading-tight mb-8">A Journey <br /><span className="text-brand-600 italic">of Purpose.</span></h2>
                   <p className="text-slate-500 text-xl font-light mb-12">Global Flame Ministry came to birth on the 25th December 1999 via a divine mandate. It began with a spark that has now reached the ends of the earth.</p>
                   
                   <div className="space-y-12">
                      {[
                        { year: "1999", title: "The Divine Mandate", desc: "A call to ignite global transformation thus the slogan 'Raising a people who will manifest the kingdom'." },
                        { year: "2007", title: "Global Expansion", desc: "Recieved formal registration no. CAC/IT/NO 263303 and the first international outreach." },
                        { year: "Today", title: "The Flame Continues", desc: "Impacting thousands across states, nations and continents daily." }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-8 group">
                            <span className="text-brand-600 font-serif italic text-2xl group-hover:scale-110 transition-transform">{item.year}</span>
                            <div>
                                <h4 className="font-bold text-xs uppercase tracking-widest text-slate-900 mb-2">{item.title}</h4>
                                <p className="text-slate-500 font-light text-sm">{item.desc}</p>
                            </div>
                        </div>
                      ))}
                   </div>
                </div>
                <div className="relative">
                    <img src={dadandmum} alt="Pastors" className="w-full h-150 object-cover grayscale brightness-75 shadow-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-2/3 h-64 bg-white p-4 shadow-2xl hidden md:block">
                         <img src={auditorium} className="w-full h-full object-cover" alt="Church" />
                    </div>
                </div>
             </div>
          </div>
        )}

        {/* CORE VALUES (THE "COLLECTION") */}
        {activeTab === 'beliefs' && (
          <div className="animate-in fade-in duration-1000">
            <div className="text-center max-w-2xl mx-auto mb-24">
                <span className="text-brand-600 font-bold uppercase tracking-[0.4em] text-[10px] mb-4 block">The Core Values</span>
                <h2 className="text-5xl font-serif text-slate-900 mb-6 italic underline decoration-brand-100 underline-offset-8">Our Foundation</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 border border-slate-200 shadow-2xl">
              {[
                { title: "The Bible", text: "We believe the Bible is the inspired, infallible Word of God and is the final authority for life and faith." },
                { title: "The Trinity", text: "One God, eternally existing in three persons: Father, Son, and Holy Spirit." },
                { title: "Salvation", text: "A free gift of God, received by grace through faith in Jesus Christ." },
                { title: "The Spirit", text: "Empowerment for daily living through the indwelling of the Holy Spirit." },
                { title: "Church", text: "The global body of believers called to love and serve the world." },
                { title: "Grace", text: "The unmerited favor of God that transforms and sustains us." },
                { title: "Love", text: "The unmerited favor of God that transforms and sustains us." },
                { title: "Integrity", text: "The unmerited favor of God that transforms and sustains us." },
                { title: "Accountability", text: "The unmerited favor of God that transforms and sustains us." },
                { title: "Fruitful partnerships", text: "The unmerited favor of God that transforms and sustains us." },
                { title: "Prayer", text: "The unmerited favor of God that transforms and sustains us." },
                { title: "The whole person", text: "The unmerited favor of God that transforms and sustains us." },
              ].map((belief, i) => (
                <div key={i} className="bg-white p-12 hover:bg-slate-50 transition-all group">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest block mb-10 group-hover:text-brand-400 transition-colors">Point 0{i+1}</span>
                  <h3 className="text-2xl font-serif text-slate-900 mb-6 group-hover:translate-x-2 transition-transform">{belief.title}</h3>
                  <p className="text-slate-500 font-light leading-relaxed text-sm">
                    {belief.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default About;