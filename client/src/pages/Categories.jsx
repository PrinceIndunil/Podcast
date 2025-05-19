import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CultureImg from "../assets/Culture.jpg";
import BusinessImg from "../assets/business.png";
import EducationImg from "../assets/Education.png";
import HealthImg from "../assets/Health.png";
import NewsImg from "../assets/News.png";
import ComedyImg from "../assets/comedy.png";
import TechnologyImg from "../assets/Technology.png";
import TravelImg from "../assets/Travel.png";
import LoveImg from "../assets/LoveImg.jpg";

const Categories = () => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);

  const categories = [
    {
      name: "Culture",
      img: CultureImg,
      color: "#e8562a",
      gradientFrom: "from-orange-500",
      gradientTo: "to-red-500",
      icon: "🎭",
      description: "Explore traditions and cultural podcasts",
      to: "/categories/Culture",
    },
    {
      name: "Business",
      img: BusinessImg,
      color: "#c9b2ab",
      gradientFrom: "from-gray-400",
      gradientTo: "to-stone-300",
      icon: "💼",
      description: "Insights from business leaders and trends",
      to: "/categories/Business",
    },
    {
      name: "Education",
      img: EducationImg,
      color: "#8cabaa",
      gradientFrom: "from-teal-400",
      gradientTo: "to-cyan-300",
      icon: "🎓",
      description: "Learn something new every day",
      to: "/categories/Education",
    },
    {
      name: "Health",
      img: HealthImg,
      color: "#62bf62",
      gradientFrom: "from-green-400",
      gradientTo: "to-emerald-300",
      icon: "💚",
      description: "Wellness and healthy living podcasts",
      to: "/categories/Health",
    },
    {
      name: "News",
      img: NewsImg,
      color: "#4a90e2",
      gradientFrom: "from-blue-500",
      gradientTo: "to-sky-400",
      icon: "📰",
      description: "Stay updated with the latest events",
      to: "/categories/News",
    },
    {
      name: "Comedy",
      img: ComedyImg,
      color: "#f5a623",
      gradientFrom: "from-amber-400",
      gradientTo: "to-yellow-300",
      icon: "😂",
      description: "Laugh out loud with comedy shows",
      to: "/categories/Comedy",
    },
    {
      name: "Technology",
      img: TechnologyImg,
      color: "#9b59b6",
      gradientFrom: "from-purple-500",
      gradientTo: "to-violet-400",
      icon: "💻",
      description: "The latest in tech innovations",
      to: "/categories/Technology",
    },
    {
      name: "Travel",
      img: TravelImg,
      color: "#e67e22",
      gradientFrom: "from-orange-400",
      gradientTo: "to-amber-300",
      icon: "✈️",
      description: "Journey to amazing destinations",
      to: "/categories/Travel",
    },
    {
      name: "Love",
      img: LoveImg,
      color: "#ff5c8f",
      gradientFrom: "from-red-400",
      gradientTo: "to-pink-300",
      icon: "❤️",
      description: "Romance and relationship podcasts",
      to: "/categories/Love",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
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
      scale: 1.05,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewAll = () => {
    navigate("/categories/all");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto ">
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 ">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div className="inline-block mb-2" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
            <span className="text-5xl" role="img" aria-label="Podcast">🎧</span>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 pb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Explore Categories
          </motion.h2>

          <motion.p
            className="text-gray-600 max-w-2xl mx-auto mt-4 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Discover thousands of podcasts across various topics. Find your next favorite show.
          </motion.p>
          

          <motion.div
            className="mt-6 w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={{ width: "6rem" }}
            transition={{ delay: 0.7, duration: 0.8 }}
          />
        </motion.div>
        </div>

        <motion.div className="max-w-xl mx-auto mb-12 relative" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search for podcasts..."
              className="w-full py-4 px-5 pl-12 rounded-full bg-white border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" variants={containerVariants} initial="hidden" animate="visible">
          {filteredCategories.map((category, index) => (
            <motion.div
              key={index}
              className="relative"
              variants={itemVariants}
              whileHover="hover"
              onMouseEnter={() => setHoveredCategory(index)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <Link to={category.to} className={`block h-72 sm:h-80 rounded-3xl overflow-hidden relative bg-gradient-to-br ${category.gradientFrom} ${category.gradientTo} shadow-lg`}>
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute w-full h-full bg-white pattern-dots"></div>
                </div>

                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white bg-white/20 p-3 rounded-2xl inline-block backdrop-blur-sm mb-3">
                        <span className="text-4xl" role="img" aria-label={category.name}>{category.icon}</span>
                      </div>
                      <motion.h3 className="text-2xl font-bold text-white mt-2 drop-shadow-sm" initial={{ opacity: 0.9 }} animate={{ opacity: hoveredCategory === index ? 1 : 0.9 }}>
                        {category.name}
                      </motion.h3>
                      <motion.p className="text-white/80 mt-2 text-sm max-w-[80%]" initial={{ opacity: 0.7 }} animate={{ opacity: hoveredCategory === index ? 1 : 0.7 }}>
                        {category.description}
                      </motion.p>
                    </div>
                  </div>

                  <div className="relative w-full">
                    <motion.div
                      className="absolute bottom-0 right-0"
                      animate={{
                        rotate: hoveredCategory === index ? 0 : 12,
                        y: hoveredCategory === index ? -10 : 0,
                        scale: hoveredCategory === index ? 1.05 : 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <img src={category.img} alt={`${category.name} category`} className="h-44 object-contain rounded-lg shadow-lg transform" />
                    </motion.div>
                  </div>

                  <div className="absolute bottom-6 left-6 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
                    {Math.floor(Math.random() * 500) + 100} podcasts
                  </div>
                </div>

                <motion.div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/30" initial={{ opacity: 0 }} animate={{ opacity: hoveredCategory === index ? 1 : 0 }} transition={{ duration: 0.5 }} />

                <motion.div
                  className="absolute bottom-6 right-6 bg-white/20 backdrop-blur-sm p-2 rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: hoveredCategory === index ? 1 : 0, scale: hoveredCategory === index ? 1 : 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {filteredCategories.length === 0 && (
          <motion.div className="text-center py-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No categories found</h3>
            <p className="text-gray-500">Try searching with different keywords or clear your search</p>
            <button className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors" onClick={() => setSearchTerm("")}>
              Clear Search
            </button>
          </motion.div>
        )}

        <motion.div className="mt-16 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6 }}>
          <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
          <button
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            onClick={handleViewAll}
          >
            View All Categories
          </button>
        </motion.div>
      </div>

      <style jsx>{`
        .pattern-dots {
          background-image: radial-gradient(currentColor 1px, transparent 1px);
          background-size: 8px 8px;
        }
      `}</style>
    </div>
  );
};

export default Categories;
