import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { playerActions } from "../../store/player";
import axios from "axios";

const PodcastCard = ({ items }) => {
    const dispatch = useDispatch();
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
    const userId = useSelector((state) => state.auth.userId); 

    const handlePlay = async (e) => {
        e.preventDefault();
        
        if (!isLoggedIn) return; // Prevent execution if not logged in

        dispatch(playerActions.setDiv());
        dispatch(playerActions.changeImage(`http://13.60.226.71:8800/${items.frontImage}`));
        dispatch(playerActions.changeSong(`http://13.60.226.71:8800/${items.audioFile}`));

        try {
            await axios.post("http://13.60.226.71:8800/api/v1/save-watched", {
                userId,
                podcastId: items._id,
            });
            console.log("Podcast marked as watched");
        } catch (error) {
            console.error("Error saving watched podcast:", error);
        }
    };

    return (
        <div className="border p-4 rounded flex flex-col shadow-xl hover:shadow-2xl transition-all duration-300">
            <Link to={`/description/${items._id}`}>
                <img
                    src={`http://localhost:8800/${items.frontImage}`}
                    className="rounded size-[42vh] object-cover"
                    alt={items.title || "Podcast Image"}
                />
                <div className="mt-2 text-xl font-bold">
                    {items.title?.slice(0, 20) || "Untitled"}
                </div>
                <div className="mt-2 leading-5 text-slate-500">
                    {items.description?.slice(0, 50) || "No description available"}
                </div>
                <div className="mt-2 bg-orange-100 text-orange-700 border border-orange-700 rounded-full px-4 py-2 text-center">
                    {items.category?.categoryName || "Uncategorized"}
                </div>
            </Link>
            <div className="mt-2">
                {isLoggedIn ? (
                    <button
                        className="bg-purple-700 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-purple-800 transition-all duration-300 w-full"
                        onClick={handlePlay}
                    >
                        Play
                    </button>
                ) : (
                    <Link
                        to="/signup"
                        className="bg-purple-700 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-purple-800 transition-all duration-300 w-full"
                    >
                        Sign Up to Play
                    </Link>
                )}
            </div>
        </div>
    );
};

export default PodcastCard;
