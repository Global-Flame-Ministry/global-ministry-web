import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { testimonyApi } from '../api/testimonyApi';
import { useAuth } from '../context/useAuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'form' | 'success';

const TestimonyModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isAuthenticated, user } = useAuth();

  const [step, setStep] = useState<Step>('form');
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('form');
    setContent('');
    setName('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || content.trim().length < 10) {
      toast.error('Please enter a valid testimony.');
      return;
    }

    setIsLoading(true);

    try {
      const dto = {
        content: content.trim(),
        ...(!isAuthenticated && { fullName: name.trim() || undefined }),
      };

      const res = await testimonyApi.create(dto);

      if (res.data.isSuccess) {
        setStep('success');
      } else {
        toast.error(res.data.message || 'Unable to submit.');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-lg">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Share a Testimony
            </h2>
            <p className="text-sm text-gray-500">
              Your story may encourage others.
            </p>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* FORM */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

            {/* User */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            )}

            {/* Content */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Testimony
              </label>

              <textarea
                rows={5}
                maxLength={2000}
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Write your testimony..."
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              />

              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Minimum 10 characters</span>
                <span>{content.length}/2000</span>
              </div>
            </div>

            {/* Info */}
            <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
              Submissions are reviewed before publication to ensure quality and relevance.
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-black transition flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Submit testimony'
              )}
            </button>
          </form>
        )}

        {/* SUCCESS */}
        {step === 'success' && (
          <div className="px-6 py-10 text-center">

            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Submission received
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              Thank you for sharing your testimony. It will be reviewed before publication.
            </p>

            <button
              onClick={handleClose}
              className="w-full bg-gray-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-black"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonyModal;