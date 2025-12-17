import React, { useMemo } from "react";
import { createPortal } from "react-dom";
import "./flowerFall.css";

// Decorative flower fall component
// Props:
// - enabled (bool) : show/hide
// - count (number) : number of flowers (reduced on small screens automatically)
// - zIndex (number) : stacking
// - colors (array) : array of color hex strings
const FlowerFall = ({ enabled = true, count = 24, zIndex = 900, colors }) => {
  // Respect small screens by reducing count
  const isSmall = typeof window !== "undefined" && window.innerWidth < 600;
  const effectiveCount = isSmall ? Math.min(10, count) : count;
  const items = useMemo(() => {
    const p = colors || ["#fbee8b", "#fff4c2", "#fff1e0"]; // pastel yellow tones
    return Array.from({ length: effectiveCount }).map((_, i) => {
      const left = Math.round(Math.random() * 10000) / 100; // percent
      const size = Math.round(8 + Math.random() * 20); // px
      const duration = (7 + Math.random() * 10).toFixed(2); // seconds
      const delay = (-Math.random() * 8 - Math.random() * 4).toFixed(2); // negative start
      const opacity = (0.6 + Math.random() * 0.4).toFixed(2);
      const rotate = Math.round(Math.random() * 360);
      const color = p[Math.floor(Math.random() * p.length)];
      const swayDur = (3 + Math.random() * 3).toFixed(2);
      return { id: `${i}-${left}`, left, size, duration, delay, opacity, rotate, color, swayDur };
    });
  }, [effectiveCount, colors]);

  if (!enabled) return null;

  const content = (
    <div
      className="flower-fall-container"
      style={{ zIndex }}
      aria-hidden
    >
      {items.map((it) => (
        <span
          key={it.id}
          className="flower-item"
          style={{
            left: `${it.left}%`,
            width: it.size,
            height: it.size,
            animationDuration: `${it.duration}s`,
            animationDelay: `${it.delay}s`,
            opacity: it.opacity,
            transform: `rotate(${it.rotate}deg)`,
          }}
        >
          <svg
            className="flower-svg"
            viewBox="0 0 24 24"
            style={{ animationDuration: `${it.swayDur}s` }}
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Simple 5-petal flower built from circles */}
            <g fill={it.color} stroke="none">
              <circle cx="12" cy="6" r="3.2" />
              <circle cx="6.8" cy="9.5" r="2.9" />
              <circle cx="17.2" cy="9.5" r="2.9" />
              <circle cx="8.6" cy="15" r="2.7" />
              <circle cx="15.4" cy="15" r="2.7" />
              <circle cx="12" cy="11" r="2" fill="#fff7cd" />
            </g>
          </svg>
        </span>
      ))}
    </div>
  );

  // If SSR (no document) return content; otherwise portal into body so overlay is not clipped by layout stacking
  if (typeof document === "undefined" || !document.body) {
    return content;
  }

  return createPortal(content, document.body);
};

export default FlowerFall;
