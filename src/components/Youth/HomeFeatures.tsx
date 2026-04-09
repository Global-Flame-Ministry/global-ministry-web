import { FiCpu, FiMusic, FiHeart } from "react-icons/fi";
import speaker from "../../assets/images/daddy-program.jpg"; 

const HomeFeatures = () => {
  const features = [
    {
      title: "EVERYTHING TECH",
      desc: "We're like minds filled with innovative thoughts and ideas through the help of God have been able to locate and birth forth youths with high intellect of technology around their daily life.",
      icon: <FiCpu className="text-fuchsia-600 text-2xl" />,
      bg: "bg-purple-100",
    },
    {
      title: "EVERYTHING MUSIC",
      desc: "We're like minds filled with innovative thoughts and ideas through the help of God have been able to locate and birth forth youths with high intellect of technology around their daily life.",
      icon: <FiMusic className="text-fuchsia-600 text-2xl" />,
      bg: "bg-purple-100",
    },
    {
      title: "GODLY DATING",
      desc: "We're like minds filled with innovative thoughts and ideas through the help of God have been able to locate and birth forth youths with high intellect of technology around their daily life.",
      icon: <FiHeart className="text-fuchsia-600 text-2xl" />,
      bg: "bg-purple-100",
    },
  ];

  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left side - features */}
        <div className="space-y-8">
          {features.map((f, i) => (
            <div key={i} className="flex items-start space-x-4">
              <div
                className={`w-12 h-12 px-4 flex items-center justify-center rounded-full ${f.bg}`}
              >
                {f.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-fuchsia-500 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right side - image */}
        <div className="relative">
          <img
            src={speaker}
            alt="Speaker"
            className="rounded-lg shadow-lg object-cover w-full h-[400px]"
          />
        </div>
      </div>
    </section>
  );
};

export default HomeFeatures;
