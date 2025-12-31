import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useSelector } from "react-redux";
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
    Trash2,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    Layers
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
    const [expandedPodcasts, setExpandedPodcasts] = useState({});

    const togglePodcastExpansion = (podcastId) => {
        setExpandedPodcasts(prev => ({
            ...prev,
            [podcastId]: !prev[podcastId]
        }));
    };

    const userId = useSelector((state) => state.auth.userId);
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

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

    const getAudioUrl = (audioUrl) => {
        if (!audioUrl) return null;

        if (audioUrl.startsWith('http')) return audioUrl;

        const cleanUrl = audioUrl.startsWith('/') ? audioUrl : `/${audioUrl}`;
        return `http://localhost:8800${cleanUrl}`;
    };

    const handlePlayPause = (episode) => {
        const audioUrl = episode.audioFile || episode.audioUrl || episode.audio;

        if (!audioUrl) {
            console.log("No audio URL found for episode:", episode);
            alert("Audio file not available");
            return;
        }

        console.log("Raw audio URL:", audioUrl);

        if (playingEpisode === episode._id) {
            if (currentAudio) {
                currentAudio.pause();
                setPlayingEpisode(null);
            }
        } else {
            if (currentAudio) {
                currentAudio.pause();
            }

            const processedAudioUrl = getAudioUrl(audioUrl);
            console.log("Processed audio URL:", processedAudioUrl);

            const audio = new Audio(processedAudioUrl);

            audio.addEventListener('loadstart', () => {
                console.log("Audio loading started");
            });

            audio.addEventListener('canplaythrough', () => {
                console.log("Audio can play through");
            });

            audio.addEventListener('error', (e) => {
                console.error("Audio failed to load:", e);
                console.error("Audio error details:", {
                    error: e.target.error,
                    networkState: e.target.networkState,
                    readyState: e.target.readyState,
                    src: e.target.src
                });
                alert(`Failed to load audio: ${e.target.error?.message || 'Unknown error'}`);
                setPlayingEpisode(null);
            });

            audio.addEventListener('ended', () => {
                setPlayingEpisode(null);
            });

            setCurrentAudio(audio);
            setPlayingEpisode(episode._id);

            fetch(processedAudioUrl, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        console.log("Audio URL is accessible");

                        if (isLoggedIn && episode.podcastId) {
                            const podcastId = typeof episode.podcastId === 'object' ? episode.podcastId._id : episode.podcastId;

                            axios.post(`http://localhost:8800/api/v1/save-watched`, {
                                podcastId: podcastId,
                                progress: 0,
                                duration: episode.duration || 0
                            }, {
                                withCredentials: true
                            })
                                .then(() => {
                                    console.log("Episode saved to watch history");
                                })
                                .catch(err => {
                                    console.error("Failed to save watch history:", err);
                                });
                        }

                        return audio.play();
                    } else {
                        throw new Error(`Audio file not found (${response.status})`);
                    }
                })
                .catch(error => {
                    console.error("Audio play failed:", error);
                    alert(`Failed to play audio: ${error.message}`);
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


    const groupedEpisodes = React.useMemo(() => {
        const groups = {};

        const filtered = episodes.filter(episode => {
            const matchesSearch =
                (episode.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (episode.description || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPodcast =
                selectedPodcast === "all" ||
                (episode.podcastId && (typeof episode.podcastId === 'object' ? episode.podcastId._id : episode.podcastId) === selectedPodcast);
            return matchesSearch && matchesPodcast;
        });

        filtered.forEach(episode => {
            const podId = (typeof episode.podcastId === 'object' ? episode.podcastId?._id : episode.podcastId);
            const groupId = podId || `standalone-${episode._id}`;

            if (!groups[groupId]) {
                const podTitle = (typeof episode.podcastId === 'object' ? episode.podcastId?.title : null) ||
                    episode.podcastTitle ||
                    (podId ? 'Untitled Series' : episode.title);

                groups[groupId] = {
                    podcastId: podId,
                    podcastTitle: podTitle,
                    episodes: [],
                    representativeEpisode: episode,
                    latestDate: new Date(episode.createdAt)
                };
            }
            groups[groupId].episodes.push(episode);

            const episodeDate = new Date(episode.createdAt);
            if (episodeDate > groups[groupId].latestDate) {
                groups[groupId].latestDate = episodeDate;
            }
        });

        const result = Object.values(groups);

        result.forEach(group => {
            group.episodes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            
            group.representativeEpisode = group.episodes[0];
        });

        result.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return b.latestDate - a.latestDate;
                case "oldest":
                    return a.latestDate - b.latestDate;
                case "title":
                    return a.podcastTitle.localeCompare(b.podcastTitle);
                default:
                    return b.latestDate - a.latestDate;
            }
        });

        const seriesOnly = result.filter(group => group.episodes.length > 1);

        return seriesOnly;
    }, [episodes, searchTerm, selectedPodcast, sortBy]);

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
            <div className="bg-gradient-to-r from-indigo-800 via-purple-800 to-indigo-900 text-white pt-16 pb-32 px-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute left-1/4 -bottom-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
                    <div className="absolute right-1/3 top-1/3 w-36 h-36 bg-purple-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "2s" }}></div>

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
                        <h1 className="text-5xl font-extrabold tracking-tight">My Series</h1>
                    </div>

                    <p className="max-w-2xl text-white/90 mb-8 text-lg font-light leading-relaxed">
                        Manage, organize, and listen to your podcast series. Keep track of your content
                        and engage with your audience through quality audio experiences.
                    </p>

                    <div className="relative max-w-2xl">
                        <input
                            type="text"
                            placeholder="Search your podcast series by title or description..."
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
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
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
                                                    className={`block w-full text-left px-4 py-3 text-sm transition-colors ${sortBy === option.value
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
                {groupedEpisodes.length > 0 && (
                    <div className="flex justify-between items-center mb-6 px-1">
                        <p className="text-gray-600">
                            {groupedEpisodes.reduce((acc, g) => acc + g.episodes.length, 0)} {groupedEpisodes.reduce((acc, g) => acc + g.episodes.length, 0) === 1 ? 'Podcast' : 'Podcasts'} found
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
                {groupedEpisodes.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-indigo-50 rounded-xl p-8 inline-block">
                            <Volume2 className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Podcasts Found</h3>
                            <p className="text-gray-600 mb-4">
                                {searchTerm || selectedPodcast !== "all"
                                    ? "Try adjusting your search or filter criteria"
                                    : episodes.length === 0
                                        ? "You haven't created any podcasts yet. Create your first one to get started!"
                                        : "No podcasts match your current filters"}
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedPodcast("all");
                                    fetchEpisodes();
                                }}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {groupedEpisodes.map((group, groupIndex) => {
                            const isExpanded = expandedPodcasts[group.podcastId];
                            const mainEpisode = group.representativeEpisode;
                            const hasMultiple = group.episodes.length > 1;

                            return (
                                <div
                                    key={group.podcastId}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md"
                                >
                                    <div
                                        className={`p-6 flex flex-col md:flex-row items-center gap-6 cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50/50 border-b border-gray-100' : ''}`}
                                        onClick={() => hasMultiple && togglePodcastExpansion(group.podcastId)}
                                    >
                                        <div className="relative flex-shrink-0">
                                            {mainEpisode.episodeImage ? (
                                                <img
                                                    src={getImageUrl(mainEpisode.episodeImage)}
                                                    alt={group.podcastTitle}
                                                    className="w-24 h-24 rounded-2xl object-cover shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                                    <Music className="w-10 h-10 text-white opacity-80" />
                                                </div>
                                            )}
                                            {hasMultiple && (
                                                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                                                    <Layers className="w-3 h-3" />
                                                    {group.episodes.length}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                                <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${hasMultiple ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 bg-slate-100'}`}>
                                                    {hasMultiple ? 'Podcast Series' : 'Podcast'}
                                                </span>
                                                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Updated {formatDate(mainEpisode.createdAt)}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">
                                                {group.podcastTitle}
                                            </h3>
                                            <p className="text-gray-500 text-sm line-clamp-2 max-w-2xl">
                                                {mainEpisode.description || "Collection of episodes exploring this topic."}
                                            </p>
                                        </div>

                                        {/* Actions & Toggle */}
                                        <div className="flex items-center gap-4">
                                            {!isExpanded && !hasMultiple && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePlayPause(mainEpisode);
                                                    }}
                                                    className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                                                >
                                                    {playingEpisode === mainEpisode._id ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                                </button>
                                            )}

                                            {hasMultiple && (
                                                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-xl">
                                                    {isExpanded ? "Collapse" : `View ${group.episodes.length} Episodes`}
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Episode List */}
                                    {isExpanded && (
                                        <div className="bg-white p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {group.episodes.map((episode, idx) => (
                                                <div
                                                    key={episode._id}
                                                    className="flex items-center justify-between p-4 rounded-xl border border-gray-50 bg-slate-50/30 hover:bg-slate-50 hover:border-indigo-100 transition-all group"
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600 font-bold border border-gray-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                                                {episode.title}
                                                                {hasMultiple && idx === 0 && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Episode 1</span>}
                                                                {hasMultiple && idx > 0 && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">Episode {idx + 1}</span>}
                                                            </h4>
                                                            <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(episode.duration)}</span>
                                                                <span className="flex items-center gap-1 uppercase tracking-tighter">{formatDate(episode.createdAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handlePlayPause(episode)}
                                                            className={`p-3 rounded-xl transition-all ${playingEpisode === episode._id ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-white text-indigo-600 shadow-sm border border-gray-100 hover:bg-indigo-600 hover:text-white'}`}
                                                        >
                                                            {playingEpisode === episode._id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                                        </button>

                                                        <div className="relative">
                                                            <button
                                                                onClick={() => toggleOptionsMenu(episode._id)}
                                                                className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
                                                            >
                                                                <MoreVertical className="w-5 h-5" />
                                                            </button>
                                                            {showOptionsMenu === episode._id && (
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2">
                                                                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 flex items-center gap-2">
                                                                        <Download className="w-4 h-4" /> Download
                                                                    </button>
                                                                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 flex items-center gap-2 text-rose-600">
                                                                        <Trash2 className="w-4 h-4" /> Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {!hasMultiple && isExpanded && (
                                        <div className="p-4 text-center text-gray-400 text-sm italic">
                                            No additional episodes found.
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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