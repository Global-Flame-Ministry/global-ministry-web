import danjumaImg from "../../assets/images/dad.jpg";
import faithImg from "../../assets/images/mum.jpg";
import benedictImg from "../../assets/images/ben.jpg";
import isaiahImg from "../../assets/images/isaiah.jpg";
import michImg from "../../assets/images/michelle.jpg";
import panImg from "../../assets/images/HOOI.jpg";
import princessImg from "../../assets/images/prinx.jpg";
import preciousImg from "../../assets/images/officials.jpg";
import ellaImg from "../../assets/images/ella.jpg";
import lilyImg from "../../assets/images/lily.jpg";
import mimiImg from "../../assets/images/mich.jpg";

const HomeCrew = () => {
  const members = [
    { name: "APT. Danjuma Musa Gaksu ", role: "FOUNDER AND PRESIDENT OF GLOBAL FLAME", image: danjumaImg },
    { name: "APT. Faith Musa Gaksu ", role: "HEAD OF DAUGHTERS OF HONOUR GLOBAL FLAME", image: faithImg },
    { name: "Benediet Daniel", role: "UNIT HEAD GFM YOUTHS", image: benedictImg },
    { name: "Ezekiel Isaiah", role: "ASST. UNIT HEAD GFM YOUTHS", image: isaiahImg },
    { name: "Ajik Michelle", role: "ADMIN GFM YOUTHS", image: michImg },
    { name: "Nanle Panmun", role: "ASST. ADMIN GFM YOUTH", image: panImg },
    { name: "Usigbe Princess", role: "FIN. SECRETARY GFM YOUTH", image: princessImg },
    { name: "Mahule Precious", role: "WELFARE COORDINATOR GFM YOUTH", image: preciousImg },
    { name: "Katven Emmanuella", role: "ASST. WELFARE COORDINATOR GFM YOUTH", image: ellaImg },
    { name: "Denwa Lilian", role: "HEAD PUBLIC RELATIONS GFM YOUTH", image: lilyImg },
    { name: "Ijachi Michelle", role: "ASST. PUBLIC RELATIONS GFM YOUTH", image: mimiImg },
  ];

  return (
    <section className="py-16 px-6 text-center bg-gray-50">
      <h2 className="text-2xl font-bold text-fuchsia-600 mb-6">CORE LEADERSHIP TEAM</h2>
      <p className="max-w-1xl mx-auto text-gray-600 mb-8">
        Our dedicated team of facilitators, mentors, and staff members work tirelessly to ensure every young person receives the support and guidance they need to thrive.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {members.map((member, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <div className="h-80 w-full mb-4 overflow-hidden rounded-lg"> {/* **<-- CHANGED h-40 TO h-64 HERE** */}
              <img
                src={member.image}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="text-purple-700 font-bold text-lg">{member.name}</h4>
            <p className="text-gray-500 font-semibold text-sm">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HomeCrew;