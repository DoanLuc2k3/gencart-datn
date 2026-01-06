import React from "react";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <div className="logo" style={{ marginRight: "clamp(16px, 4vw, 40px)" }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(18px, 3.5vw, 26px)", // Responsive logo size - smaller
            fontWeight: "800",
            letterSpacing: "-0.5px",
            background: "linear-gradient(to right, #ffffff 0%, #ffd700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 2px 10px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease",
            display: "inline-block"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.filter = "brightness(1.2)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.filter = "brightness(1)";
          }}
        >
          GenCart
        </h1>
      </Link>
    </div>
  );
};

export default Logo;