import { useState } from 'react';
import { ArrowRight, AlertCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { email, password, fullName } = formData;
    
    if (!email || !password || (!isLogin && !fullName)) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      console.log(isLogin ? 'Logging in...' : 'Signing up...', formData);
      setLoading(false);
      navigate('/'); 
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* LEFT SIDE: Visual/Brand Section (Inspired by your 2nd image) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-gray-900 relative overflow-hidden">
        {/* Replace the URL below with your actual group photo path */}
        <img 
          src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1920" 
          alt="Community" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="relative z-10 p-12 mt-auto">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6">
             <div className="w-6 h-6 bg-fuchsia-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(217,70,239,0.8)]" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Connect with your <br/><span className="text-fuchsia-400">Creative Community.</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-md">
            The professional space to manage your projects, share ideas, and grow with your team.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Logo/Icon (Minimalist) */}
          <div className="mb-10 text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
              {isLogin ? 'Login' : 'Create Account'}
            </h2>
            <p className="text-gray-500">
              {isLogin ? 'Please enter your details to access your account.' : 'Join us today and start your journey.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-center rounded-r-md">
              <AlertCircle className="text-red-500 h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                  placeholder="e.g. Jane Smith"
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5 ml-1">Email or Username</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                placeholder="you@example.com"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="relative">
              <div className="flex justify-between items-end mb-1.5 px-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Password</label>
                {isLogin && (
                    <button type="button" className="text-xs font-semibold text-fuchsia-600 hover:text-fuchsia-700">
                        Forgot password?
                    </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <Eye className="absolute right-4 top-3.5 h-5 w-5 text-gray-300 cursor-pointer hover:text-gray-400" />
              </div>
            </div>

            {isLogin && (
                <div className="flex items-center space-x-2 px-1">
                    <input type="checkbox" id="remember" className="rounded border-gray-300 text-fuchsia-600 focus:ring-fuchsia-500" />
                    <label htmlFor="remember" className="text-sm text-gray-500 select-none">Remember me</label>
                </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 mt-4 text-white font-bold rounded-xl bg-fuchsia-600 hover:bg-fuchsia-700 shadow-lg shadow-fuchsia-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center uppercase tracking-widest text-xs"
            >
              {loading ? 'Processing...' : (isLogin ? 'Next' : 'Create Account')}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                }}
                className="font-bold text-fuchsia-600 hover:underline"
              >
                {isLogin ? 'CREATE ONE' : 'SIGN IN'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;