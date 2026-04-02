import React from 'react';
import { Globe, Eye } from 'lucide-react';

const OurMission: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-28 pb-20">

      {/* ================= HEADER ================= */}
      <div className="text-center max-w-3xl mx-auto px-6 mb-16">
        <div className="w-16 h-16 bg-fuchsia-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Globe className="w-6 h-6 text-fuchsia-500" />
        </div>

        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
          Who We Are
        </p>

        <h1 className="font-serif text-4xl md:text-5xl text-slate-900 mb-4">
          Our Mission & Vision
        </h1>

        <p className="text-slate-500 text-sm md:text-base">
          Discover the heartbeat of our ministry — why we exist and where God is leading us.
        </p>
      </div>

      {/* ================= IMAGE SECTION ================= */}
      <div className="max-w-6xl mx-auto px-6 mb-20">
        <div className="rounded-3xl overflow-hidden shadow-xl">
          <img
            src="/mission.jpg"  // 👉 replace with your image path
            alt="Our Mission"
            className="w-full h-[350px] md:h-[450px] object-cover"
          />
        </div>
      </div>

      {/* ================= MISSION & VISION ================= */}
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10">

        {/* -------- Mission -------- */}
        <div className="bg-slate-50 rounded-3xl p-10 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-6">
            <Globe className="w-6 h-6 text-fuchsia-600" />
          </div>

          <h2 className="font-serif text-2xl text-slate-900 mb-4">
            Our Mission
          </h2>

          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
            Our mission is to spread the love of Christ across nations,
            raising transformed lives through the Word of God, worship,
            discipleship, and compassionate outreach. We are committed to
            building a community where faith grows, hope is restored,
            and purpose is discovered.
          </p>
        </div>

        {/* -------- Vision -------- */}
        <div className="bg-slate-50 rounded-3xl p-10 shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-6">
            <Eye className="w-6 h-6 text-fuchsia-600" />
          </div>

          <h2 className="font-serif text-2xl text-slate-900 mb-4">
            Our Vision
          </h2>

          <p className="text-slate-600 leading-relaxed text-sm md:text-base">
            Our vision is to see lives empowered spiritually, families
            restored, and communities transformed through the power of
            God's presence. We envision a global movement of believers
            walking in purpose, love, and unwavering faith.
          </p>
        </div>

      </div>

      {/* ================= FOOT NOTE ================= */}
      <div className="text-center mt-20 px-6">
        <p className="text-slate-400 text-sm italic">
          “Impacting lives, transforming nations, advancing God's kingdom.”
        </p>
      </div>

    </div>
  );
};

export default OurMission;