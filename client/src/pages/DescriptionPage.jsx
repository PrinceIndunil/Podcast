import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const DescriptionPage = () =>{
    const {id} = useParams();
    const [Podcasts, setPodcasts] = useState([]); // Initialize as an empty array

    useEffect(() => {
        const fetchPodcasts = async () => {  // Renamed for clarity
            try {
                const res = await axios.get(`http://localhost:8800/api/v1/get-podcast/${id}`, 
                {withCredentials:true}
            );
                setPodcasts(res.data.data || []); // Fallback in case `data` is undefined
            } catch (error) {
                console.error("Error fetching podcasts:", error);
            }
        };
        fetchPodcasts();
    }, []);
    return(
        <div className="px-4 lg:px-12 py-4 h-auto flex flex-col md:flex-row items-start justify-between gap-4">
            {Podcasts && <><div className="w-2/6 flex items-center justify-center md:justify-start md:items-start">
            <img src={`http://localhost:8800/${Podcasts.frontImage}`} 
            alt="/" 
            className="rounded size-[40vh] object-cover"/></div>
            <div className="w-4/6">
                <div className="text-4xl font-semibold">
                    {Podcasts.title}
                </div>
                <h1 className="mt-4">{Podcasts.description}</h1>
                <div className="mt-2 w-[20vh] bg-orange-100 text-orange-700 border border-orange-700 rounded-full px-4 py-2 text-center">
                    {Podcasts.category?.categoryName}
                </div>
            </div>
            </>}
        </div>
        
    )
}
export default DescriptionPage;