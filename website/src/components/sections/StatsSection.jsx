import React, { useState, useEffect, useRef } from 'react';

const StatsSection = () => {
  const [stats, setStats] = useState([
    { label: 'Active Givers', target: 50000, value: 0 },
    { label: 'Items Shared', target: 100000, value: 0 },
    { label: 'Lives Impacted', target: 25000, value: 0 },
    { label: 'Communities Connected', target: 150, value: 0 },
  ]);

  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inView) {
          setInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [inView]);

  useEffect(() => {
    if (!inView) return;

    stats.forEach((stat) => {
      const startTime = Date.now();
      const duration = 2000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * stat.target);

        setStats((prev) =>
          prev.map((s) =>
            s.label === stat.label ? { ...s, value: current } : s
          )
        );

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    });
  }, [inView]);

  const testimonials = [
    {
      quote:
        'Pepo made giving transparent and fair. No bias, just genuine help for those who need it.',
      author: 'Sarah M.',
      role: 'Active Giver',
    },
    {
      quote:
        'As an NGO, we\'ve distributed over 5,000 items through Pepo with full community trust.',
      author: 'Michael K.',
      role: 'NGO Director',
    },
    {
      quote:
        'Finally, a platform where everyone gets a fair chance. No favoritism. Pure fairness.',
      author: 'Elena R.',
      role: 'Community Member',
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center hover:bg-white/20 transition-all"
            >
              <div className="text-5xl font-bold text-yellow-400 mb-2">
                {stat.value.toLocaleString()}
                {stat.label === 'Communities Connected' ? '' : '+'}
              </div>
              <p className="text-gray-300">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            What Our Community Says
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 hover:bg-white/20 transition-all"
              >
                <p className="text-gray-200 text-lg mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-white/20 pt-6">
                  <p className="font-bold text-white">{testimonial.author}</p>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
