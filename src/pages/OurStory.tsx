import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import dadandmum from '../assets/dadandmum.jpg';

const OurStory: React.FC = () => (
  <div className="min-h-screen bg-white pt-28 pb-20">
    <div className="max-w-4xl mx-auto px-6">

      {/* Label */}
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
        Our History
      </p>

      {/* Title */}
      <h1 className="font-serif text-5xl md:text-6xl text-slate-900 mb-8 leading-tight">
        HOW GLOBAL FLAME <br />
        <span className="italic text-fuchsia-600">BEGAN.</span>
      </h1>

      {/* Hero image */}
      <div className="rounded-2xl overflow-hidden mb-14 aspect-video shadow-xl shadow-slate-100">
        <img src={dadandmum} alt="Global Flame Ministries" className="w-full h-full object-cover" />
      </div>

      {/* Body */}
      <div className="prose prose-slate prose-lg max-w-none prose-p:leading-relaxed prose-headings:text-gray-900 prose-blockquote:border-fuchsia-500 prose-blockquote:text-fuchsia-700">
        
        {/* Intro Paragraphs */}
        <p className="mb-8">
          Global Flame Ministries was founded on a burning conviction — that the fire of God
          should reach every heart, every city, every nation. What began as a small gathering
          of believers hungry for God's presence has grown into a vibrant, multi-faceted
          ministry touching lives across continents.
        </p>

        <p className="mb-10">
          Under the apostolic leadership of Apostle Danjuma Musa and Co-Pastor Faith Musa,
          the church has consistently pursued one mandate: to ignite the passion of Christ in
          the hearts of men and women worldwide. Like a flame that refuses to be extinguished,
          Global Flame Ministries has pressed forward through every season.
        </p>

        {/* Section: Early Days */}
        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">The Early Days</h2>
        <p className="mb-6">
          The ministry was birthed in prayer, and prayer remains its backbone. From the very
          beginning, the founding leadership understood that sustainable impact requires a
          foundation built not on the ingenuity of man but on the unshakeable word of God.
        </p>

        <p className="mb-10">
          Services were held in modest settings — borrowed halls, open-air grounds, family
          homes — yet the atmosphere was never modest. The presence of God was tangible, the
          worship was fervent, and the word of God was preached without compromise.
        </p>

        {/* Section: Growing into Purpose */}
        <h2 className="text-2xl md:text-3xl font-bold mt-12 mb-6">Growing into Purpose</h2>
        <p className="mb-6">
          As the congregation grew, so did the mandate. Ministries were raised up to serve
          distinct needs: daughters were empowered through the **Daughters of Honour** arm,
          the youth found a home in the **House of Opra**, worshippers found their voice in
          the **Global Choir**, and families found care through the **Home of Love** ministry.
        </p>

        <p className="mb-10">
          Today, Global Flame Ministries is not just a local church — it is a movement,
          a training ground, a place where ordinary people encounter an extraordinary God
          and are sent out to change their world.
        </p>

        {/* Quote Section */}
        <blockquote className="mt-12 p-8 bg-fuchsia-50 rounded-2xl italic font-semibold border-l-4 border-fuchsia-500 not-prose text-fuchsia-900">
          "Faith activates God — Fear activates the Enemy."
        </blockquote>
      </div>

      {/* CTA Section */}
      <div className="mt-16 pt-10 border-t border-slate-100 flex flex-wrap gap-4">
        <Link
          to="/senior-pastor"
          className="inline-flex items-center gap-2 px-8 py-4 bg-fuchsia-600
            text-white font-bold uppercase tracking-widest text-xs
            hover:bg-fuchsia-700 transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-fuchsia-200 rounded-lg"
        >
          Meet Our Pastor <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to="/core-beliefs"
          className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200
            text-slate-700 font-bold uppercase tracking-widest text-xs
            hover:border-fuchsia-300 hover:text-fuchsia-600 transition-all duration-200 rounded-lg"
        >
          Our Core Beliefs <Flame className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  </div>
);

export default OurStory;