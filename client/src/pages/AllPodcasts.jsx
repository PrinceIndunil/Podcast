import React, { useEffect, useState } from "react";
import axios from "axios";
import PodcastCard from "../components/PodcastCard/PodcastCard";

const AllPodcasts = () => {
    const [Podcasts, setPodcasts] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get("http://13.60.226.71:8800/api/v1/get-podcasts");
                setPodcasts(res.data.data);
            } catch (error) {
                console.error("Error fetching podcasts:", error);
            }
        };
        fetch();
    }, []);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // Filter podcasts only if `title` exists
    const filteredPodcasts = Podcasts.filter((podcast) =>
        podcast.title && podcast.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="w-full px-4 lg:px-12 py-4">
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search Podcasts by Title"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-1/2 px-4 py-2 mb-4 border rounded-md mx-auto block"
                />
                {/* Podcast Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {filteredPodcasts.length > 0 ? (
                        filteredPodcasts.map((items, i) => (
                            <div key={i}>
                                <PodcastCard items={items} />
                            </div>
                        ))
                    ) : (
                        <p>No podcasts found</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllPodcasts;
