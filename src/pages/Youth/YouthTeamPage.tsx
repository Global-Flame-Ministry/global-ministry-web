import { useState, useEffect } from 'react';
import type { FC, SyntheticEvent } from 'react';
import {
  Users, Medal, HeartHandshake, Zap, X, CheckCircle,
} from 'lucide-react';
import { ministryApi } from '../../api/ministryApi';
import type { MinistryResponseDto } from '../../types';

// Image imports — paths updated to youth subfolder
import hyelzira from '../../assets/images/hyelzira.jpg';
import bruce    from '../../assets/images/bruce.jpg';
import emie     from '../../assets/images/emie.jpg';
import joshua   from '../../assets/images/joshua.jpg';
import bamaiyi  from '../../assets/images/bamaiyi.jpg';
import aibe     from '../../assets/images/aibe.jpg';
import rich     from '../../assets/images/rich.jpg';
import nenla    from '../../assets/images/nenla.jpg';
import victor   from '../../assets/images/Victor.jpg';
import joan     from '../../assets/images/joan.jpg';
import vic      from '../../assets/images/vic.jpg';
import smile    from '../../assets/images/smile.jpg';
import SEO from '../../components/SEO';

const assetImages = {
  'hyelzira.jpg': hyelzira, 'bruce.jpg': bruce,   'emie.jpg': emie,
  'joshua.jpg': joshua,     'bamaiyi.jpg': bamaiyi,'aibe.jpg': aibe,
  'rich.jpg': rich,         'nenla.jpg': nenla,    'victor.jpg': victor,
  'joan.jpg': joan,         'vic.jpg': vic,        'smile.jpg': smile,
};

interface TeamMember {
  name: string; role: string;
  image: keyof typeof assetImages; unit: string;
}

const ALL_TEAM_MEMBERS: TeamMember[] = [
  { name: 'WAKAWA HYELZIRA',   role: 'WEB DEVELOPER GFM YOUTHS',          image: 'hyelzira.jpg', unit: 'Core Leadership' },
  { name: 'AMBRUCE ISRAEL',    role: 'MEDIA DIRECTOR GFM YOUTHS',         image: 'bruce.jpg',    unit: 'Core Leadership' },
  { name: 'AMBRUCE EMILY',     role: 'EDU. ADMIN GFM YOUTHS',             image: 'emie.jpg',     unit: 'Core Leadership' },
  { name: 'BITRUS JOSHUA DANG',role: 'CREATIVE DESIGNER GFM YOUTHS',      image: 'joshua.jpg',   unit: 'Core Leadership' },
  { name: 'TANGKAT BAMAIYI',   role: 'EVERYTHING GODLY DATING ADMIN',     image: 'bamaiyi.jpg',  unit: 'Godly Dating' },
  { name: 'DAUDA AIBESI',      role: 'EVERYTHING POETRY ADMIN',           image: 'aibe.jpg',     unit: 'Poetry Ministry' },
  { name: 'TEDDY RICHARDS',    role: 'EVERYTHING SPORTS ADMIN',           image: 'rich.jpg',     unit: 'Sports Dept.' },
  { name: 'WOPHIL NENLA',      role: 'EVERYTHING FASHION ADMIN',          image: 'nenla.jpg',    unit: 'Fashion Dept.' },
  { name: 'KWATRI VICTOR',     role: 'EVERYTHING MOVIES ADMIN',           image: 'victor.jpg',   unit: 'Movies Dept.' },
  { name: 'WAKAWA HIRHYEL',    role: 'EVERYTHING POLITICS ADMIN',         image: 'joan.jpg',     unit: 'Politics Dept.' },
  { name: 'PAM VICTORY',       role: 'EVERYTHING BUSINESS ADMIN',         image: 'vic.jpg',      unit: 'Business Dept.' },
  { name: 'FEMI JAMES',        role: 'USHERS LEAD',                       image: 'smile.jpg',    unit: 'Service & Protocol' },
];

// ── IMAGE WITH FALLBACK ───────────────────────────────────────────────────────
const ImageWithFallback: FC<{
  src: string; alt: string; className: string;
}> = ({ src, alt, className }) => (
  <img src={src} alt={alt} loading="lazy" className={className}
    onError={(e: SyntheticEvent<HTMLImageElement>) => {
      (e.target as HTMLImageElement).onerror = null;
      (e.target as HTMLImageElement).src =
        `https://via.placeholder.com/400x300/F0F0F0/888888?text=${alt.split(' ')[0]}`;
    }} />
);

