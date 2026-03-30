import React from 'react';
import { Globe } from 'lucide-react';

const OurMission: React.FC = () => (
  <div className="min-h-screen bg-white pt-28 pb-20 flex items-center justify-center">
    <div className="text-center max-w-md px-6">
      <div className="w-16 h-16 bg-fuchsia-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Globe className="w-8 h-8 text-fuchsia-500" />
      </div>
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
        Our Mission
      </p>
      <h1 className="font-serif text-4xl text-slate-900 mb-4">Coming Soon</h1>
      <p className="text-slate-500 text-sm">
        This page is being prepared. Check back shortly.
      </p>
    </div>
  </div>
);

export default OurMission;