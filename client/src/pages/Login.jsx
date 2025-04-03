import React, { useState } from "react";
import { Link , useNavigate } from "react-router-dom";
import axios from "axios";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../store/auth";
import Error from "./Error";

const Login = () => {
  const isLoggedIn = useSelector((state)=> state.auth.isLoggedIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [Values, setValues] = useState({
    email: "",
    password: "",
  });

  const  change = (e) => {
    const {name,value} = e.target;
    setValues({...Values, [name]: value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const res = await axios.post("http://13.60.226.71:8800/api/v1/login", 
      Values,
    {withCredentials: true}
  );
      dispatch(authActions.login())
      navigate("/profile");
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };
  return (
    <>{isLoggedIn ? <Error/>: 
      <div className="min-h-screen bg-gradient-to-r from-[#E6E6FA] to-[#d3d3f5] flex items-center justify-center px-4 sm:px-6">
      <ToastContainer
      position="top-center"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      
      />
<div className="w-full max-w-sm sm:max-w-md bg-white rounded-lg shadow-lg p-6 sm:p-8">
  <Link
    to="/"
    className="text-2xl sm:text-3xl font-extrabold text-center text-[#6B4691] mb-6 block hover:opacity-90 transition"
  >
    MYTUBE
  </Link>
  <form className="space-y-6">
    <div className="flex flex-col">
      <label
        htmlFor="email"
        className="text-sm sm:text-base font-semibold text-gray-600"
      >
        Email
      </label>
      <input
        type="email"
        id="email"
        className="mt-2 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A19AD3] focus:outline-none transition"
        required
        placeholder="Enter your email address"
        name="email"
        aria-label="Email"
        value={Values.email}
        onChange={change}
      />
    </div>
    <div className="flex flex-col">
      <label
        htmlFor="password"
        className="text-sm sm:text-base font-semibold text-gray-600"
      >
        Password
      </label>
      <input
        type="password"
        id="password"
        className="mt-2 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#A19AD3] focus:outline-none transition"
        required
        placeholder="Enter your password"
        name="password"
        aria-label="Password"
        value={Values.password}
        onChange={change}
      />
    </div>
    
    <button className="w-full bg-gradient-to-r from-[#6B4691] to-[#A19AD3] text-white text-lg font-bold py-2 rounded-lg shadow-lg hover:scale-105 hover:opacity-90 transition transform"
    onClick={handleSubmit}>
      Login
    </button>
    <p className="text-center text-sm sm:text-base text-gray-600">
      Don't have an account?{" "}
      <Link
        to="/signup"
        className="text-[#6B4691] font-semibold hover:underline hover:text-[#563c8d] transition"
      >
        Sign up here
      </Link>
    </p>
  </form>
</div>
</div>
}</>
    
  );
};

export default Login;
