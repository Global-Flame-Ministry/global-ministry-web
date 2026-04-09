import leadershipBg from "../../assets/images/slider2.jpg"; // Replace with your actual image path

const HomeLeadership = () => (
  <section
    className="relative py-24 px-6 text-center text-white bg-cover bg-center"
    style={{ backgroundImage: `url(${leadershipBg})` }}
  >
    {/* Purple overlay */}
    <div className="absolute inset-0 bg-purple-900 opacity-70"></div>

    {/* Content */}
    <div className="relative z-10 max-w-4xl mx-auto">
        <h4 className="text-xl font-normal mb-4 text-fuchsia-500">HOW WE IMPACT</h4>
      <h2 className="text-4xl font-bold mb-4">COMMUNITY'S LEADERSHIP</h2>
      <p className="text-lg leading-relaxed">
        Through strategic partnerships and dedicated programs, we're building the next generation of leaders.
        Our approach combines mentorship, hands-on learning, and community service to develop well-rounded
        individuals who will make positive impacts in their communities and beyond.
      </p>
    </div>
  </section>
);

export default HomeLeadership;
