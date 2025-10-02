import React, { useState } from "react";
import Header from "./Components/Header";
import validateUser from "../utils/validateUser";


function CreateUser({ onLogout, goToUsers, goToMyProfile }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    homeTown: "",
    mobile: "",
    nic: "",
    designation: "",
    role: "user",
    password: "",
  });
  const [popup, setPopup] = useState({ show: false, text: "" });

  // Added roles state with sample roles
  const [roles] = useState([
    { roleID: "R001", roleName: "Admin" },
    { roleID: "R002", roleName: "Cashier" },
    { roleID: "R003", roleName: "Purchase Officer" },
    { roleID: "R004", roleName: "Vehicle Manager" },
    { roleID: "R005", roleName: "Other" },
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMessage = validateUser(formData);
    if (errorMessage) {
      setPopup({ show: true, text: errorMessage });
      return;
    }
    try {
      const createdBy = localStorage.getItem("userId");
      const res = await fetch("http://localhost:4000/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          roleID: formData.role, // map frontend 'role' to backend 'roleID'
          createdBy,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPopup({ show: true, text: data.message + " | Username: " + data.user.username });
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          homeTown: "",
          mobile: "",
          nic: "",
          designation: "",
          role: "user",
          password: "",
        });
      } else {
        setPopup({ show: true, text: data.error });
      }
    } catch (err) {
        console.error("Create user failed:", err);
        setPopup({ show: true, text: "⚠️ Error connecting to server" });
      }
  };


  return (
    <>
      <Header goToMyProfile={goToMyProfile} onLogout={onLogout} onBack={goToUsers} />

      <main className="min-h-screen bg-blue-50 p-8 flex flex-col items-center">
        <button
          type="button"
          className="text-3xl font-extrabold text-white bg-gradient-to-r from-gray-800 to-black px-8 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition"
          disabled
        >
          Add a user
        </button>

        <form
          onSubmit={handleSubmit}
          className="mt-10 bg-white rounded-2xl p-8 max-w-3xl w-full shadow-xl border border-gray-200"
        >
          <div className="grid grid-cols-[1fr_2fr] gap-x-8 gap-y-6 items-center">
            {[
              { label: "First Name", name: "firstName" },
              { label: "Last Name", name: "lastName" },
              { label: "Email", name: "email", type: "email" },
              { label: "Home Town", name: "homeTown" },
              { label: "Mobile", name: "mobile" },
              { label: "NIC", name: "nic" },
              { label: "Designation", name: "designation" },
              { label: "Role", name: "role", type: "select" },
              { label: "Password", name: "password", type: "password" },
            ].map((field) => (
              <React.Fragment key={field.name}>
                <label
                  htmlFor={field.name}
                  className="text-right font-semibold text-gray-700 select-none"
                >
                  {field.label}
                </label>
                {field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 p-3 focus:outline-none focus:ring-4 focus:ring-gray-600 focus:border-gray-600 transition cursor-pointer appearance-none"
                  >
                    <option value="" className="text-gray-400">-- Select Role --</option>
                    {roles.map((role) => (
                      <option key={role.roleID} value={role.roleID} className="text-gray-900">
                        {role.roleName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.name}
                    type={field.type || "text"}
                    name={field.name}
                    placeholder={field.label}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 p-3 focus:outline-none focus:ring-4 focus:ring-gray-600 focus:border-gray-600 transition"
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="mt-10 flex justify-end gap-6">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-800 text-white font-extrabold py-3 px-8 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  firstName: "",
                  lastName: "",
                  email: "",
                  homeTown: "",
                  mobile: "",
                  nic: "",
                  designation: "",
                  role: "user",
                  password: "",
                })
              }
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold py-3 px-8 rounded-xl shadow hover:scale-105 active:scale-95 transition"
            >
              Cancel
            </button>
          </div>
        </form>

        {popup.show && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-300 text-gray-900 max-w-sm w-full text-center animate-scaleIn">
              <p className="mb-6 font-semibold text-gray-800 text-lg">
                {popup.text}
              </p>
              <button
                onClick={() => setPopup({ show: false, text: "" })}
                className="bg-gradient-to-r from-green-600 to-green-800 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transform transition-all duration-300 ease-in-out"
              >
                OK
              </button>
            </div>
          </div>
        )}

        <style>{`
          @keyframes scaleIn {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease forwards;
          }
        `}</style>
      </main>
    </>
  );
}

export default CreateUser;