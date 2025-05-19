import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { playerActions } from "../../store/player";
import axios from "axios";
import { FaPlay } from "react-icons/fa";

const PodcastCard = ({ podcast,view,items }) => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userId = useSelector((state) => state.auth.userId);

  const handlePlay = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) return; // Prevent execution if not logged in
    
    dispatch(playerActions.setDiv());
    dispatch(playerActions.changeImage(`http://localhost:8800/${items.frontImage}`));
    dispatch(playerActions.changeSong(`http://localhost:8800/${items.audioFile}`));
    
    try {
      await axios.post("http://localhost:8800/api/v1/save-watched", {
        userId,
        podcastId: items._id,
      });
      console.log("Podcast marked as watched");
    } catch (error) {
      console.error("Error saving watched podcast:", error);
    }
  };

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
      {/* Image with overlay */}
      <div className="relative overflow-hidden">
        <Link to={`/description/${items._id}`}>
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src={`http://localhost:8800/${items.frontImage}`}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
              alt={items.title || "Podcast Image"}
            />
          </div>
          
          {/* Play hover effect */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300">
            <div className="bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-all duration-300">
              <FaPlay className="text-purple-700 text-xl" />
            </div>
          </div>
        </Link>
        
        {/* Category tag */}
        <div className="absolute top-3 right-3">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-opacity-90 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
            {items.category?.categoryName || "Uncategorized"}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <Link to={`/description/${items._id}`} className="flex-grow">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2">
            {items.title || "Untitled"}
          </h3>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {items.description || "No description available"}
          </p>
        </Link>
        
        {/* Action button */}
        {isLoggedIn ? (
          <button
            className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-full py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-purple-800 transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            onClick={handlePlay}
          >
            <FaPlay className="text-sm" />
            <span className="font-medium">Play Now</span>
          </button>
        ) : (
          <Link
            to="/signup"
            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-full py-2.5 px-4 flex items-center justify-center gap-2 hover:from-purple-700 hover:to-purple-900 transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            <span className="font-medium">Sign Up to Play</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default PodcastCard;