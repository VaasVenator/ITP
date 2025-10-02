import React, { useEffect, useState } from "react";
import Header from "./Components/Header";
import { generateUserPDF } from "../utils/generateUserPDF";

function UserProfile({ userId, onBack, onLogout, goToMyProfile }) {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("Fetching user with ID:", userId);
        const res = await fetch(`http://localhost:4000/users/${userId}`);
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        console.log("Fetched user data:", data);
        setUser(data);
        setFormData(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setError(err.message);
      }
    };
    fetchUser();
  }, [userId]);

  const handleTerminate = () => {
    setShowConfirmModal(true);
  };

  const confirmTerminate = async () => {
    await fetch(`http://localhost:4000/users/${userId}/terminate`, { method: "PATCH" });
    setUser({ ...user, status: "inactive" });
    setShowConfirmModal(false);
    setShowSuccessModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:4000/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert(`User "${user.username}" deleted successfully`);
        onBack();
      } else {
        const errData = await res.json();
        alert(`Failed to delete user: ${errData.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const res = await fetch(`http://localhost:4000/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const updated = await res.json();
    setUser(updated.user);
    setIsEditing(false);
  };

  const statusColors = {
    active: "#4ade80", // green
    inactive: "#f87171", // red
    pending: "#fbbf24", // yellow
  };

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#f0f7ff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            maxWidth: "500px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              background: "linear-gradient(to right, #000, #4b0082)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "1rem",
            }}
          >
            Error
          </h2>
          <p style={{ marginBottom: "1.5rem", color: "#333" }}>{error}</p>
          <button
            onClick={onBack}
            style={{
              background: "linear-gradient(to right, #000, #4b0082)",
              color: "#fff",
              padding: "0.75rem 2rem",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            }}
          >
            Back
          </button>
        </div>
      </main>
    );
  }

  if (!user) return <p>Loading...</p>;

  return (
    <>
    <Header goToMyProfile={goToMyProfile} onLogout={onLogout} onBack={onBack} />
      <main className="min-h-screen bg-gradient-to-tr from-blue-100 via-white to-blue-50 flex justify-center items-start py-12 px-6 font-sans">
        <div className="max-w-5xl w-full bg-white/30 backdrop-blur-md rounded-3xl p-10 shadow-lg shadow-blue-300/30 border border-white/40 bg-gradient-to-r from-white/40 to-white/20">
          <h2 className="text-4xl font-extrabold tracking-wide mb-4 text-gray-900 drop-shadow-md">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-lg font-semibold tracking-wide text-indigo-700 mb-10">@{user.username}</p>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="block text-lg font-semibold mb-1 text-gray-800">First Name:</label>
                <input
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-1 text-gray-800">Last Name:</label>
                <input
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-1 text-gray-800">Email:</label>
                <input
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-1 text-gray-800">Address:</label>
                <input
                  name="homeTown"
                  value={formData.homeTown || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-1 text-gray-800">Mobile:</label>
                <input
                  name="mobile"
                  value={formData.mobile || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-1 text-gray-800">NIC:</label>
                <input
                  name="nic"
                  value={formData.nic || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-1 text-gray-800">Designation:</label>
                <input
                  name="designation"
                  value={formData.designation || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-1 text-gray-800">Role:</label>
                <input
                  name="role"
                  value={formData.role || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: "Employee Number", value: user.employeeNumber },
                { label: "NIC", value: user.nic },
                { label: "Email", value: user.email },
                { label: "Mobile", value: user.mobile },
                { label: "Designation", value: user.designation },
                { label: "Address", value: user.homeTown },
                { label: "Created By", value: user.createdBy || "N/A" },
                { label: "Created Date", value: user.createdDate ? new Date(user.createdDate).toLocaleDateString() : "N/A" },
                { label: "Status", value: user.status, isStatus: true },
                { label: "Role", value: user.role },
              ].map(({ label, value, isStatus }) => (
                <div
                  key={label}
                  className="bg-white/70 rounded-xl p-6 shadow-md hover:scale-105 hover:shadow-indigo-400/50 transition-transform duration-300 cursor-default"
                >
                  <p className="text-lg font-semibold tracking-wide text-gray-700 mb-2">{label}:</p>
                  {isStatus ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.3rem 1rem",
                        borderRadius: "9999px",
                        backgroundColor: statusColors[value?.toLowerCase()] || "#9ca3af",
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: "1rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {value}
                    </span>
                  ) : (
                    <p className="text-lg text-gray-800 font-semibold tracking-wide">{value}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-6 justify-end">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-green-500 to-green-700 text-white font-extrabold text-lg shadow-lg hover:scale-105 hover:shadow-green-400/70 transition transform duration-300 active:scale-95"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 text-white font-extrabold text-lg shadow-lg hover:scale-105 hover:shadow-gray-500/70 transition transform duration-300 active:scale-95"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => generateUserPDF(user)}
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-purple-600 to-purple-800 text-white font-extrabold text-lg shadow-lg hover:scale-105 hover:shadow-purple-500/80 transition transform duration-300 active:scale-95"
                >
                  Download PDF
                </button>
                <button
                  onClick={handleDelete}
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-extrabold text-lg shadow-lg hover:scale-105 hover:shadow-red-500/80 transition transform duration-300 active:scale-95"
                >
                  Delete
                </button>
                <button
                  onClick={handleTerminate}
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-red-600 to-red-800 text-white font-extrabold text-lg shadow-lg hover:scale-105 hover:animate-pulse hover:shadow-red-500/80 transition transform duration-300 active:scale-95"
                >
                  Terminate
                </button>
                <button
                  onClick={handleEdit}
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-extrabold text-lg shadow-lg hover:scale-105 hover:shadow-blue-500/80 transition transform duration-300 active:scale-95"
                >
                  Edit
                </button>
                <button
                  onClick={onBack}
                  className="px-10 py-4 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 text-white font-extrabold text-lg shadow-lg hover:scale-105 hover:shadow-gray-500/80 transition transform duration-300 active:scale-95"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      </main>
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="mb-4">Are you sure you need to terminate "{user.username}". This action cannot be undo</p>
            <div className="flex justify-center gap-4">
              <button onClick={confirmTerminate} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Confirm</button>
              <button onClick={() => setShowConfirmModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      )}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="mb-4">"{user.username}" terminated</p>
            <button onClick={() => setShowSuccessModal(false)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">OK</button>
          </div>
        </div>
      )}
      
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="mb-4">Are you sure you want to permanently delete "{user.username}"? This action cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Confirm</button>
              <button onClick={() => setShowDeleteModal(false)} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      )}
      
    </>
  );
}

export default UserProfile;