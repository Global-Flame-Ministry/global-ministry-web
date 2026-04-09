import { useState } from 'react';
import type { FC, SyntheticEvent } from 'react';
import { Mail, MapPin, Phone, MessageSquare, Send, Instagram, Facebook, Twitter } from 'lucide-react';
import { contactApi } from '../../api/contactApi';
import toast from 'react-hot-toast';

const LOCATION_QUERY   = 'Zarmaganda Diye, Off Rayfield Road, Jos, Nigeria';
const ENCODED_LOCATION = encodeURIComponent(LOCATION_QUERY);
const GOOGLE_MAPS_LINK = `http://maps.google.com/?q=${ENCODED_LOCATION}`;
const MAP_EMBED_URL    = `http://maps.google.com/maps?q=${ENCODED_LOCATION}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

const CONTACT_INFO = [
  { icon: Mail,   title: 'Email Address', detail: 'globalflameyouthcommunity@gmail.com',
    link: 'mailto:globalflameyouthcommunity@gmail.com' },
  { icon: Phone,  title: 'Phone Number',  detail: '+234 813 684 8041',
    link: 'tel:+2348136848041' },
  { icon: MapPin, title: 'Main Location', detail: LOCATION_QUERY,
    link: GOOGLE_MAPS_LINK },
];

const SOCIAL_LINKS = [
  { icon: Instagram, name: 'Instagram', url: '#', color: 'text-pink-600' },
  { icon: Facebook,  name: 'Facebook',  url: '#', color: 'text-blue-600' },
  { icon: Twitter,   name: 'Twitter',   url: '#', color: 'text-blue-400' },
];

const YouthContactPage: FC = () => {
  const [form, setForm]       = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm({ ...form, [e.target.name]: e.target.value });

 const handleSubmit = async (e: SyntheticEvent) => {
  e.preventDefault();
  try {
    setLoading(true);
    await contactApi.create({
      fullName: form.name,
      email: form.email,
      message: form.message,
      type: 0,
    });
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: '', email: '', message: '' });
  } catch {
    toast.error('Failed to send message. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">

      {/* Hero */}
      <section className="bg-purple-800 text-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 uppercase tracking-tight">
            <span className="bg-clip-text text-transparent
                             bg-gradient-to-r from-fuchsia-300 to-white">
              GET IN TOUCH
            </span>
          </h1>
          <p className="text-xl font-light opacity-90">
            We are here to answer your questions, hear your testimonies,
            and connect with you.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="max-w-5xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <p className="text-fuchsia-700 font-semibold mb-2 text-sm
                         uppercase tracking-widest">CONNECT DIRECTLY</p>
          <h2 className="text-2xl font-bold text-gray-900">
            REACH US THROUGH ANY CHANNEL
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {CONTACT_INFO.map((item, i) => (
            <a key={i} href={item.link}
              target={item.title === 'Main Location' ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="block p-6 bg-white rounded-xl shadow-lg
                         hover:shadow-2xl transition-all border-t-4
                         border-fuchsia-600 group">
              <item.icon className="w-8 h-8 text-fuchsia-600 mb-2
                                    group-hover:text-purple-700 transition-colors" />
              <h3 className="text-lg font-bold text-gray-800 mb-1">{item.title}</h3>
              <p className="text-gray-600 group-hover:text-gray-900 font-medium">
                {item.detail}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="bg-white py-12 px-6 shadow-inner">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <div className="md:sticky md:top-8">
            <MessageSquare className="w-9 h-9 text-fuchsia-600 mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              SEND US A MESSAGE
            </h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              Have a question about our programs, a prayer request, or just
              want to say hello? Our team will get back to you promptly.
            </p>
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Connect live with us
              </h3>
              <div className="flex space-x-3">
                {SOCIAL_LINKS.map(s => (
                  <a key={s.name} href={s.url} target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-full bg-gray-100
                               hover:bg-gray-200 transition-colors ${s.color}`}>
                    <s.icon className="w-6 h-6" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}
            className="p-8 bg-gray-50 border border-fuchsia-100
                       rounded-xl shadow-lg">
            <div className="mb-5">
              <label htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input type="text" id="name" name="name"
                value={form.name} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-fuchsia-500
                           focus:border-fuchsia-500 bg-white" />
            </div>
            <div className="mb-5">
              <label htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input type="email" id="email" name="email"
                value={form.email} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-fuchsia-500
                           focus:border-fuchsia-500 bg-white" />
            </div>
            <div className="mb-8">
              <label htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea id="message" name="message" rows={5}
                value={form.message} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                           focus:ring-2 focus:ring-fuchsia-500
                           focus:border-fuchsia-500 resize-none bg-white" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center px-8 py-4
                         bg-fuchsia-600 text-white rounded-lg font-bold
                         text-lg hover:bg-purple-700 transition-colors
                         shadow-md disabled:opacity-60">
              <Send className="w-5 h-5 mr-3" />
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

      {/* Map */}
      <section className="py-16 px-6 bg-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Find Our Physical Location
            </h2>
            <p className="text-gray-600">
              Join us for worship and fellowship at our main gathering spot.
            </p>
          </div>
          <div className="w-full h-96 rounded-xl overflow-hidden shadow-xl
                          border-4 border-fuchsia-500/50">
            <iframe src={MAP_EMBED_URL} width="100%" height="100%"
              style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="GFM Youth Location" />
          </div>
          <div className="text-center mt-6">
            <a href={GOOGLE_MAPS_LINK} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center text-lg font-semibold
                         text-fuchsia-700 hover:text-purple-700 transition-colors">
              <MapPin className="w-5 h-5 mr-2" />
              Get Directions on Google Maps
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default YouthContactPage;