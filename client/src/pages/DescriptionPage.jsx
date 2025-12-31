import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { playerActions } from "../store/player";
import { ThumbsUp, ThumbsDown, Share2, Zap, FileText, Info, Music, MessageSquare, Send, LogOut } from "lucide-react";

const DescriptionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [podcast, setPodcast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); 
  const [isGeneratingEpisode, setIsGeneratingEpisode] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userQuery, setUserQuery] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userId = useSelector((state) => state.auth.userId);

  useEffect(() => {
    const fetchPodcast = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8800/api/v1/get-podcast/${id}`,
          { withCredentials: true }
        );
        setPodcast(res.data.data || null);

        if (isLoggedIn) {
          checkIfPodcastIsSaved(id);
        }
      } catch (error) {
        console.error("Error fetching podcast:", error);
      }
      setIsLoading(false);
    };
    fetchPodcast();
  }, [id, isLoggedIn]);

  const checkIfPodcastIsSaved = async (podcastId) => {
    try {
      const res = await axios.get(
        `http://localhost:8800/api/v1/check-saved-podcast/${podcastId}`,
        { withCredentials: true }
      );
      setIsSaved(res.data.isSaved || false);
    } catch (error) {
      console.error("Error checking saved status:", error);
      setIsSaved(false);
    }
  };

  const getFullUrl = (path) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `http://localhost:8800/${path}`;
  };

  const handlePlay = async (e) => {
    if (e) e.preventDefault();

    if (!isLoggedIn) {
      toast.error("Please login to play podcasts");
      navigate("/login");
      return;
    }

    if (!podcast) {
      toast.error("Podcast data not available");
      return;
    }

    dispatch(playerActions.setDiv());
    dispatch(playerActions.changeImage(getFullUrl(podcast.frontImage)));
    dispatch(playerActions.changeSong(getFullUrl(podcast.audioFile)));

    try {
      await axios.post("http://localhost:8800/api/v1/save-watched", {
        podcastId: podcast._id,
      }, { withCredentials: true });
    } catch (error) {
      console.error("Error saving watched podcast:", error);
    }
  };

  const handlePlayEpisode = async (episode, index) => {
    if (!isLoggedIn) {
      toast.error("Please login to play episodes");
      navigate("/login");
      return;
    }

    dispatch(playerActions.setDiv());
    dispatch(playerActions.changeImage(getFullUrl(podcast.frontImage)));
    dispatch(playerActions.changeSong(getFullUrl(episode.audioFile)));

    try {
      await axios.post("http://localhost:8800/api/v1/save-watched", {
        podcastId: podcast._id,
        episodeId: episode._id,
      }, { withCredentials: true });
    } catch (error) {
      console.error("Error saving watched episode:", error);
    }
  };

  const handleSaveForLater = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to save podcasts");
      navigate("/login");
      return;
    }

    try {
      if (isSaved) {
        await axios.delete(
          `http://localhost:8800/api/v1/unsave-podcast/${id}`,
          { withCredentials: true }
        );
        setIsSaved(false);
        toast.success("Removed from your library");
      } else {
        await axios.post(
          `http://localhost:8800/api/v1/save-podcast/${id}`,
          {},
          { withCredentials: true }
        );
        setIsSaved(true);
        toast.success("Added to your library");
      }
    } catch (error) {
      console.error("Error saving podcast:", error);

      if (error.response) {
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
      }

      if (error.response && error.response.status === 401) {
        toast.error("Please login to save podcasts");
        navigate("/login");
      } else if (error.response && error.response.status === 404) {
        toast.error("Save endpoint not found. Please contact support.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to like podcasts");
      navigate("/login");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:8800/api/v1/like/${id}`, {}, { withCredentials: true });
      setPodcast({ ...podcast, likes: new Array(res.data.likes).fill(null), dislikes: new Array(res.data.dislikes).fill(null) });
      setIsLiked(res.data.isLiked);
      setIsDisliked(false);
    } catch (error) {
      console.error("Error liking podcast:", error);
    }
  };

  const handleDislike = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to dislike podcasts");
      navigate("/login");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:8800/api/v1/dislike/${id}`, {}, { withCredentials: true });
      setPodcast({ ...podcast, likes: new Array(res.data.likes).fill(null), dislikes: new Array(res.data.dislikes).fill(null) });
      setIsDisliked(res.data.isDisliked);
      setIsLiked(false);
    } catch (error) {
      console.error("Error disliking podcast:", error);
    }
  };

  const [commentText, setCommentText] = useState("");
  const handleComment = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please login to comment");
      navigate("/login");
      return;
    }
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(`http://localhost:8800/api/v1/comment/${id}`, { text: commentText }, { withCredentials: true });
      setPodcast({
        ...podcast,
        comments: [...(podcast.comments || []), res.data.comment]
      });
      setCommentText("");
      toast.success("Comment added!");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  useEffect(() => {
    if (podcast && userId) {
      setIsLiked(podcast.likes?.some(id => id === userId || id?._id === userId));
      setIsDisliked(podcast.dislikes?.some(id => id === userId || id?._id === userId));
    }
  }, [podcast, userId]);

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleGenerateDeepDive = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to generate episodes");
      return;
    }

    setIsGeneratingEpisode(true);
    const toastId = toast.loading("AI is teaching itself deeply... Please wait (~1 min)");

    try {
      const res = await axios.post(
        "http://localhost:8800/api/v1/generate-deep-dive",
        { podcastId: id },
        { withCredentials: true }
      );

      toast.update(toastId, {
        render: "Deep Dive generated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000
      });

      const updatedRes = await axios.get(
        `http://localhost:8800/api/v1/get-podcast/${id}`,
        { withCredentials: true }
      );
      setPodcast(updatedRes.data.data);

    } catch (error) {
      console.error("Error generating deep dive:", error);
      toast.update(toastId, {
        render: error.response?.data?.message || "Failed to generate deep dive",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setIsGeneratingEpisode(false);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/podcast/${id}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success("Link copied to clipboard!");
        setTimeout(() => setShowShareModal(false), 1500);
      })
      .catch(err => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy link");
      });
  };

  const handleChat = async (e) => {
    if (e) e.preventDefault();
    if (!userQuery.trim() || isChatLoading) return;

    const freshQuery = userQuery;
    setUserQuery("");
    setChatMessages(prev => [...prev, { role: "user", text: freshQuery }]);
    setIsChatLoading(true);

    try {
      const history = chatMessages.slice(-5).map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        text: msg.text
      }));

      const res = await axios.post(
        `http://localhost:8800/api/v1/chat/${id}`,
        { query: freshQuery, history },
        { withCredentials: true }
      );

      setChatMessages(prev => [...prev, { role: "model", text: res.data.response }]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error.response?.data?.message || "AI is currently resting. Try again later!");
    } finally {
      setIsChatLoading(false);
    }
  };

  const shareOnSocialMedia = (platform) => {
    const url = `${window.location.origin}/podcast/${id}`;
    const title = podcast ? podcast.title : "Check out this podcast";
    let shareUrl;

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    setTimeout(() => setShowShareModal(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="text-indigo-600 font-medium">Loading podcast...</p>
        </div>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-800">Podcast Not Found</h2>
          <p className="mt-2 text-gray-600">The podcast you're looking for doesn't exist or was removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          <div className="relative h-24 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white opacity-20"></div>
          </div>

          <div className="md:flex relative">
            <div className="md:w-2/5 p-8 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl blur opacity-30 transform -rotate-2"></div>

                <div className="relative shadow-2xl rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105">
                  <img
                    src={podcast.frontImage?.startsWith("http") ? podcast.frontImage : `http://localhost:8800/${podcast.frontImage}`}
                    alt={podcast.title}
                    className="w-64 h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={handlePlay}
                    className="bg-indigo-600 rounded-full p-4 shadow-lg hover:bg-indigo-700 transform hover:scale-110 transition-all duration-200"
                  >
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="md:w-3/5 p-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="inline-block bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full px-4 py-1 text-sm font-medium">
                  {podcast.category?.categoryName || "Uncategorized"}
                </span>
                <span className="inline-block bg-amber-100 text-amber-800 border border-amber-200 rounded-full px-4 py-1 text-sm font-medium">
                  {podcast.duration || "20"} min
                </span>
                {podcast.mood && (
                  <span className="inline-block bg-pink-100 text-pink-800 border border-pink-200 rounded-full px-4 py-1 text-sm font-medium animate-pulse">
                    {podcast.mood} 🎭
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {podcast.title}
              </h1>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>{podcast.author || "Unknown Host"}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span>{podcast.releaseDate || "Recently Released"}</span>
                </div>
              </div>

              <div className="prose prose-indigo max-w-none mb-8">
                <p className="text-gray-700 leading-relaxed">{podcast.description}</p>
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                {isLoggedIn ? (
                  <button
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    onClick={handlePlay}
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Listen Now
                  </button>
                ) : (
                  <button
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    onClick={() => {
                      toast.info("Please login to listen to podcasts");
                      navigate("/login");
                    }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Login to Listen
                  </button>
                )}

                <button
                  className={`${isSaved
                    ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                    : "bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
                    } px-6 py-3 rounded-lg font-medium flex items-center transition-all duration-300 shadow-sm hover:shadow transform hover:-translate-y-0.5`}
                  onClick={handleSaveForLater}
                >
                  <svg
                    className={`w-5 h-5 mr-2 ${isSaved ? "text-indigo-600 fill-current" : "text-gray-600"}`}
                    fill={isSaved ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={isSaved ? 0 : 2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  {isSaved ? "Saved" : "Save for Later"}
                </button>

                <button
                  className={`px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-300 shadow-sm hover:shadow-md ${isLiked ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border border-gray-200"}`}
                  onClick={handleLike}
                >
                  <ThumbsUp className={`w-5 h-5 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  {podcast.likes?.length || 0}
                </button>

                <button
                  className={`px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-300 shadow-sm hover:shadow-md ${isDisliked ? "bg-rose-600 text-white" : "bg-white text-gray-700 border border-gray-200"}`}
                  onClick={handleDislike}
                >
                  <ThumbsDown className={`w-5 h-5 mr-2 ${isDisliked ? "fill-current" : ""}`} />
                  {podcast.dislikes?.length || 0}
                </button>

                <button
                  className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium border border-gray-200 flex items-center transition-all duration-300 shadow-sm hover:shadow-md"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </button>

                {(podcast.title?.startsWith("AI Special:") || podcast.title?.includes("AI")) && (podcast.user === userId || podcast.user?._id === userId) && (
                  <button
                    className="bg-indigo-900 hover:bg-black text-white px-6 py-3 rounded-lg font-medium flex items-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                    onClick={handleGenerateDeepDive}
                    disabled={isGeneratingEpisode}
                  >
                    {isGeneratingEpisode ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                    ) : (
                      <Zap className="w-5 h-5 mr-2" />
                    )}
                    {isGeneratingEpisode ? "AI Thinking..." : "Generate AI Deep Dive"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 px-8 mt-4">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("details")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === "details"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Podcast Info
              </button>

              <button
                onClick={() => setActiveTab("episodes")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === "episodes"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                Episodes ({1 + (podcast.episodes?.length || 0)})
              </button>

              {(podcast.summary || podcast.transcript) && (
                <>
                  <button
                    onClick={() => setActiveTab("ai")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${activeTab === "ai"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI Insights
                  </button>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200 ${activeTab === "chat"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat with AI
                  </button>
                  <button
                    onClick={() => setActiveTab("transcript")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === "transcript"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    Transcript
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Content Sections */}
          <div className="p-8 min-h-[300px]">
            {activeTab === "details" && (
              <div className="bg-gray-50 rounded-xl p-6 animate-fade-in">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-gray-500 font-medium mb-2">Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {(podcast.topics || ["Discussion", "Interview", "Review"]).map((topic, index) => (
                        <span key={index} className="bg-white text-gray-700 px-3 py-1 rounded-lg text-sm border border-gray-200 shadow-sm">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-gray-500 font-medium mb-2">Available On</h3>
                    <div className="flex gap-3">
                      <div className="flex gap-4">
                        <span className="text-gray-400 text-sm italic">Stream on specialized platforms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "episodes" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-200 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{podcast.title} (Intro)</h4>
                      <p className="text-sm text-gray-500">The original AI-generated overview.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handlePlay()}
                    className="p-3 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {podcast.episodes?.map((ep, idx) => (
                  <div key={ep._id || idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-indigo-200 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                        {idx + 2}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{ep.title}</h4>
                        <p className="text-sm text-gray-500">{ep.description || "Extended deep dive content."}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePlayEpisode(ep, idx)}
                      className="p-3 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-600 hover:text-white transition-all duration-300"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}

                {podcast.episodes?.length === 0 && (
                  <div className="text-center py-8 text-gray-500 italic">
                    No additional episodes yet. Only the podcast owner can generate deep dives.
                  </div>
                )}
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-6 animate-fade-in">
                {podcast.summary && (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      AI Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">{podcast.summary}</p>
                  </div>
                )}

                {podcast.highlights && podcast.highlights.length > 0 && (
                  <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Key Highlights</h3>
                    <div className="space-y-3">
                      {podcast.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer">
                          <div className="flex-shrink-0">
                            <span className="bg-indigo-100 text-indigo-700 font-mono text-sm px-2 py-1 rounded group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              {highlight.timestamp}
                            </span>
                          </div>
                          <p className="text-gray-700 group-hover:text-gray-900">{highlight.topic}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "transcript" && (
              <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm animate-fade-in max-h-[600px] overflow-y-auto">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {podcast.transcript || "No transcript available for this podcast."}
                </p>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="bg-slate-50 rounded-2xl border border-indigo-100 overflow-hidden flex flex-col h-[600px] animate-fade-in shadow-inner">
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-indigo-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                      <Zap className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Podcast Genius</h4>
                      <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Grounded in Transcript</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setChatMessages([])}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-2"
                    title="Clear Chat"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {chatMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-12 opacity-40">
                      <MessageSquare className="w-12 h-12 mb-4 text-indigo-300" />
                      <h5 className="font-bold text-slate-900 mb-1">Deep Context Chat</h5>
                      <p className="text-sm">Ask me anything about this episode. I have read the entire transcript!</p>

                      <div className="mt-8 grid grid-cols-1 gap-3 w-full max-w-xs">
                        {[
                          "What are the main takeaways?",
                          "Summarize the final 5 minutes",
                          "Did they mention anything surprising?"
                        ].map((q, i) => (
                          <button
                            key={i}
                            onClick={() => { setUserQuery(q); }}
                            className="text-xs bg-white border border-indigo-100 py-2 px-4 rounded-xl hover:bg-indigo-600 hover:text-white transition-all font-medium text-slate-600"
                          >
                            "{q}"
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                        }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))}

                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleChat} className="p-4 bg-white border-t border-indigo-50">
                  <div className="relative group">
                    <input
                      type="text"
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="Ask about this episode..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-slate-800"
                    />
                    <button
                      type="submit"
                      disabled={!userQuery.trim() || isChatLoading}
                      className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-30 transition-all shadow-lg shadow-indigo-200"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Community Comments Section */}
            <div className="mt-12 border-t border-gray-100 pt-12 animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Community Comments
              </h3>

              <form onSubmit={handleComment} className="mb-10">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts on this episode..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 resize-none h-32"
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
                  >
                    Post Comment
                  </button>
                </div>
              </form>

              <div className="space-y-6">
                {(podcast.comments || []).slice().reverse().map((comment, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                      {comment.username ? comment.username[0].toUpperCase() : "?"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-900">{comment.username}</h4>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}

                {(podcast.comments || []).length === 0 && (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-gray-400 italic">No comments yet. Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Share Podcast</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">Share this podcast with friends:</p>
              <div className="flex justify-center space-x-6 mb-6">
                <button
                  onClick={() => shareOnSocialMedia('facebook')}
                  className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transform hover:scale-110 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </button>
                <button
                  onClick={() => shareOnSocialMedia('twitter')}
                  className="p-3 bg-blue-400 text-white rounded-full hover:bg-blue-500 transform hover:scale-110 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </button>
                <button
                  onClick={() => shareOnSocialMedia('whatsapp')}
                  className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transform hover:scale-110 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.096 3.201 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/podcast/${id}`}
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 pr-24 text-gray-700 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DescriptionPage;