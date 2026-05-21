import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { contactApi } from '../api/contactApi';

const TOPIC_OPTIONS = [
  { label: 'General Inquiry', value: '1' },
  { label: 'Join Request', value: '2' },
  { label: 'Counselling', value: '3' },
  { label: 'Feedback', value: '4' },
];

const schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phoneNumber: z.string().optional(),
  type: z.string(), // ✅ keep as string — convert to number in onSubmit
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

const Contact: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: '1' }
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await contactApi.create({
        fullName: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        phoneNumber: data.phoneNumber || undefined,
        message: data.message,
        type: Number(data.type),
      });

      if (response.data.isSuccess) {
        toast.success('Message sent! We will get back to you soon.');
        setSubmitted(true);
        reset();
      } else {
        toast.error(response.data.message || 'Failed to send message');
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string; errors?: unknown } }
      };
      console.error('Contact error:', err.response?.data);
      toast.error(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-white">
      <SEO
        title="Contact Us"
        description="Get in touch with Global Flame Ministry. Find us at Zarmaganda, Diye, Off Rayfield Road, Jos, Plateau State, Nigeria."
        url="https://globalflameministry.org/contact"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2">

        {/* Contact Form */}
        <div className="px-8 py-20 max-w-2xl mx-auto lg:ml-auto lg:mr-0 w-full">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-6">
            Get in Touch
          </h1>
          <p className="text-slate-600 mb-10">
            Have a question, prayer request, or just want to say hello?
            We'd love to hear from you.
          </p>

          {submitted ? (
            <div className="text-center py-16 border-2 border-dashed border-green-200 rounded-2xl">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
                Message Sent!
              </h2>
              <p className="text-slate-500 mb-6">
                Thank you for reaching out. We will get back to you soon.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* First + Last Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name
                  </label>
                  <input
                    {...register('firstName')}
                    type="text"
                    placeholder="John"
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all ${
                      errors.firstName ? 'border-red-400' : 'border-slate-300'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name
                  </label>
                  <input
                    {...register('lastName')}
                    type="text"
                    placeholder="Doe"
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all ${
                      errors.lastName ? 'border-red-400' : 'border-slate-300'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="john@example.com"
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all ${
                    errors.email ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone — only once */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                  <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                </label>
                <input
                  {...register('phoneNumber')}
                  type="tel"
                  placeholder="+234 800 000 0000"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all"
                />
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Topic
                </label>
                <select
                  {...register('type')}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-fuchsia-500 outline-none bg-white transition-all"
                >
                  {TOPIC_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  {...register('message')}
                  rows={5}
                  placeholder="How can we help you?"
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all resize-none ${
                    errors.message ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-fuchsia-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Info & Map */}
        <div className="bg-slate-50 border-l border-slate-100 lg:h-auto flex flex-col">
          <div className="p-12 lg:p-20">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              Contact Information
            </h2>
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mr-4 shrink-0">
                  <MapPin className="w-5 h-5 text-fuchsia-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Visit Us</h3>
                  <p className="text-slate-600 mt-1">
                    Zarmaganda, Diye<br />
                    Off Rayfield Road, Jos, Plateau State, Nigeria.
                  </p>
                  <p className="text-sm text-fuchsia-600 mt-2">
                    Weekends at 9am, 11am, & 6pm
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mr-4 shrink-0">
                  <Phone className="w-5 h-5 text-fuchsia-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Call Us</h3>
                  <p className="text-slate-600 mt-1">(+234) 815 333 0011</p>
                  <p className="text-xs text-slate-500 mt-1">Mon-Fri, 9am - 4pm CAT</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mr-4 shrink-0">
                  <Mail className="w-5 h-5 text-fuchsia-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Email Us</h3>
                  <p className="text-slate-600 mt-1">info@globalflameministry.org</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          
            <a href="https://maps.google.com/?cid=4884970073081691653"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-h-64 bg-slate-200 w-full relative group overflow-hidden block"
          >
            <img
              src="https://picsum.photos/id/1043/800/600"
              alt="Global Flame Ministry Location"
              className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white px-4 py-2 rounded-lg shadow-md font-semibold text-slate-800 group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
                View our location on Google Maps
              </span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;