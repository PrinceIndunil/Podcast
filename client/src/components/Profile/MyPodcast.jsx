import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Mic, Radio, Headphones, Clock, BarChart2,
  Calendar, Search, Grid, List, PlusCircle, Layout
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
      icon: <Radio className="h-6 w-6 text-white" />,
      label: "Total Podcasts",
      description: "Shows you've hosted",
      value: podcasts.length,
      color: "from-blue-600 to-indigo-600",
    },
    {
      icon: <Headphones className="h-6 w-6 text-white" />,
      label: "Total Episodes",
      description: "Content generated",
      value: podcasts.reduce((sum, p) => sum + (p.totalEpisodes || 0), 0),
      color: "from-purple-600 to-indigo-600",
    },
    {
      icon: <Clock className="h-6 w-6 text-white" />,
      label: "Hours Recorded",
      description: "Time on air",
      value: totalDurationInHours,
      color: "from-indigo-600 to-blue-600",
    },
    {
      icon: <BarChart2 className="h-6 w-6 text-white" />,
      label: "Total Listeners",
      description: "Audience reach",
      value: totalListeners,
      color: "from-blue-600 to-purple-600",
    },
  ], [podcasts, totalDurationInHours, totalListeners]);

  return (
    <div className="w-full">
      {/* Stats Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {stats.map(({ icon, label, description, value, color }, i) => (
          <div
            key={i}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 flex flex-col gap-6 
                       shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 transition-all duration-500
                       hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg
                            group-hover:scale-110 transition-transform duration-500`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight mb-1">{value}</p>
              <p className="text-xs text-slate-400 font-medium">{description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Podcast List Section */}
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <Layout className="h-8 w-8 text-indigo-600" />
              Your Studio
            </h2>
            <p className="text-slate-500 font-medium mt-1">Manage and monitor your podcast content performance.</p>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-grow md:flex-grow-0 group">
              <input
                type="text"
                placeholder="Search your library..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                aria-label="Search podcasts"
                className="bg-white border-slate-200 border rounded-2xl py-3.5 pl-12 pr-4 
                           shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm w-full md:w-64
                           transition-all duration-300"
              />
              <Search className="absolute left-4 top-4 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full md:w-auto">
              <Link
                to="/generate-podcast"
                className="flex-1 md:flex-none bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold px-6 py-3.5 
                           rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 hover:-translate-y-0.5 
                           transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <Mic className="h-4 w-4 group-hover:animate-pulse" />
                <span>AI Studio</span>
              </Link>
              <Link
                to="/add-podcast"
                className="flex-1 md:flex-none bg-slate-900 text-white font-bold px-6 py-3.5 
                           rounded-2xl shadow-lg shadow-slate-200 hover:shadow-xl hover:shadow-slate-300 hover:-translate-y-0.5 
                           transition-all duration-300 flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Podcast</span>
              </Link>
            </div>
          </div>
        </div>

        {/* List Controls */}
        <div className="flex items-center justify-between mb-8 bg-slate-100/50 p-2 rounded-2xl">
          <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-200">
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-indigo-600 text-white" : "text-slate-400"}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-600 font-bold text-sm focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="episodes">Most Content</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>
        </div>

        {/* Loading / Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 h-72 animate-pulse border border-slate-100">
                <div className="aspect-video bg-slate-100 rounded-2xl mb-6"></div>
                <div className="h-6 bg-slate-100 rounded-full w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedPodcasts.length > 0 ? (
          <div className={`grid gap-8 ${view === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
            {filteredAndSortedPodcasts.map((item, i) => (
              <div key={item._id} className="animate-in fade-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <PodcastCard items={item} viewMode={view} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mic className="h-12 w-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{filterText ? "No matches found" : "Your studio is empty"}</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
              {filterText ? `We couldn't find anything matching "${filterText}".` : "Start your journey by creating your first AI-powered podcast."}
            </p>
            <button
              onClick={() => filterText ? setFilterText("") : null}
              className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all"
            >
              {filterText ? "Clear Search" : "Create My First Podcast"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


export default MyPodcast;