// ── TEAM CARD ─────────────────────────────────────────────────────────────────
const TeamCard: FC<{ member: TeamMember }> = ({ member }) => {
  const src = assetImages[member.image];
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100
                    overflow-hidden group hover:shadow-xl transition-shadow">
      <div className="relative overflow-hidden w-full h-60 bg-gray-200">
        <div className="absolute inset-0 bg-fuchsia-400 opacity-20
                        group-hover:opacity-30 transition-opacity" />
        <ImageWithFallback src={src} alt={member.name}
          className="w-full h-full object-cover object-center transform
                     group-hover:scale-105 transition-transform duration-300" />
      </div>
      <div className="p-5 text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{member.name}</h3>
        <p className="text-fuchsia-600 text-sm font-medium uppercase">
          {member.role}
        </p>
        <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold
                         text-purple-800 bg-purple-100 rounded-full">
          {member.unit}
        </span>
      </div>
    </div>
  );
};

// ── DEPARTMENT CARD (DYNAMIC) ─────────────────────────────────────────────────
const DepartmentCard: FC<{ dept: MinistryResponseDto }> = ({ dept }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border-b-4
                  border-fuchsia-500 text-center hover:shadow-xl transition-shadow">
    <Users className="w-10 h-10 text-fuchsia-700 mx-auto mb-3" />
    <h3 className="text-xl font-bold text-gray-900 mb-2">{dept.name}</h3>
    <p className="text-gray-600 text-sm">{dept.shortDescription}</p>
  </div>
);

// ── MODALS ────────────────────────────────────────────────────────────────────
const SuccessModal: FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center
                  bg-gray-900/50 p-4" onClick={onClose}>
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm
                    p-8 text-center" onClick={e => e.stopPropagation()}>
      <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
      <h3 className="text-2xl font-bold text-gray-800 mb-2">
        Application Received!
      </h3>
      <p className="text-gray-600">
        Thank you for applying. A unit leader will be in touch soon!
      </p>
    </div>
  </div>
);

