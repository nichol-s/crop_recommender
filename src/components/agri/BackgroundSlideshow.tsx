import { useEffect, useState } from "react";

const SLIDES = [
];

const BackgroundSlideshow = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="fixed inset-0 -z-30 overflow-hidden">
        {SLIDES.map((src, idx) => (
          <div
            key={src}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1500ms] ease-in-out"
            style={{
              backgroundImage: `url(${src})`,
              opacity: idx === current ? 1 : 0,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{ background: "var(--gradient-overlay)" }}
        aria-hidden="true"
      />
    </>
  );
};

export default BackgroundSlideshow;
