import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Sparkles, Mic, Loader } from "lucide-react";

const GeneratePodcast = () => {
    const [topic, setTopic] = useState("");
    const [category, setCategory] = useState("Technology");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const categories = [
        "Comedy", "Business", "Education", "Hobbies", "Government",
        "Politics", "Health", "Fitness", "Kids", "Technology"
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post("http://localhost:8800/api/v1/generate-podcast", {
                topic,
                category
            }, { withCredentials: true });

            toast.success("AI Podcast Generated Successfully!");
            navigate("/profile");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to generate podcast. Do you have the ElevenLabs Key?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-xl">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-white animate-pulse" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        AI Podcast Generator
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter a topic, and our AI Hosts (Alice & Bob) will record a custom episode for you.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                            <input
                                id="topic"
                                name="topic"
                                type="text"
                                required
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="e.g., The Future of Space Travel"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                id="category"
                                name="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Writing Script & Recording... (Wait ~30s)
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <Mic className="mr-2 h-5 w-5" />
                                    Generate Episode
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GeneratePodcast;
