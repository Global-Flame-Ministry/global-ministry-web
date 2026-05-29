import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  ArrowRight, ArrowLeft, Check, ShieldCheck,
  ChevronRight, CreditCard, Building2, Smartphone,
  Globe, Hash, Sprout, Landmark, Info, UserCircle,
  Heart, HeartHandshake,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { donationApi } from '../api/donationApi';
import { useAuth } from '../context/useAuthContext';

// ── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    label: 'Tithe and Offering',
    icon: <Landmark />,
    desc: 'Your tenth returned to God and thanksgiving to him'
  },
  {
    label: 'Building Projects',
    icon: <Building2 />,
    desc: "Expanding God's house"
  },
  {
    label: 'Children & Youth',
    icon: <Sprout />,
    desc: 'Planting seeds in young hearts'
  },
  {
    label: 'Home of Love',
    icon: <Globe />,
    desc: 'Serving our Society through love'
  },
];

const HOME_OF_LOVE_SUBCATEGORIES = [
  {
    id: 'medi_plex',
    label: 'Medi Plex',
    desc: 'Medical missions and clinical facilities.',
    icon: <Heart />,
  },
  {
    id: 'outreach',
    label: 'Outreach',
    desc: 'Feeding, shelter, and community support.',
    icon: <HeartHandshake />,
  },
];

const FREQUENCIES = ['One-time', 'Monthly', 'Yearly'];

const REGIONS = [
  { name: 'Nigeria',        code: 'NGN', symbol: '₦',   flag: '🇳🇬' },
  { name: 'United States',  code: 'USD', symbol: '$',   flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GBP', symbol: '£',   flag: '🇬🇧' },
  { name: 'Kenya',          code: 'KES', symbol: 'KSh', flag: '🇰🇪' },
  { name: 'Ghana',          code: 'GHS', symbol: 'GH₵', flag: '🇬🇭' },
  { name: 'Canada',         code: 'CAD', symbol: 'CA$', flag: '🇨🇦' },
  { name: 'South Africa',   code: 'ZAR', symbol: 'R',   flag: '🇿🇦' },
  { name: 'UAE',            code: 'AED', symbol: 'د.إ', flag: '🇦🇪' },
  { name: 'Australia',      code: 'AUD', symbol: 'A$',  flag: '🇦🇺' },
  { name: 'Europe',         code: 'EUR', symbol: '€',   flag: '🇪🇺' },
  { name: 'India',          code: 'INR', symbol: '₹',   flag: '🇮🇳' },
  { name: 'Rwanda',         code: 'RWF', symbol: 'FRw', flag: '🇷🇼' },
  { name: 'Uganda',         code: 'UGX', symbol: 'USh', flag: '🇺🇬' },
  { name: 'Tanzania',       code: 'TZS', symbol: 'TSh', flag: '🇹🇿' },
  { name: 'Switzerland',    code: 'CHF', symbol: 'CHF', flag: '🇨🇭' },
  { name: 'Japan',          code: 'JPY', symbol: '¥',   flag: '🇯🇵' },
];

const PRESET_AMOUNTS: Record<string, number[]> = {
  NGN:     [5000, 10000, 25000, 50000, 100000, 250000],
  USD:     [10, 25, 50, 100, 250, 500, 1000, 5000],
  GBP:     [10, 25, 50, 100, 250, 500, 1000, 5000],
  EUR:     [10, 25, 50, 100, 250, 500, 1000, 5000],
  default: [20, 50, 100, 250, 500, 1000],
};

interface PaymentMethod {
  id: string;
  label: string;
  desc: string;
  icon: React.ReactNode;
  tags: string[];
  gateway: 'paystack' | 'flutterwave';
  currencies: string[];
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    label: 'Debit / Credit Card',
    desc: 'Secure payment via Visa or Mastercard',
    icon: <CreditCard size={20} className="text-slate-700" />,
    tags: ['Visa', 'Mastercard', 'Verve'],
    gateway: 'paystack',
    currencies: ['NGN', 'GHS', 'KES', 'ZAR', 'UGX', 'TZS', 'RWF', 'CHF', 'JPY'],
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    desc: 'Instant transfer from your bank app',
    icon: <Building2 size={20} className="text-slate-700" />,
    tags: ['Instant', 'NGN Only'],
    gateway: 'paystack',
    currencies: ['NGN'],
  },
  {
    id: 'ussd',
    label: 'USSD Code',
    desc: 'Dial a code to pay offline',
    icon: <Hash size={20} className="text-slate-700" />,
    tags: ['Offline'],
    gateway: 'paystack',
    currencies: ['NGN'],
  },
  {
    id: 'mobile_money',
    label: 'Mobile Money',
    desc: 'M-Pesa, MTN MoMo, Airtel Money',
    icon: <Smartphone size={20} className="text-slate-700" />,
    tags: ['M-Pesa', 'MoMo'],
    gateway: 'flutterwave',
    currencies: ['KES', 'GHS', 'UGX', 'TZS', 'RWF', 'ZAR'],
  },
  {
    id: 'international_card',
    label: 'Global Payment',
    desc: 'USD, GBP, EUR and more',
    icon: <Globe size={20} className="text-slate-700" />,
    tags: ['Forex', 'Secure'],
    gateway: 'flutterwave',
    currencies: ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'AED', 'INR', 'CHF', 'JPY'],
  },
];