const VolunteerModal: FC<{
  onClose: () => void; onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    onSuccess();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-gray-900/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg
                      max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-fuchsia-700 text-white p-5
                        flex justify-between items-center rounded-t-xl">
          <h2 className="text-2xl font-bold">Join the GFM Youth Team</h2>
          <button onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Fill out the form below to let us know where your passion and
            skills lie.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input type="text" required
                className="w-full p-3 border border-gray-300 rounded-lg
                           focus:ring-fuchsia-500 focus:border-fuchsia-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input type="email" required
                className="w-full p-3 border border-gray-300 rounded-lg
                           focus:ring-fuchsia-500 focus:border-fuchsia-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Unit
              </label>
              <select required
                className="w-full p-3 border border-gray-300 rounded-lg
                           focus:ring-fuchsia-500 focus:border-fuchsia-500 bg-white">
                <option value="">Select a Unit...</option>
                {['Tech & Media','Welfare & Outreach','Service & Protocol',
                  'Choir & Music','Dance Ministry','Prayer Team','Godly Dating',
                  'Poetry Ministry','Sports Dept.','Fashion Dept.',
                  'Movies Dept.','Politics Dept.','Business Dept.',
                ].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tell us about yourself (Optional)
              </label>
              <textarea rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg
                           focus:ring-fuchsia-500 focus:border-fuchsia-500" />
            </div>
            <button type="submit"
              className="w-full inline-flex items-center justify-center px-6
                         py-3 bg-fuchsia-600 text-white font-bold rounded-lg
                         hover:bg-purple-700 transition-colors shadow-lg text-lg">
              Submit Application
              <HeartHandshake className="w-5 h-5 ml-2" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── SKELETON ──────────────────────────────────────────────────────────────────
const DeptSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-md animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-full mx-auto mb-3" />
    <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
    <div className="h-4 bg-gray-200 rounded w-full" />
  </div>
);

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const YouthTeamPage: FC = () => {
  const [departments, setDepartments] = useState<MinistryResponseDto[]>([]);
  const [deptLoading, setDeptLoading] = useState(true);
  const [isModalOpen, setIsModalOpen]     = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await ministryApi.getAll({ pageSize: 50 });
        setDepartments(res.data.data?.items ?? []);
      } catch {
        // Fail silently — departments section just won't show
      } finally {
        setDeptLoading(false);
      }
    };
    load();
  }, []);

  const coreTeam  = ALL_TEAM_MEMBERS.filter(m => m.unit === 'Core Leadership');
  const otherTeam = ALL_TEAM_MEMBERS.filter(m => m.unit !== 'Core Leadership');

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <SEO title="Youth Team" description="Meet the leadership team of the Global Flame Ministry Youth Community." url="https://globalflameministry.org/youth/team" />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-indigo-900
                          to-fuchsia-700 py-28 md:py-40 px-6 text-white
                          text-center overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-15">
          <Users className="absolute top-1/4 left-1/4 w-32 h-32 text-indigo-400
                            rotate-12 opacity-50 blur-sm" />
          <Medal className="absolute bottom-1/4 right-1/4 w-40 h-40
                            text-fuchsia-400 -rotate-45 opacity-50" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 uppercase
                         tracking-tighter leading-tight drop-shadow-lg">
            <span className="text-transparent bg-clip-text
                             bg-gradient-to-r from-yellow-300 to-white">
              MEET OUR INCREDIBLE CREW
            </span>
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-90
                         max-w-3xl mx-auto mt-6 italic">
            The dedicated leaders and vibrant volunteers who serve with passion
            to bring the vision to life.
          </p>
          <button onClick={() => setIsModalOpen(true)}
            className="mt-10 inline-flex items-center px-10 py-3 bg-yellow-400
                       text-indigo-900 rounded-full font-extrabold text-lg
                       hover:bg-yellow-300 transition-all shadow-xl group
                       transform hover:scale-105">
            Join a Team Today
            <Users className="w-5 h-5 ml-3 group-hover:rotate-6
                              transition-transform" />
          </button>
        </div>
      </section>

      {/* Core Leadership */}
      <section className="max-w-6xl mx-auto py-20 px-6">
        <div className="text-center mb-10">
          <Medal className="w-10 h-10 text-fuchsia-600 mx-auto mb-3" />
          <p className="text-fuchsia-700 font-semibold mb-2 text-sm
                         uppercase tracking-widest">THE STEERING COMMITTEE</p>
          <h2 className="text-3xl font-bold mb-4 text-gray-900">
            LEADERSHIP CREW
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreTeam.map((m, i) => <TeamCard key={i} member={m} />)}
        </div>
      </section>

      {/* Departments — DYNAMIC */}
      <section className="bg-fuchsia-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Users className="w-10 h-10 text-purple-600 mx-auto mb-4" />
            <p className="text-purple-700 font-semibold mb-2 text-sm
                           uppercase tracking-widest">MINISTRY DEPARTMENTS</p>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Department Units
            </h2>
          </div>

          {deptLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[...Array(8)].map((_, i) => <DeptSkeleton key={i} />)}
            </div>
          ) : departments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {departments.map(d => <DepartmentCard key={d.id} dept={d} />)}
            </div>
          ) : null}

          <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
            OTHER KEY TEAM LEADERS
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {otherTeam.map((m, i) => <TeamCard key={i} member={m} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-fuchsia-800 to-purple-800
                          text-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <Zap className="w-10 h-10 mx-auto mb-3 text-yellow-300" />
          <h2 className="text-3xl font-extrabold mb-4 uppercase">
            Ready to Serve? Find Your Place!
          </h2>
          <button onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-8 py-3 bg-fuchsia-500
                       text-white rounded-full font-bold text-xl
                       hover:bg-fuchsia-400 transition-colors shadow-2xl">
            Apply to Join
            <HeartHandshake className="w-5 h-5 ml-3" />
          </button>
        </div>
      </section>

      {isModalOpen && (
        <VolunteerModal onClose={() => setIsModalOpen(false)}
          onSuccess={() => setIsSuccessOpen(true)} />
      )}
      {isSuccessOpen && (
        <SuccessModal onClose={() => setIsSuccessOpen(false)} />
      )}
    </div>
  );
};

export default YouthTeamPage;