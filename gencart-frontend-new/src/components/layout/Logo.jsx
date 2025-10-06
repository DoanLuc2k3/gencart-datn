import React from "react";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <div className="logo" style={{ marginRight: "clamp(16px, 4vw, 40px)" }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <h1
          style={{
            color: "white",
            margin: 0,
            fontSize: "clamp(20px, 4.5vw, 32px)", // Responsive logo size
            fontWeight: "800",
            letterSpacing: "-1px",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.textShadow = "0 4px 12px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.textShadow = "0 2px 8px rgba(0,0,0,0.3)";
          }}
        >
          GenCart
        </h1>
      </Link>
    </div>
  );
};

export default Logo;