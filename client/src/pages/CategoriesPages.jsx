import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PodcastCard from "../components/PodcastCard/PodcastCard";

const CategoriesPage = () => {
  const { cat } = useParams(); // Get category from URL params
  const [Podcasts, setPodcasts] = useState([]); // Initialize as an empty array
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchPodcasts = async () => {
      setIsLoading(true); // Start loading
      try {
        const res = await axios.get(`http://localhost:8800/api/v1/category/${cat}`, {
          withCredentials: true, // Include credentials if needed
        });
        setPodcasts(res.data.data || []); // Fallback in case `data` is undefined
      } catch (error) {
        console.error("Error fetching podcasts:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };
    fetchPodcasts(); // Fetch podcasts when component mounts
  }, [cat]); // Dependency array to fetch podcasts when category changes

  const handleSearch = (e) => {
    setSearchQuery(e.target.value); // Update search query
  };

  // Filter podcasts based on title matching the search query
  const filteredPodcasts = Podcasts.filter((podcast) =>
    podcast.title && podcast.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 text-white py-10 px-4 mb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{cat}</h1>
          <p className="text-lg opacity-90">Discover amazing podcasts in the {cat} category</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Search Bar */}
        <div className="relative mb-8 max-w-md mx-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search podcasts by title..."
            value={searchQuery}
            onChange={handleSearch}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Podcasts Grid */}
            {filteredPodcasts && filteredPodcasts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPodcasts.map((items, i) => (
                  <div key={i} className="transform transition duration-300 hover:scale-105 hover:shadow-lg">
                    <PodcastCard items={items} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                <h3 className="mt-4 text-xl font-semibold text-gray-800">No Podcasts Found</h3>
                <p className="mt-2 text-gray-600">
                  {searchQuery 
                    ? `No results found for "${searchQuery}". Try another search term.` 
                    : `No podcasts available in the ${cat} category right now.`}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
