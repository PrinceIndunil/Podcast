import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Headphones, TrendingUp, ExternalLink } from "lucide-react";

// Image imports
import Culture from "../assets/Culture.jpg";
import Business from "../assets/business.png";
import Education from "../assets/Education.png";
import Health from "../assets/Health.png";
import News from "../assets/News.png";
import Comedy from "../assets/comedy.png";
import Technology from "../assets/Technology.png";
import Travel from "../assets/Travel.png";
import Love from "../assets/LoveImg.jpg";

// Centralized category data
const categoryData = [
  {
    name: "Culture",
    img: Culture,
    gradientFrom: "from-rose-400",
    gradientTo: "to-red-500",
    icon: "🎭",
    description: "Explore traditions and cultural podcasts",
  },
  {
    name: "Business",
    img: Business,
    gradientFrom: "from-slate-400",
    gradientTo: "to-slate-500",
    icon: "💼",
    description: "Insights from business leaders and trends",
  },
  {
    name: "Education",
    img: Education,
    gradientFrom: "from-cyan-400",
    gradientTo: "to-teal-500",
    icon: "🎓",
    description: "Learn something new every day",
  },
  {
    name: "Health",
    img: Health,
    gradientFrom: "from-green-400",
    gradientTo: "to-emerald-500",
    icon: "💚",
    description: "Wellness and healthy living podcasts",
  },
  {
    name: "News",
    img: News,
    gradientFrom: "from-blue-400",
    gradientTo: "to-indigo-500",
    icon: "📰",
    description: "Stay updated with the latest events",
  },
  {
    name: "Comedy",
    img: Comedy,
    gradientFrom: "from-amber-400",
    gradientTo: "to-yellow-500",
    icon: "😂",
    description: "Laugh out loud with comedy shows",
  },
  {
    name: "Technology",
    img: Technology,
    gradientFrom: "from-violet-400",
    gradientTo: "to-purple-600",
    icon: "💻",
    description: "The latest in tech innovations",
  },
  {
    name: "Travel",
    img: Travel,
    gradientFrom: "from-orange-400",
    gradientTo: "to-amber-500",
    icon: "✈️",
    description: "Journey to amazing destinations",
  },
  {
    name: "Love",
    img: Love,
    gradientFrom: "from-pink-400",
    gradientTo: "to-rose-500",
    icon: "❤️",
    description: "Romance and relationship podcasts",
  },
];

// Animation variants
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

const trendingCategories = ["Technology", "Health", "Comedy"];

const CategoryCard = ({ category, index, hoveredCategory, setHoveredCategory }) => {
  return (
    <motion.div
      variants={itemVariants}
      whileHover="hover"
      className="group relative"
      onMouseEnter={() => setHoveredCategory(index)}
      onMouseLeave={() => setHoveredCategory(null)}
    >
      <Link
        to={`/categories/${category.name}`}
        className="block h-96 rounded-3xl overflow-hidden relative shadow-lg hover:shadow-2xl transition-all duration-500"
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${category.gradientFrom} ${category.gradientTo} opacity-90 transition-all duration-500`}
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
                aria-label={category.name}
              >
                {category.icon}
              </span>
            </motion.div>
            <h3 className="text-3xl font-bold text-white mt-2 drop-shadow-sm group-hover:translate-x-1 transition-transform duration-300">
              {category.name}
            </h3>
            <p className="text-white/90 mt-3 text-base font-medium max-w-[90%]">
              {category.description}
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
            <img
              src={category.img}
              alt={`${category.name} category`}
              className="w-full h-full object-cover rounded-2xl shadow-lg transform"
              loading="lazy"
            />
          </motion.div>
        </div>

        {/* Hover effects */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-black/0 via-white/10 to-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: hoveredCategory === index ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />

        {/* Arrow button */}
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
      </Link>
    </motion.div>
  );
};

const EmptyState = ({ clearSearch }) => (
  <motion.div
    className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm border border-gray-100"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
  >
    <div className="text-6xl mb-6">🔍</div>
    <h3 className="text-2xl font-medium text-gray-800 mb-3">
      No categories found
    </h3>
    <p className="text-gray-500 max-w-md mx-auto mb-6">
      We couldn't find any categories matching your search. Try different
      keywords or browse all categories.
    </p>
    <button
      className="px-6 py-3 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors font-medium"
      onClick={clearSearch}
    >
      Clear Search
    </button>
  </motion.div>
);

const Categories = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNewCategoryBadge, setShowNewCategoryBadge] = useState(true);

  // Memoized filtered categories
  const filteredCategories = useMemo(() => {
    if (searchTerm.trim() === "") {
      return categoryData;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    return categoryData.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTermLower) ||
        category.description.toLowerCase().includes(searchTermLower)
    );
  }, [searchTerm]);

  // Callbacks
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleViewAll = useCallback(() => {
    navigate("/categories/all");
  }, [navigate]);

  const handleTrendingTagClick = useCallback((tag) => {
    setSearchTerm(tag);
  }, []);

  // Hide new category badge after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNewCategoryBadge(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 z-0"></div>
        <div className="absolute inset-0 text-white opacity-30"></div>

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
              Discover Your Sound
            </motion.h1>

            <motion.p
              className="mt-4 text-xl text-white/90 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Explore thousands of podcasts across various categories and find
              your next favorite show.
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
              <motion.div
                className={`relative transition-all duration-300 ${
                  isSearchFocused ? "transform scale-105" : ""
                }`}
              >
                <input
                  type="text"
                  placeholder="Search for podcasts..."
                  className="w-full py-5 px-6 pl-14 rounded-full bg-white border border-transparent shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-lg"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-6 w-6" />
                </div>
              </motion.div>

              {/* Trending Tags */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-purple-800 bg-purple-100">
                  <TrendingUp className="w-3 h-3 mr-1" /> Trending:
                </span>
                {trendingCategories.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTrendingTagClick(tag)}
                    className="px-3 py-1 rounded-full text-sm font-medium text-gray-700 bg-white shadow-sm hover:shadow transition-all duration-300 hover:bg-gray-50"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative curved bottom edge */}
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

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-12">
        <div className="flex justify-between items-center mb-12">
          <motion.h2 
            className="text-2xl font-bold text-gray-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Popular Categories
          </motion.h2>
          
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence>
              {showNewCategoryBadge && (
                <motion.span 
                  className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  New
                </motion.span>
              )}
            </AnimatePresence>
            
            <button 
              onClick={handleViewAll}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
            >
              View All <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        </div>
        
        <AnimatePresence>
          {filteredCategories.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCategories.map((category, index) => (
                <CategoryCard
                  key={category.name}
                  category={category}
                  index={index}
                  hoveredCategory={hoveredCategory}
                  setHoveredCategory={setHoveredCategory}
                />
              ))}
            </motion.div>
          ) : (
            <EmptyState clearSearch={clearSearch} />
          )}
        </AnimatePresence>

        {/* View all categories button */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <p className="text-gray-600 mb-5">Looking for more categories?</p>
          <button
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center mx-auto"
            onClick={handleViewAll}
          >
            View All Categories
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </motion.div>
      </div>

      {/* CSS */}
      <style jsx>{`
        .bg-pattern {
          background-image: radial-gradient(currentColor 1px, transparent 1px);
          background-size: 12px 12px;
        }
      `}</style>
    </div>
  );
};

export default Categories;