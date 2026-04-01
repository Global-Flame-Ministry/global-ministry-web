import React, { useState } from 'react';
import { ArrowLeft, History, Image as ImageIcon, X, CheckCircle2 } from 'lucide-react';

interface GlobalChoirProps {
  onBack: () => void;
}

const GlobalChoir: React.FC<GlobalChoirProps> = ({ onBack }) => {
  const [isAuditionModalOpen, setIsAuditionModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [auditionFile, setAuditionFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [inputKey, setInputKey] = useState(Date.now()); // reset file input

  /* ================= IMAGES ================= */

  const galleryImages = [
    { id: 1, src: '/assets/sing.jpg', alt: 'Annual Conference 2025' },
    { id: 2, src: '/assets/choir.jpg', alt: 'Tuesday Worship' },
    { id: 3, src: '/assets/worship.jpg', alt: 'Rehearsal Sessions' },
    { id: 4, src: '/assets/preach.jpg', alt: 'Community Outreach' },
    { id: 5, src: '/assets/p.jpg', alt: 'Youth Choir' },
    { id: 6, src: '/assets/praise.jpg', alt: '2025 Crossover night' },
  ];

  const choirHistory = '/assets/choir.jpg';

  /* ================= FILE VALIDATION ================= */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMime = [
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'video/quicktime',
    ];

    const allowedExtensions = ['mp3', 'wav', 'mp4', 'mov'];

    const extension = file.name.split('.').pop()?.toLowerCase();

    const maxSize = 10 * 1024 * 1024;

    if (
      !allowedMime.includes(file.type) &&
      !allowedExtensions.includes(extension || '')
    ) {
      setFileError('Only MP3, WAV, MP4 or MOV files are allowed.');
      setAuditionFile(null);
      return;
    }

    if (file.size > maxSize) {
      setFileError('File size must not exceed 10MB.');
      setAuditionFile(null);
      return;
    }

    setFileError(null);
    setAuditionFile(file);
  };

  /* ================= MODAL ================= */

  const closeModal = () => {
    setIsAuditionModalOpen(false);
    setSubmitted(false);
    setAuditionFile(null);
    setFileError(null);
    setInputKey(Date.now()); // reset file input
  };

  const handleSubmit = () => {
    if (!auditionFile || fileError) return;
    setSubmitted(true);
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans animate-in fade-in duration-700">

      {/* Navigation */}
      <nav className="p-6 max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-brand-600 hover:text-black font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft size={16} />
          Back to Ministries
        </button>
      </nav>

      {/* Hero */}
      <header className="bg-[#0a0a0a] text-white py-24 px-6 border-b border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-brand-500 uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">
            Music Ministry
          </span>

          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6">
            The Global Choir
          </h1>

          <p className="text-xl text-gray-400 italic font-light">
            "Making a joyful noise unto the Lord across nations."
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-20">

        {/* History */}
        <section className="mb-32 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6 text-brand-600">
              <History size={28} />
              <h2 className="text-3xl font-serif font-bold text-black">
                Our Journey
              </h2>
            </div>

            <div className="space-y-6 text-lg text-gray-600 font-light">
              <p>
                Founded in 1998, the Global Choir began as a small group of ten passionate vocalists.
              </p>
              <p>
                Our mission is to bridge divides through harmony and worship.
              </p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-xl h-96 overflow-hidden shadow-2xl">
            <img
              src={choirHistory}
              alt="Vintage choir"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Gallery */}
        <section>
          <div className="flex items-center gap-3 mb-12">
            <ImageIcon size={28} className="text-brand-600" />
            <h2 className="text-3xl font-serif font-bold">
              Gallery & Moments
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryImages.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-sm shadow-lg aspect-[4/3]"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://via.placeholder.com/600x400?text=Image+Missing';
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 flex items-end p-6">
                  <p className="text-white font-bold uppercase text-xs">
                    {image.alt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-20 text-center">
        <h3 className="text-2xl font-serif font-bold mb-2">
          Interested in joining the harmony?
        </h3>

        <p className="text-gray-500 mb-8 font-light">
          We hold auditions quarterly for all vocal ranges.
        </p>

        <button
          onClick={() => setIsAuditionModalOpen(true)}
          className="px-12 py-4 bg-black text-white text-xs font-bold uppercase"
        >
          Audition Now
        </button>
      </footer>

      {/* Modal */}
      {isAuditionModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={closeModal}
          />

          <div
            className="relative bg-white w-full max-w-lg rounded-3xl p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X size={24} />
            </button>

            {!submitted ? (
              <>
                <h3 className="text-2xl font-bold mb-4">
                  Choir Audition
                </h3>

                <input
                  key={inputKey}
                  type="file"
                  onChange={handleFileChange}
                  accept="audio/*,video/*"
                />

                {fileError && (
                  <p className="text-red-500 mt-2">{fileError}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!auditionFile || !!fileError}
                  className="mt-4 bg-black text-white px-6 py-3 disabled:opacity-50"
                >
                  Submit
                </button>
              </>
            ) : (
              <div className="text-center">
                <CheckCircle2
                  className="mx-auto mb-4 text-green-600"
                  size={48}
                />

                <p className="text-lg font-semibold mb-4">
                  Audition received!
                </p>

                <p className="text-gray-600 mb-6">
                  Thank you for your submission. We will be in touch soon.
                </p>

                <button
                  onClick={closeModal}
                  className="bg-black text-white px-6 py-2"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalChoir;