import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  ArrowRight, ArrowLeft, Check, ShieldCheck,
  ChevronRight, CreditCard, Building2, Smartphone,
  Globe, Hash, Sprout, Landmark,
  Heart, HeartHandshake, X,
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
  const [region, setRegion]             = useState(REGIONS[0]);
  const [amount, setAmount]             = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showConfirmModal, setShowConfirmModal]     = useState(false);

  const donorName  = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '';
  const donorEmail = user?.email ?? '';

  const presets          = PRESET_AMOUNTS[region.code] ?? PRESET_AMOUNTS.default;
  const availableMethods = PAYMENT_METHODS.filter(m => m.currencies.includes(region.code));


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
      <div className="min-h-screen bg-[#f9f9ff] pt-20">
        <div className="max-w-2xl mx-auto w-full px-4 md:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-[#5b0064]">Step 1 of 3</span>
            <span className="text-[10px] text-[#51424f] font-medium">Choose Your Purpose</span>
          </div>
          <div className="h-1.5 w-full bg-[#e2e2e8] rounded-full overflow-hidden">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#5b0064] to-[#712ae2]" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto w-full px-4 md:px-8">
          <div className="mb-2">
            <button
              type="button"
              onClick={handleExitBack}
              className="flex items-center gap-1 text-[11px] font-bold text-[#51424f] hover:text-[#5b0064] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>

          <header className="text-center mb-2">
            <h1 className="text-lg md:text-xl font-bold text-[#1a1c20] mb-1">
              Where would you like to make an impact?
            </h1>
            <p className="text-[11px] text-[#51424f] max-2xl mx-auto">
              Select a category below to direct your seeds of grace.
            </p>
          </header>

          <div className="grid grid-cols-2 gap-2 mb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.label}
                type="button"
                onClick={() => { setCategory(cat.label); setSubCategory(''); }}
                className={`relative flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all cursor-pointer duration-200 ${
                  category === cat.label
                    ? 'border-[#5b0064] bg-white shadow-md'
                    : 'border-[#e2e2e8] bg-white hover:border-[#712ae2] hover:shadow-sm'
                }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2 transition-colors cursor-pointer ${
                    category === cat.label
                      ? 'bg-[#80008c] text-white'
                      : 'bg-[#f3f3f8] text-[#5b0064]'
                  }`}>
                    {cat.icon}
                  </div>
                  <h3 className="text-xs font-bold text-[#1a1c20] mb-0.5">{cat.label}</h3>
                  <p className="text-[10px] text-[#51424f] leading-relaxed">{cat.desc}</p>
                  {category === cat.label && (
                  <span className="absolute top-2 right-2 text-[#5b0064]">
                    <Check size={16} strokeWidth={3} />
                  </span>
                )}
              </button>
            ))}
          </div>

          {category === 'Home of Love' && (
            <div className="max-w-2xl mx-auto w-full mb-2 p-3 bg-[#f3f3f9] rounded-xl border border-[#d5c0d1]/30">
              <h4 className="text-xs font-bold text-[#1a1c20] mb-2 flex items-center gap-2">
                <ChevronRight size={12} className="text-[#712ae2]" />
                Choose a specific focus for Home of Love
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HOME_OF_LOVE_SUBCATEGORIES.map(sub => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSubCategory(sub.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                      subCategory === sub.id
                        ? 'border-[#712ae2] bg-white shadow-sm'
                        : 'border-transparent bg-white hover:border-[#d5c0d1]'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                      subCategory === sub.id
                        ? 'bg-[#712ae2] text-white'
                        : 'bg-[#712ae2]/10 text-[#712ae2]'
                    }`}>
                      {sub.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#1a1c20]">{sub.label}</p>
                      <p className="text-[9px] text-[#51424f]">{sub.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}



          <div className="mt-6 mb-8 flex justify-center">
            <button
              type="button"
              onClick={() => next(() => {
                if (!category) { toast.error('Please select a category'); return false; }
                if (category === 'Home of Love' && !subCategory) { toast.error('Please select a specific focus'); return false; }
                return true;
              })}
              className="w-full max-w-xs bg-gradient-to-r from-[#5b0064] to-[#712ae2] text-white py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all cursor-pointer shadow-md"
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
      <div className="min-h-screen bg-[#f9f9ff] pt-20">
        <div className="max-w-6xl mx-auto w-full px-4 md:px-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-[#5b0064]">Step 2 of 3</span>
            <span className="text-[10px] text-[#51424f] font-medium">Set your gift amount</span>
          </div>
          <div className="h-1.5 w-full bg-[#e2e2e8] rounded-full overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#5b0064] to-[#712ae2]" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto w-full px-4 md:px-8 mt-4">
          {/* ── LEFT PANEL ── */}
          <div className="space-y-5">
            {/* Currency Selector */}
            <div className="bg-[#f3f3f9] p-6 rounded-xl border border-[#d5c0d1]/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{region.flag}</span>
                  <div>
                    <p className="font-bold text-sm text-[#1a1c20]">{region.code} - {region.name}</p>
                    <p className="text-[10px] text-[#51424f]">Selected Currency</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCurrencyPicker(!showCurrencyPicker)}
                  className="text-[10px] font-bold text-[#712ae2] hover:text-[#5b0064] underline transition-colors cursor-pointer"
                >
                  Change
                </button>
              </div>
              {showCurrencyPicker && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-[#d5c0d1]/30">
                  {REGIONS.map(r => (
                    <button
                      key={r.code}
                      onClick={() => { setRegion(r); setAmount(null); setCustomAmount(''); setShowCurrencyPicker(false); }}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        region.code === r.code
                          ? 'border-[#5b0064] bg-white'
                          : 'border-[#e2e2e8] bg-white hover:border-[#712ae2]'
                      }`}
                    >
                      <span className="text-xl mb-1">{r.flag}</span>
                      <span className="text-[10px] font-bold text-[#1a1c20]">{r.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Preset Amounts */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-[#51424f] mb-4 block">
                Choose Amount ({region.symbol})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {presets.map(val => (
                  <button
                    key={val}
                    onClick={() => { setAmount(val); setCustomAmount(''); }}
                    className={`py-3 rounded-xl border-2 font-bold text-lg cinematic-shadow bg-white transition-all cursor-pointer ${
                      amount === val
                        ? 'border-[#5b0064] bg-[#5b0064]/5 text-[#5b0064]'
                        : 'border-[#e2e2e8] hover:border-[#5b0064] hover:text-[#5b0064]'
                    }`}
                  >
                    {region.symbol}{val.toLocaleString()}
                  </button>
                ))}
              </div>
              {amount !== null && customAmount === '' ? (
                <div className="relative mt-4">
                  <div className="w-full py-4 px-5 border-2 border-emerald-200 bg-emerald-50/50 rounded-2xl flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-700">
                      {region.symbol}{amount.toLocaleString()} selected
                    </span>
                    <button
                      type="button"
                      onClick={() => { setAmount(null); setCustomAmount(''); }}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#51424f] hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative group mt-4">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-[#51424f] text-xl">
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
                    className="w-full pl-12 pr-6 py-4 border-2 border-[#e2e2e8] rounded-2xl text-xl font-bold focus:border-[#5b0064] focus:ring-4 focus:ring-[#5b0064]/10 outline-none transition-all placeholder:text-[#d5c0d1] placeholder:font-normal"
                  />
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={back}
                className="flex-1 py-3 px-8 rounded-full border-2 border-[#d5c0d1] text-[#51424f] font-bold hover:bg-[#f3f3f9] transition-all cursor-pointer text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!amount || amount < 1) { toast.error('Please enter an amount'); return; }
                  setShowConfirmModal(true);
                }}
                className="flex-[2] py-3 px-8 rounded-full bg-gradient-to-r from-[#5b0064] to-[#712ae2] text-white font-bold shadow-lg transition-all cursor-pointer hover:scale-105 text-sm flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 pb-8">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#51424f]/60">
                256-Bit Secure SSL Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl border border-slate-100">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-fuchsia-100 flex items-center justify-center">
                <Heart size={24} className="text-fuchsia-600" fill="currentColor" />
              </div>
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#1a1c20] text-center mb-1 mt-4">
              Confirm Your Gift
            </h2>
            <p className="text-sm text-[#51424f] text-center mb-6">
              Please review your giving details below.
            </p>

            <div className="bg-[#f3f3f9] rounded-xl p-5 space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#51424f]">Purpose</span>
                <span className="font-bold text-sm text-right text-[#1a1c20]">
                  {category || 'Not selected'}
                </span>
              </div>
              <div className="border-t border-[#d5c0d1]/40" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#51424f]">Amount</span>
                <span className="text-xl font-black text-[#5b0064]">
                  {region.symbol}{amount?.toLocaleString()} {region.code}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => { setShowConfirmModal(false); setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#5b0064] to-[#712ae2] text-white font-bold uppercase tracking-widest text-xs shadow-md cursor-pointer"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-3 rounded-full border-2 border-[#d5c0d1] text-[#51424f] font-bold uppercase tracking-widest text-xs hover:bg-[#f3f3f9] transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
      <div className="min-h-screen bg-[#f9f9ff] pt-20">
        <div className="max-w-2xl mx-auto w-full px-4 md:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold tracking-wider text-[#5b0064]">Step 3 of 3</span>
            <span className="text-[10px] text-[#51424f] font-medium">Select Payment Method</span>
          </div>
          <div className="h-1.5 w-full bg-[#e2e2e8] rounded-full overflow-hidden">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-[#5b0064] to-[#712ae2]" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto w-full px-4 md:px-8 pb-16">
          <button
            type="button"
            onClick={back}
            className="flex items-center gap-1 text-[11px] font-bold text-[#51424f] hover:text-[#5b0064] transition-colors cursor-pointer mb-6"
          >
            <ArrowLeft size={14} /> Back
          </button>

          <header className="text-center mb-8">
            <h1 className="text-xl font-bold text-[#1a1c20] mb-1">
              How would you like to give?
            </h1>
            <p className="text-[11px] text-[#51424f]">
              Tap a method below to proceed securely.
            </p>
          </header>

          {availableMethods.length === 0 ? (
            <div className="p-12 rounded-3xl border-2 border-dashed border-[#d5c0d1] text-center">
              <Globe className="mx-auto text-[#d5c0d1] mb-4" size={40} />
              <p className="text-[#51424f] font-medium text-sm">
                No payment gateways available for this region yet.
              </p>
            </div>
          ) : (
            availableMethods.map(method => (
              <button
                key={method.id}
                onClick={() => handleSelectMethod(method)}
                disabled={isLoading}
                className="w-full group flex items-center justify-between p-5 rounded-2xl border-2 border-[#e2e2e8] bg-white hover:border-[#5b0064] hover:shadow-md transition-all cursor-pointer disabled:opacity-50 mb-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f3f3f9] flex items-center justify-center border border-[#e2e2e8]">
                    {method.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#1a1c20] text-sm">{method.label}</p>
                    <p className="text-[11px] text-[#51424f] mt-0.5">{method.desc}</p>
                    <div className="flex gap-1.5 mt-1">
                      {method.tags.map(tag => (
                        <span key={tag} className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 bg-[#f3f3f9] rounded text-[#51424f]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight size={20} className="text-[#d5c0d1] group-hover:text-[#5b0064] group-hover:translate-x-1 transition-all cursor-pointer" />
              </button>
            ))
          )}

          <div className="mt-8 flex flex-col items-center gap-4 pb-8">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#51424f]/60">
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
          <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-[#5b0064] border-t-transparent rounded-full animate-spin mb-6" />
            <p className="font-black text-xs uppercase tracking-[0.3em] text-[#1a1c20]">
              Processing Transaction
            </p>
            <p className="text-[#51424f] text-xs mt-2">
              Please do not refresh your browser
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default GivePage;