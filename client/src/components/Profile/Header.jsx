import React, { useEffect, useState, useRef } from "react";
import {
  LogOut,
  Mail,
  Loader2,
  User,
  Sun,
  Moon,
  Settings,
  Key,
  Edit,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { authActions } from "../../store/auth";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [theme, setTheme] = useState("light");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setTimeout(async () => {
          try {
            const res = await fetch("http://localhost:8800/api/v1/user-details", {
              credentials: "include",
            });

            if (!res.ok) throw new Error("Failed to fetch user data");

            const data = await res.json();
            setUserData(data.user);
          } catch (err) {
            console.error("Error fetching user details:", err);
            setError("Failed to load user details. Please try again later.");
          } finally {
            setLoading(false);
          }
        }, 1500);
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
        setError("An unexpected error occurred.");
      }
    };

    fetchUserDetails();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const LogOutHandler = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      await fetch("http://localhost:8800/api/v1/logout", {
        method: "POST",
        credentials: "include",
      });

      dispatch(authActions.logout());
      navigate("/");
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleChangePassword = () => {
    setShowUserMenu(false);
    navigate("/change-password");
  };

  const handleEditProfile = () => {
    setShowUserMenu(false);
    navigate("/edit-profile");
  };

  const handleAccountSettings = () => {
    setShowUserMenu(false);
    navigate("/account-settings");
  };

  const handlePrivacySettings = () => {
    setShowUserMenu(false);
    navigate("/privacy-settings");
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-10 flex justify-center items-center shadow-lg animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
          <p className="text-indigo-700 font-medium text-lg">
            Preparing your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl py-8 px-6 shadow-md">
        <p className="text-center text-rose-600 font-medium flex items-center justify-center gap-3">
          <span className="bg-rose-100 p-2 rounded-full">⚠️</span>
          {error}
        </p>
        <div className="mt-6 text-center">
          <button
            className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 rounded-lg transition-colors duration-300 font-medium"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    userData && (
      <div
        className={`rounded-2xl p-8 shadow-xl relative transition-all duration-500 ${
          isDark
            ? "bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900"
            : "bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50"
        }`}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={`absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 animate-pulse-slow ${
              isDark ? "bg-purple-500 opacity-10" : "bg-yellow-200 opacity-30"
            }`}
          ></div>
          <div
            className={`absolute bottom-0 right-1/4 w-72 h-72 rounded-full blur-3xl translate-y-1/2 animate-pulse-slow animation-delay-2000 ${
              isDark ? "bg-indigo-500 opacity-10" : "bg-teal-200 opacity-40"
            }`}
          ></div>
          <div
            className={`absolute -left-20 top-1/2 w-40 h-40 rounded-full blur-3xl animate-pulse-slow animation-delay-1000 ${
              isDark ? "bg-blue-500 opacity-10" : "bg-pink-200 opacity-30"
            }`}
          ></div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* User info section */}
            <div className="text-center lg:text-left w-full lg:w-auto">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                {/* Profile Icon & Theme Toggle */}
                <div className="flex items-center gap-4">
                  {/* User Profile Dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUserMenuToggle();
                      }}
                      className={`group p-4 rounded-2xl shadow-lg transition-all duration-300 relative overflow-hidden hover:scale-105 cursor-pointer ${
                        isDark ? "bg-gray-800" : "bg-white"
                      } ${showUserMenu ? "ring-2 ring-indigo-500" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        <User
                          className={`h-8 w-8 ${
                            isDark ? "text-indigo-400" : "text-indigo-600"
                          } transition-colors duration-300`}
                        />
                        <ChevronDown
                          className={`h-4 w-4 ${
                            isDark ? "text-indigo-400" : "text-indigo-600"
                          } transition-transform duration-300 ${
                            showUserMenu ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white opacity-10"></div>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <div
                        className={`absolute top-full mt-2 left-0 w-64 rounded-xl shadow-2xl border z-[9999] ${
                          isDark
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="py-3">
                          {/* Header */}
                          <div
                            className={`px-4 py-2 border-b mb-2 ${
                              isDark ? "border-gray-700" : "border-gray-100"
                            }`}
                          >
                            <p
                              className={`font-semibold text-sm ${
                                isDark ? "text-white" : "text-gray-900"
                              }`}
                            >
                              Account Settings
                            </p>
                            <p
                              className={`text-xs ${
                                isDark ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              Manage your profile
                            </p>
                          </div>

                          {/* Menu Items */}
                          <div className="space-y-1 px-2">
                            <button
                              onClick={handleEditProfile}
                              className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 text-sm font-medium ${
                                isDark
                                  ? "hover:bg-gray-700 text-gray-200 hover:text-white"
                                  : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                              }`}
                            >
                              <Edit
                                className={`h-4 w-4 ${
                                  isDark ? "text-indigo-400" : "text-indigo-600"
                                }`}
                              />
                              <span>Edit Profile</span>
                            </button>


                            <button
                              onClick={handlePrivacySettings}
                              className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200 text-sm font-medium ${
                                isDark
                                  ? "hover:bg-gray-700 text-gray-200 hover:text-white"
                                  : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                              }`}
                            >
                              <Shield
                                className={`h-4 w-4 ${
                                  isDark ? "text-indigo-400" : "text-indigo-600"
                                }`}
                              />
                              <span>Privacy & Security</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Theme Toggle Button */}
                  <button
                    onClick={toggleTheme}
                    className={`p-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 ${
                      isDark ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                    {isDark ? (
                      <Sun className="h-8 w-8 text-amber-300" />
                    ) : (
                      <Moon className="h-8 w-8 text-indigo-600" />
                    )}
                  </button>
                </div>

                {/* Welcome text */}
                <div>
                  <h2
                    className={`text-xl font-medium mb-1 ${
                      isDark ? "text-indigo-200" : "text-indigo-600"
                    }`}
                  >
                    Welcome back
                  </h2>
                  <h1
                    className={`text-4xl md:text-5xl font-bold transition-all duration-300 ${
                      isDark
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-200"
                        : "text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-600"
                    }`}
                  >
                    {userData.username}
                  </h1>
                </div>
              </div>

              {/* Email display */}
              <div
                className={`inline-flex items-center gap-2 py-2 px-4 rounded-full shadow-md transition-all duration-300 ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
              >
                <Mail
                  className={`h-4 w-4 ${
                    isDark ? "text-indigo-300" : "text-indigo-600"
                  }`}
                />
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-indigo-200" : "text-indigo-700"
                  }`}
                >
                  {userData.email}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <div>
              <button
                disabled={loggingOut}
                onClick={LogOutHandler}
                className={`relative group px-6 py-3 rounded-full text-lg font-semibold shadow-lg flex items-center gap-3 transition-all duration-300 ${
                  loggingOut
                    ? "opacity-60 cursor-not-allowed"
                    : isDark
                    ? "bg-gradient-to-r from-indigo-700 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-500"
                    : "bg-gradient-to-r from-indigo-600 to-purple-500 text-white hover:from-indigo-500 hover:to-purple-400"
                }`}
              >
                {loggingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                )}
                <span>Log Out</span>

                {/* Button hover effect */}
                <span className="absolute inset-0 rounded-full bg-white -z-10 opacity-0 group-hover:opacity-20 transform scale-110 transition-all duration-300"></span>
              </button>
            </div>
          </div>

          {/* Status badge */}
          <div
            className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1 ${
              isDark ? "bg-gray-800 text-green-400" : "bg-white text-green-600"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Online
          </div>
        </div>
      </div>
    )
  );
};

export default Header;
