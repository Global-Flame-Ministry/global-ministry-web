import type { FC, SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Eye, Award, Users, Lightbulb, Heart, Zap,
  CheckCircle, Landmark, BookOpen,
} from 'lucide-react';

const ASSET_PATH = '/images/';

const LEADERSHIP_TEAM = [
  { name: 'BENEDICT DANIEL',   role: 'UNIT HEAD GFM YOUTHS',          image: 'src/assets/images/youth/ben.jpg' },
  { name: 'EZEKIEL ISAIAH',    role: 'ASST. UNIT HEAD GFM YOUTHS',    image: 'src/assets/images/youth/isaiah.jpg' },
  { name: 'USIGBE PRINCESS',   role: 'FIN. SECRETARY GFM YOUTHS',     image: 'src/assets/images/youth/prinx.jpg' },
  { name: 'AJIK MICHELLE',     role: 'ADMIN UNIT GFM YOUTHS',         image: 'src/assets/images/youth/michelle.jpg' },
  { name: 'NANLE PANMUN',      role: 'ASST. ADMIN GFM YOUTHS',        image: 'src/assets/images/youth/HOOI.jpg' },
  { name: 'MAHLULE PRECIOUS',  role: 'WELFARE COORDINATOR GFM YOUTHS',image: 'src/assets/images/youth/officials.jpg' },
  { name: 'JONATHAN MIRACLE',  role: 'DANCE DIRECTOR GFM YOUTHS',     image: 'src/assets/images/youth/miracle.jpg' },
  { name: 'WAKAWA HYELZIRA',   role: 'WEB DEVELOPER/TECH DIRECTOR',   image: 'src/assets/images/youth/hyelzira.jpg' },
  { name: 'AMBRUCE ISRAEL',    role: 'MEDIA DIRECTOR GFM YOUTHS',     image: 'src/assets/images/youth/bruce.jpg' },
  { name: 'MAIMAKO JESSE',     role: 'MUSIC/SOUND DIRECTOR GFM YOUTHS',image: 'src/assets/images/youth/jesse.jpg' },
  { name: 'BITRUS JOSHUA DANG',role: 'CREATIVE DESIGNER GFM YOUTHS',  image: 'src/assets/images/youth/joshua.jpg' },
  { name: 'KUBA DESMOND',      role: 'POLITICAL DIRECTOR GFM YOUTHS', image: 'src/assets/images/youth/desmond.jpg' },
];

const MISSION_GOALS = [
  { icon: Lightbulb, title: 'Hope for the hopeless',
    description: 'To reach out to the hopeless and widows in communities (James 1:27, Psl.41:1-2, Mat.25:35-40)' },
  { icon: Heart, title: 'To equip and perfect the saints',
    description: 'Through the ministry of the word and the Holy Spirit (Ephesians 4:11-13)' },
  { icon: Zap, title: 'Power of the Spirit',
    description: 'To demonstrate the Holy Spirit Power through miracles, signs and wonders (Isaiah 8:18, 2 Corinthians 12:12)' },
  { icon: CheckCircle, title: 'Transformation',
    description: 'To transform individuals and territories through strategic prayers and holistic empowerment (Ezekiel 22:30, Isaiah 56:7)' },
];

const GFM_YOUTH_HISTORY = [
  { year: '1998', title: 'THE FOUNDATION', icon: Landmark, iconColor: 'text-purple-600',
    description: 'It came to birth on the 25th December 1998 and was formally registered with the CAC in 2007, under CAMA with certificate no. CAC/IT/NO 263303' },
  { year: '2007', title: 'ABOUT GLOBAL FLAME', icon: Users, iconColor: 'text-fuchsia-600',
    description: 'A commission called to restore the Glory of God to mankind in all nations of the world through the apostolic and prophetic platforms.' },
  { year: '2024', title: 'BIRTHING OF THE COMMUNITY', icon: BookOpen, iconColor: 'text-yellow-600',
    description: 'The birthing of the Global Flames Youths Community was on the 10th Nov. 2024 and has expanded widely, branching out to different groups with 194+ members.' },
];

