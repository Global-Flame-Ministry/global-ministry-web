import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { authApi } from '../../api/authApi';
import logo from '../../assets/flames.jpg';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <Helmet><meta name="robots" content="noindex" /></Helmet>
      <div className="w-full max-w-md">
        
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-xs hover:border-fuchsia-300 hover:text-fuchsia-600 transition-all duration-200 rounded-lg cursor-pointer mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <img
              src={logo}
              alt="Logo"
              className="h-14 w-14 rounded-full object-cover mb-4"
            />
            <h1 className="text-2xl font-semibold text-gray-900">
              Forgot your password?
            </h1>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Enter your email address and we’ll send you a link to reset your password.
            </p>
          </div>

          {submitted ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                If an account exists for this email, you’ll receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                className="block w-full bg-gray-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-black transition"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-3 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                      errors.email ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-black transition flex items-center justify-center"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Send reset link'
                )}
              </button>

              {/* Footer */}
              <p className="text-sm text-gray-500 text-center">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-gray-900 font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;