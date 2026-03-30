import React from 'react';
import { ShieldCheck } from 'lucide-react';

const beliefs = [
  {
    title: 'The Holy Scripture',
    body: 'We believe the Bible is the inspired, infallible, and authoritative Word of God. It is the supreme standard by which all human conduct, creeds, and opinions shall be tried.',
  },
  {
    title: 'Discipleship',
    body: 'We believe every believer is called to grow into the likeness of Christ through intentional discipleship — studying the Word, sitting under sound teaching, serving others, and reproducing their faith in the lives of those around them. Disciples make disciples.',
  },
  {
    title: 'The Trinity',
    body: 'We believe in one God, eternally existent in three persons — Father, Son, and Holy Spirit. Each person is fully God, yet there is one God.',
  },
  {
    title: 'The Person of Jesus Christ',
    body: 'We believe in the deity of our Lord Jesus Christ, in His virgin birth, in His sinless life, in His miracles, in His atoning death, in His bodily resurrection, in His ascension to the right hand of the Father, and in His personal return to power and glory.',
  },
  {
    title: 'Salvation by Grace',
    body: 'We believe that for the salvation of lost and sinful people, regeneration by the Holy Spirit is absolutely essential. Salvation is by grace alone, through faith alone, in Christ alone.',
  },
  {
    title: 'The Holy Spirit',
    body: 'We believe in the present ministry of the Holy Spirit, by whose indwelling the Christian is enabled to live a godly life and exercise gifts for the building up of the body of Christ.',
  },
  {
    title: 'The Resurrection',
    body: 'We believe in the resurrection of both the saved and the lost — they that are saved unto the resurrection of life, and they that are lost unto the resurrection of damnation.',
  },
  {
    title: 'The Spiritual Unity of Believers',
    body: 'We believe in the spiritual unity of believers in our Lord Jesus Christ. All who are born again are members of the body of Christ, regardless of denominational affiliation.',
  },
  {
    title: 'Prayer',
    body: 'We believe in the power of prayer and its central role in the life of every believer and the corporate life of the church. Prayer is both a privilege and a responsibility.',
  },
];

const CoreBeliefs: React.FC = () => (
  <div className="min-h-screen bg-white pt-28 pb-20">
    <div className="max-w-4xl mx-auto px-6">

      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-fuchsia-500 mb-3">
        Core Beliefs
      </p>
      <h1 className="font-serif text-5xl md:text-6xl text-slate-900 mb-4 leading-tight">
        What we <br />
        <span className="italic text-fuchsia-600">stand on.</span>
      </h1>
      <p className="text-slate-500 text-lg mb-14 max-w-xl">
        These foundational beliefs are not negotiable. They are the bedrock on which
        Global Flame Ministries was built and on which it continues to stand.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {beliefs.map((b, i) => (
          <div
            key={i}
            className="p-6 border border-slate-100 rounded-2xl hover:border-fuchsia-200
              hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-fuchsia-50 rounded-lg flex items-center justify-center
                shrink-0 mt-0.5 group-hover:bg-fuchsia-100 transition-colors">
                <ShieldCheck className="w-4 h-4 text-fuchsia-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-2">
                  {b.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{b.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CoreBeliefs;