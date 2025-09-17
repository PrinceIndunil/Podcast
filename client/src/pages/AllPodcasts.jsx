import React, { useEffect, useState } from "react";
import axios from "axios";
import PodcastCard from "../components/PodcastCard/PodcastCard";
import { Search, Radio, Bookmark, TrendingUp, Calendar, AlignLeft, BadgeCheck, Headphones } from "lucide-react";
import { useParams, Link } from "react-router-dom";

const AllPodcasts = () => {
  const { categoryName = "All" } = useParams();
  const [podcasts, setPodcasts] = useState([]);
  const [filteredPodcasts, setFilteredPodcasts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [activeView, setActiveView] = useState("grid");

  const popularCategories = [
    { name: "All", icon: <Headphones className="h-4 w-4" /> },
    { name: "Comedy", icon: <BadgeCheck className="h-4 w-4" /> },
    { name: "Business", icon: <TrendingUp className="h-4 w-4" /> },
    { name: "Education", icon: <Calendar className="h-4 w-4" /> },
    { name: "Technology", icon: <AlignLeft className="h-4 w-4" /> },
    { name: "Health", icon: <Bookmark className="h-4 w-4" /> }
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "a-z", label: "A-Z" },
    { value: "z-a", label: "Z-A" },
    { value: "most-episodes", label: "Most Episodes" }
  ];

  useEffect(() => {
    fetchPodcasts();
  }, [categoryName]);

  useEffect(() => {
    filterAndSortPodcasts();
  }, [searchQuery, podcasts, sortBy]);

  const fetchPodcasts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const category = categoryName.toLowerCase() !== "all" ? `?category=${categoryName}` : "";
      const res = await axios.get(`http://localhost:8800/api/v1/get-podcasts${category}`);
      setPodcasts(res.data.data || []);
    } catch (error) {
      console.error("Error fetching podcasts:", error);
      setError("Failed to load podcasts. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortPodcasts = () => {
    let filtered = podcasts.filter(
      (podcast) =>
        podcast.title &&
        podcast.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case "a-z":
          return (a.title || "").localeCompare(b.title || "");
        case "z-a":
          return (b.title || "").localeCompare(a.title || "");
        case "most-episodes":
          return (b.episodes || 0) - (a.episodes || 0);
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });

    setFilteredPodcasts(sorted);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleSortDropdown = () => {
    setShowSortDropdown(!showSortDropdown);
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setShowSortDropdown(false);
  };

  const renderSkeletons = () => {
    return Array(8)
      .fill(0)
      .map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl shadow-lg p-5 h-80 animate-pulse"
        >
          <div className="bg-gray-300 h-40 rounded-lg mb-4"></div>
          <div className="bg-gray-300 h-5 rounded w-3/4 mb-2"></div>
          <div className="bg-gray-300 h-4 rounded w-1/2 mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="bg-gray-300 h-8 rounded w-1/3"></div>
            <div className="bg-gray-300 h-8 rounded-full w-8"></div>
          </div>
        </div>
      ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-slate-50 to-purple-50 pb-16">
      {/* Hero Header Section */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 text-white pt-16 pb-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute left-1/4 -bottom-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
          <div className="absolute right-1/3 top-1/3 w-36 h-36 bg-indigo-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }}></div>

          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
            <div className="flex items-end justify-center h-full gap-1">
              {Array(30).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-white w-2 rounded-t-full"
                  style={{
                    height: `${Math.sin(i * 0.5) * 50 + 50}%`,
                    animation: 'soundWave 1.5s infinite',
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
              <Radio className="h-6 w-6" />
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight">Discover Podcasts</h1>
          </div>
          
          <p className="max-w-2xl text-white/90 mb-8 text-lg font-light leading-relaxed">
            Explore a vibrant collection of stories, insights, and voices from around the world. 
            Find your next audio obsession and expand your horizons.
          </p>

          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search podcasts by title..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 
                       text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40
                       shadow-2xl transition-all duration-300"
            />
            <Search className="absolute left-4 top-4 h-5 w-5 text-white/80" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors duration-200"
              >
                <span className="text-xl font-bold">×</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Section with Enhanced Filter UI */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            {/* Category Pills with Icons */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {popularCategories.map((category) => (
                <Link
                  key={category.name}
                  to={`/categories/${category.name}`}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2
                  ${
                    categoryName.toLowerCase() === category.name.toLowerCase()
                      ? "bg-indigo-600 text-white shadow-md scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
                  }`}
                >
                  {category.icon}
                  {category.name}
                </Link>
              ))}
            </div>

            {/* View Toggle and Sort Controls */}
            <div className="flex items-center gap-4">
              <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
                <button 
                  onClick={() => setActiveView("grid")}
                  className={`p-1.5 rounded ${activeView === "grid" ? "bg-white shadow" : "hover:bg-gray-200"}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setActiveView("list")}
                  className={`p-1.5 rounded ${activeView === "list" ? "bg-white shadow" : "hover:bg-gray-200"}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Custom Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={toggleSortDropdown}
                  className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 text-sm flex items-center gap-2
                         hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  <span>Sort: {sortOptions.find(option => option.value === sortBy)?.label}</span>
                  <svg
                    className={`h-4 w-4 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showSortDropdown && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 divide-y divide-gray-100">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            sortBy === option.value
                              ? "bg-indigo-50 text-indigo-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => handleSortSelect(option.value)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Count Display */}
        {!isLoading && !error && (
          <div className="flex justify-between items-center mb-6 px-1">
            <p className="text-gray-600">
              {filteredPodcasts.length} podcast{filteredPodcasts.length !== 1 ? 's' : ''} found
              {searchQuery && ` for "${searchQuery}"`}
              {categoryName !== "All" && ` in ${categoryName}`}
            </p>
            
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="text-indigo-600 text-sm hover:text-indigo-800 flex items-center gap-1"
              >
                Clear search
                <span className="text-xs bg-indigo-100 rounded-full h-5 w-5 inline-flex items-center justify-center">×</span>
              </button>
            )}
          </div>
        )}

        {/* Podcast Grid with Improved Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {renderSkeletons()}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="bg-red-50 text-red-800 rounded-lg p-6 inline-block shadow-md">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-lg font-medium mb-2">{error}</p>
              <button 
                onClick={fetchPodcasts} 
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredPodcasts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-indigo-50 rounded-lg p-6 inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">No podcasts found</h3>
              <p className="text-gray-600 mt-1">Try adjusting your search or filters</p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {activeView === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPodcasts.map((podcast, index) => (
                  <div
                    key={podcast._id || index}
                    className="transform transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      animationFillMode: "backwards",
                      animation: "fadeIn 0.5s ease-out",
                    }}
                  >
                    <PodcastCard items={podcast} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPodcasts.map((podcast, index) => (
                  <div
                    key={podcast._id || index}
                    className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      animationFillMode: "backwards",
                      animation: "fadeIn 0.5s ease-out",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 w-full h-48 sm:h-auto overflow-hidden">
                        {podcast.thumbnail ? (
                          <img src={podcast.thumbnail} alt={podcast.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="bg-gradient-to-r from-purple-400 to-indigo-500 w-full h-full flex items-center justify-center">
                            <Headphones className="h-16 w-16 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex-1">
                        <h3 className="font-bold text-xl mb-2 text-gray-900">{podcast.title}</h3>
                        <p className="text-gray-600 line-clamp-2 mb-4">{podcast.description || "No description available"}</p>
                        <div className="flex justify-between items-center">
                          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                            {podcast.category || "Uncategorized"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700 text-sm">{podcast.episodes || 0} episodes</span>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
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
        
        @keyframes soundWave {
          0%, 100% {
            height: 10%;
          }
          50% {
            height: 80%;
          }
        }
      `}</style>
    </div>
  );
};

export default AllPodcasts;