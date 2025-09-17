import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Headphones } from "lucide-react";
import axios from "axios";
import PodcastCard from "../components/PodcastCard/PodcastCard";

import Culture from "../assets/Culture.jpg";
import Business from "../assets/business.png";
import Education from "../assets/Education.png";
import Health from "../assets/Health.png";
import News from "../assets/News.png";
import Comedy from "../assets/comedy.png";
import Technology from "../assets/Technology.png";
import Travel from "../assets/Travel.png";
import Love from "../assets/LoveImg.jpg";

const getCategoryStyle = (categoryName) => {
  const styles = {
    Culture: { gradientFrom: "from-rose-400", gradientTo: "to-red-500", icon: "🎭",img: Culture, },
    Business: { gradientFrom: "from-slate-400", gradientTo: "to-slate-500", icon: "💼", img: Culture, },
    Education: { gradientFrom: "from-cyan-400", gradientTo: "to-teal-500", icon: "🎓", img: Culture, },
    Health: { gradientFrom: "from-green-400", gradientTo: "to-emerald-500", icon: "💚", img: Health, },
    News: { gradientFrom: "from-blue-400", gradientTo: "to-indigo-500", icon: "📰", img:News },
    Comedy: { gradientFrom: "from-amber-400", gradientTo: "to-yellow-500", icon: "😂", img: Comedy, },
    Technology: { gradientFrom: "from-violet-400", gradientTo: "to-purple-600", icon: "💻", img: Technology, },
    Travel: { gradientFrom: "from-orange-400", gradientTo: "to-amber-500", icon: "✈️",  img: Travel, },
    Love: { gradientFrom: "from-pink-400", gradientTo: "to-rose-500", icon: "❤️", img: Love, },
    default: { gradientFrom: "from-gray-400", gradientTo: "to-gray-600", icon: "🎵" }
  };
  
  return styles[categoryName] || styles.default;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  hover: {
    y: -8,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
};

const CategoryCard = ({ category, index, hoveredCategory, setHoveredCategory }) => {
  const style = getCategoryStyle(category.categoryName);
  
  return (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      className="group relative"
      onMouseEnter={() => setHoveredCategory(index)}
      onMouseLeave={() => setHoveredCategory(null)}
    >
      <a
        href={`/categories/${category.categoryName}`}
        className="block h-96 rounded-3xl overflow-hidden relative shadow-lg hover:shadow-2xl transition-all duration-500"
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${style.gradientFrom} ${style.gradientTo} opacity-90 transition-all duration-500`}
        ></div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 bg-pattern opacity-10"></div>

        {/* Content */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
          <div>
            <motion.div
              className="text-white bg-white/20 p-4 rounded-2xl inline-block backdrop-blur-sm mb-5"
              whileHover={{
                rotate: [0, -5, 5, -5, 0],
                transition: { duration: 0.5 },
              }}
            >
              <span
                className="text-4xl"
                role="img"
                aria-label={category.categoryName}
              >
                {style.icon}
              </span>
            </motion.div>
            <h3 className="text-3xl font-bold text-white mt-2 drop-shadow-sm group-hover:translate-x-1 transition-transform duration-300">
              {category.categoryName}
            </h3>
            <p className="text-white/90 mt-3 text-base font-medium max-w-[90%]">
              {category.podcasts?.length || 0} podcasts available
            </p>
          </div>

          <motion.div
            className="absolute -bottom-6 -right-6 w-48 h-48 opacity-80 group-hover:opacity-100 transition-all duration-500"
            animate={{
              rotate: hoveredCategory === index ? 0 : 12,
              y: hoveredCategory === index ? -5 : 5,
              transition: { type: "spring", stiffness: 200, damping: 15 },
            }}
          >
            <div
              className="w-full h-full bg-white/20 rounded-2xl shadow-lg transform backdrop-blur-sm flex items-center justify-center"
            >
              <span className="text-8xl opacity-60">{style.icon}</span>
            </div>
          </motion.div>
        </div>

        {/* Hover effects */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-black/0 via-white/10 to-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: hoveredCategory === index ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />

        <motion.div
          className="absolute bottom-6 right-6 bg-white backdrop-blur-md p-3 rounded-full shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: hoveredCategory === index ? 1 : 0,
            scale: hoveredCategory === index ? 1 : 0.8,
            x: hoveredCategory === index ? 0 : 5,
          }}
          transition={{ duration: 0.3 }}
        >
          <ArrowRight className="h-5 w-5 text-gray-800" />
        </motion.div>
      </a>
    </motion.div>
  );
};

const EmptyState = ({ clearSearch, isShowingCategories }) => (
  <motion.div
    className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
  >
    <div className="text-6xl mb-6">{isShowingCategories ? "📂" : "🔍"}</div>
    <h3 className="text-2xl font-medium text-gray-800 mb-3">
      {isShowingCategories ? "No categories found" : "No podcasts found"}
    </h3>
    <p className="text-gray-500 max-w-md mx-auto mb-6">
      {isShowingCategories 
        ? "We couldn't find any categories matching your search. Try different keywords."
        : "We couldn't find any podcasts matching your search. Try different keywords."
      }
    </p>
    <button
      className="px-6 py-3 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors font-medium"
      onClick={clearSearch}
    >
      Clear Search
    </button>
  </motion.div>
);

const CategoriesPage = () => {
  const { cat } = useParams();
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShowingCategories, setIsShowingCategories] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let endpoint;
        let showingCategories = false;

        if (cat && cat.toLowerCase() === "all") {
          endpoint = `http://localhost:8800/api/v1/categories`;
          showingCategories = true;
        } else if (cat) {
          endpoint = `http://localhost:8800/api/v1/category/${encodeURIComponent(cat)}`;
          showingCategories = false;
        }

        console.log("Fetching from:", endpoint);
        
        const res = await axios.get(endpoint, {
          withCredentials: true,
        });
        
        console.log("API Response:", res.data);
        
        setData(res.data.data || []);
        setIsShowingCategories(showingCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.response?.data?.message || error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (cat) {
      fetchData();
    }
  }, [cat]);

  const filteredData = useMemo(() => {
    if (searchQuery.trim() === "") {
      return data;
    }
    
    const searchTermLower = searchQuery.toLowerCase();
    return data.filter((item) => {
      if (isShowingCategories) {
        return item.categoryName && item.categoryName.toLowerCase().includes(searchTermLower);
      } else {
        return item.title && item.title.toLowerCase().includes(searchTermLower);
      }
    });
  }, [data, searchQuery, isShowingCategories]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const getPageTitle = () => {
    if (cat && cat.toLowerCase() === "all") {
      return "All Categories";
    }
    return decodeURIComponent(cat || '');
  };

  const getPageDescription = () => {
    if (cat && cat.toLowerCase() === "all") {
      return "Browse all available podcast categories and find your perfect match";
    }
    return `Discover amazing podcasts in the ${decodeURIComponent(cat || '')} category`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-white bg-opacity-20 backdrop-blur-lg rounded-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            >
              <Headphones className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h1
              className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-purple-100 pb-2 tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {getPageTitle()}
            </motion.h1>

            <motion.p
              className="mt-4 text-xl text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {getPageDescription()}
            </motion.p>

            <motion.div
              className="mt-6 h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            />

            {/* Search Section */}
            <motion.div
              className="mt-12 max-w-xl mx-auto relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder={isShowingCategories ? "Search categories..." : "Search podcasts..."}
                  className="w-full py-5 px-6 pl-14 rounded-full bg-white border border-transparent shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-6 w-6" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg 
            viewBox="0 0 1440 74" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path 
              d="M0 24L60 28C120 32 240 40 360 45.3C480 50.7 600 53.3 720 49.3C840 45.3 960 34.7 1080 32C1200 29.3 1320 34.7 1380 37.3L1440 40V74H1380C1320 74 1200 74 1080 74C960 74 840 74 720 74C600 74 480 74 360 74C240 74 120 74 60 74H0V24Z" 
              fill="url(#paint0_linear)"
            />
            <defs>
              <linearGradient 
                id="paint0_linear" 
                x1="720" 
                y1="24" 
                x2="720" 
                y2="74" 
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#F9FAFB" />
                <stop offset="1" stopColor="#F3F4F6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-12">
        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <AnimatePresence>
            {filteredData.length > 0 ? (
              <motion.div
                className={`grid gap-8 ${
                  isShowingCategories 
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                }`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredData.map((item, index) => (
                  <div key={item._id || index}>
                    {isShowingCategories ? (
                      <CategoryCard
                        category={item}
                        index={index}
                        hoveredCategory={hoveredCategory}
                        setHoveredCategory={setHoveredCategory}
                      />
                    ) : (
                      <motion.div
                        variants={itemVariants}
                        className="transform transition duration-300 hover:scale-105 hover:shadow-lg"
                      >
                        <PodcastCard items={item} />
                      </motion.div>
                    )}
                  </div>
                ))}
              </motion.div>
            ) : (
              <EmptyState clearSearch={clearSearch} isShowingCategories={isShowingCategories} />
            )}
          </AnimatePresence>
        )}
      </div>

      <style jsx>{`
        .bg-pattern {
          background-image: radial-gradient(currentColor 1px, transparent 1px);
          background-size: 12px 12px;
        }
      `}</style>
    </div>
  );
};

export default CategoriesPage;