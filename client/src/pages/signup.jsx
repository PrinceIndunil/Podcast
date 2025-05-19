import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import { useSelector } from "react-redux";
import Error from "./Error"; // Make sure this component exists

const Signup = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();
  
  const [values, setValues] = useState({
    username: "",
    email: "",
    password: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [appear, setAppear] = useState(false);
  
  useEffect(() => {
    setAppear(true);
  }, []);

  // Password strength calculator
  useEffect(() => {
    if (!values.password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    // Length check
    if (values.password.length >= 8) strength += 25;
    // Contains number
    if (/\d/.test(values.password)) strength += 25;
    // Contains lowercase
    if (/[a-z]/.test(values.password)) strength += 25;
    // Contains uppercase or special character
    if (/[A-Z]/.test(values.password) || /[^A-Za-z0-9]/.test(values.password)) strength += 25;
    
    setPasswordStrength(strength);
  }, [values.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await axios.post("http://localhost:8800/api/v1/signup", values);
      
      // Success feedback
      toast.success(res.data.message || "Signup successful!");
      
      // Small delay for better UX with the success message
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };
  
  // Get password strength color
  const getStrengthColor = () => {
    if (passwordStrength < 25) return "bg-red-500";
    if (passwordStrength < 50) return "bg-orange-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  // Get password strength label
  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength < 25) return "Very Weak";
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 75) return "Good";
    return "Strong";
  };
  
  if (isLoggedIn) return <Error />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100 flex items-center justify-center px-4 sm:px-6 py-12">
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
      
      {/* Decorative elements */}
      <div className="absolute top-16 left-16 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-16 right-16 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 right-1/3 w-60 h-60 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      
      <div className={`w-full max-w-md transform transition-all duration-1000 ${appear ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
        <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
          
          {/* Colorful top accent */}
          <div className="h-2 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500"></div>
          
          <div className="px-8 pt-8 pb-8">
            {/* Logo and Branding */}
            <div className="text-center mb-6">
              <Link
                to="/"
                className="inline-block"
              >
                <div className="flex items-center justify-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                  MYTUBE
                </h1>
                <p className="text-gray-500 text-sm mt-1">Join the ultimate podcast platform</p>
              </Link>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Your Account</h2>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="relative">
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="username"
                      className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                      required
                      placeholder="Choose a username"
                      name="username"
                      aria-label="Username"
                      value={values.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                      required
                      placeholder="Enter your email address"
                      name="email"
                      aria-label="Email"
                      value={values.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      id="password"
                      className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                      required
                      placeholder="Create a secure password"
                      name="password"
                      aria-label="Password"
                      value={values.password}
                      onChange={handleChange}
                    />
                  </div>
                  
                  {/* Password strength indicator */}
                  {values.password && (
                    <div className="mt-2">
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getStrengthColor()} transition-all duration-300`} 
                          style={{ width: `${passwordStrength}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 flex justify-between">
                        <span>Password strength:</span>
                        <span>{getStrengthLabel()}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the{" "}
                  <Link to="/terms" className="font-medium text-purple-600 hover:text-purple-500">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="font-medium text-purple-600 hover:text-purple-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
              
              <div className="relative flex items-center justify-center mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className="w-full flex items-center justify-center py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-all duration-200"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-all duration-200"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-all duration-200"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"/>
                  </svg>
                </button>
              </div>
            </form>
            
            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-purple-600 hover:text-purple-500 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2025 MYTUBE. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Signup;