import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export default function Counter({ target, suffix = "", duration = 1800 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setValue(target);
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration]);

    return (
    <span ref={ref} className="font-serif text-4xl md:text-5xl font-bold text-gold">
      {value.toLocaleString()}{suffix}
    </span>
  );
}