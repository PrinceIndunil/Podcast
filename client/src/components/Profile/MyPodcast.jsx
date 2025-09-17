import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  Mic, Radio, Headphones, Clock, BarChart2, 
  Calendar, Search, Grid, List, PlusCircle 
} from "lucide-react";
import PodcastCard from "../PodcastCard/PodcastCard";

const MyPodcast = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [view, setView] = useState("grid");
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPodcasts = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:8800/api/v1/get-user-podcasts", {
          withCredentials: true,
        });
        setPodcasts(res.data.data || []);
      } catch (error) {
        console.error("Error fetching podcasts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPodcasts();
  }, []);

  // Derived state for filtering and sorting
  const filteredAndSortedPodcasts = React.useMemo(() => {
    
    const filtered = podcasts.filter((p) =>
      [p.title, p.description, p.category].some((field) =>
        field?.toLowerCase().includes(filterText.toLowerCase())
      )
    );

    // Sort podcasts
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "episodes":
          return (b.episodes || 0) - (a.episodes || 0);
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [podcasts, filterText, sortBy]);

  const totalDurationInHours = (podcasts.reduce((sum, p) => sum + (p.totalDuration || 0), 0) / 3600).toFixed(1);
  const totalListeners = podcasts.reduce((sum, p) => sum + (p.listeners || 0), 0).toLocaleString();


  // Stats calculations
  const stats = React.useMemo(() => [
    {
      icon: <Radio className="h-5 w-5 text-teal-500" />,
      label: "Total Podcasts",
      value: podcasts.length,
      color: "from-teal-500 to-cyan-400",
    },
    {
      icon: <Headphones className="h-5 w-5 text-purple-500" />,
      label: "Total Episodes",
      value: podcasts.reduce((sum, p) => sum + (p.totalEpisodes || 0), 0),
      color: "from-purple-500 to-indigo-400",
    },
    {
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      label: "Hours Recorded",
      value: totalDurationInHours,
      color: "from-amber-500 to-yellow-400",
    },
    {
      icon: <BarChart2 className="h-5 w-5 text-pink-500" />,
      label: "Total Listeners",
      value: totalListeners,
      color: "from-pink-500 to-rose-400",
    },
  ], [podcasts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-pink-50 px-5 lg:px-10 py-10 text-gray-800">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header Section */}
      <div className="relative mb-12">
        <div className="relative flex flex-col md:flex-row justify-between gap-6 items-center">
          <div className="flex items-center gap-3 transform transition hover:scale-105">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-400 p-3 rounded-full shadow-lg">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-teal-500 via-cyan-400 to-sky-500 text-transparent bg-clip-text">
              My Studio
            </h1>
          </div>

          <div className="flex flex-wrap gap-3 justify-end items-center">
            {/* Search Bar */}
            <div className="relative group">
              <input
                type="text"
                placeholder="Search podcasts..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl py-2 pl-10 pr-4 
                           shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm w-full md:w-auto
                           transition-all duration-300 group-hover:shadow-md"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              {filterText && (
                <button
                  onClick={() => setFilterText("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>

            {/* View Toggle */}
            <button
              onClick={() => setView(view === "grid" ? "list" : "grid")}
              className="bg-white/80 backdrop-blur-sm border border-gray-200 text-sm rounded-xl px-4 py-2 
                         hover:bg-white hover:shadow-md transition-all duration-300 flex items-center gap-2"
              aria-label={`Switch to ${view === "grid" ? "list" : "grid"} view`}
            >
              {view === "grid" ? (
                <>
                  <List className="h-4 w-4" /> List View
                </>
              ) : (
                <>
                  <Grid className="h-4 w-4" /> Grid View
                </>
              )}
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl py-2 px-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-teal-500 shadow hover:shadow-md
                         transition-all duration-300 appearance-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="episodes">Most Episodes</option>
              <option value="alphabetical">A-Z</option>
            </select>

            {/* Create Button */}
            <Link
              to="/add-podcast"
              className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white font-semibold px-5 py-2 
                         rounded-xl shadow-lg hover:shadow-xl hover:translate-y-px 
                         transition-all duration-300 transform"
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Podcast
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map(({ icon, label, value, color }, i) => (
          <div
            key={i}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 flex items-center gap-4 
                       shadow-md border border-gray-100 transition-all duration-300
                       hover:shadow-lg hover:bg-white/80 group"
          >
            <div className={`p-3 rounded-full bg-gradient-to-r ${color} shadow-sm
                            group-hover:shadow group-hover:scale-105 transition-transform duration-300`}>
              {icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* My Collection Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-700">
          <Radio className="h-5 w-5 text-teal-500" />
          My Collection
          <span className="text-sm bg-teal-100 text-teal-800 py-1 px-2 rounded-full">
            {filteredAndSortedPodcasts.length} podcasts
          </span>
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: Today</span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="bg-white/40 rounded-xl p-6 h-64 animate-pulse flex flex-col justify-between"
            >
              <div className="w-3/4 h-5 bg-gray-200 rounded mb-4"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded mb-12"></div>
              <div className="flex justify-between">
                <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedPodcasts.length > 0 ? (
        <div className={`transition-all duration-500 ${
          view === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }`}>
          {filteredAndSortedPodcasts.map((item, i) => (
            <div 
              key={i} 
              className={`${view === "list" ? "w-full" : ""} transform transition-all duration-300 hover:scale-102`}
              style={{ 
                animationDelay: `${i * 0.05}s`,
                animationFillMode: "both",
                animation: "fadeIn 0.5s ease-out"
              }}
            >
              <PodcastCard items={item} viewMode={view} />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-12 text-center shadow-md transition-all hover:shadow-lg">
          <Radio className="h-16 w-16 text-teal-500/50 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No podcasts found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {filterText
              ? `No podcasts match "${filterText}". Try a different search term.`
              : "Create your first podcast to start sharing your voice with the world."}
          </p>
          <button
            onClick={() => setFilterText("")}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-400 text-white font-semibold 
                       rounded-lg shadow-md hover:shadow-lg hover:translate-y-px transition-all duration-300"
          >
            {filterText ? "Clear Search" : "Create Your First Podcast"}
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default MyPodcast;