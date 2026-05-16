import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { FiMail, FiUser } from 'react-icons/fi';
import { authApi } from '../../api/authApi';
import logo from '../../assets/flames.jpg';
import { FormInput, PasswordField } from './RegisterFormComponents';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  userName: z.string().min(3, 'Username must be at least 3 characters').max(50),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: searchParams.get('firstName') ?? '',
      lastName:  searchParams.get('lastName')  ?? '',
      email:     searchParams.get('email')     ?? '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({
        firstName: data.firstName,
        lastName:  data.lastName,
        userName:  data.userName,
        email:     data.email,
        password:  data.password,
      });
      if (response.data.isSuccess) {
        toast.success('Account created! Please check your email to confirm.');
        navigate('/login');
      } else {
        toast.error(response.data.message || 'Registration failed');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: string } } };
      toast.error(String(err.response?.data?.errors || err.response?.data?.message || 'Registration failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-fuchsia-50 rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-70" />
      </div>

      <div className="relative w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-purple-700 shadow-lg mb-3">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Global Flame Ministry
          </h1>
          <p className="text-sm text-gray-400 mt-1">Create your member account</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-100/80 px-8 py-8">

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="First Name"
                icon={<FiUser className="w-4 h-4" />}
                register={register('firstName')}
                error={errors.firstName?.message}
                placeholder="Isaac"
              />
              <FormInput
                label="Last Name"
                icon={<FiUser className="w-4 h-4" />}
                register={register('lastName')}
                error={errors.lastName?.message}
                placeholder="David"
              />
            </div>

            <FormInput
              label="Username"
              icon={<FiUser className="w-4 h-4" />}
              register={register('userName')}
              error={errors.userName?.message}
              placeholder="Isaacdavid"
            />

            <FormInput
              label="Email Address"
              icon={<FiMail className="w-4 h-4" />}
              register={register('email')}
              error={errors.email?.message}
              placeholder="you@example.com"
              type="email"
            />

            {/* Passwords */}
            <PasswordField
              label="Password"
              register={register('password')}
              error={errors.password?.message}
              show={showPassword}
              toggle={() => setShowPassword(p => !p)}
            />

            <PasswordField
              label="Confirm Password"
              register={register('confirmPassword')}
              error={errors.confirmPassword?.message}
              show={showConfirm}
              toggle={() => setShowConfirm(p => !p)}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600
                text-white font-semibold py-3.5 rounded-xl text-sm shadow-lg shadow-fuchsia-200
                transition-all duration-200 hover:shadow-fuchsia-300 hover:scale-[1.01]
                disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-2 mt-1"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4z" opacity="0.75" />
                  </svg>
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-300 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-sm text-gray-500 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-fuchsia-600 font-semibold hover:text-fuchsia-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center mt-5 text-sm text-gray-400">
          <Link to="/" className="hover:text-fuchsia-600 transition-colors">
            ← Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;