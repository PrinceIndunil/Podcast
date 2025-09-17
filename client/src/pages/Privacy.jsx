import React, { useState, useEffect } from "react";
import { Shield, Bell, Trash2, Save, Check, X, Info, Eye, EyeOff } from "lucide-react";

const PrivacySecurity = () => {
  const [privacySettings, setPrivacySettings] = useState({
    profilePublic: true,
    notifications: true,
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Auto-hide messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const handleToggle = (key) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setMessage(""); // clear previous messages
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showMessage("Settings saved successfully! 🎉", "success");
    } catch (err) {
      console.error(err);
      showMessage("Oops! Failed to save settings. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showMessage("Account deletion initiated. You'll be redirected shortly.", "info");
      // TODO: logout and redirect after delay
    } catch (err) {
      console.error(err);
      showMessage("Failed to delete account. Please contact support if this continues.", "error");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const MessageAlert = ({ message, type }) => {
    const styles = {
      success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
      error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200",
      info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
    };

    const icons = {
      success: <Check className="h-4 w-4" />,
      error: <X className="h-4 w-4" />,
      info: <Info className="h-4 w-4" />
    };

    return (
      <div className={`p-4 rounded-xl border-2 ${styles[type]} flex items-center gap-2 transition-all duration-300`}>
        {icons[type]}
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  };

  const ToggleSwitch = ({ checked, onChange, label, disabled = false }) => (
    <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer dark:bg-gray-700 peer-checked:bg-indigo-600 transition-all duration-300 relative">
        <div className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 peer-checked:translate-x-5"></div>
      </div>
      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
        {label}
      </span>
    </label>
  );

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-500">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
            <Shield className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Privacy & Security
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage your account privacy and security preferences
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
            <MessageAlert message={message} type={messageType} />
          </div>
        )}

        {/* Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-8 space-y-8">
            
            {/* Profile Visibility Setting */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {privacySettings.profilePublic ? (
                    <Eye className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mt-1" />
                  ) : (
                    <EyeOff className="h-6 w-6 text-gray-500 dark:text-gray-400 mt-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Profile Visibility
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                    {privacySettings.profilePublic 
                      ? "Your profile is visible to everyone. Anyone can see your podcasts and activity." 
                      : "Your profile is private. Only approved followers can see your content."
                    }
                  </p>
                  <ToggleSwitch
                    checked={privacySettings.profilePublic}
                    onChange={() => handleToggle("profilePublic")}
                    label={privacySettings.profilePublic ? "Public Profile" : "Private Profile"}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Notifications Setting */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <Bell className={`h-6 w-6 mt-1 ${privacySettings.notifications ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Push Notifications
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                    {privacySettings.notifications 
                      ? "You'll receive notifications for new podcasts, likes, comments, and follower activity." 
                      : "All notifications are disabled. You won't receive any alerts."
                    }
                  </p>
                  <ToggleSwitch
                    checked={privacySettings.notifications}
                    onChange={() => handleToggle("notifications")}
                    label={privacySettings.notifications ? "Notifications On" : "Notifications Off"}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-8 space-y-4">
            <button
              onClick={handleSaveSettings}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>

            {/* Delete Account Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Danger Zone
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This action cannot be undone and will permanently delete your account
                </p>
              </div>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                  className="w-full bg-gray-100 hover:bg-red-50 disabled:bg-gray-50 text-gray-700 hover:text-red-700 font-medium py-3 px-6 rounded-xl border-2 border-gray-200 hover:border-red-200 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium text-center">
                      Are you absolutely sure? This will permanently delete your account and all your data.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isLoading}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-xl transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Yes, Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Contact our{" "}
            <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacySecurity;