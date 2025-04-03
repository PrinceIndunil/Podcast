import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const WatchHistory = () => {
    const [watchedPodcasts, setWatchedPodcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = useSelector((state) => state.auth.userId); // Ensure userId is retrieved properly

    useEffect(() => {
        if (!userId) return;
    
        const fetchWatchedPodcasts = async () => {
            try {
                const response = await axios.get(`http://13.60.226.71:8800/api/v1/get-watched?userId=${userId}`);
                console.log("API Response:", response.data); // Debugging API response
                setWatchedPodcasts(response.data.data);
            } catch (err) {
                console.error("Error fetching watched podcasts:", err);
                setError("Failed to fetch watch history.");
            } finally {
                setLoading(false);
            }
        };
    
        fetchWatchedPodcasts();
    }, [userId]);
    

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-xl font-bold px-20 py-10">History</h1>
            <div className="mt-4">
                {watchedPodcasts.length > 0 ? (
                    watchedPodcasts.map((podcast) => (
                        <div key={podcast._id} className="border p-4 rounded flex flex-col shadow-lg mb-4">
                            <img
                                src={podcast.frontImage.startsWith("http") ? podcast.frontImage : `http://13.60.226.71:8800/${podcast.frontImage}`}
                                alt={podcast.title}
                                className="rounded mb-2"
                            />
                            <h2 className="text-xl font-semibold">{podcast.title}</h2>
                            <p className="text-gray-700">{podcast.description}</p>
                        </div>
                    ))
                ) : (
                    <p>No watched podcasts found.</p>
                )}
            </div>
        </div>
    );
};

export default WatchHistory;