// ── Step Layout ───────────────────────────────────────────────────────────────

const StepLayout = ({
  step, label, title, subtitle, children, onBack, rightPanel,
  totalSteps, onExitBack,
}: {
  step: number;
  label: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack?: () => void;
  rightPanel?: React.ReactNode;
  totalSteps: number;
  onExitBack?: () => void;
}) => (
  <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">

    {/* Navigation Header */}
    <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md
      border-b border-slate-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack ?? onExitBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors
              group flex items-center gap-2"
            title={onBack ? 'Previous step' : 'Back to previous page'}
          >
            <ArrowLeft size={20} className="text-slate-600 group-hover:text-black" />
            {!onBack && (
              <span className="text-xs font-bold text-slate-500
                group-hover:text-black hidden sm:block">
                Back
              </span>
            )}
          </button>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]
              text-indigo-600 leading-none mb-1">
              {label}
            </p>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-tight">
              Checkout
            </h2>
          </div>
        </div>

        {/* Stepper */}
        <div className="hidden md:flex items-center gap-3">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(n => (
            <div key={n} className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8
                rounded-full text-xs font-bold border-2 transition-all duration-500 ${
                  n === step
                    ? 'border-black bg-black text-white scale-110'
                    : n < step
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-slate-200 text-slate-400'
                }`}>
                {n < step ? <Check size={14} strokeWidth={3} /> : n}
              </div>
              {n < totalSteps && (
                <div className={`w-8 h-[2px] ${n < step ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <span className="text-xs font-bold text-slate-400">
          Step {step} of {totalSteps}
        </span>
      </div>
    </nav>

    <main className="flex-1 max-w-6xl mx-auto w-full grid grid-cols-1
      lg:grid-cols-12 gap-0 lg:divide-x divide-slate-200 bg-white shadow-2xl
      my-4 md:my-8 rounded-2xl overflow-hidden border border-slate-200">

      <div className="lg:col-span-7 p-6 md:p-12 overflow-y-auto">

        {/* ── INLINE BACK BUTTON — visible on all steps ── */}
        <button
          onClick={onBack ?? onExitBack}
          className="flex items-center gap-2 mb-8 group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full
            border-2 border-slate-200 group-hover:border-slate-900
            group-hover:bg-slate-900 transition-all duration-200">
            <ArrowLeft
              size={14}
              className="text-slate-400 group-hover:text-white
                group-hover:-translate-x-0.5 transition-all duration-200"
            />
          </div>
          <span className="text-xs font-black uppercase tracking-widest
            text-slate-400 group-hover:text-slate-900 transition-colors duration-200">
            Back
          </span>
        </button>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight
            text-slate-900 mb-3 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-500 text-lg font-medium">{subtitle}</p>
          )}
        </header>

        {children}
      </div>

      <aside className="lg:col-span-5 bg-slate-50/80 p-6 md:p-12">
        <div className="sticky top-24">{rightPanel}</div>
      </aside>
    </main>
  </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

const GivePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname }, replace: true });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  const [step, setStep]                 = useState<1 | 2 | 3>(1);
  const [category, setCategory]         = useState('');
  const [subCategory, setSubCategory]   = useState('');
  const [frequency, setFrequency]       = useState('One-time');
  const [region, setRegion]             = useState(REGIONS[0]);
  const [amount, setAmount]             = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading]       = useState(false);

  const donorName  = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '';
  const donorEmail = user?.email ?? '';

  const presets          = PRESET_AMOUNTS[region.code] ?? PRESET_AMOUNTS.default;
  const availableMethods = PAYMENT_METHODS.filter(m => m.currencies.includes(region.code));

  const TOTAL_STEPS = 3;

  const handleExitBack = () => {
    const from = (location.state as { from?: string })?.from;
    if (from && from !== location.pathname) navigate(from);
    else navigate(-1);
  };

  const next = (validate: () => boolean) => {
    if (!validate()) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => (s + 1) as 1 | 2 | 3);
  };

  const back = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => (s - 1) as 1 | 2 | 3);
  };

  const handleSelectMethod = async (method: PaymentMethod) => {
    if (!amount) return;
    setIsLoading(true);
    try {
      const payload = {
        donorName,
        donorEmail,
        amount,
        currency: region.code,
        paymentMethod: method.gateway === 'paystack' ? 'Paystack' : 'Flutterwave',
        donationType: category,
      };

      const response = method.gateway === 'paystack'
        ? await donationApi.initiatePaystack(payload)
        : await donationApi.initiateFlutterwave(payload);

      if (response.data.isSuccess && response.data.data?.paymentUrl) {
        window.location.href = response.data.data.paymentUrl;
      } else {
        toast.error('Failed to initialize payment.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── SUMMARY CARD ───────────────────────────────────────────────────────────
  const SummaryCard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200">
        <h3 className="text-xs font-black uppercase tracking-widest
          text-slate-400 mb-4 flex items-center gap-2">
          <UserCircle size={14} /> Giving As
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-fuchsia-100 text-fuchsia-700
            flex items-center justify-center text-sm font-bold shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="font-bold text-sm text-slate-900">{donorName}</p>
            <p className="text-xs text-slate-500 truncate">{donorEmail}</p>
          </div>
          <span className="ml-auto text-[9px] font-black uppercase tracking-widest
            text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-full">
            ✓ Verified
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
          Your Contribution
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-sm">Purpose</span>
            <span className="font-bold text-sm text-right">
              {category || 'Not selected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 text-sm">Schedule</span>
            <span className="font-bold text-sm">{frequency}</span>
          </div>
          {amount && (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-end">
                <span className="text-slate-500 text-sm mb-1">Total Amount</span>
                <div className="text-right">
                  <span className="text-3xl font-black tracking-tight">
                    {region.symbol}{amount.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-400 ml-1">
                    {region.code}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
        <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed font-medium">
          Your gift supports our mission and community projects. All transactions
          are encrypted and secure.
        </p>
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <>
        <SEO
          title="Give & Donate"
          description="Support the work of Global Flame Ministry through your generous giving and donations."
          url="https://globalflameministry.org/give"
        />
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-fuchsia-600
            border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Redirecting to login...</p>
        </div>
      </div>
    </>
    );
  }

  // ── STEP 1 — Category ─────────────────────────────────────────────────────
  if (step === 1) return (
    <>
      <SEO
        title="Give & Donate"
        description="Support the work of Global Flame Ministry through your generous giving and donations."
        url="https://globalflameministry.org/give"
      />
      <div className="min-h-screen bg-[#f9f9ff] pt-20 flex flex-col">
        <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-[#5b0064]">Step 1 of 3</span>
            <span className="text-[10px] text-[#51424f] font-medium">Choose Your Purpose</span>
          </div>
          <div className="h-1.5 w-full bg-[#e2e2e8] rounded-full overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#5b0064] to-[#712ae2]" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full px-4 md:px-8 flex-1 flex flex-col">
          <header className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1a1c20] mb-2">
              Where would you like to make an impact?
            </h1>
            <p className="text-sm text-[#51424f] max-w-2xl mx-auto">
              Select a category below to direct your seeds of grace. Your generosity empowers our global mission and local outreaches.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {CATEGORIES.map(cat => (
              <button
                key={cat.label}
                type="button"
                onClick={() => { setCategory(cat.label); setSubCategory(''); }}
                className={`relative flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                  category === cat.label
                    ? 'border-[#5b0064] bg-white shadow-md'
                    : 'border-[#e2e2e8] bg-white hover:border-[#712ae2] hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${
                  category === cat.label
                    ? 'bg-[#80008c] text-white'
                    : 'bg-[#f3f3f8] text-[#5b0064]'
                }`}>
                  {cat.icon}
                </div>
                <h3 className="text-sm font-bold text-[#1a1c20] mb-1">{cat.label}</h3>
                <p className="text-xs text-[#51424f] leading-relaxed">{cat.desc}</p>
                {category === cat.label && (
                  <span className="absolute top-2 right-2 text-[#5b0064]">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>

          {category === 'Home of Love' && (
            <div className="max-w-2xl mx-auto w-full mb-6 p-4 bg-[#f3f3f9] rounded-2xl border border-[#d5c0d1]/30">
              <h4 className="text-sm font-bold text-[#1a1c20] mb-3 flex items-center gap-2">
                <ChevronRight size={14} className="text-[#712ae2]" />
                Choose a specific focus for Home of Love
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HOME_OF_LOVE_SUBCATEGORIES.map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSubCategory(sub.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      subCategory === sub.id
                        ? 'border-[#712ae2] bg-white shadow-sm'
                        : 'border-transparent bg-white hover:border-[#d5c0d1]'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      subCategory === sub.id
                        ? 'bg-[#712ae2] text-white'
                        : 'bg-[#712ae2]/10 text-[#712ae2]'
                    }`}>
                      {sub.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1a1c20]">{sub.label}</p>
                      <p className="text-[10px] text-[#51424f]">{sub.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#51424f] mb-2">
              Giving Frequency
            </p>
            <div className="flex gap-2">
              {FREQUENCIES.map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                    frequency === f
                      ? 'border-[#5b0064] bg-[#5b0064] text-white'
                      : 'border-[#d5c0d1] text-[#51424f] hover:border-[#712ae2]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-4 pb-8 border-t border-[#e2e2e8] flex items-center justify-between">
            <button
              type="button"
              onClick={handleExitBack}
              className="flex items-center gap-1 text-xs font-bold text-[#51424f] hover:text-[#5b0064] transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <button
              type="button"
              onClick={() => next(() => {
                if (!category) { toast.error('Please select a category'); return false; }
                if (category === 'Home of Love' && !subCategory) { toast.error('Please select a specific focus'); return false; }
                return true;
              })}
              className="bg-gradient-to-r from-[#5b0064] to-[#712ae2] text-white px-6 py-3 rounded-full text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-md"
            >
              Continue <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );

  // ── STEP 2 — Amount ───────────────────────────────────────────────────────
  if (step === 2) return (
    <>
      <SEO
        title="Give & Donate"
        description="Support the work of Global Flame through your generous giving and donations."
        url="https://globalflameministry.org/give"
      />
      <StepLayout
      step={2}
      totalSteps={TOTAL_STEPS}
      label="Amount"
      title="Set your gift amount"
      onBack={back}
      onExitBack={handleExitBack}
      rightPanel={<SummaryCard />}
    >
      <div className="space-y-8">
        <div>
          <label className="text-xs font-black uppercase tracking-widest
            text-slate-400 mb-4 block">
            Select Currency
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {REGIONS.slice(0, 8).map(r => (
              <button
                key={r.code}
                onClick={() => { setRegion(r); setAmount(null); setCustomAmount(''); }}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                  region.code === r.code
                    ? 'border-black bg-slate-50'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <span className="text-xl mb-1">{r.flag}</span>
                <span className="text-[10px] font-black">{r.code}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest
            text-slate-400 mb-4 block">
            Choose Amount ({region.symbol})
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {presets.map(val => (
              <button
                key={val}
                onClick={() => { setAmount(val); setCustomAmount(''); }}
                className={`py-4 rounded-xl border-2 font-bold transition-all text-sm ${
                  amount === val
                    ? 'border-black bg-black text-white shadow-lg'
                    : 'border-slate-100 bg-white hover:border-slate-900'
                }`}
              >
                {region.symbol}{val.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="relative group">
            <span className="absolute left-5 top-1/2 -translate-y-1/2
              font-bold text-slate-400 text-xl group-focus-within:text-black transition-colors">
              {region.symbol}
            </span>
            <input
              type="number"
              placeholder="Enter custom amount"
              value={customAmount}
              onChange={e => {
                setCustomAmount(e.target.value);
                setAmount(Number(e.target.value) || null);
              }}
              className="w-full pl-12 pr-6 py-5 border-2 border-slate-100
                rounded-2xl text-xl font-bold focus:border-black focus:ring-4
                focus:ring-slate-100 outline-none transition-all
                placeholder:text-slate-300 placeholder:font-normal"
            />
          </div>
        </div>

        <button
          onClick={() => next(() => {
            if (!amount || amount < 1) { toast.error('Please enter an amount'); return false; }
            return true;
          })}
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold
            uppercase tracking-widest text-sm flex items-center justify-center
            gap-3 hover:bg-black hover:shadow-xl transition-all duration-300"
        >
          Confirm Amount <ArrowRight size={18} />
        </button>
      </div>
    </StepLayout>
    </>
  );

  // ── STEP 3 — Payment ──────────────────────────────────────────────────────
  return (
    <>
      <SEO
        title="Give & Donate"
        description="Support the work of Global Flame through your generous giving and donations."
        url="https://globalflameministry.org/give"
      />
      <StepLayout
      step={3}
      totalSteps={TOTAL_STEPS}
      label="Payment"
      title="Finalize your gift"
      subtitle="Select your preferred method below."
      onBack={back}
      onExitBack={handleExitBack}
      rightPanel={<SummaryCard />}
    >
      <div className="space-y-3">
        {availableMethods.length === 0 ? (
          <div className="p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center">
            <Globe className="mx-auto text-slate-300 mb-4" size={40} />
            <p className="text-slate-500 font-medium">
              No payment gateways available for this region yet.
            </p>
          </div>
        ) : (
          availableMethods.map(method => (
            <button
              key={method.id}
              onClick={() => handleSelectMethod(method)}
              disabled={isLoading}
              className="w-full group flex items-center justify-between p-5
                rounded-2xl border-2 border-slate-100 bg-white hover:border-black
                hover:shadow-lg transition-all disabled:opacity-50"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center
                  justify-center border border-slate-100 group-hover:bg-white transition-colors">
                  {method.icon}
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">{method.label}</p>
                  <div className="flex gap-1.5 mt-1">
                    {method.tags.map(tag => (
                      <span key={tag} className="text-[8px] font-black uppercase
                        tracking-tighter px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-black
                group-hover:translate-x-1 transition-all" />
            </button>
          ))
        )}

        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-[10px]
            font-bold uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" />
            Secured by industry-standard encryption
          </div>
          <div className="flex gap-3 grayscale opacity-40">
            <CreditCard size={20} />
            <Globe size={20} />
            <Smartphone size={20} />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md
          flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-slate-900
            border-t-transparent rounded-full animate-spin mb-6" />
          <p className="font-black text-xs uppercase tracking-[0.3em] text-slate-900">
            Processing Transaction
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Please do not refresh your browser
          </p>
        </div>
      )}
    </StepLayout>
    </>
  );
};

export default GivePage;