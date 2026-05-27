const BooksIntro = () => {
  return (
    <section className="w-full py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto text-center space-y-6">

        {/* Eyebrow label */}
        <p className="text-fuchsia-600 font-semibold uppercase tracking-widest text-sm">
          Global Flame Book Store
        </p>

        {/* Main heading */}
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
          Transform Your Mind,{' '}
          <span className="text-fuchsia-600">Transform Your Life</span>
        </h1>

        {/* Body paragraph */}
        <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
          Real transformation begins in the mind. Every book in this collection
          was chosen to help you renew your thinking, walk purposefully in your
          calling, and grow into the person God has destined you to be. Whether
          you are just starting your journey or going deeper - there is something
          here for every season of your life.
        </p>

        {/* Scripture */}
        <blockquote className="text-gray-400 italic text-base border-l-4 border-fuchsia-200 pl-4 text-left max-w-xl mx-auto">
          "Do not conform to the pattern of this world, but be transformed by the
          renewing of your mind." —{' '}
          <span className="font-semibold not-italic text-fuchsia-500">Romans 12:2</span>
        </blockquote>

      </div>

      {/* Divider into books section */}
      <div className="mt-16 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs whitespace-nowrap">
            Recommended Reads for Transformation
          </p>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
      </div>
    </section>
  );
};

export default BooksIntro;