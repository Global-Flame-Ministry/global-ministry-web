import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import daddy from '../assets/daddy.jpg';

const SeniorPastor: React.FC = () => (
  <div className="min-h-screen bg-white pt-28 pb-20">
    <div className="max-w-4xl mx-auto px-6">

      {/* Label */}
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
        Senior Pastor
      </p>
      
      {/* Title */}
      <h1 className="font-serif text-5xl md:text-6xl text-slate-900 mb-8 leading-tight">
        APOSTLE <br />
        <span className="italic text-fuchsia-600">DANJUMA MUSA.</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-14">
        {/* Image Column */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-2xl shadow-slate-200">
            <img src={daddy} alt="Apostle Danjuma Musa" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-3 prose prose-slate prose-lg max-w-none prose-p:leading-relaxed prose-blockquote:border-fuchsia-500">
          <p className="mb-6">
            Apostle Danjuma Musa is the founding Senior Pastor of Global Flame Ministries.
            Called from a young age into the ministry of the word, he carries a rare
            combination of apostolic boldness and pastoral warmth — a man equally at home
            in the place of prayer as he is on the platform.
          </p>
          
          <p className="mb-8">
            His ministry is marked by a deep reverence for the word of God, a passion for
            the lost, and an unwavering commitment to raising disciples who themselves
            become leaders. His teaching cuts through the noise of the age and speaks
            directly to the human spirit.
          </p>

          {/* Styled Quote Box */}
          <blockquote className="my-10 p-6 bg-fuchsia-50 rounded-2xl italic font-semibold border-l-4 border-fuchsia-500 not-prose text-fuchsia-900">
            "Faith activates God — Fear activates the Enemy."
          </blockquote>

          <p className="mb-6">
            Under his leadership, Global Flame Ministries has grown from a small gathering
            into a thriving congregation with arms reaching into multiple areas of ministry.
            His vision extends beyond the walls of the church — he sees a global harvest
            and is relentless in pursuing it.
          </p>
          
          <p className="mb-6">
            He is married to **Co-Pastor Faith Musa**, his faithful partner in ministry and
            in life, and together they lead Global Flame Ministries with a shared heart
            for people and an uncompromising love for God.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-12 pt-10 border-t border-slate-100 flex flex-wrap gap-4">
        <Link
          to="/co-pastor"
          className="inline-flex items-center gap-2 px-8 py-4 bg-fuchsia-600
            text-white font-bold uppercase tracking-widest text-xs
            hover:bg-fuchsia-700 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-fuchsia-200 rounded-lg"
        >
          Meet Co-Pastor <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/our-story"
          className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200
            text-slate-700 font-bold uppercase tracking-widest text-xs
            hover:border-fuchsia-300 hover:text-fuchsia-600 transition-all duration-200 rounded-lg"
        >
          Our Story <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  </div>
);

export default SeniorPastor;