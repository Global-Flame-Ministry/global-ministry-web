import { useState, useEffect } from "react";

const HomeTestimonial = () => {
  const testimonials = [
    {
      name: "Emily A.",
      initial: "E",
      text: "The Global Flame Ministry Youth Website has been such a blessing! It's not just a site, it feels like a community where I can grow in my faith and stay connected with other young believers. The content is refreshing, relevant, truly uplifting.",
    },
    {
      name: "Joanna W.",
      initial: "J",
      text: "I love how the Global Flame Ministry Youth Website speaks directly to the hearts of young people. The articles, devotionals, and videos are deeply encouraging and easy to access. It is the perfect resource for youth development.",
    },
    {
      name: "Tanchit J.",
      initial: "T",
      text: "Honestly, this youth website has helped me stay consistent with my walk with God. The resources are practical, inspiring, and filled with God's word. I recommend it to every young believer who wants to live for Jesus Christ.",
    },
    {
      name: "Blessing A.",
      initial: "B",
      text: "Beyond the skills, I found a family here. The community support and opportunities are incredible for youth empowerment.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section
      id="testimonials"
      className="py-16 px-6 text-center bg-linear-to-r from-purple-100 via-pink-100 to-purple-100"
    >
      <h2 className="text-3xl font-bold text-purple-700 mb-12">
        What Our Members Say
      </h2>

      {/* Carousel container */}
      <div className="overflow-hidden max-w-xl mx-auto">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="min-w-full bg-white p-6 rounded-xl shadow-xl hover:shadow-lg transition"
            >
              {/* Initial circle */}
              <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-purple-700 text-white text-xl font-bold mb-4">
                {t.initial}
              </div>
              <p className="text-gray-600 italic mb-4">"{t.text}"</p>
              <h4 className="text-purple-700 font-semibold">{t.name}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Dots navigation */}
      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-3 h-3 rounded-full ${
              i === currentIndex ? "bg-purple-700" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HomeTestimonial;
