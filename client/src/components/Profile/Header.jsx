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
        className={`rounded-b-3xl p-6 shadow-2xl relative transition-all duration-500 overflow-hidden ${isDark
          ? "bg-slate-900"
          : "bg-white border-b border-slate-100"
          }`}
      >
        {/* Modern background gradient for non-dark mode */}
        {!isDark && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 -z-10"></div>
        )}

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={`absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 animate-pulse ${isDark ? "bg-purple-500 opacity-10" : "bg-indigo-300 opacity-20"
              }`}
          ></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* User info section */}
            <div className="flex items-center gap-6 w-full md:w-auto">
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserMenuToggle();
                  }}
                  aria-label="User menu"
                  aria-haspopup="true"
                  aria-expanded={showUserMenu}
                  className={`group w-16 h-16 rounded-2xl shadow-sm transition-all duration-300 relative overflow-hidden hover:scale-105 cursor-pointer flex items-center justify-center ${isDark ? "bg-gray-800 border-gray-700" : "bg-slate-50 border-slate-200"
                    } border-2 ${showUserMenu ? "ring-4 ring-indigo-500/20 border-indigo-600" : ""}`}
                >
                  <User
                    className={`h-7 w-7 ${isDark ? "text-indigo-400" : "text-indigo-600"
                      }`}
                  />
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    className={`absolute top-full mt-4 left-0 w-64 rounded-2xl shadow-2xl border-0 z-[9999] p-2 animate-in fade-in slide-in-from-top-2 duration-200 ${isDark
                      ? "bg-gray-800"
                      : "bg-white"
                      } ring-1 ring-black/5`}
                  >
                    <div className="p-3 border-b border-slate-100 mb-2">
                      <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>Account</p>
                    </div>

                    <div className="space-y-1">
                      {[
                        { icon: Edit, label: "Edit Profile", action: handleEditProfile },
                        { icon: Shield, label: "Privacy & Security", action: handlePrivacySettings },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={item.action}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 text-sm font-semibold ${isDark
                            ? "hover:bg-gray-700 text-gray-200"
                            : "hover:bg-slate-50 text-slate-700 hover:text-indigo-600"
                            }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h1
                  className={`text-2xl md:text-3xl font-black transition-all duration-300 tracking-tight ${isDark
                    ? "text-white"
                    : "text-slate-900"
                    }`}
                >
                  {userData.username}
                </h1>
                <div className="flex items-center gap-4 mt-1">
                  <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>
                    Creator Account
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <div className="flex items-center gap-1.5">
                    <Mail className={`h-3 w-3 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                    <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{userData.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions section */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={`p-3.5 rounded-2xl shadow-sm transition-all duration-300 hover:scale-105 border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50"
                  }`}
              >
                {isDark ? (
                  <Sun className="h-6 w-6 text-amber-300" />
                ) : (
                  <Moon className="h-6 w-6 text-indigo-600" />
                )}
              </button>

              <button
                disabled={loggingOut}
                onClick={LogOutHandler}
                className={`flex-grow md:flex-grow-0 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-sm flex items-center justify-center gap-3 transition-all duration-300 ${loggingOut
                  ? "opacity-60 cursor-not-allowed"
                  : isDark
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100 hover:-translate-y-0.5"
                  }`}
              >
                {loggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Spacer for the overlapping dashboard content */}
          <div className="h-10"></div>
        </div>
      </div>
    )
  );
};

export default Header;
