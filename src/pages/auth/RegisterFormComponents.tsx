import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export const FormInput = ({ label, icon, register, error, placeholder, type = 'text' }: {
  label: string;
  icon: React.ReactNode;
  register: any;
  error?: string;
  placeholder?: string;
  type?: string;
}) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">{icon}</span>
      <input
        {...register}
        type={type}
        placeholder={placeholder}
        className={`w-full pl-11 pr-4 py-3 border rounded-xl text-sm text-gray-900 placeholder-gray-300
          focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-all
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/50'}`}
      />
    </div>
    {error && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
  </div>
);

export const PasswordField = ({ label, register, error, show, toggle }: {
  label: string;
  register: any;
  error?: string;
  show: boolean;
  toggle: () => void;
}) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
      {label}
    </label>
    <div className="relative">
      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
      <input
        {...register}
        type={show ? 'text' : 'password'}
        placeholder="Minimum 8 characters"
        className={`w-full pl-11 pr-12 py-3 border rounded-xl text-sm text-gray-900 placeholder-gray-300
          focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-400 transition-all
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50/50'}`}
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
      >
        {show ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
      </button>
    </div>
    {error && (
      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
  </div>
);
