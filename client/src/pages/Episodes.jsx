import React, { useState, useEffect } from "react";
import axios from 'axios';
import { 
    Play, 
    Pause, 
    Calendar, 
    Clock, 
    Volume2, 
    Search, 
    Filter, 
    Eye, 
    Headphones,
    Music,
    MoreVertical,
    Download,
    Share2,
    Edit3,
    Trash2
} from "lucide-react";

const Episode = () => {
    const [episodes, setEpisodes] = useState([]);
    const [podcasts, setPodcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [playingEpisode, setPlayingEpisode] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPodcast, setSelectedPodcast] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [activeView, setActiveView] = useState("grid");
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [showOptionsMenu, setShowOptionsMenu] = useState(null);

    useEffect(() => {
        fetchEpisodes();
        fetchPodcasts();
    }, []);

    const fetchEpisodes = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("Fetching episodes..."); 
            
            const res = await axios.get("http://localhost:8800/api/v1/get-episodes", {
                withCredentials: true
            });
            
            console.log("Episodes response:", res.data);
            
            const episodesData = res.data.data || res.data || [];
            
            // Debug each episode's structure
            episodesData.forEach((episode, index) => {
                console.log(`Episode ${index}:`, {
                    title: episode.title,
                    episodeImage: episode.episodeImage,
                    audioFile: episode.audioFile,
                    audioUrl: episode.audioUrl,
                });
            });
            
            setEpisodes(episodesData);
            
            if (episodesData.length === 0) {
                console.log("No episodes found");
            }
        } catch (error) {
            console.error("Error fetching episodes:", error);
            setError(error.message);
            setEpisodes([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPodcasts = async () => {
        try {
            console.log("Fetching podcasts...");
            
            const res = await axios.get("http://localhost:8800/api/v1/get-user-podcasts", {
                withCredentials: true
            });
            
            console.log("Podcasts response:", res.data);
            
            const podcastsData = res.data.data || res.data || [];
            setPodcasts(podcastsData);
        } catch (error) {
            console.error("Error fetching podcasts:", error);
            setPodcasts([]);
        }
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;

        if (imageUrl.startsWith('http')) return imageUrl;

        return `http://localhost:8800${imageUrl}`;
    };

    const handlePlayPause = (episode) => {
        const audioUrl = episode.audioFile || episode.audioUrl || episode.audio;
        
        if (!audioUrl) {
            console.log("No audio URL found for episode:", episode);
            alert("Audio file not available");
            return;
        }
        
        console.log("Audio URL:", audioUrl);
        
        if (playingEpisode === episode._id) {
            if (currentAudio) {
                currentAudio.pause();
                setPlayingEpisode(null);
            }
        } else {
            if (currentAudio) {
                currentAudio.pause();
            }
            
            // Create and play new audio
            const audio = new Audio(getImageUrl(audioUrl));
            audio.addEventListener('loadstart', () => {
                console.log("Audio loading started");
            });
            audio.addEventListener('error', (e) => {
                console.error("Audio failed to load:", e);
                alert("Failed to load audio");
                setPlayingEpisode(null);
            });
            audio.addEventListener('ended', () => {
                setPlayingEpisode(null);
            });
            
            setCurrentAudio(audio);
            setPlayingEpisode(episode._id);
            
            audio.play().catch(error => {
                console.error("Audio play failed:", error);
                alert("Failed to play audio");
                setPlayingEpisode(null);
            });
        }
    };

    const sortOptions = [
        { value: "newest", label: "Newest First" },
        { value: "oldest", label: "Oldest First" },
        { value: "title", label: "Title A-Z" },
        { value: "episode", label: "Episode Number" },
        { value: "duration", label: "Duration" }
    ];

    // Filter and sort episodes
    const filteredAndSortedEpisodes = episodes
        .filter(episode => {
            const matchesSearch =
                (episode.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (episode.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPodcast =
                selectedPodcast === "all" || (episode.podcastId && episode.podcastId._id === selectedPodcast);
            return matchesSearch && matchesPodcast;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case "oldest":
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case "title":
                    return (a.title || '').localeCompare(b.title || '');
                case "episode":
                    return (a.episodeNumber || 0) - (b.episodeNumber || 0);
                case "duration":
                    return (b.duration || 0) - (a.duration || 0);
                default:
                    return 0;
            }
        });

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown date";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const formatDuration = (minutes) => {
        if (!minutes) return "Unknown";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const toggleSortDropdown = () => {
        setShowSortDropdown(!showSortDropdown);
    };

    const handleSortSelect = (value) => {
        setSortBy(value);
        setShowSortDropdown(false);
    };

    const toggleOptionsMenu = (episodeId) => {
        setShowOptionsMenu(showOptionsMenu === episodeId ? null : episodeId);
    };

    const renderSkeletons = () => {
        return Array(6)
            .fill(0)
            .map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm border p-6 animate-pulse"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-gray-200 h-5 w-12 rounded"></div>
                                <div className="bg-gray-200 h-4 w-24 rounded"></div>
                            </div>
                            <div className="bg-gray-200 h-6 w-3/4 rounded mb-2"></div>
                            <div className="bg-gray-200 h-4 w-full rounded mb-1"></div>
                            <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
                        </div>
                        <div className="ml-4 bg-gray-200 w-16 h-16 rounded-lg"></div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gray-200 h-4 w-20 rounded"></div>
                            <div className="bg-gray-200 h-4 w-16 rounded"></div>
                        </div>
                    </div>
                    <div className="bg-gray-200 h-10 rounded-lg"></div>
                </div>
            ));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-50 via-slate-50 to-indigo-50 pb-16">
                {/* Hero Header */}
                <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-900 text-white pt-16 pb-32 px-4 relative overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute left-1/4 -bottom-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
                    </div>
                    
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="bg-white/20 p-4 rounded-full backdrop-blur-md shadow-xl">
                                <Eye className="h-6 w-6" />
                            </div>
                            <h1 className="text-5xl font-extrabold tracking-tight">My Episodes</h1>
                        </div>
                        <p className="max-w-2xl text-white/90 text-lg font-light leading-relaxed">
                            Loading your episodes...
                        </p>
                    </div>
                </div>

                {/* Loading Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Array(3).fill(0).map((_, i) => (
                                <div key={i} className="bg-gray-200 h-10 rounded-lg animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {renderSkeletons()}
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-purple-50 via-slate-50 to-indigo-50 pb-16 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 rounded-xl p-8 inline-block">
                        <Volume2 className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Episodes</h3>
                        <p className="text-gray-600 mb-4">
                            {error}
                        </p>
                        <button 
                            onClick={() => {
                                setError(null);
                                fetchEpisodes();
                            }}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 via-slate-50 to-indigo-50 pb-16">
            {/* Hero Header Section with Enhanced Visuals */}
            <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-900 text-white pt-16 pb-32 px-4 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute left-1/4 -bottom-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
                    <div className="absolute right-1/3 top-1/3 w-36 h-36 bg-purple-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }}></div>
                    
                    {/* Audio Wave Animation */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20">
                        <div className="flex items-end justify-center h-full gap-1">
                            {Array(30).fill(0).map((_, i) => (
                                <div 
                                    key={i} 
                                    className="bg-white w-2 rounded-t-full animate-pulse"
                                    style={{
                                        height: `${Math.sin(i * 0.5) * 30 + 50}%`,
                                        animationDelay: `${i * 0.05}s`
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-white/20 p-4 rounded-full backdrop-blur-md shadow-xl">
                            <Eye className="h-6 w-6" />
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight">My Episodes</h1>
                    </div>
                    
                    <p className="max-w-2xl text-white/90 mb-8 text-lg font-light leading-relaxed">
                        Manage, organize, and listen to your podcast episodes. Keep track of your content 
                        and engage with your audience through quality audio experiences.
                    </p>

                    <div className="relative max-w-2xl">
                        <input
                            type="text"
                            placeholder="Search your episodes by title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 
                                     text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/40
                                     shadow-2xl transition-all duration-300"
                        />
                        <Search className="absolute left-4 top-4 h-5 w-5 text-white/80" />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors duration-200"
                            >
                                <span className="text-xl font-bold">×</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
                {/* Enhanced Filters and Controls */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
                        {/* Filter Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                            {/* Podcast Filter */}
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                                    value={selectedPodcast}
                                    onChange={(e) => setSelectedPodcast(e.target.value)}
                                >
                                    <option value="all">All Podcasts</option>
                                    {podcasts.map((podcast) => (
                                        <option key={podcast._id} value={podcast._id}>
                                            {podcast.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={toggleSortDropdown}
                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-left flex items-center justify-between
                                             hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <span className="text-gray-700">Sort: {sortOptions.find(option => option.value === sortBy)?.label}</span>
                                    <svg
                                        className={`h-4 w-4 transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {showSortDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50 divide-y divide-gray-100">
                                        <div className="py-1">
                                            {sortOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    className={`block w-full text-left px-4 py-3 text-sm transition-colors ${
                                                        sortBy === option.value
                                                            ? "bg-indigo-50 text-indigo-700 font-medium"
                                                            : "text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                    onClick={() => handleSortSelect(option.value)}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
                                <button 
                                    onClick={() => setActiveView("grid")}
                                    className={`p-2 rounded transition-all ${activeView === "grid" ? "bg-white shadow text-indigo-600" : "hover:bg-gray-200 text-gray-600"}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => setActiveView("list")}
                                    className={`p-2 rounded transition-all ${activeView === "list" ? "bg-white shadow text-indigo-600" : "hover:bg-gray-200 text-gray-600"}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                {filteredAndSortedEpisodes.length > 0 && (
                    <div className="flex justify-between items-center mb-6 px-1">
                        <p className="text-gray-600">
                            {filteredAndSortedEpisodes.length} episode{filteredAndSortedEpisodes.length !== 1 ? 's' : ''} found
                            {searchTerm && ` for "${searchTerm}"`}
                        </p>
                        
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="text-indigo-600 text-sm hover:text-indigo-800 flex items-center gap-1"
                            >
                                Clear search
                                <span className="text-xs bg-indigo-100 rounded-full h-5 w-5 inline-flex items-center justify-center">×</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Episodes Content */}
                {filteredAndSortedEpisodes.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-indigo-50 rounded-xl p-8 inline-block">
                            <Volume2 className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Episodes Found</h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm || selectedPodcast !== "all"
                                    ? "Try adjusting your search or filter criteria"
                                    : episodes.length === 0 
                                        ? "You haven't created any episodes yet. Create your first episode to get started!"
                                        : "No episodes match your current filters"}
                            </p>
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm("")} 
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors mr-2"
                                >
                                    Clear Search
                                </button>
                            )}
                            <button 
                                onClick={() => {
                                    fetchEpisodes();
                                    fetchPodcasts();
                                }} 
                                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                ) : activeView === "grid" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredAndSortedEpisodes.map((episode, index) => (
                            <div
                                key={episode._id}
                                className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    animationFillMode: "backwards",
                                    animation: "fadeIn 0.5s ease-out",
                                }}
                            >
                                <div className="p-6">
                                    {/* Episode Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {episode.episodeNumber && (
                                                    <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                                                        EP {episode.episodeNumber}
                                                    </span>
                                                )}
                                                <span className="text-sm text-gray-500 font-medium">
                                                    {episode.podcastId?.title || "Unknown Podcast"}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {episode.title || "Untitled Episode"}
                                            </h3>
                                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                                {episode.description || "No description available"}
                                            </p>
                                        </div>

                                        {/* Episode Image & Options */}
                                        <div className="ml-4 flex-shrink-0 relative">
                                            {episode.episodeImage ? (
                                                <img
                                                    src={getImageUrl(episode.episodeImage)}
                                                    alt={episode.title}
                                                    className="w-20 h-20 rounded-xl object-cover shadow-md"
                                                    onError={(e) => {
                                                        console.log("Image failed to load:", episode.episodeImage);
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-md" style={{display: episode.episodeImage ? 'none' : 'flex'}}>
                                                <Music className="w-8 h-8 text-white" />
                                            </div>
                                            <div className="absolute -top-2 -right-2">
                                                <button
                                                    onClick={() => toggleOptionsMenu(episode._id)}
                                                    className="bg-white rounded-full p-1.5 shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                                                >
                                                    <MoreVertical className="w-4 h-4 text-gray-600" />
                                                </button>
                                                
                                                {showOptionsMenu === episode._id && (
                                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                                                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                            <Edit3 className="w-4 h-4" />
                                                            Edit
                                                        </button>
                                                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                            <Download className="w-4 h-4" />
                                                            Download
                                                        </button>
                                                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                            <Share2 className="w-4 h-4" />
                                                            Share
                                                        </button>
                                                        <hr className="my-1" />
                                                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Episode Meta */}
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {formatDate(episode.createdAt)}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1" />
                                                {formatDuration(episode.duration)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Play Button */}
                                    <button
                                        onClick={() => handlePlayPause(episode)}
                                        className="flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                                    >
                                        {playingEpisode === episode._id ? (
                                            <>
                                                <Pause className="w-5 h-5 mr-2" />
                                                Pause Episode
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-5 h-5 mr-2" />
                                                Play Episode
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-4">
                        {filteredAndSortedEpisodes.map((episode, index) => (
                            <div
                                key={episode._id}
                                className="bg-white rounded-xl shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-lg"
                                style={{
                                    animationDelay: `${index * 0.05}s`,
                                    animationFillMode: "backwards",
                                    animation: "fadeIn 0.5s ease-out",
                                }}
                            >
                                <div className="flex flex-col sm:flex-row">
                                    <div className="sm:w-48 w-full h-48 sm:h-auto overflow-hidden">
                                        {episode.episodeImage ? (
                                            <img src={episode.episodeImage} alt={episode.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="bg-gradient-to-r from-indigo-400 to-purple-500 w-full h-full flex items-center justify-center">
                                                <Headphones className="h-16 w-16 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {episode.episodeNumber && (
                                                        <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
                                                            EP {episode.episodeNumber}
                                                        </span>
                                                    )}
                                                    <span className="text-sm text-gray-500 font-medium">
                                                        {episode.podcastId?.title || "Unknown Podcast"}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-xl mb-2 text-gray-900 line-clamp-2">{episode.title}</h3>
                                                <p className="text-gray-600 line-clamp-2 mb-4">{episode.description}</p>
                                            </div>
                                            <div className="ml-4 relative">
                                                <button
                                                    onClick={() => toggleOptionsMenu(episode._id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical className="w-4 h-4 text-gray-600" />
                                                </button>
                                                
                                                {showOptionsMenu === episode._id && (
                                                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1">
                                                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                            <Edit3 className="w-4 h-4" />
                                                            Edit
                                                        </button>
                                                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                            <Download className="w-4 h-4" />
                                                            Download
                                                        </button>
                                                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                                            <Share2 className="w-4 h-4" />
                                                            Share
                                                        </button>
                                                        <hr className="my-1" />
                                                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {formatDate(episode.createdAt)}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {formatDuration(episode.duration)}
                                                </div>
                                            </div>
                                            
                                            <button
                                                onClick={() => handlePlayPause(episode)}
                                                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                                            >
                                                {playingEpisode === episode._id ? (
                                                    <>
                                                        <Pause className="w-4 h-4" />
                                                        Pause
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-4 h-4" />
                                                        Play
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes soundWave {
                    0%, 100% {
                        height: 10%;
                    }
                    50% {
                        height: 80%;
                    }
                }
            `}</style>
        </div>
    );
};

export default Episode;