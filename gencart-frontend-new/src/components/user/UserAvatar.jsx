import React from "react";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

const UserAvatar = ({ isLoggedIn, userData, showUserMenu }) => {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.15)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      <Avatar
        icon={<UserOutlined />}
        src={userData?.avatar_url}
        style={{
          cursor: "pointer",
          backgroundColor: isLoggedIn
            ? userData?.avatar_url
              ? "transparent"
              : "#1677ff"
            : "#64748b",
          color: "white",
          fontSize: "clamp(16px, 2.5vw, 18px)",
          border: "3px solid rgba(255,255,255,0.3)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
        }}
        size={`clamp(36px, 6vw, 44px)`}
        onClick={() => {
          console.log("UserAvatar clicked");
          showUserMenu();
        }}
      />
    </div>
  );
};

export default UserAvatar;