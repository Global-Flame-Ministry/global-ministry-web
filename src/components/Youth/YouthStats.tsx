import { useState, useEffect } from 'react';

type Stat = { label: string; value: number; suffix: string };

const stats: Stat[] = [
  { label: 'Social Media Reach', value: 4500, suffix: '+' },
  { label: 'Community Members', value: 1000, suffix: '+' },
  { label: 'Events Hosted', value: 30, suffix: '+' },
  { label: 'Leaders Trained', value: 15, suffix: '+' },
];

const AnimatedNumber = ({
  value, duration, suffix,
}: { value: number; duration: number; suffix: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / (duration / 16);
    const step = () => {
      start += increment;
      if (start < value) {
        setCount(Math.floor(start));
        requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  const fmt = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return n.toString();
  };

  return <span>{fmt(count)}{suffix}</span>;
};

const YouthStats = () => (
  <section className="bg-gray-100 py-10 grid grid-cols-2
                      md:grid-cols-4 text-center gap-6">
    {stats.map((stat, i) => (
      <div key={i}>
        <h3 className="text-2xl font-bold text-purple-700">
          <AnimatedNumber value={stat.value} duration={5000} suffix={stat.suffix} />
        </h3>
        <p className="text-gray-600">{stat.label}</p>
      </div>
    ))}
  </section>
);

export default YouthStats;