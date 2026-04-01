import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import dadandmum from '../assets/mummy.jpg';

const CoPastor: React.FC = () => (
  <div className="min-h-screen bg-white pt-28 pb-20">
    <div className="max-w-4xl mx-auto px-6">

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
        Co-Pastor
      </p>
      <h1 className="font-serif text-5xl md:text-6xl text-slate-900 mb-8 leading-tight">
        APOSTLE <br />
        <span className="italic text-fuchsia-600">FAITH MUSA.</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-14">
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden aspect-3/4 shadow-xl">
            <img src={dadandmum} alt="Apostle Faith Musa" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="lg:col-span-3 prose prose-slate prose-lg max-w-none">
          <p>
            Apostle Faith Musa serves as the Co-Pastor of Global Flame Ministries alongside
            her husband, Apostle Danjuma Musa.
            Her name is not incidental — Faith is both her identity and her ministry.
            She moves in a remarkable grace for strengthening believers and calling out 
            the potential God has placed in every person she encounters.
          </p>
          <p>
            Her ministry has a particular anointing for women's empowerment, family
            wholeness, and worship. She is the driving force behind the Daughters of Honour
            arm of the ministry, a platform dedicated to raising women who are confident
            in their identity in Christ and effective in their spheres of influence.
          </p>
          <p>
            Her teaching style is direct, compassionate, and deeply rooted in scripture.
            She has a gift for taking complex spiritual truths and delivering them in ways
            that are accessible, practical, and transformative.
          </p>
          <p>
            Together with Apostle Danjuma Musa, she provides Global Flame Ministries with
            a balanced, complementary leadership that reflects the heart of God for both
            men and women in the body of Christ.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          to="/senior-pastor"
          className="inline-flex items-center gap-2 px-8 py-4 bg-fuchsia-600
            text-white font-bold uppercase tracking-widest text-xs
            hover:bg-fuchsia-700 transition-colors rounded-lg"
        >
          Senior Pastor <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/our-story"
          className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200
            text-slate-700 font-bold uppercase tracking-widest text-xs
            hover:border-fuchsia-300 hover:text-fuchsia-600 transition-colors rounded-lg"
        >
          Our Story <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  </div>
);

export default CoPastor;