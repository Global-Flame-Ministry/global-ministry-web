import type { FC } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, Lightbulb, Users, Handshake, BookOpen,
  Megaphone, Sparkles, Leaf, ArrowRight,
} from 'lucide-react';

const CORE_SERVICES = [
  { icon: Users, title: 'ACCOUNTABILITY',
    description: 'Forge deep, lasting friendships through weekly services and targeted small group mentorship.' },
  { icon: Lightbulb, title: 'TRANSPARENCY',
    description: 'Unlock profound biblical truths and gain practical wisdom through the gathering of the brethren.' },
  { icon: BookOpen, title: 'TIMELY DISCLOSURE',
    description: 'Equip yourself with practical skills for the modern world, going out and winning souls through the accuracy of the word and media.' },
  { icon: Handshake, title: 'HONESTY',
    description: 'Connect one-on-one with seasoned leaders and mentors who provide honest and accurate support in your walk with Christ.' },
  { icon: Megaphone, title: 'COMMUNICATION',
    description: 'Be the light in your community. Participate in mission trips, local evangelism, and social impact projects.' },
  { icon: Leaf, title: 'ACTING IN INTEGRITY',
    description: 'A focused program on defining your divine calling, mastering leadership traits, and building character for long-term fulfilment.' },
];

const HOW_WE_SERVE_STEPS = [
  { step: '1. Discover', title: 'Find Your Community', icon: Users,
    description: 'Discover a GFM Youth group, join our online community. This is where your journey starts.' },
  { step: '2. Develop', title: 'Grow Your Capacity', icon: Lightbulb,
    description: 'Engage fully with a core service — attend a seminar, join a mentorship circle, or enrol in a skills workshop.' },
  { step: '3. Express', title: 'Live Out Your Calling', icon: Heart,
    description: 'Use your newly developed gifts to serve others, either in our outreach programs or within the church ministry.' },
  { step: '4. Multiply', title: 'Lead the Next Generation', icon: Sparkles,
    description: 'Step into leadership, become a mentor, and help us raise the next wave of purpose-driven youth.' },
];

const YouthServicesPage: FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

      {/* Hero */}
      <section className="bg-gradient-to-br from-fuchsia-800 to-purple-900
                          text-white py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black mb-4 uppercase leading-tight">
            <span className="block text-fuchsia-300 text-lg uppercase
                             tracking-widest mb-2 font-extrabold">
              Service Pillars
            </span>
            Building Lives of Power & Purpose
          </h1>
          <p className="text-lg md:text-xl font-light opacity-95 max-w-2xl
                         mx-auto border-t border-fuchsia-400 pt-4">
            We don't just offer activities — we provide transformational
            pathways. Explore our communities designed to nurture the person:
            Spirit, Mind, and Body.
          </p>
          <Link to="/youth/contact"
            className="mt-9 inline-flex items-center justify-center px-8 py-3
                       bg-yellow-400 text-purple-900 rounded-full font-extrabold
                       text-lg hover:bg-yellow-300 transition-colors shadow-2xl group">
            Ready to Start? Let's Connect
            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1
                                   transition-transform" />
          </Link>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-4
                           border-b-4 border-fuchsia-100 inline-block pb-2">
              THE PILLARS OF TRANSPARENCY
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Each pillar is built to support a specific dimension of a young
              person's life, ensuring holistic development and impact.
            </p>
          </div>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {CORE_SERVICES.map((service, i) => (
              <div key={i} className="p-8 bg-white rounded-2xl shadow-xl
                                      border-t-8 border-purple-500
                                      hover:shadow-2xl transition-all group
                                      relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-200
                                rounded-full opacity-30 group-hover:opacity-40
                                transform -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-center mb-4 relative z-10">
                  <div className="p-3 bg-fuchsia-100 rounded-full mr-4
                                  border-2 border-fuchsia-400">
                    <service.icon className="w-8 h-8 text-fuchsia-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {service.title}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed pl-14">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Serve */}
      <section className="py-20 px-6 bg-fuchsia-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-fuchsia-700 font-semibold mb-2 text-sm
                           uppercase tracking-widest">The Global Flame Pathway</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-4">
              Four-Step Journey to Impact
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A deliberate and proven process for sustainable spiritual and
              personal development.
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute left-1/2 w-0.5
                            bg-fuchsia-300 h-full transform -translate-x-1/2 z-0" />
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4
                            gap-12 relative z-10">
              {HOW_WE_SERVE_STEPS.map((item, i) => (
                <div key={i}
                  className={`flex flex-col items-center text-center p-8
                               bg-white rounded-xl shadow-2xl border-b-4
                               border-purple-600 ${i % 2 !== 0 ? 'lg:mt-16' : ''}`}>
                  <div className="w-20 h-20 bg-purple-600 rounded-full flex
                                  items-center justify-center mb-4 shadow-xl">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-fuchsia-600
                                 uppercase tracking-widest">{item.step}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 mt-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-purple-900 text-white py-10 px-3 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black mb-3">
            Don't Wait For Change. Be The Change.
          </h2>
          <p className="opacity-80 mb-4 font-light">
            Take the decisive step toward realizing your full, God-given
            potential. Our community is waiting to empower and enrich you.
          </p>
          <Link to="/youth/contact"
            className="inline-flex items-center justify-center px-6 py-3
                       bg-fuchsia-600 text-white rounded-full font-bold text-xl
                       hover:bg-purple-600 transition-colors shadow-2xl">
            Join Us Today!
            <ArrowRight className="w-5 h-5 ml-3" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default YouthServicesPage;