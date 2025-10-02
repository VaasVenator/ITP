import React, { useEffect, useState } from "react";
import Header from "./Components/Header";

function MyProfile({ onBack }) {
  const [user, setUser] = useState(null);
  const [isHoveringLogout, setIsHoveringLogout] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const loggedInUserId = payload.userId || payload._id || payload.id;
          if (loggedInUserId) {
            const res = await fetch(`http://localhost:4000/users/${loggedInUserId}`);
            const data = await res.json();
            setUser(data);
          } else {
            console.error("No userId found in token payload:", payload);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  if (!user) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <>
      <Header onLogout={handleLogout} onBack={onBack} />

      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#f0f7ff",
          padding: "3rem",
          fontFamily: "Inter, sans-serif",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "3rem",
            maxWidth: "600px",
            width: "100%",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <div
            style={{
              fontWeight: "700",
              fontSize: "2rem",
              marginBottom: "1.5rem",
              textAlign: "center",
              color: "#222",
            }}
          >
            My Profile
          </div>

          {[
            { label: "Full Name", value: `${user.firstName} ${user.lastName}` },
            { label: "Email", value: user.email },
            { label: "Mobile", value: user.mobile },
            { label: "NIC", value: user.nic },
            { label: "Designation", value: user.designation },
            { label: "Employee Number", value: user.employeeNumber },
            { label: "Created Date", value: new Date(user.createdDate).toLocaleString() },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                backgroundColor: "#f9f9f9",
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#666",
                  marginBottom: "0.25rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {label}:
              </span>
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "#111",
                }}
              >
                {value}
              </span>
            </div>
          ))}

          <div style={{ marginTop: "2.5rem" }}>
            <button
              onClick={handleLogout}
              style={{
                background: "linear-gradient(90deg, #ff416c, #ff4b2b)",
                border: "none",
                padding: "1rem",
                borderRadius: "12px",
                color: "#fff",
                fontWeight: "700",
                fontSize: "1.25rem",
                cursor: "pointer",
                width: "100%",
                transition: "box-shadow 0.3s ease, filter 0.3s ease",
                boxShadow: isHoveringLogout
                  ? "0 0 15px 5px rgba(255,75,43,0.7)"
                  : "0 4px 12px rgba(255,75,43,0.4)",
                filter: isHoveringLogout ? "brightness(1.1)" : "none",
                animation: isHoveringLogout ? "pulse 1s infinite" : "none",
              }}
              onMouseEnter={() => setIsHoveringLogout(true)}
              onMouseLeave={() => setIsHoveringLogout(false)}
            >
              Logout
            </button>
            <style>
              {`
                @keyframes pulse {
                  0% {
                    box-shadow: 0 0 10px 2px rgba(255,75,43,0.7);
                    filter: brightness(1);
                  }
                  50% {
                    box-shadow: 0 0 20px 6px rgba(255,75,43,1);
                    filter: brightness(1.3);
                  }
                  100% {
                    box-shadow: 0 0 10px 2px rgba(255,75,43,0.7);
                    filter: brightness(1);
                  }
                }
              `}
            </style>
          </div>
        </div>
      </main>
    </>
  );
}

export default MyProfile;