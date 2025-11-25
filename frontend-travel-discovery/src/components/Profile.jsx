// frontend-travel-discovery/src/pages/Profile.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Agar login nahi hai
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md max-w-md w-full p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            You&apos;re not logged in
          </h2>
          <p className="text-gray-500 mb-6">
            Profile dekhne ke liye pehle login karna hoga.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-8">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          User Profile
        </h1>

        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 mb-3">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <p className="text-lg font-semibold text-gray-800">
            {user.name || "User"}
          </p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        {/* Info section */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500 text-sm">Name</span>
            <span className="text-gray-800 text-sm font-medium">
              {user.name}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500 text-sm">Email</span>
            <span className="text-gray-800 text-sm font-medium break-all">
              {user.email}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </Link>

          <button
            onClick={handleLogout}
            className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
