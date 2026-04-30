import React from 'react';
import { ChevronDown } from 'lucide-react';

interface AdminSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
}

const AdminSelect: React.FC<AdminSelectProps> = ({
  icon,
  className = '',
  children,
  ...props
}) => {
  return (
    <div className="relative inline-flex items-center">
      {icon && (
        <span className="absolute left-3 text-fuchsia-500 pointer-events-none
          z-10 flex items-center">
          {icon}
        </span>
      )}
      <select
        {...props}
        className={`
          appearance-none cursor-pointer
          ${icon ? 'pl-9' : 'pl-4'} pr-8 py-2
          text-sm font-medium
          rounded-xl border
          bg-white dark:bg-slate-800
          text-slate-800 dark:text-slate-100
          border-slate-200 dark:border-slate-600
          hover:border-fuchsia-400 dark:hover:border-fuchsia-500
          focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30
          focus:border-fuchsia-500
          transition-all
          ${className}
        `}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 w-3.5 h-3.5
        text-slate-400 dark:text-slate-400 pointer-events-none" />
    </div>
  );
};

export default AdminSelect;