import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { playerActions } from "../store/player";

const WatchHistory = () => {
  const [watchedPodcasts, setWatchedPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  
  const userId = useSelector((state) => state.auth.userId);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formatDate = (dateString) => {
    if (!dateString) return "Recently saved";
    const date = new Date(dateString);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (date > oneWeekAgo) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  // Function to group podcasts by date
  const groupPodcastsByDate = (podcasts) => {
    const groups = {};
    podcasts.forEach(podcast => {
      const dateKey = formatDate(podcast.savedAt || podcast.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(podcast);
    });
    return groups;
  };

  // Function to handle playing a podcast
  const handlePlay = async (podcast, e) => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      toast.error("Please login to play podcasts");
      navigate("/login");
      return;
    }
    
    if (!podcast) {
      toast.error("Podcast data not available");
      return;
    }
    
    try {
      dispatch(playerActions.setDiv());
      dispatch(playerActions.changeImage(`http://localhost:8800/${podcast.frontImage}`));
      dispatch(playerActions.changeSong(`http://localhost:8800/${podcast.audioFile}`));
      
      // Mark podcast as watched
      await axios.post("http://localhost:8800/api/v1/save-watched", {
        userId,
        podcastId: podcast._id,
      });
      
      toast.success(`Now playing: ${podcast.title}`);
      console.log("Podcast marked as watched and playing");
    } catch (error) {
      console.error("Error playing podcast:", error);
      toast.error("Failed to play podcast");
    }
  };

  // Function to filter podcasts
  const filterPodcasts = (filter) => {
    setActiveFilter(filter);
    setLoading(true);
    
    fetchWatchedPodcasts(filter);
  };

  // Function to fetch saved podcasts with optional filter
  const fetchWatchedPodcasts = async (filter = "all") => {
    try {
      const response = await axios.get(
        "http://localhost:8800/api/v1/get-saved-podcasts",
        { withCredentials: true }
      );

      let podcasts = response.data.data || [];

      // Apply category filter if needed
      if (filter !== "all") {
        podcasts = podcasts.filter(
          (podcast) =>
            podcast.category?.categoryName?.toLowerCase() === filter.toLowerCase()
        );
      }

      setWatchedPodcasts(podcasts);
    } catch (err) {
      console.error("Error fetching saved podcasts:", err);
      setError("Failed to fetch saved podcasts.");
      toast.error("Failed to load saved podcasts");
    } finally {
      setLoading(false);
    }
  };

  // Function to clear saved podcasts
  const clearSavedPodcasts = async () => {
    if (window.confirm("Are you sure you want to clear all saved podcasts?")) {
      try {
        await axios.delete(
          `http://localhost:8800/api/v1/clear-saved-podcasts`,
          { withCredentials: true }
        );
        setWatchedPodcasts([]);
        toast.success("Saved podcasts cleared successfully");
      } catch (err) {
        console.error("Error clearing saved podcasts:", err);
        toast.error("Failed to clear saved podcasts");
      }
    }
  };

  const removeFromSaved = async (podcastId) => {
    try {
      await axios.delete(
        `http://localhost:8800/api/v1/unsave-podcast/${podcastId}`,
        { withCredentials: true }
      );
      setWatchedPodcasts(
        watchedPodcasts.filter(podcast => podcast._id !== podcastId)
      );
      toast.success("Removed from saved podcasts");
    } catch (err) {
      console.error("Error removing podcast:", err);
      toast.error("Failed to remove from saved");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchWatchedPodcasts();
    }
  }, [userId, isLoggedIn]);

  // Organized podcasts by date
  const groupedPodcasts = groupPodcastsByDate(watchedPodcasts);

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
          <div className="h-56 bg-gray-300"></div>
          <div className="p-5">
            <div className="h-5 bg-gray-300 rounded-full w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-300 rounded-full w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded-full w-2/3"></div>
            <div className="flex space-x-2 mt-4">
              <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center">
              <span className="text-indigo-600 mr-3">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                </svg>
              </span>
              Saved for Later
            </h1>
            {watchedPodcasts.length > 0 && (
              <button
                onClick={clearSavedPodcasts}
                className="text-red-500 hover:text-white hover:bg-red-500 font-medium flex items-center transition-all px-4 py-2 rounded-lg border border-red-300 hover:border-red-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex overflow-x-auto pb-2 mb-10 scrollbar-hide">
            <div className="flex space-x-3">
              <button
                onClick={() => filterPodcasts("all")}
                className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-300 ${
                  activeFilter === "all"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:shadow-sm"
                }`}
              >
                All Episodes
              </button>
              <button
                onClick={() => filterPodcasts("music")}
                className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-300 ${
                  activeFilter === "music"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:shadow-sm"
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                  Music
                </span>
              </button>
              <button
                onClick={() => filterPodcasts("talk")}
                className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-300 ${
                  activeFilter === "talk"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:shadow-sm"
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                  </svg>
                  Talk Shows
                </span>
              </button>
              <button
                onClick={() => filterPodcasts("news")}
                className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-300 ${
                  activeFilter === "news"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:shadow-sm"
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                  </svg>
                  News
                </span>
              </button>
              <button
                onClick={() => filterPodcasts("education")}
                className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-300 ${
                  activeFilter === "education"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:shadow-sm"
                }`}
              >
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                  Educational
                </span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-5 flex items-center shadow-sm">
            <svg className="w-6 h-6 mr-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        ) : watchedPodcasts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="inline-block p-6 rounded-full bg-indigo-50 mb-6">
              <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Saved Podcasts Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Start saving podcasts to build your personal collection for later listening.</p>
            <button 
              onClick={() => navigate('/all-podcasts')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
            >
              Discover Amazing Podcasts
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedPodcasts).map(([date, podcasts]) => (
              <div key={date} className="mb-10">
                <h2 className="text-xl font-bold text-gray-800 mb-6 pl-2 border-l-4 border-indigo-500 py-1">
                  {date}
                </h2>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {podcasts.map((podcast) => (
                    <div 
                      key={podcast._id} 
                      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
                      onClick={() => navigate(`/podcast/${podcast._id}`)}
                    >
                      <div className="relative">
                        <img
                          src={podcast.frontImage?.startsWith("http") ? podcast.frontImage : `http://localhost:8800/${podcast.frontImage}`}
                          alt={podcast.title}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* Play button overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <button 
                            onClick={(e) => handlePlay(podcast, e)}
                            className="bg-indigo-600 text-white p-4 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg hover:bg-indigo-700 hover:scale-110"
                            title="Play podcast"
                          >
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Remove button */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromSaved(podcast._id);
                            }}
                            className="bg-white bg-opacity-90 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-md"
                            title="Remove from saved"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {/* Progress indicator if available */}
                        {podcast.progress && podcast.duration && (
                          <div className="absolute bottom-0 left-0 right-0">
                            <div className="bg-gray-700 bg-opacity-50 h-1.5 w-full">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5" 
                                style={{ width: `${(podcast.progress / podcast.duration) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900 line-clamp-1 text-lg">{podcast.title}</h3>
                          {podcast.duration && (
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
                              {Math.floor(podcast.duration / 60)}:{String(podcast.duration % 60).padStart(2, '0')}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 line-clamp-2 mb-4">{podcast.description}</p>
                        
                        {/* Action buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {podcast.category?.categoryName && (
                              <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 text-xs font-medium">
                                {podcast.category.categoryName}
                              </span>
                            )}
                          </div>
                          
                          {/* Quick play button */}
                          <button
                            onClick={(e) => handlePlay(podcast, e)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110 shadow-sm"
                            title="Play now"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        
                        {podcast.savedAt && (
                          <div className="mt-3 text-xs text-gray-500 flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                            </svg>
                            Saved {new Date(podcast.savedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchHistory;