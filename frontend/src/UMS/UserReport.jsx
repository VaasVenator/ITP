import React, { useState, useEffect } from "react";
import Header from "./Components/Header";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function UserReport({ onBack }) {
  const [users, setUsers] = useState([]);
  const [selectedFields, setSelectedFields] = useState([
    "employeeNumber",
    "username",
    "email",
    "status",
    "designation",
  ]);

  const availableFields = [
    { key: "employeeNumber", label: "Employee Number" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "designation", label: "Designation" },
    { key: "createdDate", label: "Created Date" },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("http://localhost:4000/users");
      const data = await res.json();

    console.log(data[0]); // <-- add this to inspect
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const toggleField = (field) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const generatePDF = () => {
    const doc = new jsPDF(); 
    doc.setFontSize(20);
    doc.text("HeavySync", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Generated Report`, 105, 25, { align: "center" });

    const tableHead = selectedFields.map(
      (field) =>
        availableFields.find((f) => f.key === field)?.label || field
    );
    const tableData = users.map((user) =>
      selectedFields.map((field) => {
        if (field === "createdDate") {
          return formatDate(user[field]);
        }
        return user[field] || "-";
      })
    );

    autoTable(doc, {
      startY: 35,
      head: [tableHead],
      body: tableData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 70, 229] },
    });

    doc.save("User_Report.pdf");
  };

  const generateCSV = () => {
    const csvHeader = selectedFields.join(",");
    const csvRows = users.map((user) =>
      selectedFields.map((f) => {
        if (f === "createdDate") {
          return `"${formatDate(user[f])}"`;
        }
        return `"${user[f] || ""}"`;
      }).join(",")
    );
    const csvContent = [csvHeader, ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "User_Report.csv";
    link.click();
  };

  return (
    <>
      <Header onBack={onBack} />
      <main className="min-h-screen bg-blue-50 p-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">User Report</h1>

        <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-4xl">
          <h2 className="text-2xl font-semibold mb-4">Select Fields</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {availableFields.map((field) => (
              <label
                key={field.key}
                className="flex items-center gap-2 text-lg"
              >
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field.key)}
                  onChange={() => toggleField(field.key)}
                  className="w-5 h-5 accent-indigo-600"
                />
                {field.label}
              </label>
            ))}
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={generatePDF}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Generate PDF
            </button>
            <button
              onClick={generateCSV}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Generate CSV
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default UserReport;