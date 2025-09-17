import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await axios.post("http://localhost:8800/api/v1/forgot-password", { email });
      toast.success("Password reset link sent to your email!");
      setSent(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong!";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.history.back();
  };

  const handleResendEmail = () => {
    setSent(false);
    setError("");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={handleBackToLogin}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {!sent ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </h1>
                <p className="text-gray-600 text-sm">
                  No worries! Enter your email address and we'll send you a reset link.
                </p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || !email}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending Reset Link...</span>
                    </div>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Remember your password?{" "}
                  <button
                    onClick={handleBackToLogin}
                    className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-colors"
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Check Your Email
                </h1>
                <p className="text-gray-600 text-sm mb-6">
                  We've sent a password reset link to{" "}
                  <span className="font-medium text-gray-900">{email}</span>
                </p>

                {/* Instructions */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium text-blue-900 mb-2">Next steps:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Check your email inbox</li>
                    <li>• Look for an email from us (check spam folder too)</li>
                    <li>• Click the reset link in the email</li>
                    <li>• Create your new password</li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleBackToLogin}
                    className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                  >
                    Back to Login
                  </button>
                  
                  <button
                    onClick={handleResendEmail}
                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Didn't receive the email? Send again
                  </button>
                </div>

                {/* Help */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Still having trouble?{" "}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                      Contact support
                    </a>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400">
            Secure password reset powered by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;