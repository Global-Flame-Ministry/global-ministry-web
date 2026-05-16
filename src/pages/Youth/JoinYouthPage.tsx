import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Lock } from 'lucide-react';
import { youthApi } from '../../api/youthApi';
import { useAuth } from '../../context/useAuthContext';
import toast from 'react-hot-toast';

const JoinYouthPage = () => {
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const { user, login } = useAuth();
  const isPrefilled  = state?.prefilled === true;

  const [form, setForm] = useState({
    firstName:   state?.firstName ?? user?.firstName ?? '',
    lastName:    state?.lastName  ?? user?.lastName  ?? '',
    email:       state?.email     ?? user?.email     ?? '',
    phoneNumber: '',
  });

  // Track if prefilled fields were manually changed
  const [edited, setEdited] = useState({
    firstName: false, lastName: false, email: false,
  });
  const [loading, setLoading] = useState(false);

  const nameOrEmailChanged =
    isPrefilled && (edited.firstName || edited.lastName || edited.email);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (isPrefilled && field in edited) {
      setEdited(prev => ({ ...prev, [field]: true }));
    }
  };

  const handleSubmit = async () => {
  try {
    setLoading(true);
    const res = await youthApi.join({
      firstName:   form.firstName,
      lastName:    form.lastName,
      email:       form.email,
      phoneNumber: form.phoneNumber || undefined,
    });

    const result = res.data.data;

    if (result?.autoJoined) {
      if (user) {
        login({
          ...user,
          roles: [...(user.roles ?? []), 'YouthMember'],
        });
      }
      toast.success('Welcome to the Global Flame Youth Community! 🔥');
      navigate('/youth');
    } else if (result?.requiresVerification) {
      toast.success(
        'A verification email has been sent. Please check your inbox.'
      );
      navigate('/youth');
    }
  } catch {
    toast.error('Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center
                    justify-center px-4 py-16">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl
                      border-t-8 border-fuchsia-600 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-fuchsia-700 to-purple-800
                        p-8 text-white text-center">
          <Users className="w-12 h-12 mx-auto mb-3 text-fuchsia-200" />
          <h1 className="text-2xl font-extrabold mb-1">
            Join the Global Flame Youth Community
          </h1>
          {isPrefilled && !nameOrEmailChanged && (
            <p className="text-fuchsia-200 text-sm mt-2">
              Your Ministry info has been pre-filled. Just confirm and join!
            </p>
          )}
          {nameOrEmailChanged && (
            <p className="text-yellow-300 text-sm mt-2">
              ⚠️ You changed your details — we'll send a verification email
              to confirm your new identity.
            </p>
          )}
        </div>

        {/* Form */}
        <div className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg transition
                    focus:ring-2 focus:ring-fuchsia-500
                    ${isPrefilled && !edited.firstName
                      ? 'bg-fuchsia-50 border-fuchsia-200 text-gray-600'
                      : 'border-gray-300 bg-white'}`} />
                {isPrefilled && !edited.firstName && (
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2
                                   w-4 h-4 text-fuchsia-400" />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg transition
                    focus:ring-2 focus:ring-fuchsia-500
                    ${isPrefilled && !edited.lastName
                      ? 'bg-fuchsia-50 border-fuchsia-200 text-gray-600'
                      : 'border-gray-300 bg-white'}`} />
                {isPrefilled && !edited.lastName && (
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2
                                   w-4 h-4 text-fuchsia-400" />
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg transition
                  focus:ring-2 focus:ring-fuchsia-500
                  ${isPrefilled && !edited.email
                    ? 'bg-fuchsia-50 border-fuchsia-200 text-gray-600'
                    : 'border-gray-300 bg-white'}`} />
              {isPrefilled && !edited.email && (
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2
                                 w-4 h-4 text-fuchsia-400" />
              )}
            </div>
            {isPrefilled && !edited.email && (
              <p className="text-xs text-gray-400 mt-1">
                Edit this field only if you want to use a different email.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={e => handleChange('phoneNumber', e.target.value)}
              placeholder="+234 800 000 0000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-fuchsia-500 bg-white" />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !form.firstName || !form.email}
            className="w-full flex items-center justify-center px-8 py-4
                       bg-fuchsia-600 text-white rounded-lg font-bold text-lg
                       hover:bg-purple-700 transition-colors shadow-md
                       disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Processing...' : (
              <>
                {nameOrEmailChanged
                  ? 'Continue with Verification'
                  : 'Join the Community'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-gray-400">
            By joining, you agree to our community guidelines.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinYouthPage;