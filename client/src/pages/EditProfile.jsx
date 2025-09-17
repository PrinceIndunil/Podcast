import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password && formData.password !== formData.confirmPassword) {
    setMessage("Passwords do not match!");
    return;
  }

  try {
    const res = await fetch("http://localhost:8800/api/v1/update-profile", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.name,
        email: formData.email,
        password: formData.password || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Update failed");

    setMessage(data.message);

    setFormData((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
    }));

  } catch (err) {
    setMessage(err.message);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-all duration-500">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          Edit Profile
        </h1>

        {message && (
          <p className="text-center mb-4 text-sm font-medium text-purple-600 dark:text-purple-400">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              className="w-full p-3 rounded-xl border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="w-full p-3 rounded-xl border dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all duration-300"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
