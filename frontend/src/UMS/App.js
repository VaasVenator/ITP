import React, { useState } from "react";
import { ThemeProvider } from "./Components/ThemeContext.jsx";
import Login from "./Login.jsx";
import Users from "./Users.jsx";
import CreateUser from "./CreateUser.jsx";
import ProfileOverview from "./ProfileOverview.jsx";
import MyProfile from "./MyProfile.jsx";
import UserReport from "./UserReport.jsx";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleLoginSuccess = () => {
    setCurrentPage("users");
  };

  const handleLogout = () => {
    localStorage.clear();
    setCurrentPage("login");
  };

  const goToUserReport = () => setCurrentPage("userReport");

  const goToUsers = () => {
    setCurrentPage("users");
  };

  const goToCreateUser = () => {
    setCurrentPage("createUser");
  };

  const goToProfile = (userId) => {
    setSelectedUserId(userId);
    setCurrentPage("profileOverview");
  };

  const goToMyProfile = () => {
    setCurrentPage("myProfile");
  };

  return (
    <ThemeProvider>
      {currentPage === "login" && (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
      {currentPage === "users" && (
        <Users
          onBack={handleLogout}
          goToProfile={goToProfile}
          goToCreateUser={goToCreateUser}
          goToMyProfile={goToMyProfile}
          onLogout={handleLogout}
          goToUserReport={goToUserReport}
        />
      )}
      {currentPage === "createUser" && (
        <CreateUser
          onLogout={handleLogout}
          goToUsers={goToUsers}
          goToProfile={goToProfile}
          goToMyProfile={goToMyProfile}
        />
      )}
      {currentPage === "profileOverview" && selectedUserId && (
        <ProfileOverview
          userId={selectedUserId}
          onBack={goToUsers}
          onLogout={handleLogout}
          goToMyProfile={goToMyProfile}
        />
      )}
      {currentPage === "myProfile" && (
        <MyProfile
          userId={localStorage.getItem("userId")}
          onBack={goToUsers}
          onLogout={handleLogout}
        />
        
      )}
      {currentPage === "userReport" && (
        <UserReport
          onBack={goToUsers}        // Back button goes back to users page
          onLogout={handleLogout}    // Logout function
          goToMyProfile={goToMyProfile} // Optional, like other pages
        />
      )}
    </ThemeProvider>
  );
}

export default App;