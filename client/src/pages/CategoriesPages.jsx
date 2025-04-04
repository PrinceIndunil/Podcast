import React, {useState , useEffect} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PodcastCard from "../components/PodcastCard/PodcastCard";

const CategoriesPage = () =>{
    const {cat} = useParams();
    const [Podcasts, setPodcasts] = useState([]); // Initialize as an empty array
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchPodcasts = async () => {  // Renamed for clarity
            try {
                const res = await axios.get(`http://13.60.226.71:8800/api/v1//category/${cat}`, 
                {withCredentials:true}
            );
                setPodcasts(res.data.data || []); // Fallback in case `data` is undefined
            } catch (error) {
                console.error("Error fetching podcasts:", error);
            }
        };
        fetchPodcasts();
    }, []);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

     // Filter podcasts only if `title` exists
     const filteredPodcasts = Podcasts.filter((podcast) =>
        podcast.title && podcast.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return (
        <div className="px-4 py-4 lg:px-12">
            <h1 className="text-xl font-semibold">{cat}</h1>
             {/* Search Bar */}
             <input
                    type="text"
                    placeholder="Search Podcasts by Title"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-1/2 px-4 py-2 mb-4 border rounded-md mx-auto block"
                />
            <div className="w-full px-4 lg:px-12 py-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredPodcasts && filteredPodcasts.map((items, i) =>
                <div key={i}>
                    <PodcastCard items={items}/>{""}
                </div>
            )}
                
            </div>
            {filteredPodcasts && filteredPodcasts.length === 0 && (
                <div className="text-3xl font-bold h-screen text-zinc-700 flex items-center justify-center">
                    {" "}
                No Podcasts Right Now{" "}
                </div>
                )}
        </div>
    );
};

export default CategoriesPage;