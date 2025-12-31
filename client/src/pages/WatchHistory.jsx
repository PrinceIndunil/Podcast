import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { playerActions } from "../store/player";
import {
  Library,
  Play,
  Trash2,
  Music,
  Calendar,
  Clock,
  Search,
  X
} from "lucide-react";

const WatchHistory = () => {
  const [watchedPodcasts, setWatchedPodcasts] = useState([]);
  const [savedPodcasts, setSavedPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("watched"); 

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

  const formatDuration = (duration) => {
    if (!duration) return "Unknown";
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

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

      await axios.post(`http://localhost:8800/api/v1/save-watched/${userId}`, {
        podcastId: podcast._id,
        progress: 0,
        duration: podcast.duration || 0
      }, {
        withCredentials: true
      });

      toast.success(`Now playing: ${podcast.title}`);
      console.log("Podcast marked as watched and playing");
    } catch (error) {
      console.error("Error playing podcast:", error);
      toast.error("Failed to play podcast");
    }
  };

  const filterPodcasts = (filter) => {
    setActiveFilter(filter);
    setLoading(true);

    if (activeTab === "watched") {
      fetchWatchedPodcasts(filter);
    } else {
      fetchSavedPodcasts(filter);
    }
  };

  const fetchWatchedPodcasts = async (filter = "all") => {
    try {
      console.log("Fetching watched podcasts...");
      const response = await axios.get(
        `http://localhost:8800/api/v1/get-watched`,
        { withCredentials: true }
      );
      console.log("Watched podcasts response:", response.data);

      let podcasts = response.data.data || [];

      if (filter !== "all") {
        podcasts = podcasts.filter(
          (podcast) =>
            podcast.category?.categoryName?.toLowerCase() === filter.toLowerCase()
        );
      }

      setWatchedPodcasts(podcasts);
    } catch (err) {
      console.error("Error fetching watched podcasts:", err);
      setError("Failed to fetch watched podcasts.");
      toast.error("Failed to load watched podcasts");
    } finally {
      setLoading(false);
    }
  };

  const clearSavedPodcasts = async () => {
    const isWatched = activeTab === "watched";
    const confirmMessage = isWatched
      ? "Are you sure you want to clear your watch history?"
      : "Are you sure you want to clear all saved podcasts?";

    if (window.confirm(confirmMessage)) {
      try {
        if (isWatched) {
          await axios.delete(
            `http://localhost:8800/api/v1/clear-watch-history`,
            { withCredentials: true }
          );
          setWatchedPodcasts([]);
          toast.success("Watch history cleared successfully");
        } else {
          for (const podcast of savedPodcasts) {
            await axios.delete(
              `http://localhost:8800/api/v1/unsave-podcast/${podcast._id}`,
              { withCredentials: true }
            );
          }
          setSavedPodcasts([]);
          toast.success("Saved podcasts cleared successfully");
        }
      } catch (err) {
        console.error("Error clearing podcasts:", err);
        toast.error(`Failed to clear ${isWatched ? 'watch history' : 'saved podcasts'}`);
      }
    }
  };

  const removeFromSaved = async (podcastId) => {
    try {
      if (activeTab === "watched") {
        await axios.delete(
          `http://localhost:8800/api/v1/remove-watch-history/${podcastId}`,
          { withCredentials: true }
        );
        setWatchedPodcasts(
          watchedPodcasts.filter(podcast => podcast._id !== podcastId)
        );
        toast.success("Removed from watch history");
      } else {
        await axios.delete(
          `http://localhost:8800/api/v1/unsave-podcast/${podcastId}`,
          { withCredentials: true }
        );
        setSavedPodcasts(
          savedPodcasts.filter(podcast => podcast._id !== podcastId)
        );
        toast.success("Removed from saved podcasts");
      }
    } catch (err) {
      console.error("Error removing podcast:", err);
      toast.error("Failed to remove item");
    }
  };

  const fetchSavedPodcasts = async (filter = "all") => {
    try {
      console.log("Fetching saved podcasts...");
      const response = await axios.get(
        "http://localhost:8800/api/v1/get-saved-podcasts",
        { withCredentials: true }
      );
      console.log("Saved podcasts response:", response.data);

      let podcasts = response.data.data || [];

      if (filter !== "all") {
        podcasts = podcasts.filter(
          (podcast) =>
            podcast.category?.categoryName?.toLowerCase() === filter.toLowerCase()
        );
      }

      setSavedPodcasts(podcasts);
    } catch (err) {
      console.error("Error fetching saved podcasts:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      console.log("Initial fetch triggered because user is logged in");
      fetchWatchedPodcasts();
      fetchSavedPodcasts();
    } else {
      console.log("Fetch skipped: isLoggedIn=", isLoggedIn);
    }
  }, [isLoggedIn]);

  const currentPodcasts = activeTab === "watched" ? watchedPodcasts : savedPodcasts;
  const filteredPodcasts = currentPodcasts.filter(podcast =>
    podcast.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    podcast.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedPodcasts = groupPodcastsByDate(filteredPodcasts);

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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-slate-50 to-indigo-50 pb-16">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-900 text-white pt-16 pb-32 px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute left-1/4 -bottom-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute right-1/3 top-1/3 w-36 h-36 bg-purple-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }}></div>

          {/* Audio Wave Animation */}
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
            <div className="flex items-end justify-center h-full gap-1">
              {Array(30).fill(0).map((_, i) => (
                <div
                  key={i}
                  className="bg-white w-2 rounded-t-full animate-pulse"
                  style={{
                    height: `${Math.sin(i * 0.5) * 30 + 50}%`,
                    animationDelay: `${i * 0.05}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 p-4 rounded-full backdrop-blur-md shadow-xl">
              <Library className="h-6 w-6" />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight">My Library</h1>
          </div>

          <p className="max-w-2xl text-white/90 mb-8 text-lg font-light leading-relaxed">
            Your personal collection of saved podcasts. Discover, organize, and enjoy your favorite content anytime.
          </p>

          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search your library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 
                       text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40
                       shadow-2xl transition-all duration-300"
            />
            <Search className="absolute left-4 top-4 h-5 w-5 text-white/80" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab("watched");
                setActiveFilter("all");
              }}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === "watched"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Watch History</span>
                {watchedPodcasts.length > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === "watched" ? "bg-white/20" : "bg-indigo-100 text-indigo-800"
                    }`}>
                    {watchedPodcasts.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab("saved");
                setActiveFilter("all");
              }}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${activeTab === "saved"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Library className="w-5 h-5" />
                <span>Saved for Later</span>
                {savedPodcasts.length > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${activeTab === "saved" ? "bg-white/20" : "bg-indigo-100 text-indigo-800"
                    }`}>
                    {savedPodcasts.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Filter Tabs and Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
            {/* Filter Tabs */}
            <div className="flex overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex space-x-3">
                <button
                  onClick={() => filterPodcasts("all")}
                  className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-300 ${activeFilter === "all"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:shadow-sm"
                    }`}
                >
                  All Podcasts
                </button>
                <button
                  onClick={() => filterPodcasts("music")}
                  className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-300 ${activeFilter === "music"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:shadow-sm"
                    }`}
                >
                  <span className="flex items-center">
                    <Music className="w-4 h-4 mr-2" />
                    Music
                  </span>
                </button>
                <button
                  onClick={() => filterPodcasts("talk")}
                  className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-300 ${activeFilter === "talk"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:shadow-sm"
                    }`}
                >
                  Talk Shows
                </button>
                <button
                  onClick={() => filterPodcasts("news")}
                  className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-300 ${activeFilter === "news"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:shadow-sm"
                    }`}
                >
                  News
                </button>
                <button
                  onClick={() => filterPodcasts("education")}
                  className={`px-6 py-3 rounded-xl whitespace-nowrap font-medium transition-all duration-300 ${activeFilter === "education"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 hover:shadow-sm"
                    }`}
                >
                  Educational
                </button>
              </div>
            </div>

            {currentPodcasts.length > 0 && (
              <button
                onClick={clearSavedPodcasts}
                className="text-red-500 hover:text-white hover:bg-red-500 font-medium flex items-center transition-all px-4 py-2 rounded-lg border border-red-300 hover:border-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {filteredPodcasts.length > 0 && (
          <div className="flex justify-between items-center mb-6 px-1">
            <p className="text-gray-600">
              {filteredPodcasts.length} podcast{filteredPodcasts.length !== 1 ? 's' : ''} found
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <SkeletonLoader />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-5 flex items-center shadow-sm">
            {error}
          </div>
        ) : filteredPodcasts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="inline-block p-6 rounded-full bg-indigo-50 mb-6">
              {activeTab === "watched" ? (
                <Clock className="w-16 h-16 text-indigo-500" />
              ) : (
                <Library className="w-16 h-16 text-indigo-500" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {activeTab === "watched" ? "No Watch History Yet" : "No Saved Podcasts Yet"}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm
                ? `No podcasts match "${searchTerm}". Try a different search term.`
                : activeTab === "watched"
                  ? "Start listening to podcasts to build your watch history."
                  : "Save podcasts to listen to them later."}
            </p>
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
                  {podcasts.map((podcast, index) => (
                    <div
                      key={podcast._id}
                      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
                      onClick={() => navigate(`/podcast/${podcast._id}`)}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animationFillMode: "backwards",
                        animation: "fadeIn 0.5s ease-out"
                      }}
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
                            <Play className="w-8 h-8" fill="white" />
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
                            <X className="w-5 h-5" />
                          </button>
                        </div>

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
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(podcast.duration)}
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
                            <Play className="w-4 h-4" fill="white" />
                          </button>
                        </div>

                        {podcast.savedAt && (
                          <div className="mt-3 text-xs text-gray-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            {activeTab === "watched" ? "Watched" : "Saved"} {formatDate(podcast.savedAt)}
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

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default WatchHistory;