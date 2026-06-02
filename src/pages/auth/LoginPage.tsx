import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/useAuthContext';
import logo from '../../assets/flames.jpg';

// Updated Schema to include remember boolean
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const from = (location.state as { from?: string })?.from ?? '/';

  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      toast.success('Email confirmed successfully. You can now sign in.');
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // 'data' now includes the 'remember' boolean field
      const response = await authApi.login(data);
      const userData = response.data;
      login(userData);
      toast.success(`Welcome back, ${userData.firstName}`);
      if (userData.roles.includes('Admin')) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch {
      toast.error('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-fuchsia-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo + Ministry Name */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-purple-700 shadow-lg mb-4">
            <img
              src={logo}
              alt="Global Flame Ministries"
              className="w-11 h-11 rounded-xl object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Global Flame Ministry
          </h1>
          <p className="text-sm text-gray-400 mt-1">Member Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-100/80 px-8 py-10">
          <div className="mb-7">
            <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-400 mt-1">Sign in to your account to continue</p>
          </div>

          {/* Redirect Notice */}
          {from && from !== '/' && (
            <div className="mb-5 px-4 py-3 bg-fuchsia-50 border border-fuchsia-100 rounded-xl text-sm text-fuchsia-700">
              Please sign in to continue.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full pl-11 pr-4 py-3.5 border rounded-xl text-sm text-gray-900 placeholder-gray-300
                    focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-all
                    ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/50'}`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-fuchsia-600 hover:text-fuchsia-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`w-full pl-11 pr-12 py-3.5 border rounded-xl text-sm text-gray-900 placeholder-gray-300
                    focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-all
                    ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/50'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <span>⚠</span> {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                {...register('remember')}
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-[#a21caf] accent-[#a21caf] cursor-pointer"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600
                text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg shadow-fuchsia-200
                transition-all duration-200 hover:shadow-fuchsia-300 hover:scale-[1.01]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z" opacity="0.75" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Register link */}
          <p className="text-sm text-gray-500 text-center">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-fuchsia-600 font-semibold hover:text-fuchsia-700 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6 text-sm text-gray-400">
          <Link to="/" className="hover:text-fuchsia-600 transition-colors inline-flex items-center gap-1">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;