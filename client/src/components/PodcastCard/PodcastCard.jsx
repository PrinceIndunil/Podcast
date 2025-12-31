import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { playerActions } from "../../store/player";
import axios from "axios";
import { FaPlay } from "react-icons/fa";
import { Mic } from "lucide-react";

const PodcastCard = ({ podcast, viewMode = "grid", items }) => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const handlePlay = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return;

    const getFullUrl = (path) => {
      if (!path) return "";
      return path.startsWith("http") ? path : `http://localhost:8800/${path}`;
    };

    dispatch(playerActions.setDiv());
    dispatch(playerActions.changeImage(getFullUrl(items.frontImage)));
    dispatch(playerActions.changeSong(getFullUrl(items.audioFile)));

    try {
      await axios.post("http://localhost:8800/api/v1/save-watched", {
        podcastId: items._id,
      }, {
        withCredentials: true
      });
    } catch (error) {
      console.error("Error saving watched podcast:", error);
    }
  };

  const isList = viewMode === "list";

  return (
    <div className={`group relative bg-white transition-all duration-500 rounded-[2rem] 
      ${isList ? "flex flex-row gap-8 p-4 h-48" : "flex flex-col h-full shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.1)] hover:-translate-y-2"} 
      overflow-hidden border border-slate-100 hover:border-indigo-100`}>

      {/* Image Container */}
      <div className={`relative overflow-hidden shrink-0 ${isList ? "w-64 h-full rounded-2xl" : "aspect-[16/10]"}`}>
        <Link to={`/description/${items._id}`} aria-label={`View details for ${items.title}`}>
          <img
            src={items.frontImage?.startsWith("http") ? items.frontImage : `http://localhost:8800/${items.frontImage}`}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full shadow-2xl text-indigo-600">
              <FaPlay className="text-xl ml-1" />
            </div>
          </div>
        </Link>

        {/* Floating Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
            {items.category?.categoryName || "AI Original"}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex flex-col flex-grow ${isList ? "py-2 pr-4 justify-between" : "p-6"}`}>
        <div>
          <Link to={`/description/${items._id}`} className="block group/title">
            <h3 className="text-xl font-black text-slate-800 line-clamp-1 mb-2 group-hover/title:text-indigo-600 transition-colors tracking-tight">
              {items.title || "Untitled Masterpiece"}
            </h3>
          </Link>
          <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
            {items.description || "Experimental narrative exploring the boundaries of AI-generated audio broadcasting."}
          </p>
        </div>

        <div className={`flex items-center justify-between mt-6 ${isList ? "" : "pt-4 border-t border-slate-50"}`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <Mic className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
              {items.totalEpisodes || 1} Episodes
            </span>
          </div>

          <button
            onClick={handlePlay}
            aria-label={`Play ${items.title}`}
            className="w-12 h-12 rounded-2xl bg-slate-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-600 hover:text-white hover:scale-110 transition-all duration-300 shadow-sm"
          >
            <FaPlay className="text-sm ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PodcastCard;