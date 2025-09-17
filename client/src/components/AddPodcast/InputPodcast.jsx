import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Plus, Mic, Upload, Search } from "lucide-react";

const InputPodcast = () => {
    const [frontImage, setFrontImage] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [mode, setMode] = useState("new"); 
    const [inputs, setInputs] = useState({ title: "", description: "", category: "" });
    const [episodeInputs, setEpisodeInputs] = useState({ 
        title: "", 
        description: "", 
        episodeNumber: "",
        duration: "" 
    });
    const [selectedPodcast, setSelectedPodcast] = useState("");
    const [userPodcasts, setUserPodcasts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserPodcasts = async () => {
            try {
                const res = await axios.get("http://localhost:8800/api/v1/get-user-podcasts", {
                    withCredentials: true
                });
                setUserPodcasts(res.data.data || []);
            } catch (error) {
                console.error("Error fetching user podcasts:", error);
            }
        };

        if (mode === "episode") {
            fetchUserPodcasts();
        }
    }, [mode]);

    // Filter podcasts based on search term
    const filteredPodcasts = userPodcasts.filter(podcast =>
        podcast.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChangeImage = (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        setFrontImage(file);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(false);
    };

    const handleDropImage = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        setFrontImage(file);
    };

    const handleAudioFile = (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        setAudioFile(file);
    };

    const onChangeInputs = (e) => {
        const { name, value } = e.target;
        setInputs({ ...inputs, [name]: value });
    };

    const onChangeEpisodeInputs = (e) => {
        const { name, value } = e.target;
        setEpisodeInputs({ ...episodeInputs, [name]: value });
    };

    const handleSubmitPodcast = async () => {
        if (mode === "new") {
            await createNewPodcast();
        } else {
            await addEpisode();
        }
    };

    const createNewPodcast = async () => {
        const data = new FormData();
        data.append("title", inputs.title);
        data.append("description", inputs.description);
        data.append("category", inputs.category);
        data.append("frontImage", frontImage);
        data.append("audioFile", audioFile);

        setLoading(true);
        try {
            const res = await axios.post("http://localhost:8800/api/v1/add-podcast", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true
            });
            toast.success(res.data.message);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating podcast");
        } finally {
            setLoading(false);
        }
    };

    const addEpisode = async () => {
        if (!selectedPodcast) {
            toast.error("Please select a podcast first");
            return;
        }

        const data = new FormData();
        data.append("podcastId", selectedPodcast);
        data.append("title", episodeInputs.title);
        data.append("description", episodeInputs.description);
        data.append("episodeNumber", episodeInputs.episodeNumber);
        data.append("duration", episodeInputs.duration);
        data.append("audioFile", audioFile);
        if (frontImage) {
            data.append("episodeImage", frontImage);
        }

        setLoading(true);
        try {
            const res = await axios.post("http://localhost:8800/api/v1/add-episode", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true
            });
            toast.success(res.data.message);
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error adding episode");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setInputs({ title: "", description: "", category: "" });
        setEpisodeInputs({ title: "", description: "", episodeNumber: "", duration: "" });
        setFrontImage(null);
        setAudioFile(null);
        setSelectedPodcast("");
        setSearchTerm("");
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        resetForm();
    };

    return (
        <div className="my-4 px-4 lg:px-12">
            <ToastContainer />
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    {mode === "new" ? "Create New Podcast" : "Add Episode"}
                </h1>

                <div className="flex space-x-4 mb-6">
                    <button
                        onClick={() => switchMode("new")}
                        className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                            mode === "new"
                                ? "bg-blue-600 text-white shadow-lg"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Podcast
                    </button>
                    <button
                        onClick={() => switchMode("episode")}
                        className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                            mode === "episode"
                                ? "bg-green-600 text-white shadow-lg"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        <Mic className="w-5 h-5 mr-2" />
                        Add Episode
                    </button>
                </div>
            </div>

            {/* Podcast Selection for Episodes */}
            {mode === "episode" && (
                <div className="mb-8 p-6 bg-gray-50 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Search className="w-5 h-5 mr-2" />
                        Select Podcast
                    </h3>
                    
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search your podcasts..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Podcast Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                        {filteredPodcasts.length > 0 ? (
                            filteredPodcasts.map((podcast) => (
                                <div
                                    key={podcast._id}
                                    onClick={() => setSelectedPodcast(podcast._id)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                                        selectedPodcast === podcast._id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        {podcast.frontImage && (
                                            <img
                                                src={podcast.frontImage}
                                                alt={podcast.title}
                                                className="w-12 h-12 rounded object-cover"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-800 truncate">
                                                {podcast.title}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                                {podcast.category?.categoryName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-500 py-8">
                                {searchTerm ? "No podcasts found matching your search" : "No podcasts found. Create a podcast first!"}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Form */}
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                {/* Image Upload Section */}
                <div className="w-full lg:w-2/6">
                    <h3 className="text-lg font-semibold mb-4">
                        {mode === "new" ? "Podcast Thumbnail" : "Episode Image (Optional)"}
                    </h3>
                    <div
                        className="h-48 w-full lg:h-60 lg:w-60 flex items-center justify-center hover:bg-slate-50 transition-all duration-300 border-dashed border-2 border-gray-400 rounded-lg"
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDropImage}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            id="file"
                            name="frontImage"
                            className="hidden"
                            onChange={handleChangeImage}
                        />
                        {frontImage ? (
                            <div className="relative w-full h-full">
                                <img
                                    src={URL.createObjectURL(frontImage)}
                                    alt="thumbnail"
                                    className="h-full w-full object-cover rounded-lg"
                                />
                                <button
                                    onClick={() => setFrontImage(null)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        ) : (
                            <label
                                htmlFor="file"
                                className={`text-center h-full w-full flex flex-col items-center justify-center ${
                                    dragging ? "bg-blue-50 border-blue-400" : ""
                                } cursor-pointer hover:bg-gray-50 transition-all duration-300 rounded-lg`}
                            >
                                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                <div className="text-gray-600">
                                    <p className="font-medium">Drag and drop</p>
                                    <p className="text-sm">or click to browse</p>
                                </div>
                            </label>
                        )}
                    </div>
                </div>

                {/* Form Section */}
                <div className="w-full lg:w-4/6">
                    {mode === "new" ? (
                        // New Podcast Form
                        <>
                            <div className="mb-6">
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                    Podcast Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="Enter your podcast title"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={inputs.title}
                                    onChange={onChangeInputs}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Podcast Description *
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Describe your podcast"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                    value={inputs.description}
                                    onChange={onChangeInputs}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    id="category"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={inputs.category}
                                    onChange={onChangeInputs}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Comedy">Comedy</option>
                                    <option value="Business">Business</option>
                                    <option value="Education">Education</option>
                                    <option value="Health">Health</option>
                                    <option value="Culture">Culture</option>
                                    <option value="News">News</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Love">Love</option>
                                </select>
                            </div>
                        </>
                    ) : (
                        // Episode Form
                        <>
                            <div className="mb-6">
                                <label htmlFor="episodeTitle" className="block text-sm font-medium text-gray-700 mb-2">
                                    Episode Title *
                                </label>
                                <input
                                    type="text"
                                    id="episodeTitle"
                                    name="title"
                                    placeholder="Enter episode title"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    value={episodeInputs.title}
                                    onChange={onChangeEpisodeInputs}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label htmlFor="episodeDescription" className="block text-sm font-medium text-gray-700 mb-2">
                                    Episode Description *
                                </label>
                                <textarea
                                    id="episodeDescription"
                                    name="description"
                                    placeholder="Describe this episode"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    rows={4}
                                    value={episodeInputs.description}
                                    onChange={onChangeEpisodeInputs}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label htmlFor="episodeNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                        Episode Number
                                    </label>
                                    <input
                                        type="number"
                                        id="episodeNumber"
                                        name="episodeNumber"
                                        placeholder="1"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={episodeInputs.episodeNumber}
                                        onChange={onChangeEpisodeInputs}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        id="duration"
                                        name="duration"
                                        placeholder="45"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        value={episodeInputs.duration}
                                        onChange={onChangeEpisodeInputs}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Audio File Upload */}
                    <div className="mb-8">
                        <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700 mb-2">
                            Audio File *
                        </label>
                        <input
                            type="file"
                            accept=".mp3,.wav,.m4a,.ogg"
                            id="audioFile"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={handleAudioFile}
                            required
                        />
                        {audioFile && (
                            <p className="mt-2 text-sm text-green-600">
                                Selected: {audioFile.name}
                            </p>
                        )}
                    </div>

                    <button
                        className={`w-full py-4 px-8 rounded-lg font-semibold text-white transition-all duration-300 ${
                            mode === "new"
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-green-600 hover:bg-green-700"
                        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={handleSubmitPodcast}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                {mode === "new" ? "Creating Podcast..." : "Adding Episode..."}
                            </div>
                        ) : (
                            mode === "new" ? "Create Podcast" : "Add Episode"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputPodcast;