import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Check, X, Loader, Mail } from 'lucide-react';
import { accountApi } from '../../api/accountApi';
import { useAuth } from '../../context/AuthContext';

const ConfirmEmailChange: React.FC = () => {
  const [searchParams]   = useSearchParams();
  const navigate         = useNavigate();
  const { isAuthenticated } = useAuth();

  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'not-logged-in'
  >('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token    = searchParams.get('token');
    const newEmail = searchParams.get('newEmail');

    if (!token || !newEmail) {
      setStatus('error');
      setMessage('Invalid confirmation link. Please request a new email change.');
      return;
    }

    if (!isAuthenticated) {
      // Store the params so after login we can complete the confirmation
      sessionStorage.setItem('emailChangeToken', token);
      sessionStorage.setItem('emailChangeNewEmail', newEmail);
      setStatus('not-logged-in');
      return;
    }

    const confirm = async () => {
      try {
        const res = await accountApi.confirmEmailChange(newEmail, token);
        if (res.data.isSuccess) {
          setStatus('success');
          setMessage(res.data.message || 'Email updated successfully.');
        } else {
          setStatus('error');
          setMessage(
            res.data.message ||
            'Confirmation failed. The link may have expired.'
          );
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    confirm();
  }, [isAuthenticated, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center
      justify-center px-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200
        w-full max-w-md p-10 text-center">

        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-fuchsia-50 rounded-full flex
              items-center justify-center mx-auto mb-6">
              <Loader className="w-8 h-8 text-fuchsia-600 animate-spin" />
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">
              Confirming your email...
            </h2>
            <p className="text-slate-400 text-sm">Please wait a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex
              items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-3">
              Email Updated
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              {message}
            </p>
            <p className="text-slate-400 text-xs mb-6">
              Please log in again with your new email address.
            </p>
            <Link
              to="/login"
              className="block w-full py-3 bg-slate-900 text-white
                font-black uppercase tracking-widest text-xs rounded-xl
                hover:bg-fuchsia-600 transition-all"
            >
              Log In Again
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex
              items-center justify-center mx-auto mb-6">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-3">
              Confirmation Failed
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              {message}
            </p>
            <Link
              to="/dashboard"
              className="block w-full py-3 bg-slate-900 text-white
                font-black uppercase tracking-widest text-xs rounded-xl
                hover:bg-fuchsia-600 transition-all"
            >
              Back to Dashboard
            </Link>
          </>
        )}

        {status === 'not-logged-in' && (
          <>
            <div className="w-16 h-16 bg-fuchsia-50 rounded-full flex
              items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-fuchsia-600" />
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-3">
              Login Required
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              You need to be logged in to confirm your email change. Please
              log in and then click the confirmation link again.
            </p>
            <button
              onClick={() => navigate('/login', {
                state: { from: window.location.pathname + window.location.search }
              })}
              className="block w-full py-3 bg-slate-900 text-white
                font-black uppercase tracking-widest text-xs rounded-xl
                hover:bg-fuchsia-600 transition-all"
            >
              Log In to Confirm
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmailChange;