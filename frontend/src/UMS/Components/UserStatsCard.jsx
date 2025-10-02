import React from "react";

/**
 * UserStatsCard component displays total, active, and inactive users in styled cards.
 * @param {Object} props
 * @param {number} props.totalUsers
 * @param {number} props.activeUsers
 * @param {number} props.inactiveUsers
 */
const UserStatsCard = ({ totalUsers, activeUsers, inactiveUsers }) => (
  <div className="w-full max-w-5xl flex justify-between items-center gap-6 mb-8">
    <div className="bg-gradient-to-r from-black to-gray-900 text-white rounded-2xl p-6 flex flex-col items-center shadow-xl transform transition-transform duration-300 hover:scale-105 flex-1">
      <div className="text-xl font-semibold tracking-wide flex items-center gap-3 mb-2">
        <span className="text-3xl">👥</span>Total Users
      </div>
      <div className="text-4xl font-extrabold">{totalUsers}</div>
    </div>
    <div className="bg-green-600 text-white rounded-2xl p-6 flex flex-col items-center shadow-xl transform transition-transform duration-300 hover:scale-105 flex-1">
      <div className="text-xl font-semibold tracking-wide flex items-center gap-3 mb-2">
        <span className="text-3xl"></span>Active Users
      </div>
      <div className="text-4xl font-extrabold">{activeUsers}</div>
    </div>
    <div className="bg-red-600 text-white rounded-2xl p-6 flex flex-col items-center shadow-xl transform transition-transform duration-300 hover:scale-105 flex-1">
      <div className="text-xl font-semibold tracking-wide flex items-center gap-3 mb-2">
        <span className="text-3xl"></span>Inactive Users
      </div>
      <div className="text-4xl font-extrabold">{inactiveUsers}</div>
    </div>
  </div>
);

export default UserStatsCard;