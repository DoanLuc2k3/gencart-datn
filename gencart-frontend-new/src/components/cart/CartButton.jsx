import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";

const CartButton = ({ cartCount }) => {
  return (
    <Link to="/cart">
      <div
        style={{
          position: "relative",
          padding: "clamp(8px, 1.5vw, 12px)",
          borderRadius: "clamp(12px, 2vw, 16px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          minWidth: "clamp(40px, 6vw, 52px)",
          minHeight: "clamp(40px, 6vw, 52px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px) scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
        }}
      >
        <Badge
          count={cartCount}
          size="default"
          showZero={false}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "600",
            backgroundColor: "#ff6b6b",
            border: "2px solid white",
          }}
          offset={[2, -2]}
        >
          <ShoppingCartOutlined
            style={{
              fontSize: "clamp(18px, 2.5vw, 22px)",
              color: "black",
            }}
          />
        </Badge>
      </div>
    </Link>
  );
};

export default CartButton;