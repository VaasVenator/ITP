import { useState, useEffect } from "react";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let logoutTimer;

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        localStorage.removeItem("token");
        window.location.href = "/"; // redirect to login
      }, 5 * 60 * 1000); // 5 minutes
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);
      if (res.ok) {
        setMessage(data.message);
        localStorage.setItem("token", data.token); // save JWT
        localStorage.setItem("userId", data.user.id);
        if (onLoginSuccess) {
          onLoginSuccess("users");
        }
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("⚠️ Error connecting to server");
    }
  };

  // Determine message color based on content
  const getMessageColor = () => {
    if (!message) return "";
    if (message.toLowerCase().includes("error") || message.toLowerCase().includes("⚠️")) return "text-red-600 bg-red-100 border-red-300";
    if (message.toLowerCase().includes("warning") || message.toLowerCase().includes("⚠️")) return "text-yellow-600 bg-yellow-100 border-yellow-300";
    if (message.toLowerCase().includes("success") || message.toLowerCase().includes("logged in") || message.toLowerCase().includes("welcome")) return "text-green-600 bg-green-100 border-green-300";
    return "text-gray-700 bg-gray-100 border-gray-300";
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl shadow-lg max-w-md w-full p-10">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg mb-8 text-center">
          HeavySync
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl px-4 py-3 bg-white/70 placeholder-gray-500 text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-orange-400 focus:ring-opacity-50 transition duration-300 shadow-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl px-4 py-3 bg-white/70 placeholder-gray-500 text-gray-900 font-medium focus:outline-none focus:ring-4 focus:ring-orange-400 focus:ring-opacity-50 transition duration-300 shadow-sm"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-red-500 via-orange-600 to-yellow-600 text-white font-semibold py-3 shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-orange-400 focus:ring-opacity-60"
          >
            Login
          </button>
        </form>
        <p
          className={`mt-6 p-3 rounded-lg border text-center font-semibold min-h-[1.5rem] ${getMessageColor()}`}
          role="alert"
        >
          {message}
        </p>
      </div>
    </div>
  );
}

export default Login;