const ImageWithFallback: FC<{ src: string; alt: string; className: string; fallback?: string }> = ({
  src, alt, className, fallback = `${ASSET_PATH}default-profile.jpg`,
}) => (
  <img src={src} alt={alt} className={className}
    onError={(e: SyntheticEvent<HTMLImageElement>) => {
      (e.target as HTMLImageElement).onerror = null;
      (e.target as HTMLImageElement).src = fallback;
    }} />
);

const FeatureItem: FC<{ icon: React.ElementType; title: string; description: string }> = ({
  icon: Icon, title, description,
}) => (
  <div className="flex items-start space-x-4">
    <Icon className="w-8 h-8 text-fuchsia-600 shrink-0 mt-1" />
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

const HistoryCard: FC<{
  year: string; title: string; description: string;
  icon: React.ElementType; iconColor: string;
}> = ({ year, title, description, icon: Icon, iconColor }) => (
  <div className="relative p-6 bg-white rounded-xl shadow-xl border-t-4
                  border-fuchsia-400 transform transition-all duration-500
                  hover:scale-[1.02] hover:shadow-2xl">
    <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 p-3
                     rounded-full bg-white shadow-lg border-2 border-fuchsia-400
                     ${iconColor}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="mt-4 pt-4 text-center">
      <p className="text-2xl font-extrabold text-fuchsia-700 mb-2">{year}</p>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
    </div>
  </div>
);

const YouthAboutPage: FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-purple-800 to-fuchsia-700
                          py-24 md:py-32 px-6 text-white text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <Zap className="absolute top-1/4 left-1/4 w-32 h-32 text-fuchsia-300 rotate-45" />
          <Award className="absolute bottom-1/4 right-1/4 w-24 h-24 text-purple-300 -rotate-45" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 uppercase
                         tracking-tighter leading-tight">
            <span className="bg-clip-text text-transparent
                             bg-gradient-to-r from-fuchsia-200 to-white">
              ABOUT GLOBAL FLAMES YOUTH COMMUNITY
            </span>
          </h1>
          <p className="text-xl font-light max-w-2xl mx-auto">
            Discover Our Journey, Our Purpose, and the Leaders Who Drive Us.
          </p>
          <Link to="/youth/contact"
            className="mt-8 inline-flex items-center px-8 py-4 bg-fuchsia-500
                       text-purple-900 rounded-full font-bold hover:bg-yellow-300
                       transition-colors shadow-lg group">
            Join Our Movement
            <Users className="w-5 h-5 ml-3 group-hover:rotate-12
                              transition-transform duration-300" />
          </Link>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="max-w-7xl mx-auto py-20 px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="text-fuchsia-700 font-semibold mb-2 text-sm
                           uppercase tracking-widest">
              AIMS AND OBJECTIVES
            </p>
            <h2 className="text-3xl font-bold mb-5 text-gray-900">
              Our Vision: Raising Nations, Shaping Futures
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6 border-l-4
                           border-fuchsia-400 pl-4 italic">
              "To raise a people of power who will manifest the Realities of
              the fullness of Christ through the Spirit."
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              The same mission Jesus gave his followers: "Go therefore and
              make disciples of all nations" (Matt. 28:19-20)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6">
              {MISSION_GOALS.map((item, i) => (
                <FeatureItem key={i} icon={item.icon}
                  title={item.title} description={item.description} />
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2">
            <ImageWithFallback
              src="/images/deliver.jpg"
              alt="Youth engaging in mission"
              className="w-full h-auto rounded-3xl shadow-2xl
                         border-4 border-fuchsia-400" />
          </div>
        </div>
      </section>

      {/* History */}
      <section id="history" className="bg-gray-100 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-fuchsia-700 font-semibold mb-2 text-sm
                           uppercase tracking-widest">OUR HERITAGE</p>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
              OUR HISTORIC JOURNEY
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              From a foundational vision to a thriving movement.
            </p>
          </div>
          <div className="relative grid md:grid-cols-3 gap-12 pt-6">
            <div className="hidden md:block absolute top-1/4 left-0 right-0
                            h-1 bg-fuchsia-200 z-0 transform translate-y-3/4" />
            {GFM_YOUTH_HISTORY.map((card, i) => (
              <HistoryCard key={i} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section id="vision" className="bg-fuchsia-50 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-fuchsia-700 font-semibold mb-2 text-sm uppercase tracking-wide">
            GLOBAL FLAME (APOSTLE DANJUMA MUSA GAKSU)
          </p>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            OUR MOTTO: Raising a people of power who will manifest the kingdom
            and the realities of the fullness of Christ through the Holy Spirit.
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto text-lg leading-relaxed mb-12">
            MISSION: Immense salvation of souls, equipping the saints and
            manifesting the kingdom through the demonstration of the Holy
            Spirit Power.
          </p>
          <h2 className="text-5xl font-bold mb-10 text-gray-950">CORE VALUES</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, color: 'text-purple-600', border: 'border-purple-600',
                title: 'Commission', desc: 'We are committed to God and the ministry of the Holy Spirit in all we do.' },
              { icon: Eye, color: 'text-fuchsia-700', border: 'border-fuchsia-600',
                title: 'Fellowship', desc: 'To be at the forefront of youth development through Prayer, Fellowships and Character Building.' },
              { icon: Award, color: 'text-yellow-500', border: 'border-yellow-400',
                title: 'Integrity', desc: 'To cultivate love, integrity and accountability.' },
              { icon: Target, color: 'text-purple-600', border: 'border-purple-600',
                title: 'Excellence', desc: 'Anointing and Excellence.' },
              { icon: Award, color: 'text-fuchsia-600', border: 'border-fuchsia-600',
                title: 'Partnerships', desc: 'Engaging in Fruitful partnerships.' },
            ].map((v, i) => (
              <div key={i} className={`bg-white p-6 rounded-2xl shadow-xl
                                       border-t-4 ${v.border}
                                       hover:shadow-2xl transition-shadow`}>
                <v.icon className={`w-10 h-10 ${v.color} mx-auto mb-4`} />
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{v.title}</h3>
                <p className="text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/youth/services"
            className="mt-12 inline-flex items-center px-8 py-4 bg-fuchsia-700
                       text-white rounded-full font-bold text-lg
                       hover:bg-purple-800 transition-colors shadow-lg">
            Explore Our Programs <Target className="w-5 h-5 ml-3" />
          </Link>
        </div>
      </section>

      {/* Leadership */}
      <section id="leadership" className="max-w-7xl mx-auto py-20 px-6">
        <div className="text-center mb-12">
          <p className="text-fuchsia-700 font-semibold mb-2 text-sm
                         uppercase tracking-widest">MEET THE TEAM</p>
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            CORE LEADERSHIP TEAM
          </h2>
          <p className="text-gray-700 max-w-3xl mx-auto text-lg">
            Our dedicated team of youths, mentors, and leadership members work
            tirelessly to ensure every young person receives the support,
            understanding and guidance they need to thrive.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {LEADERSHIP_TEAM.map((leader, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg
                                    border border-gray-100 overflow-hidden
                                    group hover:shadow-xl transition-shadow">
              <div className="relative overflow-hidden w-full h-60
                              bg-gray-200 flex items-center justify-center">
                <div className="absolute inset-0 bg-yellow-400 opacity-20
                                group-hover:opacity-30 transition-opacity" />
                <ImageWithFallback src={leader.image} alt={leader.name}
                  className="w-full h-full object-cover object-center
                             transform group-hover:scale-105 transition-transform"
                  fallback={`${ASSET_PATH}default-profile-thumb.jpg`} />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {leader.name}
                </h3>
                <p className="text-fuchsia-600 text-sm font-medium uppercase">
                  {leader.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-black text-white py-12 px-5 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-medium mb-3">
            Be Part of Something Bigger
          </h2>
          <p className="opacity-60 mb-6">
            Our growth is powered by passionate individuals. Explore
            opportunities to contribute your talents!
          </p>
          <Link to="/youth/team"
            className="inline-flex items-center px-8 py-4 bg-fuchsia-600
                       text-white rounded font-bold hover:bg-purple-600
                       transition-colors shadow-lg">
            Meet The Team <Users className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default YouthAboutPage;