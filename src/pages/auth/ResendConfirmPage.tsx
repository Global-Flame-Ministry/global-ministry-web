import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiMail } from 'react-icons/fi';
import { ArrowLeft } from 'lucide-react';
import { authApi } from '../../api/authApi';
import logo from '../../assets/flames.jpg';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
});

type FormData = z.infer<typeof schema>;

const ResendConfirmPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authApi.resendConfirmation({ email: data.email });
      setSubmitted(true);
    } catch {
      // Always show success — prevents email enumeration
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <Helmet><meta name="robots" content="noindex" /></Helmet>
        <div className="w-full max-w-md">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-xs hover:border-fuchsia-300 hover:text-fuchsia-600 transition-all duration-200 rounded-lg cursor-pointer mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">

          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={logo}
              alt="Global Flame Ministries"
              className="h-16 w-16 rounded-full object-cover mb-3 ring-4 ring-fuchsia-100"
            />
            <h1 className="text-2xl font-bold text-gray-900">Resend Confirmation</h1>
            <p className="text-gray-500 text-sm mt-1 text-center">
              Enter your email and we'll resend your confirmation link.
            </p>
          </div>

          {/* Success State */}
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl">📧</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Email Sent!</h2>
              <p className="text-gray-500 text-sm">
                If an account exists with that email, a new confirmation link has been sent.
                Please check your inbox and spam folder.
              </p>
              <Link
                to="/login"
                className="inline-block w-full text-center bg-fuchsia-700 hover:bg-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all mt-4"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all bg-white placeholder-gray-400 ${
                      errors.email ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-fuchsia-700 hover:bg-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Resend Confirmation Email'
                )}
              </button>
            </form>
          )}

          {!submitted && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Already confirmed?{' '}
              <Link to="/login" className="text-fuchsia-600 hover:text-fuchsia-800 font-semibold">
                Sign in
              </Link>
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResendConfirmPage;